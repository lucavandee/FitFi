/**
 * FitFi Check Casing – voorkomt case-mismatches tussen imports en bestandsnamen.
 * 
 * Dit faalt in CI/Linux wanneer een import niet exact matcht met de bestandsnaam.
 * 
 * Werking:
 * - Zoekt alle imports in src/.
 * - Controleert voor alias @/ en lokale ./ imports of het bestand exact bestaat.
 * 
 * Exit: 1 bij fouten.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const EXTS = [".ts", ".tsx", ".js", ".jsx"];
const ERR = [];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (EXTS.includes(path.extname(p))) out.push(p);
  }
  return out;
}

function resolveAlias(spec) {
  // '@/x/y' -> '<ROOT>/src/x/y'
  return path.join(SRC, spec.replace(/^@\//, ""));
}

function fileExistsExact(p) {
  // Controleer exact pad; als er geen extensie is, probeer standaard extensies.
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return true;
  for (const ext of ["", ".ts", ".tsx", ".js", ".jsx"]) {
    const candidate = p.endsWith(ext) ? p : p + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return true;
    // index.ts/tsx/js/jsx
    const asDir = candidate;
    const idx = path.join(asDir, "index" + ext);
    if (fs.existsSync(idx) && fs.statSync(idx).isFile()) return true;
  }
  return false;
}

const RX = /^\s*import\s+.+?\s+from\s+["']([^"']+)["'];?\s*$/gm;
const files = walk(SRC);

for (const f of files) {
  const txt = fs.readFileSync(f, "utf8");
  let m;
  while ((m = RX.exec(txt)) !== null) {
    const spec = m[1];
    if (spec.startsWith("@/")) {
      const target = resolveAlias(spec);
      if (!fileExistsExact(target)) {
        ERR.push(`${f}: import pad bestaat niet exact (case-mismatch of verkeerd pad): ${spec}`);
      }
    } else if (spec.startsWith("./")) {
      const target = path.resolve(path.dirname(f), spec);
      if (!fileExistsExact(target)) {
        ERR.push(`${f}: lokale import bestaat niet exact: ${spec}`);
      }
    }
  }
}

if (ERR.length) {
  console.error("⛔ Casing checks failed:\n" + ERR.map(s => "  - " + s).join("\n"));
  process.exit(1);
}
console.log("✅ Casing checks passed.");