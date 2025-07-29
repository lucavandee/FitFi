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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpO1xuXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgcmVhY3Qoe1xuICAgICAgICBqc3hSdW50aW1lOiBcImF1dG9tYXRpY1wiLFxuICAgICAgICBqc3hJbXBvcnRTb3VyY2U6IFwicmVhY3RcIixcbiAgICAgIH0pLFxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICBcImltcG9ydC5tZXRhLmVudlwiOiB7XG4gICAgICAgIC4uLk9iamVjdC5lbnRyaWVzKGVudikucmVkdWNlKChhY2MsIFtrZXksIHZhbF0pID0+IHtcbiAgICAgICAgICBhY2Nba2V5XSA9IEpTT04uc3RyaW5naWZ5KHZhbCk7XG4gICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSwge30pLFxuICAgICAgfSxcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgaW5jbHVkZTogW1wibHVjaWRlLXJlYWN0XCJdLFxuICAgICAgZXhjbHVkZTogW1wiYmFja2VuZFwiXSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogMzAwMCxcbiAgICAgIG9wZW46IHRydWUsXG4gICAgICBmczogeyBcbiAgICAgICAgc3RyaWN0OiB0cnVlLFxuICAgICAgICBhbGxvdzogWydzcmMnLCAnbm9kZV9tb2R1bGVzJ11cbiAgICAgIH0sXG4gICAgICBtaWRkbGV3YXJlTW9kZTogZmFsc2UsXG4gICAgICAvLyBQcmV2ZW50IHNlcnZpbmcgSFRNTCBmb3IgSlMvQ1NTIGFzc2V0c1xuICAgICAgcHJveHk6IHt9LFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIG91dERpcjogXCJkaXN0XCIsXG4gICAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgICBhc3NldHNEaXI6IFwiYXNzZXRzXCIsXG4gICAgICAvLyBFbnN1cmUgcHJvcGVyIGFzc2V0IG5hbWluZyBhbmQgY2h1bmtpbmdcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6IChjaHVua0luZm8pID0+IHtcbiAgICAgICAgICAgIC8vIEVuc3VyZSBtYWluIGVudHJ5IGhhcyBjb25zaXN0ZW50IG5hbWluZ1xuICAgICAgICAgICAgcmV0dXJuIGNodW5rSW5mby5uYW1lID09PSAnaW5kZXgnIFxuICAgICAgICAgICAgICA/ICdhc3NldHMvaW5kZXgtW2hhc2hdLmpzJ1xuICAgICAgICAgICAgICA6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcyc7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogKGNodW5rSW5mbykgPT4ge1xuICAgICAgICAgICAgLy8gUHJldmVudCBjb25mbGljdHMgd2l0aCBIVE1MIHJvdXRlc1xuICAgICAgICAgICAgcmV0dXJuIGBhc3NldHMvY2h1bmstJHtjaHVua0luZm8ubmFtZX0tW2hhc2hdLmpzYDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiAoYXNzZXRJbmZvKSA9PiB7XG4gICAgICAgICAgICAvLyBPcmdhbml6ZSBhc3NldHMgYnkgdHlwZVxuICAgICAgICAgICAgY29uc3QgaW5mbyA9IGFzc2V0SW5mby5uYW1lIHx8ICcnO1xuICAgICAgICAgICAgY29uc3QgZXh0VHlwZSA9IGluZm8uc3BsaXQoJy4nKS5wb3AoKSB8fCAnJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKC9wbmd8anBlP2d8c3ZnfGdpZnx0aWZmfGJtcHxpY28vaS50ZXN0KGV4dFR5cGUpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBgYXNzZXRzL2ltYWdlcy9bbmFtZV0tW2hhc2hdLltleHRdYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgvY3NzL2kudGVzdChleHRUeXBlKSkge1xuICAgICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9zdHlsZXMvW25hbWVdLVtoYXNoXS5bZXh0XWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdYDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgICAgcm91dGVyOiBbJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAgIHVpOiBbJ2x1Y2lkZS1yZWFjdCcsICdmcmFtZXItbW90aW9uJ11cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFByZXZlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHRoYXQgY291bGQgY2F1c2UgbG9hZGluZyBpc3N1ZXNcbiAgICAgICAgZXh0ZXJuYWw6IChpZCkgPT4ge1xuICAgICAgICAgIC8vIERvbid0IGV4dGVybmFsaXplIGFueXRoaW5nIHRoYXQgc2hvdWxkIGJlIGJ1bmRsZWRcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsY0FBYyxlQUFlO0FBQy9QLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFGakIsSUFBTSxtQ0FBbUM7QUFJekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksQ0FBQztBQUV2QyxTQUFPO0FBQUEsSUFDTCxTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsUUFDSixZQUFZO0FBQUEsUUFDWixpQkFBaUI7QUFBQSxNQUNuQixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sbUJBQW1CO0FBQUEsUUFDakIsR0FBRyxPQUFPLFFBQVEsR0FBRyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU07QUFDakQsY0FBSSxHQUFHLElBQUksS0FBSyxVQUFVLEdBQUc7QUFDN0IsaUJBQU87QUFBQSxRQUNULEdBQUcsQ0FBQyxDQUFDO0FBQUEsTUFDUDtBQUFBLElBQ0Y7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsTUFDeEIsU0FBUyxDQUFDLFNBQVM7QUFBQSxJQUNyQjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sSUFBSTtBQUFBLFFBQ0YsUUFBUTtBQUFBLFFBQ1IsT0FBTyxDQUFDLE9BQU8sY0FBYztBQUFBLE1BQy9CO0FBQUEsTUFDQSxnQkFBZ0I7QUFBQTtBQUFBLE1BRWhCLE9BQU8sQ0FBQztBQUFBLElBQ1Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxNQUNYLFdBQVc7QUFBQTtBQUFBLE1BRVgsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sZ0JBQWdCLENBQUMsY0FBYztBQUU3QixtQkFBTyxVQUFVLFNBQVMsVUFDdEIsMkJBQ0E7QUFBQSxVQUNOO0FBQUEsVUFDQSxnQkFBZ0IsQ0FBQyxjQUFjO0FBRTdCLG1CQUFPLGdCQUFnQixVQUFVLElBQUk7QUFBQSxVQUN2QztBQUFBLFVBQ0EsZ0JBQWdCLENBQUMsY0FBYztBQUU3QixrQkFBTSxPQUFPLFVBQVUsUUFBUTtBQUMvQixrQkFBTSxVQUFVLEtBQUssTUFBTSxHQUFHLEVBQUUsSUFBSSxLQUFLO0FBRXpDLGdCQUFJLGtDQUFrQyxLQUFLLE9BQU8sR0FBRztBQUNuRCxxQkFBTztBQUFBLFlBQ1Q7QUFDQSxnQkFBSSxPQUFPLEtBQUssT0FBTyxHQUFHO0FBQ3hCLHFCQUFPO0FBQUEsWUFDVDtBQUNBLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFVBQ0EsY0FBYztBQUFBLFlBQ1osUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLFlBQzdCLFFBQVEsQ0FBQyxrQkFBa0I7QUFBQSxZQUMzQixJQUFJLENBQUMsZ0JBQWdCLGVBQWU7QUFBQSxVQUN0QztBQUFBLFFBQ0Y7QUFBQTtBQUFBLFFBRUEsVUFBVSxDQUFDLE9BQU87QUFFaEIsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
