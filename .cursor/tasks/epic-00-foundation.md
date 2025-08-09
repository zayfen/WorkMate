## Epic 0 — 项目启动与基础设施（初始化）

### 目标
- 初始化项目与基础设施，确保开发/构建/测试工作流可用。

### Feature 0.1 项目初始化（repo、CI、代码风格）
- Task 0.1.1 创建 Git 仓库
  - 步骤：
    1) 确认 `README.md`、`LICENSE`、`.gitignore` 存在（若缺失则创建）。
  - 验收标准：
    - 仓库已创建并可 push；`README` 包含运行与架构概览。
- Task 0.1.2 初始化前端项目（Vite + Vue 3）
  - 步骤：
    1) 验证 `vite`、`vue`、`vue-router` 依赖安装完毕；`yarn dev` 可运行。
  - 验收标准：
    - 本地可启动空壳应用并在浏览器/Electron 窗口打开。
- Task 0.1.3 添加代码质量工具（ESLint、Prettier、TypeScript）
  - 步骤：
    1) 若无 ESLint/Prettier 配置，新增并与 TS 配置一致。
    2) 可选：husky + lint-staged。
  - 验收标准：
    - 执行 lint 正常；保存时可自动格式化（可选）。
- Task 0.1.4 配置 CI（GitHub Actions）
  - 步骤：
    1) `.github/workflows/ci.yml`：安装依赖、运行 `yarn test`、`yarn build`。
  - 验收标准：
    - push 后 Action 成功（至少安装依赖 + lint/测试）。

### Feature 0.2 项目架构与约定
- Task 0.2.1 创建目录结构与约定文档
  - 步骤：
    1) 新建/完善 `ARCHITECTURE.md`：`src/components`、`src/views`、`src/store`、`src/api`、`src/services` 约定。
  - 验收标准：
    - 文档存在并描述清晰。
- Task 0.2.2 打包配置（Electron或 Web）
  - 步骤：
    1) 确认 `vite.electron.config.ts` 可构建主/预加载，`yarn start` 拉起 Electron。
  - 验收标准：
    - dev 模式可打开 Electron 应用；构建产物输出到 `dist`/`dist-electron`。

### 运行与测试
- 开发：`yarn dev`，必要时另启 `yarn start`
- 构建：`yarn build && yarn build:electron`
- 测试：`yarn test`（Vitest）

### 约束与规范
- 提交信息须以 `[AI]` 前缀开头；勿自动提交
- 参考 workspace 规则：`coding-style`、`electron-ipc-security`、`testing-vitest`
