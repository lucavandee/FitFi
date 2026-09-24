/**
 * Pure kern van het tag-script: schema, prompts, verzoeken, validatie, kosten
 * en resultaatverwerking. Geen netwerk, zodat alles hier testbaar is.
 * Het tagschema is spec 5.1 van docs/superpowers/specs/2026-09-14-keten-herbouw-design.md.
 */
import type Anthropic from "@anthropic-ai/sdk";

export const TAGGER_MODEL = process.env.TAGGER_MODEL ?? "claude-haiku-4-5-20251001";
export const TAGGER_VERSION = "haiku-4.5-v1";
export const TAGGER_VERSION_FOTO = "haiku-4.5-v1-foto";
export const CONFIDENCE_DREMPEL_FOTO = 0.6;
export const MAX_TOKENS = 600;

// Batchprijs: 50 procent van 1 dollar (input) en 5 dollar (output) per miljoen tokens.
export const BATCH_INPUT_USD_PER_MTOK = 0.5;
export const BATCH_OUTPUT_USD_PER_MTOK = 2.5;

export type Modus = "tekst" | "foto";

export const CATEGORIES = ["top", "bottom", "footwear", "outerwear", "dress", "accessory", "geen"] as const;
export const GENDERS = ["male", "female", "unisex"] as const;
export const OCCASIONS = ["work", "casual", "formal", "date", "travel", "sport", "party"] as const;
export const SILHOUETTES = ["slim", "regular", "relaxed", "oversized"] as const;
export const COLOR_TEMPS = ["warm", "koel", "neutraal"] as const;
export const LIGHTNESS = ["licht", "medium", "donker"] as const;
export const PATTERNS = ["effen", "subtiel", "statement"] as const;
export const SHOE_TYPES = ["sneaker", "net", "laars", "sandaal"] as const;
export const COLORS = [
  "zwart", "wit", "grijs", "navy", "beige", "camel", "bruin", "groen", "rood",
  "roze", "blauw", "geel", "paars", "oranje", "multicolor",
] as const;
export const MATERIALS = ["katoen", "wol", "denim", "linnen", "leer", "synthetisch", "zijde", "tricot", "onbekend"] as const;
export const SEASONS = ["lente", "zomer", "herfst", "winter"] as const;

export interface TagProduct {
  product_id: string;
  name: string;
  brand: string | null;
  description: string | null;
  price: number;
  retailer: string | null;
  raw_category: string | null;
  gender: string | null;
  image_url: string | null;
  confidence: number | null;
}

export interface TagUitvoer {
  is_fashion: boolean;
  // category komt van de tagger terug maar wordt door keten_schrijf_tags (taak 2)
  // nooit weggeschreven: category blijft van de classifier uit plan 1. De tagger
  // levert hem alleen zodat (a) shoe_type hieronder gevalideerd kan worden tegen
  // "hoort dit bij footwear", en (b) is_fashion verlaagd kan worden wanneer de
  // tagger de categorie niet kan plaatsen (category 'geen', zie valideerTags).
  category: (typeof CATEGORIES)[number];
  gender: (typeof GENDERS)[number];
  formality: 1 | 2 | 3 | 4 | 5;
  occasions: (typeof OCCASIONS)[number][];
  silhouette: (typeof SILHOUETTES)[number];
  color_temp: (typeof COLOR_TEMPS)[number];
  lightness: (typeof LIGHTNESS)[number];
  pattern: (typeof PATTERNS)[number];
  shoe_type: (typeof SHOE_TYPES)[number] | null;
  colors: (typeof COLORS)[number][];
  materials: (typeof MATERIALS)[number][];
  seasons: (typeof SEASONS)[number][];
  confidence: number;
}

export interface TagRij extends TagUitvoer {
  product_id: string;
  tagger_version: string;
}

// JSON Schema voor structured output. Numerieke grenzen (confidence 0..1)
// ondersteunt de API niet; die controleert valideerTags.
export const TAG_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "is_fashion", "category", "gender", "formality", "occasions", "silhouette",
    "color_temp", "lightness", "pattern", "shoe_type", "colors", "materials",
    "seasons", "confidence",
  ],
  properties: {
    is_fashion: { type: "boolean" },
    category: { type: "string", enum: [...CATEGORIES] },
    gender: { type: "string", enum: [...GENDERS] },
    formality: { type: "integer", enum: [1, 2, 3, 4, 5] },
    occasions: { type: "array", items: { type: "string", enum: [...OCCASIONS] } },
    silhouette: { type: "string", enum: [...SILHOUETTES] },
    color_temp: { type: "string", enum: [...COLOR_TEMPS] },
    lightness: { type: "string", enum: [...LIGHTNESS] },
    pattern: { type: "string", enum: [...PATTERNS] },
    shoe_type: { anyOf: [{ type: "string", enum: [...SHOE_TYPES] }, { type: "null" }] },
    colors: { type: "array", items: { type: "string", enum: [...COLORS] } },
    materials: { type: "array", items: { type: "string", enum: [...MATERIALS] } },
    seasons: { type: "array", items: { type: "string", enum: [...SEASONS] } },
    confidence: { type: "number" },
  },
} as const;

export function bouwSysteemPrompt(): string {
  return [
    "Je tagt kledingproducten van Nederlandse webwinkels voor een stijladvies-app.",
    "Je krijgt naam, merk, beschrijving, prijs, winkel en de ruwe categorie uit de feed, soms ook een foto.",
    "Geef uitsluitend het gevraagde JSON-object terug. Regels per veld:",
    "- is_fashion: false voor alles wat geen kleding, schoenen of kledingaccessoire voor volwassenen is (vazen, lampen, servies, fan-merchandise, kinderkleding, ondergoed, zwemkleding). Dan category 'geen'.",
    "- category: top (shirts, blouses, truien, hoodies), bottom (broeken, rokken, shorts), footwear, outerwear (jassen, blazers als buitenlaag), dress (jurken, jumpsuits), accessory (tassen, riemen, sjaals, sieraden, hoeden). Zwemkleding (badpakken, bikini's, zwembroeken) is geen accessory: die is is_fashion false met category 'geen'.",
    "- gender: male, female of unisex, op basis van de doelgroep van het product.",
    // FIXRONDE 5 (controller, 24 sept 2026): een echte ronde verloor bijna 90% van
    // zijn opbrengst doordat het model "smart casual" (de naam van formaliteits-
    // niveau 3, hieronder) terugleverde als WAARDE in occasions, waar het niet
    // toegestaan is. Diagnose op een bewaarde uitvoer van 83 objecten/18 afkeuringen:
    // occasions:"smart casual" 16 keer, materials:"elastaan" 2 keer, verder niets.
    // Twee losse, tegenover elkaar geplaatste blokken hieronder (in plaats van twee
    // losse bullets vlak achter elkaar zoals voorheen) zodat de scheiding niet meer
    // op een enkele regel drijft: formaliteit is een cijferschaal met namen, occasions
    // is een eigen vaste woordenlijst, en occasions herhaalt zijn eigen toegestane
    // waarden vlak bij het veld zelf plus een expliciete, negatieve zin over
    // "smart casual" (het model leest de prompt kennelijk associatief; herhalen vlak
    // bij het veld werkt beter dan een regel verderop).
    "- formality is een CIJFERSCHAAL van 1 tot 5, GEEN gelegenheid: 1 = sport of loungewear, 2 = casual, 3 = smart casual, 4 = net, 5 = formeel. Vul dit veld met uitsluitend het cijfer. Deze vijf namen (sport, casual, smart casual, net, formeel) beschrijven ALLEEN formality en mogen nooit in occasions terechtkomen.",
    "- occasions is een APARTE, vaste lijst met precies deze zeven Engelse woorden, niets anders: work, casual, formal, date, travel, sport, party. 'smart casual' staat hier NIET tussen: dat is uitsluitend de naam van formaliteitsniveau 3 hierboven, geen gelegenheid, gebruik die tekst dus nooit in occasions. Vul dit veld met een of meer van de zeven woorden hierboven (exact zo gespeld, in het Engels) die bij dit item passen. Minimaal een.",
    "- silhouette: slim, regular, relaxed of oversized; bij schoenen en accessoires regular.",
    "- color_temp: warm (beige, camel, bruin, rood, oranje, geel, olijf), koel (navy, blauw, grijs, zwart, wit, roze, paars) of neutraal (gemengd of onduidelijk).",
    "- lightness: licht, medium of donker, van de hoofdkleur.",
    "- pattern: effen, subtiel (fijne streep, ruit, structuur) of statement (print, logo, opvallend dessin).",
    "- shoe_type: alleen bij footwear: sneaker, net, laars of sandaal. Anders null.",
    "- colors: hoofdkleuren uit de vaste lijst, genormaliseerd naar het Nederlands; multicolor bij drie of meer gelijkwaardige kleuren.",
    "- materials: uit de vaste lijst; onbekend als de tekst niets zegt.",
    "- seasons: seizoenen waarin je dit draagt, uit lente, zomer, herfst, winter.",
    "- confidence: 0 tot 1, hoe zeker je bent van het geheel. Onder 0.6 als de tekst te weinig zegt over kleur, pasvorm of formaliteit.",
  ].join("\n");
}

export function bouwGebruikersTekst(p: TagProduct): string {
  return [
    `Naam: ${p.name}`,
    `Merk: ${p.brand ?? "onbekend"}`,
    `Winkel: ${p.retailer ?? "onbekend"}`,
    `Prijs: ${Number(p.price).toFixed(2)} EUR`,
    `Ruwe categorie uit de feed: ${p.raw_category ?? "onbekend"}`,
    `Geslacht volgens de feed: ${p.gender ?? "onbekend"}`,
    `Beschrijving: ${p.description?.trim() || "geen"}`,
  ].join("\n");
}

export function bouwVerzoek(
  p: TagProduct,
  modus: Modus
): { custom_id: string; params: Anthropic.MessageCreateParamsNonStreaming } {
  const tekst = bouwGebruikersTekst(p);
  const content: Anthropic.MessageCreateParamsNonStreaming["messages"][number]["content"] =
    modus === "foto" && p.image_url
      ? [
          { type: "image", source: { type: "url", url: p.image_url } },
          { type: "text", text: tekst },
        ]
      : tekst;

  return {
    custom_id: p.product_id,
    params: {
      model: TAGGER_MODEL,
      max_tokens: MAX_TOKENS,
      system: bouwSysteemPrompt(),
      messages: [{ role: "user", content }],
      output_config: { format: { type: "json_schema", schema: TAG_SCHEMA } },
    },
  };
}

function inLijst<T extends readonly string[]>(lijst: T, w: unknown): w is T[number] {
  return typeof w === "string" && (lijst as readonly string[]).includes(w);
}

function alleInLijst<T extends readonly string[]>(lijst: T, w: unknown): w is T[number][] {
  return Array.isArray(w) && w.every((x) => inLijst(lijst, x));
}

// TAG_SCHEMA staat op additionalProperties: false; deze validator handhaaft dat zelf ook,
// in plaats van erop te vertrouwen dat de structured-output-API het al afdwingt.
const TOEGESTANE_VELDEN = new Set(Object.keys(TAG_SCHEMA.properties));

// ---------------------------------------------------------------------------
// Normalisatielaag, vóór validatie (FIXRONDE 5, controller, 24 sept 2026).
//
// Spec 5.1 schrijft voor dat colors/materials "genormaliseerd" zijn; dat stond
// nooit als code. Alleen deze twee velden: spec 5.1 noemt expliciet alleen
// colors/materials, andere velden (occasions, seasons, ...) zijn vaste enums
// zonder aangetoonde synoniemenbehoefte en blijven hier bewust onaangeraakt,
// om niet meer scope te pakken dan de diagnose rechtvaardigt.
//
// Twee harde grenzen, letterlijk uit de opdracht:
// 1. Alleen normaliseren waar de betekenis vaststaat: hoofdletters/spaties,
//    de simpele meervoudsvorm (trailing "s"), en een met de hand vastgelegde
//    synoniemenlijst (Engelse varianten, en voor materialen: vezelnamen die
//    per definitie synthetisch zijn). Geen fuzzy matching, geen taalkundige
//    gok. "viscose"/"rayon"/"modal" (halfsynthetisch) en "cashmere"/"suède"
//    (specifieker dan wol/leer) staan er daarom bewust NIET in: geen zekere
//    1-op-1 relatie met een van de negen schemawaarden.
// 2. Nooit stilzwijgend informatie weggooien: een waarde die na dit alles nog
//    steeds niet in de lijst staat, gaat ONGEWIJZIGD terug. valideerTags
//    keurt hem dan af zoals voorheen ("waarde buiten schema"), niets wordt
//    geraden of verwijderd.
//
// "smart casual" als occasion krijgt BEWUST geen synoniem hier (geen drop,
// geen map naar "casual"/"work"): dat zou een gok zijn over wat het model
// bedoelde, precies wat de opdracht uitsluit. De prompt-fix hierboven is de
// eerste verdedigingslinie (voorkomen dat het model de waarde ooit teruggeeft);
// als hij toch verschijnt, blijft het hele object een afkeuring, zichtbaar
// gemaakt met veld+waarde (zie valideerTagsGedetailleerd/verwerkResultaten),
// in plaats van dat de rij stilletjes met een onvolledige of geraden
// occasions-lijst wordt weggeschreven.
export const KLEUR_SYNONIEMEN: Partial<Record<string, (typeof COLORS)[number]>> = {
  black: "zwart",
  white: "wit",
  grey: "grijs",
  gray: "grijs",
  brown: "bruin",
  green: "groen",
  red: "rood",
  pink: "roze",
  blue: "blauw",
  yellow: "geel",
  purple: "paars",
  violet: "paars",
  orange: "oranje",
  multi: "multicolor",
  multicolour: "multicolor",
  multicolored: "multicolor",
  colorful: "multicolor",
  colourful: "multicolor",
};

export const MATERIAAL_SYNONIEMEN: Partial<Record<string, (typeof MATERIALS)[number]>> = {
  cotton: "katoen",
  wool: "wol",
  leather: "leer",
  silk: "zijde",
  linen: "linnen",
  jean: "denim",
  jeans: "denim",
  jersey: "tricot",
  knit: "tricot",
  knitwear: "tricot",
  // Vezelnamen die per definitie synthetisch zijn (geen inschatting, geen
  // twijfelgeval): elastaan is het concrete geval uit de diagnose (2 van de
  // 18 afkeuringen in de bewaarde steekproef).
  elastaan: "synthetisch",
  elastane: "synthetisch",
  spandex: "synthetisch",
  lycra: "synthetisch",
  polyester: "synthetisch",
  polyamide: "synthetisch",
  nylon: "synthetisch",
  acryl: "synthetisch",
  acrylic: "synthetisch",
  unknown: "onbekend",
};

function normaliseerWaarde<T extends readonly string[]>(
  ruw: unknown,
  lijst: T,
  synoniemen: Partial<Record<string, T[number]>>
): unknown {
  if (typeof ruw !== "string") return ruw;
  const key = ruw.trim().toLowerCase();
  if (!key) return ruw;
  const exact = lijst.find((v) => v.toLowerCase() === key);
  if (exact) return exact;
  if (synoniemen[key]) return synoniemen[key];
  // Simpele meervoudsvorm: alleen de trailing-"s"-vorm, geen taalkundige
  // heuristiek. Geen van de canonieke waarden in COLORS/MATERIALS eindigt
  // zelf op "s", dus dit kan een echte canonieke waarde niet per ongeluk
  // verminken.
  if (key.length > 1 && key.endsWith("s")) {
    const enkelvoud = key.slice(0, -1);
    const exactEnkelvoud = lijst.find((v) => v.toLowerCase() === enkelvoud);
    if (exactEnkelvoud) return exactEnkelvoud;
    if (synoniemen[enkelvoud]) return synoniemen[enkelvoud];
  }
  return ruw; // onbekend: ongewijzigd terug, blijft een afkeuring, geen gok
}

/** Normaliseert elk element van een array-veld (colors/materials). Niet-arrays
 * gaan ongemoeid terug; valideerTagsGedetailleerd keurt die op de normale
 * manier af (verkeerd type, geen normalisatiekwestie). */
export function normaliseerLijst<T extends readonly string[]>(
  ruw: unknown,
  lijst: T,
  synoniemen: Partial<Record<string, T[number]>>
): unknown {
  if (!Array.isArray(ruw)) return ruw;
  return ruw.map((x) => normaliseerWaarde(x, lijst, synoniemen));
}

// ---------------------------------------------------------------------------

/**
 * Resultaat van valideerTagsGedetailleerd: bij een afkeuring bevat dit WELK
 * veld en WELKE waarde de afkeuring veroorzaakten, in plaats van alleen
 * "waarde buiten schema" (FIXRONDE 5, controller, 24 sept 2026). Vóór deze
 * wijziging moest de oorzaak van 847 afkeuringen in een echte ronde
 * gereconstrueerd worden uit een apart bewaarde modeluitvoer; met veld+waarde
 * in het foutenrecord (zie verwerkResultaten/verwerkCliUitvoer) staat die
 * oorzaak meteen in `tag-fouten-*.json`.
 */
export type ValidatieResultaat = { ok: true; tags: TagUitvoer } | { ok: false; veld: string; waarde: unknown };

export function valideerTagsGedetailleerd(obj: unknown): ValidatieResultaat {
  if (!obj || typeof obj !== "object") return { ok: false, veld: "(geen object)", waarde: obj };
  const o: Record<string, unknown> = { ...(obj as Record<string, unknown>) };

  const onbekendVeld = Object.keys(o).find((veld) => !TOEGESTANE_VELDEN.has(veld));
  if (onbekendVeld) return { ok: false, veld: onbekendVeld, waarde: o[onbekendVeld] };

  // Normalisatielaag, alleen colors/materials (zie hierboven).
  o.colors = normaliseerLijst(o.colors, COLORS, KLEUR_SYNONIEMEN);
  o.materials = normaliseerLijst(o.materials, MATERIALS, MATERIAAL_SYNONIEMEN);

  if (typeof o.is_fashion !== "boolean") return { ok: false, veld: "is_fashion", waarde: o.is_fashion };
  if (!inLijst(CATEGORIES, o.category)) return { ok: false, veld: "category", waarde: o.category };
  if (!inLijst(GENDERS, o.gender)) return { ok: false, veld: "gender", waarde: o.gender };
  if (![1, 2, 3, 4, 5].includes(o.formality as number)) return { ok: false, veld: "formality", waarde: o.formality };
  if (!alleInLijst(OCCASIONS, o.occasions)) return { ok: false, veld: "occasions", waarde: o.occasions };
  if (!inLijst(SILHOUETTES, o.silhouette)) return { ok: false, veld: "silhouette", waarde: o.silhouette };
  if (!inLijst(COLOR_TEMPS, o.color_temp)) return { ok: false, veld: "color_temp", waarde: o.color_temp };
  if (!inLijst(LIGHTNESS, o.lightness)) return { ok: false, veld: "lightness", waarde: o.lightness };
  if (!inLijst(PATTERNS, o.pattern)) return { ok: false, veld: "pattern", waarde: o.pattern };
  if (o.shoe_type !== null && !inLijst(SHOE_TYPES, o.shoe_type)) {
    return { ok: false, veld: "shoe_type", waarde: o.shoe_type };
  }
  if (!alleInLijst(COLORS, o.colors)) return { ok: false, veld: "colors", waarde: o.colors };
  if (!alleInLijst(MATERIALS, o.materials)) return { ok: false, veld: "materials", waarde: o.materials };
  if (!alleInLijst(SEASONS, o.seasons)) return { ok: false, veld: "seasons", waarde: o.seasons };
  if (typeof o.confidence !== "number" || o.confidence < 0 || o.confidence > 1) {
    return { ok: false, veld: "confidence", waarde: o.confidence };
  }

  return {
    ok: true,
    tags: {
      // Spec 5.1: category anders dan de zes echte waarden ("geen") betekent
      // is_fashion false. Dit forceren we hier zelf in plaats van te vertrouwen
      // op een consistente modeluitvoer. keten_schrijf_tags (taak 2, migratie
      // 20260916100000) berekent is_fashion onafhankelijk met dezelfde regel
      // (pa.is_fashion and coalesce(is_fashion, true) and category <> 'geen'),
      // dus dit is niet de enige verdedigingslinie tegen badkleding-in-de-
      // accessoire-emmer. Deze forcering telt wel voor de TagRij zelf, vóór
      // die de database in gaat: logging, QA en de foutenlijst zien anders een
      // rij die intern tegenstrijdig is (is_fashion true met category 'geen').
      is_fashion: o.category === "geen" ? false : o.is_fashion,
      category: o.category,
      gender: o.gender,
      formality: o.formality as TagUitvoer["formality"],
      occasions: [...new Set(o.occasions as TagUitvoer["occasions"])],
      silhouette: o.silhouette,
      color_temp: o.color_temp,
      lightness: o.lightness,
      pattern: o.pattern,
      shoe_type: o.category === "footwear" ? (o.shoe_type as TagUitvoer["shoe_type"]) : null,
      colors: [...new Set(o.colors as TagUitvoer["colors"])],
      materials: [...new Set(o.materials as TagUitvoer["materials"])],
      seasons: [...new Set(o.seasons as TagUitvoer["seasons"])],
      confidence: o.confidence,
    },
  };
}

/** Dunne, backwaarts-compatibele wrapper rond valideerTagsGedetailleerd voor
 * bestaande aanroepers die alleen geldig/ongeldig nodig hebben, geen veld+waarde. */
export function valideerTags(obj: unknown): TagUitvoer | null {
  const resultaat = valideerTagsGedetailleerd(obj);
  return resultaat.ok ? resultaat.tags : null;
}

export function schatKosten(invoer: { aantal: number; gemInputTokens: number; gemOutputTokens: number }) {
  const inputUsd = (invoer.aantal * invoer.gemInputTokens * BATCH_INPUT_USD_PER_MTOK) / 1_000_000;
  const outputUsd = (invoer.aantal * invoer.gemOutputTokens * BATCH_OUTPUT_USD_PER_MTOK) / 1_000_000;
  return { inputUsd, outputUsd, totaalUsd: inputUsd + outputUsd };
}

// Structureel type voor batchresultaten, zodat de verwerking zonder SDK-object
// te testen is. De SDK levert dezelfde vorm (custom_id + result).
export interface BatchResultaat {
  custom_id: string;
  result: {
    type: string;
    message?: { stop_reason?: string | null; content: Array<{ type: string; text?: string }> };
    error?: { type?: string; message?: string };
  };
}

export interface VerwerkFout {
  custom_id: string;
  reden: string;
  // Alleen gezet bij reden "waarde buiten schema" (FIXRONDE 5, controller, 24
  // sept 2026): welk veld en welke waarde de afkeuring veroorzaakten, zodat de
  // oorzaak uit tag-fouten-*.json is af te lezen in plaats van gereconstrueerd
  // te moeten worden uit een apart bewaarde modeluitvoer.
  veld?: string;
  waarde?: unknown;
}

export function verwerkResultaten(
  resultaten: BatchResultaat[],
  modus: Modus
): { rijen: TagRij[]; fouten: VerwerkFout[] } {
  const versie = modus === "foto" ? TAGGER_VERSION_FOTO : TAGGER_VERSION;
  const rijen: TagRij[] = [];
  const fouten: VerwerkFout[] = [];

  for (const r of resultaten) {
    if (r.result.type !== "succeeded" || !r.result.message) {
      fouten.push({ custom_id: r.custom_id, reden: `${r.result.type}: ${r.result.error?.type ?? "geen detail"}` });
      continue;
    }
    if (r.result.message.stop_reason === "max_tokens") {
      fouten.push({ custom_id: r.custom_id, reden: "max_tokens: uitvoer afgekapt" });
      continue;
    }
    const tekst = r.result.message.content.find((b) => b.type === "text")?.text ?? "";
    let obj: unknown;
    try {
      obj = JSON.parse(tekst);
    } catch {
      fouten.push({ custom_id: r.custom_id, reden: "geen geldige JSON" });
      continue;
    }
    const resultaat = valideerTagsGedetailleerd(obj);
    if (!resultaat.ok) {
      fouten.push({ custom_id: r.custom_id, reden: "waarde buiten schema", veld: resultaat.veld, waarde: resultaat.waarde });
      continue;
    }
    rijen.push({ ...resultaat.tags, product_id: r.custom_id, tagger_version: versie });
  }

  return { rijen, fouten };
}
