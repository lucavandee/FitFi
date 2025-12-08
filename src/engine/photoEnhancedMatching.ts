import type { Product } from './types';
import type { PhotoAnalysisResult } from '@/services/nova/photoAnalysisService';

/**
 * Color harmony scoring based on photo analysis
 * Uses detected colors from user photo to enhance product matching
 */

// Color harmony rules: which colors work well together
const COLOR_HARMONY_MAP: Record<string, string[]> = {
  // Neutrals go with everything
  'black': ['white', 'gray', 'beige', 'navy', 'burgundy', 'forest', 'camel'],
  'white': ['black', 'navy', 'gray', 'beige', 'red', 'blue', 'green'],
  'gray': ['black', 'white', 'navy', 'burgundy', 'yellow', 'pink'],
  'beige': ['white', 'brown', 'camel', 'olive', 'navy', 'black'],
  'navy': ['white', 'beige', 'gray', 'red', 'pink', 'camel'],

  // Warm tones
  'red': ['black', 'white', 'navy', 'gray', 'beige', 'gold'],
  'orange': ['navy', 'teal', 'brown', 'cream', 'olive'],
  'yellow': ['gray', 'navy', 'white', 'purple', 'teal'],
  'brown': ['beige', 'cream', 'olive', 'burgundy', 'camel'],
  'burgundy': ['gray', 'navy', 'beige', 'forest', 'camel'],

  // Cool tones
  'blue': ['white', 'gray', 'navy', 'beige', 'yellow', 'pink'],
  'teal': ['coral', 'beige', 'gray', 'brown', 'white'],
  'purple': ['gray', 'white', 'yellow', 'green', 'silver'],
  'pink': ['gray', 'navy', 'white', 'olive', 'black'],

  // Earth tones
  'green': ['beige', 'brown', 'navy', 'gray', 'white'],
  'olive': ['beige', 'brown', 'burgundy', 'navy', 'cream'],
  'camel': ['navy', 'burgundy', 'forest', 'black', 'white'],
  'forest': ['beige', 'burgundy', 'camel', 'gray', 'white'],
};

// Skin tone color recommendations
const SKIN_TONE_COLORS: Record<string, {
  best: string[];
  good: string[];
  avoid: string[];
}> = {
  'warm': {
    best: ['coral', 'peach', 'olive', 'orange', 'gold', 'brown', 'camel'],
    good: ['red', 'yellow', 'beige', 'burgundy', 'forest'],
    avoid: ['icy blue', 'pure white', 'black']
  },
  'cool': {
    best: ['navy', 'royal blue', 'emerald', 'purple', 'pink', 'gray'],
    good: ['white', 'black', 'burgundy', 'teal', 'silver'],
    avoid: ['orange', 'gold', 'brown']
  },
  'neutral': {
    best: ['teal', 'jade', 'plum', 'soft pink', 'dusty rose'],
    good: ['navy', 'gray', 'beige', 'olive', 'burgundy'],
    avoid: []
  }
};

/**
 * Extract dominant undertone from detected colors
 */
function detectUndertone(colors: string[]): 'warm' | 'cool' | 'neutral' {
  const warmColors = ['orange', 'yellow', 'gold', 'peach', 'coral', 'brown', 'camel'];
  const coolColors = ['blue', 'purple', 'pink', 'gray', 'silver', 'teal'];

  let warmScore = 0;
  let coolScore = 0;

  colors.forEach(color => {
    const normalized = color.toLowerCase();
    if (warmColors.some(w => normalized.includes(w))) warmScore++;
    if (coolColors.some(c => normalized.includes(c))) coolScore++;
  });

  if (Math.abs(warmScore - coolScore) <= 1) return 'neutral';
  return warmScore > coolScore ? 'warm' : 'cool';
}

/**
 * Normalize color name for matching
 */
function normalizeColor(color: string): string {
  const normalized = color.toLowerCase().trim();

  // Map common variations to base colors
  const colorMap: Record<string, string> = {
    'zwart': 'black',
    'wit': 'white',
    'grijs': 'gray',
    'blauw': 'blue',
    'rood': 'red',
    'groen': 'green',
    'geel': 'yellow',
    'bruin': 'brown',
    'beige': 'beige',
    'roze': 'pink',
    'paars': 'purple',
    'oranje': 'orange',

    // Variations
    'dark blue': 'navy',
    'light blue': 'blue',
    'royal blue': 'blue',
    'sky blue': 'blue',
    'dark green': 'forest',
    'light green': 'green',
    'olive green': 'olive',
    'dark red': 'burgundy',
    'wine red': 'burgundy',
    'light pink': 'pink',
    'hot pink': 'pink',
  };

  return colorMap[normalized] || normalized;
}

/**
 * Calculate color harmony score between two colors (0-100)
 */
export function calculateColorHarmony(color1: string, color2: string): number {
  const normalized1 = normalizeColor(color1);
  const normalized2 = normalizeColor(color2);

  // Same color = perfect match
  if (normalized1 === normalized2) return 100;

  // Check harmony map
  const harmonious = COLOR_HARMONY_MAP[normalized1] || [];
  if (harmonious.includes(normalized2)) return 85;

  // Check reverse direction
  const reverseHarmonious = COLOR_HARMONY_MAP[normalized2] || [];
  if (reverseHarmonious.includes(normalized1)) return 85;

  // Neutrals are always safe (lower score but not bad)
  const neutrals = ['black', 'white', 'gray', 'beige', 'navy'];
  if (neutrals.includes(normalized1) || neutrals.includes(normalized2)) {
    return 70;
  }

  // No explicit harmony = neutral/unknown
  return 50;
}

/**
 * Score product color compatibility with user's detected colors
 */
export function scoreColorCompatibility(
  productColors: string[],
  userColors: string[],
  undertone: 'warm' | 'cool' | 'neutral'
): number {
  if (!productColors.length || !userColors.length) return 60; // Neutral score

  let totalScore = 0;
  let comparisons = 0;

  // Compare each product color with user colors
  productColors.forEach(productColor => {
    userColors.forEach(userColor => {
      totalScore += calculateColorHarmony(productColor, userColor);
      comparisons++;
    });
  });

  const baseScore = comparisons > 0 ? totalScore / comparisons : 60;

  // Apply skin tone boost
  const skinToneRecommendations = SKIN_TONE_COLORS[undertone];
  let skinToneBoost = 0;

  productColors.forEach(color => {
    const normalized = normalizeColor(color);
    if (skinToneRecommendations.best.includes(normalized)) {
      skinToneBoost += 10;
    } else if (skinToneRecommendations.good.includes(normalized)) {
      skinToneBoost += 5;
    } else if (skinToneRecommendations.avoid.includes(normalized)) {
      skinToneBoost -= 10;
    }
  });

  // Cap boost at reasonable level
  const finalScore = Math.max(0, Math.min(100, baseScore + skinToneBoost));

  return Math.round(finalScore);
}

/**
 * Enhance product matching with photo analysis
 */
export function enhanceProductsWithPhotoAnalysis(
  products: Product[],
  photoAnalysis: PhotoAnalysisResult | null
): Product[] {
  if (!photoAnalysis || !photoAnalysis.detected_colors || photoAnalysis.detected_colors.length === 0) {
    // No photo analysis available - return products unchanged
    return products;
  }

  const userColors = photoAnalysis.detected_colors;
  const undertone = detectUndertone(userColors);

  console.log(`🎨 [Photo Enhancement] User colors: ${userColors.join(', ')}`);
  console.log(`🎨 [Photo Enhancement] Detected undertone: ${undertone}`);

  // Enhance each product with color compatibility score
  return products.map(product => {
    // Get product colors (from various possible fields)
    const productColors = product.colors || product.color ? [product.color || ''].filter(Boolean) : [];

    if (productColors.length === 0) {
      // No color info = neutral score
      return {
        ...product,
        photoColorScore: 60,
        photoEnhanced: false
      };
    }

    const colorScore = scoreColorCompatibility(productColors, userColors, undertone);

    // Boost the product's overall match score based on color compatibility
    const originalScore = product.matchScore || 50;
    const enhancedScore = Math.round(originalScore * 0.6 + colorScore * 0.4);

    return {
      ...product,
      matchScore: enhancedScore,
      photoColorScore: colorScore,
      photoEnhanced: true,
      undertoneMatch: undertone
    };
  });
}

/**
 * Get color recommendations based on photo analysis
 */
export function getColorRecommendations(
  photoAnalysis: PhotoAnalysisResult
): {
  bestColors: string[];
  goodColors: string[];
  colorsToAvoid: string[];
  undertone: string;
  explanation: string;
} {
  const userColors = photoAnalysis.detected_colors || [];
  const undertone = detectUndertone(userColors);
  const recommendations = SKIN_TONE_COLORS[undertone];

  const explanations: Record<string, string> = {
    'warm': 'Je warme ondertoon komt het beste tot zijn recht met aardse en gouden tinten. Vermijd koele, ijzige kleuren.',
    'cool': 'Je koele ondertoon straalt in heldere, koele tinten zoals blauw en paars. Vermijd te warme oranje- en bruintinten.',
    'neutral': 'Je neutrale ondertoon geeft je veel flexibiliteit! Bijna alle kleuren staan je goed, met name gedempte tinten.'
  };

  return {
    bestColors: recommendations.best,
    goodColors: recommendations.good,
    colorsToAvoid: recommendations.avoid,
    undertone,
    explanation: explanations[undertone]
  };
}

/**
 * Filter products that clash with user's color profile
 */
export function filterColorClashes(
  products: Product[],
  photoAnalysis: PhotoAnalysisResult,
  minScore: number = 40
): Product[] {
  if (!photoAnalysis?.detected_colors?.length) {
    return products; // No filtering if no analysis
  }

  const userColors = photoAnalysis.detected_colors;
  const undertone = detectUndertone(userColors);

  return products.filter(product => {
    const productColors = product.colors || (product.color ? [product.color] : []);

    if (productColors.length === 0) return true; // Keep if no color info

    const score = scoreColorCompatibility(productColors, userColors, undertone);
    return score >= minScore;
  });
}
