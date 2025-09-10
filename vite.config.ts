import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: {
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          nova: ['@/components/nova/NovaChatProvider', '@/components/nova/ChatLauncherPro']
        }
      }
    }
  },
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    fs: { strict: true },
    watch: {
      // voorkom dat Vite/Chokidar in serverless of build-artifacts gaat neuzen
      ignored: [
        "**/netlify/**",
        "**/functions/**",
        "**/.netlify/**",
        "**/dist/**",
      ],
    },
  },
  optimizeDeps: {
    // forceer een smalle entry zodat pre-transform stabiel blijft
    entries: ["index.html"],
  },
  clearScreen: false,
});