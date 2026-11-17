// Standard Playwright configuration for TotMart FE E2E & Smoke suites.
// Uses standard local loopback 127.0.0.1; no hardcoded personal cache paths.
const { defineConfig, devices } = require('@playwright/test');

const fePort = process.env.FE_PORT || '3217';
const baseURL = process.env.FE_TEST_ORIGIN || `http://127.0.0.1:${fePort}`;

module.exports = defineConfig({
  testDir: './tests',
  testMatch: ['**/*e2e*.cjs', '**/*smoke*.cjs'],
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0, // Strict: no artificial retries to mask flakiness (F07.4)
  reporter: [
    ['list'],
    ['json', { outputFile: '.cache/playwright-results.json' }],
  ],
  use: {
    baseURL,
    headless: true,
    actionTimeout: 15000,
    navigationTimeout: 30000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'Desktop Chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'Mobile Chromium',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
});
