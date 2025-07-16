import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // ✅ .env automatisch laden op basis van mode (development, production, etc.)
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
    },
    // ✅ Injecteer alle .env variabelen in import.meta.env
    define: {
      'import.meta.env': {
        ...Object.fromEntries(Object.entries(env).map(([key, val]) => [key, JSON.stringify(val)]))
      }
    }
  };
});
