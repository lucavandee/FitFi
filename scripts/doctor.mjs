#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ok = (m) => console.log(`✅ ${m}`);
const warn = (m) => console.warn(`⚠️  ${m}`);

const reqNode = "20.19.0";
if (process.version !== `v${reqNode}`) {
  warn(`Node ${reqNode} aanbevolen; gedetecteerd: ${process.version}`);
}

const must = [
  "src/main.tsx",
  "index.html",
  "netlify/functions/nova.ts"
];
for (const p of must) {
  if (!fs.existsSync(p)) warn(`Ontbrekend of verplaatst: ${p}`);
}

// Ellipses-scan (afgebroken content)
let cnt = 0;
const scan = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules",".git","dist",".bolt"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) scan(p);
    else if (/\.(tsx?|jsx?|json|html|toml|md)$/.test(p)) {
      const s = fs.readFileSync(p,"utf8");
      if (/\.\.\.(\s*[\n\r]|$)/g.test(s)) { cnt++; warn(`Ellipses mogelijk afgebroken: ${p}`); }
    }
  }
};
scan(process.cwd());
ok("Doctor klaar.");
