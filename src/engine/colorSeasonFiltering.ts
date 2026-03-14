/**
 * Color Season Filtering Logic
 *
 * P1.2 fix: Dit bestand leidt nu zijn kleurdata af van colorPalettes.ts (single source of truth).
 * De string-gebaseerde lijsten worden automatisch gegenereerd uit de hex-gebaseerde paletten.
 *
 * Filters products based on user's color season analysis (Spring/Summer/Autumn/Winter).
 * Prevents mismatches like "black leather jacket in Light Neutral outfit".
 */

import { Product } from './types';
import { ColorProfile } from '@/context/UserContext';
import { COLOR_PALETTES, type ColorSwatch } from '@/data/colorPalettes';

/**
 * Derive string-based color names from the canonical hex-based palettes.
 * This ensures colorSeasonFiltering and colorPalettes stay in sync.
 */
function deriveSeasonStrings(seasonKey: string): {
  recommended: string[];
  avoid: string[];
  neutrals: string[];
} {
  const palette = COLOR_PALETTES[seasonKey];
  if (!palette) return { recommended: [], avoid: [], neutrals: [] };

  const toNames = (swatches: ColorSwatch[]) =>
    swatches.map(s => s.name.toLowerCase());

  return {
    recommended: toNames(palette.doColors),
    avoid: toNames(palette.dontColors),
    neutrals: toNames(palette.colors.filter(c => c.category === 'neutraal')),
  };
}

/**
 * Color palettes for each season — derived from colorPalettes.ts (single source of truth)
 * Extended with common string aliases for robust product-color matching.
 */
export const COLOR_SEASON_PALETTES = {
  lente: {
    ...deriveSeasonStrings('lente'),
    // Uitgebreide aliassen voor robuuste product-matching
    recommended: [
      ...deriveSeasonStrings('lente').recommended,
      'wit', 'beige', 'cream', 'ivory', 'sand', 'camel',
      'peach', 'coral', 'salmon', 'apricot',
      'mint', 'sage', 'warm taupe', 'warm beige',
      'light blue', 'turquoise', 'warm yellow', 'gold',
      'warm pink', 'rose pink'
    ],
    avoid: [
      ...deriveSeasonStrings('lente').avoid,
      'zwart', 'black', 'charcoal', 'dark grey',
      'burgundy', 'wine', 'navy', 'dark blue',
      'forest green', 'dark green', 'purple', 'deep purple'
    ],
  },

  zomer: {
    ...deriveSeasonStrings('zomer'),
    recommended: [
      ...deriveSeasonStrings('zomer').recommended,
      'soft white', 'off-white', 'grey', 'light grey',
      'powder blue', 'sky blue', 'periwinkle',
      'lavender', 'lilac', 'soft purple',
      'rose pink', 'mauve', 'dusty rose',
      'mint', 'sage green', 'seafoam',
      'cool taupe', 'dove grey', 'denim blue', 'chambray'
    ],
    avoid: [
      ...deriveSeasonStrings('zomer').avoid,
      'orange', 'rust', 'warm yellow', 'gold',
      'olive green', 'tomato red', 'warm brown'
    ],
  },

  herfst: {
    ...deriveSeasonStrings('herfst'),
    recommended: [
      ...deriveSeasonStrings('herfst').recommended,
      'rust', 'terracotta', 'brick red', 'burnt orange',
      'warm brown', 'chocolate', 'camel', 'cognac',
      'olive green', 'moss green', 'forest green',
      'mustard', 'gold', 'amber', 'warm beige', 'khaki',
      'burgundy', 'wine', 'teal', 'petrol blue'
    ],
    avoid: [
      ...deriveSeasonStrings('herfst').avoid,
      'pure white', 'icy blue', 'pastel blue',
      'pink', 'baby pink', 'lavender', 'purple',
      'grey', 'cool grey'
    ],
  },

  winter: {
    ...deriveSeasonStrings('winter'),
    recommended: [
      ...deriveSeasonStrings('winter').recommended,
      'zwart', 'black', 'pure white', 'bright white',
      'navy', 'royal blue', 'cobalt',
      'emerald green', 'pine green',
      'magenta', 'fuchsia', 'hot pink',
      'ruby red', 'true red', 'purple', 'violet',
      'icy blue', 'icy pink', 'icy yellow',
      'charcoal', 'dark grey', 'silver'
    ],
    avoid: [
      ...deriveSeasonStrings('winter').avoid,
      'orange', 'rust', 'warm yellow', 'gold',
      'olive green', 'warm brown', 'camel',
      'peach', 'coral'
    ],
  }
};

/**
 * Additional filtering based on color value (light/medium/dark)
 */
export const VALUE_FILTERS = {
  licht: {
    recommended: ['light', 'pastel', 'soft', 'pale'],
    avoid: ['dark', 'deep', 'black', 'charcoal']
  },
  medium: {
    recommended: ['medium', 'mid-tone'],
    avoid: [] // Medium can wear most values
  },
  donker: {
    recommended: ['dark', 'deep', 'rich'],
    avoid: ['pale', 'pastel', 'very light']
  }
};

/**
 * Check if a product color matches the user's color season
 *
 * @param productColor - Color tag from product (e.g., "black", "navy", "beige")
 * @param colorProfile - User's color profile from quiz
 * @returns Match score (0-1) and boolean isAllowed
 */
export function matchesColorSeason(
  productColor: string,
  colorProfile: ColorProfile
): { score: number; isAllowed: boolean; reason?: string } {
  if (!productColor || !colorProfile || !colorProfile.season) {
    return { score: 0.5, isAllowed: true }; // Neutral if no data
  }

  const season = colorProfile.season;
  const palette = COLOR_SEASON_PALETTES[season];

  if (!palette) {
    console.warn('[ColorSeasonFiltering] Unknown season:', season);
    return { score: 0.5, isAllowed: true };
  }

  const colorLower = productColor.toLowerCase().trim();

  // Check if color is in avoid list (HARD BLOCK)
  const isAvoided = palette.avoid.some(avoidColor =>
    colorLower.includes(avoidColor.toLowerCase()) ||
    avoidColor.toLowerCase().includes(colorLower)
  );

  if (isAvoided) {
    return {
      score: 0,
      isAllowed: false,
      reason: `${productColor} is not flattering for ${season} season (${colorProfile.paletteName})`
    };
  }

  // Check if color is recommended (HIGH SCORE)
  const isRecommended = palette.recommended.some(recColor =>
    colorLower.includes(recColor.toLowerCase()) ||
    recColor.toLowerCase().includes(colorLower)
  );

  if (isRecommended) {
    return {
      score: 1.0,
      isAllowed: true,
      reason: `${productColor} is perfect for ${season} season`
    };
  }

  // Check if it's a neutral (MEDIUM-HIGH SCORE)
  const isNeutral = palette.neutrals.some(neutralColor =>
    colorLower.includes(neutralColor.toLowerCase()) ||
    neutralColor.toLowerCase().includes(colorLower)
  );

  if (isNeutral) {
    return {
      score: 0.8,
      isAllowed: true,
      reason: `${productColor} is a good neutral for ${season} season`
    };
  }

  // Unknown color - allow but give medium-low score
  return {
    score: 0.4,
    isAllowed: true,
    reason: `${productColor} compatibility unknown for ${season} season`
  };
}

/**
 * Filter products by color season compatibility
 *
 * @param products - Array of products to filter
 * @param colorProfile - User's color profile
 * @param strictMode - If true, blocks all non-compatible colors. If false, only scores them lower.
 * @returns Filtered products with colorSeasonScore added
 */
export function filterProductsByColorSeason(
  products: Product[],
  colorProfile?: ColorProfile,
  strictMode: boolean = true
): (Product & { colorSeasonScore?: number })[] {
  if (!colorProfile || !colorProfile.season) {
    console.log('[ColorSeasonFiltering] No color profile - skipping filtering');
    return products;
  }

  console.log(`[ColorSeasonFiltering] Filtering ${products.length} products for ${colorProfile.season} season (${colorProfile.paletteName})`);

  const filteredProducts = products
    .map(product => {
      // Get product colors (check multiple possible fields)
      const colors = product.colors || (product.color ? [product.color] : []);

      if (colors.length === 0) {
        // No color data - allow but score low
        return {
          ...product,
          colorSeasonScore: 0.3
        };
      }

      // Check each color and take the best match
      let bestScore = 0;
      let isBlocked = false;
      let blockReason = '';

      colors.forEach(color => {
        const match = matchesColorSeason(color, colorProfile);

        if (!match.isAllowed) {
          isBlocked = true;
          blockReason = match.reason || 'Color not compatible';
        }

        if (match.score > bestScore) {
          bestScore = match.score;
        }
      });

      // In strict mode, block products with non-compatible colors
      if (strictMode && isBlocked) {
        console.log(`[ColorSeasonFiltering] ❌ Blocked: ${product.name} - ${blockReason}`);
        return null; // Filter out
      }

      return {
        ...product,
        colorSeasonScore: bestScore
      };
    })
    .filter((p): p is Product & { colorSeasonScore?: number } => p !== null);

  console.log(`[ColorSeasonFiltering] Result: ${filteredProducts.length}/${products.length} products passed color season filtering`);

  // Log some examples
  const blocked = products.length - filteredProducts.length;
  if (blocked > 0) {
    console.log(`[ColorSeasonFiltering] Blocked ${blocked} incompatible items for ${colorProfile.season} season`);
  }

  return filteredProducts;
}

/**
 * Get color season recommendations as human-readable strings
 *
 * @param season - Color season
 * @returns Object with recommendations
 */
export function getColorSeasonGuidance(season: ColorProfile['season']): {
  bestColors: string[];
  avoidColors: string[];
  description: string;
} {
  const palette = COLOR_SEASON_PALETTES[season];

  if (!palette) {
    return {
      bestColors: [],
      avoidColors: [],
      description: 'Unknown season'
    };
  }

  const descriptions = {
    lente: 'Light, warm, and bright colors that reflect spring sunshine',
    zomer: 'Light, cool, and soft colors with a gentle, muted quality',
    herfst: 'Deep, warm, and rich colors inspired by autumn leaves',
    winter: 'Deep, cool, clear colors OR icy pastels with high contrast'
  };

  return {
    bestColors: palette.recommended.slice(0, 10), // Top 10
    avoidColors: palette.avoid,
    description: descriptions[season]
  };
}

/**
 * Score a product's overall color compatibility
 * Takes into account all color fields and returns aggregated score
 *
 * @param product - Product to score
 * @param colorProfile - User's color profile
 * @returns Aggregated color compatibility score (0-1)
 */
export function scoreProductColorCompatibility(
  product: Product,
  colorProfile?: ColorProfile
): number {
  if (!colorProfile) return 0.5; // Neutral

  const colors = product.colors || (product.color ? [product.color] : []);

  if (colors.length === 0) return 0.3; // No color data = low score

  // Score each color and average
  const scores = colors.map(color => matchesColorSeason(color, colorProfile).score);
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  return avgScore;
}
