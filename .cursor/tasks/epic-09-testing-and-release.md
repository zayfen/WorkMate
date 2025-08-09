## Epic 9 — 测试、质量、打包与部署

### 目标
- 建立完善的自动化测试与发布流程。

### Feature 9.1 自动化测试
- Task 9.1.1 单元测试：DB、API、scheduler、reporting
  - 验收：覆盖率报告 ≥ 70%。
- Task 9.1.2 E2E 测试：主要工作流
  - 流程：创建任务 → 完成任务 → 通知广播 → 报表导出
  - 验收：CI 中可跑通（Playwright 或 Cypress）。

### Feature 9.2 打包与发布
- Task 9.2.1 打包脚本（Electron）生成安装包
  - 验收：生成 `exe`/`dmg`/`deb` 安装包。

### 运行与测试
- `yarn test` 单元与 E2E（按需配置 CI）
- 打包：`yarn dist:*`

### 约束与规范
- CI 日志易读；敏感信息不入库/不入日志
- 提交前缀 `[AI]`
