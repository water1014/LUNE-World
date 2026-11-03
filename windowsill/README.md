# LUNE · 赴约窗台场景移植

本目录直接移植自 TangfanOVO/qiaosi 仓库的 `scenes/windowsill` 场景，保留原始 Three.js 场景代码、手机交互、天气/季节控制与模型数据。

上游项目：https://github.com/TangfanOVO/qiaosi/tree/main/scenes/windowsill
上游作者：TangfanOVO
上游许可：GNU Affero General Public License v3.0（AGPL-3.0），详见本目录 LICENSE。

## 本次改动
- 2026-11-03：将原始构建版 `index.html` 与四个原始 glTF JSON 模型移入本目录。
- LUNE 项目根页面跳转到本场景，便于 GitHub Pages 直接打开。
- 场景源代码主体未重新绘制；后续如有修改，将在此记录。

## 运行
通过静态网页服务器打开本目录的 `index.html`。Three.js 依赖按上游页面配置从 jsDelivr CDN 加载。

## 对应源代码
本目录 `index.html` 是上游 `src/js/*.js` 按上游 `build.mjs` 顺序拼接生成的完整可读源文件；模型文件位于 `models/`。
