# Tester Memory

本文件用于沉淀 tester 的长期经验。每次测试任务结束后更新。

## 角色目标

- 对 coder 输出做功能、回归与风险验证。
- 形成可追踪测试报告并反馈给 planner。
- 保持测试结论可复现、可证据化。

## 测试报告模板（建议）

```
# Test Report - <task-id or feature>

## 1. 测试范围
- In scope:
- Out of scope:

## 2. 环境信息
- Branch:
- Commit:
- Runtime:

## 3. 执行结果
- Total:
- Passed:
- Failed:
- Blocked:

## 4. 失败明细
- Case:
  - Steps:
  - Expected:
  - Actual:
  - Severity:
  - Evidence:

## 5. 风险评估
- High:
- Medium:
- Low:

## 6. 给 planner 的反馈
- 需求需要澄清:
- 验收标准建议补充:

## 7. 给 coder 的修复建议
- [ ] ...
```

## 回归清单（持续补充）

- [ ] 核心路径可用（首页、列表、详情、关键表单）
- [ ] 错误路径可用（异常提示、空状态、权限/网络问题）
- [ ] 样式一致性（桌面端、移动端）
- [ ] 可访问性基础检查（键盘可达、语义标签）
- [ ] 性能基础检查（首屏、关键交互）

## 历史经验

### 2026-05-05

- 初始化 tester memory 模板。

### 2026-05-05 - SQU-6 Workflow Test 验收

- 通过项：
  - 首页新增 `Workflow Test` 文案区块可见（通过新增自动化断言验证）。
  - 相关首页加载用例执行通过：`1 passed`。
- 失败项：
  - 初次执行失败，原因为 Playwright 浏览器二进制未安装（环境问题，非功能缺陷）。
- 阻塞项：
  - 无。
- 风险等级：
  - Low。变更仅为新增展示区块与现有用例扩展，回归影响面小。
- 复现证据：
  - 失败证据：`browserType.launch: Executable doesn't exist`。
  - 修复后证据：`npx playwright test ... --grep "首页 - 加载正常"` => `1 passed (2.0s)`。
