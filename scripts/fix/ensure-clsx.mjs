/**
 * Ensure "clsx" is installed (adds dependency if missing).
 * 
 * Usage:
 *   node scripts/fix/ensure-clsx.mjs
 */
import fs from "node:fs";
import { execSync } from "node:child_process";

const file = "package.json";
const raw = fs.readFileSync(file, "utf8");
const pkg = JSON.parse(raw);

const has = 
  (pkg.dependencies && pkg.dependencies.clsx) ||
  (pkg.devDependencies && pkg.devDependencies.clsx);

if (has) {
  console.log("✅ clsx aanwezig:", has);
  process.exit(0);
}

console.log("ℹ Installeer clsx@2 …");
execSync("npm i -E clsx@2", { stdio: "inherit" });
console.log("✅ clsx geïnstalleerd.");