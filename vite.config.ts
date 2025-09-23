// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isProd = mode === "production";
  const DEV_PORT = Number(env.VITE_PORT || 5173);
  const PREVIEW_PORT = Number(env.VITE_PREVIEW_PORT || 4173);
  const DROP = env.VITE_DROP_CONSOLE === "1" ? (["console", "debugger"] as const) : [];

  return {
    plugins: [react()],
    resolve: {
      alias: { "@": "/src" },
    },
    server: { host: true, port: DEV_PORT, strictPort: true },
    preview: { host: true, port: PREVIEW_PORT },
    css: { devSourcemap: !isProd },
    build: {
      target: "es2020",
      sourcemap: !isProd,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "data-vendor": ["@tanstack/react-query"],
            icons: ["lucide-react"],
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@tanstack/react-query",
        "react-helmet-async",
        "react-hot-toast",
        "lucide-react",
      ],
    },
    esbuild: {
      drop: DROP,
      legalComments: "none",
    },
  };
});