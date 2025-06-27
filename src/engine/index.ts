// Export all engine functionality from a single entry point
export * from './types';
export * from './calculateMatchScore';
export * from './filterAndSortProducts';
export * from './generateOutfits';
export * from './recommendationEngine';

// Also export as default objects for non-ES6 imports
import { calculateMatchScore, calculateMatchPercentage } from './calculateMatchScore';
import { filterAndSortProducts, groupProductsByType, getTopProductsByType } from './filterAndSortProducts';
import generateOutfits from './generateOutfits';
import { generateRecommendations } from './recommendationEngine';

export default {
  calculateMatchScore,
  calculateMatchPercentage,
  filterAndSortProducts,
  groupProductsByType,
  getTopProductsByType,
  generateOutfits,
  generateRecommendations
};