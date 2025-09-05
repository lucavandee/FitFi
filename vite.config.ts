import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * Hard guard: blokkeer letterlijke "..." in modules die Vite compileert.
 * Dit draait alleen op daadwerkelijk geïmporteerde bestanden.
 */
function fitfiGuard() {
  return {
    name: "fitfi-guard",
    transform(code: string, id: string) {
      if (!id.includes("/src/")) return null;
      if (code.includes("...")) {
        throw new Error(`[fitfi-guard] Illegal literal ellipsis ("...") in ${id}. Vervang door echte code.`);
      }
      return null;
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), fitfiGuard()],
    resolve: { alias: { "@": path.resolve(process.cwd(), "src") } },
    build: { target: "es2020", sourcemap: true, outDir: "dist", emptyOutDir: true },
    server: { port: 5173 },
    preview: { port: 4173 },
    define: { __APP_ENV__: JSON.stringify(env.VITE_ENVIRONMENT || "development") },
  };
});