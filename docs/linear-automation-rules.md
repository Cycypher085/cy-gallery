# Linear Automation Rules for Single-Issue Workflow

本文件定义一个“单 issue 自动流转”方案：在 Linear 中只创建 1 条 issue，即可通过 `@Cursor` 在 PLAN/CODE/TEST 间循环，直到完成并 @用户汇总。

## 1) Issue 格式约定

### 标题格式

`[FLOW] <feature-name>`

### 描述中必须包含

1. `Owner Mention`: 需要最终 @ 的用户（例如 `@a53b5c34-b40b-4bb0-a009-d49f22ecc63d`）
2. `Acceptance Criteria`: 至少 3 条验收标准
3. `Flow State`: 初始值 `START`
4. `Branch`: 目标分支（例如 `main` 或 `feature/<name>`）

示例：

```md
## Flow Control
- Owner Mention: @a53b5c34-b40b-4bb0-a009-d49f22ecc63d
- Flow State: START
- Branch: main

## Acceptance Criteria
- [ ] AC1 ...
- [ ] AC2 ...
- [ ] AC3 ...
```

## 2) Agent 输出信号约定（必须严格遵循）

每轮回复都必须带 machine-readable 信号：

- `STAGE: PLAN | CODE | TEST`
- `STATUS: IN_PROGRESS | BLOCKED | DONE`
- `NEXT_ACTION: PLAN | CODE | TEST | SUMMARY_TO_OWNER | CODE_FIX`
- `NEXT_AT_CURSOR:` 后接一段可直接执行的 `@Cursor` 指令

如果 `STAGE: TEST` 且 `STATUS: DONE`：

- 通过：`NEXT_ACTION: SUMMARY_TO_OWNER`
- 不通过：`NEXT_ACTION: CODE_FIX`

## 3) Linear 自动化规则（推荐）

> 不同团队的自动化能力有差异。若你的 Linear Automation 支持“字段条件 + 评论动作”，按下列规则配置；若不支持全部条件，至少保留 R1、R2、R3。

### R1: START -> PLAN

- Trigger: Issue 创建，且标题包含 `[FLOW]`
- Condition: 描述中 `Flow State: START`
- Actions:
  1. 添加评论：
     ```text
     @Cursor [model=claude-opus-4-1]
     进入 PLAN 阶段。输出 STAGE/STATUS/NEXT_ACTION/NEXT_AT_CURSOR 四段信号。
     根据当前 issue 的 Acceptance Criteria 完成计划拆分，不写代码。
     ```
  2. 将描述中的 `Flow State: START` 更新为 `Flow State: PLAN`

### R2: PLAN DONE -> CODE

- Trigger: 新评论包含 `STAGE: PLAN` + `STATUS: DONE` + `NEXT_ACTION: CODE`
- Actions:
  1. 添加评论（可直接引用上一条 `NEXT_AT_CURSOR`）：
     ```text
     @Cursor [model=auto]
     进入 CODE 阶段。基于 PLAN 交接实现功能并提交代码。
     输出 STAGE/STATUS/NEXT_ACTION/NEXT_AT_CURSOR。
     ```
  2. 更新 `Flow State: CODE`

### R3: CODE DONE -> TEST

- Trigger: 新评论包含 `STAGE: CODE` + `STATUS: DONE` + `NEXT_ACTION: TEST`
- Actions:
  1. 添加评论：
     ```text
     @Cursor [model=claude-sonnet-4]
     进入 TEST 阶段。执行验证并输出测试报告。
     输出 STAGE/STATUS/NEXT_ACTION/NEXT_AT_CURSOR。
     ```
  2. 更新 `Flow State: TEST`

### R4: TEST FAIL -> CODE FIX（回环）

- Trigger: 新评论包含 `STAGE: TEST` + `NEXT_ACTION: CODE_FIX`
- Actions:
  1. 添加评论：
     ```text
     @Cursor [model=auto]
     TEST 未通过。进入 CODE_FIX 回合，按失败明细修复后再次交接 TEST。
     输出 STAGE/STATUS/NEXT_ACTION/NEXT_AT_CURSOR。
     ```
  2. 更新 `Flow State: CODE`

### R5: TEST PASS -> FINAL SUMMARY TO OWNER

- Trigger: 新评论包含 `STAGE: TEST` + `STATUS: DONE` + `NEXT_ACTION: SUMMARY_TO_OWNER`
- Actions:
  1. 添加评论：
     ```text
     @Cursor
     请输出最终汇总并 @Owner Mention。汇总需包含：
     - 计划摘要
     - 代码变更摘要
     - 测试结论（通过/失败）
     - 风险与后续建议
     ```
  2. 更新 `Flow State: DONE`

## 4) 最小可行手动降级方案（自动化规则未配齐时）

若你的 Linear 自动化当前无法按评论内容做条件判断，可使用“半自动”：

1. 保留 R1（创建后自动 @Cursor 进入 PLAN）
2. 其余步骤通过人工复制上一轮 `NEXT_AT_CURSOR` 到 issue 评论触发下一轮

这样仍可在单 issue 内完成 PLAN -> CODE -> TEST -> 回环/结束。
