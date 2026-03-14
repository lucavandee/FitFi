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
      try {
        if (!id.includes("/src/")) return null;
        let out = code;
        let touched = false;
        if (hostRe.test(out)) {
          out = out.replace(hostRe, configuredHost + "/");
          touched = true;
          console.log(`[host-sweep] Host gerewritten naar ${configuredHost} in: ${id}`);
        }
        if (refRe.test(out)) {
          console.log(
            `[host-sweep] '?ref=' gedetecteerd in: ${id}. Gebruik urls.buildReferralUrl()/share.makeInviteShare() i.p.v. string-concat.`
          );
        }
        return touched ? { code: out, map: null } : null;
      } catch (error) {
        console.error("[host-sweep] Transform error:", error);
        return null;
      }
    }
  };
}

// plugins/dev-csp.ts
function devCSP() {
  return {
    name: "fitfi-dev-csp",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const isDev = process.env.NODE_ENV !== "production";
        if (isDev) {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        }
        res.setHeader(
          "Content-Security-Policy",
          [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://*.supabase.co",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://region1.analytics.google.com https://region1.google-analytics.com https://www.googletagmanager.com https://www.google.nl https://www.google.lk https://images.pexels.com https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.shopify.com https://*.shopify.com https://glp8.net https://*.daisycon.com https://daisycon.io ws: wss:",
            "frame-src 'none'",
            isDev ? "frame-ancestors *" : "frame-ancestors 'self'",
            // Allow iframe in dev for Bolt
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'"
          ].join("; ")
        );
        next();
      });
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
      hostSweep({ host }),
      // CSP headers in development (mirrors production _headers)
      devCSP()
    ],
    resolve: {
      alias: [{ find: "@", replacement: SRC_ALIAS }]
    },
    // Overige projectinstellingen blijven ongewijzigd
    server: {
      port: 5173,
      host: "0.0.0.0",
      // Luister op alle network interfaces voor Bolt preview
      strictPort: false
    },
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGx1Z2lucy9ob3N0LXN3ZWVwLnRzIiwgInBsdWdpbnMvZGV2LWNzcC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgaG9zdFN3ZWVwIGZyb20gXCIuL3BsdWdpbnMvaG9zdC1zd2VlcFwiO1xuaW1wb3J0IGRldkNTUCBmcm9tIFwiLi9wbHVnaW5zL2Rldi1jc3BcIjtcblxuLy8gTGV0IG9wOiBnZWVuICdub2RlOnBhdGgnIGNvbmZvcm0gYXJjaGl0ZWN0dXVyLWZyZWV6ZS5cbmNvbnN0IFNSQ19BTElBUyA9IG5ldyBVUkwoXCIuL3NyY1wiLCBpbXBvcnQubWV0YS51cmwpLnBhdGhuYW1lO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgXCJcIik7XG4gIGNvbnN0IGhvc3QgPSAoZW52LlZJVEVfQ0FOT05JQ0FMX0hPU1QgfHwgXCJodHRwczovL2ZpdGZpLmFpXCIpLnJlcGxhY2UoL1xcLyskLywgXCJcIik7XG5cbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICByZWFjdCgpLFxuICAgICAgLy8gVVJMLXN3ZWVwIGRyYWFpdCBpbiBkZXYgXHUwMEU5biBidWlsZDsgbnVsIHZpc3VlbGUgaW1wYWN0LlxuICAgICAgaG9zdFN3ZWVwKHsgaG9zdCB9KSxcbiAgICAgIC8vIENTUCBoZWFkZXJzIGluIGRldmVsb3BtZW50IChtaXJyb3JzIHByb2R1Y3Rpb24gX2hlYWRlcnMpXG4gICAgICBkZXZDU1AoKSxcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiBbeyBmaW5kOiBcIkBcIiwgcmVwbGFjZW1lbnQ6IFNSQ19BTElBUyB9XSxcbiAgICB9LFxuICAgIC8vIE92ZXJpZ2UgcHJvamVjdGluc3RlbGxpbmdlbiBibGlqdmVuIG9uZ2V3aWp6aWdkXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiA1MTczLFxuICAgICAgaG9zdDogJzAuMC4wLjAnLCAvLyBMdWlzdGVyIG9wIGFsbGUgbmV0d29yayBpbnRlcmZhY2VzIHZvb3IgQm9sdCBwcmV2aWV3XG4gICAgICBzdHJpY3RQb3J0OiBmYWxzZSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgICAgdGFyZ2V0OiAnZXMyMDIyJyxcbiAgICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgZXh0ZXJuYWw6IFtdLFxuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdyZWFjdCcpIHx8IGlkLmluY2x1ZGVzKCdyZWFjdC1kb20nKSB8fCBpZC5pbmNsdWRlcygncmVhY3Qtcm91dGVyJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1yZWFjdCc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdmcmFtZXItbW90aW9uJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1tb3Rpb24nO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQHN1cGFiYXNlJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1zdXBhYmFzZSc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAdGFuc3RhY2snKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLXF1ZXJ5JztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3hsc3gnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLXhsc3gnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLW1pc2MnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XScsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICAgICAgbWluaWZ5OiAndGVyc2VyJyxcbiAgICAgIHRlcnNlck9wdGlvbnM6IHtcbiAgICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsXG4gICAgICAgICAgZHJvcF9kZWJ1Z2dlcjogdHJ1ZSxcbiAgICAgICAgICBwdXJlX2Z1bmNzOiBbJ2NvbnNvbGUubG9nJywgJ2NvbnNvbGUuaW5mbyddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgX19GSVRGSV9DQU5PTklDQUxfXzogSlNPTi5zdHJpbmdpZnkoaG9zdCksXG4gICAgfSxcbiAgfTtcbn0pOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9wbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3BsdWdpbnMvaG9zdC1zd2VlcC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3BsdWdpbnMvaG9zdC1zd2VlcC50c1wiOy8vIHBsdWdpbnMvaG9zdC1zd2VlcC50c1xuLy8gVml0ZSBwbHVnaW46IGNlbnRyYWxpc2VlcnQgaG9zdGdlYnJ1aWsgZW4gd2FhcnNjaHV3dCB2b29yIGxvc3NlICc/cmVmPScgcGF0dGVybnMuXG4vLyAtIFZlcnZhbmd0ICdodHRwczovL2ZpdGZpLmFpJyBoYXJkY29kZXMgZG9vciBkZSBpbmdlc3RlbGRlIGhvc3QgKGVudiAvIGZhbGxiYWNrKS5cbi8vIC0gR2VlZnQgd2FhcnNjaHV3aW5nZW4gYmlqICc/cmVmPScgem9kYXQgZGV2cyBkZSBoZWxwZXJzIGdlYnJ1aWtlbi5cbi8vIFN0eWxpbmcgYmxpamZ0IG9uYWFuZ2Vyb2VyZC5cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tIFwidml0ZVwiO1xuXG50eXBlIE9wdGlvbnMgPSB7XG4gIGhvc3Q/OiBzdHJpbmc7IC8vIGJ2LiAnaHR0cHM6Ly9maXRmaS5haSdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGhvc3RTd2VlcChvcHRzPzogT3B0aW9ucyk6IFBsdWdpbiB7XG4gIGNvbnN0IGNvbmZpZ3VyZWRIb3N0ID0gKG9wdHM/Lmhvc3QgfHwgXCJodHRwczovL2ZpdGZpLmFpXCIpLnJlcGxhY2UoL1xcLyskLywgXCJcIik7XG4gIGNvbnN0IGhvc3RSZSA9IC9odHRwcz86XFwvXFwvZml0ZmlcXC5haVxcLz8vZ2k7XG4gIGNvbnN0IHJlZlJlID0gLyhcXD98XFwmKXJlZj0vZztcblxuICByZXR1cm4ge1xuICAgIG5hbWU6IFwiZml0ZmktaG9zdC1zd2VlcFwiLFxuICAgIGVuZm9yY2U6IFwicHJlXCIsXG4gICAgdHJhbnNmb3JtKGNvZGUsIGlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBBbGxlZW4gb256ZSBicm9uYmVzdGFuZGVuXG4gICAgICAgIGlmICghaWQuaW5jbHVkZXMoXCIvc3JjL1wiKSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgbGV0IG91dCA9IGNvZGU7XG4gICAgICAgIGxldCB0b3VjaGVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8gMSkgSGFyZGNvZGVkIGhvc3QgdmVydmFuZ2VuIGRvb3IgZW52LWhvc3QgKHN0cmluZy1uYWFyLXN0cmluZywgZ2VlbiBzdHlsaW5nIGltcGFjdClcbiAgICAgICAgaWYgKGhvc3RSZS50ZXN0KG91dCkpIHtcbiAgICAgICAgICBvdXQgPSBvdXQucmVwbGFjZShob3N0UmUsIGNvbmZpZ3VyZWRIb3N0ICsgXCIvXCIpO1xuICAgICAgICAgIHRvdWNoZWQgPSB0cnVlO1xuICAgICAgICAgIC8vIEdlYnJ1aWsgY29uc29sZS5sb2cgaS5wLnYuIHRoaXMud2FybiB2b29yIHN0YWJpbGl0ZWl0XG4gICAgICAgICAgY29uc29sZS5sb2coYFtob3N0LXN3ZWVwXSBIb3N0IGdlcmV3cml0dGVuIG5hYXIgJHtjb25maWd1cmVkSG9zdH0gaW46ICR7aWR9YCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAyKSBMb3NzZSAnP3JlZj0nIHNpZ25hbGVyZW4gKGxpZXZlciB1cmxzL3NoYXJlIGhlbHBlcnMpXG4gICAgICAgIGlmIChyZWZSZS50ZXN0KG91dCkpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIGBbaG9zdC1zd2VlcF0gJz9yZWY9JyBnZWRldGVjdGVlcmQgaW46ICR7aWR9LiBHZWJydWlrIHVybHMuYnVpbGRSZWZlcnJhbFVybCgpL3NoYXJlLm1ha2VJbnZpdGVTaGFyZSgpIGkucC52LiBzdHJpbmctY29uY2F0LmBcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRvdWNoZWQgPyB7IGNvZGU6IG91dCwgbWFwOiBudWxsIH0gOiBudWxsO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW2hvc3Qtc3dlZXBdIFRyYW5zZm9ybSBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH0sXG4gIH07XG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3BsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3QvcGx1Z2lucy9kZXYtY3NwLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3QvcGx1Z2lucy9kZXYtY3NwLnRzXCI7aW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuLyoqXG4gKiBEZXZlbG9wbWVudCBDU1AgcGx1Z2luXG4gKiBNaXJyb3JzIHRoZSBwcm9kdWN0aW9uIENTUCBmcm9tIHB1YmxpYy9faGVhZGVycyBmb3IgbG9jYWwgZGV2ZWxvcG1lbnRcbiAqIEluIGRldiBtb2RlLCByZWxheGVkIHRvIGFsbG93IEJvbHQgd2ViY29udGFpbmVyIGlmcmFtZSBwcmV2aWV3XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRldkNTUCgpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdmaXRmaS1kZXYtY3NwJyxcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICAvLyBJbiBkZXYgbW9kZSwgYWxsb3cgQm9sdC93ZWJjb250YWluZXIgcHJldmlldyBpZnJhbWUgZW1iZWRkaW5nXG4gICAgICAgIGNvbnN0IGlzRGV2ID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJztcblxuICAgICAgICAvLyBDT1JTIGhlYWRlcnMgZm9yIGRldiBwcmV2aWV3IChhbGxvd3MgaWZyYW1lIGVtYmVkZGluZylcbiAgICAgICAgaWYgKGlzRGV2KSB7XG4gICAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIE9QVElPTlMnKTtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IENTUCBoZWFkZXJzIGZvciBkZXZlbG9wbWVudCAobWlycm9ycyBwcm9kdWN0aW9uIF9oZWFkZXJzKVxuICAgICAgICByZXMuc2V0SGVhZGVyKFxuICAgICAgICAgICdDb250ZW50LVNlY3VyaXR5LVBvbGljeScsXG4gICAgICAgICAgW1xuICAgICAgICAgICAgXCJkZWZhdWx0LXNyYyAnc2VsZidcIixcbiAgICAgICAgICAgIFwic2NyaXB0LXNyYyAnc2VsZicgJ3Vuc2FmZS1pbmxpbmUnICd1bnNhZmUtZXZhbCcgaHR0cHM6Ly93d3cuZ29vZ2xldGFnbWFuYWdlci5jb20gaHR0cHM6Ly93d3cuZ29vZ2xlLWFuYWx5dGljcy5jb20gaHR0cHM6Ly9hbmFseXRpY3MuZ29vZ2xlLmNvbSBodHRwczovLyouc3VwYWJhc2UuY29cIixcbiAgICAgICAgICAgIFwic3R5bGUtc3JjICdzZWxmJyAndW5zYWZlLWlubGluZScgaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbVwiLFxuICAgICAgICAgICAgXCJmb250LXNyYyAnc2VsZicgaHR0cHM6Ly9mb250cy5nc3RhdGljLmNvbVwiLFxuICAgICAgICAgICAgXCJpbWctc3JjICdzZWxmJyBkYXRhOiBodHRwczogYmxvYjpcIixcbiAgICAgICAgICAgIFwiY29ubmVjdC1zcmMgJ3NlbGYnIGh0dHBzOi8vKi5zdXBhYmFzZS5jbyBodHRwczovL3d3dy5nb29nbGUtYW5hbHl0aWNzLmNvbSBodHRwczovL2FuYWx5dGljcy5nb29nbGUuY29tIGh0dHBzOi8vcmVnaW9uMS5hbmFseXRpY3MuZ29vZ2xlLmNvbSBodHRwczovL3JlZ2lvbjEuZ29vZ2xlLWFuYWx5dGljcy5jb20gaHR0cHM6Ly93d3cuZ29vZ2xldGFnbWFuYWdlci5jb20gaHR0cHM6Ly93d3cuZ29vZ2xlLm5sIGh0dHBzOi8vd3d3Lmdvb2dsZS5sayBodHRwczovL2ltYWdlcy5wZXhlbHMuY29tIGh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20gaHR0cHM6Ly9mb250cy5nc3RhdGljLmNvbSBodHRwczovL2Nkbi5zaG9waWZ5LmNvbSBodHRwczovLyouc2hvcGlmeS5jb20gaHR0cHM6Ly9nbHA4Lm5ldCBodHRwczovLyouZGFpc3ljb24uY29tIGh0dHBzOi8vZGFpc3ljb24uaW8gd3M6IHdzczpcIixcbiAgICAgICAgICAgIFwiZnJhbWUtc3JjICdub25lJ1wiLFxuICAgICAgICAgICAgaXNEZXYgPyBcImZyYW1lLWFuY2VzdG9ycyAqXCIgOiBcImZyYW1lLWFuY2VzdG9ycyAnc2VsZidcIiwgLy8gQWxsb3cgaWZyYW1lIGluIGRldiBmb3IgQm9sdFxuICAgICAgICAgICAgXCJvYmplY3Qtc3JjICdub25lJ1wiLFxuICAgICAgICAgICAgXCJiYXNlLXVyaSAnc2VsZidcIixcbiAgICAgICAgICAgIFwiZm9ybS1hY3Rpb24gJ3NlbGYnXCIsXG4gICAgICAgICAgXS5qb2luKCc7ICcpXG4gICAgICAgICk7XG4gICAgICAgIG5leHQoKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gIH07XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsY0FBYyxlQUFlO0FBQy9QLE9BQU8sV0FBVzs7O0FDV0gsU0FBUixVQUEyQixNQUF3QjtBQUN4RCxRQUFNLGtCQUFrQixNQUFNLFFBQVEsb0JBQW9CLFFBQVEsUUFBUSxFQUFFO0FBQzVFLFFBQU0sU0FBUztBQUNmLFFBQU0sUUFBUTtBQUVkLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVUsTUFBTSxJQUFJO0FBQ2xCLFVBQUk7QUFFRixZQUFJLENBQUMsR0FBRyxTQUFTLE9BQU8sRUFBRyxRQUFPO0FBRWxDLFlBQUksTUFBTTtBQUNWLFlBQUksVUFBVTtBQUdkLFlBQUksT0FBTyxLQUFLLEdBQUcsR0FBRztBQUNwQixnQkFBTSxJQUFJLFFBQVEsUUFBUSxpQkFBaUIsR0FBRztBQUM5QyxvQkFBVTtBQUVWLGtCQUFRLElBQUksc0NBQXNDLGNBQWMsUUFBUSxFQUFFLEVBQUU7QUFBQSxRQUM5RTtBQUdBLFlBQUksTUFBTSxLQUFLLEdBQUcsR0FBRztBQUNuQixrQkFBUTtBQUFBLFlBQ04seUNBQXlDLEVBQUU7QUFBQSxVQUM3QztBQUFBLFFBQ0Y7QUFFQSxlQUFPLFVBQVUsRUFBRSxNQUFNLEtBQUssS0FBSyxLQUFLLElBQUk7QUFBQSxNQUM5QyxTQUFTLE9BQU87QUFDZCxnQkFBUSxNQUFNLGlDQUFpQyxLQUFLO0FBQ3BELGVBQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjs7O0FDM0NlLFNBQVIsU0FBa0M7QUFDdkMsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sZ0JBQWdCLFFBQVE7QUFDdEIsYUFBTyxZQUFZLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUztBQUV6QyxjQUFNLFFBQVEsUUFBUSxJQUFJLGFBQWE7QUFHdkMsWUFBSSxPQUFPO0FBQ1QsY0FBSSxVQUFVLCtCQUErQixHQUFHO0FBQ2hELGNBQUksVUFBVSxnQ0FBZ0MsaUNBQWlDO0FBQy9FLGNBQUksVUFBVSxnQ0FBZ0MsNkJBQTZCO0FBQUEsUUFDN0U7QUFHQSxZQUFJO0FBQUEsVUFDRjtBQUFBLFVBQ0E7QUFBQSxZQUNFO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQSxRQUFRLHNCQUFzQjtBQUFBO0FBQUEsWUFDOUI7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQ0YsRUFBRSxLQUFLLElBQUk7QUFBQSxRQUNiO0FBQ0EsYUFBSztBQUFBLE1BQ1AsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQ0Y7OztBRjNDa0ksSUFBTSwyQ0FBMkM7QUFNbkwsSUFBTSxZQUFZLElBQUksSUFBSSxTQUFTLHdDQUFlLEVBQUU7QUFFcEQsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBQzNDLFFBQU0sUUFBUSxJQUFJLHVCQUF1QixvQkFBb0IsUUFBUSxRQUFRLEVBQUU7QUFFL0UsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBO0FBQUEsTUFFTixVQUFVLEVBQUUsS0FBSyxDQUFDO0FBQUE7QUFBQSxNQUVsQixPQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTyxDQUFDLEVBQUUsTUFBTSxLQUFLLGFBQWEsVUFBVSxDQUFDO0FBQUEsSUFDL0M7QUFBQTtBQUFBLElBRUEsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBO0FBQUEsTUFDTixZQUFZO0FBQUEsSUFDZDtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsV0FBVztBQUFBLE1BQ1gsUUFBUTtBQUFBLE1BQ1IsY0FBYztBQUFBLE1BQ2QsZUFBZTtBQUFBLFFBQ2IsVUFBVSxDQUFDO0FBQUEsUUFDWCxRQUFRO0FBQUEsVUFDTixhQUFhLElBQUk7QUFDZixnQkFBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQy9CLGtCQUFJLEdBQUcsU0FBUyxPQUFPLEtBQUssR0FBRyxTQUFTLFdBQVcsS0FBSyxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQ25GLHVCQUFPO0FBQUEsY0FDVDtBQUNBLGtCQUFJLEdBQUcsU0FBUyxlQUFlLEdBQUc7QUFDaEMsdUJBQU87QUFBQSxjQUNUO0FBQ0Esa0JBQUksR0FBRyxTQUFTLFdBQVcsR0FBRztBQUM1Qix1QkFBTztBQUFBLGNBQ1Q7QUFDQSxrQkFBSSxHQUFHLFNBQVMsV0FBVyxHQUFHO0FBQzVCLHVCQUFPO0FBQUEsY0FDVDtBQUNBLGtCQUFJLEdBQUcsU0FBUyxNQUFNLEdBQUc7QUFDdkIsdUJBQU87QUFBQSxjQUNUO0FBQ0EscUJBQU87QUFBQSxZQUNUO0FBQUEsVUFDRjtBQUFBLFVBQ0EsZ0JBQWdCO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUEsUUFDbEI7QUFBQSxNQUNGO0FBQUEsTUFDQSx1QkFBdUI7QUFBQSxNQUN2QixRQUFRO0FBQUEsTUFDUixlQUFlO0FBQUEsUUFDYixVQUFVO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxlQUFlO0FBQUEsVUFDZixZQUFZLENBQUMsZUFBZSxjQUFjO0FBQUEsUUFDNUM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04scUJBQXFCLEtBQUssVUFBVSxJQUFJO0FBQUEsSUFDMUM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
