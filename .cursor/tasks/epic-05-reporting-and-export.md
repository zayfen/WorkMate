## Epic 5 — 报告生成与导出

### 目标
- 生成可视化报表并支持导出 HTML/Markdown/PDF。

### Feature 5.1 报表引擎
- Task 5.1.1 设计 report spec 并实现报表数据聚合
  - 验收：`/api/reports` 返回 report JSON（summary & details）。
- Task 5.1.2 HTML & Markdown 模板
  - 步骤：`templates/report.hbs`, `templates/report.md.hbs`
  - 验收：`POST /api/export {format: html|md}` 返回可下载文件。
- Task 5.1.3 图表导出为图片并嵌入报表
  - 验收：报表含图像、表格、关键任务列表，在浏览器可正确展示。

### Feature 5.2 导出 & 下载
- Task 5.2.1 页面提供“导出”为 HTML/Markdown/PDF
  - 验收：本地下载文件可打开且格式良好。

### 运行与测试
- `yarn test` 针对报表聚合与模板渲染编写测试

### 约束与规范
- 模板内避免直接执行用户输入；注意文件路径安全
- 提交前缀 `[AI]`
