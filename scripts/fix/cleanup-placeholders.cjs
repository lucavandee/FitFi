/**
 * Cleanup "placeholder removed" → converteer naar geldige spreads.
 * 
 * JSX: { /* placeholder removed */ IDENT } → { ...IDENT }
 * JS/TS: /* placeholder removed */ IDENT → ...IDENT
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (EXTS.has(path.extname(p))) out.push(p);
  }
  return out;
}

const files = walk(SRC);
let changed = 0;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  let out = src;

  out = out.replace(/{\s*\/\*\s*placeholder removed\s*\*\/\s*([A-Za-z_$][\w$.*]*)\s*}/g, (m, id) => `{...${id}}`);
  out = out.replace(/\/\*\s*placeholder removed\s*\*\/\s*([A-Za-z_$][\w$.*]*)/g, (_m, id) => `...${id}`);
  out = out.replace(/\/\*\s*placeholder removed\s*\*\//g, "");

  if (out !== src) {
    fs.writeFileSync(file, out, "utf8");
    console.log(`✔ fixed placeholders in ${file}`);
    changed++;
  }
}

console.log(changed ? `✅ cleaned ${changed} file(s).` : "ℹ no placeholder markers found.");