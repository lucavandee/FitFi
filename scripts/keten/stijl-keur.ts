/**
 * Laat de stijl-agent (src/keten/stijl/stijlAgent.ts) outfits keuren met
 * `claude -p`, en legt zijn oordeel naast het verwachte.
 *
 * Gebruik:
 *   npm run keten:stijl-keur                                droge run: aantallen, geen aanroep
 *   npm run keten:stijl-keur -- --ja --via sleutel --model <id> --effort xhigh
 *   npm run keten:stijl-keur -- --ja --via abonnement --set pad/naar/set.json --portie 9
 *
 * --via is verplicht bij --ja: sleutel (de API-sleutel in ~/.config/fitfi) of
 * abonnement (Lucs Max). De aanroep is dezelfde als in de nacht van het vooraf
 * keuren (scripts/keten/claudeStream.ts), zodat de kalibratie meet wat de nacht
 * doet. Het rapport noemt het model dat echt antwoordde: zet dat id vast.
 *
 * De set is een JSON-bestand met { outfits: [{ id, verwacht, profiel, stukken }] }.
 * verwacht is "goed", "fout" of null (alleen ter informatie). Hangt een
 * verwachting af van iets wat de nacht niet stuurt (lichtheid, kleurtemperatuur,
 * spoor), dan staat dat in afhankelijk_van en telt ze niet mee.
 *
 * De agent ziet hetzelfde als in de nacht (src/keten/stijl/kalibratie.ts): de
 * hele set gehusseld met een vast zaad, per portie korte id's k1 tot k9, en een
 * profiel met alleen geslacht, stijl en gelegenheid. Tot 21 oktober 2026 gingen
 * de id's uit de set ("goed-4", "fout-4") letterlijk mee, in porties op volgorde.
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
import { kalibratiePorties, verwachtZoalsDeNacht, zoalsDeNacht } from "../../src/keten/stijl/kalibratie";
import { isLimiet, leesPortieAntwoord } from "../../src/keten/stijl/stijlSets";
import { heeftVlag, leesVlag, onbekendeVlaggen } from "./args";
import { bouwKeurArgs, omgevingVoor, roepClaudeAan } from "./claudeStream";
import { leesSleutel } from "./sleutel";

interface SetOutfit extends KeurOutfit {
  verwacht: "goed" | "fout" | null;
  afhankelijk_van?: string[];
  bron?: string;
}

/** Vast zaad voor het husselen, zodat twee kalibraties dezelfde porties krijgen. */
const ZAAD = 2026;

const argv = process.argv.slice(2);
const ONBEKEND = onbekendeVlaggen(argv, ["ja", "via", "model", "effort", "set", "portie"]);
if (ONBEKEND.length > 0) {
  console.error(`Onbekende vlag: ${ONBEKEND.join(", ")}`);
  process.exit(1);
}
const SET = leesVlag(argv, "set") || "scripts/keten/stijl/kalibratie.json";
const MODEL = leesVlag(argv, "model") || process.env.STIJL_MODEL || "sonnet";
const PORTIE = Math.max(1, Number(leesVlag(argv, "portie") || 9));
const EFFORT = leesVlag(argv, "effort") || null;
const VIA = leesVlag(argv, "via");
const TIMEOUT_MS = 8 * 60 * 1000;

interface PortieUitslag {
  oordelen: KeurOordeel[];
  fout?: string;
  limiet?: boolean;
  usd?: number;
  model: string | null;
  bron: string | null;
}

async function keurPortie(portie: Array<{ outfit: SetOutfit; kort: string }>, systeem: string, env: NodeJS.ProcessEnv): Promise<PortieUitslag> {
  const opdracht = bouwKeurOpdracht(portie.map((x) => zoalsDeNacht(x.outfit, x.kort)));
  const u = await roepClaudeAan(bouwKeurArgs({ model: MODEL, effort: EFFORT, systeem, opdracht }), { timeoutMs: TIMEOUT_MS, env });
  const meta = { model: u.model, bron: u.apiKeySource, usd: u.total_cost_usd ?? undefined };
  if (!u.ok) return { ...meta, oordelen: [], fout: u.tekst.slice(0, 300), limiet: u.afgewezen || isLimiet(u.tekst) };
  // Terug van k1..k9 naar de id's uit de set; alleen verstuurde id's, elk een keer.
  const echt = new Map(portie.map((x) => [x.kort, x.outfit.id]));
  const { perId } = leesPortieAntwoord(u.tekst, portie.map((x) => x.kort));
  return { ...meta, oordelen: [...perId.values()].map((k) => ({ ...k, id: echt.get(k.id)! })) };
}

function oordeelRegel(o: SetOutfit, k: KeurOordeel | undefined): string {
  if (!k) return `- ${o.id}: GEEN OORDEEL`;
  const v = verwachtZoalsDeNacht(o);
  const verwacht = v ? ` (verwacht ${v})` : o.verwacht ? ` (verwacht ${o.verwacht}, telt niet: hangt af van ${o.afhankelijk_van?.join(", ")})` : "";
  const redenen = k.redenen.length ? ` ${k.redenen.join(" ")}` : "";
  const beter = k.verbetering ? ` Beter: ${k.verbetering}` : "";
  return `- ${o.id}: **${k.oordeel}**${verwacht}. stijl ${k.stijl}, gelegenheid ${k.gelegenheid}, kleur ${k.kleur}, samenhang ${k.samenhang}.${redenen}${beter}`;
}

async function main(): Promise<void> {
  const set = JSON.parse(readFileSync(SET, "utf8")) as { versie?: string; outfits: SetOutfit[] };
  const outfits = set.outfits;
  const delen = kalibratiePorties(outfits, PORTIE, ZAAD);
  console.log(`${KEUR_VERSIE}, model ${MODEL}, denkniveau ${EFFORT ?? "standaard"}, set ${SET} (${set.versie ?? "zonder versie"})`);
  console.log(`${outfits.length} outfits in ${delen.length} porties van hooguit ${PORTIE}.`);
  if (!heeftVlag(argv, "ja")) {
    console.log("Droge run: geen aanroep. Voeg --ja en --via sleutel of --via abonnement toe om te keuren.");
    return;
  }
  if (VIA !== "sleutel" && VIA !== "abonnement") throw new Error("Kies bewust hoe er betaald wordt: --via sleutel of --via abonnement");
  const env = omgevingVoor(VIA, VIA === "sleutel" ? leesSleutel() : null);

  const systeem = bouwStijlAgentPrompt();
  const perId = new Map<string, KeurOordeel>();
  const fouten: string[] = [];
  const modellen = new Set<string>();
  const bronnen = new Set<string>();
  let usd = 0;
  for (const [i, portie] of delen.entries()) {
    const t0 = Date.now();
    const r = await keurPortie(portie, systeem, env);
    console.log(`  portie ${i + 1}/${delen.length}: ${r.oordelen.length} van ${portie.length} oordelen, ${Math.round((Date.now() - t0) / 1000)} s, model ${r.model ?? "?"}${r.fout ? `, fout: ${r.fout}` : ""}`);
    if (r.fout) fouten.push(`portie ${i + 1}: ${r.fout}`);
    if (r.model) modellen.add(r.model);
    if (r.bron) bronnen.add(r.bron);
    usd += r.usd ?? 0;
    for (const k of r.oordelen) perId.set(k.id, k);
    if (r.limiet) {
      console.error("Gestopt op een limietmelding.");
      break;
    }
  }

  const metVerwachting = outfits.filter((o) => verwachtZoalsDeNacht(o));
  const tellen = (f: (v: "goed" | "fout", k: KeurOordeel) => boolean) =>
    metVerwachting.filter((o) => perId.has(o.id) && f(verwachtZoalsDeNacht(o)!, perId.get(o.id)!));
  const dureFouten = tellen((v, k) => v === "fout" && k.oordeel === "goed");
  const terechtFout = tellen((v, k) => v === "fout" && k.oordeel !== "goed");
  const terechtGoed = tellen((v, k) => v === "goed" && k.oordeel === "goed");
  const teStreng = tellen((v, k) => v === "goed" && k.oordeel !== "goed");
  const zonder = metVerwachting.filter((o) => !perId.has(o.id));
  const aantalFout = metVerwachting.filter((o) => verwachtZoalsDeNacht(o) === "fout").length;
  const aantalGoed = metVerwachting.filter((o) => verwachtZoalsDeNacht(o) === "goed").length;

  const r: string[] = [];
  r.push(`# Kalibratie stijl-agent, ${new Date().toISOString().slice(0, 16).replace("T", " ")}`);
  r.push("");
  r.push(
    `${KEUR_VERSIE}, gevraagd model ${MODEL}, denkniveau ${EFFORT ?? "standaard"}, set ${set.versie ?? SET}. ` +
      `Antwoordde: ${[...modellen].join(", ") || "onbekend"}. Betaalroute ${VIA} (${[...bronnen].join(", ") || "onbekend"}). ${usd.toFixed(2)} dollar.`
  );
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
  writeFileSync(
    pad.replace(/\.md$/, ".json"),
    JSON.stringify({ versie: KEUR_VERSIE, model: MODEL, effort: EFFORT, antwoordde: [...modellen], via: VIA, oordelen: Object.fromEntries(perId) }, null, 1)
  );
  console.log("\n" + r.slice(0, 10).join("\n"));
  console.log(`\nRapport: ${pad}`);
  process.exit(dureFouten.length === 0 && zonder.length === 0 && fouten.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Gestopt:", e instanceof Error ? e.message : e);
  process.exit(1);
});
