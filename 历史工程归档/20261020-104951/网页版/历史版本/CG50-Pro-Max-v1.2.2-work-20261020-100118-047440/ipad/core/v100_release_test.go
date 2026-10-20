package main

import (
	"bytes"
	"os"
	"testing"
)

func v100OldRead(b []byte, off, size uint32) uint32 {
	var v uint32
	for i := uint32(0); i < size; i++ {
		v = (v << 8) | uint32(b[off+i])
	}
	return v
}
func v100OldWrite(b []byte, off, size, val uint32) {
	for i := uint32(0); i < size; i++ {
		b[off+size-1-i] = byte(val >> (8 * i))
	}
}
func v100Panics(fn func()) (panicked bool) {
	defer func() { panicked = recover() != nil }()
	fn()
	return
}
func TestV100MemoryCompatibility(t *testing.T) {
	seed := uint32(1234567)
	for n := 0; n < 4000; n++ {
		seed = seed*1664525 + 1013904223
		original := make([]byte, 32)
		for i := range original {
			original[i] = byte(seed >> uint(i%4*8))
		}
		size := []uint32{0, 1, 2, 3, 4, 5, 8}[n%7]
		off := uint32(n % 35)
		a, b := append([]byte(nil), original...), append([]byte(nil), original...)
		var x, y uint32
		pa := v100Panics(func() { x = v100OldRead(a, off, size) })
		pb := v100Panics(func() { y = beRead(b, off, size) })
		if pa != pb || (!pa && x != y) {
			t.Fatalf("read mismatch off=%d size=%d", off, size)
		}
		pa = v100Panics(func() { v100OldWrite(a, off, size, seed) })
		pb = v100Panics(func() { beWrite(b, off, size, seed) })
		if pa != pb || !bytes.Equal(a, b) {
			t.Fatalf("write mismatch off=%d size=%d", off, size)
		}
	}
}
func TestV100SavedStateBatchEquivalence(t *testing.T) {
	flash, err := os.ReadFile(os.Getenv("CG50_V100_FLASH"))
	if err != nil {
		t.Fatal(err)
	}
	state, err := os.ReadFile(os.Getenv("CG50_V100_STATE"))
	if err != nil {
		t.Fatal(err)
	}
	slow, fast := NewEmulator(flash), NewEmulator(flash)
	if err := slow.Resume(state); err != nil {
		t.Fatal(err)
	}
	if err := fast.Resume(state); err != nil {
		t.Fatal(err)
	}
	slow.exactTick = true
	for i := 0; i < 100; i++ {
		slow.Step(2000)
		fast.Step(2000)
		if slow.Fault() != "" || fast.Fault() != "" {
			t.Fatalf("core fault: %s / %s", slow.Fault(), fast.Fault())
		}
	}
	a, err := slow.Snapshot()
	if err != nil {
		t.Fatal(err)
	}
	b, err := fast.Snapshot()
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(a, b) {
		t.Fatal("CPU/RAM/flash snapshots differ")
	}
	x := make([]byte, PanelWidth*PanelHeight*4)
	y := make([]byte, len(x))
	slow.FramebufferRGBA(x)
	fast.FramebufferRGBA(y)
	if !bytes.Equal(x, y) {
		t.Fatal("LCD frames differ")
	}
}

var v100Sink uint32

func BenchmarkV100Memory(b *testing.B) {
	for _, name := range []string{"reference", "optimized"} {
		b.Run(name, func(b *testing.B) {
			buf := make([]byte, 64)
			var value uint32
			for i := 0; i < b.N; i++ {
				off := uint32(i & 15)
				if name == "reference" {
					v100OldWrite(buf, off, 4, uint32(i))
					value ^= v100OldRead(buf, off, 4)
				} else {
					beWrite(buf, off, 4, uint32(i))
					value ^= beRead(buf, off, 4)
				}
			}
			v100Sink = value
		})
	}
}

func TestV100InputTiming(t *testing.T) {
	e := NewEmulator([]byte{0, 9})
	e.cpu.cycles = 1000
	e.mmio.keysc.scanPeriod = 10000
	e.mmio.keysc.scanNext = 11000
	e.tap.active = true
	e.tap.releaseAt = 31000
	e.tap.nextAt = 61000
	e.pendingUp = []pendingRelease{{at: 21000}}
	e.SetInputSpeed(33000)
	if e.mmio.keysc.scanPeriod != 1000 ||
		e.mmio.keysc.scanNext != 2000 ||
		e.tap.releaseAt != 4000 || e.tap.nextAt != 7000 ||
		e.pendingUp[0].at != 3000 {
		t.Fatal("pending keyboard deadlines were not rescaled correctly")
	}
}
