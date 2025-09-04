#!/usr/bin/env node
import fs from "fs";
import path from "path";

const fails = [];
const exts = [".ts", ".tsx", ".js", ".jsx", ".css", ".html"];

const has = (p) => fs.existsSync(p);
const read = (p) => fs.readFileSync(p, "utf8");

function hasBadEllipsis(code) {
  const re = /\.\.\./g;
  let m;
  while ((m = re.exec(code))) {
    const i = m.index;
    const before = code.slice(0, i).trimEnd();
    const after = code.slice(i + 3).trimStart();

    const prev = before.slice(-1) || "";
    const next = after[0] || "";

    const nextLooksLikeSpread = /[A-Za-z_$\{\[\(]/.test(next);
    const prevAllowsSpread = prev === "{" || prev === "[" || prev === "(";

    if (nextLooksLikeSpread) return false;
    if (prevAllowsSpread) return false;
    return true;
  }
  return false;
}

// ErrorBoundary default export check
if (!has("src/components/ErrorBoundary.tsx")) {
  fails.push("Missing src/components/ErrorBoundary.tsx");
} else {
  const eb = read("src/components/ErrorBoundary.tsx");
  if (!/export\s+default\s+ErrorBoundary/.test(eb)) {
    fails.push("ErrorBoundary.tsx must export default ErrorBoundary.");
  }
}

// tsconfig alias sanity
try {
  const ts = JSON.parse(read("tsconfig.json"));
  const ok =
    ts?.compilerOptions?.baseUrl === "." &&
    Array.isArray(ts?.compilerOptions?.paths?.["@/*"]) &&
    ts?.compilerOptions?.paths?.["@/*"][0] === "src/*";
  if (!ok) fails.push('tsconfig.json must set: "baseUrl": ".", "paths": { "@/*": ["src/*"] }');
} catch {
  fails.push("Missing or unreadable tsconfig.json");
}

// scan repo
const badImports = [];
const badEllipsis = [];

function walk(dir) {
  for (const n of fs.readdirSync(dir)) {
    const p = path.join(dir, n);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else if (exts.some((e) => p.endsWith(e))) {
      const c = read(p);
      if (/\bimport\s*\{\s*ErrorBoundary\s*\}\s*from\s*["'](@\/|(\.\.\/)*|\.\/)components\/ErrorBoundary["']/.test(c))
        badImports.push(p);
      if (hasBadEllipsis(c)) badEllipsis.push(p);
    }
  }
}
if (has("src")) walk("src");

if (badImports.length) fails.push("Use default import for ErrorBoundary:\n  - " + badImports.join("\n  - "));
if (badEllipsis.length) fails.push("Remove placeholder '...' (not spread/rest):\n  - " + badEllipsis.join("\n  - "));
// Router guard - prevent nested routers outside main.tsx
const routerHits = [];
function scanRouters(dir) {
  const fs = await import("fs");
  const path = await import("path");
  const re = /<(BrowserRouter|HashRouter|MemoryRouter|Router)\b|RouterProvider\b|createBrowserRouter\s*\(/g;
  (function walk(d) {
    for (const n of fs.readdirSync(d)) {
      const p = path.join(d, n);
      const s = fs.statSync(p);
      if (s.isDirectory()) walk(p);
      else if (/\.(t|j)sx?$/.test(p)) {
        const c = fs.readFileSync(p, "utf8");
        if (re.test(c) && !p.endsWith("src/main.tsx")) routerHits.push(p);
      }
    }
  })("src");
}
await scanRouters("src");
if (routerHits.length) fails.push("Nested router(s) found outside main.tsx:\n  - " + routerHits.join("\n  - "));


if (fails.length) {
  console.error("✖ Preflight failed:\n- " + fails.join("\n- "));
  process.exit(1);
} else {
  console.log("✔ Preflight OK");
}