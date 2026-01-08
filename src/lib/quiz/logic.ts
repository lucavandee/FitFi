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
  _chroma: ColorProfile["chroma"]
): ColorProfile["season"] {
  if (temp === "warm") return value === "licht" ? "lente" : "herfst";
  if (temp === "koel") return value === "donker" || contrast === "hoog" ? "winter" : "zomer";
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
  // Edge case handling: check if user has provided any meaningful answers
  const hasAnswers = Object.keys(a).some(key => {
    const val = a[key];
    return val !== undefined && val !== null && val !== '' &&
           (Array.isArray(val) ? val.length > 0 : true);
  });

  if (!hasAnswers) {
    console.warn('[computeArchetype] No meaningful answers provided, using default archetype');
    return "Smart Casual";
  }

  // Score-based archetype detection for edge cases
  const scores: Record<string, number> = {
    'Sporty Sharp': 0,
    'Clean Minimal': 0,
    'Classic Soft': 0,
    'Smart Casual': 10 // baseline score for fallback
  };

  // Style preferences
  if (Array.isArray(a.stylePreferences) && a.stylePreferences.length > 0) {
    a.stylePreferences.forEach(style => {
      const s = style.toLowerCase();
      if (s.includes('minimal') || s.includes('clean')) scores['Clean Minimal'] += 25;
      if (s.includes('classic') || s.includes('romantic')) scores['Classic Soft'] += 25;
      if (s.includes('sport') || s.includes('athletic')) scores['Sporty Sharp'] += 25;
      if (s.includes('street') || s.includes('casual')) scores['Smart Casual'] += 20;
    });
  }

  // Goals
  if (Array.isArray(a.goals)) {
    a.goals.forEach(goal => {
      const g = goal.toLowerCase();
      if (g.includes('sport') || g.includes('comfort')) scores['Sporty Sharp'] += 15;
      if (g.includes('minimal') || g.includes('timeless') || g.includes('tijdloos')) scores['Clean Minimal'] += 15;
      if (g.includes('professional') || g.includes('professioneel')) {
        scores['Smart Casual'] += 15;
        scores['Classic Soft'] += 10;
      }
    });
  }

  // Fit
  if (a.fit) {
    if (a.fit === "slim") {
      scores['Clean Minimal'] += 20;
      scores['Smart Casual'] += 10;
    }
    if (a.fit === "relaxed" || a.fit === "oversized") {
      scores['Classic Soft'] += 15;
      scores['Smart Casual'] += 10;
    }
    if (a.fit === "regular") scores['Smart Casual'] += 15;
  }

  // Materials
  if (a.materials) {
    const materials = Array.isArray(a.materials) ? a.materials : [a.materials];
    materials.forEach(mat => {
      const m = mat.toLowerCase();
      if (m.includes('tech') || m.includes('fleece')) scores['Sporty Sharp'] += 12;
      if (m.includes('linnen') || m.includes('linen')) scores['Clean Minimal'] += 10;
      if (m.includes('wol') || m.includes('wool')) scores['Classic Soft'] += 10;
    });
  }

  // Occasions
  if (Array.isArray(a.occasions)) {
    a.occasions.forEach(occ => {
      const o = occ.toLowerCase();
      if (o.includes('sport') || o.includes('activ')) scores['Sporty Sharp'] += 15;
      if (o.includes('work') || o.includes('office') || o.includes('werk')) {
        scores['Smart Casual'] += 15;
        scores['Classic Soft'] += 10;
      }
      if (o.includes('casual') || o.includes('leisure')) scores['Smart Casual'] += 12;
      if (o.includes('formal')) scores['Classic Soft'] += 15;
    });
  }

  // Find highest scoring archetype
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const winner = sorted[0][0] as Archetype;

  console.log('[computeArchetype] Scores:', scores, 'Winner:', winner);

  // Edge case: if all scores are very low (user answered "nothing" or contradictory)
  if (sorted[0][1] < 15) {
    console.warn('[computeArchetype] All scores very low, user may have conflicting preferences');
    return "Smart Casual"; // Neutral fallback
  }

  return winner;
}

export function computeResult(a: AnswerMap): QuizResult {
  const color = computeColorProfile(a);
  const archetype = computeArchetype(a);
  return { color, archetype };
}