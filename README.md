# CG50 Pro Max

**在浏览器里使用熟悉的图形计算器。**

[立即使用网页版](https://cg50promax.up.railway.app) · [使用说明](docs/USAGE.md) · [本地运行](web-app/README.md) · [问题反馈](https://github.com/hxd3c0504/cg50-pro-max/issues) · [免责声明](docs/DISCLAIMER.md)

CG50 Pro Max 是围绕 fx-CG50 使用体验开发的独立网页版项目。它把计算器机身按键、实时屏幕和放大的显示区域放在同一个页面，支持触控和电脑键盘，方便在电脑或平板上练习、演示和使用计算器。

项目与 CASIO COMPUTER CO., LTD.（卡西欧计算机株式会社）及其关联公司没有隶属关系，未获得其赞助、认可或官方背书。**CG50 Pro Max 不是卡西欧官方产品。**

## 在线使用

**使用网站：[https://cg50promax.up.railway.app](https://cg50promax.up.railway.app)**

日常使用直接打开网站即可，不需要下载源码或配置开发环境。计算器在浏览器 Worker 中运行；进度保存在当前设备、当前浏览器的本地存储中。换设备、换浏览器或清除网站数据后，不会自动带上原来的进度，请提前导出备份。

## 可以做什么

| 功能 | 说明 |
| --- | --- |
| 实时计算器界面 | 机身屏幕和左侧大屏显示同一帧计算内容，方便观察和演示。 |
| 触控与键盘 | 点击机身上的按键，或用电脑键盘输入数字、运算符和方向键。 |
| 适配页面大小 | 根据可用视口调整布局，提供大屏与小窗模式。 |
| 保存与恢复进度 | 在设置的「进度与备份」中保存和恢复，也可使用 F9、F10。进度保存在浏览器本地。 |
| 导出备份 | 在设置中导出进度文件，便于自行留存。 |
| 最近按键开关 | 默认关闭；需要观察输入过程时，可在设置中开启。 |
| 屏幕图片 | 保存当前计算器屏幕图片。 |
| 界面设置 | 支持中英文与浅色、深色主题。 |
| 离线缓存与更新 | 首次需联网取得资源；支持缓存及保留进度的更新流程，仍受浏览器存储策略影响。 |

当前网页版基于 **1.2.6**。本仓库的公开源码版本使用独立标识 `v1.2.6-public-20261119`，不包含正式站使用统计、管理后台、测试材料或内部诊断工具，因此与在线部署不完全相同。

## 仓库结构

```text
web-app/       当前网页版界面、Worker 适配与静态服务
  web/         网页及公开运行资源
  server/      不含数据库和统计接口的静态 HTTP 服务
  scripts/     本地资源准备工具
docs/          使用说明、架构和免责声明
licenses/      第三方许可证原文
LICENSE        项目原有 GPL-3.0 许可证
```

主分支聚焦当前网页版。早期 Mac、iPad、Android 工程、研究脚本和验证材料不再混放在当前目录；已有提交历史仍予保留。

## 本地运行与资源

需要 **Node.js 24+**，无第三方 npm 运行依赖。准备有权使用且与清单匹配的资源后，在 `web-app` 目录运行：

```sh
npm run assets
npm run preview
```

然后打开 `http://127.0.0.1:8089/`。完整步骤、资源要求和部署方式见 [网页版开发说明](web-app/README.md)。直接用 `file://` 打开 HTML 会导致 Worker 无法正常启动。

本仓库不直接收录 WASM、固件镜像或进度文件。准备脚本可下载已构建的 WASM，并核验大小及 SHA-256；固件和默认状态需要自行合法取得并提供，脚本不会自动下载它们。源码不保证能够直接使用任意固件或任意存档。

## 反馈与参与

遇到问题可在 [Issues](https://github.com/hxd3c0504/cg50-pro-max/issues) 中描述设备、浏览器、操作步骤及现象。请勿上传个人存档、密码、访问令牌、统计数据或未经许可的第三方文件。参与方式见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 来源、许可与免责声明

模拟器相关实现基于或参考 [hexbinoct/casio-cg50](https://github.com/hexbinoct/casio-cg50)。感谢上游作者与相关贡献者；上游署名和许可证见 [第三方声明](docs/THIRD_PARTY_NOTICES.md)。

项目保留仓库原有的 [GPL-3.0 许可证](LICENSE)，第三方组件适用各自许可证。源码许可证不授予任何卡西欧商标、固件、操作系统、机身图片或其他第三方内容的权利。

本项目按现状提供，不保证与真机完全一致，也不保证计算结果、数据保存或持续在线可用性。重要计算请另行核对，重要进度请自行备份；考试及其他受规则约束的场景请遵守对应要求。详见 [完整免责声明](docs/DISCLAIMER.md)。

## English

CG50 Pro Max is an independent browser-based calculator project inspired by the fx-CG50 experience. It supports touch and keyboard input, a synchronized enlarged display, local progress storage, backup export, themes and language settings.

**Try it online: [cg50promax.up.railway.app](https://cg50promax.up.railway.app).** This project is not affiliated with, sponsored by, endorsed by, or an official product of CASIO COMPUTER CO., LTD. All third-party trademarks and materials remain the property of their respective owners. Firmware is not included in this repository. See the [disclaimer](docs/DISCLAIMER.md) and [third-party notices](docs/THIRD_PARTY_NOTICES.md).
