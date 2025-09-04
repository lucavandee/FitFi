/**
 * FitFi Preflight – blokkeert verboden patronen vóór build.
 * 
 * - Literal ellipsis "..." buiten geldige JS spread/rest
 * - TODO / TBD markers
 * - Named import van lokale default ErrorBoundary
 * - Tailwind v4 hints
 * 
 * Exit codes:
 * - 0 = OK
 * - 1 = Fout(en) gevonden
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIRS = ["src", "netlify", "functions"].map(p => path.join(ROOT, p));
/** Bestanden die we scannen */
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".toml"]);

const forbidden = [
  { name: "TODO", re: /\bTODO\b/ },
  { name: "TBD", re: /\bTBD\b/ },
  // Named import van lokale default ErrorBoundary
  { name: "Named import { ErrorBoundary }", re: /import\s*{\s*ErrorBoundary\s*}\s*from\s*["']@\/components\/ErrorBoundary["']/ },
  // Tailwind v4 indicatoren (heuristisch, safe om te flaggen)
  { name: "Tailwind v4 patterns", re: /@tailwind\s+theme|:where\(|--tw-|tw\(/ },
];

// Ellipsis detector: flag "..." die GEEN geldige spread/rest is.
// Toegestane patronen: {...x} [...x] (...args) ...identifier (in arg list)
function hasBadEllipsis(text) {
  const all = [...text.matchAll(/\.\.\./g)].map(m => m.index ?? -1);
  for (const idx of all) {
    const before = text.slice(Math.max(0, idx - 6), idx);
    const after = text.slice(idx + 3, idx + 20);
    const ok =
      // object spread {...x}
      /{\s*$/.test(before) ||
      // array spread [...x]
      /\[\s*$/.test(before) ||
      // rest args (...args
      /\(\s*$/.test(before) ||
      // function params, arrow etc. – heuristisch ok
      /,\s*$/.test(before) ||
      // spread before ident/comma/close
      /^[\s\w$]/.test(after);
    if (!ok) return true;
  }
  return false;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (exts.has(path.extname(p))) out.push(p);
  }
  return out;
}

const files = SRC_DIRS.flatMap(d => walk(d));
let errors = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");

  // Forbidden markers
  for (const rule of forbidden) {
    if (rule.re.test(text)) {
      errors.push(`${file}: contains ${rule.name}`);
    }
  }

  // Ellipsis check
  if (hasBadEllipsis(text)) {
    errors.push(`${file}: contains invalid literal ellipsis "..." (not spread/rest)`);
  }
}

if (errors.length) {
  console.error("⛔ Preflight failed. Fix the following issues:\n" + errors.map(e => " - " + e).join("\n"));
  process.exit(1);
} else {
  console.log("✅ Preflight passed.");
  process.exit(0);
}