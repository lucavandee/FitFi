import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8888',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: 'netlify dev',      // start Vite + Netlify Functions
    url: 'http://localhost:8888',
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
    env: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      VITE_NOVA_DEBUG: 'true',
    },
  },
});