/**
 * Laat de stijl-agent producten labelen (soort stuk, stijlen, spoor,
 * formaliteit, seizoen, gedateerd) met `claude -p`.
 *
 * Gebruik:
 *   npm run keten:stijl-label -- --in producten.json --uit labels.json                          droge run
 *   npm run keten:stijl-label -- --in producten.json --uit labels.json --via sleutel --ja       labelen
 *
 * --via is verplicht bij --ja: sleutel (de API-sleutel in ~/.config/fitfi) of
 * abonnement (Lucs Max). Zie docs/keten/vooraf-keuren-draaiboek.md.
 *
 * producten.json: [{ id, categorie, naam, geslacht? }]. labels.json krijgt
 * { versie, model, antwoordde, labels: { [id]: ProductLabel } }. Een bestaand
 * uitvoerbestand wordt aangevuld: wat al een label heeft, gaat niet opnieuw naar
 * de agent.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import {
  LABEL_VERSIE,
  bouwLabelOpdracht,
  bouwLabelPrompt,
  leesLabelAntwoord,
  type LabelProduct,
  type ProductLabel,
} from "../../src/keten/stijl/stijlAgent";
import { isLimiet } from "../../src/keten/stijl/stijlSets";
import { heeftVlag, leesVlag, onbekendeVlaggen } from "./args";
import { bouwKeurArgs, omgevingVoor, roepClaudeAan } from "./claudeStream";
import { leesSleutel } from "./sleutel";

const argv = process.argv.slice(2);
const ONBEKEND = onbekendeVlaggen(argv, ["in", "uit", "model", "effort", "via", "portie", "ja"]);
if (ONBEKEND.length > 0) {
  console.error(`Onbekende vlag: ${ONBEKEND.join(", ")}`);
  process.exit(1);
}
const IN = leesVlag(argv, "in");
const UIT = leesVlag(argv, "uit");
const MODEL = leesVlag(argv, "model") || process.env.STIJL_MODEL || "sonnet";
const EFFORT = leesVlag(argv, "effort") || null;
const VIA = leesVlag(argv, "via");
const PORTIE = Math.max(1, Number(leesVlag(argv, "portie") || 80));
const TIMEOUT_MS = 15 * 60 * 1000;

async function main(): Promise<void> {
  if (!IN || !UIT) {
    console.error("Gebruik: --in producten.json --uit labels.json [--via sleutel|abonnement --ja] [--portie 80] [--model sonnet]");
    process.exit(1);
  }
  const producten = JSON.parse(readFileSync(IN, "utf8")) as LabelProduct[];
  const bestaandBestand = existsSync(UIT) ? (JSON.parse(readFileSync(UIT, "utf8")) as { labels: Record<string, ProductLabel>; antwoordde?: string[] }) : null;
  const bestaand = bestaandBestand?.labels ?? {};
  const open = producten.filter((p) => !bestaand[p.id]);
  console.log(`${LABEL_VERSIE}, model ${MODEL}: ${producten.length} producten, ${open.length} nog zonder label, porties van ${PORTIE}.`);
  if (!heeftVlag(argv, "ja")) {
    console.log("Droge run: geen aanroep. Voeg --via sleutel of --via abonnement en --ja toe om te labelen.");
    return;
  }
  if (VIA !== "sleutel" && VIA !== "abonnement") throw new Error("Kies bewust hoe er betaald wordt: --via sleutel of --via abonnement");
  const env = omgevingVoor(VIA, VIA === "sleutel" ? leesSleutel() : null);
  const verwachteBron = VIA === "sleutel" ? "ANTHROPIC_API_KEY" : "none";

  const catVan = new Map(producten.map((p) => [p.id, p.categorie]));
  const labels: Record<string, ProductLabel> = { ...bestaand };
  const antwoordde = new Set(bestaandBestand?.antwoordde ?? []);
  const systeem = bouwLabelPrompt();
  let usd = 0;
  for (let i = 0; i < open.length; i += PORTIE) {
    const portie = open.slice(i, i + PORTIE);
    // Korte nummers in plaats van product-ID's: een UUID van 36 tekens neemt het
    // model niet foutloos over, en dan valt het label weg (21 okt 2026: twee
    // porties van 100 met 0 bruikbare labels).
    const kort = portie.map((p, j) => ({ ...p, id: `k${j}` }));
    const echtId = new Map(kort.map((p, j) => [p.id, portie[j].id]));
    const t0 = Date.now();
    // Dezelfde aanroep als het keuren, met de labelprompt als systeemprompt.
    const u = await roepClaudeAan(bouwKeurArgs({ model: MODEL, effort: EFFORT, systeem, opdracht: bouwLabelOpdracht(kort) }), { timeoutMs: TIMEOUT_MS, env });
    // Noodrem: Lucs jobs delen het abonnement (reference_claude_quotum_jobs).
    if (!u.ok && (u.afgewezen || isLimiet(u.tekst))) {
      console.error(`Gestopt op een limietmelding: ${u.tekst.slice(0, 200)}`);
      break;
    }
    const nieuw = (u.ok ? leesLabelAntwoord(u.tekst, (id) => catVan.get(echtId.get(id) ?? "")) : [])
      .filter((l) => echtId.has(l.id))
      .map((l) => ({ ...l, id: echtId.get(l.id)! }));
    for (const l of nieuw) labels[l.id] = l;
    if (u.model) antwoordde.add(u.model);
    usd += u.total_cost_usd ?? 0;
    console.log(
      `  ${Math.min(i + PORTIE, open.length)}/${open.length}: ${nieuw.length} van ${portie.length} gelabeld, ${Math.round((Date.now() - t0) / 1000)} s` +
        (u.ok ? "" : `, fout: ${u.tekst.slice(0, 200)}`)
    );
    // Na elke portie wegschrijven: een onderbreking kost dan hooguit een portie.
    writeFileSync(UIT, JSON.stringify({ versie: LABEL_VERSIE, model: MODEL, antwoordde: [...antwoordde], labels }, null, 1));
    if (u.apiKeySource && u.apiKeySource !== verwachteBron) {
      console.error(`Gestopt: claude betaalde via ${u.apiKeySource}, gekozen was ${VIA}.`);
      break;
    }
  }
  console.log(`Klaar: ${Object.keys(labels).length} labels in ${UIT}. ${usd.toFixed(2)} dollar, via ${VIA}.`);
}

main().catch((e) => {
  console.error("Gestopt:", e instanceof Error ? e.message : e);
  process.exit(1);
});
