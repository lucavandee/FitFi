// /src/lib/quiz/logic.ts
import type { AnswerMap, ColorProfile, Archetype, QuizResult } from "./types";

function decideTemperature(a: AnswerMap): "warm" | "koel" | "neutraal" {
  if (a.jewelry === "goud") return "warm";
  if (a.jewelry === "zilver") return "koel";
  // fallback op neutrale voorkeur
  return a.neutrals ?? "neutraal";
}

function decideValue(a: AnswerMap): "licht" | "medium" | "donker" {
  return a.lightness ?? "medium";
}

function decideContrast(a: AnswerMap): "laag" | "medium" | "hoog" {
  return a.contrast ?? "medium";
}

function decideChroma(a: AnswerMap): "zacht" | "helder" {
  // prints/materials sturen chroma
  if (a.prints === "statement" || a.materials === "glans") return "helder";
  if (a.prints === "effen" || a.materials === "mat") return "zacht";
  return "zacht";
}

function decideSeason(
  temp: "warm" | "koel" | "neutraal",
  value: "licht" | "medium" | "donker",
  contrast: "laag" | "medium" | "hoog",
  chroma: "zacht" | "helder"
): ColorProfile["season"] {
  // heuristiek geënt op klassieke seizoensanalyse
  if (temp === "warm") {
    if (value === "licht" && chroma === "helder") return "lente";
    if (value === "licht" && chroma === "zacht") return "lente";
    if (value !== "licht" && contrast !== "hoog") return "herfst";
    return "lente";
  }
  if (temp === "koel") {
    if (value === "donker" || contrast === "hoog") return "winter";
    return "zomer";
  }
  // neutraal: leunen op value/contrast
  if (value === "donker" && contrast !== "laag") return "winter";
  if (value === "licht" && chroma === "zacht") return "zomer";
  return "herfst";
}

function paletteNameOf(season: ColorProfile["season"], temp: ColorProfile["temperature"]) {
  const base =
    season === "lente" ? "Light Warm Neutrals" :
    season === "zomer" ? "Soft Cool Tonals" :
    season === "herfst" ? "Earthy Warm Neutrals" :
    "Crisp Cool Neutrals";
  return `${base} (${temp})`;
}

export function computeColorProfile(a: AnswerMap): ColorProfile {
  const temperature = decideTemperature(a);
  const value = decideValue(a);
  const contrast = decideContrast(a);
  const chroma = decideChroma(a);
  const season = decideSeason(temperature, value, contrast, chroma);

  const notes: string[] = [];
  if (contrast === "laag") notes.push("Kies lage contrasten en tonal outfits.");
  if (contrast === "hoog") notes.push("Mag hoger contrast: licht vs. donker combineren.");
  if (temperature === "warm") notes.push("Warme neutrale basis (zand, klei, camel).");
  if (temperature === "koel") notes.push("Koele neutrale basis (grijs, navy, steenkleur).");
  if (chroma === "zacht") notes.push("Houd prints subtiel, textuur i.p.v. glans.");
  if (chroma === "helder") notes.push("Een helder accent per look werkt goed.");

  return {
    temperature,
    value,
    contrast,
    chroma,
    season,
    paletteName: paletteNameOf(season, temperature),
    notes,
  };
}

export function computeArchetype(a: AnswerMap): Archetype {
  // eenvoudige mapping
  if (a.goals?.includes("sport") || a.materials === "glans")
    return "Sporty Sharp";
  if (a.fit === "slim" && (a.comfort === "structured" || a.occasions?.includes("office")))
    return "Clean Minimal";
  if (a.comfort === "relaxed" || a.fit === "relaxed" || a.occasions?.includes("leisure"))
    return "Classic Soft";
  return "Smart Casual";
}

export function computeResult(a: AnswerMap): QuizResult {
  const color = computeColorProfile(a);
  const archetype = computeArchetype(a);
  return { color, archetype };
}