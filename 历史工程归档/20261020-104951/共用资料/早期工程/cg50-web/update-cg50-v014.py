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

# === UPDATE ===

root = Path.home() / "cg50-web"
page = root / "emu_go/teaching.html"
builder = root / "build-cg50-pro-max.py"
support = Path.home() / "Library/Application Support/CG50Teaching"
live_flash = support / "flash_full.bin"
live_state = support / "cg50_state.bin"

for p in (page, builder, live_flash, live_state):
    if not p.is_file():
        raise SystemExit(f"未找到：{p}；未修改项目。")

running = subprocess.run(
    ["/usr/bin/pgrep", "-u", str(os.getuid()), "-x", "CG50Teaching"],
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
)
if running.returncode == 0:
    raise SystemExit("请先退出 CG50 Pro Max，再重新运行这份脚本。")

print("1/4 检查已保存的计算器数据……", flush=True)
clean_flash, clean_state = rebase(
    live_flash.read_bytes(), state_bytes(live_state)
)

# CG50 OWNER HISTORY SANITIZE V1
# Dedicated owner-registration history: physical 0xBE0000..0xBFFFFF.
# 0xFF represents erased NOR flash; only the release copy is changed.
owner_start = 0xBE0000
owner_end = 0xC00000
if len(clean_flash) != 33554432:
    raise SystemExit("固件大小不符，停止处理。")
owner_name = PRIVATE_FIELDS["姓名"].encode("ascii")
owner_position = clean_flash.find(owner_name)
if owner_position not in (-1, owner_start + 0x18):
    raise SystemExit("姓名位置与已核实的登记区不同，停止处理。")
clean_flash = (
    clean_flash[:owner_start]
    + b"\xff" * (owner_end - owner_start)
    + clean_flash[owner_end:]
)
print("已清空发布副本的登记历史区，继续检查其他残留……", flush=True)
report = (
    ["固件：" + x for x in private_hits(clean_flash)]
    + ["存档：" + x for x in private_hits(clean_state)]
)
if report:
    raise SystemExit(
        "界面信息虽已删除，但底层数据仍有残留；本次未修改项目、未生成安装包。\n"
        + "\n".join(report)
        + "\n请把以上残留检查结果发给我，先不要重新初始化整个计算器。"
    )

packed_state = gzip.compress(clean_state, mtime=0)
flash_path = root / "os/flash_dump/flash_full.bin"
state_path = root / "os/flash_dump/cg50_state.bin"
manifest_path = state_path.parent / "release-profile.json"
manifest = json.dumps({
    "flash": hashlib.sha256(clean_flash).hexdigest(),
    "state": hashlib.sha256(packed_state).hexdigest()
}, indent=2) + "\n"

css = r'''
<style id="cg50-mini-style">
.cg50-mode-button{font:inherit;padding:9px 13px;border-radius:9px;border:1px solid var(--cg-border,#d2dae4);background:var(--cg-panel,#fff);color:var(--cg-text,#1c2737);cursor:pointer;white-space:nowrap}
.heading{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
html[data-cg50-theme="dark"] .tools button:is(:hover,:active,:focus-visible),
html[data-cg50-theme="dark"] #clear:is(:hover,:active,:focus-visible),
html[data-cg50-theme="dark"] #cg50-settings-dialog button:is(:hover,:active,:focus-visible),
html[data-cg50-theme="dark"] .cg50-mode-button:is(:hover,:active,:focus-visible){background:#edf3ff!important;color:#111820!important;border-color:#b4c9e6!important}
#cg50-expand-button{display:none}
body.cg50-mini .presentation,body.cg50-mini .record,body.cg50-mini .help{display:none!important}
body.cg50-mini main{display:block!important;max-width:none;padding:10px!important;margin:0 auto!important}
body.cg50-mini #device{width:min(100%,calc((100vh - var(--cg50-mini-header,64px) - 24px)*var(--cg50-device-ratio,0.47)))!important;min-width:0!important;max-width:none!important;margin:0 auto}
body.cg50-mini header{padding:8px 10px!important;gap:6px;flex-wrap:wrap;align-items:center;justify-content:space-between}
body.cg50-mini header .brand,body.cg50-mini header h1,body.cg50-mini header strong{font-size:14px}
body.cg50-mini #connection{display:none}
body.cg50-mini .tools{gap:6px}
body.cg50-mini .tools #fullscreen,body.cg50-mini .tools #capture,body.cg50-mini .tools [data-state]{display:none!important}
body.cg50-mini #cg50-expand-button{display:inline-flex;padding:7px 10px;font-size:13px}
body.cg50-mini #cg50-settings-button{width:36px;height:36px}
</style>
'''

js = r'''
(() => {
  const device=document.getElementById('device');
  const heading=document.querySelector('.heading');
  const tools=document.querySelector('.tools');
  if(!device||!heading||!tools||typeof tap!=='function') return;
  const miniButton=document.createElement('button');
  const expandButton=document.createElement('button');
  for(const b of [miniButton,expandButton]) {
    b.type='button';b.className='cg50-mode-button';
  }
  miniButton.id='cg50-mini-button';
  expandButton.id='cg50-expand-button';
  heading.append(miniButton);
  tools.prepend(expandButton);
  let saved=false;
  try {saved=localStorage.getItem('cg50-mini')==='true';} catch(_) {}
  let mini=typeof window.CG50NativeCompact==='boolean'
    ?window.CG50NativeCompact:saved;
  const rect=device.getBoundingClientRect();
  const ratio=rect.width>0&&rect.height>0?rect.width/rect.height:0.47;
  document.documentElement.style.setProperty('--cg50-device-ratio',String(ratio));
  function english(){return document.documentElement.lang.startsWith('en');}
  function labels(){
    miniButton.textContent=english()?'Mini mode':'小窗模式';
    expandButton.textContent=english()?'Expand view':'展开界面';
    const help=document.querySelector('.help');
    if(help) {
      const text=english()
        ? 'Enter → EXE · Backspace → DEL · Esc → EXIT · Tab / Home → MENU<br>Shift (tap) → SHIFT · Backtick → ALPHA · F1–F6 → Function keys<br>Numbers, operators and arrow keys work directly. A–Z enters ALPHA followed by the letter key.<br>Tap Shift for yellow functions. Hold Shift to type symbols or uppercase letters normally.'
        : 'Enter → EXE · Backspace → DEL · Esc → EXIT · Tab / Home → MENU<br>单按 Shift → 黄色 SHIFT · 反引号 → ALPHA · F1–F6 → 功能键<br>数字、运算符和方向键直接输入；A–Z 自动输入 ALPHA＋字母键。<br>单按 Shift 使用黄色功能；按住 Shift 输入符号或大写字母时保持正常输入。';
      if(help.innerHTML!==text) help.innerHTML=text;
    }
  }
  function size(){
    const header=document.querySelector('header');
    const height=header?header.getBoundingClientRect().height:64;
    document.documentElement.style.setProperty('--cg50-mini-header',height+'px');
  }
  function apply(value){
    if(typeof releaseAll==='function') releaseAll();
    mini=!!value;
    document.body.classList.toggle('cg50-mini',mini);
    miniButton.setAttribute('aria-pressed',String(mini));
    window.CG50NativeCompact=mini;
    try {localStorage.setItem('cg50-mini',String(mini));} catch(_) {}
    labels();size();
    try {
      window.webkit.messageHandlers.native.postMessage({
        kind:'cg50-compact',enabled:mini
      });
    } catch(_) {}
  }
  function focusCalculator(){
    document.body.tabIndex=-1;
    document.body.focus({preventScroll:true});
  }
  miniButton.addEventListener('click',()=>{apply(true);focusCalculator();});
  expandButton.addEventListener('click',()=>{apply(false);focusCalculator();});
  new MutationObserver(labels).observe(document.documentElement,{
    attributes:true,attributeFilter:['lang']
  });
  if(typeof ResizeObserver==='function') {
    const header=document.querySelector('header');
    if(header) new ResizeObserver(size).observe(header);
  }
  window.addEventListener('resize',size);
  const shifts=new Set(),consumedTabs=new Set();
  let shiftUsed=false;
  function formTarget(e){
    return !!document.querySelector('dialog[open]') ||
      !!e.target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])');
  }
  function reset(){shifts.clear();consumedTabs.clear();shiftUsed=false;}
  document.addEventListener('keydown',e=>{
    if(formTarget(e)||e.isComposing){reset();return;}
    if(e.key==='Shift'){
      if(e.ctrlKey||e.metaKey||e.altKey){reset();return;}
      if(shifts.size===0) shiftUsed=false;
      shifts.add(e.code);
      e.stopImmediatePropagation();
      return;
    }
    if(shifts.size) shiftUsed=true;
    if(e.key==='Tab'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
      e.preventDefault();e.stopImmediatePropagation();
      consumedTabs.add(e.code);
      if(!e.repeat) tap('MENU');
    }
  },true);
  document.addEventListener('keyup',e=>{
    if(consumedTabs.has(e.code)){
      consumedTabs.delete(e.code);
      e.preventDefault();e.stopImmediatePropagation();return;
    }
    if(e.key!=='Shift'||!shifts.has(e.code))return;
    shifts.delete(e.code);e.stopImmediatePropagation();
    if(shifts.size===0&&!shiftUsed&&!formTarget(e)&&
       !e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.isComposing) tap('SHIFT');
  },true);
  const settings=document.getElementById('cg50-settings-dialog');
  if(settings) new MutationObserver(()=>{
    if(settings.open)reset();
  }).observe(settings,{attributes:true,attributeFilter:['open']});
  document.addEventListener('pointerdown',()=>{
    if(shifts.size)shiftUsed=true;
  },true);
  window.addEventListener('blur',reset);
  document.addEventListener('visibilitychange',reset);
  apply(mini);
})();
'''

native = r'''
// CG50 COMPACT V1
var cg50WideFrame: NSRect?
var cg50WindowIsCompact = false
var cg50RequestedCompact = false
var cg50FullscreenObserver: NSObjectProtocol?

func cg50InstallCompactPreference(_ controller: WKUserContentController) {
    let value = UserDefaults.standard.bool(forKey: "cg50.compact") ? "true" : "false"
    let source = "/*cg50-compact*/window.CG50NativeCompact=" + value + ";"
    let kept = controller.userScripts.filter {
        !$0.source.hasPrefix("/*cg50-compact*/")
    }
    controller.removeAllUserScripts()
    kept.forEach { controller.addUserScript($0) }
    controller.addUserScript(WKUserScript(
        source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true
    ))
}

func cg50SetCompact(_ enabled: Bool, _ view: WKWebView) {
    guard let window = view.window else { return }
    cg50RequestedCompact = enabled
    UserDefaults.standard.set(enabled, forKey: "cg50.compact")
    cg50InstallCompactPreference(view.configuration.userContentController)
    if enabled == cg50WindowIsCompact { return }
    if enabled && window.styleMask.contains(.fullScreen) {
        if cg50FullscreenObserver == nil {
            cg50FullscreenObserver = NotificationCenter.default.addObserver(
                forName: NSWindow.didExitFullScreenNotification,
                object: window, queue: .main
            ) { [weak view] _ in
                if let token = cg50FullscreenObserver {
                    NotificationCenter.default.removeObserver(token)
                    cg50FullscreenObserver = nil
                }
                if let view = view {
                    cg50SetCompact(cg50RequestedCompact, view)
                }
            }
            window.toggleFullScreen(nil)
        }
        return
    }
    let visible = window.screen?.visibleFrame
        ?? NSScreen.main?.visibleFrame
        ?? NSRect(x: 0, y: 0, width: 1280, height: 900)
    let old = window.frame
    if enabled {
        cg50WideFrame = old
        window.minSize = NSSize(width: 320, height: 560)
        let width = min(CGFloat(380), visible.width)
        let height = min(CGFloat(860), visible.height)
        let x = max(visible.minX, min(old.minX, visible.maxX - width))
        let y = max(visible.minY, min(old.maxY - height, visible.maxY - height))
        window.setFrame(
            NSRect(x: x, y: y, width: width, height: height),
            display: true, animate: true
        )
    } else {
        window.minSize = NSSize(width: 800, height: 580)
        let frame = cg50WideFrame ?? NSRect(
            x: visible.minX, y: visible.minY,
            width: min(1360, visible.width),
            height: min(820, visible.height)
        )
        window.setFrame(
            window.constrainFrameRect(frame, to: window.screen),
            display: true, animate: true
        )
    }
    cg50WindowIsCompact = enabled
}

'''

receive = r'''
        if let values = message.body as? [String: Any],
           values["kind"] as? String == "cg50-compact",
           let enabled = values["enabled"] as? Bool,
           let view = message.webView {
            cg50SetCompact(enabled, view)
            return
        }
'''

print("2/4 更新界面和 Mac 窗口……", flush=True)
html = page.read_text()
for name in ("HEAD", "BODY"):
    html = re.sub(
        rf"<!-- CG50 MINI V1 {name} -->.*?<!-- /CG50 MINI V1 {name} -->",
        "", html, flags=re.S
    )
if html.count("</head>") != 1 or html.count("</body>") != 1:
    raise SystemExit("网页结束标签与预期不同，未修改项目。")
if not re.search(r"\bfunction\s+tap\s*\(", html):
    raise SystemExit("未找到现有 tap 按键函数，未修改项目。")

html = html.replace(
    "</head>",
    "<!-- CG50 MINI V1 HEAD -->"+css+
    "<!-- /CG50 MINI V1 HEAD -->\n</head>",1
)
html = html.replace(
    "</body>",
    "<!-- CG50 MINI V1 BODY -->\n<script>\n"+js+
    "\n</script>\n<!-- /CG50 MINI V1 BODY -->\n</body>",1
)

source = builder.read_text()
nodes = [
    n for n in ast.walk(ast.parse(source))
    if isinstance(n, ast.Assign)
    and any(isinstance(t, ast.Name) and t.id == "swift_source"
            for t in n.targets)
    and isinstance(n.value, ast.Constant)
    and isinstance(n.value.value, str)
]
if len(nodes) != 1:
    raise SystemExit("未找到唯一的 Swift 窗口源码，未修改项目。")
node = nodes[0]
swift = node.value.value

if "// CG50 COMPACT V1" not in swift:
    anchor = 'configuration.userContentController.add(self, name: "native")'
    handler = (
        r'func\s+userContentController\s*\([\s\S]*?'
        r'didReceive\s+message\s*:\s*WKScriptMessage\s*\)\s*\{'
    )
    if swift.count(anchor) != 1 or len(re.findall(handler, swift)) != 1:
        raise SystemExit("Mac 消息接口与预期不同，未修改项目。")
    swift = swift.replace(
        anchor,
        anchor+"\n            cg50InstallCompactPreference(configuration.userContentController)",
        1
    )
    swift = re.sub(handler, lambda m:m.group(0)+"\n"+receive, swift, count=1)
    imports = list(re.finditer(r"(?m)^import[ \t]+[^\n]+(?:\n|$)", swift))
    if not imports:
        raise SystemExit("未找到 Swift 导入位置，未修改项目。")
    position = imports[-1].end()
    swift = swift[:position]+"\n"+native+swift[position:]
    lines = source.splitlines(keepends=True)
    source = (
        "".join(lines[:node.lineno-1])+
        "swift_source = "+repr(swift)+"\n"+
        "".join(lines[node.end_lineno:])
    )

if "# CG50 RELEASE PROFILE CHECK" not in source:
    assignments = [
        n for n in ast.parse(source).body
        if isinstance(n, ast.Assign)
        and any(isinstance(t, ast.Name) and t.id == "state"
                for t in n.targets)
    ]
    if len(assignments) != 1:
        raise SystemExit("未找到打包存档位置，未修改项目。")
    lines = source.splitlines(keepends=True)
    position = assignments[0].end_lineno
    source = (
        "".join(lines[:position])+
        "\n# CG50 RELEASE PROFILE CHECK\n"
        "from cg50_release_profile import verify_release_profile\n"
        "verify_release_profile(flash, state)\n\n"+
        "".join(lines[position:])
    )

for old in ("0.1.1", "0.1.2", "0.1.3"):
    for quote in ('"', "'"):
        source = source.replace(quote+old+quote, quote+"0.1.4"+quote)
source = re.sub(
    r'''(["']CFBundleVersion["']\s*:\s*["'])[234](["'])''',
    r"\g<1>5\2", source
)
ast.parse(source)

module = Path(__file__).read_text().split("# === UPDATE ===", 1)[0]
updates = {
    page: html.encode(),
    builder: source.encode(),
    root / "cg50_release_profile.py": module.encode(),
    flash_path: clean_flash,
    state_path: packed_state,
    manifest_path: manifest.encode()
}
stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S-%f")
backup = root / "ui-backups" / ("v014-"+stamp)
backup.mkdir(parents=True, mode=0o700)
previous = {}
for p in updates:
    previous[p] = p.read_bytes() if p.exists() else None
    if p.exists():
        shutil.copy2(p, backup / p.name)

def write_atomic(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name+".v014-tmp")
    temporary.write_bytes(data)
    temporary.chmod(0o644)
    temporary.replace(path)

print("备份位置：", backup, flush=True)
try:
    for p,data in updates.items():
        write_atomic(p,data)
    verify_release_profile(flash_path,state_path)
    print("3/4 登记信息检查通过，开始编译打包……", flush=True)
    subprocess.run([sys.executable,str(builder)],cwd=root,check=True)
except BaseException:
    for p,data in previous.items():
        if data is None:
            p.unlink(missing_ok=True)
        else:
            write_atomic(p,data)
    print("构建未完成，项目文件已恢复。", flush=True)
    raise

print("\n4/4 新安装包已生成：版本 0.1.4。")
print("安装后可测试小窗模式、深色悬停、Tab 和 Shift。")
print("以后仍使用 build-cg50-pro-max.py 打包。")
