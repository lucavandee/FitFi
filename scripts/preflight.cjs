/**
 * Preflight – blokkeert verboden patronen.
 * Verbetert stabiliteit: draait EERST cleanup-placeholders, daarna scant en faalt pas als er nog issues zijn.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = process.cwd();
const SRC_DIRS = ["src", "netlify", "functions"]
  .map((p) => path.join(ROOT, p))
  .filter((p) => fs.existsSync(p));
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".toml"]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (EXTS.has(path.extname(p))) out.push(p);
  }
  return out;
}

// 0) Auto-clean placeholders
const cleanup = spawnSync(process.execPath, ["scripts/fix/cleanup-placeholders.cjs"], { stdio: "inherit" });
if (cleanup.status !== 0) {
  console.error("⛔ cleanup-placeholders failed.");
  process.exit(cleanup.status || 1);
}

const forbidden = [
  { name: "TODO", re: /\bTODO\b/ },
  { name: "TBD", re: /\bTBD\b/ },
  { name: "Named import { ErrorBoundary }", re: /import\s*{\s*ErrorBoundary\s*}\s*from\s*["']@\/components\/ErrorBoundary["']/ },
  { name: "Tailwind v4 patterns", re: /@tailwind\s+theme|:where\(|--tw-|tw\(/ },
  { name: "placeholder removed marker", re: /placeholder\s+removed/ }, // blijft als safety-net
];

const files = SRC_DIRS.flatMap((d) => walk(d));
const errors = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const rule of forbidden) {
    if (rule.re.test(text)) errors.push(`${file}: contains ${rule.name}`);
  }
}

if (errors.length) {
  console.error("⛔ Preflight failed. Fix the following issues:\n" + errors.map((e) => "  - " + e).join("\n"));
  process.exit(2);
}
console.log("✅ Preflight passed.");