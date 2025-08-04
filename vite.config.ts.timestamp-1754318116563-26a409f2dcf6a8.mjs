// vite.config.ts
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      react({
        jsxRuntime: "automatic",
        jsxImportSource: "react"
      })
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
      // Performance optimizations
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === "production",
          drop_debugger: true
        }
      },
      // Chunk size warnings
      chunkSizeWarningLimit: 1e3,
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
            // Core React chunks
            "react-vendor": ["react", "react-dom"],
            "react-router": ["react-router-dom"],
            // UI Library chunks
            "ui-icons": ["lucide-react"],
            "ui-components": ["@headlessui/react"],
            // FitFi Engine chunks
            "fitfi-engine": [
              "./src/engine/recommendationEngine",
              "./src/engine/generateOutfits",
              "./src/engine/profile-mapping"
            ],
            // Services chunks
            "fitfi-services": [
              "./src/services/DataRouter",
              "./src/services/boltService",
              "./src/services/supabaseService"
            ],
            // Utils chunks
            "fitfi-utils": [
              "./src/utils/analytics",
              "./src/utils/imageUtils",
              "./src/utils/userUtils"
            ],
            // Context chunks
            "fitfi-context": [
              "./src/context/UserContext",
              "./src/context/GamificationContext",
              "./src/context/OnboardingContext"
            ]
          }
        },
        // Prevent circular dependencies that could cause loading issues
        external: (id) => {
          return false;
        }
      }
    },
    // Image optimization
    assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg"]
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IEluc3BlY3QgZnJvbSBcInZpdGUtcGx1Z2luLWluc3BlY3RcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpKTtcblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KHtcbiAgICAgICAganN4UnVudGltZTogXCJhdXRvbWF0aWNcIixcbiAgICAgICAganN4SW1wb3J0U291cmNlOiBcInJlYWN0XCIsXG4gICAgICB9KSxcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgLy8gT25seSBleHBvc2Ugbm9uLXNlbnNpdGl2ZSBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAgICAgIFwiaW1wb3J0Lm1ldGEuZW52XCI6IHtcbiAgICAgICAgLi4uT2JqZWN0LmVudHJpZXMoZW52KVxuICAgICAgICAgIC5maWx0ZXIoKFtrZXldKSA9PiBrZXkuc3RhcnRzV2l0aCgnVklURV8nKSlcbiAgICAgICAgICAucmVkdWNlKChhY2MsIFtrZXksIHZhbF0pID0+IHtcbiAgICAgICAgICAgIGFjY1trZXldID0gSlNPTi5zdHJpbmdpZnkodmFsKTtcbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgfSwge30pLFxuICAgICAgfSxcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgaW5jbHVkZTogW1wibHVjaWRlLXJlYWN0XCJdLFxuICAgICAgZXhjbHVkZTogW1wiYmFja2VuZFwiXSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogMzAwMCxcbiAgICAgIG9wZW46IHRydWUsXG4gICAgICBmczogeyBcbiAgICAgICAgc3RyaWN0OiB0cnVlLFxuICAgICAgICBhbGxvdzogWydzcmMnLCAnbm9kZV9tb2R1bGVzJ11cbiAgICAgIH0sXG4gICAgICBtaWRkbGV3YXJlTW9kZTogZmFsc2UsXG4gICAgICAvLyBQcmV2ZW50IHNlcnZpbmcgSFRNTCBmb3IgSlMvQ1NTIGFzc2V0c1xuICAgICAgcHJveHk6IHt9LFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAvLyBTZWN1cml0eSBoZWFkZXJzIGZvciBkZXZlbG9wbWVudFxuICAgICAgICAnWC1Db250ZW50LVR5cGUtT3B0aW9ucyc6ICdub3NuaWZmJyxcbiAgICAgICAgJ1gtRnJhbWUtT3B0aW9ucyc6ICdERU5ZJyxcbiAgICAgICAgJ1gtWFNTLVByb3RlY3Rpb24nOiAnMTsgbW9kZT1ibG9jaydcbiAgICAgIH1cbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6IFwiZGlzdFwiLFxuICAgICAgYXNzZXRzRGlyOiBcImFzc2V0c1wiLFxuICAgICAgLy8gU2VjdXJpdHk6IERvbid0IGV4cG9zZSBzb3VyY2UgbWFwcyBpbiBwcm9kdWN0aW9uXG4gICAgICBzb3VyY2VtYXA6IG1vZGUgPT09ICdkZXZlbG9wbWVudCcsXG4gICAgICAvLyBQZXJmb3JtYW5jZSBvcHRpbWl6YXRpb25zXG4gICAgICBtaW5pZnk6ICd0ZXJzZXInLFxuICAgICAgdGVyc2VyT3B0aW9uczoge1xuICAgICAgICBjb21wcmVzczoge1xuICAgICAgICAgIGRyb3BfY29uc29sZTogbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nLFxuICAgICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgLy8gQ2h1bmsgc2l6ZSB3YXJuaW5nc1xuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICAgICAgLy8gRW5zdXJlIHByb3BlciBhc3NldCBuYW1pbmcgYW5kIGNodW5raW5nXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAoY2h1bmtJbmZvKSA9PiB7XG4gICAgICAgICAgICAvLyBFbnN1cmUgbWFpbiBlbnRyeSBoYXMgY29uc2lzdGVudCBuYW1pbmdcbiAgICAgICAgICAgIHJldHVybiBjaHVua0luZm8ubmFtZSA9PT0gJ2luZGV4JyBcbiAgICAgICAgICAgICAgPyAnYXNzZXRzL2luZGV4LVtoYXNoXS5qcydcbiAgICAgICAgICAgICAgOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgY2h1bmtGaWxlTmFtZXM6IChjaHVua0luZm8pID0+IHtcbiAgICAgICAgICAgIC8vIFByZXZlbnQgY29uZmxpY3RzIHdpdGggSFRNTCByb3V0ZXNcbiAgICAgICAgICAgIHJldHVybiBgYXNzZXRzL2NodW5rLSR7Y2h1bmtJbmZvLm5hbWV9LVtoYXNoXS5qc2A7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbykgPT4ge1xuICAgICAgICAgICAgLy8gT3JnYW5pemUgYXNzZXRzIGJ5IHR5cGVcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSBhc3NldEluZm8ubmFtZSB8fCAnJztcbiAgICAgICAgICAgIGNvbnN0IGV4dFR5cGUgPSBpbmZvLnNwbGl0KCcuJykucG9wKCkgfHwgJyc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICgvcG5nfGpwZT9nfHN2Z3xnaWZ8dGlmZnxibXB8aWNvL2kudGVzdChleHRUeXBlKSkge1xuICAgICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9pbWFnZXMvW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoL2Nzcy9pLnRlc3QoZXh0VHlwZSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvc3R5bGVzL1tuYW1lXS1baGFzaF0uW2V4dF1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgIC8vIENvcmUgUmVhY3QgY2h1bmtzXG4gICAgICAgICAgICAncmVhY3QtdmVuZG9yJzogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgICAgICAgICAgICdyZWFjdC1yb3V0ZXInOiBbJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVUkgTGlicmFyeSBjaHVua3NcbiAgICAgICAgICAgICd1aS1pY29ucyc6IFsnbHVjaWRlLXJlYWN0J10sXG4gICAgICAgICAgICAndWktY29tcG9uZW50cyc6IFsnQGhlYWRsZXNzdWkvcmVhY3QnXSxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gRml0RmkgRW5naW5lIGNodW5rc1xuICAgICAgICAgICAgJ2ZpdGZpLWVuZ2luZSc6IFtcbiAgICAgICAgICAgICAgJy4vc3JjL2VuZ2luZS9yZWNvbW1lbmRhdGlvbkVuZ2luZScsXG4gICAgICAgICAgICAgICcuL3NyYy9lbmdpbmUvZ2VuZXJhdGVPdXRmaXRzJyxcbiAgICAgICAgICAgICAgJy4vc3JjL2VuZ2luZS9wcm9maWxlLW1hcHBpbmcnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBTZXJ2aWNlcyBjaHVua3NcbiAgICAgICAgICAgICdmaXRmaS1zZXJ2aWNlcyc6IFtcbiAgICAgICAgICAgICAgJy4vc3JjL3NlcnZpY2VzL0RhdGFSb3V0ZXInLFxuICAgICAgICAgICAgICAnLi9zcmMvc2VydmljZXMvYm9sdFNlcnZpY2UnLFxuICAgICAgICAgICAgICAnLi9zcmMvc2VydmljZXMvc3VwYWJhc2VTZXJ2aWNlJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVXRpbHMgY2h1bmtzXG4gICAgICAgICAgICAnZml0ZmktdXRpbHMnOiBbXG4gICAgICAgICAgICAgICcuL3NyYy91dGlscy9hbmFseXRpY3MnLFxuICAgICAgICAgICAgICAnLi9zcmMvdXRpbHMvaW1hZ2VVdGlscycsXG4gICAgICAgICAgICAgICcuL3NyYy91dGlscy91c2VyVXRpbHMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDb250ZXh0IGNodW5rc1xuICAgICAgICAgICAgJ2ZpdGZpLWNvbnRleHQnOiBbXG4gICAgICAgICAgICAgICcuL3NyYy9jb250ZXh0L1VzZXJDb250ZXh0JyxcbiAgICAgICAgICAgICAgJy4vc3JjL2NvbnRleHQvR2FtaWZpY2F0aW9uQ29udGV4dCcsXG4gICAgICAgICAgICAgICcuL3NyYy9jb250ZXh0L09uYm9hcmRpbmdDb250ZXh0J1xuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gUHJldmVudCBjaXJjdWxhciBkZXBlbmRlbmNpZXMgdGhhdCBjb3VsZCBjYXVzZSBsb2FkaW5nIGlzc3Vlc1xuICAgICAgICBleHRlcm5hbDogKGlkKSA9PiB7XG4gICAgICAgICAgLy8gRG9uJ3QgZXh0ZXJuYWxpemUgYW55dGhpbmcgdGhhdCBzaG91bGQgYmUgYnVuZGxlZFxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgLy8gSW1hZ2Ugb3B0aW1pemF0aW9uXG4gICAgYXNzZXRzSW5jbHVkZTogWycqKi8qLnBuZycsICcqKi8qLmpwZycsICcqKi8qLmpwZWcnLCAnKiovKi5naWYnLCAnKiovKi5zdmcnXSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLGNBQWMsZUFBZTtBQUMvUCxPQUFPLFdBQVc7QUFFbEIsT0FBTyxVQUFVO0FBSGpCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFFdkMsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLFFBQ0osWUFBWTtBQUFBLFFBQ1osaUJBQWlCO0FBQUEsTUFDbkIsQ0FBQztBQUFBLElBQ0g7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQTtBQUFBLE1BRU4sbUJBQW1CO0FBQUEsUUFDakIsR0FBRyxPQUFPLFFBQVEsR0FBRyxFQUNsQixPQUFPLENBQUMsQ0FBQyxHQUFHLE1BQU0sSUFBSSxXQUFXLE9BQU8sQ0FBQyxFQUN6QyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNO0FBQzNCLGNBQUksR0FBRyxJQUFJLEtBQUssVUFBVSxHQUFHO0FBQzdCLGlCQUFPO0FBQUEsUUFDVCxHQUFHLENBQUMsQ0FBQztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxjQUFjO0FBQUEsTUFDWixTQUFTLENBQUMsY0FBYztBQUFBLE1BQ3hCLFNBQVMsQ0FBQyxTQUFTO0FBQUEsSUFDckI7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLElBQUk7QUFBQSxRQUNGLFFBQVE7QUFBQSxRQUNSLE9BQU8sQ0FBQyxPQUFPLGNBQWM7QUFBQSxNQUMvQjtBQUFBLE1BQ0EsZ0JBQWdCO0FBQUE7QUFBQSxNQUVoQixPQUFPLENBQUM7QUFBQSxNQUNSLFNBQVM7QUFBQTtBQUFBLFFBRVAsMEJBQTBCO0FBQUEsUUFDMUIsbUJBQW1CO0FBQUEsUUFDbkIsb0JBQW9CO0FBQUEsTUFDdEI7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUE7QUFBQSxNQUVYLFdBQVcsU0FBUztBQUFBO0FBQUEsTUFFcEIsUUFBUTtBQUFBLE1BQ1IsZUFBZTtBQUFBLFFBQ2IsVUFBVTtBQUFBLFVBQ1IsY0FBYyxTQUFTO0FBQUEsVUFDdkIsZUFBZTtBQUFBLFFBQ2pCO0FBQUEsTUFDRjtBQUFBO0FBQUEsTUFFQSx1QkFBdUI7QUFBQTtBQUFBLE1BRXZCLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLGdCQUFnQixDQUFDLGNBQWM7QUFFN0IsbUJBQU8sVUFBVSxTQUFTLFVBQ3RCLDJCQUNBO0FBQUEsVUFDTjtBQUFBLFVBQ0EsZ0JBQWdCLENBQUMsY0FBYztBQUU3QixtQkFBTyxnQkFBZ0IsVUFBVSxJQUFJO0FBQUEsVUFDdkM7QUFBQSxVQUNBLGdCQUFnQixDQUFDLGNBQWM7QUFFN0Isa0JBQU0sT0FBTyxVQUFVLFFBQVE7QUFDL0Isa0JBQU0sVUFBVSxLQUFLLE1BQU0sR0FBRyxFQUFFLElBQUksS0FBSztBQUV6QyxnQkFBSSxrQ0FBa0MsS0FBSyxPQUFPLEdBQUc7QUFDbkQscUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksT0FBTyxLQUFLLE9BQU8sR0FBRztBQUN4QixxQkFBTztBQUFBLFlBQ1Q7QUFDQSxtQkFBTztBQUFBLFVBQ1Q7QUFBQSxVQUNBLGNBQWM7QUFBQTtBQUFBLFlBRVosZ0JBQWdCLENBQUMsU0FBUyxXQUFXO0FBQUEsWUFDckMsZ0JBQWdCLENBQUMsa0JBQWtCO0FBQUE7QUFBQSxZQUduQyxZQUFZLENBQUMsY0FBYztBQUFBLFlBQzNCLGlCQUFpQixDQUFDLG1CQUFtQjtBQUFBO0FBQUEsWUFHckMsZ0JBQWdCO0FBQUEsY0FDZDtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsWUFDRjtBQUFBO0FBQUEsWUFHQSxrQkFBa0I7QUFBQSxjQUNoQjtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsWUFDRjtBQUFBO0FBQUEsWUFHQSxlQUFlO0FBQUEsY0FDYjtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsWUFDRjtBQUFBO0FBQUEsWUFHQSxpQkFBaUI7QUFBQSxjQUNmO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQTtBQUFBLFFBRUEsVUFBVSxDQUFDLE9BQU87QUFFaEIsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsZUFBZSxDQUFDLFlBQVksWUFBWSxhQUFhLFlBQVksVUFBVTtBQUFBLEVBQzdFO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
