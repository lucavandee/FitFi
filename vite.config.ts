import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: {
      sourcemap: true,
      target: "es2020",
      outDir: "dist",
      emptyOutDir: true,
    },
    server: {
      port: 5173,
      strictPort: false,
    },
    preview: {
      port: 4173,
      strictPort: false,
    },
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_ENVIRONMENT || "development"),
    },
  };
});