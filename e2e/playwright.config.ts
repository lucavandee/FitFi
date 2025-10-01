import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "https://fitfi.ai";

export default defineConfig({
  testDir: "./",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "Mobile Chrome", use: { ...devices["Pixel 7"] } },
    { name: "Desktop Chrome", use: { ...devices["Desktop Chrome"] } },
  ],
});