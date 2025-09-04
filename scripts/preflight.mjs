#!/usr/bin/env node
import fs from "fs";
import path from "path";

const fails = [];

function r(p) { return path.resolve(process.cwd(), p); }

function has(p) { return fs.existsSync(r(p)); }

function read(p) { return fs.readFileSync(r(p), "utf8"); }

if (!has("src/components/ErrorBoundary.tsx")) {
  fails.push("Missing src/components/ErrorBoundary.tsx");
} else {
  const eb = read("src/components/ErrorBoundary.tsx");
  if (!/export\s+default\s+ErrorBoundary/.test(eb)) {
    fails.push("ErrorBoundary.tsx must export default ErrorBoundary.");
  }
}

try {
  const ts = JSON.parse(read("tsconfig.json"));
  const okPath = ts?.compilerOptions?.paths?.["@/*"]?.[0] === "src/*";
  if (!okPath) fails.push('tsconfig.json must set: "paths": { "@/*": ["src/*"] }');
} catch {
  fails.push("Missing or unreadable tsconfig.json");
}

const badImports = [];
const ellipsis = [];
const exts = [".ts", ".tsx", ".js", ".jsx", ".css", ".html"];

function walk(dir) {
  for (const n of fs.readdirSync(dir)) {
    const p = path.join(dir, n);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else if (exts.some(e => p.endsWith(e))) {
      const c = fs.readFileSync(p, "utf8");
      if (/\bimport\s*\{\s*ErrorBoundary\s*\}\s*from\s*["'](@\/|(\.\.\/)*|\.\/)components\/ErrorBoundary["']/.test(c)) badImports.push(p);
      if (/\.\.\./.test(c)) ellipsis.push(p);
    }
  }
}
if (has("src")) walk("src");

if (badImports.length) fails.push("Use default import for ErrorBoundary:\n  - " + badImports.join("\n  - "));
if (ellipsis.length) fails.push("Remove '...' placeholders:\n  - " + ellipsis.join("\n  - "));

if (fails.length) {
  console.error("✖ Preflight failed:\n- " + fails.join("\n- "));
  process.exit(1);
} else {
  console.log("✔ Preflight OK");
}