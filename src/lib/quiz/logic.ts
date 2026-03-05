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
  _chroma: ColorProfile["chroma"],
  photoAnalysis?: AnswerMap["colorAnalysis"]
): ColorProfile["season"] {
  if (photoAnalysis && photoAnalysis.confidence >= 0.6) {
    const map: Record<string, ColorProfile["season"]> = {
      spring: "lente",
      summer: "zomer",
      autumn: "herfst",
      winter: "winter",
    };
    const mapped = map[photoAnalysis.seasonal_type];
    if (mapped) return mapped;
  }

  if (temp === "warm" && value === "licht") return "lente";
  if (temp === "warm" && value === "medium") return "herfst";
  if (temp === "warm") return "herfst";
  if (temp === "koel" && (value === "donker" || contrast === "hoog")) return "winter";
  if (temp === "koel") return "zomer";
  if (value === "donker" && contrast === "hoog") return "winter";
  if (value === "licht") return "zomer";
  if (contrast === "hoog") return "winter";
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
  const season = decideSeason(temperature, value, contrast, chroma, a.colorAnalysis);

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
  const hasAnswers = Object.keys(a).some(key => {
    const val = a[key as keyof AnswerMap];
    return val !== undefined && val !== null && val !== '' &&
           (Array.isArray(val) ? val.length > 0 : true);
  });

  if (!hasAnswers) return "SMART_CASUAL";

  const scores: Record<Archetype, number> = {
    MINIMALIST: 0,
    CLASSIC: 0,
    SMART_CASUAL: 0,
    STREETWEAR: 0,
    ATHLETIC: 0,
    AVANT_GARDE: 0,
    "Clean Minimal": 0,
    "Smart Casual": 0,
    "Sporty Sharp": 0,
    "Classic Soft": 0,
  };

  const stylePrefs = (a.stylePreferences || []).map((s: string) => s.toLowerCase());

  for (const s of stylePrefs) {
    if (s.includes('minimalis') || s.includes('clean') || s === 'effen') {
      scores.MINIMALIST += 30;
    }
    if (s.includes('classic') || s.includes('klassiek') || s.includes('preppy')) {
      scores.CLASSIC += 30;
    }
    if (s === 'smart-casual' || (s.includes('smart') && s.includes('casual'))) {
      scores.SMART_CASUAL += 40;
    }
    if (s === 'streetwear' || s.includes('street') || s.includes('urban')) {
      scores.STREETWEAR += 35;
    }
    if (s.includes('edgy') || s.includes('stoer') || s.includes('rock')) {
      scores.STREETWEAR += 20;
      scores.AVANT_GARDE += 15;
    }
    if (s.includes('sport') || s.includes('athletic') || s.includes('actief')) {
      scores.ATHLETIC += 30;
    }
    if (s.includes('bohemi') || s.includes('boho') || s.includes('artistic')) {
      scores.AVANT_GARDE += 30;
    }
    if (s.includes('romantic') || s.includes('romantisch')) {
      scores.CLASSIC += 20;
    }
    if (s.includes('androgyn')) {
      scores.MINIMALIST += 20;
    }
  }

  if (a.fit) {
    const fit = a.fit.toLowerCase();
    if (fit === 'slim') { scores.MINIMALIST += 18; scores.CLASSIC += 15; scores.SMART_CASUAL += 8; }
    if (fit === 'regular' || fit === 'straight') { scores.SMART_CASUAL += 15; scores.CLASSIC += 12; scores.MINIMALIST += 8; }
    if (fit === 'relaxed') { scores.SMART_CASUAL += 12; scores.STREETWEAR += 10; scores.ATHLETIC += 8; }
    if (fit.includes('oversized')) { scores.STREETWEAR += 22; scores.AVANT_GARDE += 18; }
  }

  if (a.comfort) {
    const c = a.comfort.toLowerCase();
    if (c === 'structured') { scores.MINIMALIST += 10; scores.CLASSIC += 10; }
    if (c === 'relaxed') { scores.SMART_CASUAL += 8; scores.ATHLETIC += 8; }
  }

  const goals = (a.goals || []).map((g: string) => g.toLowerCase());
  for (const g of goals) {
    if (g.includes('sport') || g === 'sport') { scores.ATHLETIC += 20; }
    if (g.includes('werk') || g.includes('office')) { scores.SMART_CASUAL += 15; scores.CLASSIC += 10; }
    if (g.includes('casual')) { scores.SMART_CASUAL += 10; scores.STREETWEAR += 8; }
    if (g.includes('avond')) { scores.CLASSIC += 10; scores.SMART_CASUAL += 8; }
  }

  const occasions = (a.occasions || []).map((o: string) => o.toLowerCase());
  for (const o of occasions) {
    if (o.includes('office')) { scores.SMART_CASUAL += 12; scores.CLASSIC += 8; }
    if (o.includes('smartcasual')) { scores.SMART_CASUAL += 10; }
    if (o.includes('leisure')) { scores.SMART_CASUAL += 8; scores.STREETWEAR += 5; }
  }

  if (a.materials) {
    const mats = Array.isArray(a.materials) ? a.materials : [a.materials];
    for (const m of mats.map((x: string) => x.toLowerCase())) {
      if (m.includes('tech')) { scores.ATHLETIC += 15; scores.STREETWEAR += 5; }
      if (m.includes('fleece')) { scores.ATHLETIC += 10; scores.STREETWEAR += 5; }
      if (m.includes('linnen') || m.includes('linen')) { scores.MINIMALIST += 12; scores.SMART_CASUAL += 8; }
      if (m.includes('wol') || m.includes('wool') || m.includes('kasjmier')) { scores.CLASSIC += 12; scores.MINIMALIST += 8; }
      if (m.includes('leer') || m.includes('leather')) { scores.CLASSIC += 10; scores.AVANT_GARDE += 8; }
      if (m === 'mat') { scores.MINIMALIST += 8; scores.CLASSIC += 5; }
      if (m === 'textuur') { scores.SMART_CASUAL += 8; scores.CLASSIC += 5; }
      if (m === 'glans') { scores.AVANT_GARDE += 8; }
    }
  }

  if (a.prints) {
    const p = a.prints.toLowerCase();
    if (p === 'effen' || p === 'geen') { scores.MINIMALIST += 10; }
    if (p === 'subtiel') { scores.SMART_CASUAL += 8; scores.CLASSIC += 5; }
    if (p === 'statement') { scores.STREETWEAR += 10; scores.AVANT_GARDE += 10; }
  }

  const modernKeys: Archetype[] = [
    'MINIMALIST', 'CLASSIC', 'SMART_CASUAL', 'STREETWEAR', 'ATHLETIC', 'AVANT_GARDE'
  ];

  const sorted = modernKeys
    .map(k => ({ key: k, score: scores[k] }))
    .sort((a, b) => b.score - a.score);

  if (sorted[0].score < 10) return "SMART_CASUAL";

  return sorted[0].key;
}

export function computeResult(a: AnswerMap): QuizResult {
  const color = computeColorProfile(a);
  const archetype = computeArchetype(a);
  return { color, archetype };
}