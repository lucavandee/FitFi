/**
 * Persona-harnas op de stylist-route (spec 5.7, plan 3, taak 8).
 *
 * Draait voor vier vaste persona's (KETEN_PERSONAS, src/keten/personas.ts)
 * plus een vijfde profiel met een halve, onzekere assen-set de hele keten
 * tegen de LIVE database: profileHash, get_kandidaten, keten_outfit_set (de
 * cache die het vulscript vooraf vult), of het noodpad (engine v2). Daarna
 * de controles uit spec 5.7 (stylist-controles.ts) plus de cache-controle:
 * twee runs achter elkaar moeten dezelfde outfits geven.
 *
 * Herzien door het amendement van 27 september 2026 bij paragraaf 5.2.1 van
 * docs/superpowers/specs/2026-09-14-keten-herbouw-design.md (zie de brief
 * van deze taak, "Achterhaald 1" en "Achterhaald 2"):
 * - Er is geen edge function en geen API-aanroep per bezoeker meer.
 *   composeVoorProfiel (src/keten/composeClient.ts) geeft `bron: 'cache'`
 *   of `bron: 'v2-fallback'` terug, nooit `'stylist'`: het componeren
 *   gebeurt vooraf in scripts/keten/stylist-vul-cache.ts, met `claude -p` op
 *   het Claude Code-abonnement. Dit harnas roept zelf geen model aan.
 * - Er bestaat geen ANTHROPIC_API_KEY meer in dit pad, dus geen
 *   "ontbreekt"- of "401"-foutmelding: een noodpad hier komt uitsluitend
 *   van een cache-miss, een RPC-fout, of een gecachete set die na het
 *   niet-wil- en budgetfilter te weinig outfits overhoudt.
 * - KetenConfig (composeClient.ts) draagt sinds dat amendement alleen nog
 *   `{ supabase }`: geen functionsUrl en geen anonKey meer nodig, want er is
 *   geen fetch naar een edge function meer.
 *
 * De assen per stijlvoorkeur (STYLE_ASSEN, hieronder geimporteerd) komen uit
 * src/keten/personas.ts. Dit harnas modelleert bewust rijkere persona's dan
 * een bezoeker uit de quiz oplevert: zes assen, waar de quiz er vier geeft
 * (silhouette, pattern, color_temp, lightness). profileHash (src/keten/profileHash.ts)
 * hasht per as de naam en de waarde. Het vulscript bouwt zijn profielen sinds
 * 1 oktober 2026 via de quiz-vertaling (scripts/keten/stylist-profielen.ts),
 * dus onder een sleutel die een bezoeker kan raken; de zes-assen-profielen
 * van dit harnas staan onder een andere. Zolang het harnas zijn persona's zo
 * bouwt, geeft de cache-controle hieronder een cache-miss (bron v2-fallback,
 * ROOD), ook direct na een vulronde. Dat is een bekende uitkomst en geen
 * regressie: het harnas kan zijn profielen op die van het vulscript
 * afstemmen door ze uit standaardProfielen() (stylist-profielen.ts) te halen.
 *
 * Gebruik:
 *   npx vite-node --script scripts/keten/stylist-run.ts
 *   npx vite-node --script scripts/keten/stylist-run.ts --alleen "man klassiek"
 *   npx vite-node scripts/keten/persona-run.ts --keten=stylist
 *
 * Zorg (gemeten bij het bouwen van deze taak): `--script` is hier geen
 * smaak maar een vereiste. Zonder die vlag voegt vite-node het pad van dit
 * bestand NIET toe aan process.argv (geverifieerd: `npx vite-node
 * scripts/x.ts` geeft process.argv = [node, vite-node-bin], zonder
 * "scripts/x.ts"); de entry-check hieronder ("endsWith stylist-run.ts") zou
 * dan nooit slaan en dit bestand zou stil niets doen, geen foutmelding, geen
 * uitvoer. Met `--script` herstelt vite-node het normale node-gedrag
 * (process.argv[1] wordt het pad van dit bestand). De tweede regel hierboven
 * (via persona-run.ts) heeft dit niet nodig: persona-run.ts roept
 * runStylistKeten rechtstreeks aan als functie, niet via deze entry-check.
 *
 * Credentials: VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY uit de omgeving of
 * uit .env in de repo-root (zelfde bron als persona-run.ts, plan 1). Dit
 * harnas draait als anon, precies zoals een echte bezoeker: geen service
 * role hier. Waarden worden nooit gelogd.
 */
import { createClient } from "@supabase/supabase-js";
import { composeVoorProfiel, type ComposeResultaat, type KetenConfig } from "../../src/keten/composeClient";
import { KETEN_PERSONAS, STYLE_ASSEN, type KetenPersona } from "../../src/keten/personas";
import { legeAssen, type Gelegenheid, type TasteProfileInput } from "../../src/keten/types";
import { leesVlag } from "./args";
import { leesDotEnv } from "./env";
import { controleerOutfitSet, zelfdeOutfits } from "./stylist-controles";

export function scriptKetenConfig(): KetenConfig {
  const dotenv = leesDotEnv();
  const url = process.env.VITE_SUPABASE_URL ?? dotenv.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? dotenv.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Geen Supabase-credentials. Zet VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in je omgeving of in .env."
    );
  }
  return { supabase: createClient(url, anonKey, { auth: { persistSession: false } }) };
}

export interface Persona {
  naam: string;
  profiel: TasteProfileInput;
}

function persona(
  naam: string,
  profiel: Omit<TasteProfileInput, "user_id" | "session_id" | "nogo_product_ids" | "choices" | "liked_product_ids" | "disliked_product_ids">
): Persona {
  return {
    naam,
    profiel: {
      user_id: null,
      session_id: `persona-${naam.replace(/\s+/g, "-")}`,
      nogo_product_ids: [],
      choices: [],
      liked_product_ids: [],
      disliked_product_ids: [],
      ...profiel,
    },
  };
}

function personaVanKanoniek(p: KetenPersona): Persona {
  return persona(p.naam, {
    gender: p.gender,
    occasions: p.occasions as Gelegenheid[],
    budget_min: p.budget_min,
    budget_max: p.budget_max,
    axes: { ...legeAssen(), ...STYLE_ASSEN[p.stylePreferences[0]] },
  });
}

const MINIMALISTISCH = KETEN_PERSONAS.find((p) => p.naam === "vrouw minimalistisch");
if (!MINIMALISTISCH) {
  throw new Error('KETEN_PERSONAS mist "vrouw minimalistisch", nodig voor het vijfde (halve-set) profiel.');
}
const MINIMALIST_ASSEN = STYLE_ASSEN.minimalist;

/**
 * Vijfde profiel: geen spec-persona, bootst na wat een echte bezoeker na 6
 * tot 12 paren aflevert (plan 3, keuze 3): formality, silhouette en shoe_type
 * onbekend (value null, confidence 0); color_temp, lightness en pattern met
 * de waarden van de "minimalist"-stijl op een lage zekerheid, 0.25, onder de
 * 0.5-knip uit spec 5.2 die "onzeker" markeert. Het vulscript heeft sinds 1
 * oktober 2026 een andere "halve set" (onzekerProfiel() in
 * stylist-profielen.ts: een bezoeker die de printsvraag overslaat); deze
 * hier is een harnas-controle, geen cache-data, en leest zijn waarden af
 * van STYLE_ASSEN.minimalist hierboven, niet van een eigen overgetypte
 * kopie. Bewijst dat de stylist ook met dunne invoer zes geldige outfits
 * levert, of anders zichtbaar naar het noodpad valt.
 */
function halveSetProfiel(): Persona {
  return persona("vrouw minimalistisch halve set", {
    gender: MINIMALISTISCH!.gender,
    occasions: MINIMALISTISCH!.occasions as Gelegenheid[],
    budget_min: MINIMALISTISCH!.budget_min,
    budget_max: MINIMALISTISCH!.budget_max,
    axes: {
      formality: { value: null, confidence: 0 },
      silhouette: { value: null, confidence: 0 },
      shoe_type: { value: null, confidence: 0 },
      color_temp: { value: MINIMALIST_ASSEN.color_temp?.value ?? null, confidence: 0.25 },
      lightness: { value: MINIMALIST_ASSEN.lightness?.value ?? null, confidence: 0.25 },
      pattern: { value: MINIMALIST_ASSEN.pattern?.value ?? null, confidence: 0.25 },
    },
  });
}

/** De vier persona's uit spec 5.7 (canonieke data uit src/keten/personas.ts), plus het vijfde halve-set-profiel. */
export const PERSONAS: Persona[] = [...KETEN_PERSONAS.map(personaVanKanoniek), halveSetProfiel()];

function printResultaat(r: ComposeResultaat): void {
  console.log(
    `bron ${r.bron}` +
      (r.latency_ms !== null ? `, ${r.latency_ms} ms` : "") +
      (r.reden ? `, reden: ${r.reden}` : "") +
      `, ${r.kandidaten.length} kandidaten` +
      (r.weggevallenDoorNietWil > 0 ? `, ${r.weggevallenDoorNietWil} weggevallen door niet-wil-filter` : "") +
      (r.weggevallenDoorBudget > 0 ? `, ${r.weggevallenDoorBudget} weggevallen door budgetfilter` : "") +
      (r.herkanstKandidaten ? ", get_kandidaten herkanst" : "") +
      (r.herkanstCache ? ", keten_outfit_set herkanst" : "")
  );
  r.outfits.forEach((o, i) => {
    console.log(`  ${i + 1}. [${o.occasion}] ${o.title}`);
    for (const it of o.items) {
      console.log(`     - ${it.role.padEnd(9)} ${it.product.brand ?? ""} ${it.product.name} (${it.product.price} euro)`);
    }
    console.log(`     ${o.reason}`);
  });
}

export async function runStylistKeten(opties: { alleen?: string } = {}): Promise<boolean> {
  const cfg = scriptKetenConfig();
  let alleGroen = true;

  for (const p of PERSONAS) {
    if (opties.alleen && !p.naam.includes(opties.alleen)) continue;
    console.log(
      `\n=== ${p.naam} (${p.profiel.gender}, ${p.profiel.occasions.join("+")}, ${p.profiel.budget_min} tot ${p.profiel.budget_max}) ===`
    );

    let fouten: string[] = [];
    try {
      // Eigen kloktijd rond beide aanroepen (los van r.latency_ms, dat bij
      // bron 'cache' de opslagtijd van het VULSCRIPT is, niet de leestijd
      // van deze aanroep): nodig om "de tweede run is snel" aantoonbaar te
      // maken, niet alleen te beweren.
      const t0 = Date.now();
      const run1 = await composeVoorProfiel(cfg, p.profiel);
      const duurRun1 = Date.now() - t0;
      printResultaat(run1);
      console.log(`     (kloktijd run 1: ${duurRun1} ms)`);
      const t1 = Date.now();
      const run2 = await composeVoorProfiel(cfg, p.profiel);
      const duurRun2 = Date.now() - t1;
      console.log(`     (kloktijd run 2: ${duurRun2} ms, bron ${run2.bron})`);

      fouten = controleerOutfitSet(run1.outfits, { min: p.profiel.budget_min, max: p.profiel.budget_max });
      if (!zelfdeOutfits(run1.outfits, run2.outfits)) {
        fouten.push(`twee runs geven verschillende outfits (run 2 bron ${run2.bron})`);
      }
      // Bewust behouden (brief taak 8): een run via het noodpad is rood,
      // want deze poort bewaakt de stylist-route. Dat geldt ook als de
      // controles hierboven verder niets vinden: v2-fallback bewijst geen
      // stylist-cache-hit, en dat hoort zichtbaar te zijn, niet weggepoetst.
      if (run1.bron === "v2-fallback") {
        fouten.push(`noodpad gebruikt: ${run1.reden}`);
      }
    } catch (err) {
      fouten = [`keten brak: ${err instanceof Error ? err.message : String(err)}`];
    }

    if (fouten.length === 0) {
      console.log("GROEN");
    } else {
      alleGroen = false;
      console.log("ROOD");
      for (const f of fouten) console.log(`  - ${f}`);
    }
  }

  console.log(`\n${alleGroen ? "ALLE PERSONAS GROEN" : "ER ZIJN RODE PERSONAS"}`);
  return alleGroen;
}

// Direct gestart (niet via persona-run.ts)? Dan zelf draaien.
if (process.argv.some((a) => a.endsWith("stylist-run.ts"))) {
  const alleen = leesVlag(process.argv.slice(2), "alleen");
  runStylistKeten({ alleen }).then((groen) => process.exit(groen ? 0 : 1));
}
