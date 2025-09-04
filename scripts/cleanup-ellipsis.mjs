#!/usr/bin/env node
import fs from "fs";
import path from "path";

const exts = [".ts", ".tsx", ".js", ".jsx", ".css", ".html"];
const touched = [];
const skipped = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      walk(p);
    } else if (exts.some((e) => p.endsWith(e))) {
      const c = fs.readFileSync(p, "utf8");
      if (c.includes("...")) {
        // vervang ALLE letterlijke '...' door een neutrale opmerking
        const out = c.replace(/\.\.\./g, "/* placeholder removed */");
        fs.writeFileSync(p, out);
        touched.push(p);
      } else {
        skipped.push(p);
      }
    }
  }
}

if (!fs.existsSync("src")) {
  console.error("No src/ directory found.");
  process.exit(1);
}

walk("src");

console.log(`✔ cleanup-ellipsis: updated ${touched.length} file(s).`);
if (touched.length) {
  console.log("  modified:");
  for (const f of touched) console.log("  -", f);
}