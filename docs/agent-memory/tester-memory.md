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
- SQU-6 后续“个人网站第一轮开发”回归：先运行 `npm run build` 再用 `npm run preview` + `PREVIEW_URL=http://127.0.0.1:4322 npm run test:e2e`，12/12 全量通过，覆盖首页双模块入口、Notes 导航高亮、Notes 列表与详情链路。
- 当 preview 端口冲突时 Astro 会自动升端口（如 4321 -> 4322），执行 Playwright 前必须显式设置 `PREVIEW_URL`，否则会误连旧服务导致结果不可追踪。
- 第二轮上传元数据回归中，初次失败来自探索页卡片数量断言（9 -> 10，新增视频样例导致）；修复策略是断言与静态数据源 `galleryMedia.length` 对齐后复测。
- 第二轮新增用例需覆盖“格式拦截、元数据兜底、同步探索页并查看 viewer 三分区”，最终 `15/15` 通过，风险由 Medium 收敛到 Low。
