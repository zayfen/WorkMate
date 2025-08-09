# WorkMate — AI 任务索引

> 使用说明：从上到下依次执行各 Epic 文件中的任务。每个任务包含目标、步骤与验收标准。执行变更后请本地运行 `yarn dev`/`yarn test` 验证。提交时遵循提交规范（消息前缀需以 `[AI]` 开头），但请勿自动提交。

- [Epic 0 — 项目启动与基础设施](./done/epic-00-foundation.md)
- [Epic 1 — 用户与鉴权（本地）](./epic-01-user-profiles.md)
- [Epic 2 — 数据模型与持久化](./epic-02-data-persistence.md)
- [Epic 3 — 任务与工程管理](./epic-03-tasks-and-projects.md)
- [Epic 4 — 视图模块（天/周/月/年）](./epic-04-views-and-stats.md)
- [Epic 5 — 报告生成与导出](./epic-05-reporting-and-export.md)
- [Epic 6 — 通知模块](./epic-06-notifications.md)
- [Epic 7 — 局域网协作与消息](./epic-07-lan-collab.md)
- [Epic 8 — 消息接收与回复](./epic-08-messaging.md)
- [Epic 9 — 测试、质量、打包与部署](./epic-09-testing-and-release.md)
- [Epic 10 — 文档与运维](./epic-10-docs-and-ops.md)

通用约定与运行要点：
- 别名：`@` → `src`；基础路径：`base: './'`
- 开发：`yarn dev`（必要时另开终端 `yarn start` 运行 Electron 主进程）
- 构建前端：`yarn build`；构建主/预加载：`yarn build:electron`
- 测试：`yarn test`（Vitest）
- Electron 安全：`contextIsolation: true`、`nodeIntegration: false`、`sandbox: false`；外链用 `shell.openExternal`
- 参考 workspace 规则：`coding-style`、`electron-ipc-security`、`testing-vitest`
