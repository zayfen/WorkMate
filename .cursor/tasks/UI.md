# WorkMate 工作日程管理器 UI 设计描述（供 Cursor 生成界面）

---

## **整体设计风格与原则**

- **设计语言**：采用极简、优雅的 **Apple UI 风格**（类似 macOS Sonoma / iOS 17），强调留白、毛玻璃效果（vibrancy）、柔和圆角与细腻动效。
- **核心理念**：**少即是多**。去除冗余装饰，聚焦内容本身，操作隐于交互之中。
- **配色方案**：
  - 主色调：`#007AFF`（Apple 蓝，代表信任与效率）
  - 辅助色：`#5856D6`（紫色）、`#FF2D55`（完成/提醒红）、`#34C759`（成功绿）
  - 背景色：`#F2F2F7`（系统浅灰）主界面，`#FFFFFF` 卡片区
  - 文字：`#000000`（主）、`#8E8E93`（次级）、`#C7C7CC`（说明）
- **字体**：
  - 中文：`"PingFang SC", "Hiragino Sans GB", sans-serif`
  - 英文：`SF Pro Text, -apple-system, BlinkMacSystemFont, "Segoe UI"`
  - 字号：标题 `17px`，正文 `13px`，说明 `11px`
- **命名规范**：
  - 所有**文件名**使用 **kebab-case**。
  - 所有**组件名**使用 **kebab-case**。
  - 按钮、表单等 UI 元素采用无边框、内联标签、毛玻璃背景等 Apple 风格。

---

## **主界面布局（app-shell）**

采用 **侧边栏 + 主内容区** 的极简双栏布局。

```plaintext
+-------------------------------------------------------------+
| 🏠 仪表盘                                                    |
| 📅 日程                                                      |
| 📁 项目                                                      |
| ✅ 任务                                                      |
| 📊 报告                                                      |
| 💬 消息                                                      |
| ——————————————————————————                                   |
| 局域网成员                                                   |
|   • 张伟  在线                                               |
|   • 李娜  空闲                                               |
|   • 王强  离线                                               |
+-----------------+                                           |
|                 |                                           |
|                 |                                           |
|                 |                                           |
|                 |                 主内容区                   |
|                 |                                           |
|                 |                                           |
|                 |                                           |
|                 |                                           |
|                 |                                           |
|                 |                                           |
|                 |                                           |
|                 |                                           |
|                 |                                           |
+-----------------+-------------------------------------------+
```

- **左侧栏 (sidebar-nav)**：
  - 宽度 `200px`，背景毛玻璃效果。
  - 项目项：图标 + 文字，选中时左侧出现 `3px` 蓝色条。
  - “局域网成员”区域：
    - 成员项：头像 + 姓名 + 状态点 + 状态文字
    - 悬停时出现“发送消息”按钮

- **主内容区 (main-content)**：
  - 内边距 `24px`，背景 `#F2F2F7`。
  - 当前视图标题作为首行大字（`24px` 加粗）。

---

## **1. 仪表盘（dashboard-view）**

### 组件列表：
- **today-tasks-card**
  - 标题：“今日待办” + `+` 创建按钮
  - 内容：`task-item-simple` 列表
    - 左：复选框（空心圆 → 蓝点填充）
    - 中：任务标题 + 截止时间（小字）
    - 右：项目标签（小圆点 + 名称）

- **upcoming-alerts**
  - 标题：“即将到期”
  - 任务标题红色，显示“剩余 X 小时”

- **weekly-stats**
  - 标题：“本周概览”
  - 内容：`completion-count` + `circular-progress` + `trend-badge`

- **quick-actions**
  - 一行文字按钮：`create-task-btn`、`view-week-btn`、`export-weekly-report-btn`

---

## **2. 日程视图（calendar-views）**

支持 **日 / 周 / 月 / 年**，顶部 `segmented-control` 切换。

### **日视图（day-view）**
- 纵向时间轴，横向任务。
- 任务使用 `event-chip` 组件：
  - 胶囊形，高度 `40px`
  - 背景色按优先级：高（红）、中（黄）、低（蓝）
  - 白色文字，居中
  - 支持拖拽调整时间

### **周视图（week-view）**
- 7列，每列顶部显示日期与星期。
- 下方：
  - `daily-task-count`（“3 任务”）
  - `daily-completion-bar`（绿色进度条）
- 点击展开该日任务。

### **月视图（month-view）**
- 7×6 网格。
- 每日格子：
  - 数字日期
  - 下方 1-3 个小点表示任务数
  - 当前日期加蓝圈

### **年视图（year-view）**
- 12个矩形块，颜色深浅表示任务总数。
- 块内：月份缩写 + 任务数
- 点击跳转月视图。

---

## **3. 项目与任务管理界面**

### **项目列表（projects-list）**
- 网格布局，每项 `project-card`
  - 项目标题（大字）
  - 描述（小字，省略）
  - `linear-progress` 进度条
  - 负责人头像（小）
- 悬停显示“编辑”、“删除”按钮

### **任务列表（tasks-list）**
- 极简表格：
  - 行高 `44px`，无表头边框
  - 列：复选框、标题、项目、负责人头像、截止时间、优先级点
- 顶部 `filter-bar`：
  - 状态：`status-segmented-control`（全部/未开始/进行中/完成/延期）
  - 优先级：三个彩色点可选
  - 标签：输入框 + 自动补全
  - 项目：下拉选择

### **任务编辑弹窗（task-editor-modal）**
- 模态窗口，毛玻璃背景。
- 字段使用内联标签：
  - `title-input`
  - `description-textarea`
  - `project-select`
  - `assignee-picker`（头像+姓名）
  - `start-due-datetime-pair`
  - `priority-selector`（红/黄/蓝点）
  - `tags-input`（输入生成标签）
  - `attachment-uploader`（+ 添加附件）
- 按钮：`cancel-btn`（文字）、`save-btn`（蓝色填充）

---

## **4. 报告页面（reports-view）**

### **报告生成器（report-generator）**
- `report-config-panel`：
  - 报告类型：`type-segmented-control`（日/周/月/年）
  - 日期范围：`date-range-picker`
  - 过滤器：项目、状态
  - `generate-report-btn`（蓝色）

### **报告预览（report-preview）**
- 模拟 Apple Pages 风格。
- 内容：
  - 大标题
  - `stats-summary`（三列：总数、完成、完成率）
  - `chart-js` 组件（Apple 风格图表）
  - `key-tasks-list`（高优先级/逾期）
- `export-buttons`：`export-html-btn`、`export-md-btn`、`export-pdf-btn`

---

## **5. 消息与局域网协作界面**

### **消息中心（messages-view）**
- 左侧 `conversation-list`：
  - 会话项：头像 + 名称 + 消息预览 + 时间
  - 未读消息显示红点
- 右侧 `chat-window`：
  - 消息气泡：我方右对齐蓝底白字，对方左对齐白底灰边
  - 气泡圆角 `18px`
  - 支持长按回复
- 底部 `message-input` + `send-btn`

### **局域网成员面板（lan-members-panel）**
- 标题：“局域网成员”
- 成员列表 `lan-member-item`：
  - 头像（圆形）
  - 姓名
  - 状态文字（“在线”等）
  - `send-message-btn`（悬停出现）

---

## **6. 用户资料页（user-profile-view）**

- 大头像居中
- “更换头像”按钮
- 表单：
  - `name-input`
  - `note-textarea`
  - `device-id-display`（只读）
- `save-btn`（蓝色填充）

---

## **7. 设置页面（settings-view）**

### **通知设置（notifications-settings）**
- 分组：
  - “任务提醒”
    - `enable-reminders-toggle`
    - `advance-reminder-select`（1小时/6小时/1天）
  - “每日提醒”
    - `morning-reminder-toggle` + `morning-time-picker`
    - `evening-summary-toggle` + `evening-time-picker`
  - “声音”
    - `play-sound-toggle`
    - `play-test-btn`

### **局域网设置（lan-settings）**
- `enable-lan-discovery-toggle`
- `broadcast-interval-select`
- `message-signing-toggle`（高级）

### **导出设置（export-settings）**
- “默认导出格式”：`export-format-radio-group`（HTML / Markdown / PDF）

---

## **8. 通知弹窗（system-notification）**

- **样式**：系统原生通知（Apple 风格）
- **内容**：
  - 标题：“任务即将到期”
  - 子标题：“‘完成周报’将在2小时后截止”
  - 图标：优先级颜色点
  - 按钮：“查看”、“延期”
- **声音**：可配置，完成任务时播放短促“叮”声

---

## **动效与交互细节**

- **任务完成**：复选框 → 蓝点填充 + 淡出 → 触发通知
- **局域网通知**：右下角滑入，可配置播放音乐
- **页面切换**：平滑淡入
- **加载**：骨架屏，线条柔和

---

## **交付给 Cursor 的建议**

- 使用 **Vue 3 + Vite + Tailwind CSS** 实现
- **文件名 kebab-case**：
  - `dashboard-view.vue`
  - `calendar-views.vue`
  - `task-editor-modal.vue`
  - `lan-members-panel.vue`
  - `system-notification.vue`
- **组件名 kebab-case**：
  - `<today-tasks-card />`
  - `<event-chip />`
  - `<circular-progress />`
  - `<status-segmented-control />`
  - `<task-item-simple />`
- 图标使用 **Feather Icons** 或 **Heroicons**
- 图表使用 **Chart.js** 并定制为 Apple 风格
- 动效使用 **CSS transitions** 和 **Animate.css**

---

该设计完全遵循 Apple UI 哲学，极致简洁，突出内容，交互自然。`WorkMate` 将成为一款优雅高效的工作伙伴。**所有文件名与组件名均已按要求使用 kebab-case**。