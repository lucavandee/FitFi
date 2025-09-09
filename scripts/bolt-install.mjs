#!/usr/bin/env node
import fs from "node:fs";

const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.devDependencies ||= {};
pkg.scripts ||= {};

// 1) Zware dev-tooling eruit die Bolt niet nodig heeft
const HEAVY = /^(eslint|@eslint|prettier|husky|lint-?staged|cypress|storybook|jest|vitest|playwright|webpack|rollup|babel|ts-node|@types\/)/i;
for (const name of Object.keys(pkg.devDependencies)) {
  if (HEAVY.test(name)) delete pkg.devDependencies[name];
}

// 2) Zorg dat Vite + React plugin + TS blijven werken in Bolt
pkg.devDependencies.vite ??= "^5.4.0";
pkg.devDependencies["@vitejs/plugin-react"] ??= "^4.3.0";
pkg.devDependencies.typescript ??= "^5.4.0";
pkg.devDependencies.tailwindcss ??= "^3.4.0";
pkg.devDependencies.postcss ??= "^8.4.0";
pkg.devDependencies.autoprefixer ??= "^10.4.0";

// 3) Husky/prepare uit (voorkomt hook-fouten)
if (pkg.scripts.prepare) pkg.scripts.prepare = "echo 'husky skipped (Bolt)'";

// 4) Engines advies
pkg.engines ||= {}; pkg.engines.node = "20.x";

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log("✅ bolt-install: trimmed dev deps; husky off; engines=20.x");
