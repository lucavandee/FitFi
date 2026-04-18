import { defineConfig } from "vitest/config";

const SRC_ALIAS = new URL("./src", import.meta.url).pathname;

export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: SRC_ALIAS }],
  },
  test: {
    environment: "node",
    include: ["src/__tests__/**/*.test.ts", "src/__tests__/**/*.test.tsx"],
    exclude: ["node_modules", "dist", "e2e", ".netlify", "netlify"],
    globals: false,
    reporters: ["default"],
    passWithNoTests: false,
  },
});
