## Epic 6 — 通知模块（本地 scheduler + 系统通知）

### 目标
- 实现本地任务调度与系统通知能力。

### Feature 6.1 本地通知架构
- Task 6.1.1 scheduler 服务（调度任务检查）
  - 实现建议：`node-cron` 或 `setInterval + persisted nextRun`
  - 验收：按配置周期运行检查函数。
- Task 6.1.2 3 类通知：过期提醒、完成鼓励、每日早/晚汇总
  - 验收：每类通知有测试案例并写入 `notifications` 表。

### Feature 6.2 系统通知与声音
- Task 6.2.1 集成系统通知 API（Electron Notification 或 Web）
  - 验收：本地正确展示系统通知；点击可打开相关任务页面。
- Task 6.2.2 声音播放
  - 验收：设置可开关声音并播放本地音频。

### Feature 6.3 通知配置 UI
- Task 6.3.1 设置页面：配置提前多久提醒、通知时间、是否播放音乐
  - 验收：更改后行为生效（无需重启）。

### 运行与测试
- `yarn test` 针对 scheduler 与通知触发写单测

### 约束与规范
- 主/渲染进程通信遵循 IPC 安全规范
- 提交前缀 `[AI]`
