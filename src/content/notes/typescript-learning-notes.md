---
title: "TypeScript 窄化：从困惑到顺手"
description: "整理 union、判别联合与 typeof/in 的常见写法，留给以后的自己翻看。"
tags: ["学习", "TypeScript", "前端"]
date: 2026-05-02
cover: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200"
readingTime: 6
---

## TL;DR

> **窄化（narrowing）** 就是让编译器相信「在这一分支里，变量一定是某个更具体的类型」。写得顺手之后，很多运行时错误会在编译期就被拦住。

---

### 常用套路一览

| 场景 | 写法示例 | 备注 |
|------|----------|------|
| 判别联合 | `kind === 'image'` | 最清晰，优先 |
| `typeof` | `typeof x === 'string'` | 适合原始类型 |
| `in` | `'url' in item` | 适合对象形态差异 |
| 真值窄化 | `if (id)` | 注意 `0` / `''` |

---

### 小例子：接口返回可能是错误或数据

```typescript
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

function unwrap<T>(r: Result<T>): T {
  if (!r.ok) throw new Error(r.message);
  return r.data; // 此处 r 已被窄化为 { ok: true; data: T }
}
```

---

### Callout（给自己的备忘）

1. **undefined / null**：可选链 helpful，但不要滥用 `as`。
2. **数组**：`filter(Boolean)` 不会自动窄化；需要类型谓词 `(x): x is Foo => ...`。

下次读到这篇如果还觉得懵，就先手写三个判别联合的例子再回头看表格。
