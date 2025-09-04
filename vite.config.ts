import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

function scanFiles() {
  const root = "src";
  const exts = [".ts", ".tsx", ".js", ".jsx", ".css", ".html"];
  const badImports: string[] = [];
  const ellipsis: string[] = [];

  function walk(dir: string) {
    for (const name of fs.readdirSync(dir)) {
      const p = `${dir}/${name}`;
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (exts.some(e => p.endsWith(e))) {
        const c = fs.readFileSync(p, "utf8");
        if (/\bimport\s*\{\s*ErrorBoundary\s*\}\s*from\s*["'](@\/|(\.\.\/)*|\.\/)components\/ErrorBoundary["']/.test(c)) {
          badImports.push(p);
        }
        if (/\.\.\./.test(c)) ellipsis.push(p);
      }
    }
  }
  if (fs.existsSync(root)) walk(root);

  const fails: string[] = [];
  if (badImports.length) fails.push(`Use default import for ErrorBoundary:\n  - ${badImports.join("\n  - ")}`);
  if (ellipsis.length) fails.push(`Remove '...' placeholders:\n  - ${ellipsis.join("\n  - ")}`);

  // Sanity on alias in tsconfig
  try {
    const ts = JSON.parse(fs.readFileSync("tsconfig.json", "utf8"));
    const ok = ts?.compilerOptions?.paths?.["@/*"]?.[0] === "src/*";
    if (!ok) fails.push(`tsconfig.json must contain: "paths": { "@/*": ["src/*"] }`);
  } catch {
    fails.push("Missing or unreadable tsconfig.json");
  }

  if (fails.length) {
    throw new Error("FitFi preflight failed:\n" + fails.join("\n"));
  }
}

function fitfiGuard() {
  return {
    name: "fitfi-guard",
    enforce: "pre" as const,
    buildStart() {
      scanFiles();
    },
    configureServer(server: any) {
      // also guard on dev server start
      scanFiles();
      return () => {};
    }
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
    define: { __APP_ENV__: JSON.stringify(env.VITE_ENVIRONMENT || "development") }
  };
});