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
      rollupOptions: {
        external: [],
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-ui": ["lucide-react", "react-hot-toast", "react-helmet-async"],
            "vendor-data": ["@tanstack/react-query", "@supabase/supabase-js"]
          }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGx1Z2lucy9ob3N0LXN3ZWVwLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBob3N0U3dlZXAgZnJvbSBcIi4vcGx1Z2lucy9ob3N0LXN3ZWVwXCI7XG5cbi8vIExldCBvcDogZ2VlbiAnbm9kZTpwYXRoJyBjb25mb3JtIGFyY2hpdGVjdHV1ci1mcmVlemUuXG5jb25zdCBTUkNfQUxJQVMgPSBuZXcgVVJMKFwiLi9zcmNcIiwgaW1wb3J0Lm1ldGEudXJsKS5wYXRobmFtZTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksIFwiXCIpO1xuICBjb25zdCBob3N0ID0gKGVudi5WSVRFX0NBTk9OSUNBTF9IT1NUIHx8IFwiaHR0cHM6Ly9maXRmaS5haVwiKS5yZXBsYWNlKC9cXC8rJC8sIFwiXCIpO1xuXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgcmVhY3QoKSxcbiAgICAgIC8vIFVSTC1zd2VlcCBkcmFhaXQgaW4gZGV2IFx1MDBFOW4gYnVpbGQ7IG51bCB2aXN1ZWxlIGltcGFjdC5cbiAgICAgIGhvc3RTd2VlcCh7IGhvc3QgfSksXG4gICAgXSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczogW3sgZmluZDogXCJAXCIsIHJlcGxhY2VtZW50OiBTUkNfQUxJQVMgfV0sXG4gICAgfSxcbiAgICAvLyBPdmVyaWdlIHByb2plY3RpbnN0ZWxsaW5nZW4gYmxpanZlbiBvbmdld2lqemlnZFxuICAgIHNlcnZlcjogeyBwb3J0OiA1MTczIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgICB0YXJnZXQ6ICdlczIwMjInLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBleHRlcm5hbDogW10sXG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICAgJ3ZlbmRvci1yZWFjdCc6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAgICd2ZW5kb3ItdWknOiBbJ2x1Y2lkZS1yZWFjdCcsICdyZWFjdC1ob3QtdG9hc3QnLCAncmVhY3QtaGVsbWV0LWFzeW5jJ10sXG4gICAgICAgICAgICAndmVuZG9yLWRhdGEnOiBbJ0B0YW5zdGFjay9yZWFjdC1xdWVyeScsICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgX19GSVRGSV9DQU5PTklDQUxfXzogSlNPTi5zdHJpbmdpZnkoaG9zdCksXG4gICAgfSxcbiAgfTtcbn0pOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9wbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3BsdWdpbnMvaG9zdC1zd2VlcC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3BsdWdpbnMvaG9zdC1zd2VlcC50c1wiOy8vIHBsdWdpbnMvaG9zdC1zd2VlcC50c1xuLy8gVml0ZSBwbHVnaW46IGNlbnRyYWxpc2VlcnQgaG9zdGdlYnJ1aWsgZW4gd2FhcnNjaHV3dCB2b29yIGxvc3NlICc/cmVmPScgcGF0dGVybnMuXG4vLyAtIFZlcnZhbmd0ICdodHRwczovL2ZpdGZpLmFpJyBoYXJkY29kZXMgZG9vciBkZSBpbmdlc3RlbGRlIGhvc3QgKGVudiAvIGZhbGxiYWNrKS5cbi8vIC0gR2VlZnQgd2FhcnNjaHV3aW5nZW4gYmlqICc/cmVmPScgem9kYXQgZGV2cyBkZSBoZWxwZXJzIGdlYnJ1aWtlbi5cbi8vIFN0eWxpbmcgYmxpamZ0IG9uYWFuZ2Vyb2VyZC5cblxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tIFwidml0ZVwiO1xuXG50eXBlIE9wdGlvbnMgPSB7XG4gIGhvc3Q/OiBzdHJpbmc7IC8vIGJ2LiAnaHR0cHM6Ly9maXRmaS5haSdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGhvc3RTd2VlcChvcHRzPzogT3B0aW9ucyk6IFBsdWdpbiB7XG4gIGNvbnN0IGNvbmZpZ3VyZWRIb3N0ID0gKG9wdHM/Lmhvc3QgfHwgXCJodHRwczovL2ZpdGZpLmFpXCIpLnJlcGxhY2UoL1xcLyskLywgXCJcIik7XG4gIGNvbnN0IGhvc3RSZSA9IC9odHRwcz86XFwvXFwvZml0ZmlcXC5haVxcLz8vZ2k7XG4gIGNvbnN0IHJlZlJlID0gLyhcXD98XFwmKXJlZj0vZztcblxuICByZXR1cm4ge1xuICAgIG5hbWU6IFwiZml0ZmktaG9zdC1zd2VlcFwiLFxuICAgIGVuZm9yY2U6IFwicHJlXCIsXG4gICAgdHJhbnNmb3JtKGNvZGUsIGlkKSB7XG4gICAgICAvLyBBbGxlZW4gb256ZSBicm9uYmVzdGFuZGVuXG4gICAgICBpZiAoIWlkLmluY2x1ZGVzKFwiL3NyYy9cIikpIHJldHVybiBudWxsO1xuXG4gICAgICBsZXQgb3V0ID0gY29kZTtcbiAgICAgIGxldCB0b3VjaGVkID0gZmFsc2U7XG5cbiAgICAgIC8vIDEpIEhhcmRjb2RlZCBob3N0IHZlcnZhbmdlbiBkb29yIGVudi1ob3N0IChzdHJpbmctbmFhci1zdHJpbmcsIGdlZW4gc3R5bGluZyBpbXBhY3QpXG4gICAgICBpZiAoaG9zdFJlLnRlc3Qob3V0KSkge1xuICAgICAgICBvdXQgPSBvdXQucmVwbGFjZShob3N0UmUsIGNvbmZpZ3VyZWRIb3N0ICsgXCIvXCIpO1xuICAgICAgICB0b3VjaGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy53YXJuKGBbaG9zdC1zd2VlcF0gSG9zdCBnZXJld3JpdHRlbiBuYWFyICR7Y29uZmlndXJlZEhvc3R9IGluOiAke2lkfWApO1xuICAgICAgfVxuXG4gICAgICAvLyAyKSBMb3NzZSAnP3JlZj0nIHNpZ25hbGVyZW4gKGxpZXZlciB1cmxzL3NoYXJlIGhlbHBlcnMpXG4gICAgICBpZiAocmVmUmUudGVzdChvdXQpKSB7XG4gICAgICAgIHRoaXMud2FybihcbiAgICAgICAgICBgW2hvc3Qtc3dlZXBdICc/cmVmPScgZ2VkZXRlY3RlZXJkIGluOiAke2lkfS4gR2VicnVpayB1cmxzLmJ1aWxkUmVmZXJyYWxVcmwoKS9zaGFyZS5tYWtlSW52aXRlU2hhcmUoKSBpLnAudi4gc3RyaW5nLWNvbmNhdC5gXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0b3VjaGVkID8geyBjb2RlOiBvdXQsIG1hcDogbnVsbCB9IDogbnVsbDtcbiAgICB9LFxuICB9O1xufSJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxjQUFjLGVBQWU7QUFDL1AsT0FBTyxXQUFXOzs7QUNXSCxTQUFSLFVBQTJCLE1BQXdCO0FBQ3hELFFBQU0sa0JBQWtCLE1BQU0sUUFBUSxvQkFBb0IsUUFBUSxRQUFRLEVBQUU7QUFDNUUsUUFBTSxTQUFTO0FBQ2YsUUFBTSxRQUFRO0FBRWQsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVSxNQUFNLElBQUk7QUFFbEIsVUFBSSxDQUFDLEdBQUcsU0FBUyxPQUFPLEVBQUcsUUFBTztBQUVsQyxVQUFJLE1BQU07QUFDVixVQUFJLFVBQVU7QUFHZCxVQUFJLE9BQU8sS0FBSyxHQUFHLEdBQUc7QUFDcEIsY0FBTSxJQUFJLFFBQVEsUUFBUSxpQkFBaUIsR0FBRztBQUM5QyxrQkFBVTtBQUNWLGFBQUssS0FBSyxzQ0FBc0MsY0FBYyxRQUFRLEVBQUUsRUFBRTtBQUFBLE1BQzVFO0FBR0EsVUFBSSxNQUFNLEtBQUssR0FBRyxHQUFHO0FBQ25CLGFBQUs7QUFBQSxVQUNILHlDQUF5QyxFQUFFO0FBQUEsUUFDN0M7QUFBQSxNQUNGO0FBRUEsYUFBTyxVQUFVLEVBQUUsTUFBTSxLQUFLLEtBQUssS0FBSyxJQUFJO0FBQUEsSUFDOUM7QUFBQSxFQUNGO0FBQ0Y7OztBRDVDa0ksSUFBTSwyQ0FBMkM7QUFLbkwsSUFBTSxZQUFZLElBQUksSUFBSSxTQUFTLHdDQUFlLEVBQUU7QUFFcEQsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBQzNDLFFBQU0sUUFBUSxJQUFJLHVCQUF1QixvQkFBb0IsUUFBUSxRQUFRLEVBQUU7QUFFL0UsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBO0FBQUEsTUFFTixVQUFVLEVBQUUsS0FBSyxDQUFDO0FBQUEsSUFDcEI7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU8sQ0FBQyxFQUFFLE1BQU0sS0FBSyxhQUFhLFVBQVUsQ0FBQztBQUFBLElBQy9DO0FBQUE7QUFBQSxJQUVBLFFBQVEsRUFBRSxNQUFNLEtBQUs7QUFBQSxJQUNyQixPQUFPO0FBQUEsTUFDTCxXQUFXO0FBQUEsTUFDWCxRQUFRO0FBQUEsTUFDUixlQUFlO0FBQUEsUUFDYixVQUFVLENBQUM7QUFBQSxRQUNYLFFBQVE7QUFBQSxVQUNOLGNBQWM7QUFBQSxZQUNaLGdCQUFnQixDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxZQUN6RCxhQUFhLENBQUMsZ0JBQWdCLG1CQUFtQixvQkFBb0I7QUFBQSxZQUNyRSxlQUFlLENBQUMseUJBQXlCLHVCQUF1QjtBQUFBLFVBQ2xFO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixxQkFBcUIsS0FBSyxVQUFVLElBQUk7QUFBQSxJQUMxQztBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
