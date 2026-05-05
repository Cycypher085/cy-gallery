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

### [2026-05-05] SQU-6 Workflow Test 首页区块
- 背景：需要在主页新增用于流程验收的文案区块，并保持现有视觉风格不破坏布局。
- 主要改动：
  - `src/pages/index.astro` 新增 `#workflow-test` 区块与标题 `Workflow Test`。
  - `e2e/visual-review.spec.ts` 在首页加载用例中增加区块可见性断言。
- 为什么这样实现：将区块插入在“精选作品”与 Footer 之间，可见性高且对现有 Hero/地图结构零侵入；样式复用既有玻璃拟态类名，避免新增全局 CSS。
- 测试结果：`npx playwright test e2e/visual-review.spec.ts --grep "首页 - 加载正常"` 通过（1 passed）。
- 后续注意事项：当前环境需 Node 22+ 才能稳定运行 Astro 6 与 Playwright 工作流。

