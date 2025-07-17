import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react({
        jsxRuntime: "automatic",
        jsxImportSource: "react",
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env": {
        ...Object.entries(env).reduce((acc, [key, val]) => {
          acc[key] = JSON.stringify(val);
          return acc;
        }, {}),
      },
    },
    optimizeDeps: {
      exclude: ["lucide-react"],
    },
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      rollupOptions: {
        // Ensure proper handling of worker files and prevent MIME type issues
        output: {
          // Don't try to load non-existent workers
          manualChunks: undefined,
        },
        external: [
          // Exclude fetch.worker.js if it's causing MIME type issues
          /fetch\.worker\.js$/
        ]
      }
    },
  };
});
