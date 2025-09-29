import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import hostSweep from "./plugins/host-sweep";

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
    ],
    resolve: {
      alias: [{ find: "@", replacement: SRC_ALIAS }],
    },
    // Overige projectinstellingen blijven ongewijzigd
    server: { port: 5173 },
    build: { sourcemap: false },
    define: {
      __FITFI_CANONICAL__: JSON.stringify(host),
    },
  };
});