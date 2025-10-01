// /src/lib/quiz/logic.ts
import type { AnswerMap, ColorProfile, Archetype, QuizResult } from "./types";

function decideTemperature(a: AnswerMap): ColorProfile["temperature"] {
  if (a.jewelry === "goud") return "warm";
  if (a.jewelry === "zilver") return "koel";
  return a.neutrals ?? "neutraal";
}
function decideValue(a: AnswerMap): ColorProfile["value"] {
  return a.lightness ?? "medium";
}
function decideContrast(a: AnswerMap): ColorProfile["contrast"] {
  return a.contrast ?? "medium";
}
function decideChroma(a: AnswerMap): ColorProfile["chroma"] {
  if (a.prints === "statement" || a.materials === "glans") return "helder";
  if (a.prints === "effen" || a.materials === "mat") return "zacht";
  return "zacht";
}
function decideSeason(
  temp: ColorProfile["temperature"],
  value: ColorProfile["value"],
  contrast: ColorProfile["contrast"],
  chroma: ColorProfile["chroma"]
): ColorProfile["season"] {
  if (temp === "warm") {
    if (value === "licht") return "lente";
    return "herfst";
  }
  if (temp === "koel") {
    if (value === "donker" || contrast === "hoog") return "winter";
    return "zomer";
  }
  // neutraal -> leunen op value/contrast
  if (value === "donker") return "winter";
  if (value === "licht") return "zomer";
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
  if (contrast === "hoog") notes.push("Hoger contrast mag: licht vs. donker combineren.");
  if (temperature === "warm") notes.push("Warme neutrale basis (zand, klei, camel).");
  if (temperature === "koel") notes.push("Koele neutrale basis (grijs, navy, steenkleur).");
  if (chroma === "zacht") notes.push("Houd prints subtiel; liever textuur dan glans.");
  if (chroma === "helder") notes.push("Een helder accent per look werkt goed.");

  return { temperature, value, contrast, chroma, season, paletteName: paletteNameOf(season, temperature), notes };
}

export function computeArchetype(a: AnswerMap): Archetype {
  if (a.goals?.includes("sport") || a.materials === "glans") return "Sporty Sharp";
  if (a.fit === "slim" && (a.comfort === "structured" || a.occasions?.includes("office"))) return "Clean Minimal";
  if (a.comfort === "relaxed" || a.fit === "relaxed" || a.occasions?.includes("leisure")) return "Classic Soft";
  return "Smart Casual";
}

export function computeResult(a: AnswerMap): QuizResult {
  const color = computeColorProfile(a);
  const archetype = computeArchetype(a);
  return { color, archetype };
}