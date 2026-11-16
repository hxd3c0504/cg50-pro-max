# CG50 Pro Max 网页版

当前版本：**1.2.5**，releaseId：`v1.2.5-20261116-164234`。

在线使用：https://cg50promax.up.railway.app

## 本地运行

需要 Node.js 24 或更新版本，无需安装第三方 npm 依赖。在本目录运行：

```sh
npm run assets
npm run preview
```

浏览器打开 `http://127.0.0.1:8089/`。不能用 `file://` 直接打开 HTML，否则浏览器会阻止 Worker 启动。可用 `CG50_PREVIEW_PORT` 改端口；预览数据保存到本目录的 `data/local-preview/`。

`npm run assets` 从现有正式站获取 Git 中未收录的 WASM、默认固件和默认状态文件，并核验 `web/reset-manifest.json` 中的大小与 SHA-256。也可自行将相同散列的文件放到对应路径。该步骤依赖源站仍提供对应版本；不匹配时会停止。此目录包含已构建的模拟器，原有 `../ipad/core` 是历史核心源码，未验证可精确复现当前 WASM。

## 当前功能

- 浏览器 Worker 运行模拟器，大屏和机身屏同步，支持触控及电脑键盘。
- 页面按可视区域自适应，主页面固定；设置面板可内部滚动。
- 最近按键默认关闭，可在设置开启；关闭后腾出空间给大屏。
- 设置中的导出备份，保存/恢复进度，保存屏幕图片，小窗模式。
- 中英文、浅色/深色设置、离线资源缓存、保留进度的程序更新。
- SQLite 统计与管理公告接口。

按键音效及真实设备电量同步尚未实现。当前网页版未启用历史工程中的电池彩蛋。

## 验证

```sh
npm test
```

本次整理前已验证固定布局与触控映射：50 个按键，27 种场景，12,150 个命中点、298 次模拟触控，无对应错误。该结果来自 Chrome 自动化触控模拟，未代表真实 iPad Safari 实机测试。

## Railway 部署

将服务根目录设为 `web-app`，使用本目录 Dockerfile；构建时自动准备并校验二进制资源。配置持久卷挂载 `/data`，环境变量：

- `DATA_DIR=/data`
- `CG50_STATS_PASSWORD`：自行生成至少 24 字符的管理密码。
- `PUBLIC_ORIGIN`：站点完整来源，例如 `https://your-domain.example`；或由 Railway 提供 `RAILWAY_PUBLIC_DOMAIN`。
- `PORT`：Railway 注入，缺省 3000。

健康检查路径 `/healthz`。不要将管理密码、OAuth/SSH 凭据、数据库或个人进度提交到仓库。

## 版本说明

1.2.5 公告：修复了你布满裂痕的心❤️

本次同步包含发布后的两行无效电池注释清理，及对应资源清单校验值更新；未调整模拟器行为。
