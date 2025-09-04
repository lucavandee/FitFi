/**
 * Codemod: vervang foutief gebruik supabase() door supabase
 * en (optioneel) getSupabase() → consistentie.
 * 
 * Gebruik:
 * node scripts/codemods/fix-supabase-callable.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const targetRE = /\bsupabase\s*\(\s*\)/g;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (exts.has(path.extname(p))) out.push(p);
  }
  return out;
}

const files = walk(SRC_DIR);
let changed = 0;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  if (!targetRE.test(src)) continue;

  let next = src.replace(targetRE, "supabase");

  // Bonus: als er imports bestaan die een client uit "@/lib/supabaseClient" halen,
  // is dit precies wat we willen. Anders kan je later kiezen voor getSupabase().
  if (next !== src) {
    fs.writeFileSync(file, next, "utf8");
    console.log(`✔ Rewrote supabase() → supabase in ${file}`);
    changed++;
  }
}

console.log(changed ? `✅ Codemod done. Files changed: ${changed}` : "ℹ No files needed changes.");