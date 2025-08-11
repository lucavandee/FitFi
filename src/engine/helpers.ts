import type { CategoryRatio, Season } from './types';
import { Product, Season, ProductCategory, Weather } from './types';

/**
 * Determines the current season based on the current date
 * 
 * @returns The current season
 */
export function getCurrentSeason(): Season {
  const now = new Date();
  const month = now.getMonth(); // 0-11 (Jan-Dec)
  
  // Northern Hemisphere seasons
  // Spring: March-May (2-4)
  // Summer: June-August (5-7)
  // Autumn: September-November (8-10)
  // Winter: December-February (11, 0, 1)
  
  if (month >= 2 && month <= 4) {
    return 'spring';
  } else if (month >= 5 && month <= 7) {
    return 'summer';
  } else if (month >= 8 && month <= 10) {
    return 'autumn';
  } else {
    return 'winter';
  }
}

/**
 * Gets the Dutch name for a season
 * 
 * @param season - The season in English
 * @returns The Dutch name for the season
 */
export function getDutchSeasonName(season: Season): string {
  const seasonNames: Record<Season, string> = {
    'spring': 'Lente',
    'summer': 'Zomer',
    'autumn': 'Herfst',
    'winter': 'Winter'
  };
  
  return seasonNames[season] || season;
}

/**
 * Gets the next season after the current one
 * 
 * @param currentSeason - The current season
 * @returns The next season
 */
export function getNextSeason(currentSeason: Season): Season {
  const seasons: Season[] = ['spring','summer','autumn','winter'];
  const idx = seasons.indexOf(currentSeason);
  const safeIdx = idx >= 0 ? idx : 0;
  const nextIndex = (safeIdx + 1) % seasons.length;
  return seasons[nextIndex];
}

/**
 * Checks if a product is suitable for a given season
 * 
 * @param product - The product to check
 * @param season - The season to check against
 * @returns Whether the product is suitable for the season
 */
export function isProductInSeason(product: Product, season: Season): boolean {
  // If product has no season data, assume it's suitable for all seasons
  if (!product.season || !Array.isArray(product.season) || product.season.length === 0) {
    return true;
  }
  
  return product.season.includes(season);
}

/**
 * Checks if a product is suitable for a given weather condition
 * 
 * @param product - The product to check
 * @param weather - The weather condition to check against
 * @returns Whether the product is suitable for the weather
 */
export function isProductSuitableForWeather(product: Product, weather: Weather): boolean {
  // If product has no weather data, use season as a proxy
  if (!product.season || !Array.isArray(product.season) || product.season.length === 0) {
    return true;
  }
  
  // Map weather to seasons
  const weatherToSeasons: Record<Weather, Season[]> = {
    'cold': ['winter', 'autumn'],
    'mild': ['spring', 'autumn'],
    'warm': ['spring', 'summer'],
    'hot': ['summer'],
    'rainy': ['spring', 'autumn', 'winter'],
    'snowy': ['winter'],
    'windy': ['autumn', 'winter', 'spring']
  };
  
  const suitableSeasons = weatherToSeasons[weather] || [];
  
  // Check if any of the product's seasons match the suitable seasons for this weather
  return product.season.some(season => suitableSeasons.includes(season as Season));
}

/**
 * Gets the typical weather for a season
 * 
 * @param season - The season
 * @returns The typical weather for the season
 */
export function getTypicalWeatherForSeason(season: Season): Weather {
  const seasonToWeather: Record<Season, Weather> = {
    'spring': 'mild',
    'summer': 'warm',
    'autumn': 'mild',
    'winter': 'cold'
  };
  
  return seasonToWeather[season] || 'mild';
}

/**
 * Maps a product type to a standardized category
 * 
 * @param type - The product type or category string
 * @returns The standardized product category
 */
function mapProductTypeToCategory(type: string | undefined): ProductCategory {
  if (!type) return ProductCategory.OTHER;
  
  const lowerType = type.toLowerCase();
  
  // Map Dutch product types to categories
  if (lowerType.includes('trui') || 
      lowerType.includes('shirt') || 
      lowerType.includes('blouse') || 
      lowerType.includes('top') || 
      lowerType.includes('t-shirt') || 
      lowerType.includes('polo')) {
    return ProductCategory.TOP;
  }
  
  if (lowerType.includes('broek') || 
      lowerType.includes('jeans') || 
      lowerType.includes('rok') || 
      lowerType.includes('short')) {
    return ProductCategory.BOTTOM;
  }
  
  if (lowerType.includes('schoen') || 
      lowerType.includes('sneaker') || 
      lowerType.includes('laars') || 
      lowerType.includes('pump') || 
      lowerType.includes('sandaal')) {
    return ProductCategory.FOOTWEAR;
  }
  
  if (lowerType.includes('jas') || 
      lowerType.includes('jack') || 
      lowerType.includes('coat') || 
      lowerType.includes('blazer') || 
      lowerType.includes('jasje')) {
    return ProductCategory.OUTERWEAR;
  }
  
  if (lowerType.includes('accessoire') || 
      lowerType.includes('tas') || 
      lowerType.includes('riem') || 
      lowerType.includes('sjaal') || 
      lowerType.includes('zonnebril') || 
      lowerType.includes('horloge') || 
      lowerType.includes('sieraad') || 
      lowerType.includes('handschoen') || 
      lowerType.includes('muts') || 
      lowerType.includes('pet')) {
    return ProductCategory.ACCESSORY;
  }
  
  if (lowerType.includes('jurk') || lowerType.includes('dress')) {
    return ProductCategory.DRESS;
  }
  
  if (lowerType.includes('jumpsuit') || lowerType.includes('overall')) {
    return ProductCategory.JUMPSUIT;
  }
  
  return ProductCategory.OTHER;
}

/**
 * Gets the category of a product
 * 
 * @param product - The product to get the category for
 * @returns The product category
 */
export function getProductCategory(product: Product): ProductCategory {
  // If product has an explicit category field, use that
  if (product.category) {
    return mapProductTypeToCategory(product.category);
  }
  
  // Otherwise, use the type field
  return mapProductTypeToCategory(product.type);
}

/**
 * Checks if a product is a specific category
 * 
 * @param product - The product to check
 * @param category - The category to check against
 * @returns Whether the product is of the specified category
 */
export function isProductCategory(product: Product, category: ProductCategory): boolean {
  return getProductCategory(product) === category;
}

/**
 * Category mapping for product types
 */
const CATEGORY_MAPPING: Record<string, keyof CategoryRatio> = {
  'top': 'top',
  'shirt': 'top',
  'blouse': 'top',
  'trui': 'top',
  'sweater': 'top',
  'hoodie': 'top',
  'vest': 'top',
  'broek': 'bottom',
  'jeans': 'bottom',
  'rok': 'bottom',
  'short': 'bottom',
  'legging': 'bottom',
  'joggingbroek': 'bottom',
  'schoenen': 'footwear',
  'sneaker': 'footwear',
  'jas': 'outerwear',
  'tas': 'accessory',
  'accessoire': 'accessory',
  'jurk': 'dress',
  'jumpsuit': 'jumpsuit'
};

/**
 * Calculate category ratio for an outfit
 */
export function calculateCategoryRatio(types: string[]): CategoryRatio {
  const ratio: CategoryRatio = {
    top: 0,
    bottom: 0,
    footwear: 0,
    accessory: 0,
    outerwear: 0,
    dress: 0,
    jumpsuit: 0,
    other: 0
  };
  
  // Count categories
  types.forEach(type => {
    const key = (CATEGORY_MAPPING[type] ?? 'other') as keyof CategoryRatio;
    ratio[key] = (ratio[key] || 0) + 1;
  });
  
  // Convert to percentages
  const total = types.length || 1;
  (Object.keys(ratio) as (keyof CategoryRatio)[]).forEach(key => {
    ratio[key] = Math.round(((ratio[key] || 0) / total) * 100);
  });
  
  return ratio;
}

/**
 * Gets weather description in Dutch
 * 
 * @param weather - The weather condition
 * @returns Dutch description of the weather
 */
export function getDutchWeatherDescription(weather: Weather): string {
  const weatherDescriptions: Record<Weather, string> = {
    'cold': 'koud',
    'mild': 'mild',
    'warm': 'warm',
    'hot': 'heet',
    'rainy': 'regenachtig',
    'snowy': 'sneeuwachtig',
    'windy': 'winderig'
  };
  
  return weatherDescriptions[weather] || weather;
}

