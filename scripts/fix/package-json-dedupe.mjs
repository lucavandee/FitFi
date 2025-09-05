/**
 * Deduplicate & normalize package.json "scripts".
 * 
 * Keeps the last occurrence (natural object order) for duplicates.
 * Ensures a single "preflight" and "check:all" exist.
 * 
 * Usage:
 *   node scripts/fix/package-json-dedupe.mjs
 */
import fs from "node:fs";

const file = "package.json";
const raw = fs.readFileSync(file, "utf8");
let pkg;
try {
  pkg = JSON.parse(raw);
} catch {
  console.error("⛔ package.json is geen geldige JSON. Run: node scripts/check-package-json.mjs");
  process.exit(1);
}

const orig = pkg.scripts || {};
const dedup = {};
for (const key of Object.keys(orig)) {
  // Last one wins
  dedup[key] = orig[key];
}

// Ensure our standard checks exist (don't overwrite if already set)
dedup["preflight"] = dedup["preflight"] || "node scripts/preflight.mjs";
dedup["check:imports"] = dedup["check:imports"] || "node scripts/check-imports.mjs";
dedup["check:aliases"] = dedup["check:aliases"] || "node scripts/check-aliases.mjs";
dedup["check:casing"] = dedup["check:casing"] || "node scripts/check-casing.mjs";
dedup["check:env"] = dedup["check:env"] || "node scripts/check-env.mjs";
dedup["typecheck"] = dedup["typecheck"] || "tsc --noEmit";
dedup["check:all"] = 
  "npm run preflight && npm run check:imports && npm run check:aliases && npm run check:casing && npm run typecheck";

pkg.scripts = Object.fromEntries(Object.entries(dedup));
fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n", "utf8");
console.log("✅ package.json scripts gededupliceerd & genormaliseerd.");