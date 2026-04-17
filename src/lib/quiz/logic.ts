import type { AnswerMap, ColorProfile, Archetype, QuizResult, SubSeason } from "./types";

// P1.3 fix: jewelry-vraag bestaat niet in de quiz, dus die check is verwijderd.
// Temperature wordt nu uitsluitend bepaald door het neutrals-antwoord.
function decideTemperature(a: AnswerMap): ColorProfile["temperature"] {
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
  // Subtiel prints tonen nog steeds kleur/patroon → niet volledig zacht
  if (a.prints === "subtiel") return "helder";
  // Tech materialen zijn typisch in heldere, synthetische kleuren
  const mats = Array.isArray(a.materials) ? a.materials : [];
  if (mats.some((m: string) => ['tech', 'nylon', 'polyester'].includes(m.toLowerCase()))) return "helder";
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

  // P2.3 fix: verbeterde seizoenslogica voor neutraal-temperatuur.
  // Voorheen vielen alle neutrale antwoorden door naar herfst als default.
  // Nu worden value en contrast beter benut bij neutrale temperatuur.

  // Warm temperatuur
  if (temp === "warm" && value === "licht") return "lente";
  if (temp === "warm" && value === "medium") return "herfst";
  if (temp === "warm") return "herfst"; // warm + donker

  // Koel temperatuur
  if (temp === "koel" && (value === "donker" || contrast === "hoog")) return "winter";
  if (temp === "koel") return "zomer";

  // Neutraal temperatuur: value en contrast bepalen het seizoen
  if (value === "licht" && contrast === "laag") return "zomer";   // zacht en licht → zomer
  if (value === "licht") return "lente";                           // licht → lente
  if (value === "donker" && contrast === "hoog") return "winter";  // donker + hoog → winter
  if (value === "donker") return "herfst";                         // donker → herfst (diep)
  if (contrast === "hoog") return "winter";                        // hoog contrast → winter
  if (contrast === "laag") return "zomer";                         // laag contrast → zomer (zacht)

  // Medium value + medium contrast bij neutraal: chroma als tiebreaker.
  // Zomer is het meest gedempte/neutrale seizoen — default voor "geen sterke signalen".
  // Helder chroma → lente (frisse, heldere kleuren passen bij lente).
  if (_chroma === "helder") return "lente";
  return "zomer";
}
// P2.4 + P3.5: sub-seizoen selectie gebaseerd op value, contrast en chroma.
// Brengt paletten van 4 → 12 voor betere personalisatie.
function decideSubSeason(
  season: ColorProfile["season"],
  value: ColorProfile["value"],
  contrast: ColorProfile["contrast"],
  chroma: ColorProfile["chroma"]
): SubSeason {
  switch (season) {
    case "lente":
      if (value === "licht" && contrast === "laag") return "licht-lente";
      if (chroma === "helder" || contrast === "hoog") return "helder-lente";
      return "warm-lente";
    case "zomer":
      if (value === "licht" && chroma === "zacht") return "licht-zomer";
      if (contrast === "laag" || chroma === "zacht") return "zacht-zomer";
      return "koel-zomer";
    case "herfst":
      if (chroma === "zacht" && contrast === "laag") return "zacht-herfst";
      if (value === "donker" || contrast === "hoog") return "diep-herfst";
      return "warm-herfst";
    case "winter":
      if (value === "donker" && contrast === "hoog") return "diep-winter";
      if (chroma === "helder" || contrast === "hoog") return "helder-winter";
      return "koel-winter";
  }
}

function paletteNameOf(subSeason: SubSeason): string {
  const names: Record<SubSeason, string> = {
    "licht-lente": "Light Spring",
    "warm-lente": "Warm Spring",
    "helder-lente": "Bright Spring",
    "licht-zomer": "Light Summer",
    "koel-zomer": "Cool Summer",
    "zacht-zomer": "Soft Summer",
    "zacht-herfst": "Soft Autumn",
    "warm-herfst": "Warm Autumn",
    "diep-herfst": "Deep Autumn",
    "koel-winter": "Cool Winter",
    "diep-winter": "Deep Winter",
    "helder-winter": "Bright Winter",
  };
  return names[subSeason];
}

export function computeColorProfile(a: AnswerMap): ColorProfile {
  const temperature = decideTemperature(a);
  const value = decideValue(a);
  const contrast = decideContrast(a);
  const chroma = decideChroma(a);
  const season = decideSeason(temperature, value, contrast, chroma, a.colorAnalysis);
  const subSeason = decideSubSeason(season, value, contrast, chroma);

  const notes: string[] = [];
  if (contrast === "laag") notes.push("Kies lage contrasten en tonal outfits.");
  if (contrast === "medium") notes.push("Licht tot medium contrast: combineer aangrenzende tinten voor een verzorgde look.");
  if (contrast === "hoog") notes.push("Hoger contrast mag: licht vs. donker combineren.");
  if (temperature === "warm") notes.push("Warme neutrale basis (zand, klei, camel).");
  if (temperature === "koel") notes.push("Koele neutrale basis (grijs, navy, steenkleur).");
  if (chroma === "zacht") notes.push("Houd prints subtiel; liever textuur dan glans.");
  if (chroma === "helder") notes.push("Een helder accent per look werkt goed.");

  return { temperature, value, contrast, chroma, season, subSeason, paletteName: paletteNameOf(subSeason), notes };
}

export function computeArchetype(a: AnswerMap): Archetype {
  const hasAnswers = Object.keys(a).some(key => {
    const val = a[key as keyof AnswerMap];
    return val !== undefined && val !== null && val !== '' &&
           (Array.isArray(val) ? val.length > 0 : true);
  });

  if (!hasAnswers) return "SMART_CASUAL";

  // P1.4 fix: legacy keys ("Clean Minimal" etc.) verwijderd uit scores.
  // Ze werden nooit geselecteerd (alleen modernKeys wordt gesorteerd).
  // Legacy names blijven bestaan in het Archetype type voor display-compatibiliteit.
  const scores: Record<string, number> = {
    MINIMALIST: 0,
    CLASSIC: 0,
    SMART_CASUAL: 0,
    STREETWEAR: 0,
    ATHLETIC: 0,
    AVANT_GARDE: 0,
    BUSINESS: 0,
  };

  const stylePrefs = (a.stylePreferences || []).map((s: string) => s.toLowerCase());

  for (const s of stylePrefs) {
    if (s.includes('minimalis') || s.includes('clean') || s === 'effen') {
      scores.MINIMALIST += 30;
    }
    if (s.includes('classic') || s.includes('klassiek') || s.includes('preppy')) {
      scores.CLASSIC += 30;
    }
    // P2.2 fix: SMART_CASUAL bonus verlaagd van 40 naar 30 (gelijk aan andere archetypes)
    if (s === 'smart-casual' || (s.includes('smart') && s.includes('casual'))) {
      scores.SMART_CASUAL += 30;
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
    if (s === 'business' || s === 'formal' || s === 'formeel' || s === 'zakelijk' || s.includes('tailored')) {
      scores.BUSINESS += 35;
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
    if (g.includes('werk') || g.includes('office') || g.includes('professional') || g.includes('professioneel')) {
      scores.BUSINESS += 15; scores.SMART_CASUAL += 10; scores.CLASSIC += 8;
    }
    if (g.includes('casual')) { scores.SMART_CASUAL += 10; scores.STREETWEAR += 8; }
    if (g.includes('avond')) { scores.CLASSIC += 10; scores.SMART_CASUAL += 8; }
  }

  // P1.1 fix: occasion strings nu exact gelijk aan quiz-output (work|casual|formal|date|travel|sport)
  const occasions = (a.occasions || []).map((o: string) => o.toLowerCase());
  for (const o of occasions) {
    if (o === 'work') { scores.BUSINESS += 12; scores.SMART_CASUAL += 10; scores.CLASSIC += 8; scores.MINIMALIST += 5; }
    if (o === 'casual') { scores.SMART_CASUAL += 8; scores.STREETWEAR += 8; }
    if (o === 'formal') { scores.BUSINESS += 20; scores.CLASSIC += 10; scores.MINIMALIST += 5; }
    if (o === 'date') { scores.CLASSIC += 10; scores.SMART_CASUAL += 8; scores.MINIMALIST += 5; }
    if (o === 'travel') { scores.SMART_CASUAL += 10; scores.ATHLETIC += 5; }
    if (o === 'sport') { scores.ATHLETIC += 15; scores.STREETWEAR += 5; }
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

  // P2.2 fix: bij geen stijlsignalen (alle scores 0) wordt het kleurprofiel
  // gebruikt als subtiele archetype-indicator, zodat niet alles op MINIMALIST
  // clustert (eerste key in de array bij gelijke scores).
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) {
    if (a.neutrals === "warm") scores.SMART_CASUAL += 8;
    else if (a.neutrals === "koel") scores.CLASSIC += 8;
    else scores.SMART_CASUAL += 4;

    if (a.lightness === "licht") scores.MINIMALIST += 6;
    else if (a.lightness === "donker") scores.STREETWEAR += 7;
    else scores.ATHLETIC += 4;

    if (a.contrast === "hoog") scores.AVANT_GARDE += 9;
    else if (a.contrast === "laag") scores.CLASSIC += 7;
    else scores.SMART_CASUAL += 3;
  }

  const modernKeys: Archetype[] = [
    'MINIMALIST', 'CLASSIC', 'SMART_CASUAL', 'STREETWEAR', 'ATHLETIC', 'AVANT_GARDE', 'BUSINESS'
  ];

  const sorted = modernKeys
    .map(k => ({ key: k, score: scores[k] }))
    .sort((a, b) => b.score - a.score);

  return sorted[0].key;
}

export function computeResult(a: AnswerMap): QuizResult {
  const color = computeColorProfile(a);
  const archetype = computeArchetype(a);
  return { color, archetype };
}