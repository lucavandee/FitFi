import type { Outfit, Product } from './types';

/**
 * Occasion-Aware Matching Engine
 * Matches outfits to specific occasions based on formality, style, and appropriateness
 */

export type Occasion = 'work' | 'casual' | 'formal' | 'date' | 'party' | 'sports' | 'travel';

export const OCCASION_LABELS: Record<Occasion, { title: string; context: string }> = {
  work: { title: 'Kantoor', context: 'Zakelijke meeting of werkdag' },
  casual: { title: 'Casual dag uit', context: 'Lunch, koffie, boodschappen' },
  formal: { title: 'Formeel event', context: 'Gala, bruiloft, theater' },
  date: { title: 'Date', context: 'Restaurant, borrel of diner' },
  party: { title: 'Feest / uitgaan', context: 'Bar, club, avondje uit' },
  sports: { title: 'Sport / actief', context: 'Gym, hardlopen, workout' },
  travel: { title: 'Op reis', context: 'Vliegtuig, stadstrip, vakantie' }
};

export interface OccasionRules {
  requiredFormality: number; // 0-1, where 1 = most formal
  preferredStyles: string[];
  avoidStyles?: string[];
  colorRestrictions?: {
    avoid?: string[];
    prefer?: string[];
  };
  categoryPreferences?: {
    required?: string[];
    avoid?: string[];
    prefer?: string[];
  };
  formalityAdjustments?: Record<string, number>; // Category-specific formality boosts
}

/**
 * Occasion rules database
 */
export const OCCASION_RULES: Record<Occasion, OccasionRules> = {
  work: {
    requiredFormality: 0.7,
    preferredStyles: ['klassiek', 'minimal', 'sophisticated', 'elegant'],
    avoidStyles: ['streetstyle', 'sporty'],
    colorRestrictions: {
      avoid: ['neon', 'bright pink', 'hot pink', 'lime'],
      prefer: ['navy', 'black', 'grey', 'white', 'beige', 'burgundy', 'forest']
    },
    categoryPreferences: {
      avoid: ['athletic', 'sportswear'],
      prefer: ['blazer', 'trousers', 'blouse', 'shirt']
    },
    formalityAdjustments: {
      blazer: 0.3,
      jacket: 0.2,
      shirt: 0.15,
      dress: 0.2
    }
  },

  casual: {
    requiredFormality: 0.3,
    preferredStyles: ['casual_chic', 'streetstyle', 'urban', 'relaxed'],
    colorRestrictions: {
      prefer: ['any']
    },
    categoryPreferences: {
      prefer: ['jeans', 'sneakers', 't-shirt', 'sweater', 'hoodie']
    }
  },

  formal: {
    requiredFormality: 0.9,
    preferredStyles: ['klassiek', 'elegant', 'sophisticated'],
    avoidStyles: ['streetstyle', 'casual_chic', 'sporty'],
    colorRestrictions: {
      avoid: ['neon', 'bright'],
      prefer: ['black', 'navy', 'burgundy', 'forest', 'gold']
    },
    categoryPreferences: {
      required: ['dress'], // OR suit components
      avoid: ['sneakers', 'jeans', 't-shirt', 'hoodie']
    },
    formalityAdjustments: {
      dress: 0.4,
      suit: 0.4,
      blazer: 0.3,
      heels: 0.2
    }
  },

  date: {
    requiredFormality: 0.6,
    preferredStyles: ['romantic', 'elegant', 'casual_chic', 'sophisticated'],
    colorRestrictions: {
      prefer: ['red', 'burgundy', 'black', 'navy', 'rose', 'blush']
    },
    categoryPreferences: {
      prefer: ['dress', 'blouse', 'heels', 'accessories']
    },
    formalityAdjustments: {
      dress: 0.2,
      heels: 0.15
    }
  },

  party: {
    requiredFormality: 0.5,
    preferredStyles: ['bold', 'statement', 'trendy', 'festive'],
    colorRestrictions: {
      prefer: ['black', 'gold', 'silver', 'sequin', 'metallic']
    },
    categoryPreferences: {
      prefer: ['dress', 'heels', 'statement accessories', 'bold top']
    }
  },

  sports: {
    requiredFormality: 0.1,
    preferredStyles: ['athletic', 'sporty', 'functional'],
    categoryPreferences: {
      required: ['athletic wear', 'sneakers'],
      prefer: ['leggings', 'sports bra', 'tank top', 'shorts']
    },
    formalityAdjustments: {
      athletic: -0.3, // Lower formality is good
      sneakers: -0.2
    }
  },

  travel: {
    requiredFormality: 0.4,
    preferredStyles: ['comfortable', 'practical', 'casual_chic'],
    colorRestrictions: {
      prefer: ['navy', 'black', 'grey', 'versatile neutrals']
    },
    categoryPreferences: {
      prefer: ['comfortable', 'layerable', 'wrinkle-resistant'],
      avoid: ['delicate', 'dry-clean only']
    }
  }
};

/**
 * Calculate formality score for a product
 * Based on category, style, and attributes
 */
export function calculateProductFormality(product: Product): number {
  let formality = 0.5; // Base formality

  // Category-based formality
  const categoryFormality: Record<string, number> = {
    suit: 0.9,
    blazer: 0.8,
    jacket: 0.7,
    dress: 0.7,
    shirt: 0.6,
    blouse: 0.6,
    trousers: 0.6,
    skirt: 0.6,
    heels: 0.7,
    oxford: 0.7,
    loafers: 0.6,
    sweater: 0.5,
    jeans: 0.4,
    sneakers: 0.3,
    't-shirt': 0.3,
    hoodie: 0.2,
    athletic: 0.1
  };

  // Check category
  const category = product.category?.toLowerCase() || '';
  const type = product.type?.toLowerCase() || '';

  for (const [key, value] of Object.entries(categoryFormality)) {
    if (category.includes(key) || type.includes(key)) {
      formality = value;
      break;
    }
  }

  // Tags can adjust formality
  if (product.tags) {
    const tags = product.tags.map(t => t.toLowerCase());

    if (tags.some(t => t.includes('formal') || t.includes('elegant'))) {
      formality += 0.2;
    }
    if (tags.some(t => t.includes('casual') || t.includes('relaxed'))) {
      formality -= 0.2;
    }
    if (tags.some(t => t.includes('athletic') || t.includes('sport'))) {
      formality -= 0.3;
    }
  }

  // Clamp to 0-1
  return Math.max(0, Math.min(1, formality));
}

/**
 * Calculate formality score for an outfit
 */
export function calculateOutfitFormality(outfit: Outfit): number {
  if (!outfit.products || outfit.products.length === 0) {
    return 0.5;
  }

  const formalityScores = outfit.products.map(p => calculateProductFormality(p));
  const avgFormality = formalityScores.reduce((sum, score) => sum + score, 0) / formalityScores.length;

  return avgFormality;
}

/**
 * Calculate how well an outfit matches an occasion
 * Returns score 0-1 where 1 = perfect match
 */
export function calculateOccasionMatch(
  outfit: Outfit,
  occasion: Occasion
): number {
  const rules = OCCASION_RULES[occasion];
  if (!rules) {
    return 0.5;
  }

  let score = 1.0;

  // 1. Check formality (40% weight)
  const outfitFormality = calculateOutfitFormality(outfit);
  const formalityDiff = Math.abs(outfitFormality - rules.requiredFormality);
  score -= formalityDiff * 0.4;

  // 2. Check style preferences (30% weight)
  if (outfit.archetype) {
    const archetype = outfit.archetype.toLowerCase();

    if (rules.preferredStyles.some(style => archetype.includes(style.toLowerCase()))) {
      // Matches preferred style - bonus
      score += 0.1;
    } else if (rules.avoidStyles?.some(style => archetype.includes(style.toLowerCase()))) {
      // Matches avoided style - penalty
      score -= 0.3;
    }
  }

  // 3. Check colors (15% weight)
  if (rules.colorRestrictions && outfit.products) {
    const outfitColors = outfit.products
      .flatMap(p => p.colors || [])
      .map(c => c.toLowerCase());

    if (rules.colorRestrictions.avoid) {
      const hasAvoidedColor = outfitColors.some(color =>
        rules.colorRestrictions!.avoid!.some(avoid => color.includes(avoid.toLowerCase()))
      );
      if (hasAvoidedColor) {
        score -= 0.15;
      }
    }

    if (rules.colorRestrictions.prefer && rules.colorRestrictions.prefer[0] !== 'any') {
      const hasPreferredColor = outfitColors.some(color =>
        rules.colorRestrictions!.prefer!.some(prefer => color.includes(prefer.toLowerCase()))
      );
      if (hasPreferredColor) {
        score += 0.05;
      }
    }
  }

  // 4. Check category preferences (15% weight)
  if (rules.categoryPreferences && outfit.products) {
    const outfitCategories = outfit.products.map(p =>
      (p.category + ' ' + p.type).toLowerCase()
    );

    if (rules.categoryPreferences.avoid) {
      const hasAvoidedCategory = outfitCategories.some(cat =>
        rules.categoryPreferences!.avoid!.some(avoid => cat.includes(avoid.toLowerCase()))
      );
      if (hasAvoidedCategory) {
        score -= 0.15;
      }
    }

    if (rules.categoryPreferences.prefer) {
      const hasPreferredCategory = outfitCategories.some(cat =>
        rules.categoryPreferences!.prefer!.some(prefer => cat.includes(prefer.toLowerCase()))
      );
      if (hasPreferredCategory) {
        score += 0.05;
      }
    }

    if (rules.categoryPreferences.required) {
      const hasRequiredCategory = rules.categoryPreferences.required.every(req =>
        outfitCategories.some(cat => cat.includes(req.toLowerCase()))
      );
      if (!hasRequiredCategory) {
        score -= 0.2; // Missing required category
      }
    }
  }

  // Clamp to 0-1
  return Math.max(0, Math.min(1, score));
}

/**
 * Filter outfits by occasion match threshold
 */
export function filterOutfitsByOccasion(
  outfits: Outfit[],
  occasion: Occasion,
  minScore: number = 0.6
): Outfit[] {
  return outfits
    .map(outfit => ({
      outfit,
      score: calculateOccasionMatch(outfit, occasion)
    }))
    .filter(item => item.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .map(item => item.outfit);
}

/**
 * Get best occasion for an outfit
 */
export function getBestOccasionForOutfit(outfit: Outfit): {
  occasion: Occasion;
  score: number;
} {
  const occasions: Occasion[] = ['work', 'casual', 'formal', 'date', 'party', 'sports', 'travel'];

  let bestOccasion: Occasion = 'casual';
  let bestScore = 0;

  for (const occasion of occasions) {
    const score = calculateOccasionMatch(outfit, occasion);
    if (score > bestScore) {
      bestScore = score;
      bestOccasion = occasion;
    }
  }

  return { occasion: bestOccasion, score: bestScore };
}
