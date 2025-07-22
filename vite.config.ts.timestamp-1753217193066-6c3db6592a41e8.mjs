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
      "import.meta.env": {
        ...Object.entries(env).reduce((acc, [key, val]) => {
          acc[key] = JSON.stringify(val);
          return acc;
        }, {})
      }
    },
    optimizeDeps: {
      exclude: ["lucide-react"]
    },
    server: {
      port: 3e3,
      open: true,
      fs: {
        strict: true
      },
      middlewareMode: false,
      // Prevent serving HTML for JS/CSS assets
      proxy: {}
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      assetsDir: "assets",
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
            ui: ["lucide-react", "framer-motion"]
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpO1xuXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgcmVhY3Qoe1xuICAgICAgICBqc3hSdW50aW1lOiBcImF1dG9tYXRpY1wiLFxuICAgICAgICBqc3hJbXBvcnRTb3VyY2U6IFwicmVhY3RcIixcbiAgICAgIH0pLFxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICBcImltcG9ydC5tZXRhLmVudlwiOiB7XG4gICAgICAgIC4uLk9iamVjdC5lbnRyaWVzKGVudikucmVkdWNlKChhY2MsIFtrZXksIHZhbF0pID0+IHtcbiAgICAgICAgICBhY2Nba2V5XSA9IEpTT04uc3RyaW5naWZ5KHZhbCk7XG4gICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSwge30pLFxuICAgICAgfSxcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgZXhjbHVkZTogW1wibHVjaWRlLXJlYWN0XCJdLFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiAzMDAwLFxuICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgIGZzOiB7IFxuICAgICAgICBzdHJpY3Q6IHRydWUgXG4gICAgICB9LFxuICAgICAgbWlkZGxld2FyZU1vZGU6IGZhbHNlLFxuICAgICAgLy8gUHJldmVudCBzZXJ2aW5nIEhUTUwgZm9yIEpTL0NTUyBhc3NldHNcbiAgICAgIHByb3h5OiB7fSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6IFwiZGlzdFwiLFxuICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgICAgYXNzZXRzRGlyOiBcImFzc2V0c1wiLFxuICAgICAgLy8gRW5zdXJlIHByb3BlciBhc3NldCBuYW1pbmcgYW5kIGNodW5raW5nXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAoY2h1bmtJbmZvKSA9PiB7XG4gICAgICAgICAgICAvLyBFbnN1cmUgbWFpbiBlbnRyeSBoYXMgY29uc2lzdGVudCBuYW1pbmdcbiAgICAgICAgICAgIHJldHVybiBjaHVua0luZm8ubmFtZSA9PT0gJ2luZGV4JyBcbiAgICAgICAgICAgICAgPyAnYXNzZXRzL2luZGV4LVtoYXNoXS5qcydcbiAgICAgICAgICAgICAgOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgY2h1bmtGaWxlTmFtZXM6IChjaHVua0luZm8pID0+IHtcbiAgICAgICAgICAgIC8vIFByZXZlbnQgY29uZmxpY3RzIHdpdGggSFRNTCByb3V0ZXNcbiAgICAgICAgICAgIHJldHVybiBgYXNzZXRzL2NodW5rLSR7Y2h1bmtJbmZvLm5hbWV9LVtoYXNoXS5qc2A7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbykgPT4ge1xuICAgICAgICAgICAgLy8gT3JnYW5pemUgYXNzZXRzIGJ5IHR5cGVcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSBhc3NldEluZm8ubmFtZSB8fCAnJztcbiAgICAgICAgICAgIGNvbnN0IGV4dFR5cGUgPSBpbmZvLnNwbGl0KCcuJykucG9wKCkgfHwgJyc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICgvcG5nfGpwZT9nfHN2Z3xnaWZ8dGlmZnxibXB8aWNvL2kudGVzdChleHRUeXBlKSkge1xuICAgICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9pbWFnZXMvW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoL2Nzcy9pLnRlc3QoZXh0VHlwZSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvc3R5bGVzL1tuYW1lXS1baGFzaF0uW2V4dF1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgIHZlbmRvcjogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgICAgICAgICAgIHJvdXRlcjogWydyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgICB1aTogWydsdWNpZGUtcmVhY3QnLCAnZnJhbWVyLW1vdGlvbiddXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyBQcmV2ZW50IGNpcmN1bGFyIGRlcGVuZGVuY2llcyB0aGF0IGNvdWxkIGNhdXNlIGxvYWRpbmcgaXNzdWVzXG4gICAgICAgIGV4dGVybmFsOiAoaWQpID0+IHtcbiAgICAgICAgICAvLyBEb24ndCBleHRlcm5hbGl6ZSBhbnl0aGluZyB0aGF0IHNob3VsZCBiZSBidW5kbGVkXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLGNBQWMsZUFBZTtBQUMvUCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRmpCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFFdkMsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLFFBQ0osWUFBWTtBQUFBLFFBQ1osaUJBQWlCO0FBQUEsTUFDbkIsQ0FBQztBQUFBLElBQ0g7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLG1CQUFtQjtBQUFBLFFBQ2pCLEdBQUcsT0FBTyxRQUFRLEdBQUcsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNO0FBQ2pELGNBQUksR0FBRyxJQUFJLEtBQUssVUFBVSxHQUFHO0FBQzdCLGlCQUFPO0FBQUEsUUFDVCxHQUFHLENBQUMsQ0FBQztBQUFBLE1BQ1A7QUFBQSxJQUNGO0FBQUEsSUFDQSxjQUFjO0FBQUEsTUFDWixTQUFTLENBQUMsY0FBYztBQUFBLElBQzFCO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixJQUFJO0FBQUEsUUFDRixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0EsZ0JBQWdCO0FBQUE7QUFBQSxNQUVoQixPQUFPLENBQUM7QUFBQSxJQUNWO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUEsTUFDWCxXQUFXO0FBQUE7QUFBQSxNQUVYLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLGdCQUFnQixDQUFDLGNBQWM7QUFFN0IsbUJBQU8sVUFBVSxTQUFTLFVBQ3RCLDJCQUNBO0FBQUEsVUFDTjtBQUFBLFVBQ0EsZ0JBQWdCLENBQUMsY0FBYztBQUU3QixtQkFBTyxnQkFBZ0IsVUFBVSxJQUFJO0FBQUEsVUFDdkM7QUFBQSxVQUNBLGdCQUFnQixDQUFDLGNBQWM7QUFFN0Isa0JBQU0sT0FBTyxVQUFVLFFBQVE7QUFDL0Isa0JBQU0sVUFBVSxLQUFLLE1BQU0sR0FBRyxFQUFFLElBQUksS0FBSztBQUV6QyxnQkFBSSxrQ0FBa0MsS0FBSyxPQUFPLEdBQUc7QUFDbkQscUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksT0FBTyxLQUFLLE9BQU8sR0FBRztBQUN4QixxQkFBTztBQUFBLFlBQ1Q7QUFDQSxtQkFBTztBQUFBLFVBQ1Q7QUFBQSxVQUNBLGNBQWM7QUFBQSxZQUNaLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFBQSxZQUM3QixRQUFRLENBQUMsa0JBQWtCO0FBQUEsWUFDM0IsSUFBSSxDQUFDLGdCQUFnQixlQUFlO0FBQUEsVUFDdEM7QUFBQSxRQUNGO0FBQUE7QUFBQSxRQUVBLFVBQVUsQ0FBQyxPQUFPO0FBRWhCLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
