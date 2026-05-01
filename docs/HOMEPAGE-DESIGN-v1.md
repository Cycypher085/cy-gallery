# 首页设计方案 (Homepage Design Spec)

**版本:** 1.0
**日期:** 2026-05-01
**灵感来源:** One Page Love - Lorenzo Bocchi, Typer, Designfly
**状态:** 设计完成，等待实现

---

## 一、设计概念

### 1.1 整体风格

**风格:** Dark Minimal + Glassmorphism + Interactive Map

灵感来自 Lorenzo Bocchi 的黑白摄影网站 + Typer 的微交互动画 + 地图可视化

**核心特点:**
- 全屏沉浸式地图背景（类似 Lorenzo Bocchi 的全球照片坐标）
- 磨砂玻璃卡片（Glassmorphism）
- 微妙的动画效果（Keycap animation 风格）
- 极简黑白风格，突出照片内容

### 1.2 色彩系统

```css
/* 主色调 - 深色系 */
--bg-primary: #0A0A0A;        /* 纯黑背景 */
--bg-secondary: #141414;       /* 次级背景 */
--bg-surface: #1A1A1A;         /* 卡片表面 */

/* 强调色 - 蓝紫色系 */
--accent-primary: #3B82F6;      /* 主强调蓝 */
--accent-secondary: #8B5CF6;   /* 紫色 */
--accent-glow: rgba(59, 130, 246, 0.4); /* 发光效果 */

/* 文字色 */
--text-primary: #FFFFFF;        /* 主文字 */
--text-secondary: #A1A1AA;      /* 次级文字 */
--text-muted: #52525B;         /* 弱化文字 */

/* 边框与分隔 */
--border-subtle: rgba(255, 255, 255, 0.06);
--border-hover: rgba(255, 255, 255, 0.12);

/* 磨砂玻璃 */
--glass-bg: rgba(26, 26, 26, 0.7);
--glass-border: rgba(255, 255, 255, 0.08);
```

### 1.3 字体系统

```css
/* 主字体: Inter - 现代无衬线 */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* 标题字体: 更粗的字重 */
--font-display: 'Inter', sans-serif;
--font-weight-bold: 700;
--font-weight-medium: 500;
--font-weight-normal: 400;

/* 代码/数据字体 */
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;
```

### 1.4 间距系统 (8px Grid)

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

### 1.5 圆角系统

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;
```

### 1.6 动画规格

| 动画名称 | 时长 | 缓动 | 用途 |
|----------|------|------|------|
| fade-in | 300ms | ease-out | 元素进入 |
| slide-up | 400ms | ease-out | 卡片出现 |
| scale-in | 200ms | ease | 模态框 |
| pulse-glow | 2s | ease-in-out | 地图坐标点 |
| float | 6s | ease-in-out | 背景装饰 |

---

## 二、页面结构

### 2.1 整体布局

```
┌──────────────────────────────────────────────────────────────┐
│ [FIXED NAVBAR - 透明 → 滚动后磨砂]                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [FULL-SCREEN INTERACTIVE MAP - Leaflet Dark]                 │
│  - 照片坐标点 (脉冲发光效果)                                    │
│  - 点击坐标 → 查看照片信息                                     │
│                                                              │
│  ┌──────────────────┐                                        │
│  │  HERO CARD       │                                        │
│  │  磨砂玻璃效果     │                                        │
│  │  - 标语          │                                        │
│  │  - CTA按钮       │                                        │
│  └──────────────────┘                                        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ [精选照片网格 - 2列瀑布流]                                      │
├──────────────────────────────────────────────────────────────┤
│ [FOOTER - 简洁版本]                                           │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 响应式断点

| 断点 | 宽度 | 布局变化 |
|------|------|----------|
| Mobile | < 640px | 单列，Hero卡片全宽 |
| Tablet | 640px - 1024px | 2列网格 |
| Desktop | 1024px - 1280px | 3列网格 |
| Wide | > 1280px | 4列网格 |

---

## 三、组件规格

### 3.1 Navbar 导航栏

**样式:**
- 高度: 64px
- 初始: 透明背景
- 滚动后: `backdrop-blur-xl` + `bg-black/50`
- 边框底部: 1px `rgba(255,255,255,0.06)`

**内容:**
```
[Logo - 左对齐]     [探索] [笔记] [上传]     [搜索图标] [主题切换]
```

**移动端:**
- 汉堡菜单图标
- 全屏抽屉导航

**动画:**
- 过渡: 300ms ease
- 背景: 滚动超过50px时变化

### 3.2 Hero Section 英雄区

**位置:** 地图上方，居左

**Hero Card 磨砂玻璃卡片:**
```css
background: rgba(26, 26, 26, 0.7);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 16px;
padding: 32px;
max-width: 480px;
```

**内容:**
1. **状态指示器:** 绿色脉冲点 + "在线" 文字
2. **标题:** "用镜头捕捉世界" - 48px/56px, font-weight: 700
3. **副标题:** "探索全球摄影师的精彩作品..." - 18px, text-secondary
4. **CTA按钮组:**
   - 主按钮: "开始探索" - 蓝渐变背景
   - 次按钮: "上传作品" - 透明背景 + 边框

**动画:**
- 入场: fade-in + slide-up, 600ms
- 背景: 极光流动效果 (可选)

### 3.3 交互式地图 (Leaflet)

**配置:**
```javascript
{
  center: [20, 0],
  zoom: 2,
  minZoom: 1,
  maxZoom: 18,
  zoomControl: false,
  attributionControl: false,
  scrollWheelZoom: false,
  dragging: false,
  doubleClickZoom: false,
}
```

**地图瓦片:** CartoDB Dark All (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`)

**滤镜:**
```css
filter: saturate(0.6) brightness(0.5);
```

### 3.4 照片坐标点 (Map Markers)

**样式:**
```css
/* 基础圆点 */
width: 12px;
height: 12px;
background: var(--accent-primary);
border-radius: 50%;

/* 发光效果 */
box-shadow:
  0 0 12px var(--accent-glow),
  0 0 24px rgba(59, 130, 246, 0.3);

/* 动画 */
animation: pulse-glow 2s ease-in-out infinite;
```

**状态:**
- 默认: 12px, 脉冲动画
- 悬停: 16px, 增强发光
- 选中: 20px, 显示照片预览

**交互:**
- 点击: 地图飞向该位置 + 显示照片信息卡片
- 悬停: 显示地点名称tooltip

### 3.5 精选照片网格 (Featured Photos Grid)

**布局:** CSS Grid, 响应式列数

**卡片样式:**
```css
aspect-ratio: 4 / 3;
border-radius: 12px;
overflow: hidden;
background: var(--bg-surface);
border: 1px solid var(--border-subtle);
transition: all 300ms ease;
```

**悬停效果:**
```css
transform: translateY(-4px);
border-color: var(--border-hover);
box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
```

**图片:**
```css
width: 100%;
height: 100%;
object-fit: cover;
transition: transform 500ms ease;
```

**悬停时放大:**
```css
img {
  transform: scale(1.05);
}
```

### 3.6 Footer 页脚

**样式:**
```css
background: var(--bg-secondary);
border-top: 1px solid var(--border-subtle);
padding: 24px 0;
```

**内容:**
```
[Logo]        [探索] [笔记] [上传]        © 2026
```

**移动端:** 垂直居中，间距调整

---

## 四、交互动效

### 4.1 页面加载动画

1. **Navbar:** 从顶部淡入, 200ms
2. **地图:** 渐显, 400ms
3. **Hero Card:** 从下方滑入 + 淡入, 600ms, 延迟200ms
4. **照片卡片:** 依次淡入, 每张延迟100ms

### 4.2 滚动动画

**Navbar:**
- 滚动 > 50px: 添加背景模糊
- 滚动 > 100px: 完全不透明背景

**照片卡片:**
- 进入视口: fade-in + slide-up (使用 Intersection Observer)

### 4.3 交互反馈

**按钮悬停:**
```css
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
```

**地图坐标点悬停:**
```css
transform: scale(1.3);
transition: transform 200ms ease;
```

---

## 五、技术实现要求

### 5.1 文件结构

```
src/
├── components/
│   ├── Navbar.astro
│   ├── HeroCard.astro
│   ├── MapMarker.astro
│   ├── PhotoCard.astro
│   ├── PhotoGrid.astro
│   └── Footer.astro
├── layouts/
│   └── Layout.astro
├── pages/
│   └── index.astro
└── styles/
    └── global.css
```

### 5.2 外部依赖

- Leaflet.js (地图)
- Tailwind CSS 4.x (样式)
- Material Symbols (图标)

### 5.3 图片资源

使用 Unsplash 示例图片:
```javascript
const featuredPhotos = [
  {
    id: 1,
    title: "洱海晨曦",
    location: "云南·大理",
    lat: 25.6065,
    lng: 100.2679,
    url: "https://images.unsplash.com/photo-1528183429752-8e2a3f8f94b9?w=800"
  },
  // ... 更多照片
];
```

---

## 六、设计对比参考

| 特性 | Lorenzo Bocchi | Typer | 本设计 |
|------|----------------|-------|--------|
| 风格 | 黑白极简 | 彩色趣味 | 深色磨砂 |
| 地图 | 全球坐标点 | 无 | 全球坐标点 |
| 动画 | 基础 | 丰富Keycap | 中等微交 |
| 色调 | 黑白 | 暖色系 | 蓝紫暗色 |

---

## 七、下一步

1. C酱根据本设计规格实现首页
2. R酱测试并截图记录
3. W酱 Review 截图确认效果

---

*本文档由 W酱 生成*
*灵感来源: One Page Love (Lorenzo Bocchi, Typer, Designfly)*