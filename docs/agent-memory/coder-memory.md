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

### [2026-05-07] 首页/探索排版、主题双按钮、洱海图链、地图与全局搜索修复
- 背景：首页与探索页出现竖排文字/窄列换行；洱海晨曦外链 404；主题切换为单按钮；全局搜索弹层窄屏挤压；探索地图观感简陋。
- 主要改动：`Layout.astro` 在 head 暴露 `applySiteTheme` 并派发 `gf-theme-change`；`Navbar.astro` 拆分为太阳/月亮独立按钮并重排全局搜索弹层（纵向表单 + min-w-0）；`global.css` 强化站点背景层次与主题过渡；`index.astro`/`discovery.astro` 增加 min-w-0、text-pretty、卡片元信息换行；`media.ts` 与首页精选替换可访问的洱海配图 URL；探索地图改为 Voyager（浅色）+ fitBounds + 主题切换时换底图；E2E 主题用例与 `/upload/` 路径。
- 为什么这样实现：竖排文字主要由 flex 子项默认 min-width:auto 与窄屏表单共同导致，用 min-w-0 与 responsive flex 根治；双按钮符合心智模型并与 localStorage 持久化一致。
- 测试结果：`npm run build` Pass；`npx playwright test e2e/visual-review.spec.ts` 16/16 Pass（preview 需先行启动）。
- 后续注意事项：静态预览偶发 `/upload` 无斜杠 404，E2E 已统一为 `/upload/`。

### [2026-05-05] 首页双模块入口 + Notes 导航 + 笔记内容与 E2E
- 背景：个人站点第一轮静态交付，画廊与笔记双入口、导航与回归覆盖。
- 主要改动：`index.astro` 增加 `id="workflow-test"` 的双卡片区块（discovery / notes）；`Navbar` 增加「笔记」并用前缀匹配实现 `/notes` 与 `/notes/[slug]` 高亮；`src/content/notes` 新增 3 篇 markdown；`visual-review.spec.ts` 扩展首页与笔记流断言。
- 为什么这样实现：沿用站点既有 `bg-white/5`、`backdrop-blur`、`border-white/10` 玻璃风格；导航高亮不能用精确相等匹配子路径；E2E 用 `data-testid` 与当前 4 条非 draft 笔记数量避免脆弱文案匹配。
- 测试结果：`npm run build` Pass；`npm run preview` + `npm run test:e2e` 12 tests Pass。
- 后续注意事项：若未来增减笔记数量或启用 draft，需同步调整 `article.note-card` 的 `toHaveCount` 或改为 `>=` 断言。

### [2026-05-06] 部署稳定性修复 + 第三轮上传元数据编辑
- 背景：Cloudflare 构建报错 `Missing entry-point to Worker script or to assets directory`，并需在第三轮继续开发上传模块。
- 主要改动：
  - 新增 `wrangler.jsonc`，声明 `assets.directory=./dist` 与 `build.command="npm run build"`，兼容现有 `npx wrangler versions upload`。
  - `upload.astro` 增加元数据可编辑字段（标题/地点/摄影者/标签/时间/机型/经纬度），并将编辑结果同步到探索页预览数据。
  - `discovery.astro` 增加本地上传媒体注入与动态渲染逻辑，支持新增分类按钮与 viewer 数据同步。
  - `playwright.config.ts` 改为 `screenshot: 'on'`；新增 `scripts/list-playwright-screenshots.mjs` 与 `test:e2e:with-screenshots`。
  - `visual-review.spec.ts` 增加“编辑后同步到探索页并在查看器验证”的回归用例。
- 为什么这样实现：先修复部署入口问题，确保每次 main 构建可执行；第三轮在纯前端层完成“可编辑元数据 -> 探索页展示”闭环，不阻塞后端。
- 测试结果：`npm run build` Pass；`npx wrangler versions upload --dry-run` Pass；`PREVIEW_URL=http://127.0.0.1:4322 npm run test:e2e:with-screenshots` 15/15 Pass。
- 后续注意事项：若 Cloudflare 控制台后续修改 deploy command，仍建议保留 `wrangler.jsonc` 作为单一配置源；截图产物默认在 `test-results/**/test-finished-1.png`。

### [2026-05-05] 第二轮开发：上传元数据闭环 + Viewer 信息分区
- 背景：第二轮需要贴近原始目标，做到上传后可展示参数、设备、地理位置，并在探索页与查看器可见。
- 主要改动：`upload.astro` 新增媒体队列工作台（图片/视频、大小校验、EXIF 解析、参数卡片、位置兜底、同步到探索页）；`src/lib/media.ts` 抽取统一媒体模型并补充视频样例；`discovery.astro` 增加本地同步媒体注入与动态卡片渲染；`PhotoViewer.astro` 扩展为参数/设备/位置三分区并支持视频播放；`visual-review.spec.ts` 新增 3 条第二轮用例。
- 为什么这样实现：保持前端-only前提，通过 `localStorage` 与统一 `meta` 模型构建“上传 -> 探索 -> 查看器”可演示链路，避免后端阻塞。
- 测试结果：`npm run build` Pass；`PREVIEW_URL=http://127.0.0.1:4322 npm run test:e2e` 15 tests Pass。
- 后续注意事项：若后续接入后端真实存储，需要将 `gf-discovery-media` 本地同步替换为服务端数据源，并保留无 EXIF 字段兜底逻辑。

### [2026-05-05] 第四轮重构：主题/搜索/Discovery 同步与地图修复
- 背景：进入下一轮重构后，优先修复 P0 交互问题（主题切换、全局搜索不可用、Discovery 与 Viewer 同步及地图初始化问题），并优化首页视觉标记与上传快照可视反馈。
- 主要改动：
  - `Layout.astro`：重构主题初始化与切换逻辑，补充 `data-theme` 同步，并补上 Leaflet JS CDN 引入，修复地图运行时依赖缺失。
  - `global.css`：引入 light/dark 变量体系、`site-shell` 背景与基础排版规则，统一玻璃组件基于变量渲染，降低“仅图标切换”的假切换问题。
  - `Navbar.astro`：实现全局搜索弹层（`Ctrl/Cmd + K`、遮罩关闭、回车跳转 `/notes?q=`）、滚动态样式与主题图标同步修复。
  - `discovery.astro`：修复 viewer 数据同步函数名（`setPhotoViewerPhotos`）、分类筛选兼容多值、地图懒初始化与主题底图选择。
  - `notes/index.astro`：支持 `?q=` 与 `?tag=` 查询参数回填并即时筛选。
  - `upload.astro`：新增已保存快照列表渲染（保存后即时可见，刷新后可恢复）。
  - `index.astro`：优化 Hero 文案排版与地图 marker 视觉（可点击胶囊标签 + 脉冲核心点）。
- 为什么这样实现：先修复 P0 的“脚本链路可执行”和“状态可见”问题，再做视觉迭代，可显著降低后续 UI 改造时的定位成本。
- 测试结果：`npm run build` Pass；`npm run test:e2e:with-screenshots` 16/16 Pass。
- 后续注意事项：当前多页面仍使用部分固定深色类名，后续若继续推进完整主题化，建议分批替换 `text-white/*` 与 `bg-[#0F0F0F]` 为 design-token 类，避免一次性大改引入视觉回归。

### [2026-05-06] 视觉一致性收口：主题 token 扩展与页面基线统一
- 背景：在 P0 交互稳定后，继续执行“全站视觉一致性收口”，降低 light/dark 下页面风格割裂与硬编码颜色回归风险。
- 主要改动：
  - `global.css` 新增可复用主题组件类：`site-footer`、`chip-neutral`、`input-surface`，用于页脚、筛选 chip、输入框等跨页面统一。
  - `collections.astro`、`notes/index.astro`、`notes/[slug].astro`、`discovery.astro`、`index.astro`、`upload.astro` 统一主容器与关键文案到 `bg-secondary` / `text-primary` / `text-secondary` / `text-muted`。
  - 去除页面内重复且偏暗色的局部 `.glass-card` 覆盖，回归全局 token 驱动的玻璃卡片样式。
  - Discovery 的动态渲染模板与筛选按钮逻辑同步到 token 化类名，避免“初始样式与脚本重渲染后样式不一致”。
- 为什么这样实现：先抽公共样式原子，再做页面替换，可在不大幅改动组件结构的前提下提升一致性，并降低后续迭代维护成本。
- 测试结果：`npm run build` Pass；`npm run test:e2e:with-screenshots` 16/16 Pass。
- 后续注意事项：上传页队列的动态 HTML 仍包含部分历史 `text-white/*` 类，可在下一轮单独做“上传工作台深度 token 化”。

