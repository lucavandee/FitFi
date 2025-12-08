import type { Product, Outfit, OutfitGenerationOptions } from './types';
import type { PhotoAnalysisResult } from '@/services/nova/photoAnalysisService';
import { getUserPhotoAnalyses } from '@/services/nova/photoAnalysisService';
import { enhanceProductsWithPhotoAnalysis, filterColorClashes } from './photoEnhancedMatching';
import generateOutfits from './generateOutfits';

/**
 * Enhanced recommendation engine with photo analysis integration
 * Provides color-intelligent outfit generation based on user's photo analysis
 */

interface PhotoEnhancedRecommendationOptions extends OutfitGenerationOptions {
  userId?: string;
  photoAnalysisId?: string;
  enableColorMatching?: boolean;
  filterClashes?: boolean;
  minColorScore?: number;
}

/**
 * Generate outfits with photo enhancement
 * This is the main entry point for photo-enhanced recommendations
 */
export async function generatePhotoEnhancedOutfits(
  primaryArchetype: string,
  products: Product[],
  count: number = 3,
  secondaryArchetype?: string,
  mixFactor: number = 0.3,
  options?: PhotoEnhancedRecommendationOptions
): Promise<Outfit[]> {
  const {
    userId,
    photoAnalysisId,
    enableColorMatching = true,
    filterClashes = false,
    minColorScore = 40,
    ...outfitOptions
  } = options || {};

  // Step 1: Get photo analysis
  const photoAnalysis = await getPhotoAnalysis(userId, photoAnalysisId);

  if (!photoAnalysis) {
    console.log('📷 [Photo Enhancement] No photo analysis available - using standard generation');
    return generateOutfits(primaryArchetype, products, count, secondaryArchetype, mixFactor, outfitOptions);
  }

  console.log('📷 [Photo Enhancement] Using photo analysis:', {
    colors: photoAnalysis.detected_colors,
    style: photoAnalysis.detected_style,
    matchScore: photoAnalysis.match_score
  });

  // Step 2: Enhance products with color compatibility
  let enhancedProducts = products;

  if (enableColorMatching) {
    enhancedProducts = enhanceProductsWithPhotoAnalysis(products, photoAnalysis);
    console.log(`📷 [Photo Enhancement] Enhanced ${enhancedProducts.length} products with color scores`);
  }

  // Step 3: (Optional) Filter out severe color clashes
  if (filterClashes) {
    enhancedProducts = filterColorClashes(enhancedProducts, photoAnalysis, minColorScore);
    console.log(`📷 [Photo Enhancement] Filtered to ${enhancedProducts.length} color-compatible products`);
  }

  // Step 4: Generate outfits with enhanced products
  const outfits = generateOutfits(
    primaryArchetype,
    enhancedProducts,
    count,
    secondaryArchetype,
    mixFactor,
    outfitOptions
  );

  // Step 5: Enrich outfits with photo analysis metadata
  return outfits.map(outfit => ({
    ...outfit,
    photoEnhanced: true,
    photoAnalysisId: photoAnalysis.id,
    colorCompatibility: calculateOutfitColorScore(outfit.products)
  }));
}

/**
 * Get photo analysis for user
 * Tries to use specific analysis ID first, then falls back to most recent
 */
async function getPhotoAnalysis(
  userId?: string,
  photoAnalysisId?: string
): Promise<PhotoAnalysisResult | null> {
  if (!userId) {
    console.warn('📷 [Photo Enhancement] No userId provided - skipping photo enhancement');
    return null;
  }

  try {
    // If specific ID provided, fetch that one
    if (photoAnalysisId) {
      // Would need a getPhotoAnalysisById function - for now, get all and filter
      const analyses = await getUserPhotoAnalyses(userId, 10);
      const specific = analyses.find(a => a.id === photoAnalysisId);
      if (specific) {
        return specific;
      }
    }

    // Otherwise, get most recent
    const analyses = await getUserPhotoAnalyses(userId, 1);
    if (analyses.length > 0) {
      return analyses[0];
    }

    return null;
  } catch (error) {
    console.error('📷 [Photo Enhancement] Failed to fetch photo analysis:', error);
    return null;
  }
}

/**
 * Calculate average color compatibility score for outfit
 */
function calculateOutfitColorScore(products: Product[]): number {
  const scores = products
    .map(p => p.photoColorScore)
    .filter((score): score is number => typeof score === 'number');

  if (scores.length === 0) return 0;

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

/**
 * Quick helper: Check if user has photo analysis available
 */
export async function hasPhotoAnalysis(userId: string): Promise<boolean> {
  try {
    const analyses = await getUserPhotoAnalyses(userId, 1);
    return analyses.length > 0;
  } catch (error) {
    console.error('Failed to check photo analysis availability:', error);
    return false;
  }
}

/**
 * Get color recommendations for user based on their photo analysis
 */
export async function getUserColorRecommendations(userId: string): Promise<{
  bestColors: string[];
  goodColors: string[];
  colorsToAvoid: string[];
  undertone: string;
  explanation: string;
} | null> {
  const analysis = await getPhotoAnalysis(userId);
  if (!analysis) return null;

  const { getColorRecommendations } = await import('./photoEnhancedMatching');
  return getColorRecommendations(analysis);
}
