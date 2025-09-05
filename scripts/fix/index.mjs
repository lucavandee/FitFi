/**
 * Fix runner - runs all available fixes in sequence.
 * 
 * Usage:
 *   node scripts/fix/index.mjs
 */
import { execSync } from "node:child_process";

const fixes = [
  "scripts/fix/ensure-clsx.mjs",
  "scripts/fix/package-json-dedupe.mjs",
];

console.log("🔧 Running FitFi fixes...\n");

for (const fix of fixes) {
  try {
    console.log(`Running: ${fix}`);
    execSync(`node ${fix}`, { stdio: "inherit" });
    console.log("");
  } catch (error) {
    console.error(`❌ Fix failed: ${fix}`);
    console.error(error.message);
    process.exit(1);
  }
}

console.log("✅ All fixes completed successfully!");