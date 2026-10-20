package main

import (
	"path/filepath"
	"testing"
	"time"
)

func TestCG50BatteryDeadline(t *testing.T) {
	now := time.Unix(1800000000, 0)
	cases := []struct {
		name string
		r    cg50BatteryRecord
		want bool
	}{
		{"first install", cg50BatteryRecord{}, false},
		{"under 15 minutes", cg50BatteryRecord{ExitNS: now.Add(-14 * time.Minute).UnixNano()}, false},
		{"exactly 15 minutes", cg50BatteryRecord{ExitNS: now.Add(-15 * time.Minute).UnixNano()}, false},
		{"over 15 minutes", cg50BatteryRecord{ExitNS: now.Add(-15*time.Minute - time.Nanosecond).UnixNano()}, true},
		{"proper OFF", cg50BatteryRecord{ExitNS: now.Add(-time.Hour).UnixNano(), Off: true}, false},
		{"pending survives", cg50BatteryRecord{Need: true, Off: true}, true},
		{"clock went backward", cg50BatteryRecord{ExitNS: now.Add(time.Hour).UnixNano()}, false},
	}
	for _, c := range cases {
		if got := cg50BatteryDue(c.r, now); got != c.want {
			t.Errorf("%s: got %v want %v", c.name, got, c.want)
		}
	}
}

func TestCG50BatteryAcknowledgementDoesNotBoot(t *testing.T) {
	old := cg50BatteryFull.Load()
	defer cg50BatteryFull.Store(old)
	state := filepath.Join(t.TempDir(), "state.bin")
	record := cg50BatteryRecord{Need: true, Waiting: true}
	if err := cg50WriteBatteryRecord(state+".battery.json", record); err != nil {
		t.Fatal(err)
	}
	p, err := newCG50BatteryGuard(state, time.Now())
	if err != nil {
		t.Fatal(err)
	}
	command := func(kind string) {
		q := cg50BatteryRequest{kind: kind, reply: make(chan error, 1)}
		p.apply(q, nil)
		if err := <-q.reply; err != nil {
			t.Fatal(err)
		}
	}
	command("press")
	if !p.waiting.Load() || !p.record.Need || p.attempt != 1 {
		t.Fatal("AC must remain blocked before acknowledgement")
	}
	command("replace")
	if !p.waiting.Load() || p.record.Need || !p.record.Full {
		t.Fatal("replacement must leave calculator waiting for AC")
	}
	p, err = newCG50BatteryGuard(state, time.Now())
	if err != nil {
		t.Fatal(err)
	}
	if !p.waiting.Load() || p.record.Need || !p.record.Full {
		t.Fatal("replacement state did not survive restart")
	}
	command("press")
	if p.waiting.Load() {
		t.Fatal("second AC must release the gate")
	}
}
