// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Minimal & Bolt-safe: geen node:path, alias netjes als object literal.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});