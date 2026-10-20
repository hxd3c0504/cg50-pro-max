package main

import (
    _ "embed"
    "net/http"
    "strings"
    "time"
)

//go:embed calculator-front.png
var teachingPhoto []byte

func init() {
    keys := map[string][2]uint32{
        "SHIFT": {6,8}, "ALPHA": {6,7}, "SQ": {5,7},
        "POWER": {4,7}, "EXIT": {3,7}, "OPTN": {5,8},
        "VARS": {4,8}, "MENU": {3,8}, "XVAR": {6,6},
        "LOG": {5,6}, "LN": {4,6}, "SIN": {3,6},
        "COS": {2,6}, "TAN": {1,6}, "FRAC": {6,5},
        "SD": {5,5}, "STORE": {1,5}, "EXP": {4,1},
        "NEG": {3,1}, "AC": {0,0}, "DEL": {3,4}, "EXE": {2,1},
    }
    for name, position := range keys {
        webKeyMap[name] = [][2]uint32{position}
    }
}

type teachingEvent struct {
    id, key string
    down, clear bool
}
type teachingStroke struct {
    id string
    position [2]uint32
    released bool
    minimum uint64
    deadline time.Time
}
type teachingInput struct {
    events chan teachingEvent
    active *teachingStroke
    queue []*teachingStroke
    nextAt uint64
}

func newTeachingInput(mux *http.ServeMux) *teachingInput {
    t := &teachingInput{events: make(chan teachingEvent, 128)}
    mux.HandleFunc("/calculator-photo", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", http.DetectContentType(teachingPhoto))
        w.Header().Set("Cache-Control", "no-store")
        w.Write(teachingPhoto)
    })
    mux.HandleFunc("/hold", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            http.Error(w, "POST required", 405)
            return
        }
        q := r.URL.Query()
        e := teachingEvent{
            id: q.Get("id"), key: q.Get("k"),
            down: q.Get("down") == "1", clear: q.Get("reset") == "1",
        }
        if !e.clear {
            if !strings.HasPrefix(e.key, "Arrow") ||
                len(resolveKey(e.key)) != 1 ||
                len(e.id) == 0 || len(e.id) > 80 ||
                (q.Get("down") != "0" && q.Get("down") != "1") {
                http.Error(w, "invalid key", 400)
                return
            }
        }
        select {
        case t.events <- e:
            w.WriteHeader(204)
        default:
            http.Error(w, "keyboard busy", 503)
        }
    })
    return t
}

func (t *teachingInput) reset(k *keyscUnit) {
    if t.active != nil {
        p := t.active.position
        k.release(p[0], p[1])
    }
    t.active, t.queue, t.nextAt = nil, nil, 0
    for {
        select {
        case <-t.events:
        default:
            return
        }
    }
}

func (t *teachingInput) poll(k *keyscUnit) {
    select {
    case e := <-t.events:
        if e.clear {
            t.reset(k)
            return
        }
        var stroke *teachingStroke
        if t.active != nil && t.active.id == e.id {
            stroke = t.active
        }
        if stroke == nil {
            for _, queued := range t.queue {
                if queued.id == e.id {
                    stroke = queued
                    break
                }
            }
        }
        if stroke != nil {
            if e.down {
                stroke.deadline = time.Now().Add(3 * time.Second)
            } else {
                stroke.released = true
            }
        } else if e.down && len(t.queue) < 128 {
            t.queue = append(t.queue, &teachingStroke{
                id: e.id, position: resolveKey(e.key)[0],
                deadline: time.Now().Add(3 * time.Second),
            })
        }
    default:
    }
}

func (t *teachingInput) drive(k *keyscUnit, now uint64, canStart bool) {
    if t.active != nil {
        a := t.active
        expired := now & 131071 == 0 && time.Now().After(a.deadline)
        if (a.released && now >= a.minimum) || expired {
            k.release(a.position[0], a.position[1])
            t.active = nil
            t.nextAt = now + 3*k.scanPeriod
        }
        return
    }
    if !canStart || now < t.nextAt {
        return
    }
    for len(t.queue) > 0 {
        a := t.queue[0]
        t.queue = t.queue[1:]
        if time.Now().After(a.deadline) {
            continue
        }
        a.minimum = now + 3*k.scanPeriod
        t.active = a
        k.press(a.position[0], a.position[1])
        return
    }
}
