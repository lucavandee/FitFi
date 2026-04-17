export interface ColorHarmonyRules {
  complementary: Record<string, string[]>;
  analogous: Record<string, string[]>;
  neutrals: string[];
  warm: string[];
  cool: string[];
}

export const COLOR_HARMONY_RULES: ColorHarmonyRules = {
  complementary: {
    blauw: ['oranje', 'roest', 'terracotta', 'koraal'],
    navy: ['oranje', 'koraal', 'cognac'],
    rood: ['groen', 'olijf', 'sage', 'forest'],
    bordeaux: ['groen', 'olijf', 'sage'],
    burgundy: ['groen', 'olijf', 'sage'],
    roze: ['groen', 'olijf', 'sage'],
    geel: ['paars', 'lavendel', 'pruim'],
    mosterd: ['paars', 'pruim', 'navy'],
    oranje: ['blauw', 'navy', 'teal'],
    groen: ['rood', 'bordeaux', 'roze'],
    blue: ['orange', 'rust', 'terracotta'],
    red: ['green', 'olive', 'sage'],
    pink: ['green', 'olive'],
    green: ['red', 'burgundy', 'pink'],
    orange: ['blue', 'navy'],
  },

  analogous: {
    blauw: ['navy', 'kobalt', 'teal'],
    navy: ['blauw', 'donkerblauw'],
    rood: ['roze', 'bordeaux', 'oranje', 'koraal'],
    bordeaux: ['rood', 'wijn'],
    roze: ['rood', 'koraal'],
    geel: ['mosterd', 'oranje'],
    oranje: ['rood', 'koraal', 'geel'],
    groen: ['olijf', 'teal', 'sage', 'khaki'],
    olijf: ['groen', 'khaki', 'bruin'],
    blue: ['navy', 'teal', 'cobalt'],
    red: ['pink', 'burgundy', 'orange'],
    green: ['olive', 'teal', 'sage'],
  },

  neutrals: [
    'zwart', 'black',
    'wit', 'white', 'off-white', 'ecru', 'crème',
    'grijs', 'grey', 'gray', 'antraciet', 'charcoal',
    'beige', 'sand', 'zand',
    'cream', 'ivory',
    'taupe', 'stone',
    'khaki',
    'navy', 'donkerblauw',
    'camel', 'cognac',
    'bruin', 'brown',
  ],

  warm: [
    'rood', 'red', 'oranje', 'orange', 'geel', 'yellow',
    'roze', 'pink', 'koraal', 'coral',
    'roest', 'rust', 'terracotta',
    'bordeaux', 'burgundy', 'wijn',
    'mosterd', 'mustard',
    'cognac', 'camel', 'bruin', 'brown',
    'cream', 'crème',
  ],

  cool: [
    'blauw', 'blue', 'groen', 'green',
    'teal', 'turquoise',
    'navy', 'donkerblauw',
    'kobalt', 'cobalt',
    'mint', 'sage', 'olijf', 'olive',
    'paars', 'purple', 'lavendel', 'lavender',
  ],
};

function normalizeColor(color: string): string {
  return color.toLowerCase().trim();
}

// Split a color string on whitespace, underscore and hyphen so "navy_blue"
// becomes ["navy", "blue"]. A substring check on the raw string would let
// "navajo_white" falsely match "navy" (and "tank" match "tan"); matching
// against tokens only — plus an exact-string fallback for entries that
// legitimately contain separators such as "off-white" — prevents that.
function colorTokens(color: string): string[] {
  return normalizeColor(color).split(/[\s_-]+/).filter(Boolean);
}

function matchesColorTerm(color: string, term: string): boolean {
  const c = normalizeColor(color);
  const t = normalizeColor(term);
  if (!t) return false;
  if (c === t) return true;
  return colorTokens(c).includes(t);
}

export function isNeutralColor(color: string): boolean {
  return COLOR_HARMONY_RULES.neutrals.some(x => matchesColorTerm(color, x));
}

export function isWarmColor(color: string): boolean {
  return COLOR_HARMONY_RULES.warm.some(x => matchesColorTerm(color, x));
}

export function isCoolColor(color: string): boolean {
  return COLOR_HARMONY_RULES.cool.some(x => matchesColorTerm(color, x));
}

function checkMap(c1: string, c2: string, map: Record<string, string[]>): boolean {
  for (const [base, targets] of Object.entries(map)) {
    if (matchesColorTerm(c1, base) && targets.some(t => matchesColorTerm(c2, t))) return true;
    if (matchesColorTerm(c2, base) && targets.some(t => matchesColorTerm(c1, t))) return true;
  }
  return false;
}

const TONAL_FAMILIES: string[][] = [
  ['blauw', 'blue', 'navy', 'donkerblauw', 'kobalt', 'cobalt', 'azuur', 'denim'],
  ['groen', 'green', 'olijf', 'olive', 'sage', 'mint', 'moss', 'khaki', 'forest'],
  ['rood', 'red', 'bordeaux', 'burgundy', 'wijn', 'wine'],
  ['bruin', 'brown', 'camel', 'cognac', 'chocolade', 'tan'],
  ['grijs', 'grey', 'gray', 'antraciet', 'charcoal'],
  ['roze', 'pink', 'blush', 'rose', 'mauve'],
  ['oranje', 'orange', 'koraal', 'coral', 'roest', 'rust', 'terracotta'],
  ['geel', 'yellow', 'mosterd', 'mustard'],
  ['paars', 'purple', 'lavendel', 'lavender', 'pruim'],
];

function areTonal(c1: string, c2: string): boolean {
  for (const family of TONAL_FAMILIES) {
    const c1InFamily = family.some(f => matchesColorTerm(c1, f));
    const c2InFamily = family.some(f => matchesColorTerm(c2, f));
    if (c1InFamily && c2InFamily) return true;
  }
  return false;
}

export function calculateColorHarmonyScore(color1: string, color2: string): number {
  const c1 = normalizeColor(color1);
  const c2 = normalizeColor(color2);

  if (c1 === c2) return 0.85;

  if (isNeutralColor(c1) || isNeutralColor(c2)) return 0.8;

  if ((matchesColorTerm(c1, 'zwart') && matchesColorTerm(c2, 'wit')) ||
      (matchesColorTerm(c1, 'wit') && matchesColorTerm(c2, 'zwart')) ||
      (matchesColorTerm(c1, 'black') && matchesColorTerm(c2, 'white')) ||
      (matchesColorTerm(c1, 'white') && matchesColorTerm(c2, 'black'))) {
    return 0.9;
  }

  if (areTonal(c1, c2)) return 0.85;

  if (checkMap(c1, c2, COLOR_HARMONY_RULES.analogous)) return 0.8;
  if (checkMap(c1, c2, COLOR_HARMONY_RULES.complementary)) return 0.7;

  if ((isWarmColor(c1) && isWarmColor(c2)) || (isCoolColor(c1) && isCoolColor(c2))) return 0.6;

  return 0.35;
}

export function calculateOutfitColorHarmony(productColors: string[][]): number {
  if (productColors.length < 2) return 1.0;

  const allColors = productColors.flat().filter(c => c && c.trim() !== '');
  if (allColors.length === 0) return 0.5;

  let totalScore = 0;
  let pairCount = 0;

  for (let i = 0; i < allColors.length; i++) {
    for (let j = i + 1; j < allColors.length; j++) {
      totalScore += calculateColorHarmonyScore(allColors[i], allColors[j]);
      pairCount++;
    }
  }

  return pairCount === 0 ? 0.5 : totalScore / pairCount;
}

export function suggestComplementaryColors(color: string): string[] {
  for (const [base, complements] of Object.entries(COLOR_HARMONY_RULES.complementary)) {
    if (matchesColorTerm(color, base)) return complements;
  }
  return COLOR_HARMONY_RULES.neutrals.slice(0, 5);
}

export function suggestAnalogousColors(color: string): string[] {
  for (const [base, similar] of Object.entries(COLOR_HARMONY_RULES.analogous)) {
    if (matchesColorTerm(color, base)) return similar;
  }
  return COLOR_HARMONY_RULES.neutrals.slice(0, 5);
}

export function getColorPaletteRecommendation(productColors: string[]): {
  complementary: string[];
  analogous: string[];
  neutrals: string[];
} {
  if (!productColors || productColors.length === 0) {
    return { complementary: [], analogous: [], neutrals: COLOR_HARMONY_RULES.neutrals };
  }
  return {
    complementary: suggestComplementaryColors(productColors[0]),
    analogous: suggestAnalogousColors(productColors[0]),
    neutrals: COLOR_HARMONY_RULES.neutrals,
  };
}
