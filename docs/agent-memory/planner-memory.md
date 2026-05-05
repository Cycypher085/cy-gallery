# Planner Memory

用于沉淀规划相关的长期知识，帮助后续任务保持一致性与连续性。

## 记录模板

### YYYY-MM-DD - 主题

- 背景：
- 关键决策：
- 设计/需求原则：
- 对 coder 的具体约束：
- 对 tester 的验收重点：
- 后续待办：

## 初始约定

- 默认先定义范围与验收标准，再进入编码阶段。
- 复杂需求先拆分为可并行任务，再分派给 coder / tester。
- tester 的反馈必须回写到计划文档中。

### 2026-05-05 - SQU-6 workflow test block

- 背景：Linear issue 需要验证单 issue 的 PLAN -> CODE -> TEST 自动流转，并要求首页新增 Workflow Test 文案区块。
- 关键决策：将功能约束为首页新增独立展示区块 + 首页冒烟用例新增断言，避免扩散到其他页面。
- 设计/需求原则：复用现有深色玻璃拟态视觉（bg-white/5、backdrop-blur、border-white/10），确保布局不被破坏。
- 对 coder 的具体约束：仅修改 `src/pages/index.astro` 与相关首页测试断言，不引入新组件与全局样式变更。
- 对 tester 的验收重点：验证 `#workflow-test` 区块与 `Workflow Test` 文案可见，并确认首页无 JS error。
- 后续待办：如继续扩展流程验证，建议抽象为复用 section 组件并增加多页面回归。
