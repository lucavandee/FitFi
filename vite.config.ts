import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

function hasBadEllipsis(code: string): boolean {
  // Flag alleen '...' die GEEN spread/rest is.
  // - Sta toe: `{...id}`, `...id`, `(...args)`, `[...arr]`, `{ ...rest }`
  // - Flag: '...' in comments/strings/losse triple dots
  const re = /\.\.\./g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    const i = m.index;
    const before = code.slice(0, i).trimEnd();
    const after = code.slice(i + 3).trimStart();

    const prev = before.slice(-1) || "";
    const next = after[0] || "";

    // heuristiek: als er een identifier of { [ ( volgt, beschouw als spread/rest
    const nextLooksLikeSpread = /[A-Za-z_$\{\[\(]/.test(next);
    const prevAllowsSpread = prev === "{" || prev === "[" || prev === "(";

    // cases: `{...x}`, `[...x]`, `(...args)`, of zelfs direct `...x`
    if (nextLooksLikeSpread) return false; // minimaal één geldige spread rest-hit -> niet flaggen
    if (prevAllowsSpread) return false;
    // anders: dit is een verdachte placeholder
    return true;
  }
  return false;
}

function scanFiles() {
  const root = "src";
  const exts = [".ts", ".tsx", ".js", ".jsx", ".css", ".html"];
  const badImports: string[] = [];
  const badEllipsis: string[] = [];

  function walk(dir: string) {
    for (const name of fs.readdirSync(dir)) {
      const p = `${dir}/${name}`;
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (exts.some((e) => p.endsWith(e))) {
        const c = fs.readFileSync(p, "utf8");
        if (/\bimport\s*\{\s*ErrorBoundary\s*\}\s*from\s*["'](@\/|(\.\.\/)*|\.\/)components\/ErrorBoundary["']/.test(c)) {
          badImports.push(p);
        }
        if (hasBadEllipsis(c)) badEllipsis.push(p);
      }
    }
  }
  if (fs.existsSync(root)) walk(root);

  const fails: string[] = [];
  if (badImports.length) fails.push(`Use default import for ErrorBoundary:\n  - ${badImports.join("\n  - ")}`);
  if (badEllipsis.length) fails.push(`Remove placeholder '...' (not spread/rest):\n  - ${badEllipsis.join("\n  - ")}`);

  // tsconfig alias sanity
  try {
    const ts = JSON.parse(fs.readFileSync("tsconfig.json", "utf8"));
    const ok =
      ts?.compilerOptions?.baseUrl === "." &&
      Array.isArray(ts?.compilerOptions?.paths?.["@/*"]) &&
      ts?.compilerOptions?.paths?.["@/*"][0] === "src/*";
    if (!ok) fails.push(`tsconfig.json must contain: "baseUrl": ".", "paths": { "@/*": ["src/*"] }`);
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
    configureServer() {
      scanFiles();
      return () => {};
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