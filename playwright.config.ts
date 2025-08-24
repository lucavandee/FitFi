import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:8888",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  // Als E2E_BASE_URL niet gezet is, starten we lokaal 'netlify dev'
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "netlify dev",
        url: "http://localhost:8888",
        timeout: 60_000,
        reuseExistingServer: !process.env.CI,
        env: {
          // Secrets komen mee vanuit GitHub Actions env (zie workflow)
          OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
          VITE_NOVA_DEBUG: process.env.VITE_NOVA_DEBUG || "true",
        },
      },
});
