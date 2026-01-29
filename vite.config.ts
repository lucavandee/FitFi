import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import hostSweep from "./plugins/host-sweep";
import devCSP from "./plugins/dev-csp";

// Let op: geen 'node:path' conform architectuur-freeze.
const SRC_ALIAS = new URL("./src", import.meta.url).pathname;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const host = (env.VITE_CANONICAL_HOST || "https://fitfi.ai").replace(/\/+$/, "");

  return {
    plugins: [
      react(),
      // URL-sweep draait in dev én build; nul visuele impact.
      hostSweep({ host }),
      // CSP headers in development (mirrors production _headers)
      devCSP(),
    ],
    resolve: {
      alias: [{ find: "@", replacement: SRC_ALIAS }],
    },
    // Overige projectinstellingen blijven ongewijzigd
    server: {
      port: 5173,
      host: '0.0.0.0', // Luister op alle network interfaces voor Bolt preview
      strictPort: false,
    },
    build: {
      sourcemap: false,
      target: 'es2022',
      cssCodeSplit: true,
      rollupOptions: {
        external: [],
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor-react';
              }
              if (id.includes('framer-motion')) {
                return 'vendor-motion';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('@tanstack')) {
                return 'vendor-query';
              }
              if (id.includes('xlsx')) {
                return 'vendor-xlsx';
              }
              return 'vendor-misc';
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      chunkSizeWarningLimit: 1000,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info'],
        },
      },
    },
    define: {
      __FITFI_CANONICAL__: JSON.stringify(host),
    },
  };
});