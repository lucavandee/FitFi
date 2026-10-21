/**
 * Laat de stijl-agent (src/keten/stijl/stijlAgent.ts) outfits keuren met
 * `claude -p` op het abonnement, en legt zijn oordeel naast het verwachte.
 *
 * Gebruik:
 *   npm run keten:stijl-keur                 droge run: aantallen, geen aanroep
 *   npm run keten:stijl-keur -- --ja         keuren (standaard de kalibratieset)
 *   npm run keten:stijl-keur -- --ja --set pad/naar/set.json --model sonnet --portie 9
 *
 * De set is een JSON-bestand met { outfits: [{ id, verwacht, profiel, stukken }] }.
 * verwacht is "goed", "fout" of null (alleen ter informatie).
 *
 * Wat telt (kalibratie):
 *  - Een outfit die fout had moeten zijn maar "goed" kreeg, is de dure fout: die
 *    wordt getoond. Dat aantal moet nul zijn.
 *  - Een outfit die goed had moeten zijn maar "twijfel" of "fout" kreeg, kost een
 *    plek. Dat mag af en toe; elk geval staat in het rapport met de reden.
 *
 * Elke `claude -p`-aanroep kost ongeveer een minuut opstarttijd, dus de outfits
 * gaan in porties. Het rapport komt in ~/claude-artifacts/fitfi-keten/.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  KEUR_VERSIE,
  bouwKeurOpdracht,
  bouwStijlAgentPrompt,
  leesKeurAntwoord,
  type KeurOordeel,
  type KeurOutfit,
} from "../../src/keten/stijl/stijlAgent";
import { heeftVlag, leesVlag } from "./args";
import { bouwClaudeArgs, voerClaudeCliUit } from "./tagCli";

interface SetOutfit extends KeurOutfit {
  verwacht: "goed" | "fout" | null;
  bron?: string;
}

const argv = process.argv.slice(2);
const SET = leesVlag(argv, "set") || "scripts/keten/stijl/kalibratie.json";
const MODEL = leesVlag(argv, "model") || process.env.STIJL_MODEL || "sonnet";
const PORTIE = Math.max(1, Number(leesVlag(argv, "portie") || 9));
const TIMEOUT_MS = 8 * 60 * 1000;

function porties<T>(xs: T[], n: number): T[][] {
  const uit: T[][] = [];
  for (let i = 0; i < xs.length; i += n) uit.push(xs.slice(i, i + n));
  return uit;
}

async function keurPortie(portie: SetOutfit[], systeem: string): Promise<{ oordelen: KeurOordeel[]; fout?: string; usd?: number }> {
  const args = bouwClaudeArgs({ model: MODEL, systeemPrompt: systeem, opdracht: bouwKeurOpdracht(portie) });
  const r = await voerClaudeCliUit(args, TIMEOUT_MS);
  if (r.is_error) return { oordelen: [], fout: String(r.result ?? r.subtype ?? "onbekend").slice(0, 300) };
  return { oordelen: leesKeurAntwoord(String(r.result ?? "")), usd: r.total_cost_usd };
}

function oordeelRegel(o: SetOutfit, k: KeurOordeel | undefined): string {
  if (!k) return `- ${o.id}: GEEN OORDEEL`;
  const verwacht = o.verwacht ? ` (verwacht ${o.verwacht})` : "";
  const redenen = k.redenen.length ? ` ${k.redenen.join(" ")}` : "";
  const beter = k.verbetering ? ` Beter: ${k.verbetering}` : "";
  return `- ${o.id}: **${k.oordeel}**${verwacht}. stijl ${k.stijl}, gelegenheid ${k.gelegenheid}, kleur ${k.kleur}, samenhang ${k.samenhang}.${redenen}${beter}`;
}

async function main(): Promise<void> {
  const set = JSON.parse(readFileSync(SET, "utf8")) as { versie?: string; outfits: SetOutfit[] };
  const outfits = set.outfits;
  const delen = porties(outfits, PORTIE);
  console.log(`${KEUR_VERSIE}, model ${MODEL}, set ${SET} (${set.versie ?? "zonder versie"})`);
  console.log(`${outfits.length} outfits in ${delen.length} porties van hooguit ${PORTIE}.`);
  if (!heeftVlag(argv, "ja")) {
    console.log("Droge run: geen aanroep. Voeg --ja toe om te keuren.");
    return;
  }

  const systeem = bouwStijlAgentPrompt();
  const perId = new Map<string, KeurOordeel>();
  const fouten: string[] = [];
  let usd = 0;
  for (const [i, portie] of delen.entries()) {
    const t0 = Date.now();
    const r = await keurPortie(portie, systeem);
    console.log(`  portie ${i + 1}/${delen.length}: ${r.oordelen.length} van ${portie.length} oordelen, ${Math.round((Date.now() - t0) / 1000)} s${r.fout ? `, fout: ${r.fout}` : ""}`);
    if (r.fout) fouten.push(`portie ${i + 1}: ${r.fout}`);
    usd += r.usd ?? 0;
    for (const k of r.oordelen) perId.set(k.id, k);
  }

  const metVerwachting = outfits.filter((o) => o.verwacht);
  const tellen = (f: (o: SetOutfit, k: KeurOordeel) => boolean) =>
    metVerwachting.filter((o) => perId.has(o.id) && f(o, perId.get(o.id)!));
  const dureFouten = tellen((o, k) => o.verwacht === "fout" && k.oordeel === "goed");
  const terechtFout = tellen((o, k) => o.verwacht === "fout" && k.oordeel !== "goed");
  const terechtGoed = tellen((o, k) => o.verwacht === "goed" && k.oordeel === "goed");
  const teStreng = tellen((o, k) => o.verwacht === "goed" && k.oordeel !== "goed");
  const zonder = metVerwachting.filter((o) => !perId.has(o.id));
  const aantalFout = metVerwachting.filter((o) => o.verwacht === "fout").length;
  const aantalGoed = metVerwachting.filter((o) => o.verwacht === "goed").length;

  const r: string[] = [];
  r.push(`# Kalibratie stijl-agent, ${new Date().toISOString().slice(0, 16).replace("T", " ")}`);
  r.push("");
  r.push(`${KEUR_VERSIE}, model ${MODEL}, set ${set.versie ?? SET}. Equivalent ${usd.toFixed(2)} dollar op het abonnement.`);
  r.push("");
  r.push(`- Fout herkend: ${terechtFout.length} van ${aantalFout}`);
  r.push(`- Goed herkend: ${terechtGoed.length} van ${aantalGoed}`);
  r.push(`- Ten onrechte goedgekeurd (wordt getoond): ${dureFouten.length}${dureFouten.length ? ": " + dureFouten.map((o) => o.id).join(", ") : ""}`);
  r.push(`- Te streng (goed, maar afgekeurd): ${teStreng.length}${teStreng.length ? ": " + teStreng.map((o) => o.id).join(", ") : ""}`);
  r.push(`- Geen oordeel: ${zonder.length}${zonder.length ? ": " + zonder.map((o) => o.id).join(", ") : ""}`);
  if (fouten.length) r.push(`- Fouten bij aanroepen: ${fouten.join("; ")}`);
  r.push("");
  r.push("## Alle oordelen");
  for (const o of outfits) r.push(oordeelRegel(o, perId.get(o.id)));

  const map = join(homedir(), "claude-artifacts", "fitfi-keten");
  mkdirSync(map, { recursive: true });
  const stempel = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  const pad = join(map, `stijl-kalibratie-${stempel}.md`);
  writeFileSync(pad, r.join("\n") + "\n", "utf8");
  writeFileSync(pad.replace(/\.md$/, ".json"), JSON.stringify({ versie: KEUR_VERSIE, model: MODEL, oordelen: Object.fromEntries(perId) }, null, 1));
  console.log("\n" + r.slice(0, 10).join("\n"));
  console.log(`\nRapport: ${pad}`);
  process.exit(dureFouten.length === 0 && zonder.length === 0 && fouten.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Gestopt:", e instanceof Error ? e.message : e);
  process.exit(1);
});
