#!/usr/bin/env node
import fs from "node:fs";

const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.devDependencies ||= {};
pkg.scripts ||= {};

// Buiten Bolt (lokaal, CI) laten we de volledige devDependencies staan,
// anders kan `tsc --noEmit` of `vitest` niet draaien op GitHub Actions.
const isBolt =
  process.env.BOLT === "1" ||
  process.env.STACKBLITZ === "1" ||
  process.env.BOLT_ENV === "1" ||
  (typeof process.env.npm_config_user_agent === "string" &&
    process.env.npm_config_user_agent.includes("bolt"));

// 1) Zware dev-tooling die Bolt niet nodig heeft, maar die we elders wél willen.
// Let op: @types/react en @types/react-dom NIET strippen — tsconfig.json verwijst er
// expliciet naar, en zonder die types faalt typecheck op elk JSX-bestand.
const HEAVY =
  /^(eslint|@eslint|prettier|husky|lint-?staged|cypress|storybook|jest|playwright|webpack|rollup|babel|ts-node)/i;
const TYPES_ALLOWLIST = new Set([
  "@types/react",
  "@types/react-dom",
  "@types/node",
]);

if (isBolt) {
  for (const name of Object.keys(pkg.devDependencies)) {
    if (TYPES_ALLOWLIST.has(name)) continue;
    if (HEAVY.test(name)) {
      delete pkg.devDependencies[name];
      continue;
    }
    // Overige @types/* strippen voor Bolt (niet nodig at runtime)
    if (/^@types\//.test(name)) {
      delete pkg.devDependencies[name];
      continue;
    }
    // Vitest strippen in Bolt — buiten Bolt houden we het voor CI
    if (/^vitest(\b|$)/.test(name) || /^@vitest\//.test(name)) {
      delete pkg.devDependencies[name];
    }
  }
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
pkg.engines ||= {};
pkg.engines.node = "20.x";

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log(
  isBolt
    ? "✅ bolt-install: trimmed dev deps for Bolt; husky off; engines=20.x"
    : "✅ bolt-install: non-Bolt env — devDeps preserved for CI; engines=20.x"
);
