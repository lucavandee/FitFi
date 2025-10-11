import type { Product, Outfit } from './types';
import type { ArchetypeWeights } from '@/types/style';
import { scoreAndFilterProducts, buildOutfits } from './matching';
import type { StyleEmbedding } from '@/services/visualPreferences/embeddingService';

/**
 * Generate outfit recommendations using locked style embedding
 *
 * This is the NEW recommendation path that uses the immutable
 * embedding vector created after quiz + swipes + calibration.
 *
 * Philosophy: Recommendations should be:
 * - **Consistent** - Same embedding = same style recommendations
 * - **Explainable** - Clear why each outfit matches the embedding
 * - **Data-driven** - Based on actual user choices, not assumptions
 * - **Stable** - Don't change randomly between sessions
 */

export interface EmbeddingBasedRecommendationOptions {
  count?: number;
  occasion?: string;
  season?: string;
  priceRange?: { min: number; max: number };
  excludeProductIds?: string[];
  gender?: 'male' | 'female' | 'unisex';
}

/**
 * Main recommendation function using locked embedding
 */
export function generateRecommendationsFromEmbedding(
  lockedEmbedding: StyleEmbedding,
  products: Product[],
  options: EmbeddingBasedRecommendationOptions = {}
): Outfit[] {
  const {
    count = 5,
    occasion,
    season,
    priceRange,
    excludeProductIds = [],
    gender
  } = options;

  // Validate inputs
  if (!lockedEmbedding || Object.keys(lockedEmbedding).length === 0) {
    console.error('[EmbeddingRecommendation] No locked embedding provided');
    return [];
  }

  if (!products || products.length === 0) {
    console.error('[EmbeddingRecommendation] No products provided');
    return [];
  }

  // Convert embedding to archetype weights (0-1 scale)
  const archetypeWeights: ArchetypeWeights = {};
  const maxScore = Math.max(...Object.values(lockedEmbedding));

  for (const [archetype, score] of Object.entries(lockedEmbedding)) {
    // Normalize to 0-1 scale
    archetypeWeights[archetype] = maxScore > 0 ? score / maxScore : 0;
  }

  // Filter products
  let filteredProducts = products.filter(p => {
    // Exclude specific IDs
    if (excludeProductIds.includes(p.id)) return false;

    // Filter by occasion
    if (occasion && p.occasion && !p.occasion.includes(occasion)) return false;

    // Filter by season
    if (season && p.season && p.season !== 'all' && p.season !== season) return false;

    // Filter by price range
    if (priceRange && p.price) {
      if (p.price < priceRange.min || p.price > priceRange.max) return false;
    }

    // Filter by gender
    if (gender && p.gender && p.gender !== 'unisex' && p.gender !== gender) return false;

    return true;
  });

  console.log(`[EmbeddingRecommendation] Filtered ${filteredProducts.length}/${products.length} products`);

  if (filteredProducts.length < 10) {
    console.warn('[EmbeddingRecommendation] Very few products available after filtering');
  }

  // Score and rank products using archetype weights
  const scored = scoreAndFilterProducts(filteredProducts, {
    archetypeMix: archetypeWeights,
    gender,
    season,
    limit: 100
  });

  // Build complete outfits
  const outfits = buildOutfits(filteredProducts, {
    archetypeMix: archetypeWeights,
    gender,
    season
  });

  console.log(`[EmbeddingRecommendation] Generated ${outfits.length} outfits from embedding`);

  // Return requested count
  return outfits.slice(0, count);
}

/**
 * Explain why an outfit matches the embedding
 */
export function explainOutfitMatch(
  outfit: Outfit,
  lockedEmbedding: StyleEmbedding
): string {
  if (!outfit._fusion || !outfit._fusion.matchedSignals) {
    return 'Deze outfit past bij jouw algemene stijlvoorkeuren.';
  }

  // Get top 2 archetypes from embedding
  const topArchetypes = Object.entries(lockedEmbedding)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([arch]) => arch);

  // Get matched signals that align with top archetypes
  const relevantSignals = outfit._fusion.matchedSignals.filter(signal =>
    topArchetypes.some(arch => signal.toLowerCase().includes(arch.toLowerCase()))
  );

  if (relevantSignals.length > 0) {
    const signal = relevantSignals[0];
    return `Deze outfit combineert ${signal} — perfect voor jouw voorkeur voor ${topArchetypes[0].replace(/_/g, ' ')}.`;
  }

  return `Deze outfit past bij jouw stijlprofiel met ${topArchetypes.map(a => a.replace(/_/g, ' ')).join(' en ')}.`;
}

/**
 * Get embedding-based product recommendations (individual items)
 */
export function getTopProductsFromEmbedding(
  lockedEmbedding: StyleEmbedding,
  products: Product[],
  category?: string,
  limit: number = 10
): Array<{ product: Product; score: number; matchReason: string }> {
  // Convert embedding to weights
  const archetypeWeights: ArchetypeWeights = {};
  const maxScore = Math.max(...Object.values(lockedEmbedding));

  for (const [archetype, score] of Object.entries(lockedEmbedding)) {
    archetypeWeights[archetype] = maxScore > 0 ? score / maxScore : 0;
  }

  // Filter by category if specified
  let filteredProducts = products;
  if (category) {
    filteredProducts = products.filter(p => p.category === category);
  }

  // Score products
  const scored = scoreAndFilterProducts(filteredProducts, {
    archetypeMix: archetypeWeights,
    limit
  });

  return scored.slice(0, limit).map(({ product, score, detail }) => ({
    product,
    score,
    matchReason: detail.matchedSignals[0] || 'Algemene stijl match'
  }));
}

/**
 * Compare outfit to embedding for quality assurance
 */
export function validateOutfitAgainstEmbedding(
  outfit: Outfit,
  lockedEmbedding: StyleEmbedding
): {
  isGoodMatch: boolean;
  confidence: number;
  issues: string[];
} {
  const issues: string[] = [];

  // Check if outfit has fusion data
  if (!outfit._fusion) {
    issues.push('Outfit missing fusion data');
    return { isGoodMatch: false, confidence: 0, issues };
  }

  // Get top archetypes from embedding
  const topArchetypes = Object.entries(lockedEmbedding)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([arch]) => arch);

  // Check if outfit matches at least one top archetype
  const hasArchetypeMatch = outfit._fusion.matchedSignals.some(signal =>
    topArchetypes.some(arch => signal.toLowerCase().includes(arch.toLowerCase()))
  );

  if (!hasArchetypeMatch) {
    issues.push('Outfit does not match primary archetypes');
  }

  // Check match score
  const matchScore = outfit.matchScore || 0;
  if (matchScore < 60) {
    issues.push('Match score too low');
  }

  // Calculate confidence
  const confidence = Math.min(100, matchScore + (hasArchetypeMatch ? 20 : 0));
  const isGoodMatch = issues.length === 0 && confidence >= 70;

  return {
    isGoodMatch,
    confidence,
    issues
  };
}

/**
 * Get embedding summary for UI display
 */
export function getEmbeddingSummary(lockedEmbedding: StyleEmbedding): {
  primary: string;
  secondary: string;
  tertiary?: string;
  description: string;
} {
  const sorted = Object.entries(lockedEmbedding)
    .sort(([, a], [, b]) => b - a);

  const primary = sorted[0]?.[0] || 'casual';
  const secondary = sorted[1]?.[0] || 'classic';
  const tertiary = sorted[2]?.[0];

  const primaryFormatted = primary.replace(/_/g, ' ');
  const secondaryFormatted = secondary.replace(/_/g, ' ');
  const tertiaryFormatted = tertiary?.replace(/_/g, ' ');

  const description = tertiaryFormatted
    ? `Jouw stijl combineert ${primaryFormatted}, ${secondaryFormatted} en ${tertiaryFormatted}.`
    : `Jouw stijl combineert ${primaryFormatted} en ${secondaryFormatted}.`;

  return {
    primary,
    secondary,
    tertiary,
    description
  };
}
