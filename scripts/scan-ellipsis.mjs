#!/usr/bin/env node
/**
 * Scan op letterlijke ellipses ("...") die duiden op afgeknotte/placeholder code.
 * Exit code 1 als er iets gevonden wordt.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");

const hits = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?|css|html|d\.ts)$/.test(name)) {
      const code = fs.readFileSync(p, "utf8");
      if (code.includes("...")) {
        const count = (code.match(/\.\.\./g) || []).length;
        hits.push({ file: p.replace(ROOT + path.sep, ""), count });
      }
    }
  }
}

if (!fs.existsSync(SRC)) {
  console.error("No src/ directory found.");
  process.exit(2);
}

walk(SRC);

if (hits.length) {
  console.error("⛔ Found literal ellipses in source files:");
  for (const h of hits.sort((a,b)=>b.count-a.count)) {
    console.error(`- ${h.file} — ${h.count}x`);
  }
  process.exit(1);
} else {
  console.log("✅ No literal ellipses found.");
}