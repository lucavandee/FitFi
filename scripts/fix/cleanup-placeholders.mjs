/**
 * Cleanup script – verwijder alle "placeholder removed"-resten en zet ze om naar geldige code.
 * 
 * Converteert patronen:
 * - In JSX attributes: {/* placeholder removed */IDENT} → {...IDENT}
 * - In object literals/arrays: /* placeholder removed */IDENT → ...IDENT
 * - Verwijdert losse commentaarstukken in JSDoc/strings.
 * 
 * Gebruik:
 * node scripts/fix/cleanup-placeholders.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (exts.has(path.extname(p))) out.push(p);
  }
  return out;
}

const files = walk(SRC);
let changed = 0;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  let out = src;

  // 1) JSX attribute variant: {/* placeholder removed */IDENT}
  out = out.replace(
    /\{\s*\/\*\s*placeholder removed\s*\*\/\s*([A-Za-z_$][\w$.]*)\s*\}/g,
    (_m, ident) => `{...${ident}}`
  );

  // 2) Object/array spread variant: /* placeholder removed */IDENT or /* placeholder removed */IDENT.prop
  out = out.replace(
    /\/\*\s*placeholder removed\s*\*\/\s*([A-Za-z_$][\w$.]*)/g,
    (_m, ident) => `...${ident}`
  );

  // 3) Overgebleven comment-string in JSDoc of inline: simpelweg weghalen
  out = out.replace(/\/\*\s*placeholder removed\s*\*\//g, "");

  if (out !== src) {
    fs.writeFileSync(file, out, "utf8");
    console.log(`✔ fixed placeholders in ${file}`);
    changed++;
  }
}

console.log(changed ? `✅ cleaned ${changed} file(s).` : "ℹ no placeholder markers found.");