package main

import (
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"sync/atomic"
	"time"
)

var cg50BatteryFull atomic.Bool

// Preserve the original ADC value until a virtual battery replacement.
// 496 is above the highest threshold documented by this emulator.
// The final full-battery indication still needs checking on the user's OS.
func cg50BatteryReading() uint32 {
	if cg50BatteryFull.Load() {
		return 0x7C00
	}
	return adcBatteryRaw
}

type cg50BatteryRecord struct {
	ExitNS  int64
	Off     bool
	Need    bool
	Waiting bool
	Full    bool
}

func cg50BatteryDue(r cg50BatteryRecord, now time.Time) bool {
	if r.Need {
		return true
	}
	return r.ExitNS > 0 && !r.Off &&
		now.Sub(time.Unix(0, r.ExitNS)) > 15*time.Minute
}

type cg50BatteryRequest struct {
	kind  string
	reply chan error
}

type cg50BatteryGuard struct {
	mu       sync.Mutex
	record   cg50BatteryRecord
	attempt  uint64
	waiting  atomic.Bool
	requests chan cg50BatteryRequest
	path     string
	ticks    uint32
}

func cg50WriteBatteryRecord(path string, r cg50BatteryRecord) error {
	if err := os.MkdirAll(filepath.Dir(path), 0700); err != nil {
		return err
	}
	f, err := os.CreateTemp(filepath.Dir(path), ".cg50-battery-*")
	if err != nil {
		return err
	}
	defer os.Remove(f.Name())
	if err = json.NewEncoder(f).Encode(r); err != nil {
		f.Close()
		return err
	}
	if err = f.Sync(); err != nil {
		f.Close()
		return err
	}
	if err = f.Close(); err != nil {
		return err
	}
	return os.Rename(f.Name(), path)
}

func newCG50BatteryGuard(stateFile string, now time.Time) (*cg50BatteryGuard, error) {
	p := &cg50BatteryGuard{
		path:     stateFile + ".battery.json",
		requests: make(chan cg50BatteryRequest, 16),
	}
	raw, err := os.ReadFile(p.path)
	if err == nil {
		if err = json.Unmarshal(raw, &p.record); err != nil {
			return nil, err
		}
	} else if !os.IsNotExist(err) {
		return nil, err
	}
	if cg50BatteryDue(p.record, now) {
		p.record.Need = true
		p.record.Waiting = true
	}
	// Mark this session open. A completed native-app exit supplies its timestamp.
	p.record.ExitNS = 0
	if err = cg50WriteBatteryRecord(p.path, p.record); err != nil {
		return nil, err
	}
	p.waiting.Store(p.record.Waiting)
	cg50BatteryFull.Store(p.record.Full)
	return p, nil
}

func cg50CalculatorOff(mmio *MMIOBus) bool {
	if mmio == nil || mmio.lcd == nil || mmio.lcd.pfc == nil {
		return false
	}
	return mmio.lcd.reg[7]&0x100 == 0 &&
		mmio.lcd.pfc.regs[0x12E]&0x20 == 0
}

// Called exclusively from the emulator thread.
func (p *cg50BatteryGuard) apply(q cg50BatteryRequest, mmio *MMIOBus) {
	p.mu.Lock()
	defer p.mu.Unlock()
	before := p.record
	switch q.kind {
	case "press":
		if !p.record.Waiting {
			q.reply <- nil
			return
		}
		if p.record.Need {
			p.attempt++
			q.reply <- nil
			return
		}
		// Resume the preserved running calculator; do not inject an extra AC.
		p.record.Waiting = false
	case "replace":
		if !p.record.Need {
			q.reply <- nil
			return
		}
		p.record.Need = false
		p.record.Waiting = true
		p.record.Full = true
	case "quit":
		p.record.ExitNS = time.Now().UnixNano()
		p.record.Off = p.record.Waiting || cg50CalculatorOff(mmio)
	default:
		q.reply <- fmt.Errorf("unknown battery request")
		return
	}
	if err := cg50WriteBatteryRecord(p.path, p.record); err != nil {
		p.record = before
		q.reply <- err
		return
	}
	cg50BatteryFull.Store(p.record.Full)
	p.waiting.Store(p.record.Waiting)
	q.reply <- nil
}

func (p *cg50BatteryGuard) poll(mmio *MMIOBus) {
	p.ticks++
	if !p.waiting.Load() && p.ticks&1 != 0 {
		return
	}
	select {
	case q := <-p.requests:
		p.apply(q, mmio)
	default:
	}
}

func (p *cg50BatteryGuard) park() { time.Sleep(10 * time.Millisecond) }

func (p *cg50BatteryGuard) request(w http.ResponseWriter, r *http.Request, kind string) {
	q := cg50BatteryRequest{kind: kind, reply: make(chan error, 1)}
	select {
	case p.requests <- q:
	default:
		http.Error(w, "battery request busy", http.StatusServiceUnavailable)
		return
	}
	timer := time.NewTimer(3 * time.Second)
	defer timer.Stop()
	select {
	case err := <-q.reply:
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		fmt.Fprint(w, "ok")
	case <-r.Context().Done():
	case <-timer.C:
		http.Error(w, "battery request timed out", http.StatusServiceUnavailable)
	}
}

// An OFF presentation only. The actual saved LCD/RAM remains untouched.
func (p *cg50BatteryGuard) frame(w http.ResponseWriter) {
	img := image.NewRGBA(image.Rect(0, 0, 384, 216))
	fill := func(x0, y0, x1, y1 int, c color.RGBA) {
		draw.Draw(img, image.Rect(x0, y0, x1, y1), &image.Uniform{C: c}, image.Point{}, draw.Src)
	}
	fill(0, 0, 384, 216, color.RGBA{0, 0, 0, 255})
	white := color.RGBA{225, 230, 235, 255}
	fill(11, 3, 17, 6, white)
	fill(8, 6, 20, 26, white)
	fill(10, 8, 18, 24, color.RGBA{0, 0, 0, 255})
	p.mu.Lock()
	full := !p.record.Need && p.record.Full
	p.mu.Unlock()
	if full {
		for y := 9; y < 23; y += 5 {
			fill(11, y, 17, y+3, color.RGBA{95, 100, 255, 255})
		}
	}
	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Cache-Control", "no-store")
	png.Encode(w, img)
}

func (p *cg50BatteryGuard) handler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-store")
		switch r.URL.Path {
		case "/cg50-power/state":
			p.mu.Lock()
			state := struct {
				Need    bool   `json:"need"`
				Waiting bool   `json:"waiting"`
				Attempt uint64 `json:"attempt"`
			}{p.record.Need, p.record.Waiting, p.attempt}
			p.mu.Unlock()
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(state)
			return
		case "/cg50-power/replace", "/cg50-power/quit":
			if r.Method != http.MethodPost {
				http.Error(w, "POST required", http.StatusMethodNotAllowed)
				return
			}
			kind := "replace"
			if r.URL.Path == "/cg50-power/quit" {
				kind = "quit"
			}
			p.request(w, r, kind)
			return
		}
		if p.waiting.Load() {
			switch r.URL.Path {
			case "/frame":
				p.frame(w)
				return
			case "/load":
				http.Error(w, "Turn on the calculator first.", http.StatusConflict)
				return
			case "/key", "/hold":
				key := r.URL.Query().Get("k")
				down := r.URL.Path == "/key" || r.URL.Query().Get("down") == "1"
				isAC := key == "AC" || key == "ON" || key == "ACON" || key == "AC/ON"
				if !isAC {
					coords := resolveKey(key)
					isAC = len(coords) == 1 && coords[0] == [2]uint32{0, 0}
				}
				if down && isAC {
					p.request(w, r, "press")
				} else {
					w.WriteHeader(http.StatusNoContent)
				}
				return
			}
		}
		next.ServeHTTP(w, r)
	})
}

func cg50BatteryNow() time.Time { return time.Now() }
