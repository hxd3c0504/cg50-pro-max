//go:build js && wasm

package main

import (
    "fmt"
    "syscall/js"
)

var browserMachine *Emulator
var browserCallbacks []js.Func

func browserBytes(v js.Value) []byte {
    b := make([]byte, v.Get("byteLength").Int())
    js.CopyBytesToGo(b, v)
    return b
}

func browserResult(b []byte) js.Value {
    a := js.Global().Get("Uint8Array").New(len(b))
    js.CopyBytesToJS(a, b)
    return a
}

func browserExport(name string, fn func([]js.Value) interface{}) {
    callback := js.FuncOf(func(this js.Value, args []js.Value) (out interface{}) {
        defer func() {
            if p := recover(); p != nil {
                out = map[string]interface{}{"error": fmt.Sprint(p)}
            }
        }()
        return fn(args)
    })
    browserCallbacks = append(browserCallbacks, callback)
    js.Global().Set(name, callback)
}

func main() {
    browserExport("cg50Boot", func(a []js.Value) interface{} {
        flash := browserBytes(a[0])
        if len(flash) != 33554432 {
            return map[string]interface{}{"error": "Firmware must be 32 MiB"}
        }
        state := browserBytes(a[1])
        if len(state) == 0 {
            return map[string]interface{}{"error": "A saved state is required"}
        }
        next := NewEmulator(flash)
        if err := next.Resume(state); err != nil {
            return map[string]interface{}{"error": err.Error()}
        }
        next.SetClock(int64(a[2].Float()))
        next.SetInstrPerSecond(10000000)
        browserMachine = next
        return map[string]interface{}{
            "width": int(PanelWidth),
            "height": int(PanelHeight),
        }
    })

    browserExport("cg50Step", func(a []js.Value) interface{} {
        if browserMachine == nil { return "Not started" }
        n := a[0].Int()
        if n < 1 { n = 1 }
        if n > 200000 { n = 200000 }
        browserMachine.Step(n)
        return browserMachine.Fault()
    })

    browserExport("cg50Frame", func(a []js.Value) interface{} {
        if browserMachine == nil { return nil }
        pixels := make([]byte, PanelWidth*PanelHeight*4)
        browserMachine.FramebufferRGBA(pixels)
        return browserResult(pixels)
    })

    browserExport("cg50Key", func(a []js.Value) interface{} {
        if browserMachine == nil { return false }
        row, col := a[0].Int(), a[1].Int()
        if row < 0 || row > 9 || col < 0 || col > 8 { return false }
        if a[2].Bool() {
            browserMachine.KeyDown(uint32(row), uint32(col))
        } else {
            browserMachine.KeyUp(uint32(row), uint32(col))
        }
        return true
    })

    browserExport("cg50ReleaseKeys", func(a []js.Value) interface{} {
        if browserMachine != nil { browserMachine.ReleaseAllKeys() }
        return nil
    })

    browserExport("cg50Save", func(a []js.Value) interface{} {
        if browserMachine == nil {
            return map[string]interface{}{"error": "Not started"}
        }
        data, err := browserMachine.Snapshot()
        if err != nil {
            return map[string]interface{}{"error": err.Error()}
        }
        return browserResult(data)
    })

    browserExport("cg50SetSpeed", func(a []js.Value) interface{} {
        if browserMachine == nil { return nil }
        speed := a[0].Float()
        if speed < 1000 || speed > 1000000000 { return false }
        browserMachine.SetInstrPerSecond(uint64(speed))
        return true
    })


    browserExport("cg50Tap", func(a []js.Value) interface{} {
        if browserMachine == nil { return false }
        keys := resolveKey(a[0].String())
        for _, key := range keys {
            browserMachine.InjectKey(key[0], key[1])
        }
        return len(keys) > 0
    })


    browserExport("cg50NamedHold", func(a []js.Value) interface{} {
        if browserMachine == nil { return false }
        keys := resolveKey(a[0].String())
        for _, key := range keys {
            if a[1].Bool() {
                browserMachine.KeyDown(key[0], key[1])
            } else {
                browserMachine.KeyUp(key[0], key[1])
            }
        }
        return len(keys) > 0
    })

    browserExport("cg50Restore", func(a []js.Value) interface{} {
        if browserMachine == nil {
            return map[string]interface{}{"error": "Not started"}
        }
        if err := browserMachine.Resume(browserBytes(a[0])); err != nil {
            return map[string]interface{}{"error": err.Error()}
        }
        browserMachine.SetClock(int64(a[1].Float()))
        return true
    })

    js.Global().Set("cg50CoreReady", true)
    select {}
}
