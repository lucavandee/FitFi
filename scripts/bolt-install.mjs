#!/usr/bin/env node
/*
 * Preinstall-hook voor Bolt: knipt zware dev-tooling uit package.json zodat de
 * import daar licht blijft.
 *
 * BELANGRIJK, toegevoegd 2026-08-07: dit script HERSCHRIJFT package.json op
 * schijf. Het draaide bij elke `npm install`, ook lokaal, en gooide dan
 * @types/react, @types/react-dom, vitest, eslint en prettier uit je bestand.
 * Wie daarna committe, verwijderde die pakketten uit de repo zonder het te
 * merken. Dat is op 2026-08-07 gebeurd (zie #73) en het kostte drie kapotte
 * productiebuilds voordat duidelijk was waar het vandaan kwam.
 *
 * Daarom draait het nu alleen nog wanneer BOLT_TRIM=1 is gezet. Bolt zelf kan
 * die variabele meegeven; zonder die variabele doet npm install wat je
 * verwacht. `.bolt/` is voor het laatst aangeraakt in maart 2026, dus in de
 * praktijk staat deze hook stil.
 *
 * Draai je hem toch, gebruik dan `npm install --ignore-scripts` als je alleen
 * de lockfile wilt bijwerken.
 */
import fs from "node:fs";

if (process.env.BOLT_TRIM !== "1") {
  console.log(
    "bolt-install: overgeslagen (zet BOLT_TRIM=1 om dev-deps te strippen)"
  );
  process.exit(0);
}

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
