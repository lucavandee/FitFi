/**
 * Persona-harnas (spec 5.7), versie plan 1: get_kandidaten -> runEngineV2.
 *
 * Draait vier vaste persona's tegen de live database en faalt (exit 1) als:
 *  - een persona minder dan zes outfits krijgt, of een outfit niet compleet is
 *    (top + bottom + footwear, of dress + footwear);
 *  - een item buiten het budget van de persona valt;
 *  - een item een gender heeft dat niet bij de persona past (unisex mag altijd);
 *  - een outfit een gelegenheid heeft die de persona niet heeft opgevraagd;
 *  - bij gelegenheid work een outfit footwear met sandaal/slipper in de naam
 *    of een accessory met "swim"/"zwem" in de naam bevat (tot shoe_type er is);
 *  - twee outfits dezelfde itemset hebben;
 *  - twee runs achter elkaar verschillende outfits geven voor hetzelfde profiel;
 *  - de client-classifier het oneens is met product_attributes (stopregel 2).
 *
 * Gebruik:
 *   npm run keten:personas
 * VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY komen uit de shell of uit .env.
 * Waarden worden nooit gelogd. De uitvoer gaat ook naar
 * ~/claude-artifacts/fitfi-keten/persona-run-<datum>.txt voor de poort van Luc.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { runEngineV2 } from "../../src/engine/v2";
import type { Outfit, Product } from "../../src/engine/types";
import { KETEN_PERSONAS, type KetenPersona } from "../../src/keten/personas";
import { seedFromAnswers } from "../../src/services/outfits/answersSeed";
import {
  bereidKandidatenVoor,
  naarKandidatenParams,
  telCategorieAfwijkingen,
  type KandidaatRij,
} from "../../src/services/outfits/kandidaten";

function leesDotEnv(): Record<string, string> {
  const pad = new URL("../../.env", import.meta.url).pathname;
  if (!existsSync(pad)) return {};
  const uit: Record<string, string> = {};
  for (const regel of readFileSync(pad, "utf8").split("\n")) {
    const m = regel.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m) uit[m[1]] = m[2];
  }
  return uit;
}

const dotenv = leesDotEnv();
const url = process.env.VITE_SUPABASE_URL ?? dotenv.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY ?? dotenv.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    "Geen Supabase-credentials gevonden. Zet VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in je omgeving of in .env."
  );
  process.exit(1);
}

interface Persona {
  naam: string;
  answers: Record<string, any>;
}

// Fit is geen onderdeel van de canonieke persona-data (die is voor alle
// afnemers hetzelfde); alleen dit harnas heeft "fit" nodig voor runEngineV2,
// dus die vertaling staat hier, niet in src/keten/personas.ts.
const FIT_PER_STYLE: Record<string, string> = {
  classic: "regular",
  minimalist: "regular",
  streetwear: "relaxed",
  romantic: "regular",
};

function persoonaAnswers(p: KetenPersona): Record<string, any> {
  return {
    gender: p.gender,
    stylePreferences: p.stylePreferences,
    occasions: p.occasions,
    budget: { min: p.budget_min, max: p.budget_max },
    fit: FIT_PER_STYLE[p.stylePreferences[0]] ?? "regular",
  };
}

const PERSONAS: Persona[] = KETEN_PERSONAS.map((p) => ({ naam: p.naam, answers: persoonaAnswers(p) }));

const AANTAL_OUTFITS = 6;
const SANDAAL_RE = /\b(sandaal|sandalen|sandal|sandals|slipper|slippers|teenslipper|flip-?flops?)\b/i;
// Fixronde 1 (reviewer): de catalogus is Engelstalig. "zwem" alleen kwam
// gemeten 0 keer voor; "swim" (Swimsuit/Swimwear/Swim Top/SWIM als
// merklabel) kwam 1.630 keer voor, waarvan 1.596 als accessory, waaronder de
// 27 La Martina-badkleding-items uit de nulmeting van 14 september. Zonder
// "swim" kon deze controle dus nooit afgaan. "zwem" blijft erin voor een
// eventuele Nederlandstalige feed later.
const ZWEM_RE = /\b(zwem\w*|swim\w*)\b/i;

const CATEGORIE_ALIAS: Record<string, string> = {
  top: "top", tops: "top", shirt: "top", shirts: "top",
  bottom: "bottom", bottoms: "bottom", pants: "bottom", trousers: "bottom",
  footwear: "footwear", shoe: "footwear", shoes: "footwear",
  outerwear: "outerwear", jacket: "outerwear", coat: "outerwear",
  accessory: "accessory", accessories: "accessory", bag: "accessory",
  dress: "dress", dresses: "dress", skirt: "dress",
  jumpsuit: "jumpsuit",
};

const regels: string[] = [];
function log(regel: string): void {
  console.log(regel);
  regels.push(regel);
}

function categorieVan(p: Product): string {
  const raw = String(p.category ?? "").toLowerCase().trim();
  return CATEGORIE_ALIAS[raw] ?? raw;
}

function itemset(outfit: Outfit): string {
  return outfit.products.map((p) => String(p.id)).sort().join(",");
}

function isCompleet(outfit: Outfit): boolean {
  const cats = new Set(outfit.products.map(categorieVan));
  const metSchoen = cats.has("footwear");
  return metSchoen && ((cats.has("top") && cats.has("bottom")) || cats.has("dress") || cats.has("jumpsuit"));
}

/**
 * Fixronde 1 (reviewer): geen controle toetste of de producten in een
 * outfit bij het gender van de persona horen. Een regressie in naarGender()
 * of in het p_gender-filter van get_kandidaten (die unisex bewust als "geen
 * filter" behandelt) zou herenkleding bij een damespersona door de poort
 * laten glippen zonder dat er iets rood wordt. Unisex product mag altijd;
 * een leeg of onbekend gender-veld wordt niet als fout gerekend (dat is een
 * datakwaliteitsprobleem van product_attributes, geen kwestie van deze poort).
 */
function genderPast(productGender: unknown, personaGender: "male" | "female"): boolean {
  const g = String(productGender ?? "").toLowerCase().trim();
  if (!g || g === "unisex") return true;
  return g === personaGender;
}

/**
 * Fixronde 1 (reviewer): geen controle toetste of outfit.occasion voorkomt
 * in de gelegenheden die de persona zelf heeft opgevraagd. Dat is op
 * zichzelf een gat, en het maakt de sandaalcontrole broos: die kijkt naar
 * outfit.occasion === "work"; een werkoutfit die per ongeluk als "casual"
 * gelabeld wordt, laat de sandaalcontrole voor die outfit stilzwijgend
 * overslaan.
 */
function gelegenheidGevraagd(outfit: Outfit, persona: Persona): boolean {
  const gevraagd: string[] = Array.isArray(persona.answers.occasions) ? persona.answers.occasions : [];
  return gevraagd.map((g) => String(g).toLowerCase()).includes(String(outfit.occasion ?? "").toLowerCase());
}

const client = createClient(url, key);

async function haalKandidaten(answers: Record<string, any>): Promise<{ rijen: KandidaatRij[]; pool: Product[] }> {
  const params = naarKandidatenParams(answers);
  const { data, error } = await client.rpc("get_kandidaten", params);
  if (error) throw new Error(`get_kandidaten faalde: ${error.message}`);
  const rijen = (data ?? []) as KandidaatRij[];
  return { rijen, pool: bereidKandidatenVoor(rijen) };
}

function bouwOutfits(answers: Record<string, any>, pool: Product[]): Outfit[] {
  return runEngineV2(answers, pool, { count: AANTAL_OUTFITS, seed: seedFromAnswers(answers) }).outfits;
}

function controleer(persona: Persona, outfits: Outfit[], tweedeRun: Outfit[], afwijkingen: number): string[] {
  const fouten: string[] = [];
  const budget = naarKandidatenParams(persona.answers);

  if (afwijkingen > 0) {
    fouten.push(`${afwijkingen} kandidaten waar de client-classifier een andere categorie geeft dan product_attributes (draai npm run keten:classificeer opnieuw)`);
  }

  if (outfits.length < AANTAL_OUTFITS) {
    fouten.push(`minder dan ${AANTAL_OUTFITS} outfits: ${outfits.length}`);
  }

  const personaGender: "male" | "female" = persona.answers.gender;

  outfits.forEach((outfit, i) => {
    const label = `outfit ${i + 1} (${outfit.title})`;
    if (!isCompleet(outfit)) {
      fouten.push(`${label} is niet compleet: ${outfit.products.map(categorieVan).join(", ")}`);
    }
    if (!gelegenheidGevraagd(outfit, persona)) {
      fouten.push(`${label}: gelegenheid "${outfit.occasion}" is niet gevraagd (persona vroeg ${JSON.stringify(persona.answers.occasions)})`);
    }
    for (const p of outfit.products) {
      const prijs = typeof p.price === "number" ? p.price : Number(p.price);
      if (!(prijs >= budget.p_budget_min && prijs <= budget.p_budget_max)) {
        fouten.push(`${label}: "${p.name}" kost ${prijs}, buiten ${budget.p_budget_min}-${budget.p_budget_max}`);
      }
      if (!genderPast(p.gender, personaGender)) {
        fouten.push(`${label}: "${p.name}" heeft gender "${p.gender}", persona is ${personaGender}`);
      }
      const isWerk = String(outfit.occasion ?? "").toLowerCase() === "work";
      if (isWerk && categorieVan(p) === "footwear" && SANDAAL_RE.test(p.name ?? "")) {
        fouten.push(`${label}: sandaal/slipper bij werk: "${p.name}"`);
      }
      if (isWerk && categorieVan(p) === "accessory" && ZWEM_RE.test(p.name ?? "")) {
        fouten.push(`${label}: zwemaccessoire bij werk: "${p.name}"`);
      }
    }
  });

  const sets = outfits.map(itemset);
  sets.forEach((s, i) => {
    const eerder = sets.indexOf(s);
    if (eerder !== i) fouten.push(`outfit ${i + 1} heeft dezelfde itemset als outfit ${eerder + 1}`);
  });

  const a = sets.join("|");
  const b = tweedeRun.map(itemset).join("|");
  if (a !== b) fouten.push("tweede run gaf andere outfits voor hetzelfde profiel");

  return fouten;
}

function printOutfits(outfits: Outfit[]): void {
  outfits.forEach((outfit, i) => {
    log(`  ${i + 1}. ${outfit.title} [${outfit.occasion}]`);
    for (const p of outfit.products) {
      const prijs = typeof p.price === "number" ? p.price.toFixed(2) : String(p.price);
      log(`       ${categorieVan(p).padEnd(9)} ${String(p.brand ?? "").padEnd(18)} ${String(p.name).slice(0, 60)}  EUR ${prijs}`);
    }
  });
}

function schrijfRapport(): string {
  const map = join(homedir(), "claude-artifacts", "fitfi-keten");
  mkdirSync(map, { recursive: true });
  const pad = join(map, `persona-run-${new Date().toISOString().slice(0, 10)}.txt`);
  writeFileSync(pad, regels.join("\n") + "\n", "utf8");
  return pad;
}

async function main(): Promise<void> {
  let totaalFouten = 0;
  log(`Persona-harnas plan 1, ${new Date().toISOString()}`);

  for (const persona of PERSONAS) {
    log(`\n=== ${persona.naam} ===`);
    const eerste = await haalKandidaten(persona.answers);
    const perCategorie = eerste.rijen.reduce<Record<string, number>>((acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + 1;
      return acc;
    }, {});
    const afwijkingen = telCategorieAfwijkingen(eerste.rijen, eerste.pool);
    log(`  kandidaten: ${eerste.rijen.length} rijen, ${eerste.pool.length} na veiligheidsnet, ${afwijkingen} categorie-afwijkingen ${JSON.stringify(perCategorie)}`);

    const outfits = bouwOutfits(persona.answers, eerste.pool);
    const tweede = await haalKandidaten(persona.answers);
    const tweedeRun = bouwOutfits(persona.answers, tweede.pool);

    printOutfits(outfits);

    const fouten = controleer(persona, outfits, tweedeRun, afwijkingen);
    if (fouten.length === 0) {
      log("  GROEN");
    } else {
      totaalFouten += fouten.length;
      log(`  ROOD (${fouten.length}):`);
      for (const f of fouten) log(`    - ${f}`);
    }
  }

  log(`\n${totaalFouten === 0 ? "Alle persona's groen." : `${totaalFouten} controle(s) rood.`}`);
  const pad = schrijfRapport();
  console.log(`Rapport: ${pad}`);
  process.exit(totaalFouten === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Harnas gestopt:", e instanceof Error ? e.message : e);
  process.exit(1);
});
