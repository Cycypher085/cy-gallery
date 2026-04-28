---
title: "Astro 内容集合完全指南"
description: "深入了解 Astro 的 Content Collections API，如何定义 schema、查询内容，以及最佳实践。"
tags: ["Astro", "Web开发", "前端"]
date: 2026-04-26
cover: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200"
readingTime: 8
---

# Astro 内容集合完全指南

Astro 的 Content Collections API 是一个强大的功能，帮助你管理网站内容。本文将详细介绍如何使用这一功能。

## 为什么使用 Content Collections？

Content Collections 提供了：

- **类型安全** - 基于 Zod schema 的类型检查
- **自动验证** - 构建时验证内容
- **更好的 DX** - 智能提示和自动补全

## 定义 Schema

首先，在 `src/content/config.ts` 中定义你的集合：

```typescript
import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
  }),
});
```

## 查询内容

使用 `getCollection` 和 `getEntry` 函数：

```typescript
import { getCollection } from 'astro:content';

const posts = await getCollection('blog');
```

## 总结

Content Collections 是 Astro 最强大的功能之一，值得深入学习。
