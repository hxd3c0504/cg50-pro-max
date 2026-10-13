from pathlib import Path
import os
import sys
import re
import time
import gzip
import shutil
import platform
import tempfile
import subprocess
import plistlib
import datetime
import urllib.request

root = Path(__file__).resolve().parent
emu = root / "emu_go"
flash = root / "os/flash_dump/flash_full.bin"
state = root / "os/flash_dump/cg50_state.bin"

def run(args, **kwargs):
    subprocess.run([str(x) for x in args], check=True, **kwargs)

if sys.platform != "darwin" or platform.machine() != "arm64":
    raise SystemExit("这一版需要在 M 系列 Mac 上制作。")
if not (emu / "main.go").is_file():
    raise SystemExit("没有找到模拟器源代码。")
if not flash.is_file() or flash.stat().st_size != 33554432:
    raise SystemExit("没有找到 32 MiB 完整固件。")
if not state.is_file():
    raise SystemExit("先在现有模拟器网页里点“保存进度”，再执行。")
with gzip.open(state, "rb") as f:
    if f.read(8) != b"CG50ST01":
        raise SystemExit("存档格式与预期不同，请把这条提示发给我。")

go = shutil.which("go")
if not go and Path("/opt/homebrew/bin/go").is_file():
    go = "/opt/homebrew/bin/go"
if not go:
    raise SystemExit("制作电脑缺少 Go，请执行：brew install go")
try:
    subprocess.check_output(
        ["/usr/bin/xcrun", "--find", "swiftc"],
        stderr=subprocess.STDOUT
    )
    sdk = subprocess.check_output(
        ["/usr/bin/xcrun", "--sdk", "macosx", "--show-sdk-path"],
        text=True
    ).strip()
except subprocess.CalledProcessError:
    raise SystemExit("制作电脑缺少苹果编译工具，请执行：xcode-select --install")

swift_source = r'''
import Cocoa
import WebKit
import Darwin

final class Delegate: NSObject, NSApplicationDelegate,
    NSWindowDelegate, WKNavigationDelegate, WKScriptMessageHandler {

    let fm = FileManager.default
    var window: NSWindow!
    var web: WKWebView!
    var core: Process?
    var output: Pipe?
    var log: FileHandle?
    var timer: Timer?
    var server: URL?
    var buffer = ""
    var quitting = false
    var saving = false
    var lockFD: Int32 = -1

    var dataFolder: URL {
        fm.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("CG50Teaching", isDirectory: true)
    }

    func alert(_ title: String, _ text: String) {
        let a = NSAlert()
        a.messageText = title
        a.informativeText = text
        a.addButton(withTitle: "好")
        a.runModal()
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        do {
            try fm.createDirectory(
                at: dataFolder, withIntermediateDirectories: true
            )
            lockFD = Darwin.open(
                dataFolder.appendingPathComponent("app.lock").path,
                O_CREAT | O_RDWR | O_EXLOCK | O_NONBLOCK | O_CLOEXEC, 0o600
            )
            guard lockFD >= 0 else {
                throw NSError(
                    domain: "CG50", code: 1,
                    userInfo: [NSLocalizedDescriptionKey:
                        "已有一个 CG50 教学窗口正在运行。"]
                )
            }

            // 从应用包自动初始化，不需要用户导入任何文件。
            for name in ["flash_full.bin", "cg50_state.bin"] {
                let destination = dataFolder.appendingPathComponent(name)
                if !fm.fileExists(atPath: destination.path) {
                    guard let resource = Bundle.main.resourceURL else {
                        throw NSError(
                            domain: "CG50", code: 2,
                            userInfo: [NSLocalizedDescriptionKey:
                                "安装包缺少资源目录。"]
                        )
                    }
                    let bytes = try Data(
                        contentsOf: resource.appendingPathComponent(name)
                    )
                    try bytes.write(to: destination, options: .atomic)
                }
            }
            let flash = dataFolder.appendingPathComponent("flash_full.bin")
            let attributes = try fm.attributesOfItem(atPath: flash.path)
            guard (attributes[.size] as? NSNumber)?.intValue == 33554432 else {
                throw NSError(
                    domain: "CG50", code: 3,
                    userInfo: [NSLocalizedDescriptionKey:
                        "本机固件文件大小异常。"]
                )
            }

            makeMenu()
            let configuration = WKWebViewConfiguration()
            configuration.preferences.isElementFullscreenEnabled = true
            configuration.userContentController.add(self, name: "native")
            let bridge = """
            document.addEventListener('click',function(e){
              if(e.target.closest('#fullscreen')){
                e.preventDefault();e.stopImmediatePropagation();
                window.webkit.messageHandlers.native.postMessage('fullscreen');
              }else if(e.target.closest('#capture')){
                e.preventDefault();e.stopImmediatePropagation();
                window.webkit.messageHandlers.native.postMessage('capture');
              }
            },true);
            """
            configuration.userContentController.addUserScript(
                WKUserScript(
                    source: bridge,
                    injectionTime: .atDocumentStart,
                    forMainFrameOnly: true
                )
            )
            web = WKWebView(frame: .zero, configuration: configuration)
            web.navigationDelegate = self
            let visible = NSScreen.main?.visibleFrame ??
                NSRect(x: 0, y: 0, width: 1400, height: 900)
            window = NSWindow(
                contentRect: NSRect(
                    x: 0, y: 0,
                    width: min(1360, visible.width - 50),
                    height: min(820, visible.height - 50)
                ),
                styleMask: [.titled, .closable, .miniaturizable, .resizable],
                backing: .buffered, defer: false
            )
            window.title = "CG50 Teaching"
            window.minSize = NSSize(width: 800, height: 580)
            window.contentView = web
            window.delegate = self
            window.isReleasedWhenClosed = false
            window.center()
            window.makeKeyAndOrderFront(nil)
            NSApp.activate(ignoringOtherApps: true)
            web.loadHTMLString(
                "<html><body style='font:24px -apple-system;padding:50px;background:#eef2f6'>正在启动 CG50…</body></html>",
                baseURL: nil
            )
            try launchCore(flash)
        } catch {
            alert("启动失败", error.localizedDescription)
            quitting = true
            NSApp.terminate(nil)
        }
    }

    func makeMenu() {
        let menu = NSMenu()
        let appItem = NSMenuItem()
        menu.addItem(appItem)
        let appMenu = NSMenu()
        appMenu.addItem(
            withTitle: "关于 CG50 Teaching",
            action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)),
            keyEquivalent: ""
        )
        appMenu.addItem(.separator())
        appMenu.addItem(
            withTitle: "退出 CG50 Teaching",
            action: #selector(NSApplication.terminate(_:)),
            keyEquivalent: "q"
        )
        appItem.submenu = appMenu

        let editItem = NSMenuItem()
        menu.addItem(editItem)
        let edit = NSMenu(title: "编辑")
        for (title, action, key) in [
            ("剪切", "cut:", "x"), ("复制", "copy:", "c"),
            ("粘贴", "paste:", "v"), ("全选", "selectAll:", "a")
        ] {
            edit.addItem(
                withTitle: title,
                action: Selector(action), keyEquivalent: key
            )
        }
        editItem.submenu = edit

        let teachingItem = NSMenuItem()
        menu.addItem(teachingItem)
        let teaching = NSMenu(title: "教学")
        let save = teaching.addItem(
            withTitle: "保存进度",
            action: #selector(saveProgress(_:)), keyEquivalent: "s"
        )
        save.target = self
        let capture = teaching.addItem(
            withTitle: "保存屏幕图片",
            action: #selector(captureScreen(_:)), keyEquivalent: "s"
        )
        capture.target = self
        capture.keyEquivalentModifierMask = [.command, .shift]
        let full = teaching.addItem(
            withTitle: "全屏投屏",
            action: #selector(fullscreen(_:)), keyEquivalent: "f"
        )
        full.target = self
        full.keyEquivalentModifierMask = [.command, .control]
        teachingItem.submenu = teaching
        NSApp.mainMenu = menu
    }

    func launchCore(_ flash: URL) throws {
        let logURL = dataFolder.appendingPathComponent("emulator.log")
        fm.createFile(atPath: logURL.path, contents: nil)
        log = try FileHandle(forWritingTo: logURL)
        let p = Process()
        p.executableURL = Bundle.main.executableURL!
            .deletingLastPathComponent()
            .appendingPathComponent("cg50-core")
        p.arguments = ["0", "30000", "web", "0"]
        p.currentDirectoryURL = dataFolder
        var environment = ProcessInfo.processInfo.environment
        environment["CG50_MANUAL_BOOT"] = "1"
        environment["CG50_FLASH"] = flash.path
        environment["CG50_STATE"] =
            dataFolder.appendingPathComponent("cg50_state.bin").path
        environment["CG50_DESKTOP_PARENT"] =
            String(ProcessInfo.processInfo.processIdentifier)
        p.environment = environment

        let pipe = Pipe()
        output = pipe
        p.standardOutput = pipe
        p.standardError = pipe
        p.standardInput = FileHandle.nullDevice
        pipe.fileHandleForReading.readabilityHandler = {
            [weak self] handle in
            let data = handle.availableData
            if data.isEmpty {
                handle.readabilityHandler = nil
                return
            }
            DispatchQueue.main.async { self?.receive(data) }
        }
        p.terminationHandler = { [weak self] process in
            DispatchQueue.main.async {
                guard let self = self, !self.quitting else { return }
                self.timer?.invalidate()
                self.alert(
                    "模拟器已停止",
                    "日志：\n\(self.dataFolder.appendingPathComponent("emulator.log").path)\n退出状态：\(process.terminationStatus)"
                )
                self.quitting = true
                NSApp.terminate(nil)
            }
        }
        core = p
        try p.run()
        timer = Timer.scheduledTimer(
            withTimeInterval: 30, repeats: false
        ) { [weak self] _ in
            guard let self = self, self.server == nil else { return }
            self.alert(
                "启动超时",
                "日志：\n\(self.dataFolder.appendingPathComponent("emulator.log").path)"
            )
            self.quitting = true
            NSApp.terminate(nil)
        }
    }

    func receive(_ data: Data) {
        log?.write(data)
        buffer += String(decoding: data, as: UTF8.self)
        if buffer.count > 65536 {
            buffer = String(buffer.suffix(32768))
        }
        let completed = buffer.components(separatedBy: "\n")
            .dropLast().joined(separator: "\n")
        guard server == nil,
              let range = completed.range(
                of: #"http://127\.0\.0\.1:[0-9]+"#,
                options: .regularExpression
              ),
              let address = URL(string: String(completed[range])) else {
            return
        }
        server = address
        timer?.invalidate()
        web.load(URLRequest(url: address))
    }

    func webView(
        _ webView: WKWebView, didFinish navigation: WKNavigation!
    ) {
        window.makeFirstResponder(webView)
        webView.evaluateJavaScript(
            "document.body.tabIndex=-1;document.body.focus();",
            completionHandler: nil
        )
    }

    func applicationShouldHandleReopen(
        _ sender: NSApplication, hasVisibleWindows flag: Bool
    ) -> Bool {
        window?.makeKeyAndOrderFront(nil)
        return true
    }

    func windowShouldClose(_ sender: NSWindow) -> Bool {
        NSApp.terminate(nil)
        return false
    }

    func save(_ completion: @escaping (String?) -> Void) {
        guard let server = server else {
            completion("模拟器尚未启动")
            return
        }
        var request = URLRequest(
            url: server.appendingPathComponent("save"),
            timeoutInterval: 8
        )
        request.httpMethod = "POST"
        URLSession.shared.dataTask(with: request) {
            data, response, error in
            let text = data.flatMap {
                String(data: $0, encoding: .utf8)
            }
            let ok = (response as? HTTPURLResponse)?.statusCode == 200
                && text == "state saved"
            DispatchQueue.main.async {
                completion(
                    ok ? nil :
                    (error?.localizedDescription ?? text ?? "保存失败")
                )
            }
        }.resume()
    }

    @objc func saveProgress(_ sender: Any?) {
        save { [weak self] error in
            self?.alert(
                error == nil ? "已保存进度" : "保存失败",
                error ?? "下次启动会从此处继续。"
            )
        }
    }

    @objc func fullscreen(_ sender: Any?) {
        window.toggleFullScreen(nil)
    }

    @objc func captureScreen(_ sender: Any?) {
        guard let server = server else { return }
        let panel = NSSavePanel()
        panel.nameFieldStringValue = "CG50-screen.png"
        guard panel.runModal() == .OK,
              let destination = panel.url else { return }
        let request = URLRequest(
            url: server.appendingPathComponent("frame"),
            timeoutInterval: 8
        )
        URLSession.shared.dataTask(with: request) {
            [weak self] data, response, error in
            do {
                guard error == nil, let data = data,
                      (response as? HTTPURLResponse)?.statusCode == 200
                else {
                    throw error ?? NSError(
                        domain: "CG50", code: 4,
                        userInfo: [NSLocalizedDescriptionKey:
                            "无法获取屏幕图片"]
                    )
                }
                try data.write(to: destination, options: .atomic)
            } catch {
                DispatchQueue.main.async {
                    self?.alert("保存图片失败", error.localizedDescription)
                }
            }
        }.resume()
    }

    func userContentController(
        _ controller: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        if message.body as? String == "fullscreen" {
            fullscreen(nil)
        }
        if message.body as? String == "capture" {
            captureScreen(nil)
        }
    }

    func applicationShouldTerminate(
        _ sender: NSApplication
    ) -> NSApplication.TerminateReply {
        if quitting || core?.isRunning != true || server == nil {
            return .terminateNow
        }
        if saving { return .terminateCancel }
        saving = true
        web.evaluateJavaScript(
            "if(typeof releaseAll==='function') releaseAll();",
            completionHandler: nil
        )
        save { [weak self] error in
            guard let self = self else { return }
            self.saving = false
            if let error = error {
                let a = NSAlert()
                a.messageText = "退出前未能保存进度"
                a.informativeText =
                    "\(error)\n已保存的进度仍在；继续退出会丢失尚未保存的操作。"
                a.addButton(withTitle: "取消退出")
                a.addButton(withTitle: "仍然退出")
                self.quitting =
                    a.runModal() == .alertSecondButtonReturn
            } else {
                self.quitting = true
            }
            NSApp.reply(toApplicationShouldTerminate: self.quitting)
        }
        return .terminateLater
    }

    func applicationWillTerminate(_ notification: Notification) {
        quitting = true
        timer?.invalidate()
        if let p = core, p.isRunning {
            p.terminate()
            let deadline = Date().addingTimeInterval(1)
            while p.isRunning && Date() < deadline {
                Thread.sleep(forTimeInterval: 0.02)
            }
            if p.isRunning {
                Darwin.kill(p.processIdentifier, SIGKILL)
            }
        }
        output?.fileHandleForReading.readabilityHandler = nil
        log?.closeFile()
        if lockFD >= 0 { Darwin.close(lockFD) }
    }
}

let app = NSApplication.shared
let delegate = Delegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
'''

watchdog = r'''package main
import (
    "os"
    "strconv"
    "time"
)
func init() {
    parent, err := strconv.Atoi(os.Getenv("CG50_DESKTOP_PARENT"))
    if err != nil || parent <= 0 {
        return
    }
    go func() {
        ticker := time.NewTicker(2 * time.Second)
        defer ticker.Stop()
        for range ticker.C {
            if os.Getppid() != parent {
                os.Exit(0)
            }
        }
    }()
}
'''

stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S-%f")
output = root / "dist" / ("standalone-mac-" + stamp)

with tempfile.TemporaryDirectory(prefix="cg50-standalone-") as folder:
    work = Path(folder)
    source = work / "source"
    shutil.copytree(emu, source)
    (source / "zz_desktop_parent.go").write_text(watchdog)

    web = source / "webui.go"
    text = web.read_text()
    if "CG50_MANUAL_BOOT" not in text:
        old = "\tif !resumed {\n\t\tfor i, k := range menuSeq {"
        new = '\tif !resumed && os.Getenv("CG50_MANUAL_BOOT") == "" {\n\t\tfor i, k := range menuSeq {'
        if old not in text:
            raise SystemExit("找不到启动保护位置，请把这条提示发给我。")
        web.write_text(text.replace(old, new, 1))

    payload = work / "payload"
    app = payload / "Applications/CG50Teaching.app"
    binaries = app / "Contents/MacOS"
    resources = app / "Contents/Resources"
    binaries.mkdir(parents=True)
    resources.mkdir(parents=True)

    print("1/5 编译模拟器及现有界面…", flush=True)
    env = os.environ.copy()
    env.update({
        "GOOS": "darwin", "GOARCH": "arm64",
        "CGO_ENABLED": "0", "GOTOOLCHAIN": "local",
        "MACOSX_DEPLOYMENT_TARGET": "13.0",
    })
    core = binaries / "cg50-core"
    run([
        go, "build", "-trimpath", "-ldflags=-s -w",
        "-o", core, "."
    ], cwd=source, env=env)

    print("2/5 编译 Mac 窗口…", flush=True)
    swift = work / "main.swift"
    swift.write_text(swift_source)
    run([
        "/usr/bin/xcrun", "swiftc",
        "-swift-version", "5", "-O",
        "-sdk", sdk, "-target", "arm64-apple-macos13.0",
        "-framework", "Cocoa", "-framework", "WebKit",
        swift, "-o", binaries / "CG50Teaching"
    ])

    minimum = "13.0"
    macho = subprocess.check_output(
        ["/usr/bin/otool", "-l", str(core)], text=True
    )
    def version_tuple(v):
        return tuple((list(map(int, v.split("."))) + [0, 0])[:3])
    for v in re.findall(r"\bminos\s+(\d+(?:\.\d+)*)", macho):
        if version_tuple(v) > version_tuple(minimum):
            minimum = v

    print("3/5 将固件和初始存档放进应用包…", flush=True)
    shutil.copy2(flash, resources / "flash_full.bin")
    shutil.copy2(state, resources / "cg50_state.bin")

    info = {
        "CFBundleName": "CG50Teaching",
        "CFBundleDisplayName": "CG50 教学",
        "CFBundleIdentifier": "local.cg50.teaching",
        "CFBundleExecutable": "CG50Teaching",
        "CFBundlePackageType": "APPL",
        "CFBundleShortVersionString": "0.1.1",
        "CFBundleVersion": "2",
        "LSMinimumSystemVersion": minimum,
        "NSHighResolutionCapable": True,
        "NSHumanReadableCopyright":
            "Based on hexbinoct/casio-cg50. 非 CASIO 官方应用。",
        "NSAppTransportSecurity": {
            "NSAllowsLocalNetworking": True,
            "NSAllowsArbitraryLoadsInWebContent": True,
        },
    }
    with (app / "Contents/Info.plist").open("wb") as f:
        plistlib.dump(info, f)
    for pattern in ("LICENSE*", "COPYING*", "NOTICE*"):
        for p in root.glob(pattern):
            if p.is_file():
                shutil.copy2(p, resources / p.name)
    (resources / "Project.txt").write_text(
        "https://github.com/hexbinoct/casio-cg50\n"
    )

    print("4/5 本地签名，检查屏幕和存档…", flush=True)
    run(["/usr/bin/codesign", "--force", "--sign", "-", core])
    run(["/usr/bin/codesign", "--force", "--sign", "-", app])
    run([
        "/usr/bin/codesign", "--verify", "--deep",
        "--strict", "--verbose=2", app
    ])

    test_state = work / "test-state.bin"
    shutil.copy2(resources / "cg50_state.bin", test_state)
    test_env = os.environ.copy()
    test_env.update({
        "CG50_MANUAL_BOOT": "1",
        "CG50_FLASH": str(resources / "flash_full.bin"),
        "CG50_STATE": str(test_state),
        "CG50_DESKTOP_PARENT": str(os.getpid()),
    })
    log_path = work / "test.log"
    with log_path.open("wb") as log:
        process = subprocess.Popen(
            [str(core), "0", "30000", "web", "0"],
            cwd=work, env=test_env, stdout=log, stderr=subprocess.STDOUT
        )
        try:
            address = None
            for _ in range(120):
                if process.poll() is not None:
                    raise RuntimeError("模拟器提前退出。")
                text = log_path.read_text(errors="replace")
                completed = text.rsplit("\n", 1)[0] if "\n" in text else ""
                match = re.search(
                    r"http://127\.0\.0\.1:\d+", completed
                )
                if match:
                    address = match.group(0)
                    break
                time.sleep(0.25)
            if not address:
                raise RuntimeError("启动超时。")
            with urllib.request.urlopen(
                address + "/frame", timeout=8
            ) as response:
                if response.read(8) != b"\x89PNG\r\n\x1a\n":
                    raise RuntimeError("屏幕输出检查失败。")
            request = urllib.request.Request(
                address + "/save", data=b"", method="POST"
            )
            with urllib.request.urlopen(
                request, timeout=12
            ) as response:
                if response.read().decode().strip() != "state saved":
                    raise RuntimeError("保存进度检查失败。")
        except Exception:
            print(log_path.read_text(errors="replace")[-4000:])
            raise
        finally:
            if process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()

    print("5/5 生成单一 PKG 安装包…", flush=True)
    pkg = work / "CG50Teaching-Mac.pkg"
    run([
        "/usr/bin/pkgbuild",
        "--root", payload,
        "--install-location", "/",
        "--identifier", "local.cg50.teaching",
        "--version", "0.1.1",
        pkg
    ])
    output.mkdir(parents=True)
    shutil.copy2(pkg, output / pkg.name)

print("\n打包完成：", output / "CG50Teaching-Mac.pkg")
print("使用者只需要这个 PKG 文件。")
print("最低 macOS 版本：", minimum)
print("安装后：应用程序 → CG50Teaching")
subprocess.run(["/usr/bin/open", str(output)])
