import { Product, StylePreferences } from './types';

/**
 * Calculates a match score between a product and user style preferences
 * 
 * @param product - The product to calculate score for
 * @param stylePreferences - User's style preferences
 * @returns A numeric score representing how well the product matches the user's preferences
 */
export function calculateMatchScore(product: Product, stylePreferences: StylePreferences): number {
  // If product has no style tags or user has no preferences, return 0
  if (!product.styleTags || !stylePreferences) return 0;

  // Sum up the preference values for each style tag that matches
  return product.styleTags.reduce((score, tag) => {
    // Get the preference value for this tag, default to 0 if not found
    const preferenceValue = stylePreferences[tag.toLowerCase()] || 0;
    return score + preferenceValue;
  }, 0);
}

/**
 * Calculates a percentage match (0-100) for display purposes
 * 
 * @param score - Raw match score
 * @param maxPossibleScore - Maximum possible score (optional)
 * @returns A percentage between 0-100
 */
export function calculateMatchPercentage(score: number, maxPossibleScore: number = 10): number {
  // Ensure we don't divide by zero
  if (maxPossibleScore <= 0) return 0;
  
  // Calculate percentage and clamp between 0-100
  const percentage = Math.round((score / maxPossibleScore) * 100);
  return Math.min(Math.max(percentage, 0), 100);
}

export default calculateMatchScore;