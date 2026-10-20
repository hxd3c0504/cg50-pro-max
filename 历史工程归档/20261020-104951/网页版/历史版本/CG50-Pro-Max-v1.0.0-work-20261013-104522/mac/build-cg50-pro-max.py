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

# CG50 RELEASE PROFILE CHECK
from cg50_release_profile import verify_release_profile
verify_release_profile(flash, state)


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

swift_source = '\nimport Cocoa\nimport WebKit\nimport Darwin\n\n\n// CG50 COMPACT V1\nvar cg50WideFrame: NSRect?\nvar cg50WindowIsCompact = false\nvar cg50RequestedCompact = false\nvar cg50FullscreenObserver: NSObjectProtocol?\n\nfunc cg50InstallCompactPreference(_ controller: WKUserContentController) {\n    UserDefaults.standard.register(defaults: ["cg50.compact": false, "cg50.language": "zh"])\n    let value = UserDefaults.standard.bool(forKey: "cg50.compact") ? "true" : "false"\n    let source = "/*cg50-compact*/window.CG50NativeCompact=" + value + ";"\n    let kept = controller.userScripts.filter {\n        !$0.source.hasPrefix("/*cg50-compact*/")\n    }\n    controller.removeAllUserScripts()\n    kept.forEach { controller.addUserScript($0) }\n    controller.addUserScript(WKUserScript(\n        source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true\n    ))\n}\n\nfunc cg50SetCompact(_ enabled: Bool, _ view: WKWebView) {\n    guard let window = view.window else { return }\n    cg50RequestedCompact = enabled\n    UserDefaults.standard.set(enabled, forKey: "cg50.compact")\n    cg50InstallCompactPreference(view.configuration.userContentController)\n    if enabled == cg50WindowIsCompact { return }\n    if enabled && window.styleMask.contains(.fullScreen) {\n        if cg50FullscreenObserver == nil {\n            cg50FullscreenObserver = NotificationCenter.default.addObserver(\n                forName: NSWindow.didExitFullScreenNotification,\n                object: window, queue: .main\n            ) { [weak view] _ in\n                if let token = cg50FullscreenObserver {\n                    NotificationCenter.default.removeObserver(token)\n                    cg50FullscreenObserver = nil\n                }\n                if let view = view {\n                    cg50SetCompact(cg50RequestedCompact, view)\n                }\n            }\n            window.toggleFullScreen(nil)\n        }\n        return\n    }\n    let visible = window.screen?.visibleFrame\n        ?? NSScreen.main?.visibleFrame\n        ?? NSRect(x: 0, y: 0, width: 1280, height: 900)\n    let old = window.frame\n    if enabled {\n        cg50WideFrame = old\n        window.minSize = NSSize(width: 320, height: 560)\n        let width = min(CGFloat(380), visible.width)\n        let height = min(CGFloat(860), visible.height)\n        let x = max(visible.minX, min(old.minX, visible.maxX - width))\n        let y = max(visible.minY, min(old.maxY - height, visible.maxY - height))\n        window.setFrame(\n            NSRect(x: x, y: y, width: width, height: height),\n            display: window.isVisible, animate: window.isVisible\n        )\n    } else {\n        window.minSize = NSSize(width: 800, height: 580)\n        let frame = cg50WideFrame ?? NSRect(\n            x: visible.minX, y: visible.minY,\n            width: min(1360, visible.width),\n            height: min(820, visible.height)\n        )\n        window.setFrame(\n            window.constrainFrameRect(frame, to: window.screen),\n            display: window.isVisible, animate: window.isVisible\n        )\n    }\n    cg50WindowIsCompact = enabled\n}\n\n\n\n// CG50 SETTINGS V2\nlet cg50UITranslations: [String: String] = [\n    "关于 CG50 Pro Max": "About CG50 Pro Max",\n    "退出 CG50 Pro Max": "Quit CG50 Pro Max",\n    "关于 CG50 Teaching": "About CG50 Pro Max",\n    "退出 CG50 Teaching": "Quit CG50 Pro Max",\n    "编辑": "Edit",\n    "教学": "Teaching",\n    "剪切": "Cut",\n    "复制": "Copy",\n    "粘贴": "Paste",\n    "全选": "Select All",\n    "保存进度": "Save progress",\n    "保存屏幕图片": "Save screen image",\n    "全屏投屏": "Fullscreen",\n    "启动失败": "Startup failed",\n    "模拟器已停止": "Emulator stopped",\n    "启动超时": "Startup timed out",\n    "模拟器尚未启动": "The emulator has not started.",\n    "已保存进度": "Progress saved",\n    "保存失败": "Save failed",\n    "下次启动会从此处继续。": "The next launch will resume from here.",\n    "下次启动会从这里继续。": "The next launch will resume from here.",\n    "无法获取屏幕图片": "Could not retrieve the screen image.",\n    "保存图片失败": "Could not save the image",\n    "退出前未能保存进度": "Could not save before quitting",\n    "取消退出": "Cancel",\n    "仍然退出": "Quit anyway",\n    "好": "OK",\n    "确定": "OK",\n    "正在启动 CG50…": "Starting CG50…"\n]\nfunc cg50UIText(_ text: String) -> String {\n    if (UserDefaults.standard.string(forKey: "cg50.language") ?? "zh") == "zh" {\n        return cg50UITranslations.first(where: { $0.value == text })?.key ?? text\n    }\n    return cg50UITranslations[text] ?? text\n}\nfunc cg50InstallPreferences(_ controller: WKUserContentController) {\n    let defaults = UserDefaults.standard\n    let rawLanguage = defaults.string(forKey: "cg50.language") ?? "zh"\n    let rawTheme = defaults.string(forKey: "cg50.theme") ?? "system"\n    let language = ["en", "zh"].contains(rawLanguage) ? rawLanguage : "zh"\n    let theme = ["system", "light", "dark"].contains(rawTheme) ? rawTheme : "system"\n    let values: [String: String] = ["language": language, "theme": theme]\n    let data = try! JSONSerialization.data(withJSONObject: values)\n    let source = "/*cg50-settings*/window.CG50NativePrefs=" + String(decoding: data, as: UTF8.self) + ";"\n    let kept = controller.userScripts.filter {\n        !$0.source.hasPrefix("/*cg50-settings*/")\n    }\n    controller.removeAllUserScripts()\n    kept.forEach { controller.addUserScript($0) }\n    controller.addUserScript(WKUserScript(\n        source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true\n    ))\n    switch theme {\n    case "dark": NSApp.appearance = NSAppearance(named: .darkAqua)\n    case "light": NSApp.appearance = NSAppearance(named: .aqua)\n    default: NSApp.appearance = nil\n    }\n    func translateMenu(_ menu: NSMenu) {\n        menu.title = cg50UIText(menu.title)\n        for item in menu.items {\n            item.title = cg50UIText(item.title)\n            if let submenu = item.submenu { translateMenu(submenu) }\n        }\n    }\n    if let menu = NSApp.mainMenu { translateMenu(menu) }\n}\n\n\nfinal class Delegate: NSObject, NSApplicationDelegate,\n    NSWindowDelegate, WKNavigationDelegate, WKScriptMessageHandler {\n\n    let fm = FileManager.default\n    var window: NSWindow!\n    var web: WKWebView!\n    var core: Process?\n    var output: Pipe?\n    var log: FileHandle?\n    var timer: Timer?\n    var server: URL?\n    var buffer = ""\n    var quitting = false\n    var saving = false\n    var lockFD: Int32 = -1\n\n    var dataFolder: URL {\n        fm.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]\n            .appendingPathComponent("CG50Teaching", isDirectory: true)\n    }\n\n    func alert(_ title: String, _ text: String) {\n        let a = NSAlert()\n        a.messageText = cg50UIText(title)\n        a.informativeText = cg50UIText(text)\n        a.addButton(withTitle: cg50UIText("好"))\n        a.runModal()\n    }\n\n    func applicationDidFinishLaunching(_ notification: Notification) {\n        do {\n            try fm.createDirectory(\n                at: dataFolder, withIntermediateDirectories: true\n            )\n            lockFD = Darwin.open(\n                dataFolder.appendingPathComponent("app.lock").path,\n                O_CREAT | O_RDWR | O_EXLOCK | O_NONBLOCK | O_CLOEXEC, 0o600\n            )\n            guard lockFD >= 0 else {\n                throw NSError(\n                    domain: "CG50", code: 1,\n                    userInfo: [NSLocalizedDescriptionKey:\n                        "已有一个 CG50 教学窗口正在运行。"]\n                )\n            }\n\n            // 从应用包自动初始化，不需要用户导入任何文件。\n            for name in ["flash_full.bin", "cg50_state.bin"] {\n                let destination = dataFolder.appendingPathComponent(name)\n                if !fm.fileExists(atPath: destination.path) {\n                    guard let resource = Bundle.main.resourceURL else {\n                        throw NSError(\n                            domain: "CG50", code: 2,\n                            userInfo: [NSLocalizedDescriptionKey:\n                                "安装包缺少资源目录。"]\n                        )\n                    }\n                    let bytes = try Data(\n                        contentsOf: resource.appendingPathComponent(name)\n                    )\n                    try bytes.write(to: destination, options: .atomic)\n                }\n            }\n            let flash = dataFolder.appendingPathComponent("flash_full.bin")\n            let attributes = try fm.attributesOfItem(atPath: flash.path)\n            guard (attributes[.size] as? NSNumber)?.intValue == 33554432 else {\n                throw NSError(\n                    domain: "CG50", code: 3,\n                    userInfo: [NSLocalizedDescriptionKey:\n                        "本机固件文件大小异常。"]\n                )\n            }\n\n            makeMenu()\n            let configuration = WKWebViewConfiguration()\n            configuration.preferences.isElementFullscreenEnabled = true\n            configuration.userContentController.add(self, name: "native")\n            cg50InstallCompactPreference(configuration.userContentController)\n            cg50InstallPreferences(configuration.userContentController)\n            let bridge = """\n            document.addEventListener(\'click\',function(e){\n              if(e.target.closest(\'#fullscreen\')){\n                e.preventDefault();e.stopImmediatePropagation();\n                window.webkit.messageHandlers.native.postMessage(\'fullscreen\');\n              }else if(e.target.closest(\'#capture\')){\n                e.preventDefault();e.stopImmediatePropagation();\n                window.webkit.messageHandlers.native.postMessage(\'capture\');\n              }\n            },true);\n            """\n            configuration.userContentController.addUserScript(\n                WKUserScript(\n                    source: bridge,\n                    injectionTime: .atDocumentStart,\n                    forMainFrameOnly: true\n                )\n            )\n            web = WKWebView(frame: .zero, configuration: configuration)\n            web.navigationDelegate = self\n            let visible = NSScreen.main?.visibleFrame ??\n                NSRect(x: 0, y: 0, width: 1400, height: 900)\n            window = NSWindow(\n                contentRect: NSRect(\n                    x: 0, y: 0,\n                    width: min(1360, visible.width - 50),\n                    height: min(820, visible.height - 50)\n                ),\n                styleMask: [.titled, .closable, .miniaturizable, .resizable],\n                backing: .buffered, defer: false\n            )\n            window.title = "CG50 Pro Max"\n            window.minSize = NSSize(width: 800, height: 580)\n            window.contentView = web\n            window.delegate = self\n            window.isReleasedWhenClosed = false\n            // CG50 COMPACT STARTUP V2\n            UserDefaults.standard.register(defaults: ["cg50.compact": false, "cg50.language": "zh"])\n            cg50SetCompact(UserDefaults.standard.bool(forKey: "cg50.compact"), web)\n            window.center()\n            window.makeKeyAndOrderFront(nil)\n            NSApp.activate(ignoringOtherApps: true)\n            web.loadHTMLString(\n                "<html><body style=\'font:24px -apple-system;padding:50px;background:#eef2f6\'>\\(cg50UIText("正在启动 CG50…"))</body></html>",\n                baseURL: nil\n            )\n            try launchCore(flash)\n        } catch {\n            alert(cg50UIText("启动失败"), error.localizedDescription)\n            quitting = true\n            NSApp.terminate(nil)\n        }\n    }\n\n    func makeMenu() {\n        let menu = NSMenu()\n        let appItem = NSMenuItem()\n        menu.addItem(appItem)\n        let appMenu = NSMenu()\n        appMenu.addItem(\n            withTitle: cg50UIText("关于 CG50 Pro Max"),\n            action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)),\n            keyEquivalent: ""\n        )\n        appMenu.addItem(.separator())\n        appMenu.addItem(\n            withTitle: cg50UIText("退出 CG50 Pro Max"),\n            action: #selector(NSApplication.terminate(_:)),\n            keyEquivalent: "q"\n        )\n        appItem.submenu = appMenu\n\n        let editItem = NSMenuItem()\n        menu.addItem(editItem)\n        let edit = NSMenu(title: cg50UIText("编辑"))\n        for (title, action, key) in [\n            (cg50UIText("剪切"), "cut:", "x"), (cg50UIText("复制"), "copy:", "c"),\n            (cg50UIText("粘贴"), "paste:", "v"), (cg50UIText("全选"), "selectAll:", "a")\n        ] {\n            edit.addItem(\n                withTitle: title,\n                action: Selector(action), keyEquivalent: key\n            )\n        }\n        editItem.submenu = edit\n\n        let teachingItem = NSMenuItem()\n        menu.addItem(teachingItem)\n        let teaching = NSMenu(title: cg50UIText("教学"))\n        let save = teaching.addItem(\n            withTitle: cg50UIText("保存进度"),\n            action: #selector(saveProgress(_:)), keyEquivalent: "s"\n        )\n        save.target = self\n        let capture = teaching.addItem(\n            withTitle: cg50UIText("保存屏幕图片"),\n            action: #selector(captureScreen(_:)), keyEquivalent: "s"\n        )\n        capture.target = self\n        capture.keyEquivalentModifierMask = [.command, .shift]\n        let full = teaching.addItem(\n            withTitle: cg50UIText("全屏投屏"),\n            action: #selector(fullscreen(_:)), keyEquivalent: "f"\n        )\n        full.target = self\n        full.keyEquivalentModifierMask = [.command, .control]\n        teachingItem.submenu = teaching\n        NSApp.mainMenu = menu\n    }\n\n    func launchCore(_ flash: URL) throws {\n        let logURL = dataFolder.appendingPathComponent("emulator.log")\n        fm.createFile(atPath: logURL.path, contents: nil)\n        log = try FileHandle(forWritingTo: logURL)\n        let p = Process()\n        p.executableURL = Bundle.main.executableURL!\n            .deletingLastPathComponent()\n            .appendingPathComponent("cg50-core")\n        p.arguments = ["0", "30000", "web", "0"]\n        p.currentDirectoryURL = dataFolder\n        var environment = ProcessInfo.processInfo.environment\n        environment["CG50_MANUAL_BOOT"] = "1"\n        environment["CG50_FLASH"] = flash.path\n        environment["CG50_STATE"] =\n            dataFolder.appendingPathComponent("cg50_state.bin").path\n        environment["CG50_DESKTOP_PARENT"] =\n            String(ProcessInfo.processInfo.processIdentifier)\n        p.environment = environment\n\n        let pipe = Pipe()\n        output = pipe\n        p.standardOutput = pipe\n        p.standardError = pipe\n        p.standardInput = FileHandle.nullDevice\n        pipe.fileHandleForReading.readabilityHandler = {\n            [weak self] handle in\n            let data = handle.availableData\n            if data.isEmpty {\n                handle.readabilityHandler = nil\n                return\n            }\n            DispatchQueue.main.async { self?.receive(data) }\n        }\n        p.terminationHandler = { [weak self] process in\n            DispatchQueue.main.async {\n                guard let self = self, !self.quitting else { return }\n                self.timer?.invalidate()\n                self.alert(\n                    cg50UIText("模拟器已停止"),\n                    "日志：\\n\\(self.dataFolder.appendingPathComponent("emulator.log").path)\\n退出状态：\\(process.terminationStatus)"\n                )\n                self.quitting = true\n                NSApp.terminate(nil)\n            }\n        }\n        core = p\n        try p.run()\n        timer = Timer.scheduledTimer(\n            withTimeInterval: 30, repeats: false\n        ) { [weak self] _ in\n            guard let self = self, self.server == nil else { return }\n            self.alert(\n                cg50UIText("启动超时"),\n                "日志：\\n\\(self.dataFolder.appendingPathComponent("emulator.log").path)"\n            )\n            self.quitting = true\n            NSApp.terminate(nil)\n        }\n    }\n\n    func receive(_ data: Data) {\n        log?.write(data)\n        buffer += String(decoding: data, as: UTF8.self)\n        if buffer.count > 65536 {\n            buffer = String(buffer.suffix(32768))\n        }\n        let completed = buffer.components(separatedBy: "\\n")\n            .dropLast().joined(separator: "\\n")\n        guard server == nil,\n              let range = completed.range(\n                of: #"http://127\\.0\\.0\\.1:[0-9]+"#,\n                options: .regularExpression\n              ),\n              let address = URL(string: String(completed[range])) else {\n            return\n        }\n        server = address\n        timer?.invalidate()\n        web.load(URLRequest(url: address))\n    }\n\n    func webView(\n        _ webView: WKWebView, didFinish navigation: WKNavigation!\n    ) {\n        window.makeFirstResponder(webView)\n        webView.evaluateJavaScript(\n            "document.body.tabIndex=-1;document.body.focus();",\n            completionHandler: nil\n        )\n    }\n\n    func applicationShouldHandleReopen(\n        _ sender: NSApplication, hasVisibleWindows flag: Bool\n    ) -> Bool {\n        window?.makeKeyAndOrderFront(nil)\n        return true\n    }\n\n    func windowShouldClose(_ sender: NSWindow) -> Bool {\n        NSApp.terminate(nil)\n        return false\n    }\n\n    func save(_ completion: @escaping (String?) -> Void) {\n        guard let server = server else {\n            completion(cg50UIText("模拟器尚未启动"))\n            return\n        }\n        var request = URLRequest(\n            url: server.appendingPathComponent("save"),\n            timeoutInterval: 8\n        )\n        request.httpMethod = "POST"\n        URLSession.shared.dataTask(with: request) {\n            data, response, error in\n            let text = data.flatMap {\n                String(data: $0, encoding: .utf8)\n            }\n            let ok = (response as? HTTPURLResponse)?.statusCode == 200\n                && text == "state saved"\n            DispatchQueue.main.async {\n                completion(\n                    ok ? nil :\n                    (error?.localizedDescription ?? text ?? cg50UIText("保存失败"))\n                )\n            }\n        }.resume()\n    }\n\n    @objc func saveProgress(_ sender: Any?) {\n        save { [weak self] error in\n            self?.alert(\n                error == nil ? cg50UIText("已保存进度") : cg50UIText("保存失败"),\n                error ?? cg50UIText("下次启动会从此处继续。")\n            )\n        }\n    }\n\n    @objc func fullscreen(_ sender: Any?) {\n        window.toggleFullScreen(nil)\n    }\n\n    @objc func captureScreen(_ sender: Any?) {\n        guard let server = server else { return }\n        let panel = NSSavePanel()\n        panel.nameFieldStringValue = "CG50-screen.png"\n        guard panel.runModal() == .OK,\n              let destination = panel.url else { return }\n        let request = URLRequest(\n            url: server.appendingPathComponent("frame"),\n            timeoutInterval: 8\n        )\n        URLSession.shared.dataTask(with: request) {\n            [weak self] data, response, error in\n            do {\n                guard error == nil, let data = data,\n                      (response as? HTTPURLResponse)?.statusCode == 200\n                else {\n                    throw error ?? NSError(\n                        domain: "CG50", code: 4,\n                        userInfo: [NSLocalizedDescriptionKey:\n                            cg50UIText("无法获取屏幕图片")]\n                    )\n                }\n                try data.write(to: destination, options: .atomic)\n            } catch {\n                DispatchQueue.main.async {\n                    self?.alert(cg50UIText("保存图片失败"), error.localizedDescription)\n                }\n            }\n        }.resume()\n    }\n\n    func userContentController(\n        _ controller: WKUserContentController,\n        didReceive message: WKScriptMessage\n    ) {\n\n        if let values = message.body as? [String: Any],\n           values["kind"] as? String == "cg50-compact",\n           let enabled = values["enabled"] as? Bool,\n           let view = message.webView {\n            cg50SetCompact(enabled, view)\n            return\n        }\n\n\n        if let values = message.body as? [String: Any],\n           values["kind"] as? String == "cg50-settings",\n           let language = values["language"] as? String,\n           ["en", "zh"].contains(language),\n           let theme = values["theme"] as? String,\n           ["system", "light", "dark"].contains(theme) {\n            UserDefaults.standard.set(language, forKey: "cg50.language")\n            UserDefaults.standard.set(theme, forKey: "cg50.theme")\n            if let controller = message.webView?.configuration.userContentController {\n                cg50InstallPreferences(controller)\n            }\n            return\n        }\n\n        if message.body as? String == "fullscreen" {\n            fullscreen(nil)\n        }\n        if message.body as? String == "capture" {\n            captureScreen(nil)\n        }\n    }\n\n    func applicationShouldTerminate(\n        _ sender: NSApplication\n    ) -> NSApplication.TerminateReply {\n        if quitting || core?.isRunning != true || server == nil {\n            return .terminateNow\n        }\n        if saving { return .terminateCancel }\n        saving = true\n        web.evaluateJavaScript(\n            "if(typeof releaseAll===\'function\') releaseAll();",\n            completionHandler: nil\n        )\n        save { [weak self] error in\n            guard let self = self else { return }\n            self.saving = false\n            if let error = error {\n                let a = NSAlert()\n                a.messageText = cg50UIText("退出前未能保存进度")\n                a.informativeText =\n                    "\\(error)\\n已保存的进度仍在；继续退出会丢失尚未保存的操作。"\n                a.addButton(withTitle: cg50UIText("取消退出"))\n                a.addButton(withTitle: cg50UIText("仍然退出"))\n                self.quitting =\n                    a.runModal() == .alertSecondButtonReturn\n            } else {\n                self.quitting = true\n            }\n            NSApp.reply(toApplicationShouldTerminate: self.quitting)\n        }\n        return .terminateLater\n    }\n\n    func applicationWillTerminate(_ notification: Notification) {\n        cg50RecordBatteryExit(server)\n        quitting = true\n        timer?.invalidate()\n        if let p = core, p.isRunning {\n            p.terminate()\n            let deadline = Date().addingTimeInterval(1)\n            while p.isRunning && Date() < deadline {\n                Thread.sleep(forTimeInterval: 0.02)\n            }\n            if p.isRunning {\n                Darwin.kill(p.processIdentifier, SIGKILL)\n            }\n        }\n        output?.fileHandleForReading.readabilityHandler = nil\n        log?.closeFile()\n        if lockFD >= 0 { Darwin.close(lockFD) }\n    }\n}\n\n\n// Record the real app-exit time after the existing save-on-quit flow.\nfunc cg50RecordBatteryExit(_ server: URL?) {\n    guard let server = server else { return }\n    var request = URLRequest(\n        url: server.appendingPathComponent("cg50-power/quit"),\n        timeoutInterval: 3\n    )\n    request.httpMethod = "POST"\n    let finished = DispatchSemaphore(value: 0)\n    let task = URLSession.shared.dataTask(with: request) {\n        _, response, error in\n        if error != nil || (response as? HTTPURLResponse)?.statusCode != 200 {\n            NSLog("CG50: could not record battery exit state")\n        }\n        finished.signal()\n    }\n    task.resume()\n    if finished.wait(timeout: .now() + 3.5) == .timedOut {\n        task.cancel()\n        NSLog("CG50: battery exit state request timed out")\n    }\n}\n\nlet app = NSApplication.shared\nlet delegate = Delegate()\napp.delegate = delegate\napp.setActivationPolicy(.regular)\napp.run()\n'

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
output = root / "dist" / "CG50-Pro-Max-v1.0.0-mac-arm64"

with tempfile.TemporaryDirectory(prefix="cg50-standalone-") as folder:
    work = Path(folder)
    source = work / "source"
    shutil.copytree(emu, source)
    (source / "zz_desktop_parent.go").write_text(watchdog)


    teaching_page = source / "teaching.html"
    if teaching_page.is_file():
        page = teaching_page.read_text()
        page = page.replace("CG50 教学演示", "CG50 Pro Max")
        teaching_page.write_text(page)

    web = source / "webui.go"
    text = web.read_text()
    if "CG50_MANUAL_BOOT" not in text:
        old = "\tif !resumed {\n\t\tfor i, k := range menuSeq {"
        new = '\tif !resumed && os.Getenv("CG50_MANUAL_BOOT") == "" {\n\t\tfor i, k := range menuSeq {'
        if old not in text:
            raise SystemExit("找不到启动保护位置，请把这条提示发给我。")
        web.write_text(text.replace(old, new, 1))

    payload = work / "payload"
    app = payload / "Applications/CG50 Pro Max.app"
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
        "CFBundleShortVersionString": '1.0.0',
        "CFBundleVersion": '1.0.0',
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

    icon_source = root / "assets/CG50ProMax.png"
    iconset = work / "CG50ProMax.iconset"
    iconset.mkdir()
    for size in (16, 32, 128, 256, 512):
        for scale in (1, 2):
            pixels = size * scale
            suffix = "@2x" if scale == 2 else ""
            filename = f"icon_{size}x{size}{suffix}.png"
            run([
                "/usr/bin/sips", "-s", "format", "png",
                "-z", pixels, pixels, icon_source,
                "--out", iconset / filename
            ], stdout=subprocess.DEVNULL)
    run([
        "/usr/bin/iconutil", "-c", "icns", iconset,
        "-o", resources / "AppIcon.icns"
    ])
    info_path = app / "Contents/Info.plist"
    with info_path.open("rb") as f:
        metadata = plistlib.load(f)
    metadata.update({
        "CFBundleName": "CG50 Pro Max",
        "CFBundleDisplayName": "CG50 Pro Max",
        "CFBundleIconFile": "AppIcon.icns",
        "CFBundleShortVersionString": '1.0.0',
        "CFBundleVersion": '1.0.0',
    })
    with info_path.open("wb") as f:
        plistlib.dump(metadata, f)

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
    pkg = work / "CG50-Pro-Max-v1.0.0-mac-arm64.pkg"

    components_path = work / "components.plist"
    run([
        "/usr/bin/pkgbuild", "--analyze",
        "--root", payload, components_path
    ])
    with components_path.open("rb") as f:
        components = plistlib.load(f)
    for component in components:
        component["BundleIsRelocatable"] = False
        component["BundleHasStrictIdentifier"] = True
        component["BundleOverwriteAction"] = "upgrade"
    with components_path.open("wb") as f:
        plistlib.dump(components, f)

    install_scripts = work / "installer-scripts"
    install_scripts.mkdir()
    preinstall = install_scripts / "preinstall"
    shutil.copyfile(root / "assets/rename-cg50.sh", preinstall)
    preinstall.chmod(0o755)
    run(["/bin/sh", "-n", preinstall])

    run([
        "/usr/bin/pkgbuild",
        "--root", payload,
        "--component-plist", components_path,
        "--scripts", install_scripts,
        "--install-location", "/",
        "--identifier", "local.cg50.teaching",
        "--version", '1.0.0',
        pkg
    ])
    output.mkdir(parents=True)
    shutil.copy2(pkg, output / pkg.name)

print("\n打包完成：", output / "CG50-Pro-Max-v1.0.0-mac-arm64.pkg")
print("使用者只需要这个 PKG 文件。")
print("最低 macOS 版本：", minimum)
print("安装后：应用程序 → CG50 Pro Max")
subprocess.run(["/usr/bin/open", str(output)])
