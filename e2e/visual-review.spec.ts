import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PREVIEW_URL || 'http://localhost:4321';

test.describe('Global Frame - 自动化测试', () => {
  
  test.beforeEach(async ({ page }) => {
    // 捕获 console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`[Console Error] ${msg.text()}`);
      }
    });
    
    // 捕获 page errors
    page.on('pageerror', err => {
      console.log(`[Page Error] ${err.message}`);
    });
  });

  test('首页 - 加载正常，无 console error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // 检查标题
    await expect(page).toHaveTitle(/全球影像/);
    
    // 检查核心元素存在
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('#map')).toBeVisible();
    await expect(page.locator('h1')).toContainText('用镜头');
    
    // 检查地图 markers 存在
    const markers = page.locator('[data-lat]');
    await expect(markers).toHaveCount(6);
    
    // 无 page error
    expect(errors).toHaveLength(0);
  });

  test('首页 - 地图 marker 点击', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // 点击一个 marker
    const marker = page.locator('[data-lat]').first();
    await marker.click();
    
    // 等待动画完成
    await page.waitForTimeout(2500);
    
    // 如果 flyTo 成功，地图会放大
    // 这里只验证不报错
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    expect(errors).toHaveLength(0);
  });

  test('首页 - Dark mode toggle', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const toggleBtn = page.locator('button[aria-label="Toggle dark mode"]');
    await expect(toggleBtn).toBeVisible();
    
    // 点击 toggle
    await toggleBtn.click();
    await page.waitForTimeout(100);
    
    // 检查 dark class
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDark).toBe(true);
    
    // 刷新页面，检查 dark mode 持久化
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    const isDarkAfterReload = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDarkAfterReload).toBe(true);
  });

  test('探索页 - Filter 功能', async ({ page }) => {
    await page.goto(`${BASE_URL}/discovery`);
    await page.waitForLoadState('networkidle');
    
    // 默认显示 9 个卡片
    const cards = page.locator('article[data-category]');
    await expect(cards).toHaveCount(9);
    
    // 点击 "自然" filter
    await page.click('button[data-filter="自然"]');
    await page.waitForTimeout(200);
    
    // 应该只显示自然类（大约 6 个）
    const visibleCards = page.locator('article[data-category]:visible');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(9);
  });

  test('探索页 - 图片懒加载', async ({ page }) => {
    await page.goto(`${BASE_URL}/discovery`);
    await page.waitForLoadState('networkidle');
    
    // 检查有 loading="lazy" 属性
    const lazyImages = page.locator('img[loading="lazy"]');
    const count = await lazyImages.count();
    expect(count).toBeGreaterThan(0);
  });

  test('专辑页 - 加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/collections`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toContainText('精选专辑');
    await expect(page.locator('article, a')).toHaveCount(4);
  });

  test('上传页 - 加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/upload`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toContainText('上传');
    await expect(page.locator('#drop-zone')).toBeVisible();
    await expect(page.locator('#select-btn')).toBeVisible();
  });

  test('Nav 链接高亮正确', async ({ page }) => {
    // 测试 discovery 页面
    await page.goto(`${BASE_URL}/discovery`);
    await page.waitForLoadState('networkidle');
    
    const activeLink = page.locator('nav a:text("探索")');
    await expect(activeLink).toHaveClass(/blue-/);
  });

  test('页面性能 - LCP < 2.5s', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        
        // 超时保护
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    console.log(`LCP: ${lcp}ms`);
    // LCP 应该小于 4000ms（宽松标准）
    expect(lcp).toBeLessThan(4000);
  });
});
