## Epic 2 — 数据模型与持久化

### 目标
- 设计核心数据模型并实现本地持久化与 DAO 层。

### Feature 2.1 数据库层
- Task 2.1.1 设计 data-model（projects, tasks, notifications, messages, settings）
  - 步骤：
    1) 定义 schema（见 `tasks.md` 字段定义）。
    2) 提供 migration。
  - 验收标准：
    - Migration 可运行并创建所有表。
- Task 2.1.2 实现本地 ORM/DAO（增删改查）
  - 步骤：
    1) 提供 `db/projects.*`, `db/tasks.*` 等 API。
    2) 编写单测覆盖 CRUD。
  - 验收标准：
    - 单元测试通过。

### Feature 2.2 时间/时区处理
- Task 2.2.1 统一时间格式策略
  - 步骤：
    1) 存储使用 UTC ISO8601；展示转换为本地时区。
    2) 增加跨时区测试用例。
  - 验收标准：
    - 测试在不同时区下展示一致。

### 运行与测试
- `yarn test` 运行 DAO 与时区相关测试

### 约束与规范
- TypeScript 类型清晰；避免 `any`
- 提交前缀 `[AI]`
