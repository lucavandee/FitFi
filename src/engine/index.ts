// Export all engine functionality from a single entry point
export * from './types';
export * from './calculateMatchScore';
export * from './filterAndSortProducts';
export * from './generateOutfits';
export * from './generateOutfitDescriptions';
export * from './profile-mapping';
export * from './recommendationEngine';
export * from './explainOutfit';
export * from './helpers';

// Also export as default objects for non-ES6 imports
import { calculateMatchScore, calculateMatchPercentage } from './calculateMatchScore';
import { filterAndSortProducts, groupProductsByType, getTopProductsByType } from './filterAndSortProducts';
import generateOutfits from './generateOutfits';
import { generateOutfitTitle, generateOutfitDescription } from './generateOutfitDescriptions';
import { generateOutfitExplanation } from './explainOutfit';
import { analyzeUserProfile, determineArchetypesFromAnswers, getStyleKeywords } from './profile-mapping';
import { generateRecommendations, getRecommendedProducts } from './recommendationEngine';
import { 
  getCurrentSeason, 
  getDutchSeasonName, 
  getProductCategory, 
  isProductInSeason,
  isProductSuitableForWeather,
  getTypicalWeatherForSeason,
  getDutchWeatherDescription
} from './helpers';

