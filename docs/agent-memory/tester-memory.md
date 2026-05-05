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
- SQU-6 回归中先后遇到两类环境阻塞：`playwright` 浏览器未安装与 Tailwind 原生可选依赖缺失，分别通过 `npx playwright install chromium` 与 `npm install` 修复后再执行目标用例。
- 针对“最小改动”需求，优先运行与变更直接相关的 case（首页加载 smoke），并补充 `#workflow-test` 与标题文本断言可见性，测试信号更聚焦。
