import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react({
        jsxRuntime: "automatic",
        jsxImportSource: "react",
      }),
      VitePWA({
        registerType: 'autoUpdate',
        filename: 'sw.js',
        includeAssets: ['favicon.svg', 'placeholder.png'],
        manifest: {
          name: 'FitFi - AI Style Recommendations',
          short_name: 'FitFi',
          start_url: '/',
          display: 'standalone',
          theme_color: '#0D1B2A',
          background_color: '#FAF8F6'
        }
      })
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
      include: ["lucide-react"],
      exclude: ["backend"],
    },
    server: {
      port: 3000,
      open: true,
      fs: { 
        strict: true,
        allow: ['src', 'node_modules']
      },
      middlewareMode: false,
      // Prevent serving HTML for JS/CSS assets
      proxy: {},
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      assetsDir: "assets",
      // Ensure proper asset naming and chunking
      rollupOptions: {
        output: {
          entryFileNames: (chunkInfo) => {
            // Ensure main entry has consistent naming
            return chunkInfo.name === 'index' 
              ? 'assets/index-[hash].js'
              : 'assets/[name]-[hash].js';
          },
          chunkFileNames: (chunkInfo) => {
            // Prevent conflicts with HTML routes
            return `assets/chunk-${chunkInfo.name}-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            // Organize assets by type
            const info = assetInfo.name || '';
            const extType = info.split('.').pop() || '';
            
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `assets/images/[name]-[hash].[ext]`;
            }
            if (/css/i.test(extType)) {
              return `assets/styles/[name]-[hash].[ext]`;
            }
            return `assets/[name]-[hash].[ext]`;
          },
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['lucide-react', 'framer-motion']
          }
        },
        // Prevent circular dependencies that could cause loading issues
        external: (id) => {
          // Don't externalize anything that should be bundled
          return false;
        }
      }
    },
  };
});
