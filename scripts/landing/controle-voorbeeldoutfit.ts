/**
 * Wekelijkse controle van de voorbeeldoutfit (plan "Onder de hero", 4.3; O9).
 * De regels staan in controleVoorbeeldoutfit.ts.
 *
 * Gebruik: npx vite-node scripts/landing/controle-voorbeeldoutfit.ts
 * Zonder src/content/voorbeeldoutfit.json is er niets te controleren (exit 0).
 * Faalt een stuk, dan exit 1; de wissel naar de reserve is een PR van een
 * regel (de reserve wordt hoofd).
 */
import { existsSync, readFileSync } from "node:fs";
import { controleer } from "./controleVoorbeeldoutfit";

async function main() {
  const pad = new URL("../../src/content/voorbeeldoutfit.json", import.meta.url);
  if (!existsSync(pad)) {
    console.log("Geen src/content/voorbeeldoutfit.json: niets te controleren.");
    return;
  }
  const data = JSON.parse(readFileSync(pad, "utf-8"));
  const regels = await controleer(data, fetch);
  for (const r of regels) console.log(`${r.uitslag.padEnd(8)} ${r.outfit.padEnd(7)} ${r.artikelnummer} ${r.wat}: ${r.reden}`);
  const kapot = regels.filter((r) => r.uitslag === "kapot");
  if (kapot.length) {
    console.error(`${kapot.length} controle(s) mislukt. Zet de reserve als hoofd, of kies een nieuwe outfit.`);
    process.exitCode = 1;
  }
}

main().catch((fout) => {
  console.error(fout);
  process.exitCode = 1;
});
