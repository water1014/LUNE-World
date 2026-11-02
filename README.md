# LUNE World

A little world of our own. 一个可以走进去、慢慢生活的 2.5D 小世界。

## 当前方向

**Hybrid 2.5D · Rich Depth · Mobile First**

- Three.js WebGL 立体房间场景，正交镜头呈现等距空间感
- 可拖动旋转视角，触摸场景中的物件进入对应空间
- 真实几何体、材质、灯光、阴影与昼夜照明
- HTML/CSS 负责文字、导航、弹窗与移动端界面
- 手机优先布局，昼夜主题偏好保存在本地

## 技术

原生 HTML / CSS / JavaScript + Three.js ES modules。无需打包构建，GitHub Pages 可直接托管。

## 本地预览

通过本地静态服务器打开 `index.html`（例如 VS Code Live Server）。Three.js 使用 CDN ES modules。

## GitHub Pages

仓库使用 GitHub Actions workflow：`.github/workflows/pages.yml`。在 Settings → Pages 中将 Source 设为 **GitHub Actions**。

## 设计语言

粉灰空间、暗胭脂红、温润木质、柔光与清晰的空间层级。LUNE 的场景不再是平面插画，而是可探索的实时 3D 房间。

> Deployment note: Three.js is vendored in `vendor/three.module.js` so every GitHub Pages build path can load the scene without a third-party CDN request.
