/**
 * Cleanup "placeholder removed" → omzetting naar geldige spreads.
 * Voorbeelden (LET OP: tekstueel omschreven, geen daadwerkelijke JS):
 *   JSX attribuut:  { [MARKER] IDENT }  ->  { ...IDENT }
 *   Object/array:   [MARKER] IDENT      ->  ...IDENT
 *   Losse marker:   [MARKER]            ->  (verwijderen)
 *
 * Gebruik:
 *   node scripts/fix/cleanup-placeholders.cjs
 *   node scripts/fix/cleanup-placeholders.cjs --check   # alleen rapporteren
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const CHECK_ONLY = process.argv.includes("--check");

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
let found = 0;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  let out = src;

  // 1) JSX attribute variant: { /* placeholder removed */ IDENT } -> { ...IDENT }
  out = out.replace(
    /\{\s*\/\*\s*placeholder\s+removed\s*\*\/\s*([A-Za-z_$][\w$\.]*)\s*\}/g,
    (_m, id) => {
      found++;
      return `{...${id}}`;
    }
  );

  // 2) Object/array spread variant: /* placeholder removed */IDENT -> ...IDENT
  out = out.replace(
    /\/\*\s*placeholder\s+removed\s*\*\/\s*([A-Za-z_$][\w$\.]*)/g,
    (_m, id) => {
      found++;
      return `...${id}`;
    }
  );

  // 3) Overgebleven marker (zonder identifier)
  out = out.replace(/\/\*\s*placeholder\s+removed\s*\*\//g, (_m) => {
    found++;
    return "";
  });

  if (!CHECK_ONLY && out !== src) {
    fs.writeFileSync(file, out, "utf8");
    console.log(`✔ fixed placeholders in ${file}`);
    changed++;
  }
}

if (CHECK_ONLY) {
  if (found) {
    console.error(`⛔ Found ${found} placeholder marker(s).`);
    process.exit(2);
  } else {
    console.log("✅ No placeholder markers found.");
  }
} else {
  console.log(changed ? `✅ cleaned ${changed} file(s).` : "ℹ no placeholder markers found.");
}