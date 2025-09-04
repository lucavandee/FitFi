/**
 * Codemod: dwing overal het gebruik van de canonical Supabase-client af.
 * 
 * Vervangt alle imports van supabase-client naar "@/lib/supabaseClient"
 * Zet foutieve aanroep supabase() om naar supabase
 * 
 * Gebruik:
 * node scripts/codemods/ensure-supabase-imports.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

const IMPORT_PATTERNS = [
  // Diverse mogelijke paden waar een client eerder vandaan kwam
  /from\s+["']@\/lib\/supabase["']/g,
  /from\s+["']@\/lib\/supabaseClient["']/g, // normalize ook dit naar exact pad
  /from\s+["']@\/utils\/supabase["']/g,
  /from\s+["']@\/utils\/supabaseClient["']/g,
  /from\s+["'][.\/]{1,2}.*supabaseClient["']/g,
  /from\s+["'][.\/]{1,2}.*supabase["']/g,
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

const files = walk(SRC);
let changes = 0;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");

  // Sla types-only bestanden met .d.ts over
  if (file.endsWith(".d.ts")) continue;

  let next = src;

  // Normaliseer imports naar "@/lib/supabaseClient"
  for (const re of IMPORT_PATTERNS) {
    next = next.replace(re, `from "@/lib/supabaseClient"`);
  }

  // Voeg import toe als er supabase wordt gebruikt maar geen import aanwezig is
  if (/[^.\w]supabase\b/.test(next) && !/from\s+["']@\/lib\/supabaseClient["']/.test(next)) {
    // Plaats de import bovenaan (na eventuele shebang/pragma)
    const lines = next.split("\n");
    let insertAt = 0;
    while (insertAt < lines.length && (/^\/\*/.test(lines[insertAt]) || /^\/\/!/.test(lines[insertAt]) || lines[insertAt].trim() === "")) {
      insertAt++;
    }
    lines.splice(insertAt, 0, `import supabase from "@/lib/supabaseClient";`);
    next = lines.join("\n");
  }

  // Zet foutieve callable pattern supabase() → supabase
  next = next.replace(/\bsupabase\s*\(\s*\)/g, "supabase");

  if (next !== src) {
    fs.writeFileSync(file, next, "utf8");
    console.log(`✔ Updated: ${file}`);
    changes++;
  }
}

console.log(changes ? `✅ Codemod klaar. Aangepaste files: ${changes}` : "ℹ Geen wijzigingen nodig.");