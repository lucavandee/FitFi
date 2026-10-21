/**
 * Laat de stijl-agent producten labelen (soort stuk, stijlen, spoor,
 * formaliteit) met `claude -p` op het abonnement.
 *
 * Gebruik:
 *   npm run keten:stijl-label -- --in producten.json --uit labels.json          droge run
 *   npm run keten:stijl-label -- --in producten.json --uit labels.json --ja     labelen
 *
 * producten.json: [{ id, categorie, naam, geslacht? }]. labels.json krijgt
 * { versie, model, labels: { [id]: ProductLabel } }. Een bestaand uitvoerbestand
 * wordt aangevuld: wat al een label heeft, gaat niet opnieuw naar de agent.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import {
  STIJL_AGENT_VERSIE,
  bouwLabelOpdracht,
  bouwLabelPrompt,
  leesLabelAntwoord,
  type LabelProduct,
  type ProductLabel,
} from "../../src/keten/stijl/stijlAgent";
import { heeftVlag, leesVlag } from "./args";
import { bouwClaudeArgs, voerClaudeCliUit } from "./tagCli";

const argv = process.argv.slice(2);
const IN = leesVlag(argv, "in");
const UIT = leesVlag(argv, "uit");
const MODEL = leesVlag(argv, "model") || process.env.STIJL_MODEL || "sonnet";
const PORTIE = Math.max(1, Number(leesVlag(argv, "portie") || 80));
const TIMEOUT_MS = 10 * 60 * 1000;

async function main(): Promise<void> {
  if (!IN || !UIT) {
    console.error("Gebruik: --in producten.json --uit labels.json [--ja] [--portie 80] [--model sonnet]");
    process.exit(1);
  }
  const producten = JSON.parse(readFileSync(IN, "utf8")) as LabelProduct[];
  const bestaand = existsSync(UIT)
    ? (JSON.parse(readFileSync(UIT, "utf8")) as { labels: Record<string, ProductLabel> }).labels
    : {};
  const open = producten.filter((p) => !bestaand[p.id]);
  console.log(`${STIJL_AGENT_VERSIE}, model ${MODEL}: ${producten.length} producten, ${open.length} nog zonder label, porties van ${PORTIE}.`);
  if (!heeftVlag(argv, "ja")) {
    console.log("Droge run: geen aanroep. Voeg --ja toe om te labelen.");
    return;
  }

  const catVan = new Map(producten.map((p) => [p.id, p.categorie]));
  const labels: Record<string, ProductLabel> = { ...bestaand };
  const systeem = bouwLabelPrompt();
  let usd = 0;
  for (let i = 0; i < open.length; i += PORTIE) {
    const portie = open.slice(i, i + PORTIE);
    const t0 = Date.now();
    const r = await voerClaudeCliUit(bouwClaudeArgs({ model: MODEL, systeemPrompt: systeem, opdracht: bouwLabelOpdracht(portie) }), TIMEOUT_MS);
    // Noodrem: de jobs van Luc delen dit abonnement (reference_claude_quotum_jobs).
    // Bij een limietmelding direct stoppen in plaats van door te gaan.
    if (r.is_error && /hit your limit|usage limit|rate limit|resets/i.test(String(r.result ?? ""))) {
      console.error(`Gestopt op een limietmelding: ${String(r.result).slice(0, 200)}`);
      break;
    }
    const nieuw = r.is_error ? [] : leesLabelAntwoord(String(r.result ?? ""), (id) => catVan.get(id));
    for (const l of nieuw) labels[l.id] = l;
    usd += r.total_cost_usd ?? 0;
    console.log(
      `  ${Math.min(i + PORTIE, open.length)}/${open.length}: ${nieuw.length} van ${portie.length} gelabeld, ${Math.round((Date.now() - t0) / 1000)} s` +
        (r.is_error ? `, fout: ${String(r.result ?? "").slice(0, 200)}` : "")
    );
    // Na elke portie wegschrijven: een onderbreking kost dan hooguit een portie.
    writeFileSync(UIT, JSON.stringify({ versie: STIJL_AGENT_VERSIE, model: MODEL, labels }, null, 1));
  }
  console.log(`Klaar: ${Object.keys(labels).length} labels in ${UIT}. Equivalent ${usd.toFixed(2)} dollar op het abonnement.`);
}

main().catch((e) => {
  console.error("Gestopt:", e instanceof Error ? e.message : e);
  process.exit(1);
});
