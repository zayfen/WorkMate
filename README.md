# WorkMate

Electron + Vue3 + TypeScript + Vite + Router + Vitest + Electron 脚手架。

## 快速开始
- 安装依赖：`yarn install`
- 开发：`yarn dev`（将启动 Vite；若未自动弹出 Electron，可在另一终端执行 `yarn start`）
- 单元测试：`yarn test`

## 构建
- 仅前端：`yarn build` → 产物在 `dist/`
- 前端 + Electron 主/预加载：`yarn build:electron` → 产物在 `dist-electron/`
- 构建后运行 Electron：`yarn start`

## 目录结构
- `src/` 渲染进程（Vue）
- `electron/` 主进程与预加载
- `dist/` 前端构建输出
- `dist-electron/` Electron 构建输出

## 测试
- 框架：Vitest + @vue/test-utils + jsdom
- 命令：
  - 一次性：`yarn test`
  - 监听：`yarn test:watch`
  - UI：`yarn test:ui`
