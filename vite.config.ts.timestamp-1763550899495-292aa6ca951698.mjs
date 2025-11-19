// vite.config.ts
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";

// plugins/host-sweep.ts
function hostSweep(opts) {
  const configuredHost = (opts?.host || "https://fitfi.ai").replace(/\/+$/, "");
  const hostRe = /https?:\/\/fitfi\.ai\/?/gi;
  const refRe = /(\?|\&)ref=/g;
  return {
    name: "fitfi-host-sweep",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("/src/")) return null;
      let out = code;
      let touched = false;
      if (hostRe.test(out)) {
        out = out.replace(hostRe, configuredHost + "/");
        touched = true;
        this.warn(`[host-sweep] Host gerewritten naar ${configuredHost} in: ${id}`);
      }
      if (refRe.test(out)) {
        this.warn(
          `[host-sweep] '?ref=' gedetecteerd in: ${id}. Gebruik urls.buildReferralUrl()/share.makeInviteShare() i.p.v. string-concat.`
        );
      }
      return touched ? { code: out, map: null } : null;
    }
  };
}

// vite.config.ts
var __vite_injected_original_import_meta_url = "file:///home/project/vite.config.ts";
var SRC_ALIAS = new URL("./src", __vite_injected_original_import_meta_url).pathname;
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const host = (env.VITE_CANONICAL_HOST || "https://fitfi.ai").replace(/\/+$/, "");
  return {
    plugins: [
      react(),
      // URL-sweep draait in dev én build; nul visuele impact.
      hostSweep({ host })
    ],
    resolve: {
      alias: [{ find: "@", replacement: SRC_ALIAS }]
    },
    // Overige projectinstellingen blijven ongewijzigd
    server: { port: 5173 },
    build: {
      sourcemap: false,
      target: "es2022",
      cssCodeSplit: true,
      rollupOptions: {
        external: [],
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
                return "vendor-react";
              }
              if (id.includes("framer-motion")) {
                return "vendor-motion";
              }
              if (id.includes("@supabase")) {
                return "vendor-supabase";
              }
              if (id.includes("@tanstack")) {
                return "vendor-query";
              }
              if (id.includes("xlsx")) {
                return "vendor-xlsx";
              }
              return "vendor-misc";
            }
          },
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]"
        }
      },
      chunkSizeWarningLimit: 1e3,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.info"]
        }
      }
    },
    define: {
      __FITFI_CANONICAL__: JSON.stringify(host)
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGx1Z2lucy9ob3N0LXN3ZWVwLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBob3N0U3dlZXAgZnJvbSBcIi4vcGx1Z2lucy9ob3N0LXN3ZWVwXCI7XG5cbi8vIExldCBvcDogZ2VlbiAnbm9kZTpwYXRoJyBjb25mb3JtIGFyY2hpdGVjdHV1ci1mcmVlemUuXG5jb25zdCBTUkNfQUxJQVMgPSBuZXcgVVJMKFwiLi9zcmNcIiwgaW1wb3J0Lm1ldGEudXJsKS5wYXRobmFtZTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksIFwiXCIpO1xuICBjb25zdCBob3N0ID0gKGVudi5WSVRFX0NBTk9OSUNBTF9IT1NUIHx8IFwiaHR0cHM6Ly9maXRmaS5haVwiKS5yZXBsYWNlKC9cXC8rJC8sIFwiXCIpO1xuXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgcmVhY3QoKSxcbiAgICAgIC8vIFVSTC1zd2VlcCBkcmFhaXQgaW4gZGV2IFx1MDBFOW4gYnVpbGQ7IG51bCB2aXN1ZWxlIGltcGFjdC5cbiAgICAgIGhvc3RTd2VlcCh7IGhvc3QgfSksXG4gICAgXSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczogW3sgZmluZDogXCJAXCIsIHJlcGxhY2VtZW50OiBTUkNfQUxJQVMgfV0sXG4gICAgfSxcbiAgICAvLyBPdmVyaWdlIHByb2plY3RpbnN0ZWxsaW5nZW4gYmxpanZlbiBvbmdld2lqemlnZFxuICAgIHNlcnZlcjogeyBwb3J0OiA1MTczIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgICB0YXJnZXQ6ICdlczIwMjInLFxuICAgICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBleHRlcm5hbDogW10sXG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlYWN0JykgfHwgaWQuaW5jbHVkZXMoJ3JlYWN0LWRvbScpIHx8IGlkLmluY2x1ZGVzKCdyZWFjdC1yb3V0ZXInKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLXJlYWN0JztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2ZyYW1lci1tb3Rpb24nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLW1vdGlvbic7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAc3VwYWJhc2UnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLXN1cGFiYXNlJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0B0YW5zdGFjaycpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItcXVlcnknO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygneGxzeCcpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3IteGxzeCc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItbWlzYyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgICBtaW5pZnk6ICd0ZXJzZXInLFxuICAgICAgdGVyc2VyT3B0aW9uczoge1xuICAgICAgICBjb21wcmVzczoge1xuICAgICAgICAgIGRyb3BfY29uc29sZTogdHJ1ZSxcbiAgICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlLFxuICAgICAgICAgIHB1cmVfZnVuY3M6IFsnY29uc29sZS5sb2cnLCAnY29uc29sZS5pbmZvJ10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICBfX0ZJVEZJX0NBTk9OSUNBTF9fOiBKU09OLnN0cmluZ2lmeShob3N0KSxcbiAgICB9LFxuICB9O1xufSk7IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3BsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3QvcGx1Z2lucy9ob3N0LXN3ZWVwLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3QvcGx1Z2lucy9ob3N0LXN3ZWVwLnRzXCI7Ly8gcGx1Z2lucy9ob3N0LXN3ZWVwLnRzXG4vLyBWaXRlIHBsdWdpbjogY2VudHJhbGlzZWVydCBob3N0Z2VicnVpayBlbiB3YWFyc2NodXd0IHZvb3IgbG9zc2UgJz9yZWY9JyBwYXR0ZXJucy5cbi8vIC0gVmVydmFuZ3QgJ2h0dHBzOi8vZml0ZmkuYWknIGhhcmRjb2RlcyBkb29yIGRlIGluZ2VzdGVsZGUgaG9zdCAoZW52IC8gZmFsbGJhY2spLlxuLy8gLSBHZWVmdCB3YWFyc2NodXdpbmdlbiBiaWogJz9yZWY9JyB6b2RhdCBkZXZzIGRlIGhlbHBlcnMgZ2VicnVpa2VuLlxuLy8gU3R5bGluZyBibGlqZnQgb25hYW5nZXJvZXJkLlxuXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gXCJ2aXRlXCI7XG5cbnR5cGUgT3B0aW9ucyA9IHtcbiAgaG9zdD86IHN0cmluZzsgLy8gYnYuICdodHRwczovL2ZpdGZpLmFpJ1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaG9zdFN3ZWVwKG9wdHM/OiBPcHRpb25zKTogUGx1Z2luIHtcbiAgY29uc3QgY29uZmlndXJlZEhvc3QgPSAob3B0cz8uaG9zdCB8fCBcImh0dHBzOi8vZml0ZmkuYWlcIikucmVwbGFjZSgvXFwvKyQvLCBcIlwiKTtcbiAgY29uc3QgaG9zdFJlID0gL2h0dHBzPzpcXC9cXC9maXRmaVxcLmFpXFwvPy9naTtcbiAgY29uc3QgcmVmUmUgPSAvKFxcP3xcXCYpcmVmPS9nO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogXCJmaXRmaS1ob3N0LXN3ZWVwXCIsXG4gICAgZW5mb3JjZTogXCJwcmVcIixcbiAgICB0cmFuc2Zvcm0oY29kZSwgaWQpIHtcbiAgICAgIC8vIEFsbGVlbiBvbnplIGJyb25iZXN0YW5kZW5cbiAgICAgIGlmICghaWQuaW5jbHVkZXMoXCIvc3JjL1wiKSkgcmV0dXJuIG51bGw7XG5cbiAgICAgIGxldCBvdXQgPSBjb2RlO1xuICAgICAgbGV0IHRvdWNoZWQgPSBmYWxzZTtcblxuICAgICAgLy8gMSkgSGFyZGNvZGVkIGhvc3QgdmVydmFuZ2VuIGRvb3IgZW52LWhvc3QgKHN0cmluZy1uYWFyLXN0cmluZywgZ2VlbiBzdHlsaW5nIGltcGFjdClcbiAgICAgIGlmIChob3N0UmUudGVzdChvdXQpKSB7XG4gICAgICAgIG91dCA9IG91dC5yZXBsYWNlKGhvc3RSZSwgY29uZmlndXJlZEhvc3QgKyBcIi9cIik7XG4gICAgICAgIHRvdWNoZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLndhcm4oYFtob3N0LXN3ZWVwXSBIb3N0IGdlcmV3cml0dGVuIG5hYXIgJHtjb25maWd1cmVkSG9zdH0gaW46ICR7aWR9YCk7XG4gICAgICB9XG5cbiAgICAgIC8vIDIpIExvc3NlICc/cmVmPScgc2lnbmFsZXJlbiAobGlldmVyIHVybHMvc2hhcmUgaGVscGVycylcbiAgICAgIGlmIChyZWZSZS50ZXN0KG91dCkpIHtcbiAgICAgICAgdGhpcy53YXJuKFxuICAgICAgICAgIGBbaG9zdC1zd2VlcF0gJz9yZWY9JyBnZWRldGVjdGVlcmQgaW46ICR7aWR9LiBHZWJydWlrIHVybHMuYnVpbGRSZWZlcnJhbFVybCgpL3NoYXJlLm1ha2VJbnZpdGVTaGFyZSgpIGkucC52LiBzdHJpbmctY29uY2F0LmBcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRvdWNoZWQgPyB7IGNvZGU6IG91dCwgbWFwOiBudWxsIH0gOiBudWxsO1xuICAgIH0sXG4gIH07XG59Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLGNBQWMsZUFBZTtBQUMvUCxPQUFPLFdBQVc7OztBQ1dILFNBQVIsVUFBMkIsTUFBd0I7QUFDeEQsUUFBTSxrQkFBa0IsTUFBTSxRQUFRLG9CQUFvQixRQUFRLFFBQVEsRUFBRTtBQUM1RSxRQUFNLFNBQVM7QUFDZixRQUFNLFFBQVE7QUFFZCxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFV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
