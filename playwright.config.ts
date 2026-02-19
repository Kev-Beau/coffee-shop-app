import { defineConfig, devices } from '@playwright/test';

/**
 * Beany Coffee Shop App - E2E & Visual Regression Testing Configuration
 *
 * This configuration supports testing across multiple viewports and devices
 * with a focus on mobile-first design testing.
 *
 * Test directories:
 * - .: Both e2e and visual-tests (configured via testMatch)
 */
export default defineConfig({
  testDir: './',
  testMatch: [
    '**/e2e/**/*.spec.ts',
    '**/visual-tests/**/*.spec.ts',
  ],
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    /* Screenshot settings for visual regression */
    screenshot: 'only-on-failure',
    /* Video settings */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers and mobile devices */
  projects: [
    /* Desktop browsers */
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },

    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },

    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },

    /* Mobile devices for keyboard interaction testing */
    {
      name: 'iphone-safari',
      use: {
        ...devices['iPhone 12 Pro'],
        hasTouch: true,
        isMobile: true,
        viewport: { width: 390, height: 844 },
      },
    },

    {
      name: 'android-chrome',
      use: {
        ...devices['Pixel 5'],
        hasTouch: true,
        isMobile: true,
        viewport: { width: 393, height: 851 },
      },
    },

    /* Tablet */
    {
      name: 'chromium-tablet',
      use: {
        ...devices['iPad (gen 7)'],
        viewport: { width: 810, height: 1080 },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
