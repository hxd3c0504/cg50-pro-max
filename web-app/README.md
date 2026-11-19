# 网页版开发与运行

此目录是基于 1.2.6 整理的公开源码版本，发布标识为 `v1.2.6-public-20261119`。公开版去除了访问统计、统计后台、管理接口及内部诊断界面。正式使用网站为 https://cg50promax.up.railway.app 。

## 环境与资源

需要 Node.js 24+。项目没有第三方 npm 运行依赖，无需运行 `npm install`。

Git 中不保存下列构建资源。使用者须自行确认相关文件的获取、使用与传播权限，并提供与 `web/reset-manifest.json` 完全匹配的文件：

- `web/cg50.wasm`：已构建的模拟器；准备脚本可从现有使用网站下载并校验。源站改变版本或不可用时，需自行提供匹配文件。
- `web/defaults/flash_full.bin`：33554432 字节的默认固件镜像，自行提供，不自动下载。
- `web/defaults/cg50_state.bin`：默认初始化状态，自行提供，不自动下载。

请把文件放入对应位置，然后运行 `npm run assets` 进行校验。也可设置 `CG50_ASSET_DIR` 指向另一个资源目录，其中保留 `cg50.wasm`、`defaults/flash_full.bin`、`defaults/cg50_state.bin` 的相对结构。脚本只复制并校验匹配的文件，缺失或散列不符会停止，不会静默替换。

此仓库的当前公开目录不包含能够精确重建已发布 WASM 的完整核心构建链；历史 Go 工程在旧提交中保留，但未确认可复现当前二进制。不要把早期核心直接当作当前版本重建。

## 本地预览

在本目录执行：

```sh
npm run assets
npm run preview
```

打开 `http://127.0.0.1:8089/`；可用 `PORT` 环境变量更换端口。预览服务仅监听本机回环地址，退出时按 Ctrl+C。不能双击 HTML 使用 `file://` 打开。

服务启动时会校验清单中的资源。首次使用需要加载较大的模拟器与固件文件，请等待启动完成。

## 修改网页资源

主要界面、布局与按键热区位于 `web/index.html`；Worker 桥接在 `web/ipad-adapter.js` 与 `web/worker.js`；屏幕绘制在 `web/cg50-display.js`。

改动运行文件后，需要同步更新 `web/reset-manifest.json` 的大小和 SHA-256，否则静态服务会拒绝启动、离线更新也会拒绝切换。增删文件还须同步 `web/sw.js` 的 `FILES`。发布标识须在 `version.json`、`build-info.json`、`cg50-features.js`、`sw.js` 与清单中保持一致。

公开源码版本与正式站使用不同的发布标识，避免在相同来源部署时混用缓存。

## 部署

先准备有权使用的匹配资源，再构建 Docker 镜像。Dockerfile 不自动取得或分发固件；缺少资源时服务不会启动。

Railway 服务根目录设为 `web-app`，使用本目录 Dockerfile。监听端口取 `PORT`，默认 3000，健康检查 `/healthz`。公开版本不需要数据库、管理密码或持久数据卷。个人进度保存在访问者浏览器，与托管服务磁盘无关。

公开版的静态服务只提供资源清单中的文件，不提供 `/stats`、`/api/usage`、统计管理或公告管理接口。版本说明仍由 `web/version.json` 提供。

本次仓库整理不会自动部署现有 Railway 服务，也不会修改正式站存储。
