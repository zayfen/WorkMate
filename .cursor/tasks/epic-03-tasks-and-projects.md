## Epic 3 — 任务与工程管理（核心功能）

### 目标
- 实现任务/项目的 CRUD 与 UI 交互。

### Feature 3.1 CRUD API 与 UI
- Task 3.1.1 实现后端 API（本地进程 REST 或模块）
  - 步骤：
    1) 暴露 `createTask, getTasks, updateTask, deleteTask`。
    2) 若用 REST：实现 `POST/GET/PUT/DELETE /api/tasks`。
  - 验收标准：
    - 测试或 Postman 能创、改、删、查 成功。
- Task 3.1.2 实现任务编辑 UI（Create/Edit/Delete）
  - 步骤：
    1) 新建 `src/components/TaskEditor.vue`（字段：标题、描述、startAt、dueAt、status、priority、tags、assignee）。
    2) 本地校验：标题必填；开始时间 <= 结束时间。
  - 验收标准：
    - 保存创建新记录，触发事件 `task-saved`。
- Task 3.1.3 实现项目管理 UI
  - 步骤：
    1) 新建 `ProjectList.vue`（或视图），支持创建/删除并关联任务。
    2) 删除项目时提示并可选择级联删除或转移任务。
  - 验收标准：
    - 项目 CRUD 正常，关联逻辑正确。
- Task 3.1.4 任务状态切换（完成、取消、延期）
  - 步骤：
    1) 快捷切换状态并更新 DB；完成时触发通知（见 Epic 6）。
  - 验收标准：
    - 切换后列表 UI 立即更新。

### Feature 3.2 标签与筛选
- Task 3.2.1 多维度筛选（状态/优先级/标签/项目）
  - 步骤：
    1) 提供过滤条件与计数；支持组合查询。
  - 验收标准：
    - 查询准确，UI 显示筛选结果计数。

### 运行与测试
- `yarn dev` 查看 UI；`yarn test` 跑组件与 API 测试

### 约束与规范
- 组件命名清晰；状态管理避免深层嵌套
- 提交前缀 `[AI]`
