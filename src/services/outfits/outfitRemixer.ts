import type { Outfit, Product } from '@/engine/types';
import { calculateMatchScore } from './matchScoreCalculator';

interface RemixOptions {
  targetCategory: 'top' | 'bottom' | 'footwear' | 'outerwear' | 'accessory';
  maxResults?: number;
  minMatchScore?: number;
}

interface RemixResult {
  outfit: Outfit;
  matchScore: number;
  changedItem: Product;
}

/**
 * Generates outfit variations by swapping one item category
 * while keeping other items the same
 */
export function remixOutfit(
  originalOutfit: Outfit,
  availableProducts: Product[],
  userProfile: {
    archetype?: string;
    colorPalette?: string[];
    preferences?: {
      styles?: string[];
      occasions?: string[];
    };
  },
  options: RemixOptions
): RemixResult[] {
  const {
    targetCategory,
    maxResults = 3,
    minMatchScore = 70
  } = options;

  // Find the current item in target category
  const currentItem = originalOutfit.products?.find(
    p => (p.category || p.type) === targetCategory
  );

  // Filter products in target category (exclude current item)
  const alternativeItems = availableProducts.filter(p => {
    const category = p.category || p.type;
    return category === targetCategory && p.id !== currentItem?.id;
  });

  // Generate remixed outfits
  const remixedOutfits: RemixResult[] = alternativeItems.map(newItem => {
    // Replace the item
    const newProducts = originalOutfit.products?.map(p =>
      (p.category || p.type) === targetCategory ? newItem : p
    ) || [newItem];

    // Create new outfit object
    const remixedOutfit: Outfit = {
      ...originalOutfit,
      id: `${originalOutfit.id}-remix-${newItem.id}`,
      products: newProducts,
      title: `${originalOutfit.title} (variant)`
    };

    // Calculate match score for remixed outfit
    const matchResult = calculateMatchScore({
      outfit: {
        style: remixedOutfit.archetype,
        colors: remixedOutfit.colors || [],
        occasion: remixedOutfit.occasion,
        season: remixedOutfit.season,
        items: newProducts
      },
      userProfile
    });

    return {
      outfit: {
        ...remixedOutfit,
        matchPercentage: matchResult.total
      },
      matchScore: matchResult.total,
      changedItem: newItem
    };
  });

  // Filter by minimum match score and sort by score
  const filtered = remixedOutfits
    .filter(r => r.matchScore >= minMatchScore)
    .sort((a, b) => b.matchScore - a.matchScore);

  // Return top N results
  return filtered.slice(0, maxResults);
}

/**
 * Get remix suggestions for an outfit
 * Returns which categories can be remixed and preview of best alternatives
 */
export function getRemixSuggestions(
  outfit: Outfit,
  availableProducts: Product[],
  userProfile: any
): {
  category: string;
  currentItem: Product | undefined;
  alternativesCount: number;
  bestAlternative: RemixResult | null;
}[] {
  const categories = ['top', 'bottom', 'footwear', 'outerwear', 'accessory'];

  return categories.map(category => {
    const currentItem = outfit.products?.find(
      p => (p.category || p.type) === category
    );

    const alternatives = availableProducts.filter(p => {
      const cat = p.category || p.type;
      return cat === category && p.id !== currentItem?.id;
    });

    let bestAlternative: RemixResult | null = null;

    if (alternatives.length > 0) {
      const remixes = remixOutfit(
        outfit,
        availableProducts,
        userProfile,
        { targetCategory: category as any, maxResults: 1 }
      );
      bestAlternative = remixes[0] || null;
    }

    return {
      category,
      currentItem,
      alternativesCount: alternatives.length,
      bestAlternative
    };
  }).filter(s => s.alternativesCount > 0);
}
