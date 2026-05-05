# Agent 协作工作流程 (v5.1)

**版本:** 5.1  
**更新日期:** 2026-05-05  
**原因:** 新增基于 issue 评论的 FLOW handoff 结构化协议与校验门禁

---

## 一、策略调整

### 1.1 新开发策略

| 旧策略 | 新策略 |
|--------|--------|
| 多页面同时开发 | 单一页面逐步开发 |
| 任务量复杂 | 每次只做一个页面 |
| 功能堆叠 | 标准化开发+测试流程 |

### 1.2 标准化开发流程

```
1. 设计 → 单一页面设计
2. 生成 → Stitch生成UI
3. 截图记录 → 测试结果截图
4. 实现 → C酱开发
5. 测试 → R酱截图测试
6. Review → W酱检查
7. 完成 → 标记issue done
```

---

## 二、截图测试要求 (v5.0 新增)

### 2.1 截图要求

R酱测试时必须提供截图记录：

| 类型 | 要求 |
|------|------|
| 页面初始化截图 | 页面加载后的完整截图 |
| 按钮执行效果图 | 点击按钮后的结果截图 |
| 问题截图 | 发现bug时的截图 |

### 2.2 截图命名规范

```
screenshots/
├── [page]-[test-item]-init.png      # 初始化
├── [page]-[test-item]-after.png     # 操作后
└── [page]-[test-item]-bug.png       # Bug截图
```

### 2.3 测试报告格式

```markdown
### 测试截图

| 测试项 | 初始化 | 结果 | 状态 |
|--------|--------|------|------|
| 按钮A | [截图] | [截图] | ✅/❌ |

### 发现的问题

1. **问题描述** - [截图]
```

---

## 三、Skill 使用

### 3.1 可用Skill

| Skill | 用途 | 路径 |
|-------|------|------|
| **stitch-design** | AI生成UI设计 | `/root/.openclaw/workspace/skills/stitch-design/` |
| **coding-agent** | 代码开发 | `/root/.openclaw/workspace/skills/coding-agent/` |
| **cloudflare-api** | 部署相关 | `/root/.openclaw/workspace/skills/cloudflare-api/` |

### 3.2 Stitch使用流程

1. 设计前先调用 `stitch-design` skill
2. 生成单个页面设计
3. 截图预览给润清确认
4. 确认后进行开发

---

## 四、Issue 规则 (保持v4.0)

- 收到issue必须返回issue
- 返回内容包含截图
- 有问题创建新issue

### 4.1 FLOW Handoff（最小改造，强制执行）

为保证 planner / coder / tester 不是“口头 stage 流转”，而是通过 issue 线程真实传递信息，所有阶段交接必须使用结构化评论块：

```md
<!-- FLOW_HANDOFF_BEGIN -->
Issue: SQU-6
Flow-State: PLAN_READY
From-Agent: planner
To-Agent: coder
Status: IN_PROGRESS
Updated-At: 2026-05-05T13:30:00.000Z

Summary:
- 本轮完成了什么

Inputs:
- 交接输入（需求链接、设计文档、前置评论）

Acceptance:
- 可验证验收点

Artifacts:
- PR / commit / test log / screenshot

Risks:
- Low / Medium / High + 原因

Next-Actions:
- 下一个 agent 的明确执行动作
<!-- FLOW_HANDOFF_END -->
```

### 4.2 命令行工具（本仓库）

使用 `scripts/issue-handoff.mjs` 统一生成、提取、校验 handoff 评论：

```bash
# 1) 生成 handoff 评论草稿
node scripts/issue-handoff.mjs emit \
  --issue SQU-6 \
  --flow PLAN_READY \
  --from planner \
  --to coder \
  --status IN_PROGRESS \
  --summary "完成范围定义||完成验收标准" \
  --inputs "Linear issue SQU-6||docs/WORKFLOW.md" \
  --acceptance "新增 Workflow Test 区块" \
  --artifacts "docs/WORKFLOW.md" \
  --risks "Low: 仅文案新增" \
  --next "coder 开始实现并提交 PR" \
  --out /tmp/handoff.md

# 2) 校验评论结构是否符合协议（CI 可直接用）
node scripts/issue-handoff.mjs validate --in /tmp/handoff.md

# 3) 从 issue 评论文本中提取结构化数据
node scripts/issue-handoff.mjs extract --in /tmp/handoff.md --json
```

### 4.3 交接门禁

1. 当前 agent 在结束本轮前，必须先 `emit + validate` 通过，再发送 issue 评论。  
2. 下一个 agent 开始执行前，必须先 `extract` 最新 handoff 评论作为输入。  
3. 若 `validate` 失败，视为无效交接，不允许切换 Flow-State。  
4. 所有 handoff 评论需保留在同一个 issue 线程，禁止私聊口头交接替代。  

---

## 五、分支管理

| 分支 | 用途 |
|------|------|
| `main` | 当前开发分支（已重置） |
| `backup-pre-refactor` | 备份重构前的代码 |

**重要：不要在main上直接开发，通过issue管理任务**

---

*本文件由 W酱 维护*  
*最后更新: 2026-05-05*