/**
 * Vult de stylist-cache (outfit_sets) vooraf, per profiel, met `claude -p` op
 * het Claude Code-abonnement (taak 6b, amendement 27 september 2026 bij spec
 * 5.2.1 van docs/superpowers/specs/2026-09-14-keten-herbouw-design.md). Er
 * komt geen edge function die per bezoeker de Anthropic API aanroept: dit
 * script componeert vooraf, en het leespad (RPC `keten_outfit_set`) is pure
 * SQL met een levensduur en een voorraadcontrole.
 *
 * Zelfde vorm als scripts/keten/tag-products.ts (taak 5, plan 2): een CLI met
 * een --ja-poort, een droge run die niets aanroept, en kostenrapportage per
 * `claude -p`-aanroep uit `total_cost_usd`.
 *
 * Per profiel:
 * 1. profileHash berekenen (src/keten/profileHash.ts, de enige plek waar de
 *    sleutel wordt samengesteld) en `keten_outfit_set` aanroepen. Een verse
 *    rij: overslaan en melden (hervatbaar, geen dubbele kosten).
 * 2. Kandidaten ophalen met `get_kandidaten`, met het budgetbereik van de
 *    PRIJSBAND uit de sleutel (BAND_BEREIK hieronder), niet het ruwe budget
 *    van het profiel: de weggeschreven set wordt gedeeld door iedereen in die
 *    band (spec 5.2.1 amendement, punt 3).
 * 2b. FIXRONDE 1 (coordinator, 27 sept 2026): vóór er ook maar een `claude -p`
 *    aanroep gebeurt, toetst `toetsKandidatenpool` (valideer-set.ts) of de
 *    kandidatenpool wiskundig genoeg heeft voor zes outfits zonder een dubbel
 *    product. Dat kostte de echte run van dezelfde datum een aanroep die op
 *    voorhand al kansloos was op een andere band (male/100tot200: 2
 *    footwear-kandidaten); deze toets maakt zo'n aanroep overbodig. Faalt de
 *    toets: profiel overslaan, reden loggen, geen aanroep.
 * 3. Prompts bouwen met stylist-prompt.ts (taak 5) en `claude -p` aanroepen,
 *    in de vorm van tagCli.ts (regel 578-586: execFile met een
 *    argumentenarray, geen shell; regel 631-651: stdin expliciet gesloten,
 *    anders wacht de CLI drie seconden en faalt hij).
 * 4. Antwoord parsen, door valideerOutfits (taak 4) en daarna door
 *    valideerSet (deze taak, regels die over de hele set gaan) halen. Faalt
 *    een van beide: een herkansing met de fouten in de prompt
 *    (bouwGebruikersPrompt heeft daar een parameter voor). Faalt het daarna
 *    nog: profiel overslaan, reden loggen, doorgaan met het volgende. Er
 *    wordt nooit een set weggeschreven die niet door beide validaties komt.
 *    FIXRONDE 1: is de enige overtreding dat een of meer product-ids in twee
 *    outfits voorkomen (valideerSet, regel 3), dan krijgt de herkansing
 *    NIET de volledige foutmelding (die noemt outfit-indices, zinloos voor
 *    een verse, geheugenloze `claude -p`-sessie die zijn vorige antwoord niet
 *    terugziet) maar alleen de betrokken product-ids met de instructie ze
 *    niet te hergebruiken (`vindDubbeleProductIds`). Aanleiding: de echte run
 *    van 27 september gaf bij de volledige foutmelding als herkansingsfout
 *    zes outfits met lege items-arrays terug, een overduidelijk slechter
 *    antwoord dan de eerste poging.
 * 5. Wegschrijven met `keten_schrijf_outfit_set`, inclusief latency_ms en de
 *    tokens uit het CLI-antwoord (`usage.input_tokens`/`usage.output_tokens`),
 *    als die er zijn.
 *
 * `--json-schema` staat, net als in tagCli.ts, STANDAARD UIT: met het schema
 * deed een portie van de tagger 428s over vier beurten, zonder schema 84s
 * over een (tagCli.ts, regel 23-36). Dezelfde afweging geldt hier: het schema
 * (bouwToolSchema) is een expliciete vlag, geen standaard.
 *
 * Model: STYLIST_MODEL uit de omgeving, anders `claude-sonnet-5` (spec 5.4).
 * Geen CLI-vlag voor het model: de brief van deze taak vraagt uitdrukkelijk
 * een omgevingsvariabele.
 *
 * Gebruik:
 *   npm run keten:stylist-vul                                  droge run, de vijf standaardprofielen
 *   npm run keten:stylist-vul -- --ja --alleen "man klassiek"   echte run over een enkel profiel
 *   npm run keten:stylist-vul -- --ja                           echte run over alle profielen (kost per cache-miss, zie hieronder)
 *   npm run keten:stylist-vul -- --profielen pad/naar/profielen.json --ja
 *
 * Omgeving: SUPABASE_URL (of VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY.
 * Nooit in de repo, nooit gelogd.
 *
 * Standaardprofielen: de vier persona's uit KETEN_PERSONAS
 * (src/keten/personas.ts) plus een vijfde met een halve, onzekere assen-set
 * (drie assen onbekend, de rest met lage zekerheid), zoals keuze 3 bovenaan
 * docs/superpowers/plans/2026-09-14-plan-3-stylist.md beschrijft voor het
 * (nog te bouwen) persona-harnas van taak 8. De hele gebucketde ruimte
 * (gender x gelegenheidscombinatie x prijsband x assencombinatie) wordt
 * bewust NIET geënumereerd: hoe echte bezoekers aan hun assen komen ligt pas
 * in plan 4 vast (pair_sets, keuze-afleiding), dus elke enumeratie nu gokt op
 * een verdeling die nog niet bestaat.
 */
import { readFileSync } from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { heeftVlag, leesVlag } from "./args";
import { leesEnv } from "./env";
import { bouwClaudeArgs, parseJsonUitCliTekst, voerClaudeCliUit, type ClaudeCliResultaat } from "./tagCli";
import { KETEN_PERSONAS, type KetenPersona } from "../../src/keten/personas";
import { prijsbandVanMidden, profileHash } from "../../src/keten/profileHash";
import { outfitKey } from "../../src/services/ratings/outfitRatings";
import {
  bouwGebruikersPrompt,
  bouwSysteemPrompt,
  bouwToolSchema,
  STYLIST_VERSION,
} from "../../supabase/functions/_shared/stylist-prompt.ts";
import { valideerOutfits } from "../../supabase/functions/_shared/valideer-outfits.ts";
import { toetsKandidatenpool, valideerSet, vindDubbeleProductIds } from "../../supabase/functions/_shared/valideer-set.ts";
import {
  legeAssen,
  type Assen,
  type Gelegenheid,
  type Geslacht,
  type Kandidaat,
  type StylistOutfit,
  type TasteProfileInput,
  type VerrijktItem,
  type VerrijkteOutfit,
} from "../../supabase/functions/_shared/keten-types.ts";

// ---------------------------------------------------------------------------
// Constanten
// ---------------------------------------------------------------------------

const STYLIST_MODEL_STANDAARD = "claude-sonnet-5";

/**
 * FIXRONDE 2 (coordinator, 27 sept 2026): stond op 120_000, en dat bleek te
 * krap. De eerste echte run (fixronde 1) deed 199.887 ms over twee
 * pogingen, circa honderd seconden per aanroep op een prompt van circa 4.500
 * tokens; 120s is daar maar twintig procent marge op, en de tweede echte run
 * viel er met beide pogingen net buiten (twee keer "time-out na 120s", geen
 * enkel antwoord). Dat is normale variatie op een meting rond de honderd
 * seconden, geen abonnementslimiet.
 *
 * De 120s zelf kwam oorspronkelijk van het wachttijd-budget bovenaan
 * plan-3-stylist.md (45s per aanroep), en dat budget is geschreven voor de
 * edge function met een browserbezoeker die op zijn resultaten wacht. Dit
 * script draait offline: er wacht niemand, dus het kan zich een veel ruimere
 * grens permitteren dan een bezoeker. Nu op 300_000 (5 minuten): ruim drie
 * keer de gemeten honderd seconden, met marge voor verdere variatie zonder
 * bij elke iets langzamere aanroep het budget te forceren.
 */
const AANROEP_TIMEOUT_MS = 300_000;

/** Zelfde default als get_kandidaten (spec 5.3) en de kostenraming (72 = 12 x 6 categorieen). */
const KANDIDATEN_PER_CATEGORIE = 12;

// TERUGDRAAI (deze taak, echte run 27 sept 2026): plan-3-stylist.md's
// kostentabel (circa 0,025 dollar per aanroep, 0,05 in het slechtste geval
// met een herkansing) is berekend voor de OORSPRONKELIJKE edge function, die
// de Anthropic Messages API rechtstreeks zou aanroepen (kale input/output-
// tokenprijs, geen sessie-overhead). Dat klopt niet meer sinds het amendement
// van 27 september: dit script draait `claude -p` op het Claude Code-
// abonnement, en dat blijkt in de praktijk een veel groter, vast overhead per
// aanroep te dragen (vermoedelijk de eigen systeemprompt en projectcontext
// van Claude Code zelf, inclusief het CLAUDE.md van deze repo, als
// cache_creation_input_tokens; ter vergelijking: een los `claude -p` testje
// met de tekst "Zeg alleen het woord: test" kostte al $0,3487 op 55.778
// cache_creation_input_tokens). Gemeten op de echte run van deze taak
// (profiel "vrouw minimalistisch", twee pogingen: een eerste met een enkele
// content-fout en een herkansing die corrupte lege outfits teruggaf): samen
// $1,2612. Dat is 15 tot 25 keer de kostentabel-schatting. De onderstaande
// twee constanten zijn daarom bijgesteld naar deze meting in plaats van de
// oude schatting, met een expliciete kanttekening: n=1, geen kalibratie over
// meerdere profielen of pogingen heen (zie taak-6b-report.md voor de volledige
// meting en het advies om dit met een paar extra losse pogingen te bevestigen
// voordat alle vijf standaardprofielen in een keer gevuld worden).
const GESCHATTE_KOSTEN_PER_AANROEP_USD = 0.63;
const GESCHATTE_KOSTEN_MET_HERKANSING_USD = 1.27;

/**
 * Budgetbereik per prijsband voor de get_kandidaten-aanroep (spec 5.2.1
 * amendement, punt 3: de sleutel bevat de band, dus de kandidatenlijst moet
 * het hele segment dekken, niet het smallere budget van een individueel
 * profiel). Overgenomen van BAND_GRENZEN in
 * docs/superpowers/plans/2026-09-14-plan-4-onboarding.md (regel 957-962; die
 * plan is nog niet gebouwd, maar de grenzen liggen daar al vast), zodat dit
 * vulscript en de toekomstige onboarding-stap niet uit elkaar lopen.
 */
const BAND_BEREIK: Record<string, { min: number; max: number }> = {
  tot50: { min: 0, max: 50 },
  "50tot100": { min: 50, max: 100 },
  "100tot200": { min: 100, max: 200 },
  boven200: { min: 200, max: 2000 },
};

// ---------------------------------------------------------------------------
// Standaardprofielen
// ---------------------------------------------------------------------------

/**
 * Vaste assen per stijlvoorkeur, alleen voor dit vulscript. De echte
 * keuze-afleiding (pair_sets) komt in plan 4; tot dan dragen de vier
 * KETEN_PERSONAS hun axes direct (keuze 3, plan-3-stylist.md). Waarden uit de
 * echte taggerwoordenlijst (scripts/keten/tagging.ts: SILHOUETTES,
 * COLOR_TEMPS, LIGHTNESS, PATTERNS, SHOE_TYPES) zodat get_kandidaten er ook
 * daadwerkelijk op kan scoren. Met de hand gekozen, geen meting: vandaar hier
 * expliciet genoemd in plaats van stilzwijgend aangenomen.
 */
const STYLE_ASSEN: Record<string, Partial<Assen>> = {
  classic: {
    formality: { value: 4, confidence: 0.8 },
    silhouette: { value: "regular", confidence: 0.8 },
    color_temp: { value: "koel", confidence: 0.6 },
    lightness: { value: "donker", confidence: 0.6 },
    pattern: { value: "effen", confidence: 0.8 },
    shoe_type: { value: "net", confidence: 0.8 },
  },
  minimalist: {
    formality: { value: 3, confidence: 0.7 },
    silhouette: { value: "slim", confidence: 0.7 },
    color_temp: { value: "neutraal", confidence: 0.7 },
    lightness: { value: "medium", confidence: 0.6 },
    pattern: { value: "effen", confidence: 0.9 },
    shoe_type: { value: "net", confidence: 0.6 },
  },
  streetwear: {
    formality: { value: 2, confidence: 0.8 },
    silhouette: { value: "oversized", confidence: 0.8 },
    color_temp: { value: "koel", confidence: 0.5 },
    lightness: { value: "donker", confidence: 0.5 },
    pattern: { value: "statement", confidence: 0.7 },
    shoe_type: { value: "sneaker", confidence: 0.9 },
  },
  romantic: {
    formality: { value: 3, confidence: 0.6 },
    silhouette: { value: "relaxed", confidence: 0.6 },
    color_temp: { value: "warm", confidence: 0.7 },
    lightness: { value: "licht", confidence: 0.6 },
    pattern: { value: "subtiel", confidence: 0.6 },
    shoe_type: { value: "sandaal", confidence: 0.6 },
  },
};

function slug(naam: string): string {
  return naam
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function profielVanPersona(persona: KetenPersona): TasteProfileInput {
  const stijl = persona.stylePreferences[0];
  const assenVoorStijl = STYLE_ASSEN[stijl];
  if (!assenVoorStijl) {
    throw new Error(`Geen vaste assen gedefinieerd voor stijl "${stijl}" (persona "${persona.naam}").`);
  }
  return {
    user_id: null,
    session_id: `stylist-vulcache-${slug(persona.naam)}`,
    gender: persona.gender,
    occasions: persona.occasions as Gelegenheid[],
    budget_min: persona.budget_min,
    budget_max: persona.budget_max,
    nogo_product_ids: [],
    choices: [],
    axes: { ...legeAssen(), ...assenVoorStijl },
    liked_product_ids: [],
    disliked_product_ids: [],
  };
}

/**
 * Vijfde profiel (keuze 3, plan-3-stylist.md): dezelfde gender, gelegenheden
 * en budget als "vrouw minimalistisch", maar met een halve, onzekere
 * assen-set: formality, silhouette en shoe_type onbekend (value null,
 * confidence 0), color_temp, lightness en pattern met een lage zekerheid
 * (0.25, onder de 0.5-knip uit spec 5.2 die "onzeker" markeert). Dit
 * simuleert een bezoeker die het dit-of-dat-traject halverwege afbreekt en
 * bewijst dat de stylist ook met dunne invoer zes geldige outfits aflevert.
 */
function onzekerProfiel(basisPersona: KetenPersona): TasteProfileInput {
  const volledig = profielVanPersona(basisPersona);
  return {
    ...volledig,
    session_id: `stylist-vulcache-${slug(basisPersona.naam)}-halve-set`,
    axes: {
      formality: { value: null, confidence: 0 },
      silhouette: { value: null, confidence: 0 },
      shoe_type: { value: null, confidence: 0 },
      color_temp: { value: volledig.axes.color_temp.value, confidence: 0.25 },
      lightness: { value: volledig.axes.lightness.value, confidence: 0.25 },
      pattern: { value: volledig.axes.pattern.value, confidence: 0.25 },
    },
  };
}

interface NaamProfiel {
  naam: string;
  profiel: TasteProfileInput;
}

function standaardProfielen(): NaamProfiel[] {
  const vast = KETEN_PERSONAS.map((p) => ({ naam: p.naam, profiel: profielVanPersona(p) }));
  const minimalistisch = KETEN_PERSONAS.find((p) => p.naam === "vrouw minimalistisch");
  if (!minimalistisch) {
    throw new Error('KETEN_PERSONAS mist "vrouw minimalistisch", nodig voor het vijfde (halve-set) profiel.');
  }
  const vijfde: NaamProfiel = {
    naam: "vrouw minimalistisch (halve set)",
    profiel: onzekerProfiel(minimalistisch),
  };
  return [...vast, vijfde];
}

// ---------------------------------------------------------------------------
// --profielen <pad>: eigen profielen uit een JSON-bestand
// ---------------------------------------------------------------------------

interface ProfielSpec {
  naam: string;
  gender: Geslacht;
  occasions: Gelegenheid[];
  budget_min: number;
  budget_max: number;
  axes?: Partial<Assen>;
  liked_product_ids?: string[];
  disliked_product_ids?: string[];
  nogo_product_ids?: string[];
}

function naarProfielSpec(x: unknown, index: number): ProfielSpec {
  if (typeof x !== "object" || x === null) {
    throw new Error(`--profielen: item ${index} is geen object.`);
  }
  const o = x as Record<string, unknown>;
  if (typeof o.naam !== "string" || o.naam.trim() === "") {
    throw new Error(`--profielen: item ${index} mist een niet-lege "naam".`);
  }
  if (o.gender !== "male" && o.gender !== "female" && o.gender !== "unisex") {
    throw new Error(`--profielen: item ${index} ("${o.naam}") heeft een ongeldige gender: ${String(o.gender)}.`);
  }
  if (!Array.isArray(o.occasions) || o.occasions.length === 0 || !o.occasions.every((g) => typeof g === "string")) {
    throw new Error(`--profielen: item ${index} ("${o.naam}") heeft geen geldige, niet-lege occasions-lijst.`);
  }
  if (typeof o.budget_min !== "number" || typeof o.budget_max !== "number" || o.budget_min > o.budget_max) {
    throw new Error(`--profielen: item ${index} ("${o.naam}") heeft een ongeldig budget_min/budget_max.`);
  }
  return {
    naam: o.naam,
    gender: o.gender as Geslacht,
    occasions: o.occasions as Gelegenheid[],
    budget_min: o.budget_min,
    budget_max: o.budget_max,
    axes: (o.axes as Partial<Assen> | undefined) ?? undefined,
    liked_product_ids: Array.isArray(o.liked_product_ids) ? (o.liked_product_ids as string[]) : [],
    disliked_product_ids: Array.isArray(o.disliked_product_ids) ? (o.disliked_product_ids as string[]) : [],
    nogo_product_ids: Array.isArray(o.nogo_product_ids) ? (o.nogo_product_ids as string[]) : [],
  };
}

function leesProfielenBestand(pad: string): NaamProfiel[] {
  const ruw: unknown = JSON.parse(readFileSync(pad, "utf8"));
  if (!Array.isArray(ruw) || ruw.length === 0) {
    throw new Error(`--profielen ${pad}: verwacht een niet-lege JSON-array.`);
  }
  return ruw.map((item, i) => {
    const spec = naarProfielSpec(item, i);
    const profiel: TasteProfileInput = {
      user_id: null,
      session_id: `stylist-vulcache-${slug(spec.naam)}`,
      gender: spec.gender,
      occasions: spec.occasions,
      budget_min: spec.budget_min,
      budget_max: spec.budget_max,
      nogo_product_ids: spec.nogo_product_ids ?? [],
      choices: [],
      axes: { ...legeAssen(), ...spec.axes },
      liked_product_ids: spec.liked_product_ids ?? [],
      disliked_product_ids: spec.disliked_product_ids ?? [],
    };
    return { naam: spec.naam, profiel };
  });
}

// ---------------------------------------------------------------------------
// Prompt voor de CLI: bouwSysteemPrompt() hergebruikt, "tool" vervangen
// ---------------------------------------------------------------------------

/**
 * bouwSysteemPrompt() (stylist-prompt.ts, taak 5) eindigt met "Antwoord
 * uitsluitend via de tool lever_outfits": geschreven voor de Anthropic
 * Messages API met een tools-parameter (het oorspronkelijke ontwerp van
 * compose-outfits, spec 5.4, inmiddels vervangen door dit script).
 * `claude -p` kent geen tools-parameter en draait hier met
 * `--allowed-tools ""` (alle tools uit), dus die laatste instructie heeft
 * hier geen betekenis. Dezelfde aanpassing als tagCli.ts's
 * bouwSysteemPromptCli() voor de tagger: de bestaande systeemprompt
 * ONGEWIJZIGD hergebruiken (niet herschrijven) en er een CLI-specifieke
 * instructie achteraan zetten die "via de tool" vervangt door een
 * kale-JSON-instructie. bouwToolSchema() blijft bruikbaar, maar als het
 * `--json-schema`-argument, niet als een tool-definitie.
 */
function bouwSysteemPromptVoorCli(): string {
  return [
    bouwSysteemPrompt(),
    "",
    'Je hebt hier geen tool. Geef in plaats daarvan uitsluitend een kaal JSON-object terug met exact de vorm ' +
      '{ "outfits": [...] }, zoals hierboven bij lever_outfits beschreven. Geen andere tekst, geen markdown-codeblok.',
  ].join("\n");
}

/**
 * Haalt de outfits-array uit een CLI-antwoord. Met --json-schema staat de
 * uitvoer in structured_output (net als verwerkCliUitvoer in tagCli.ts voor
 * de tagger doet); zonder het schema (het standaardpad) zit ze als vrije
 * tekst in `result` en gaat parseJsonUitCliTekst (tagCli.ts, hergebruikt, niet
 * opnieuw geschreven) er robuust doorheen: codeblokken, tekst voor of na het
 * blok, geen hekjes.
 */
function haalOutfitsUitAntwoord(respons: ClaudeCliResultaat): unknown[] | null {
  const structured = (respons as Record<string, unknown>).structured_output;
  if (structured && typeof structured === "object" && Array.isArray((structured as Record<string, unknown>).outfits)) {
    return (structured as Record<string, unknown>).outfits as unknown[];
  }
  const tekst = typeof respons.result === "string" ? respons.result : "";
  const parsed = parseJsonUitCliTekst(tekst);
  if (parsed && typeof parsed === "object" && Array.isArray((parsed as Record<string, unknown>).outfits)) {
    return (parsed as Record<string, unknown>).outfits as unknown[];
  }
  return null;
}

/** usage.input_tokens/output_tokens staan niet in ClaudeCliResultaat (dat kent alleen wat de tagger nodig had). */
function haalTokens(respons: ClaudeCliResultaat): { input: number | null; output: number | null } {
  const usage = (respons as Record<string, unknown>).usage;
  if (!usage || typeof usage !== "object") return { input: null, output: null };
  const u = usage as Record<string, unknown>;
  return {
    input: typeof u.input_tokens === "number" ? u.input_tokens : null,
    output: typeof u.output_tokens === "number" ? u.output_tokens : null,
  };
}

// ---------------------------------------------------------------------------
// Verrijken (spec 5.5: outfits jsonb is het schema uit 5.4, verrijkt met productdata)
// ---------------------------------------------------------------------------

async function verrijkOutfits(outfits: StylistOutfit[], kandidaten: Kandidaat[]): Promise<VerrijkteOutfit[]> {
  const perId = new Map(kandidaten.map((k) => [k.product_id, k]));
  const resultaten: VerrijkteOutfit[] = [];
  for (const outfit of outfits) {
    const items: VerrijktItem[] = outfit.items.map((item) => {
      const k = perId.get(item.product_id);
      if (!k) {
        // Kan niet gebeuren: valideerOutfits verwerpt elke outfit met een
        // onbekend product_id voordat deze functie ze ziet. Een harde fout
        // hier betekent dat die aanname niet meer klopt.
        throw new Error(`verrijkOutfits: onbekend product_id ${item.product_id}, had al verworpen moeten zijn.`);
      }
      return { product_id: item.product_id, role: item.role, product: k.product, attrs: k.attrs };
    });
    const key = await outfitKey(items.map((i) => i.product_id));
    resultaten.push({ outfit_key: key, title: outfit.title, occasion: outfit.occasion, items, reason: outfit.reason });
  }
  return resultaten;
}

// ---------------------------------------------------------------------------
// Per profiel
// ---------------------------------------------------------------------------

interface ProfielUitkomst {
  naam: string;
  status: "hit" | "geschreven" | "overgeslagen";
  reden?: string;
  duurMs: number;
  aantalGeldig: number;
  kostenUsd: number;
  hash: string;
}

async function verwerkProfiel(
  supabase: SupabaseClient,
  model: string,
  metJsonSchema: boolean,
  naam: string,
  profiel: TasteProfileInput,
  signal: AbortSignal
): Promise<ProfielUitkomst> {
  const start = Date.now();
  const hash = await profileHash(profiel);

  const { data: bestaand, error: leesFout } = await supabase.rpc("keten_outfit_set", {
    p_profile_hash: hash,
    p_stylist_version: STYLIST_VERSION,
  });
  if (leesFout) throw new Error(`keten_outfit_set faalde voor "${naam}": ${leesFout.message}`);
  if (Array.isArray(bestaand) && bestaand.length > 0) {
    const rij = bestaand[0] as { created_at?: string; outfits?: unknown };
    const aantal = Array.isArray(rij.outfits) ? rij.outfits.length : 0;
    console.log(
      `  ${naam}: al gevuld (profile_hash ${hash.slice(0, 12)}..., aangemaakt ${rij.created_at ?? "onbekend"}, ${aantal} outfits). Geen aanroep.`
    );
    return { naam, status: "hit", duurMs: Date.now() - start, aantalGeldig: aantal, kostenUsd: 0, hash };
  }

  const band = prijsbandVanMidden(profiel.budget_min, profiel.budget_max);
  const bereik = BAND_BEREIK[band];
  if (!bereik) throw new Error(`Onbekende prijsband "${band}" voor profiel "${naam}".`);

  const { data: kandidatenRaw, error: kandFout } = await supabase.rpc("get_kandidaten", {
    p_gender: profiel.gender,
    p_occasions: profiel.occasions,
    p_budget_min: bereik.min,
    p_budget_max: bereik.max,
    p_axes: profiel.axes,
    p_liked_ids: profiel.liked_product_ids,
    p_disliked_ids: profiel.disliked_product_ids,
    p_per_category: KANDIDATEN_PER_CATEGORIE,
  });
  if (kandFout) throw new Error(`get_kandidaten faalde voor "${naam}": ${kandFout.message}`);
  const kandidaten = (kandidatenRaw ?? []) as Kandidaat[];
  if (kandidaten.length === 0) {
    console.log(`  ${naam}: overgeslagen, geen kandidaten voor gender=${profiel.gender}, band=${band}.`);
    return {
      naam,
      status: "overgeslagen",
      reden: "geen kandidaten",
      duurMs: Date.now() - start,
      aantalGeldig: 0,
      kostenUsd: 0,
      hash,
    };
  }
  console.log(`  ${naam}: ${kandidaten.length} kandidaten (band ${band}, ${bereik.min}-${bereik.max} euro).`);

  // FIXRONDE 1 (coordinator, 27 sept 2026, eis 1): deterministisch en gratis,
  // dus altijd vóór de eerste claude -p aanroep. Zonder deze toets betaalde de
  // echte run van dezelfde datum voor een compositie die op de "man
  // klassiek"-band (male/100tot200, destijds 2 footwear-kandidaten) wiskundig
  // nooit door valideerSet-regel 3 had kunnen komen.
  const poolToets = toetsKandidatenpool(kandidaten);
  if (!poolToets.voldoende) {
    console.log(`  ${naam}: overgeslagen vóór enige aanroep, kandidatenpool onvoldoende: ${poolToets.reden}`);
    return {
      naam,
      status: "overgeslagen",
      reden: poolToets.reden,
      duurMs: Date.now() - start,
      aantalGeldig: 0,
      kostenUsd: 0,
      hash,
    };
  }

  let vorigeFouten: string[] = [];
  let laatsteRedenen: string[] = [];
  let geldigeOutfits: StylistOutfit[] = [];
  let succesRespons: ClaudeCliResultaat | null = null;
  let kostenUsd = 0;
  let pogingen = 0;

  for (let poging = 1; poging <= 2; poging++) {
    pogingen = poging;
    const opdracht = bouwGebruikersPrompt(profiel, kandidaten, vorigeFouten);
    const args = bouwClaudeArgs({
      model,
      systeemPrompt: bouwSysteemPromptVoorCli(),
      opdracht,
      jsonSchema: metJsonSchema ? bouwToolSchema(profiel.occasions) : undefined,
    });

    console.log(`  ${naam}: poging ${poging}, claude -p aanroepen...`);
    const respons = await voerClaudeCliUit(args, AANROEP_TIMEOUT_MS, signal);
    if (typeof respons.total_cost_usd === "number") kostenUsd += respons.total_cost_usd;
    // FIXRONDE 1 (deze taak, echte run 27 sept 2026): de kosten van deze ene
    // aanroep horen bij ELKE uitkomst zichtbaar te zijn, niet alleen bij
    // succes. Zonder dit gaf een mislukte poging alleen de foutmelding terug
    // en verdween het bedrag stilzwijgend in de lopende som: bij de eerste
    // echte run (twee pogingen, samen $1,2612, ver boven de kostentabel-
    // schatting van plan-3-stylist.md) was daardoor niet te zien welke van de
    // twee pogingen het duurste deel voor zijn rekening nam.
    const kostenLabel = `$${(respons.total_cost_usd ?? 0).toFixed(4)}, ${respons.duration_ms ?? "?"}ms`;

    if (respons.is_error) {
      laatsteRedenen = [`claude -p gaf een fout: ${String(respons.result ?? "onbekend").slice(0, 300)}`];
      vorigeFouten = laatsteRedenen;
      console.log(`    mislukt (${kostenLabel}): ${laatsteRedenen[0]}`);
      continue;
    }

    const ruweOutfits = haalOutfitsUitAntwoord(respons);
    if (ruweOutfits === null) {
      laatsteRedenen = ['kon geen geldig JSON-object met "outfits" uit het antwoord halen'];
      vorigeFouten = laatsteRedenen;
      console.log(`    mislukt (${kostenLabel}): ${laatsteRedenen[0]}`);
      continue;
    }

    const { geldig, fouten } = valideerOutfits(ruweOutfits, kandidaten, profiel);
    const setResultaat = valideerSet(geldig, profiel);
    const alleFouten = [...fouten.map((f) => `outfit ${f.index}: ${f.reden}`), ...setResultaat.fouten];

    if (alleFouten.length === 0) {
      geldigeOutfits = geldig;
      succesRespons = respons;
      console.log(`    geslaagd (${kostenLabel}): ${geldig.length} geldige outfits.`);
      break;
    }

    // FIXRONDE 1 (coordinator, 27 sept 2026, eis 2): de volledige
    // valideerSet-foutmelding voor regel 3 noemt outfit-indices ("outfit 2
    // en outfit 4"). Die zijn zinloos voor de herkansing: elke claude -p
    // aanroep is een verse, geheugenloze sessie die zijn eigen vorige
    // antwoord niet terugziet, dus "outfit 2" verwijst nergens naar. Gemeten
    // op de echte run van dezelfde datum: die volledige melding als enige
    // herkansingsfout meegeven leverde een duidelijk SLECHTER antwoord op
    // (zes outfits met lege items-arrays) dan de eerste poging. In plaats
    // daarvan: de dubbele product-ids apart benoemen met een korte,
    // concrete instructie ze niet te hergebruiken, en de rest van de
    // foutmeldingen (andere regels, wel met zinvolle inhoud voor een verse
    // poging) ongemoeid laten.
    const dubbeleIds = vindDubbeleProductIds(geldig);
    const overigeFouten = alleFouten.filter((f) => !f.includes("komt twee keer voor in de set"));
    const herkansingsFouten = [
      ...overigeFouten,
      ...dubbeleIds.map(
        (id) =>
          `product-id ${id} mag maar in een outfit van de set voorkomen; vervang het in de andere outfit(s) door een ander kandidaat-product uit dezelfde categorie`
      ),
    ];

    // laatsteRedenen (het rapport aan het eind) blijft de volledige,
    // gedetailleerde lijst tonen; alleen vorigeFouten (wat de VOLGENDE
    // claude -p aanroep te zien krijgt) gebruikt de kortere, gerichte versie.
    laatsteRedenen = alleFouten;
    vorigeFouten = herkansingsFouten;
    console.log(
      `    ${alleFouten.length} fout(en) (${kostenLabel}): ${alleFouten.slice(0, 5).join(" | ")}${alleFouten.length > 5 ? " | ..." : ""}`
    );
  }

  if (geldigeOutfits.length === 0 || !succesRespons) {
    console.log(`  ${naam}: overgeslagen na ${pogingen} poging(en). Laatste fouten: ${laatsteRedenen.join("; ")}`);
    return {
      naam,
      status: "overgeslagen",
      reden: laatsteRedenen.join("; "),
      duurMs: Date.now() - start,
      aantalGeldig: 0,
      kostenUsd,
      hash,
    };
  }

  const verrijkt = await verrijkOutfits(geldigeOutfits, kandidaten);
  const tokens = haalTokens(succesRespons);
  const latencyMs = typeof succesRespons.duration_ms === "number" ? succesRespons.duration_ms : Date.now() - start;

  const { error: schrijfFout } = await supabase.rpc("keten_schrijf_outfit_set", {
    p_profile_hash: hash,
    p_stylist_version: STYLIST_VERSION,
    p_outfits: verrijkt,
    p_model: model,
    p_latency_ms: latencyMs,
    p_input_tokens: tokens.input,
    p_output_tokens: tokens.output,
  });
  if (schrijfFout) throw new Error(`keten_schrijf_outfit_set faalde voor "${naam}": ${schrijfFout.message}`);

  console.log(
    `  ${naam}: geschreven (profile_hash ${hash.slice(0, 12)}..., ${verrijkt.length} outfits, latency ${latencyMs}ms, ` +
      `tokens in=${tokens.input ?? "?"} out=${tokens.output ?? "?"}).`
  );

  return {
    naam,
    status: "geschreven",
    duurMs: Date.now() - start,
    aantalGeldig: verrijkt.length,
    kostenUsd,
    hash,
  };
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const ja = heeftVlag(argv, "ja");
  const metJsonSchema = heeftVlag(argv, "json-schema");
  const profielenPad = leesVlag(argv, "profielen");
  const alleen = leesVlag(argv, "alleen");
  const model = process.env.STYLIST_MODEL || STYLIST_MODEL_STANDAARD;

  let profielen = profielenPad ? leesProfielenBestand(profielenPad) : standaardProfielen();
  if (alleen !== undefined) {
    if (alleen === "") {
      console.error("--alleen verwacht een profielnaam.");
      process.exit(1);
    }
    const gefilterd = profielen.filter((p) => p.naam === alleen);
    if (gefilterd.length === 0) {
      console.error(`Geen profiel met naam "${alleen}" gevonden. Beschikbaar: ${profielen.map((p) => p.naam).join(", ")}.`);
      process.exit(1);
    }
    profielen = gefilterd;
  }

  console.log(
    `Stylist-vulscript (${STYLIST_VERSION}), ${profielen.length} profiel(en): ${profielen.map((p) => p.naam).join(", ")}.`
  );
  console.log(
    `Model: ${model}${metJsonSchema ? " (--json-schema aan: trager, duurder, 100% opbrengst per beurt)" : " (zonder --json-schema, standaard sinds de terugdraai in tagCli.ts)"}.`
  );

  if (!ja) {
    // Droge run: bewust GEEN database-aanroep en GEEN claude -p aanroep,
    // ook niet voor de cache-check. profileHash is een lokale berekening
    // (WebCrypto, geen netwerk), dus deze tak raakt supabase.rpc nooit en is
    // dus aantoonbaar aanroepvrij door de code te lezen, niet alleen door de
    // uitvoer te geloven.
    console.log("Droge run: geen enkele aanroep (geen database, geen claude -p). Voeg --ja toe om echt te draaien.\n");
    for (const { naam, profiel } of profielen) {
      const hash = await profileHash(profiel);
      const band = prijsbandVanMidden(profiel.budget_min, profiel.budget_max);
      console.log(
        `- ${naam}: gender=${profiel.gender}, occasions=${profiel.occasions.join(",")}, band=${band}, profile_hash ${hash.slice(0, 12)}.... ` +
          `Zou bij een cache-miss een claude -p aanroep doen (geschat ~$${GESCHATTE_KOSTEN_PER_AANROEP_USD.toFixed(2)} per poging, ` +
          `tot ~$${GESCHATTE_KOSTEN_MET_HERKANSING_USD.toFixed(2)} met een herkansing; gemeten op de echte run van taak 6b, ` +
          "n=1, niet de kostentabel van plan-3-stylist.md, zie taak-6b-report.md)."
      );
    }
    const totMax = profielen.length * GESCHATTE_KOSTEN_MET_HERKANSING_USD;
    console.log(
      `\nGeschat maximum voor deze ronde als elk profiel een cache-miss met herkansing is: ~$${totMax.toFixed(2)} ` +
        "(gebaseerd op een enkele meting, niet gekalibreerd over meerdere profielen; kan afwijken)."
    );
    return;
  }

  const env = leesEnv(undefined, { anthropic: false });
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  // Ctrl-C moet ook een lopende claude -p aanroep meenemen, anders draait die
  // als wees door en verbruikt hij stilletjes abonnementsgebruik voor niets
  // (zelfde risico en fix als tag-products.ts, taak 5 van plan 2).
  const afbrekenController = new AbortController();
  process.on("SIGINT", () => {
    console.error("\nOnderbroken (Ctrl-C). Een lopende claude -p aanroep wordt afgebroken.");
    afbrekenController.abort();
    process.exit(130);
  });

  const uitkomsten: ProfielUitkomst[] = [];
  for (const { naam, profiel } of profielen) {
    console.log(`\n=== ${naam} ===`);
    const uitkomst = await verwerkProfiel(supabase, model, metJsonSchema, naam, profiel, afbrekenController.signal);
    uitkomsten.push(uitkomst);
  }

  console.log("\n=== Totaal ===");
  for (const u of uitkomsten) {
    console.log(
      `- ${u.naam}: ${u.status}${u.reden ? ` (${u.reden})` : ""}, ${u.duurMs}ms, ${u.aantalGeldig} geldige outfits, $${u.kostenUsd.toFixed(4)} dollar-equivalent`
    );
  }
  const hits = uitkomsten.filter((u) => u.status === "hit").length;
  const geschreven = uitkomsten.filter((u) => u.status === "geschreven").length;
  const overgeslagen = uitkomsten.filter((u) => u.status === "overgeslagen").length;
  const totaalKosten = uitkomsten.reduce((s, u) => s + u.kostenUsd, 0);
  const totaalDuurMs = uitkomsten.reduce((s, u) => s + u.duurMs, 0);
  // FIXRONDE 1 (coordinator, 27 sept 2026): total_cost_usd is wat dezelfde
  // tokens via de betaalde API zouden kosten, geen bedrag dat van de
  // rekening gaat. Op het abonnement verbruikt een aanroep sessiecapaciteit,
  // geen geld; vandaar "dollar-equivalent", niet "kosten" of "uitgave".
  console.log(
    `${uitkomsten.length} profiel(en): ${hits} hit, ${geschreven} geschreven, ${overgeslagen} overgeslagen. ` +
      `Totale doorlooptijd ${totaalDuurMs}ms, totaal $${totaalKosten.toFixed(4)} dollar-equivalent aan sessiecapaciteit ` +
      "(abonnement, geen factuur, geen echte uitgave)."
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
