# 文档说明

## 目录结构

```
docs/
├── README.md              # 本文件
├── agent-w-requirements.md   # W酱：需求追踪
├── agent-c-implementation.md # C酱：实现记录
├── agent-r-testing.md        # R酱：测试报告
└── issues/                    # Agent间Issue历史记录
```

## Agent 职责分工

| Agent | 职责 | 文档 |
|-------|------|------|
| **W酱** | 需求、设计、协调整体 | agent-w-requirements.md |
| **C酱** | 前端开发、技术实现 | agent-c-implementation.md |
| **R酱** | 测试、测试报告、Bug追踪 | agent-r-testing.md |

## Issue 列表

| Issue ID | 标题 | 负责人 | 状态 |
|----------|------|--------|------|
| SQU-13 | 网站开发 (主Issue) | W酱 | 进行中 |
| SQU-14 | C酱开发任务：画廊+笔记模块重构 | C酱 | 待开始 |
| SQU-15 | R酱测试任务：个人网站测试计划 | R酱 | 待开始 |

## 协作流程

1. W酱 创建 Issue 并分配给 C酱/R酱
2. C酱 实现功能并更新 `agent-c-implementation.md`
3. R酱 测试并更新 `agent-r-testing.md`
4. 发现 Bug → R酱 创建 Bug Issue → C酱 修复 → R酱 回归测试
5. 所有 Agent 将每次 Issue 沟通记录保存到 `issues/` 目录

## 设计文档

- `../design-docs/01-research-ui-trends.md` - UI趋势调研
- `../design-docs/02-design-specification.md` - 设计规格书

---

*最后更新: 2026-04-26*
