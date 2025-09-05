import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Guard: blokkeer letterlijke "..." in /src/
function fitfiGuard() {
  return {
    name: "fitfi-guard",
    enforce: "pre" as const,
    transform(code: string, id: string) {
      if (!id.includes(`${path.sep}src${path.sep}`)) return null;
      const matches = code.match(/\.\.\./g);
      if (matches?.length) {
        const rel = id.replace(process.cwd() + path.sep, "");
        throw new Error(
          [
            "⛔ FitFi Guard: gevonden *letterlijke* ellipses (\"...\") in bronbestand.",
            `Bestand: ${rel}`,
            `Aantal: ${matches.length}`,
            "Vervang placeholders door echte code of verwijder de import naar dit bestand.",
          ].join("\n")
        );
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
    server: { port: 5173 },
    preview: { port: 4173 },
    build: {
      target: "es2020",
      sourcemap: true,
      outDir: "dist",
      emptyOutDir: true,
      chunkSizeWarningLimit: 900,
    },
    define: { __APP_ENV__: JSON.stringify(env.VITE_ENVIRONMENT || "development") },
    // Belangrijk: inline TS-config → Vite leest root tsconfig niet meer
    esbuild: {
      tsconfigRaw: {
        compilerOptions: {
          target: "ES2020",
          lib: ["ES2020", "DOM", "DOM.Iterable"],
          jsx: "react-jsx",
          module: "ESNext",
          moduleResolution: "Bundler",
          baseUrl: ".",
          paths: { "@/*": ["src/*"] },
          noEmit: true,
          strict: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          types: ["vite/client"]
        }
      }
    }
  };
});