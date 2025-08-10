# 应用图标放置说明

将实际的应用图标资源放在本目录下，打包器会自动拾取：

- 顶层通用：`icon.png`（建议 1024x1024，electron-builder 可自动转换为各平台所需格式）
- macOS（可选更精细）：`icon.icns`
- Windows（可选更精细）：`icon.ico`
- Linux（可选）：`icons/512x512.png`（或其他常见尺寸 256x256、128x128 等 PNG）

项目已在 `package.json > build.icon` 指定为 `build/icon.png`，若同时存在平台专用文件，平台优先将覆盖通用路径。

开发时网页标签的 favicon 来自 `public/icon.svg`，可按需替换。

