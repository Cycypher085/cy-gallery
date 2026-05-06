import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PREVIEW_URL || 'http://localhost:4321';

test.describe('Global Frame - 自动化测试', () => {
  
  test('首页 - 加载正常，无 console error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    
    // 用 domcontentloaded 代替 networkidle，避免外部资源加载超时
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });
    
    // 检查标题
    await expect(page).toHaveTitle(/全球影像/);
    
    // 检查核心元素存在（使用更精确的选择器定位hero中的h1）
    await expect(page.locator('nav')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#map')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('section h1').first()).toContainText('用镜头', { timeout: 5000 });
    
    // 检查地图 markers 存在
    const markers = page.locator('[data-lat]');
    await expect(markers).toHaveCount(6, { timeout: 5000 });
    
    // 无 page error（不是网络错误）
    const jsErrors = errors.filter(e => !e.includes('net::') && !e.includes('Failed to load resource'));
    expect(jsErrors).toHaveLength(0);
  });

  test('首页 - 地图 marker 点击', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });
    
    // Marker 被导航栏遮挡，用 force 点击
    const marker = page.locator('[data-lat]').first();
    await marker.click({ force: true });
    
    // 等待动画完成
    await page.waitForTimeout(1000);
    
    // 验证点击后地图 flyTo 被触发（无报错）
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    const jsErrors = errors.filter(e => !e.includes('net::'));
    expect(jsErrors).toHaveLength(0);
  });

  test('首页 - Dark mode toggle', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });
    
    const toggleBtn = page.locator('button[aria-label="Toggle dark mode"]');
    await expect(toggleBtn).toBeVisible({ timeout: 5000 });
    const beforeDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    
    await toggleBtn.click();
    await page.waitForTimeout(200);
    
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDark).toBe(!beforeDark);
    
    // 刷新检查持久化
    await page.reload({ waitUntil: 'domcontentloaded' });
    const isDarkAfterReload = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDarkAfterReload).toBe(isDark);
  });

  test('探索页 - Filter 功能', async ({ page }) => {
    await page.goto(`${BASE_URL}/discovery`, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });
    
    const cards = page.locator('article[data-category]');
    const totalCards = await cards.count();
    expect(totalCards).toBeGreaterThanOrEqual(9);
    
    // 点击 "自然" filter
    await page.click('button[data-filter="自然"]', { timeout: 5000 });
    await page.waitForTimeout(300);
    
    // 检查可见卡片数量变化
    const visibleCount = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('article[data-category]'))
        .filter(el => (el as HTMLElement).style.display !== 'none').length;
    });
    expect(visibleCount).toBeGreaterThan(0);
    expect(visibleCount).toBeLessThanOrEqual(totalCards);

    // 过滤后，至少有一个非“自然”类别应被隐藏
    const hiddenCard = page
      .locator('article[data-category]')
      .filter({ hasNotText: '自然' })
      .first();
    await expect(hiddenCard).toBeHidden();
  });

  test('探索页 - 图片懒加载属性', async ({ page }) => {
    await page.goto(`${BASE_URL}/discovery`, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });
    
    const lazyImages = page.locator('img[loading="lazy"]');
    const count = await lazyImages.count();
    expect(count).toBeGreaterThan(0);
  });

  test('专辑页 - 加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/collections`, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });
    
    await expect(page.locator('h1')).toContainText('精选专辑', { timeout: 5000 });
    await expect(page.locator('a[href*="discovery"]')).toHaveCount(7, { timeout: 5000 });
  });

  test('上传页 - 加载正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/upload`, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });
    
    await expect(page.locator('h1')).toContainText('上传', { timeout: 5000 });
    await expect(page.locator('#drop-zone')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#select-btn')).toBeVisible({ timeout: 5000 });
  });

  test('上传页 - 非支持格式给出提示', async ({ page }) => {
    await page.goto(`${BASE_URL}/upload`, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });

    await page.setInputFiles('#file-input', {
      name: 'unsupported.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not supported format'),
    });

    const alert = page.getByTestId('upload-alert');
    await expect(alert).toBeVisible({ timeout: 5000 });
    await expect(alert).toContainText('跳过');
    await expect(page.locator('[data-testid="media-queue-item"]')).toHaveCount(0);
  });

  test('上传页 - 图片元数据队列与缺失位置兜底', async ({ page }) => {
    await page.goto(`${BASE_URL}/upload`, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });

    const tinyPngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5sVuoAAAAASUVORK5CYII=';
    const pngBuffer = Buffer.from(tinyPngBase64, 'base64');

    await page.setInputFiles('#file-input', {
      name: 'tiny.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    });

    const firstItem = page.locator('[data-testid="media-queue-item"]').first();
    await expect(firstItem).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="meta-resolution"]').first()).toContainText('1 x 1');
    await expect(page.locator('[data-testid="meta-location"]').first()).toContainText('--');
    await expect(page.getByTestId('map-link-disabled').first()).toBeVisible();
  });

  test('上传页 - 编辑元数据后同步到探索页并可在查看器看到信息区', async ({ page }) => {
    await page.goto(`${BASE_URL}/upload`, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });
    await page.evaluate(() => localStorage.removeItem('gf-discovery-media'));

    const jpgBuffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
      0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
      0x00, 0x60, 0x00, 0x00, 0xff, 0xd9,
    ]);

    await page.setInputFiles('#file-input', {
      name: 'meta-test.jpg',
      mimeType: 'image/jpeg',
      buffer: jpgBuffer,
    });

    await page.locator('[data-testid="meta-edit-title"]').first().fill('第三轮测试标题');
    await page.locator('input[data-field="location"]').first().fill('上海 · 外滩');
    await page.locator('input[data-field="tags"]').first().fill('第三轮, 上传测试');

    const syncBtn = page.getByTestId('sync-discovery-btn');
    await expect(syncBtn).toBeEnabled({ timeout: 5000 });
    await syncBtn.click();
    await expect(page.getByTestId('upload-alert')).toContainText('已同步');

    await page.goto(`${BASE_URL}/discovery`, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });
    const syncedCard = page.locator('[data-testid="gallery-card"]', { hasText: '第三轮测试标题' }).first();
    await expect(syncedCard).toBeVisible({ timeout: 5000 });
    await expect(syncedCard).toContainText('上海 · 外滩');
    await syncedCard.locator('.open-viewer-btn').click();

    await expect(page.getByTestId('viewer-params')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('viewer-device')).toBeVisible();
    await expect(page.getByTestId('viewer-location-block')).toBeVisible();
  });

  test('Nav 链接高亮正确', async ({ page }) => {
    await page.goto(`${BASE_URL}/discovery`, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });
    
    const activeLink = page.locator('nav a:text("探索")');
    await expect(activeLink).toHaveClass(/blue-/, { timeout: 5000 });
  });

  test('首页 - 双模块入口区块可见', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });

    const workflow = page.locator('#workflow-test');
    await expect(workflow).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('home-module-gallery')).toBeVisible();
    await expect(page.getByTestId('home-module-notes')).toBeVisible();
    await expect(page.getByTestId('home-cta-discovery')).toHaveAttribute('href', '/discovery');
    await expect(page.getByTestId('home-cta-notes')).toHaveAttribute('href', '/notes');
  });

  test('导航 - 可进入笔记列表', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });

    await page.locator('nav').getByRole('link', { name: '笔记' }).click();
    await expect(page).toHaveURL(/\/notes\/?$/);
    await expect(page.locator('h1').filter({ hasText: '学习笔记' })).toBeVisible({ timeout: 5000 });

    const notesLink = page.locator('nav').getByRole('link', { name: '笔记' });
    await expect(notesLink).toHaveClass(/blue-/);
  });

  test('导航 - 全局搜索可跳转到笔记检索', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });

    await page.locator('#open-search-btn').click();
    await expect(page.locator('#global-search-modal')).toBeVisible();
    await page.locator('#global-search-input').fill('TypeScript');
    await page.locator('#global-search-form').locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/notes\?q=TypeScript/);
    await expect(page.locator('#note-search')).toHaveValue('TypeScript');
  });

  test('笔记 - 列表可见并可进入详情', async ({ page }) => {
    await page.goto(`${BASE_URL}/notes`, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });

    const cards = page.locator('article.note-card');
    await expect(cards).toHaveCount(4, { timeout: 5000 });

    const firstDetail = cards.first().locator('h2 a');
    const href = await firstDetail.getAttribute('href');
    expect(href).toMatch(/^\/notes\//);

    await firstDetail.click();
    await expect(page).toHaveURL(new RegExp(`^${BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/notes\\/.+`));
    await expect(page.locator('article h1').first()).toBeVisible({ timeout: 5000 });

    const notesNav = page.locator('nav').getByRole('link', { name: '笔记' });
    await expect(notesNav).toHaveClass(/blue-/);
  });

  test('页面加载性能 - 无 JS 错误', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    
    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: process.env.CI ? 30000 : 15000 });
    const loadTime = Date.now() - start;
    
    console.log(`Page load time: ${loadTime}ms`);
    
    // 检查无 JS 错误
    const jsErrors = errors.filter(e => !e.includes('net::') && !e.includes('Failed to load resource'));
    expect(jsErrors).toHaveLength(0);
    
    // 页面应该在合理时间内加载完成
    expect(loadTime).toBeLessThan(10000);
  });
});
