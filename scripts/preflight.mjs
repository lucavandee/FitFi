/**
 * FitFi Preflight – blokkeert verboden patronen vóór build.
 * (uitgebreid: detecteer "placeholder removed" restanten)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIRS = ["src", "netlify", "functions"].map((p) => path.join(ROOT, p));
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".toml"]);

const forbidden = [
  { name: "TODO", re: /\bTODO\b/ },
  { name: "TBD", re: /\bTBD\b/ },
  { name: "Named import { ErrorBoundary }", re: /import\s*\{\s*ErrorBoundary\s*\}\s*from\s*["']@\/components\/ErrorBoundary["']/ },
  { name: "Tailwind v4 patterns", re: /@tailwind\s+theme|:where\(|--tw-|tw\(/ },
  { name: "placeholder removed marker", re: /placeholder removed/ },
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (exts.has(path.extname(p))) out.push(p);
  }
  return out;
}

const files = SRC_DIRS.flatMap((d) => walk(d));
let errors = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const rule of forbidden) {
    if (rule.re.test(text)) errors.push(`${file}: contains ${rule.name}`);
  }
}

if (errors.length) {
  console.error("⛔ Preflight failed. Fix the following issues:\n" + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
} else {
  console.log("✅ Preflight passed.");
  process.exit(0);
}