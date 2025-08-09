## Epic 1 — 用户和鉴权（本地）

### 目标
- 提供本地用户资料管理与设备识别能力，支持后续 LAN 展示。

### Feature 1.1 用户资料管理
- Task 1.1.1 设计并实现 users 表（SQLite 或 IndexedDB）
  - 目的：持久化用户基础信息
  - 步骤：
    1) 选择本地存储方案（建议 SQLite）。
    2) 实现 migration/schema（`users` 字段：id, name, avatar_path, note, local_id, last_seen, device_info）。
    3) 提供 CRUD DAO。
  - 验收标准：
    - 可创建、读取、更新用户记录（含单测）。
- Task 1.1.2 UI：个人资料页
  - 步骤：
    1) 新建 `src/views/user-profile-view/user-profile-view.vue`，支持编辑头像、姓名、备注。
    2) 保存时写入 DB；加载时读取 DB。
  - 验收标准：
    - UI 可保存与读取；刷新后仍保留。
- Task 1.1.3 本地头像上传与存储
  - 步骤：
    1) 选择本地文件并复制到 `assets/avatars/`（或用户目录）。
    2) 将路径写入 DB；UI 显示头像。
  - 验收标准：
    - 头像路径持久化且可展示。

### Feature 1.2 多设备识别（局域网展示用）
- Task 1.2.1 生成/存储设备唯一ID（UUID）和心跳信息
  - 步骤：
    1) 生成稳定 `device_id` 存入 `settings` 表。
    2) 维护 `last_seen` 等本机心跳字段。
  - 验收标准：
    - 每台客户端有稳定 `device_id`；心跳字段可更新。
- Task 1.2.2 UI：显示局域网发现用户列表（占位）
  - 步骤：
    1) 在某视图提供 peers 列表占位（后续由 Epic 7 填充数据）。
  - 验收标准：
    - 本地测试时能显示当前用户条目。

### 运行与测试
- `yarn dev` 打开 UI；`yarn test` 跑 DAO 与组件单测

### 约束与规范
- 遵循 Electron IPC 安全规范
- 提交前缀 `[AI]`；勿自动提交
