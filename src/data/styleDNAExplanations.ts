/**
 * Style DNA Explanations in Plain Dutch
 *
 * Purpose: Convert technical color theory terms into practical, actionable guidance
 * that laypersons can understand and use immediately.
 *
 * Structure:
 * - WHAT: The technical term
 * - BETEKENT: What it means in plain language
 * - VOORBEELDEN: Concrete color examples
 * - DO: What to wear
 * - DONT: What to avoid
 * - WHY: Why this matters
 */

export interface StyleDNAExplanation {
  label: string; // Technical term
  betekent: string; // Plain language explanation
  voorbeelden: string[]; // Concrete color examples
  do: string[]; // Practical do's
  dont: string[]; // Practical don'ts
  why: string; // Why this matters
  visualHint?: string; // Optional visual description
}

// ==========================================
// SEASONAL COLOR ANALYSIS EXPLANATIONS
// ==========================================

export const SEASON_EXPLANATIONS: Record<string, StyleDNAExplanation> = {
  // WINTER (Cool + High Contrast)
  winter: {
    label: 'Winter',
    betekent: 'Je hebt een koele ondertoon en hoog contrast tussen je huid, haar en ogen. Jouw beste kleuren zijn helder en gedurfd.',
    voorbeelden: [
      'Zuiver wit',
      'Zwart',
      'Koningsblauw',
      'Smaragdgroen',
      'Fuchsia',
      'IJsroze',
      'Zilver (sieraden)'
    ],
    do: [
      'Kies heldere, verzadigde kleuren (denk aan juwelen)',
      'Draag zwart en wit voor maximaal effect',
      'Ga voor high-contrast combinaties (bv. zwart met wit)',
      'Kies koele tinten blauw, groen, roze en paars',
      'Gebruik zilver of witgoud sieraden'
    ],
    dont: [
      'Vermijd warme, gedempt tinten (oranje, camel, mosterdgeel)',
      'Geen aardse kleuren (bruin, khaki, olijfgroen)',
      'Skip gedempte pastels (perzik, zalm)',
      'Vermijd goud sieraden (te warm voor jouw ondertoon)'
    ],
    why: 'Jouw natuurlijke contrast is hoog (donker haar + lichte huid of vice versa), dus zachte kleuren verdrinken je uitstraling. Gedurfde, heldere kleuren brengen je tot leven.',
    visualHint: '❄️ Denk aan: sneeuw, saffier, smaragd, zuiver wit'
  },

  // SUMMER (Cool + Low Contrast)
  zomer: {
    label: 'Zomer',
    betekent: 'Je hebt een koele ondertoon en laag contrast. Jouw beste kleuren zijn zacht, gedempt en elegant.',
    voorbeelden: [
      'Lavendel',
      'Zacht blauw',
      'Oudroze',
      'Mintgroen',
      'Lichtgrijs',
      'Zachtpaars',
      'Zilver (sieraden)'
    ],
    do: [
      'Kies zachte, gedempte kleuren (pastels met grijs ondertoon)',
      'Draag tonal outfits (zelfde kleurenfamilie)',
      'Ga voor koele tinten blauw, paars, roze en groen',
      'Kies zacht wit (off-white) in plaats van zuiver wit',
      'Gebruik zilver of witgoud sieraden'
    ],
    dont: [
      'Vermijd harde contrasten (zwart + wit)',
      'Geen felle, verzadigde kleuren (neongeel, felrood)',
      'Skip warme tinten (oranje, camel, warm bruin)',
      'Vermijd te veel zwart (te hard voor jouw subtiele coloring)'
    ],
    why: 'Jouw natuurlijke contrast is laag (zachte, harmonieuze kleuren in huid/haar/ogen), dus harde kleuren overschaduwen je. Zachte tinten laten je natuurlijke schoonheid stralen.',
    visualHint: '🌸 Denk aan: lavendelvelden, zachte zomerochtend, pastel bloemen'
  },

  // AUTUMN (Warm + Low Contrast)
  herfst: {
    label: 'Herfst',
    betekent: 'Je hebt een warme ondertoon en laag tot medium contrast. Jouw beste kleuren zijn rijk, aards en warm.',
    voorbeelden: [
      'Camel',
      'Olijfgroen',
      'Warm bruin',
      'Roestbruin',
      'Mosterdgeel',
      'Terracotta',
      'Goud (sieraden)'
    ],
    do: [
      'Kies warme, aardse tinten (bruin, groen, oranje)',
      'Draag rijke, gedempte kleuren (denk aan herfstbladeren)',
      'Ga voor gouden ondertonen in je kleding',
      'Kies warm wit (ivoorwit) in plaats van koel wit',
      'Gebruik goud of koper sieraden'
    ],
    dont: [
      'Vermijd koele tinten (ijsblauw, fuchsia, zuiver wit)',
      'Geen zwart (te hard, kies donkerbruin of donkergroen)',
      'Skip neon of felle kleuren (te schel)',
      'Vermijd zilver sieraden (te koel voor jouw ondertoon)'
    ],
    why: 'Jouw warme ondertoon bloeit op in aardse, natuurlijke tinten. Koele kleuren maken je huid grauw en vermoeid. Warme kleuren geven je een gezonde gloed.',
    visualHint: '🍂 Denk aan: herfstbladeren, gouden zonsondergang, warme aarde'
  },

  // SPRING (Warm + High Contrast)
  lente: {
    label: 'Lente',
    betekent: 'Je hebt een warme ondertoon en medium tot hoog contrast. Jouw beste kleuren zijn helder, warm en levendig.',
    voorbeelden: [
      'Koraalrood',
      'Turquoise',
      'Warm groen',
      'Perzik',
      'Helder geel',
      'Aquamarijn',
      'Goud (sieraden)'
    ],
    do: [
      'Kies heldere, warme kleuren (denk aan lentebloemen)',
      'Draag levendige tinten (koraal, turquoise, warm groen)',
      'Ga voor kleurcontrasten (bv. koraal met aqua)',
      'Kies ivoorwit of crème in plaats van zuiver wit',
      'Gebruik goud of roségoud sieraden'
    ],
    dont: [
      'Vermijd gedempte, donkere tinten (navy, zwart, donkergrijs)',
      'Geen koele pastels (lavendel, ijsblauw)',
      'Skip aardse, muffe tinten (bruin, khaki)',
      'Vermijd te veel zwart (kies donkerblauw of donkergroen)'
    ],
    why: 'Jouw heldere, warme coloring vraagt om levendige kleuren. Donkere of gedempte tinten maken je dof. Heldere, warme kleuren laten je stralen.',
    visualHint: '🌷 Denk aan: lentetuinen, koraal, turquoise oceaan, heldere bloemen'
  }
};

// ==========================================
// CONTRAST LEVEL EXPLANATIONS
// ==========================================

export const CONTRAST_EXPLANATIONS: Record<string, StyleDNAExplanation> = {
  hoog: {
    label: 'Hoog Contrast',
    betekent: 'Er is een groot verschil in lichtheid tussen je huid, haar en ogen. Je kunt sterke kleurcombinaties aan.',
    voorbeelden: [
      'Zwart met wit',
      'Navy met fel rood',
      'Donkergroen met crème',
      'Zwart met elektrischblauw'
    ],
    do: [
      'Durf high-contrast combinaties (donker + licht)',
      'Draag zwart en wit met vertrouwen',
      'Mix gedurfde kleuren (navy + rood, groen + roze)',
      'Ga voor statement pieces in contrasterende tinten'
    ],
    dont: [
      'Vermijd te veel tonal dressing (saai voor jouw contrast)',
      'Geen overdaad aan neutrale tinten (beige, taupe)',
      'Skip all-grey of all-beige outfits'
    ],
    why: 'Jouw natuurlijke contrast (bv. donker haar + lichte huid) vraagt om kleurcombinaties die dat reflecteren. Zachte, tonal looks maken je vlak.',
    visualHint: '⚡ Denk aan: zwart-wit foto, sterke grafische prints'
  },

  medium: {
    label: 'Medium Contrast',
    betekent: 'Je huid, haar en ogen hebben een gemiddeld verschil in lichtheid. Je kunt zowel contrast als tonal dragen.',
    voorbeelden: [
      'Navy met beige',
      'Donkergroen met camel',
      'Grijs met wit',
      'Bruin met crème'
    ],
    do: [
      'Mix medium contrasten (donkerblauw + beige)',
      'Draag tonal outfits met één contrastpunt',
      'Ga voor subtiele color blocking',
      'Experimenteer met beide stijlen'
    ],
    dont: [
      'Vermijd te extreme contrasten (kan overweldigend zijn)',
      'Geen volledig tonal zonder accent (te vlak)'
    ],
    why: 'Je hebt de luxe van flexibiliteit. Je kunt zowel contrast als tonal dragen, zolang je een balans houdt.',
    visualHint: '🎨 Denk aan: harmonieuze kleurcombinaties met subtiel accent'
  },

  laag: {
    label: 'Laag Contrast',
    betekent: 'Je huid, haar en ogen hebben weinig verschil in lichtheid. Zachte, harmonische kleuren staan je het beste.',
    voorbeelden: [
      'Beige met camel',
      'Grijs met lichtgrijs',
      'Oudroze met lichtroze',
      'Zachtblauw met wit'
    ],
    do: [
      'Kies tonal dressing (zelfde kleurenfamilie)',
      'Draag zachte, harmonische combinaties',
      'Ga voor ton-sur-ton looks',
      'Mix verschillende tinten van dezelfde kleur'
    ],
    dont: [
      'Vermijd harde contrasten (zwart + wit)',
      'Geen te donkere kleuren naast je gezicht',
      'Skip felle, schreeuwende kleuren'
    ],
    why: 'Jouw zachte, harmonieuze coloring wordt overspoeld door harde contrasten. Tonal looks laten je elegantie en verfijning zien.',
    visualHint: '🕊️ Denk aan: zachte kleurovergangen, ombre effects, monochrome looks'
  }
};

// ==========================================
// CHROMA (SATURATION) EXPLANATIONS
// ==========================================

export const CHROMA_EXPLANATIONS: Record<string, StyleDNAExplanation> = {
  gedurfd: {
    label: 'Gedurfde Kleuren',
    betekent: 'Jouw coloring kan hoog verzadigde, heldere kleuren aan. Je straalt in bold statement pieces.',
    voorbeelden: [
      'Felrood',
      'Koningsblauw',
      'Smaragdgroen',
      'Fuchsia',
      'Elektrischblauw'
    ],
    do: [
      'Durf heldere, verzadigde kleuren',
      'Draag statement pieces in bold tinten',
      'Ga voor kleurrijke prints en patronen',
      'Mix meerdere felle kleuren'
    ],
    dont: [
      'Vermijd te veel gedempte pastels (verdrinken je)',
      'Geen overdaad aan neutrale tinten',
      'Skip muffe, doffe kleuren'
    ],
    why: 'Jouw heldere coloring vraagt om kleuren met dezelfde intensiteit. Zachte tinten maken je dof.',
    visualHint: '🔥 Denk aan: juwelen, felle bloemen, levendige kunst'
  },

  gemiddeld: {
    label: 'Gemiddelde Verzadiging',
    betekent: 'Je komt het best tot je recht in medium verzadigde kleuren. Niet te fel, niet te zacht.',
    voorbeelden: [
      'Warm blauw',
      'Zachtgroen',
      'Dofrood',
      'Medium grijs'
    ],
    do: [
      'Kies medium verzadigde kleuren',
      'Draag kleuren met een beetje grijs ondertoon',
      'Ga voor gedempte varianten van felle kleuren'
    ],
    dont: [
      'Vermijd neon of super felle tinten',
      'Geen volledig gedempte pastels'
    ],
    why: 'Te felle kleuren zijn overweldigend, te zachte zijn saai. Medium verzadiging is jouw sweet spot.',
    visualHint: '🎨 Denk aan: gedempte regenboog, vintage tinten'
  },

  zacht: {
    label: 'Zachte Kleuren',
    betekent: 'Jouw zachte coloring bloeit op in gedempte, elegante tinten. Denk aan pastels en neutrale tinten.',
    voorbeelden: [
      'Lavendel',
      'Mintgroen',
      'Oudroze',
      'Zachtblauw',
      'Lichtgrijs'
    ],
    do: [
      'Kies zachte pastels en neutrale tinten',
      'Draag gedempte kleuren met grijs ondertoon',
      'Ga voor elegante, subtiele looks',
      'Mix zachte tinten voor harmonie'
    ],
    dont: [
      'Vermijd neon of felle kleuren (te schel)',
      'Geen harde, verzadigde tinten',
      'Skip te veel zwart (te hard)'
    ],
    why: 'Jouw zachte, subtiele coloring wordt overspoeld door felle kleuren. Gedempte tinten laten je elegantie stralen.',
    visualHint: '🌸 Denk aan: waterverfverf, zachte pastels, subtiele elegantie'
  }
};

// ==========================================
// TEMPERATURE (UNDERTONE) EXPLANATIONS
// ==========================================

export const TEMPERATURE_EXPLANATIONS: Record<string, StyleDNAExplanation> = {
  warm: {
    label: 'Warme Ondertoon',
    betekent: 'Je huid heeft een gouden, gele of perzik ondertoon. Warme kleuren laten je stralen.',
    voorbeelden: [
      'Goud',
      'Camel',
      'Warm groen',
      'Koraalrood',
      'Oranje',
      'Warm bruin'
    ],
    do: [
      'Kies kleuren met gouden ondertonen',
      'Draag aardse, warme tinten',
      'Ga voor goud of roségoud sieraden',
      'Kies ivoorwit of crème (niet zuiver wit)'
    ],
    dont: [
      'Vermijd koele tinten (ijsblauw, fuchsia)',
      'Geen zilver sieraden (te koel)',
      'Skip zuiver wit (te hard, kies crème)'
    ],
    why: 'Warme kleuren versterken de gouden gloed in je huid. Koele kleuren maken je grauw en vermoeid.',
    visualHint: '☀️ Test: Goud sieraden staan je beter dan zilver'
  },

  koel: {
    label: 'Koele Ondertoon',
    betekent: 'Je huid heeft een roze, rode of blauwe ondertoon. Koele kleuren flatteren je.',
    voorbeelden: [
      'Zilver',
      'Navy',
      'IJsblauw',
      'Fuchsia',
      'Smaragdgroen',
      'Zuiver wit'
    ],
    do: [
      'Kies kleuren met blauwe ondertonen',
      'Draag koele tinten blauw, groen, roze',
      'Ga voor zilver of witgoud sieraden',
      'Kies zuiver wit (niet crème)'
    ],
    dont: [
      'Vermijd warme tinten (oranje, camel, mosterdgeel)',
      'Geen goud sieraden (te warm)',
      'Skip ivoorwit (te warm, kies zuiver wit)'
    ],
    why: 'Koele kleuren harmoniseren met de roze/blauwe tint in je huid. Warme kleuren maken je geel of ziek.',
    visualHint: '❄️ Test: Zilver sieraden staan je beter dan goud'
  },

  neutraal: {
    label: 'Neutrale Ondertoon',
    betekent: 'Je huid heeft zowel warme als koele ondertonen. Je hebt geluk: je kunt bijna alles dragen!',
    voorbeelden: [
      'Jade groen',
      'Zachtroze',
      'Turquoise',
      'Paars',
      'Bijna alle kleuren'
    ],
    do: [
      'Experimenteer met zowel warme als koele kleuren',
      'Draag balanced tinten (jade, turquoise)',
      'Mix goud en zilver sieraden',
      'Ga voor kleuren die tussen warm en koel zitten'
    ],
    dont: [
      'Vermijd extreme warme OF koele tinten (kan eenzijdig zijn)'
    ],
    why: 'Je hebt de luxe van flexibiliteit. Focus op wat je persoonlijk mooi vindt en bij je stijl past.',
    visualHint: '🎨 Test: Zowel goud als zilver staat je goed'
  }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get explanation for a given style DNA attribute
 */
export function getStyleDNAExplanation(
  attribute: 'season' | 'contrast' | 'chroma' | 'temperature',
  value: string
): StyleDNAExplanation | null {
  const normalizedValue = value.toLowerCase();

  switch (attribute) {
    case 'season':
      return SEASON_EXPLANATIONS[normalizedValue] || null;
    case 'contrast':
      return CONTRAST_EXPLANATIONS[normalizedValue] || null;
    case 'chroma':
      return CHROMA_EXPLANATIONS[normalizedValue] || null;
    case 'temperature':
      return TEMPERATURE_EXPLANATIONS[normalizedValue] || null;
    default:
      return null;
  }
}

/**
 * Get quick tip for a style DNA value (one-liner)
 */
export function getQuickTip(attribute: string, value: string): string {
  const explanation = getStyleDNAExplanation(attribute as any, value);
  if (!explanation) return '';

  // Return first "do" item as quick tip
  return explanation.do[0] || explanation.betekent;
}

/**
 * Get shopping guidance for complete profile
 */
export interface ShoppingGuidance {
  musthaves: string[];
  avoid: string[];
  styling_tips: string[];
}

export function getShoppingGuidance(
  season: string,
  contrast: string,
  chroma: string
): ShoppingGuidance {
  const seasonExpl = getStyleDNAExplanation('season', season);
  const contrastExpl = getStyleDNAExplanation('contrast', contrast);
  const chromaExpl = getStyleDNAExplanation('chroma', chroma);

  const musthaves: string[] = [];
  const avoid: string[] = [];
  const styling_tips: string[] = [];

  if (seasonExpl) {
    musthaves.push(...seasonExpl.voorbeelden.slice(0, 3));
    avoid.push(...seasonExpl.dont.slice(0, 2));
    styling_tips.push(seasonExpl.do[0]);
  }

  if (contrastExpl) {
    styling_tips.push(contrastExpl.do[0]);
  }

  if (chromaExpl) {
    styling_tips.push(chromaExpl.do[0]);
  }

  return {
    musthaves: [...new Set(musthaves)], // Remove duplicates
    avoid: [...new Set(avoid)],
    styling_tips: [...new Set(styling_tips)]
  };
}
