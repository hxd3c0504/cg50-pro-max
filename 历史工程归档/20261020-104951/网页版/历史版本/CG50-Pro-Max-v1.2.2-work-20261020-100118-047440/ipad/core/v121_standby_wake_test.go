package main

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestV121StandbyWake(t *testing.T) {
	resources := os.Getenv("CG50_PROBE_RESOURCES")
	backup := os.Getenv("CG50_PROBE_BACKUP")
	if resources == "" || backup == "" {
		t.Skip("requires local regression fixtures")
	}
	flash, err := os.ReadFile(filepath.Join(resources, "flash_full.bin"))
	if err != nil {
		t.Fatal(err)
	}
	bad, err := os.ReadFile(backup)
	if err != nil {
		t.Fatal(err)
	}
	initial, err := os.ReadFile(filepath.Join(resources, "cg50_state.bin"))
	if err != nil {
		t.Fatal(err)
	}

	boot := func(state []byte) *Emulator {
		e := NewEmulator(append([]byte(nil), flash...))
		if err := e.Resume(state); err != nil {
			t.Fatal(err)
		}
		e.SetClock(time.Now().Unix())
		e.SetInstrPerSecond(15000000)
		e.SetInputSpeed(4344863)
		return e
	}
	advance := func(e *Emulator, n int) {
		for n > 0 {
			size := 50000
			if n < size {
				size = n
			}
			e.Step(size)
			if e.Fault() != "" {
				t.Fatal(e.Fault())
			}
			n -= size
		}
	}
	lit := func(e *Emulator) int {
		pixels := make([]byte, int(PanelWidth*PanelHeight*4))
		e.FramebufferRGBA(pixels)
		count := 0
		for i := 0; i+3 < len(pixels); i += 4 {
			if pixels[i] != 0 || pixels[i+1] != 0 || pixels[i+2] != 0 {
				count++
			}
		}
		return count
	}

	for _, mode := range []string{"hold", "tap", "early_hold", "initial"} {
		t.Run(mode, func(t *testing.T) {
			state := bad
			if mode == "initial" {
				state = initial
			}
			e := boot(state)
			if mode != "early_hold" {
				advance(e, 8000000)
			}

			if mode == "tap" {
				e.InjectKey(0, 0)
			} else {
				e.KeyDown(0, 0)
			}
			advance(e, 1500000)
			if mode != "tap" {
				e.KeyUp(0, 0)
			}
			advance(e, 6000000)

			count := lit(e)
			t.Logf("executed=%d litPixels=%d PC=%08x fault=%q",
				e.Executed(), count, e.cpu.pc, e.Fault())
			if count == 0 || e.Executed() <= 400 {
				t.Fatal("没有恢复显示和执行")
			}

			saved, err := e.Snapshot()
			if err != nil {
				t.Fatal(err)
			}
			restored := boot(saved)
			advance(restored, 1000000)
			if lit(restored) == 0 {
				t.Fatal("修复后保存再恢复，画面仍为黑屏")
			}
		})
	}

	t.Run("no_key_and_other_key_do_not_unmask", func(t *testing.T) {
		e := boot(bad)
		advance(e, 8000000)
		beforeIPR, beforeIMR := e.mmio.intc.ipr, e.mmio.intc.imr
		if ok, _ := e.mmio.intc.enabled(KeyscINTEVT); ok {
			t.Fatal("未按 AC 就改变了故障状态")
		}
		e.KeyDown(1, 1)
		advance(e, 500000)
		if e.mmio.intc.ipr != beforeIPR || e.mmio.intc.imr != beforeIMR {
			t.Fatal("非 AC 按键改变了中断配置")
		}
	})

	t.Run("other_program_address_is_untouched", func(t *testing.T) {
		e := boot(bad)
		advance(e, 8000000)
		e.cpu.pc = 0x80100000
		beforeIPR, beforeIMR := e.mmio.intc.ipr, e.mmio.intc.imr
		e.KeyDown(0, 0)
		if e.mmio.intc.ipr != beforeIPR || e.mmio.intc.imr != beforeIMR {
			t.Fatal("改变了其他程序位置的中断配置")
		}
	})
}
