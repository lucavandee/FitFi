#!/usr/bin/env node
import fs from "node:fs";

const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.devDependencies ||= {};
pkg.scripts ||= {};

// 1) Verwijder zware dev-tooling die Bolt niet nodig heeft
const HEAVY = /^(eslint|@eslint|prettier|husky|lint-?staged|cypress|storybook|jest|vitest|playwright|webpack|rollup|babel)/i;
for (const k of Object.keys(pkg.devDependencies)) {
  if (HEAVY.test(k)) delete pkg.devDependencies[k];
}

// 2) Zorg dat Vite + React plugin + TS beschikbaar blijven
pkg.devDependencies.vite ??= "^5.4.0";
pkg.devDependencies["@vitejs/plugin-react"] ??= "^4.3.0";
pkg.devDependencies.typescript ??= "^5.4.0";

// 3) Husky/prepare uit in Bolt
if (pkg.scripts.prepare) {
  pkg.scripts.prepare = "echo 'husky skipped in Bolt'";
}

// 4) Engines adviseren
pkg.engines ||= {};
pkg.engines.node = "20.x";

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log("✅ bolt-install: dev tooling getrimd, husky/prepare uitgeschakeld, engines=20.x");
