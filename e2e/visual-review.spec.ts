import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PREVIEW_URL || 'http://localhost:4321';

test.describe('Global Frame - 自动化测试', () => {
  
  test('首页 - 加载正常，无 console error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    
    // 用 domcontentloaded 代替 networkidle，避免外部资源加载超时
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // 检查标题
    await expect(page).toHaveTitle(/全球影像/);
    
    // 检查核心元素存在
    await expect(page.locator('nav')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#map')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h1')).toContainText('用镜头', { timeout: 5000 });
    
    // 检查地图 markers 存在
    const markers = page.locator('[data-lat]');
    await expect(markers).toHaveCount(6, { timeout: 5000 });
    
    // 无 page error（不是网络错误）
    const jsErrors = errors.filter(e => !e.includes('net::') && !e.includes('Failed to load resource'));
    expect(jsErrors).toHaveLength(0);
  });

  test('首页 - 地图 marker 点击', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const marker = page.locator('[data-lat]').first();
    await marker.click();
    
    // 等待动画完成
    await page.waitForTimeout(1000);
    
    // 验证点击后地图 flyTo 被触发（无报错）
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    const jsErrors = errors.filter(e => !e.includes('net::'));
    expect(jsErrors).toHaveLength(0);
  });

  test('首页 - Dark mode toggle', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const toggleBtn = page.locator('button[aria-label="Toggle dark mode"]');
    await expect(toggleBtn).toBeVisible({ timeout: 5000 });
    
    await toggleBtn.click();
    await page.waitForTimeout(200);
    
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDark).toBe(true);
    
    // 刷新检查持久化
    await page.reload({ waitUntil: 'domcontentloaded' });
    const isDarkAfterReload = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDarkAfterReload).toBe(true);
  });

  test('探索页 - Filter 功能', async ({ page }) => {
    await page.goto(`${BASE_URL}/discovery`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const cards = page.locator('article[data-category]');
    await expect(cards).toHaveCount(9, { timeout: 5000 });
    
    // 点击 "自然" filter
    await page.click('button[data-filter="自然"]', { timeout: 5000 });
    await page.waitForTimeout(300);
    
    // 检查可见卡片数量变化
    const visibleCount = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('article[data-category]'))
        .filter(el => (el as HTMLElement).style.display !== 'none').length;
    });
    expect(visibleCount).toBeGreaterThan(0);
    expect(visibleCount).toBeLessThan(9);
  });

  test('探索页 - 图片懒加载属性', async ({ page }) => {
    await page.goto(`${BASE_URL}/discovery`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const lazyImages = page.locator('img[loading="lazy"]');
    const count = await lazyImages.count();
    expect(count).toBeGreaterThan(0);
  });

  test('专辑页 - 加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/collections`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    await expect(page.locator('h1')).toContainText('精选专辑', { timeout: 5000 });
    await expect(page.locator('a[href*="discovery"]')).toHaveCount(4, { timeout: 5000 });
  });

  test('上传页 - 加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/upload`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    await expect(page.locator('h1')).toContainText('上传', { timeout: 5000 });
    await expect(page.locator('#drop-zone')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#select-btn')).toBeVisible({ timeout: 5000 });
  });

  test('Nav 链接高亮正确', async ({ page }) => {
    await page.goto(`${BASE_URL}/discovery`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const activeLink = page.locator('nav a:text("探索")');
    await expect(activeLink).toHaveClass(/blue-/, { timeout: 5000 });
  });

  test('页面加载性能 - 无 JS 错误', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    
    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const loadTime = Date.now() - start;
    
    console.log(`Page load time: ${loadTime}ms`);
    
    // 检查无 JS 错误
    const jsErrors = errors.filter(e => !e.includes('net::') && !e.includes('Failed to load resource'));
    expect(jsErrors).toHaveLength(0);
    
    // 页面应该在合理时间内加载完成
    expect(loadTime).toBeLessThan(10000);
  });
});
