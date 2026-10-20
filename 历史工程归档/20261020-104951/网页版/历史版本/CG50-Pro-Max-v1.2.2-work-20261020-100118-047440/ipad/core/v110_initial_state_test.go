package main

import (
	"bytes"
	"os"
	"testing"
)

func TestV110NewInitialState(t *testing.T) {
	flash, err := os.ReadFile(os.Getenv("CG50_V110_FLASH"))
	if err != nil {
		t.Fatal(err)
	}
	state, err := os.ReadFile(os.Getenv("CG50_V110_STATE"))
	if err != nil {
		t.Fatal(err)
	}
	e := NewEmulator(flash)
	if err := e.Resume(state); err != nil {
		t.Fatal(err)
	}
	for _, key := range []string{"F1", "F2", "F6", "SHIFT", "AC", "EXE", "MENU"} {
		if len(resolveKey(key)) == 0 {
			t.Fatal("missing key: " + key)
		}
	}
	e.Step(500000)
	if e.Fault() != "" {
		t.Fatal(e.Fault())
	}
	snapshot, err := e.Snapshot()
	if err != nil {
		t.Fatal(err)
	}
	next := NewEmulator(flash)
	if err := next.Resume(snapshot); err != nil {
		t.Fatal(err)
	}
	a := make([]byte, PanelWidth*PanelHeight*4)
	b := make([]byte, len(a))
	e.FramebufferRGBA(a)
	next.FramebufferRGBA(b)
	if !bytes.Equal(a, b) {
		t.Fatal("LCD changed after snapshot restore")
	}
	t.Log("初始存档可恢复、运行及再次保存；未自动操作初始化菜单。")
}
