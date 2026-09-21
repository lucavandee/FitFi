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
    "- formality: 1 sport of loungewear, 2 casual, 3 smart casual, 4 net, 5 formeel.",
    "- occasions: alle gelegenheden waar dit item past, uit work, casual, formal, date, travel, sport, party. Minimaal een.",
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

export function valideerTags(obj: unknown): TagUitvoer | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;

  if (typeof o.is_fashion !== "boolean") return null;
  if (!inLijst(CATEGORIES, o.category)) return null;
  if (!inLijst(GENDERS, o.gender)) return null;
  if (![1, 2, 3, 4, 5].includes(o.formality as number)) return null;
  if (!alleInLijst(OCCASIONS, o.occasions)) return null;
  if (!inLijst(SILHOUETTES, o.silhouette)) return null;
  if (!inLijst(COLOR_TEMPS, o.color_temp)) return null;
  if (!inLijst(LIGHTNESS, o.lightness)) return null;
  if (!inLijst(PATTERNS, o.pattern)) return null;
  if (o.shoe_type !== null && !inLijst(SHOE_TYPES, o.shoe_type)) return null;
  if (!alleInLijst(COLORS, o.colors)) return null;
  if (!alleInLijst(MATERIALS, o.materials)) return null;
  if (!alleInLijst(SEASONS, o.seasons)) return null;
  if (typeof o.confidence !== "number" || o.confidence < 0 || o.confidence > 1) return null;

  return {
    // Spec 5.1: category anders dan de zes echte waarden ("geen") betekent
    // is_fashion false. Dit forceren we hier zelf in plaats van te vertrouwen
    // op een consistente modeluitvoer, want dit is precies de knop die
    // badkleding (en ander niet-mode-spul dat nu in de accessoire-emmer van
    // plan 1 zit) definitief buiten get_kandidaten houdt: keten_schrijf_tags
    // kan is_fashion alleen van waar naar onwaar zetten, dus een gemiste
    // downgrade hier is een gemiste downgrade voor altijd.
    is_fashion: o.category === "geen" ? false : o.is_fashion,
    category: o.category,
    gender: o.gender,
    formality: o.formality as TagUitvoer["formality"],
    occasions: [...new Set(o.occasions)],
    silhouette: o.silhouette,
    color_temp: o.color_temp,
    lightness: o.lightness,
    pattern: o.pattern,
    shoe_type: o.category === "footwear" ? (o.shoe_type as TagUitvoer["shoe_type"]) : null,
    colors: [...new Set(o.colors)],
    materials: [...new Set(o.materials)],
    seasons: [...new Set(o.seasons)],
    confidence: o.confidence,
  };
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

export function verwerkResultaten(
  resultaten: BatchResultaat[],
  modus: Modus
): { rijen: TagRij[]; fouten: { custom_id: string; reden: string }[] } {
  const versie = modus === "foto" ? TAGGER_VERSION_FOTO : TAGGER_VERSION;
  const rijen: TagRij[] = [];
  const fouten: { custom_id: string; reden: string }[] = [];

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
    const tags = valideerTags(obj);
    if (!tags) {
      fouten.push({ custom_id: r.custom_id, reden: "waarde buiten schema" });
      continue;
    }
    rijen.push({ ...tags, product_id: r.custom_id, tagger_version: versie });
  }

  return { rijen, fouten };
}
