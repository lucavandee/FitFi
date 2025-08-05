// vite.config.ts
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpO1xuXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgcmVhY3Qoe1xuICAgICAgICBqc3hSdW50aW1lOiBcImF1dG9tYXRpY1wiLFxuICAgICAgICBqc3hJbXBvcnRTb3VyY2U6IFwicmVhY3RcIixcbiAgICAgIH0pLFxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICAvLyBPbmx5IGV4cG9zZSBub24tc2Vuc2l0aXZlIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICAgICAgXCJpbXBvcnQubWV0YS5lbnZcIjoge1xuICAgICAgICAuLi5PYmplY3QuZW50cmllcyhlbnYpXG4gICAgICAgICAgLmZpbHRlcigoW2tleV0pID0+IGtleS5zdGFydHNXaXRoKCdWSVRFXycpKVxuICAgICAgICAgIC5yZWR1Y2UoKGFjYywgW2tleSwgdmFsXSkgPT4ge1xuICAgICAgICAgICAgYWNjW2tleV0gPSBKU09OLnN0cmluZ2lmeSh2YWwpO1xuICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICB9LCB7fSksXG4gICAgICB9LFxuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBpbmNsdWRlOiBbXCJsdWNpZGUtcmVhY3RcIl0sXG4gICAgICBleGNsdWRlOiBbXCJiYWNrZW5kXCJdLFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiAzMDAwLFxuICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgIGZzOiB7IFxuICAgICAgICBzdHJpY3Q6IHRydWUsXG4gICAgICAgIGFsbG93OiBbJ3NyYycsICdub2RlX21vZHVsZXMnXVxuICAgICAgfSxcbiAgICAgIG1pZGRsZXdhcmVNb2RlOiBmYWxzZSxcbiAgICAgIC8vIFByZXZlbnQgc2VydmluZyBIVE1MIGZvciBKUy9DU1MgYXNzZXRzXG4gICAgICBwcm94eToge30sXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIC8vIFNlY3VyaXR5IGhlYWRlcnMgZm9yIGRldmVsb3BtZW50XG4gICAgICAgICdYLUNvbnRlbnQtVHlwZS1PcHRpb25zJzogJ25vc25pZmYnLFxuICAgICAgICAnWC1GcmFtZS1PcHRpb25zJzogJ0RFTlknLFxuICAgICAgICAnWC1YU1MtUHJvdGVjdGlvbic6ICcxOyBtb2RlPWJsb2NrJ1xuICAgICAgfVxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIG91dERpcjogXCJkaXN0XCIsXG4gICAgICBhc3NldHNEaXI6IFwiYXNzZXRzXCIsXG4gICAgICAvLyBTZWN1cml0eTogRG9uJ3QgZXhwb3NlIHNvdXJjZSBtYXBzIGluIHByb2R1Y3Rpb25cbiAgICAgIHNvdXJjZW1hcDogbW9kZSA9PT0gJ2RldmVsb3BtZW50JyxcbiAgICAgIC8vIFBlcmZvcm1hbmNlIG9wdGltaXphdGlvbnNcbiAgICAgIG1pbmlmeTogJ3RlcnNlcicsXG4gICAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICAgIGNvbXByZXNzOiB7XG4gICAgICAgICAgZHJvcF9jb25zb2xlOiBtb2RlID09PSAncHJvZHVjdGlvbicsXG4gICAgICAgICAgZHJvcF9kZWJ1Z2dlcjogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICAvLyBDaHVuayBzaXplIHdhcm5pbmdzXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgICAvLyBFbnN1cmUgcHJvcGVyIGFzc2V0IG5hbWluZyBhbmQgY2h1bmtpbmdcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6IChjaHVua0luZm8pID0+IHtcbiAgICAgICAgICAgIC8vIEVuc3VyZSBtYWluIGVudHJ5IGhhcyBjb25zaXN0ZW50IG5hbWluZ1xuICAgICAgICAgICAgcmV0dXJuIGNodW5rSW5mby5uYW1lID09PSAnaW5kZXgnIFxuICAgICAgICAgICAgICA/ICdhc3NldHMvaW5kZXgtW2hhc2hdLmpzJ1xuICAgICAgICAgICAgICA6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcyc7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogKGNodW5rSW5mbykgPT4ge1xuICAgICAgICAgICAgLy8gUHJldmVudCBjb25mbGljdHMgd2l0aCBIVE1MIHJvdXRlc1xuICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvY2h1bmstJHtjaHVua0luZm8ubmFtZX0tW2hhc2hdLmpzYDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiAoYXNzZXRJbmZvKSA9PiB7XG4gICAgICAgICAgICAvLyBPcmdhbml6ZSBhc3NldHMgYnkgdHlwZVxuICAgICAgICAgICAgY29uc3QgaW5mbyA9IGFzc2V0SW5mby5uYW1lIHx8ICcnO1xuICAgICAgICAgICAgY29uc3QgZXh0VHlwZSA9IGluZm8uc3BsaXQoJy4nKS5wb3AoKSB8fCAnJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKC9wbmd8anBlP2d8c3ZnfGdpZnx0aWZmfGJtcHxpY28vaS50ZXN0KGV4dFR5cGUpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBgYXNzZXRzL2ltYWdlcy9bbmFtZV0tW2hhc2hdLltleHRdYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgvY3NzL2kudGVzdChleHRUeXBlKSkge1xuICAgICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9zdHlsZXMvW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdYDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICAgLy8gQ29yZSBSZWFjdCBjaHVua3NcbiAgICAgICAgICAgICdyZWFjdC12ZW5kb3InOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgICAgJ3JlYWN0LXJvdXRlcic6IFsncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBVSSBMaWJyYXJ5IGNodW5rc1xuICAgICAgICAgICAgJ3VpLWljb25zJzogWydsdWNpZGUtcmVhY3QnXSxcbiAgICAgICAgICAgICd1aS1jb21wb25lbnRzJzogWydAaGVhZGxlc3N1aS9yZWFjdCddLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBGaXRGaSBFbmdpbmUgY2h1bmtzXG4gICAgICAgICAgICAnZml0ZmktZW5naW5lJzogW1xuICAgICAgICAgICAgICAnLi9zcmMvZW5naW5lL3JlY29tbWVuZGF0aW9uRW5naW5lJyxcbiAgICAgICAgICAgICAgJy4vc3JjL2VuZ2luZS9nZW5lcmF0ZU91dGZpdHMnLFxuICAgICAgICAgICAgICAnLi9zcmMvZW5naW5lL3Byb2ZpbGUtbWFwcGluZydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFNlcnZpY2VzIGNodW5rc1xuICAgICAgICAgICAgJ2ZpdGZpLXNlcnZpY2VzJzogW1xuICAgICAgICAgICAgICAnLi9zcmMvc2VydmljZXMvRGF0YVJvdXRlcicsXG4gICAgICAgICAgICAgICcuL3NyYy9zZXJ2aWNlcy9ib2x0U2VydmljZScsXG4gICAgICAgICAgICAgICcuL3NyYy9zZXJ2aWNlcy9zdXBhYmFzZVNlcnZpY2UnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBVdGlscyBjaHVua3NcbiAgICAgICAgICAgICdmaXRmaS11dGlscyc6IFtcbiAgICAgICAgICAgICAgJy4vc3JjL3V0aWxzL2FuYWx5dGljcycsXG4gICAgICAgICAgICAgICcuL3NyYy91dGlscy9pbWFnZVV0aWxzJyxcbiAgICAgICAgICAgICAgJy4vc3JjL3V0aWxzL3VzZXJVdGlscydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIENvbnRleHQgY2h1bmtzXG4gICAgICAgICAgICAnZml0ZmktY29udGV4dCc6IFtcbiAgICAgICAgICAgICAgJy4vc3JjL2NvbnRleHQvVXNlckNvbnRleHQnLFxuICAgICAgICAgICAgICAnLi9zcmMvY29udGV4dC9HYW1pZmljYXRpb25Db250ZXh0JyxcbiAgICAgICAgICAgICAgJy4vc3JjL2NvbnRleHQvT25ib2FyZGluZ0NvbnRleHQnXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyBQcmV2ZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcyB0aGF0IGNvdWxkIGNhdXNlIGxvYWRpbmcgaXNzdWVzXG4gICAgICAgIGV4dGVybmFsOiAoaWQpID0+IHtcbiAgICAgICAgICAvLyBEb24ndCBleHRlcm5hbGl6ZSBhbnl0aGluZyB0aGF0IHNob3VsZCBiZSBidW5kbGVkXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBJbWFnZSBvcHRpbWl6YXRpb25cbiAgICBhc3NldHNJbmNsdWRlOiBbJyoqLyoucG5nJywgJyoqLyouanBnJywgJyoqLyouanBlZycsICcqKi8qLmdpZicsICcqKi8qLnN2ZyddLFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsY0FBYyxlQUFlO0FBQy9QLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFGakIsSUFBTSxtQ0FBbUM7QUFJekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksQ0FBQztBQUV2QyxTQUFPO0FBQUEsSUFDTCxTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsUUFDSixZQUFZO0FBQUEsUUFDWixpQkFBaUI7QUFBQSxNQUNuQixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBO0FBQUEsTUFFTixtQkFBbUI7QUFBQSxRQUNqQixHQUFHLE9BQU8sUUFBUSxHQUFHLEVBQ2xCLE9BQU8sQ0FBQyxDQUFDLEdBQUcsTUFBTSxJQUFJLFdBQVcsT0FBTyxDQUFDLEVBQ3pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU07QUFDM0IsY0FBSSxHQUFHLElBQUksS0FBSyxVQUFVLEdBQUc7QUFDN0IsaUJBQU87QUFBQSxRQUNULEdBQUcsQ0FBQyxDQUFDO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsTUFDeEIsU0FBUyxDQUFDLFNBQVM7QUFBQSxJQUNyQjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sSUFBSTtBQUFBLFFBQ0YsUUFBUTtBQUFBLFFBQ1IsT0FBTyxDQUFDLE9BQU8sY0FBYztBQUFBLE1BQy9CO0FBQUEsTUFDQSxnQkFBZ0I7QUFBQTtBQUFBLE1BRWhCLE9BQU8sQ0FBQztBQUFBLE1BQ1IsU0FBUztBQUFBO0FBQUEsUUFFUCwwQkFBMEI7QUFBQSxRQUMxQixtQkFBbUI7QUFBQSxRQUNuQixvQkFBb0I7QUFBQSxNQUN0QjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQTtBQUFBLE1BRVgsV0FBVyxTQUFTO0FBQUE7QUFBQSxNQUVwQixRQUFRO0FBQUEsTUFDUixlQUFlO0FBQUEsUUFDYixVQUFVO0FBQUEsVUFDUixjQUFjLFNBQVM7QUFBQSxVQUN2QixlQUFlO0FBQUEsUUFDakI7QUFBQSxNQUNGO0FBQUE7QUFBQSxNQUVBLHVCQUF1QjtBQUFBO0FBQUEsTUFFdkIsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sZ0JBQWdCLENBQUMsY0FBYztBQUU3QixtQkFBTyxVQUFVLFNBQVMsVUFDdEIsMkJBQ0E7QUFBQSxVQUNOO0FBQUEsVUFDQSxnQkFBZ0IsQ0FBQyxjQUFjO0FBRTdCLG1CQUFPLGdCQUFnQixVQUFVLElBQUk7QUFBQSxVQUN2QztBQUFBLFVBQ0EsZ0JBQWdCLENBQUMsY0FBYztBQUU3QixrQkFBTSxPQUFPLFVBQVUsUUFBUTtBQUMvQixrQkFBTSxVQUFVLEtBQUssTUFBTSxHQUFHLEVBQUUsSUFBSSxLQUFLO0FBRXpDLGdCQUFJLGtDQUFrQyxLQUFLLE9BQU8sR0FBRztBQUNuRCxxQkFBTztBQUFBLFlBQ1Q7QUFDQSxnQkFBSSxPQUFPLEtBQUssT0FBTyxHQUFHO0FBQ3hCLHFCQUFPO0FBQUEsWUFDVDtBQUNBLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFVBQ0EsY0FBYztBQUFBO0FBQUEsWUFFWixnQkFBZ0IsQ0FBQyxTQUFTLFdBQVc7QUFBQSxZQUNyQyxnQkFBZ0IsQ0FBQyxrQkFBa0I7QUFBQTtBQUFBLFlBR25DLFlBQVksQ0FBQyxjQUFjO0FBQUEsWUFDM0IsaUJBQWlCLENBQUMsbUJBQW1CO0FBQUE7QUFBQSxZQUdyQyxnQkFBZ0I7QUFBQSxjQUNkO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxZQUNGO0FBQUE7QUFBQSxZQUdBLGtCQUFrQjtBQUFBLGNBQ2hCO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxZQUNGO0FBQUE7QUFBQSxZQUdBLGVBQWU7QUFBQSxjQUNiO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxZQUNGO0FBQUE7QUFBQSxZQUdBLGlCQUFpQjtBQUFBLGNBQ2Y7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBO0FBQUEsUUFFQSxVQUFVLENBQUMsT0FBTztBQUVoQixpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxlQUFlLENBQUMsWUFBWSxZQUFZLGFBQWEsWUFBWSxVQUFVO0FBQUEsRUFDN0U7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
