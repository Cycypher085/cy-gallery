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

### 2026-05-05 - SQU-6 Workflow Test 区块

- 背景：Linear issue 需要验证单 issue 的 PLAN -> CODE -> TEST 自动流转。
- 关键决策：在首页新增独立文案区块 `Workflow Test`，放在精选作品区与 Footer 之间，避免影响 Hero 和核心导航布局。
- 设计/需求原则：复用现有玻璃拟态深色风格（`bg-white/5`、`backdrop-blur`、`border-white/10`）保证视觉一致性。
- 对 coder 的具体约束：只改首页展示层与对应测试断言，不修改交互地图逻辑。
- 对 tester 的验收重点：验证区块文本可见且首页核心加载用例仍通过。
- 后续待办：如后续引入更多流程验收文案，优先抽为可复用 section 组件。
