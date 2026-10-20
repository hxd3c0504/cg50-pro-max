from pathlib import Path
import ast
import datetime
import json
import re
import shutil
import subprocess
import sys

root = Path.home() / "cg50-web"
page = root / "emu_go/teaching.html"
builder = root / "build-cg50-pro-max.py"
for p in (page, builder):
    if not p.is_file():
        raise SystemExit(f"未找到：{p}；未修改项目。")
original = {p: p.read_text() for p in (page, builder)}

css = r'''
<style id="cg50-settings-style">
:root{--cg-bg:#eef2f6;--cg-panel:#fff;--cg-text:#1c2737;--cg-muted:#68778b;--cg-border:#d2dae4;--cg-soft:#f8faff;--cg-accent:#1764c5}
html[data-cg50-theme="dark"]{--cg-bg:#111820;--cg-panel:#1d2732;--cg-text:#edf2f7;--cg-muted:#a8b5c6;--cg-border:#3c4a5b;--cg-soft:#253342;--cg-accent:#71b9ff}
body{background:var(--cg-bg);color:var(--cg-text)}
header,.record{background:var(--cg-panel);border-color:var(--cg-border)}
.tools button,#clear,.help kbd,#cg50-settings-dialog button,#cg50-settings-dialog select{background:var(--cg-panel);color:var(--cg-text);border:1px solid var(--cg-border)}
.heading h1,.record-top{color:var(--cg-text)}
.help,#empty,.record-top span{color:var(--cg-muted)}
#lastkey{color:var(--cg-accent)}
html[data-cg50-theme="dark"] #connection.online{color:#72d4a4}
#history li{background:var(--cg-soft);border-color:var(--cg-border);color:var(--cg-text)}
.tools{flex-wrap:wrap;align-items:center}
.cg50-settings-trigger{position:relative;display:inline-flex;flex-shrink:0}
#cg50-settings-button{width:42px;height:42px;padding:0;display:grid;place-items:center;cursor:pointer;border-radius:9px}
#cg50-settings-button:hover{background:var(--cg-soft)}
#cg50-settings-tooltip{position:absolute;top:calc(100% + 8px);right:0;padding:6px 10px;background:var(--cg-text);color:var(--cg-panel);border-radius:6px;white-space:nowrap;font-size:13px;opacity:0;visibility:hidden;pointer-events:none;z-index:50}
.cg50-settings-trigger:hover #cg50-settings-tooltip,.cg50-settings-trigger:focus-within #cg50-settings-tooltip{opacity:1;visibility:visible}
#cg50-settings-dialog{width:min(440px,calc(100vw - 48px));max-height:calc(100vh - 48px);box-sizing:border-box;overflow:auto;border:1px solid var(--cg-border);border-radius:18px;background:var(--cg-panel);color:var(--cg-text);padding:26px;box-shadow:0 24px 80px #0005}
#cg50-settings-dialog::backdrop{background:#0007}
.cg50-settings-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.cg50-settings-heading h2{margin:0;font-size:24px}
#cg50-close-settings{width:34px;height:34px;font-size:22px;border-radius:8px;cursor:pointer}
.cg50-setting{display:block;margin-top:22px}
.cg50-setting>span{display:block;font-weight:600;margin-bottom:10px}
#cg50-settings-dialog select{width:100%;font:inherit;padding:10px 12px;border-radius:8px;cursor:pointer}
#cg50-settings-dialog p{font-size:13px;line-height:1.6;color:var(--cg-muted);margin:10px 0}
#cg50-settings-dialog footer{border-top:1px solid var(--cg-border);padding-top:16px;margin-top:22px;font-size:13px;color:var(--cg-muted)}
#cg50-settings-dialog :focus-visible,#cg50-settings-button:focus-visible{outline:3px solid var(--cg-accent);outline-offset:3px}
</style>
'''

markup = r'''
<dialog id="cg50-settings-dialog" aria-labelledby="cg50-settings-title">
  <div class="cg50-settings-heading">
    <h2 id="cg50-settings-title">设置</h2>
    <button type="button" id="cg50-close-settings" aria-label="关闭设置">×</button>
  </div>
  <label class="cg50-setting" for="cg50-language">
    <span>界面语言</span>
    <select id="cg50-language">
      <option value="en">English</option>
      <option value="zh">中文</option>
    </select>
  </label>
  <p>仅切换软件界面；计算器菜单语言请在 CG50 内设置。</p>
  <label class="cg50-setting" for="cg50-theme">
    <span>外观模式</span>
    <select id="cg50-theme">
      <option value="system">自动（跟随系统）</option>
      <option value="light">浅色</option>
      <option value="dark">深色</option>
    </select>
  </label>
  <p>自动模式跟随系统；无法读取时，07:00–19:00 使用浅色。</p>
  <footer>设置立即生效，重启后保留。</footer>
</dialog>
'''

js = r'''
(() => {
  const $ = s => document.querySelector(s);
  const dict = {
    "全屏投屏":"Fullscreen","退出全屏":"Exit fullscreen",
    "保存屏幕图片":"Save screen image","保存进度 · F9":"Save progress · F9",
    "恢复进度 · F10":"Restore progress · F10","屏幕放大":"Screen preview",
    "最近按键":"Last key","清空按键记录":"Clear key history",
    "点击左侧按键，或使用电脑键盘。":"Click a calculator key or use your computer keyboard.",
    "画面已连接":"Screen connected","连接中":"Connecting…","连接中断":"Connection lost",
    "分数":"Fraction","设置":"Settings","关闭设置":"Close settings",
    "界面语言":"Interface language","外观模式":"Appearance",
    "自动（跟随系统）":"Automatic (follow system)","浅色":"Light","深色":"Dark",
    "设置立即生效，重启后保留。":"Changes apply immediately and are remembered after restarting.",
    "仅切换软件界面；计算器菜单语言请在 CG50 内设置。":"Changes the app interface. Set the calculator menu language within the CG50.",
    "自动模式跟随系统；无法读取时，07:00–19:00 使用浅色。":"Automatic follows system appearance. If unavailable, light mode is used from 07:00 to 19:00.",
    "已保存计算器状态":"Calculator state saved.","已保存当前计算器状态":"Calculator state saved.",
    "已恢复保存的计算器状态":"Saved calculator state restored.",
    "已保存进度":"Progress saved.","已恢复进度":"Progress restored.",
    "保存失败":"Save failed","恢复失败":"Restore failed","等待超时":"Timed out",
    "按键未送达，请检查终端是否仍在运行":"Key not sent. Check that the emulator is running.",
    "请使用浏览器的全屏功能":"Use your browser's fullscreen command.",
    "按键记录已清空":"Key history cleared.","已保存屏幕图片":"Screen image saved."
  };
  const reverse = {};
  Object.entries(dict).forEach(([a,b]) => { if (!(b in reverse)) reverse[b]=a; });
  let saved={};
  try { saved=JSON.parse(localStorage.getItem('cg50-ui-settings')||'{}'); } catch (_) {}
  const raw=window.CG50NativePrefs||saved||{};
  let prefs={
    language:['en','zh'].includes(raw.language)?raw.language:'en',
    theme:['system','light','dark'].includes(raw.theme)?raw.theme:'system'
  };
  const dialog=$('#cg50-settings-dialog'), restore=$('[data-state="load"]');
  if (!dialog || !restore) return;
  const wrap=document.createElement('span');
  wrap.className='cg50-settings-trigger';
  const gear=document.createElement('button');
  gear.type='button'; gear.id='cg50-settings-button';
  gear.setAttribute('aria-haspopup','dialog');
  gear.setAttribute('aria-controls',dialog.id);
  gear.setAttribute('aria-label','设置');
  gear.setAttribute('aria-describedby','cg50-settings-tooltip');
  const points=Array.from({length:32},(_,i)=>{
    const a=-Math.PI/2+i*Math.PI/16, r=[8.4,10.3,10.3,8.4][i%4];
    return (12+Math.cos(a)*r).toFixed(2)+' '+(12+Math.sin(a)*r).toFixed(2);
  });
  gear.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M'+points.join(' L')+' Z M12 8.6 a3.4 3.4 0 1 0 0 6.8 a3.4 3.4 0 1 0 0 -6.8 Z"/></svg>';
  const tip=document.createElement('span');
  tip.id='cg50-settings-tooltip'; tip.textContent='设置'; tip.setAttribute('role','tooltip');
  wrap.append(gear,tip); restore.insertAdjacentElement('afterend',wrap);
  function translate(s) {
    const map=prefs.language==='en'?dict:reverse;
    const key=s.trim();
    if (key in map) return s.replace(key,map[key]);
    const a=prefs.language==='en'?'操作未完成：':'Could not complete action: ';
    const b=prefs.language==='en'?'Could not complete action: ':'操作未完成：';
    return s.startsWith(a)?b+translate(s.slice(a.length)):s;
  }
  function localize() {
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    let n;
    while ((n=walker.nextNode())) {
      if (n.parentElement?.closest('script,style,textarea')) continue;
      const text=translate(n.nodeValue);
      if (text!==n.nodeValue) n.nodeValue=text;
    }
    document.querySelectorAll('[title],[aria-label]').forEach(el=>{
      ['title','aria-label'].forEach(a=>{
        const old=el.getAttribute(a);
        if (old!==null) {
          const value=translate(old);
          if(value!==old) el.setAttribute(a,value);
        }
      });
    });
  }
  function theme() {
    let value=prefs.theme;
    if (value==='system') {
      value=null;
      try {
        if(matchMedia('(prefers-color-scheme: dark)').matches) value='dark';
        else if(matchMedia('(prefers-color-scheme: light)').matches) value='light';
      } catch (_) {}
      if(!value) {
        const h=new Date().getHours();
        value=h>=7&&h<19?'light':'dark';
      }
    }
    document.documentElement.dataset.cg50Theme=value;
    document.documentElement.style.colorScheme=value;
  }
  const help={
    en:'Enter → EXE · Backspace → DEL · Esc → EXIT · Home → MENU<br>Tab → SHIFT · Backtick → ALPHA · F1–F6 → Function keys<br>Numbers, operators and arrow keys work directly. A–Z enters ALPHA followed by the letter key.<br>Yellow functions: SHIFT then the key. Red letters: ALPHA then the key.',
    zh:'Enter → EXE · Backspace → DEL · Esc → EXIT · Home → MENU<br>Tab → SHIFT · 反引号 → ALPHA · F1–F6 → 功能键<br>数字、运算符和方向键直接输入；A–Z 自动输入 ALPHA＋字母键。<br>黄色功能：先按 SHIFT，再按对应键。红色字母：先按 ALPHA，再按对应键。'
  };
  function apply() {
    document.documentElement.lang=prefs.language==='en'?'en':'zh-CN';
    $('#cg50-language').value=prefs.language;
    $('#cg50-theme').value=prefs.theme;
    const legend=$('.help');
    if(legend && legend.innerHTML!==help[prefs.language])
      legend.innerHTML=help[prefs.language];
    if(typeof keyById!=='undefined' && keyById.has('FRAC'))
      keyById.get('FRAC')[1]=prefs.language==='en'?'Fraction':'分数';
    localize(); theme();
  }
  function persist() {
    window.CG50NativePrefs={...prefs};
    try {localStorage.setItem('cg50-ui-settings',JSON.stringify(prefs));} catch (_) {}
    try {
      window.webkit.messageHandlers.native.postMessage({kind:'cg50-settings',...prefs});
    } catch (_) {}
  }
  $('#cg50-language').addEventListener('change',e=>{
    prefs.language=e.target.value; apply(); persist();
  });
  $('#cg50-theme').addEventListener('change',e=>{
    prefs.theme=e.target.value; apply(); persist();
  });
  gear.addEventListener('click',()=>{
    if(typeof releaseAll==='function') releaseAll();
    dialog.showModal();
  });
  $('#cg50-close-settings').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>gear.focus({preventScroll:true}));
  dialog.addEventListener('click',e=>{
    if(e.target!==dialog) return;
    const r=dialog.getBoundingClientRect();
    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)
      dialog.close();
  });
  const consumed=new Set();
  document.addEventListener('keydown',e=>{
    if(!dialog.open) return;
    consumed.add(e.code); e.stopImmediatePropagation();
    if(e.key==='Escape'){e.preventDefault();dialog.close();}
  },true);
  document.addEventListener('keyup',e=>{
    if(dialog.open||consumed.has(e.code)) e.stopImmediatePropagation();
    consumed.delete(e.code);
  },true);
  window.addEventListener('blur',()=>consumed.clear());
  ['dark','light'].forEach(value=>{
    if(typeof matchMedia!=='function') return;
    const q=matchMedia('(prefers-color-scheme: '+value+')');
    const changed=()=>{if(prefs.theme==='system') theme();};
    if(q.addEventListener) q.addEventListener('change',changed);
    else if(q.addListener) q.addListener(changed);
  });
  setInterval(()=>{if(prefs.theme==='system')theme();},60000);
  apply();
  new MutationObserver(localize).observe(document.body,{
    subtree:true,childList:true,characterData:true
  });
})();
'''

native_words = {
    "关于 CG50 Pro Max":"About CG50 Pro Max",
    "退出 CG50 Pro Max":"Quit CG50 Pro Max",
    "关于 CG50 Teaching":"About CG50 Pro Max",
    "退出 CG50 Teaching":"Quit CG50 Pro Max",
    "编辑":"Edit","教学":"Teaching","剪切":"Cut","复制":"Copy",
    "粘贴":"Paste","全选":"Select All",
    "保存进度":"Save progress","保存屏幕图片":"Save screen image",
    "全屏投屏":"Fullscreen","启动失败":"Startup failed",
    "模拟器已停止":"Emulator stopped","启动超时":"Startup timed out",
    "模拟器尚未启动":"The emulator has not started.",
    "已保存进度":"Progress saved","保存失败":"Save failed",
    "下次启动会从此处继续。":"The next launch will resume from here.",
    "下次启动会从这里继续。":"The next launch will resume from here.",
    "无法获取屏幕图片":"Could not retrieve the screen image.",
    "保存图片失败":"Could not save the image",
    "退出前未能保存进度":"Could not save before quitting",
    "取消退出":"Cancel","仍然退出":"Quit anyway","好":"OK","确定":"OK",
    "正在启动 CG50…":"Starting CG50…"
}
pairs = ",\n".join(
    "    " + json.dumps(k, ensure_ascii=False) + ": " +
    json.dumps(v, ensure_ascii=False)
    for k,v in native_words.items()
)

native = r'''
// CG50 SETTINGS V2
let cg50UITranslations: [String: String] = [
''' + pairs + r'''
]
func cg50UIText(_ text: String) -> String {
    if UserDefaults.standard.string(forKey: "cg50.language") == "zh" {
        return cg50UITranslations.first(where: { $0.value == text })?.key ?? text
    }
    return cg50UITranslations[text] ?? text
}
func cg50InstallPreferences(_ controller: WKUserContentController) {
    let defaults = UserDefaults.standard
    let rawLanguage = defaults.string(forKey: "cg50.language") ?? "en"
    let rawTheme = defaults.string(forKey: "cg50.theme") ?? "system"
    let language = ["en", "zh"].contains(rawLanguage) ? rawLanguage : "en"
    let theme = ["system", "light", "dark"].contains(rawTheme) ? rawTheme : "system"
    let values: [String: String] = ["language": language, "theme": theme]
    let data = try! JSONSerialization.data(withJSONObject: values)
    let source = "/*cg50-settings*/window.CG50NativePrefs=" + String(decoding: data, as: UTF8.self) + ";"
    let kept = controller.userScripts.filter {
        !$0.source.hasPrefix("/*cg50-settings*/")
    }
    controller.removeAllUserScripts()
    kept.forEach { controller.addUserScript($0) }
    controller.addUserScript(WKUserScript(
        source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true
    ))
    switch theme {
    case "dark": NSApp.appearance = NSAppearance(named: .darkAqua)
    case "light": NSApp.appearance = NSAppearance(named: .aqua)
    default: NSApp.appearance = nil
    }
    func translateMenu(_ menu: NSMenu) {
        menu.title = cg50UIText(menu.title)
        for item in menu.items {
            item.title = cg50UIText(item.title)
            if let submenu = item.submenu { translateMenu(submenu) }
        }
    }
    if let menu = NSApp.mainMenu { translateMenu(menu) }
}

'''

receive = r'''
        if let values = message.body as? [String: Any],
           values["kind"] as? String == "cg50-settings",
           let language = values["language"] as? String,
           ["en", "zh"].contains(language),
           let theme = values["theme"] as? String,
           ["system", "light", "dark"].contains(theme) {
            UserDefaults.standard.set(language, forKey: "cg50.language")
            UserDefaults.standard.set(theme, forKey: "cg50.theme")
            if let controller = message.webView?.configuration.userContentController {
                cg50InstallPreferences(controller)
            }
            return
        }
'''

html = original[page]
head_start = "<!-- CG50 SETTINGS V2 HEAD -->"
head_end = "<!-- /CG50 SETTINGS V2 HEAD -->"
body_start = "<!-- CG50 SETTINGS V2 BODY -->"
body_end = "<!-- /CG50 SETTINGS V2 BODY -->"

for start,end in ((head_start,head_end),(body_start,body_end)):
    html = re.sub(re.escape(start)+r".*?"+re.escape(end), "", html, flags=re.S)
if 'id="cg50-settings-style"' in html:
    raise SystemExit("检测到另一版设置代码，未修改项目。请发送 teaching.html 文件。")
if html.count("</head>") != 1 or html.count("</body>") != 1:
    raise SystemExit("网页结束标签与预期不同，未修改项目。")
if not re.search(r'data-state\s*=\s*["\']load["\']',html):
    raise SystemExit("未找到恢复进度按钮，未修改项目。")

html = html.replace("</head>",head_start+css+head_end+"\n</head>",1)
html = html.replace(
    "</body>",
    body_start+markup+"\n<script>\n"+js+"\n</script>"+body_end+"\n</body>",1
)

source = original[builder]
nodes = [
    n for n in ast.walk(ast.parse(source))
    if isinstance(n,ast.Assign)
    and any(isinstance(t,ast.Name) and t.id=="swift_source" for t in n.targets)
    and isinstance(n.value,ast.Constant)
    and isinstance(n.value.value,str)
]
if len(nodes) != 1:
    raise SystemExit("未找到唯一的 Swift 窗口源码，未修改项目。")
node = nodes[0]
swift = node.value.value

if "// CG50 SETTINGS V2" not in swift:
    if "// CG50 SETTINGS V1" in swift:
        raise SystemExit("检测到另一版 Mac 设置代码，未修改项目。")
    anchor = 'configuration.userContentController.add(self, name: "native")'
    handler = (
        r'func\s+userContentController\s*\([\s\S]*?'
        r'didReceive\s+message\s*:\s*WKScriptMessage\s*\)\s*\{'
    )
    if swift.count(anchor) != 1 or len(re.findall(handler,swift)) != 1:
        raise SystemExit("Mac 消息接口与预期不同，未修改项目。")
    imports = list(re.finditer(r"(?m)^import[ \t]+[^\n]+(?:\n|$)",swift))
    if not imports:
        raise SystemExit("未找到 Swift 导入位置，未修改项目。")

    for key in native_words:
        literal = json.dumps(key,ensure_ascii=False)
        swift = swift.replace(literal,"cg50UIText("+literal+")")
    swift = re.sub(
        r"(\.messageText\s*=\s*)title\b",
        r"\1cg50UIText(title)",swift
    )
    swift = re.sub(
        r"(\.informativeText\s*=\s*)text\b",
        r"\1cg50UIText(text)",swift
    )
    swift = swift.replace(
        ">正在启动 CG50…<",r'>\(cg50UIText("正在启动 CG50…"))<'
    )
    swift = swift.replace(
        anchor,
        anchor+"\n            cg50InstallPreferences(configuration.userContentController)",1
    )
    swift = re.sub(handler,lambda m:m.group(0)+"\n"+receive,swift,count=1)
    imports = list(re.finditer(r"(?m)^import[ \t]+[^\n]+(?:\n|$)",swift))
    position = imports[-1].end()
    swift = swift[:position]+"\n"+native+swift[position:]

    lines = source.splitlines(keepends=True)
    source = (
        "".join(lines[:node.lineno-1])+
        "swift_source = "+repr(swift)+"\n"+
        "".join(lines[node.end_lineno:])
    )

for old in ("0.1.1","0.1.2"):
    for quote in ('"',"'"):
        source = source.replace(quote+old+quote,quote+"0.1.3"+quote)
source = re.sub(
    r'''(["']CFBundleVersion["']\s*:\s*["'])[23](["'])''',
    r"\g<1>4\2",source
)
ast.parse(source)

stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S-%f")
backup = root/"ui-backups"/("settings-"+stamp)
backup.mkdir(parents=True)
for p in original:
    shutil.copy2(p,backup/p.name)

def write_atomic(path,text):
    temporary = path.with_name(path.name+".settings-tmp")
    temporary.write_text(text)
    temporary.replace(path)

print("原文件已备份：",backup,flush=True)
try:
    write_atomic(page,html)
    write_atomic(builder,source)
    print("设置界面已写入，开始编译并生成安装包……",flush=True)
    subprocess.run([sys.executable,str(builder)],cwd=root,check=True)
except BaseException:
    for p,text in original.items():
        write_atomic(p,text)
    print("构建未完成，源码已恢复；现有软件和进度未修改。",flush=True)
    raise

print("\n安装包已生成。退出 CG50 Pro Max，再安装新 PKG。")
print("首次使用默认 English 和 Automatic；修改后的设置会保留。")
