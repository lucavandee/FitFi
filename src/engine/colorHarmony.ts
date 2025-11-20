/**
 * Color Harmony Engine
 * Implements color theory rules for better outfit matching
 */

export interface ColorHarmonyRules {
  complementary: Record<string, string[]>;
  analogous: Record<string, string[]>;
  triadic: Record<string, string[]>;
  neutrals: string[];
  warm: string[];
  cool: string[];
}

/**
 * Color theory rules database
 * Based on traditional color wheel principles
 */
export const COLOR_HARMONY_RULES: ColorHarmonyRules = {
  // Complementary colors (opposite on color wheel) - create high contrast
  complementary: {
    blue: ['orange', 'rust', 'copper', 'terracotta', 'burnt orange'],
    navy: ['orange', 'coral', 'peach'],
    teal: ['coral', 'salmon', 'peach'],
    red: ['green', 'mint', 'olive', 'sage', 'forest'],
    burgundy: ['forest', 'hunter green', 'sage'],
    pink: ['green', 'olive', 'sage'],
    yellow: ['purple', 'lavender', 'plum', 'violet'],
    gold: ['purple', 'plum'],
    orange: ['blue', 'navy', 'teal'],
    green: ['red', 'burgundy', 'pink'],
    purple: ['yellow', 'gold', 'mustard']
  },

  // Analogous colors (adjacent on color wheel) - create subtle harmony
  analogous: {
    blue: ['teal', 'navy', 'cyan', 'turquoise', 'cobalt'],
    navy: ['blue', 'royal blue', 'midnight'],
    teal: ['blue', 'turquoise', 'aqua'],
    red: ['pink', 'burgundy', 'orange', 'coral'],
    burgundy: ['red', 'wine', 'maroon'],
    pink: ['red', 'coral', 'rose'],
    yellow: ['gold', 'mustard', 'orange', 'lemon'],
    gold: ['yellow', 'bronze', 'copper'],
    orange: ['red', 'coral', 'yellow', 'peach'],
    green: ['lime', 'olive', 'teal', 'sage', 'forest'],
    olive: ['green', 'khaki', 'tan'],
    purple: ['violet', 'plum', 'lavender', 'magenta']
  },

  // Triadic colors (equally spaced on color wheel) - vibrant but balanced
  triadic: {
    blue: ['red', 'yellow'],
    red: ['blue', 'yellow'],
    yellow: ['blue', 'red'],
    green: ['orange', 'purple'],
    orange: ['green', 'purple'],
    purple: ['green', 'orange']
  },

  // Neutral colors - go with everything
  neutrals: [
    'black',
    'white',
    'grey',
    'gray',
    'beige',
    'cream',
    'ivory',
    'tan',
    'khaki',
    'navy', // Navy is often considered a neutral
    'charcoal',
    'stone',
    'sand',
    'taupe',
    'ecru',
    'off-white'
  ],

  // Warm colors
  warm: [
    'red',
    'orange',
    'yellow',
    'pink',
    'coral',
    'peach',
    'rust',
    'terracotta',
    'burgundy',
    'gold',
    'bronze',
    'copper',
    'mustard',
    'warm white',
    'cream'
  ],

  // Cool colors
  cool: [
    'blue',
    'green',
    'purple',
    'teal',
    'turquoise',
    'navy',
    'violet',
    'lavender',
    'mint',
    'sage',
    'forest',
    'cobalt',
    'royal blue',
    'cool white',
    'ice blue'
  ]
};

/**
 * Normalize color name for matching
 */
function normalizeColor(color: string): string {
  return color.toLowerCase().trim();
}

/**
 * Check if color is neutral
 */
export function isNeutralColor(color: string): boolean {
  const normalized = normalizeColor(color);
  return COLOR_HARMONY_RULES.neutrals.some(neutral =>
    normalized.includes(neutral) || neutral.includes(normalized)
  );
}

/**
 * Check if color is warm
 */
export function isWarmColor(color: string): boolean {
  const normalized = normalizeColor(color);
  return COLOR_HARMONY_RULES.warm.some(warm =>
    normalized.includes(warm) || warm.includes(normalized)
  );
}

/**
 * Check if color is cool
 */
export function isCoolColor(color: string): boolean {
  const normalized = normalizeColor(color);
  return COLOR_HARMONY_RULES.cool.some(cool =>
    normalized.includes(cool) || cool.includes(normalized)
  );
}

/**
 * Calculate color harmony score between two colors
 * Returns 0-1 score where 1 = perfect harmony
 */
export function calculateColorHarmonyScore(
  color1: string,
  color2: string
): number {
  const c1 = normalizeColor(color1);
  const c2 = normalizeColor(color2);

  // Same color = moderate harmony (0.6)
  if (c1 === c2) {
    return 0.6;
  }

  let score = 0;

  // Neutrals go with everything (0.8)
  if (isNeutralColor(c1) || isNeutralColor(c2)) {
    score = 0.8;
  }
  // Black & white combination (0.9)
  else if (
    (c1.includes('black') && c2.includes('white')) ||
    (c1.includes('white') && c2.includes('black'))
  ) {
    score = 0.9;
  }
  // Complementary colors (0.7) - high contrast, sophisticated
  else if (checkComplementary(c1, c2)) {
    score = 0.7;
  }
  // Analogous colors (0.8) - subtle, harmonious
  else if (checkAnalogous(c1, c2)) {
    score = 0.8;
  }
  // Triadic colors (0.6) - vibrant but balanced
  else if (checkTriadic(c1, c2)) {
    score = 0.6;
  }
  // Same temperature (warm with warm, cool with cool) (0.5)
  else if (
    (isWarmColor(c1) && isWarmColor(c2)) ||
    (isCoolColor(c1) && isCoolColor(c2))
  ) {
    score = 0.5;
  }
  // No obvious harmony (0.3)
  else {
    score = 0.3;
  }

  return score;
}

/**
 * Check if colors are complementary
 */
function checkComplementary(c1: string, c2: string): boolean {
  for (const [base, complements] of Object.entries(COLOR_HARMONY_RULES.complementary)) {
    if (c1.includes(base) && complements.some(comp => c2.includes(comp))) {
      return true;
    }
    if (c2.includes(base) && complements.some(comp => c1.includes(comp))) {
      return true;
    }
  }
  return false;
}

/**
 * Check if colors are analogous
 */
function checkAnalogous(c1: string, c2: string): boolean {
  for (const [base, similar] of Object.entries(COLOR_HARMONY_RULES.analogous)) {
    if (c1.includes(base) && similar.some(sim => c2.includes(sim))) {
      return true;
    }
    if (c2.includes(base) && similar.some(sim => c1.includes(sim))) {
      return true;
    }
  }
  return false;
}

/**
 * Check if colors are triadic
 */
function checkTriadic(c1: string, c2: string): boolean {
  for (const [base, triads] of Object.entries(COLOR_HARMONY_RULES.triadic)) {
    if (c1.includes(base) && triads.some(tri => c2.includes(tri))) {
      return true;
    }
    if (c2.includes(base) && triads.some(tri => c1.includes(tri))) {
      return true;
    }
  }
  return false;
}

/**
 * Calculate overall color harmony for an outfit
 * Takes all product colors and calculates pairwise harmony
 */
export function calculateOutfitColorHarmony(
  productColors: string[][]
): number {
  if (productColors.length < 2) {
    return 1.0; // Single product = perfect harmony
  }

  // Flatten all colors
  const allColors = productColors.flat().filter(c => c && c.trim() !== '');

  if (allColors.length === 0) {
    return 0.5; // No color info = neutral score
  }

  // Calculate pairwise harmony
  let totalScore = 0;
  let pairCount = 0;

  for (let i = 0; i < allColors.length; i++) {
    for (let j = i + 1; j < allColors.length; j++) {
      totalScore += calculateColorHarmonyScore(allColors[i], allColors[j]);
      pairCount++;
    }
  }

  if (pairCount === 0) {
    return 0.5;
  }

  const avgScore = totalScore / pairCount;

  console.log(`[ColorHarmony] Outfit harmony: ${(avgScore * 100).toFixed(0)}% (${allColors.join(', ')})`);

  return avgScore;
}

/**
 * Suggest complementary colors for a given color
 */
export function suggestComplementaryColors(color: string): string[] {
  const normalized = normalizeColor(color);

  for (const [base, complements] of Object.entries(COLOR_HARMONY_RULES.complementary)) {
    if (normalized.includes(base)) {
      return complements;
    }
  }

  // If no match, suggest neutrals
  return COLOR_HARMONY_RULES.neutrals.slice(0, 5);
}

/**
 * Suggest analogous colors for a given color
 */
export function suggestAnalogousColors(color: string): string[] {
  const normalized = normalizeColor(color);

  for (const [base, similar] of Object.entries(COLOR_HARMONY_RULES.analogous)) {
    if (normalized.includes(base)) {
      return similar;
    }
  }

  // If no match, suggest neutrals
  return COLOR_HARMONY_RULES.neutrals.slice(0, 5);
}

/**
 * Get color palette recommendation for a product
 * Returns colors that would pair well with this product
 */
export function getColorPaletteRecommendation(
  productColors: string[]
): {
  complementary: string[];
  analogous: string[];
  neutrals: string[];
} {
  if (!productColors || productColors.length === 0) {
    return {
      complementary: [],
      analogous: [],
      neutrals: COLOR_HARMONY_RULES.neutrals
    };
  }

  const primaryColor = productColors[0];

  return {
    complementary: suggestComplementaryColors(primaryColor),
    analogous: suggestAnalogousColors(primaryColor),
    neutrals: COLOR_HARMONY_RULES.neutrals
  };
}
