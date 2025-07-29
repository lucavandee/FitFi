// vite.config.ts
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import Inspect from "file:///home/project/node_modules/vite-plugin-inspect/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      react({
        jsxRuntime: "automatic",
        jsxImportSource: "react"
      }),
      Inspect()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    define: {
      // Only expose non-sensitive environment variables
      "import.meta.env": {
        ...Object.entries(env).filter(([key]) => key.startsWith("VITE_")).reduce((acc, [key, val]) => {
          acc[key] = JSON.stringify(val);
          return acc;
        }, {})
      }
    },
    optimizeDeps: {
      include: ["lucide-react"],
      exclude: ["backend"]
    },
    server: {
      port: 3e3,
      open: true,
      fs: {
        strict: true,
        allow: ["src", "node_modules"]
      },
      middlewareMode: false,
      // Prevent serving HTML for JS/CSS assets
      proxy: {},
      headers: {
        // Security headers for development
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block"
      }
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      // Security: Don't expose source maps in production
      sourcemap: mode === "development",
      // Ensure proper asset naming and chunking
      rollupOptions: {
        output: {
          entryFileNames: (chunkInfo) => {
            return chunkInfo.name === "index" ? "assets/index-[hash].js" : "assets/[name]-[hash].js";
          },
          chunkFileNames: (chunkInfo) => {
            return `assets/chunk-${chunkInfo.name}-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name || "";
            const extType = info.split(".").pop() || "";
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `assets/images/[name]-[hash].[ext]`;
            }
            if (/css/i.test(extType)) {
              return `assets/styles/[name]-[hash].[ext]`;
            }
            return `assets/[name]-[hash].[ext]`;
          },
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
            ui: ["lucide-react"],
            engine: ["./src/engine/recommendationEngine"],
            utils: ["./src/utils/analytics", "./src/utils/imageUtils"]
          }
        },
        // Prevent circular dependencies that could cause loading issues
        external: (id) => {
          return false;
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IEluc3BlY3QgZnJvbSBcInZpdGUtcGx1Z2luLWluc3BlY3RcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpKTtcblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KHtcbiAgICAgICAganN4UnVudGltZTogXCJhdXRvbWF0aWNcIixcbiAgICAgICAganN4SW1wb3J0U291cmNlOiBcInJlYWN0XCIsXG4gICAgICB9KSxcbiAgICAgIEluc3BlY3QoKSxcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgLy8gT25seSBleHBvc2Ugbm9uLXNlbnNpdGl2ZSBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAgICAgIFwiaW1wb3J0Lm1ldGEuZW52XCI6IHtcbiAgICAgICAgLi4uT2JqZWN0LmVudHJpZXMoZW52KVxuICAgICAgICAgIC5maWx0ZXIoKFtrZXldKSA9PiBrZXkuc3RhcnRzV2l0aCgnVklURV8nKSlcbiAgICAgICAgICAucmVkdWNlKChhY2MsIFtrZXksIHZhbF0pID0+IHtcbiAgICAgICAgICAgIGFjY1trZXldID0gSlNPTi5zdHJpbmdpZnkodmFsKTtcbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgfSwge30pLFxuICAgICAgfSxcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgaW5jbHVkZTogW1wibHVjaWRlLXJlYWN0XCJdLFxuICAgICAgZXhjbHVkZTogW1wiYmFja2VuZFwiXSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogMzAwMCxcbiAgICAgIG9wZW46IHRydWUsXG4gICAgICBmczogeyBcbiAgICAgICAgc3RyaWN0OiB0cnVlLFxuICAgICAgICBhbGxvdzogWydzcmMnLCAnbm9kZV9tb2R1bGVzJ11cbiAgICAgIH0sXG4gICAgICBtaWRkbGV3YXJlTW9kZTogZmFsc2UsXG4gICAgICAvLyBQcmV2ZW50IHNlcnZpbmcgSFRNTCBmb3IgSlMvQ1NTIGFzc2V0c1xuICAgICAgcHJveHk6IHt9LFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAvLyBTZWN1cml0eSBoZWFkZXJzIGZvciBkZXZlbG9wbWVudFxuICAgICAgICAnWC1Db250ZW50LVR5cGUtT3B0aW9ucyc6ICdub3NuaWZmJyxcbiAgICAgICAgJ1gtRnJhbWUtT3B0aW9ucyc6ICdERU5ZJyxcbiAgICAgICAgJ1gtWFNTLVByb3RlY3Rpb24nOiAnMTsgbW9kZT1ibG9jaydcbiAgICAgIH1cbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6IFwiZGlzdFwiLFxuICAgICAgYXNzZXRzRGlyOiBcImFzc2V0c1wiLFxuICAgICAgLy8gU2VjdXJpdHk6IERvbid0IGV4cG9zZSBzb3VyY2UgbWFwcyBpbiBwcm9kdWN0aW9uXG4gICAgICBzb3VyY2VtYXA6IG1vZGUgPT09ICdkZXZlbG9wbWVudCcsXG4gICAgICAvLyBFbnN1cmUgcHJvcGVyIGFzc2V0IG5hbWluZyBhbmQgY2h1bmtpbmdcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6IChjaHVua0luZm8pID0+IHtcbiAgICAgICAgICAgIC8vIEVuc3VyZSBtYWluIGVudHJ5IGhhcyBjb25zaXN0ZW50IG5hbWluZ1xuICAgICAgICAgICAgcmV0dXJuIGNodW5rSW5mby5uYW1lID09PSAnaW5kZXgnIFxuICAgICAgICAgICAgICA/ICdhc3NldHMvaW5kZXgtW2hhc2hdLmpzJ1xuICAgICAgICAgICAgICA6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcyc7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogKGNodW5rSW5mbykgPT4ge1xuICAgICAgICAgICAgLy8gUHJldmVudCBjb25mbGljdHMgd2l0aCBIVE1MIHJvdXRlc1xuICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvY2h1bmstJHtjaHVua0luZm8ubmFtZX0tW2hhc2hdLmpzYDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiAoYXNzZXRJbmZvKSA9PiB7XG4gICAgICAgICAgICAvLyBPcmdhbml6ZSBhc3NldHMgYnkgdHlwZVxuICAgICAgICAgICAgY29uc3QgaW5mbyA9IGFzc2V0SW5mby5uYW1lIHx8ICcnO1xuICAgICAgICAgICAgY29uc3QgZXh0VHlwZSA9IGluZm8uc3BsaXQoJy4nKS5wb3AoKSB8fCAnJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKC9wbmd8anBlP2d8c3ZnfGdpZnx0aWZmfGJtcHxpY28vaS50ZXN0KGV4dFR5cGUpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBgYXNzZXRzL2ltYWdlcy9bbmFtZV0tW2hhc2hdLltleHRdYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgvY3NzL2kudGVzdChleHRUeXBlKSkge1xuICAgICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9zdHlsZXMvW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdYDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgICAgcm91dGVyOiBbJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAgIHVpOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICAgICAgICAgICAgZW5naW5lOiBbJy4vc3JjL2VuZ2luZS9yZWNvbW1lbmRhdGlvbkVuZ2luZSddLFxuICAgICAgICAgICAgdXRpbHM6IFsnLi9zcmMvdXRpbHMvYW5hbHl0aWNzJywgJy4vc3JjL3V0aWxzL2ltYWdlVXRpbHMnXVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gUHJldmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMgdGhhdCBjb3VsZCBjYXVzZSBsb2FkaW5nIGlzc3Vlc1xuICAgICAgICBleHRlcm5hbDogKGlkKSA9PiB7XG4gICAgICAgICAgLy8gRG9uJ3QgZXh0ZXJuYWxpemUgYW55dGhpbmcgdGhhdCBzaG91bGQgYmUgYnVuZGxlZFxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxjQUFjLGVBQWU7QUFDL1AsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sYUFBYTtBQUNwQixPQUFPLFVBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxN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
