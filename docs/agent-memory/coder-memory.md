# Coder Memory

本文件用于沉淀 coder 角色的长期经验，避免重复踩坑。

## 使用方法

每次任务结束后追加记录，建议包含：

1. 任务编号与目标
2. 关键实现决策
3. 改动文件列表
4. 常见错误与规避方式
5. 可复用代码片段位置
6. 与 tester 反馈相关的修复点

## 记录模板

### [YYYY-MM-DD] 任务标题
- 背景：
- 主要改动：
- 为什么这样实现：
- 测试结果：
- 后续注意事项：

### [2026-05-05] 首页双模块入口 + Notes 导航 + 笔记内容与 E2E
- 背景：个人站点第一轮静态交付，画廊与笔记双入口、导航与回归覆盖。
- 主要改动：`index.astro` 增加 `id="workflow-test"` 的双卡片区块（discovery / notes）；`Navbar` 增加「笔记」并用前缀匹配实现 `/notes` 与 `/notes/[slug]` 高亮；`src/content/notes` 新增 3 篇 markdown；`visual-review.spec.ts` 扩展首页与笔记流断言。
- 为什么这样实现：沿用站点既有 `bg-white/5`、`backdrop-blur`、`border-white/10` 玻璃风格；导航高亮不能用精确相等匹配子路径；E2E 用 `data-testid` 与当前 4 条非 draft 笔记数量避免脆弱文案匹配。
- 测试结果：`npm run build` Pass；`npm run preview` + `npm run test:e2e` 12 tests Pass。
- 后续注意事项：若未来增减笔记数量或启用 draft，需同步调整 `article.note-card` 的 `toHaveCount` 或改为 `>=` 断言。

### [2026-05-05] 第二轮开发：上传元数据闭环 + Viewer 信息分区
- 背景：第二轮需要贴近原始目标，做到上传后可展示参数、设备、地理位置，并在探索页与查看器可见。
- 主要改动：`upload.astro` 新增媒体队列工作台（图片/视频、大小校验、EXIF 解析、参数卡片、位置兜底、同步到探索页）；`src/lib/media.ts` 抽取统一媒体模型并补充视频样例；`discovery.astro` 增加本地同步媒体注入与动态卡片渲染；`PhotoViewer.astro` 扩展为参数/设备/位置三分区并支持视频播放；`visual-review.spec.ts` 新增 3 条第二轮用例。
- 为什么这样实现：保持前端-only前提，通过 `localStorage` 与统一 `meta` 模型构建“上传 -> 探索 -> 查看器”可演示链路，避免后端阻塞。
- 测试结果：`npm run build` Pass；`PREVIEW_URL=http://127.0.0.1:4322 npm run test:e2e` 15 tests Pass。
- 后续注意事项：若后续接入后端真实存储，需要将 `gf-discovery-media` 本地同步替换为服务端数据源，并保留无 EXIF 字段兜底逻辑。

