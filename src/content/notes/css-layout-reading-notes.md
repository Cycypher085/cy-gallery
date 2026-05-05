---
title: "再读 CSS 布局：flex / grid 分工笔记"
description: "什么时候用 flex，什么时候换 grid——避免一行代码搞定一切的执念。"
tags: ["学习", "CSS", "前端"]
date: 2026-04-28
cover: "https://images.unsplash.com/photo-1507721999472-8aed442b4ef8?w=1200"
readingTime: 5
---

## 核心结论（可先收藏）

**一维排版倾向 flex；二维棋盘格倾向 grid。** 复杂仪表盘优先考虑 grid + `minmax()`。

---

### Flex：主轴思维

适合：

- 导航条、按钮组、头像 + 文案横排
- 「两端对齐」「居中」「自动换行」这类一维诉求

备忘：`gap` 比老式 margin hack 省心得多。

---

### Grid：区域思维

适合：

- 卡片瀑布流占位（配合 `auto-fill` / `minmax`）
- 侧栏 + 主栏 + 页脚的经典站点骨架

示例心智模型：

```
+------------------+
| header           |
+------+-----------+
| aside| main      |
+------+-----------+
```

---

### Toggle：何时混搭？

外层 grid 画大区，区内卡片头部仍可用 flex —— **分层思考**，不要强求单一属性打完。
