from pathlib import Path
import ast
import datetime
import gzip
import hashlib
import json
import os
import re
import shutil
import struct
import subprocess
import sys

PRIVATE_FIELDS = {"姓名": "CHEN ZHANG", "组织": "NEBS 11-02"}

def state_bytes(path):
    with gzip.open(path, "rb") as f:
        data = f.read(80 * 1024 * 1024 + 1)
    if len(data) > 80 * 1024 * 1024 or data[:8] != b"CG50ST01":
        raise ValueError("存档格式或大小与预期不同")
    return data

def private_hits(data):
    hits = []
    for label, value in PRIVATE_FIELDS.items():
        for encoding in ("ascii", "utf-16-le", "utf-16-be"):
            needle = value.encode(encoding)
            count = data.count(needle)
            if count:
                hits.append(
                    f"{label}/{encoding}: {count} 处，首处 0x{data.find(needle):x}"
                )
    return hits

def rebase(flash, data):
    if len(flash) != 33554432:
        raise ValueError("固件不是完整的 32 MiB")
    def u32(pos):
        if pos < 0 or pos + 4 > len(data):
            raise ValueError("存档被截断")
        return struct.unpack_from(">I", data, pos)[0]
    registers = u32(8)
    if not 36 <= registers <= 128:
        raise ValueError("存档寄存器数量与预期不同")
    pos = 12 + 4 * registers
    for expected in (0x800000, 0x10000, 0x200000):
        length = u32(pos)
        if length != expected:
            raise ValueError("存档内存区大小与预期不同")
        pos += 4 + length
        if pos > len(data):
            raise ValueError("存档内存区被截断")
    length_pos = pos
    length = u32(pos)
    start, end = pos + 4, pos + 4 + length
    if end > len(data):
        raise ValueError("闪存改动区被截断")
    delta = data[start:end]
    if delta[:4] != b"FLS1" or (len(delta) - 4) % 4100:
        raise ValueError("闪存改动格式与预期不同")
    merged = bytearray(flash)
    for p in range(4, len(delta), 4100):
        offset = struct.unpack_from(">I", delta, p)[0]
        if offset % 4096 or offset + 4096 > len(merged):
            raise ValueError("闪存页地址与预期不同")
        merged[offset:offset+4096] = delta[p+4:p+4100]
    clean_state = (
        data[:length_pos] + struct.pack(">I", 4) + b"FLS1" + data[end:]
    )
    return bytes(merged), clean_state

def verify_release_profile(flash_path, state_path):
    flash_path, state_path = Path(flash_path), Path(state_path)
    flash, state_file = flash_path.read_bytes(), state_path.read_bytes()
    state = state_bytes(state_path)
    report = private_hits(flash) + private_hits(state)
    if report:
        raise SystemExit(
            "停止打包：初始化数据仍含原登记信息。\n" + "\n".join(report)
        )
    manifest = json.loads(
        (state_path.parent / "release-profile.json").read_text()
    )
    for name, blob in (("flash", flash), ("state", state_file)):
        if hashlib.sha256(blob).hexdigest() != manifest.get(name):
            raise SystemExit(
                "初始化数据配对已变化，请重新运行 update-cg50-v014.py。"
            )

