const fs = require("fs");
const raw = fs.readFileSync("package.json", "utf8");
let pkg;
try { 
  pkg = JSON.parse(raw); 
} catch {
  console.error("⛔ package.json invalid JSON."); 
  process.exit(1);
}

const s = pkg.scripts || {};
const d = {};
for (const k of Object.keys(s)) d[k] = s[k];

d["preflight"] = d["preflight"] || "node scripts/preflight.mjs";
d["check:imports"] = d["check:imports"] || "node scripts/check-imports.mjs";
d["check:aliases"] = d["check:aliases"] || "node scripts/check-aliases.mjs";
d["check:casing"] = d["check:casing"] || "node scripts/check-casing.mjs";
d["check:env"] = d["check:env"] || "node scripts/check-env.mjs";
d["typecheck"] = d["typecheck"] || "tsc --noEmit";
d["check:all"] = "npm run preflight && npm run check:imports && npm run check:aliases && npm run check:casing && npm run typecheck";

pkg.scripts = Object.fromEntries(Object.entries(d));
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n", "utf8");
console.log("✅ package.json scripts de-duplicated & normalized.");