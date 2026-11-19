# 公开版结构

界面由 HTML/CSS、计算器机身图片、透明按键热区与 Canvas 屏幕组成。大屏和机身屏使用同一帧模拟器图像，主窗口的背景、边框、圆角及阴影由 CSS 绘制。

- `web/index.html`：界面、设置、键盘映射及触控热区。
- `web/ipad-adapter.js`：浏览器侧接口适配、进度管理、生命周期与单窗口保护。
- `web/worker.js`：在 Worker 中调用 Go/WASM 模拟器。
- `web/cg50-display.js`：Canvas 屏幕绘制。
- `web/cg50-update.js`、`web/sw.js`：资源缓存、完整性检查及更新切换。
- `web/cg50-factory-reset.js`：恢复初始状态流程。
- `web/reset-manifest.json`：运行资源列表、大小与 SHA-256。
- `server/start.mjs`：公开资源静态服务及健康检查，不使用 SQLite。

计算和进度存储主要在访问者浏览器内完成。公开版没有访问统计采集脚本、统计页面或统计/管理接口；本地保存会使用浏览器 IndexedDB，语言和主题等偏好会使用浏览器本地存储。这不代表托管平台或网络基础设施绝不会记录常规访问日志。

当前公开版由部署版本 1.3.4 派生，去除私有运维部分后使用独立发布标识。GitHub 中的代码整理与现有正式站的上线是两个独立操作。
