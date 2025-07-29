// @ts-check
const AxeBuilder = require('@axe-core/playwright').default;
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Accessibility testing */
    use: { ...devices['Desktop Chrome'], axeBuilder: AxeBuilder },
    
    /* Timeout for each action */
    actionTimeout: 10000,
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure'
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Global setup and teardown */
  globalSetup: path.resolve(__dirname, './tests/global-setup.cjs'),
  globalTeardown: path.resolve(__dirname, './tests/global-teardown.cjs')
});