import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: process.env.CI ? 60000 : 30000, // CI needs longer test timeout
  expect: {
    timeout: process.env.CI ? 10000 : 5000,
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  use: {
    baseURL: process.env.PREVIEW_URL || 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'on',
    navigationTimeout: process.env.CI ? 30000 : 15000, // Increase navigation timeout for CI
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
