#!/usr/bin/env node
import fs from "fs";
import path from "path";

/* ------------------------------ config ------------------------------ */
const exts = [".ts", ".tsx", ".js", ".jsx", ".css", ".html"];
const fails = [];

/* ------------------------------ helpers ----------------------------- */
const has = (p) => fs.existsSync(p);
const read = (p) => fs.readFileSync(p, "utf8");

function walk(dir, onFile) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, onFile);
    else if (exts.some((e) => p.endsWith(e))) onFile(p);
  }
}

/** Flag alleen ECHTE '...' placeholders; tolereer spreads/rest */
function fileHasBadEllipsis(code) {
  const re = /\.\.\./g;
  let m;
  let bad = false;
  while ((m = re.exec(code))) {
    const i = m.index;
    const before = code.slice(0, i).trimEnd();
    const after = code.slice(i + 3).trimStart();

    const prev = before.slice(-1) || "";
    const next = after[0] || "";

    const nextLooksLikeSpread = /[A-Za-z_$\{\[\(]/.test(next);
    const prevAllowsSpread = prev === "{" || prev === "[" || prev === "(";

    // Spread/rest (allowed): {...x} [...x] (...args) or ...id
    if (nextLooksLikeSpread || prevAllowsSpread) continue;

    // Anders is dit hoogstwaarschijnlijk een placeholder in JSX/JS
    bad = true;
    break;
  }
  return bad;
}

/* ------------------------------ checks ------------------------------ */
// 1) ErrorBoundary default export aanwezig
if (!has("src/components/ErrorBoundary.tsx")) {
  fails.push("Missing src/components/ErrorBoundary.tsx");
} else {
  const eb = read("src/components/ErrorBoundary.tsx");
  if (!/export\s+default\s+ErrorBoundary/.test(eb)) {
    fails.push("ErrorBoundary.tsx must export default ErrorBoundary.");
  }
}

// 2) tsconfig alias
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

// 3) scan source tree
const badImports = [];
const badEllipsis = [];
const badClassesFilter = [];
const nestedRouters = [];

if (has("src")) {
  walk("src", (p) => {
    const c = read(p);

    // 3a) Verbied named import van ErrorBoundary
    if (/\bimport\s*\{\s*ErrorBoundary\s*\}\s*from\s*["'](@\/|(\.\.\/)*|\.\/)components\/ErrorBoundary["']/.test(c)) {
      badImports.push(p);
    }

    // 3b) Ellipsis die geen spread/rest is
    if (fileHasBadEllipsis(c)) {
      badEllipsis.push(p);
    }

    // 3c) classes.filter(…) patronen (string/undefined → crash)
    // let op: enkel heel gericht op variabele 'classes'
    if (/(^|[^A-Za-z0-9_$])classes\s*\.\s*filter\s*\(/.test(c)) {
      badClassesFilter.push(p);
    }

    // 3d) second routers buiten main.tsx
    const routerRE = /<(BrowserRouter|HashRouter|MemoryRouter|Router)\b|RouterProvider\b|createBrowserRouter\s*\(/;
    if (routerRE.test(c) && !p.endsWith(path.normalize("src/main.tsx"))) {
      nestedRouters.push(p);
    }
  });
}

// 4) verzamel fouten
if (badImports.length) {
  fails.push("Use default import for ErrorBoundary:\n  - " + badImports.join("\n  - "));
}
if (badEllipsis.length) {
  fails.push("Remove placeholder '...' (not spread/rest):\n  - " + badEllipsis.join("\n  - "));
}
if (badClassesFilter.length) {
  fails.push("Replace 'classes.filter(Boolean).join(\" \")' with a safe helper (joinClasses/cn):\n  - " + badClassesFilter.join("\n  - "));
}
if (nestedRouters.length) {
  fails.push("Nested router(s) found outside src/main.tsx:\n  - " + nestedRouters.join("\n  - "));
}

// 5) resultaat
if (fails.length) {
  console.error("✖ Preflight failed:\n- " + fails.join("\n- "));
  process.exit(1);
} else {
  console.log("✔ Preflight OK");
}