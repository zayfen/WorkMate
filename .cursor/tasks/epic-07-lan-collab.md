## Epic 7 — 局域网协作与消息（发现 + 通知广播）

### 目标
- 在 LAN 内自动发现同伴并广播任务完成等消息。

### Feature 7.1 局域网用户发现
- Task 7.1.1 服务发现（mDNS/bonjour 或 UDP 广播）
  - 验收：发现同一局域网运行的客户端并在 UI 列表显示。
- Task 7.1.2 心跳机制（每 N 秒广播 presence）
  - 验收：peers 列表按心跳更新 lastSeen。

### Feature 7.2 局域网通知传递
- Task 7.2.1 建立 WebSocket/UDP 转发通知消息（task-complete）
  - 消息：`{type:'task-complete', from:userId, taskId, taskTitle, timestamp}`
  - 验收：本机完成任务时他端收到通知（弹窗 + 可选声音）。
- Task 7.2.2 消息签名（可选 HMAC）
  - 验收：收到带签名消息可校验（共享密钥可配置）。

### Feature 7.3 局域网聊天（消息模块）
- Task 7.3.1 简单聊天 UI（个人 & 群发）
  - 验收：发送消息在所有在线 peers 显示；消息可回复。
- Task 7.3.2 持久化消息到 `messages` 表
  - 验收：历史消息可查询并展示。

### 运行与测试
- 多实例本地模拟或两台机器同网段联调

### 约束与规范
- 网络接口注意安全与限流；避免广播风暴
- 提交前缀 `[AI]`
