import { Product, UserProfile, Outfit, StylePreferences } from './types';
import { filterAndSortProducts } from './filterAndSortProducts';
import generateOutfits from './generateOutfits';
import { analyzeUserProfile, determineArchetypesFromAnswers } from './profile-mapping';

/**
 * Main recommendation engine that generates personalized outfit recommendations
 * 
 * @param user - User profile with style preferences
 * @param products - Available products to choose from
 * @param count - Number of outfits to generate
 * @param options - Additional options for recommendation
 * @returns Array of recommended outfits
 */
export function generateRecommendations(
  user: UserProfile,
  products: Product[],
  count: number = 3,
  options?: {
    excludeIds?: string[];
    preferredOccasions?: string[];
    season?: string;
  }
): Outfit[] {
  // Validate inputs
  if (!user || !products || products.length === 0) {
    console.warn('[RecommendationEngine] Invalid inputs provided');
    return [];
  }

  // Filter and sort products based on user preferences
  const relevantProducts = filterAndSortProducts(products, user);
  
  if (relevantProducts.length < 4) {
    console.warn('[RecommendationEngine] Not enough relevant products for outfit generation');
    return [];
  }

  // Determine user's style archetypes
  let primaryArchetype = 'casual_chic';
  let secondaryArchetype = 'klassiek';
  let mixFactor = 0.3;

  if (user.stylePreferences) {
    const profileAnalysis = analyzeUserProfile(user.stylePreferences);
    primaryArchetype = profileAnalysis.dominantArchetype;
    secondaryArchetype = profileAnalysis.secondaryArchetype;
    mixFactor = profileAnalysis.mixFactor;
  }

  // Generate outfits using the outfit generation engine
  const outfits = generateOutfits(
    primaryArchetype,
    relevantProducts,
    count,
    secondaryArchetype,
    mixFactor,
    {
      excludeIds: options?.excludeIds,
      preferredOccasions: options?.preferredOccasions,
      maxAttempts: 10,
      variationLevel: 'medium',
      enforceCompletion: true,
      minCompleteness: 80
    }
  );

  console.log(`[RecommendationEngine] Generated ${outfits.length} recommendations for ${user.name || 'user'}`);
  
  return outfits;
}

/**
 * Generates recommendations based on quiz answers
 * 
 * @param answers - User's quiz answers
 * @param products - Available products
 * @param count - Number of recommendations to generate
 * @returns Array of recommended outfits
 */
export function generateRecommendationsFromAnswers(
  answers: Record<string, any>,
  products: Product[],
  count: number = 3
): Outfit[] {
  // Convert quiz answers to archetype profile
  const { primaryArchetype, secondaryArchetype, mixFactor } = determineArchetypesFromAnswers(answers);
  
  // Generate outfits
  const outfits = generateOutfits(
    primaryArchetype,
    products,
    count,
    secondaryArchetype,
    mixFactor,
    {
      preferredOccasions: answers.occasions,
      maxAttempts: 10,
      variationLevel: 'medium',
      enforceCompletion: true
    }
  );

  return outfits;
}

/**
 * Calculates similarity between two outfits
 * 
 * @param outfit1 - First outfit
 * @param outfit2 - Second outfit
 * @returns Similarity score between 0 and 1
 */
export function calculateOutfitSimilarity(outfit1: Outfit, outfit2: Outfit): number {
  let similarity = 0;
  let factors = 0;

  // Compare archetypes
  if (outfit1.archetype === outfit2.archetype) {
    similarity += 0.3;
  }
  factors += 0.3;

  // Compare tags
  if (outfit1.tags && outfit2.tags) {
    const tags1 = new Set(outfit1.tags);
    const tags2 = new Set(outfit2.tags);
    const intersection = new Set([...tags1].filter(x => tags2.has(x)));
    const union = new Set([...tags1, ...tags2]);
    
    if (union.size > 0) {
      similarity += (intersection.size / union.size) * 0.4;
    }
    factors += 0.4;
  }

  // Compare occasions
  if (outfit1.occasion === outfit2.occasion) {
    similarity += 0.2;
  }
  factors += 0.2;

  // Compare seasons
  if (outfit1.season === outfit2.season) {
    similarity += 0.1;
  }
  factors += 0.1;

  return factors > 0 ? similarity / factors : 0;
}

/**
 * Finds similar outfits to a given outfit
 * 
 * @param targetOutfit - The outfit to find similarities for
 * @param allOutfits - All available outfits to search through
 * @param count - Number of similar outfits to return
 * @returns Array of similar outfits sorted by similarity
 */
export function findSimilarOutfits(
  targetOutfit: Outfit,
  allOutfits: Outfit[],
  count: number = 3
): Outfit[] {
  const similarities = allOutfits
    .filter(outfit => outfit.id !== targetOutfit.id)
    .map(outfit => ({
      outfit,
      similarity: calculateOutfitSimilarity(targetOutfit, outfit)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, count);

  return similarities.map(item => item.outfit);
}

/**
 * Updates user preferences based on feedback
 * 
 * @param currentPreferences - Current style preferences
 * @param feedback - User feedback on outfits
 * @returns Updated style preferences
 */
export function updatePreferencesFromFeedback(
  currentPreferences: StylePreferences,
  feedback: Array<{
    outfit: Outfit;
    liked: boolean;
    tags?: string[];
  }>
): StylePreferences {
  const updatedPreferences = { ...currentPreferences };
  
  feedback.forEach(({ outfit, liked, tags }) => {
    const relevantTags = tags || outfit.tags || [];
    const adjustment = liked ? 0.1 : -0.1;
    
    relevantTags.forEach(tag => {
      const normalizedTag = tag.toLowerCase();
      if (normalizedTag in updatedPreferences) {
        updatedPreferences[normalizedTag] = Math.max(
          1,
          Math.min(5, updatedPreferences[normalizedTag] + adjustment)
        );
      }
    });
  });
  
  return updatedPreferences;
}

/**
 * Calculates the diversity score of a set of outfits
 * 
 * @param outfits - Array of outfits to analyze
 * @returns Diversity score between 0 and 1
 */
export function calculateOutfitDiversity(outfits: Outfit[]): number {
  if (outfits.length <= 1) return 0;
  
  // Count unique archetypes
  const archetypes = new Set(outfits.map(o => o.archetype).filter(Boolean));
  const archetypeDiversity = archetypes.size / outfits.length;
  
  // Count unique occasions
  const occasions = new Set(outfits.map(o => o.occasion).filter(Boolean));
  const occasionDiversity = occasions.size / outfits.length;
  
  // Count unique seasons
  const seasons = new Set(outfits.map(o => o.season).filter(Boolean));
  const seasonDiversity = seasons.size / outfits.length;
  
  // Average diversity across dimensions
  return (archetypeDiversity + occasionDiversity + seasonDiversity) / 3;
}