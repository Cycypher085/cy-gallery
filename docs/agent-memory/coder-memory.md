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

