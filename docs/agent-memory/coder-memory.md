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

### [2026-05-05] SQU-6 Workflow Test 区块实现
- 背景：Linear issue 要求在首页新增 `Workflow Test` 文案区块并验证自动化测试。
- 主要改动：
  - `src/pages/index.astro`：在精选作品区块下新增 `#workflow-test` 展示区块。
  - `e2e/visual-review.spec.ts`：在首页加载用例新增 `#workflow-test` 与标题文案断言。
- 为什么这样实现：直接复用现有玻璃风格样式，最小化改动范围，降低对地图与导航逻辑的回归风险。
- 测试结果：`npx playwright test e2e/visual-review.spec.ts --grep "首页 - 加载正常，无 console error"` 通过（1/1）。
- 后续注意事项：云端运行时需 Node 22+，且首次执行 Playwright 需预装 chromium 浏览器依赖。

