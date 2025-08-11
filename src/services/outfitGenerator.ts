import { BoltProduct } from '../types/BoltProduct';
import { Outfit } from '../engine';
import { generateOutfitTitle, generateOutfitDescription } from '../engine/generateOutfitDescriptions';
import { generateOutfitExplanation } from '../engine/explainOutfit';
import { getCurrentSeason } from '../engine/helpers';
import { isValidImageUrl } from '../utils/imageUtils';

/**
 * Essential product types for a complete outfit
 */
const ESSENTIAL_TYPES = ['top', 'broek', 'schoenen', 'jeans', 'shirt', 'blouse', 'trui', 'sweater'];

/**
 * Optional product types that enhance an outfit
 */
const OPTIONAL_TYPES = ['jas', 'tas', 'accessoire', 'vest', 'cardigan'];

/**
 * Category mapping for outfit structure
 */
const CATEGORY_MAPPING: Record<string, string> = {
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
  'accessoire': 'accessory'
};

/**
 * Default fallback image URLs by category
 */
const FALLBACK_IMAGES: Record<string, string> = {
  'top': 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
  'bottom': 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
  'footwear': 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
  'outerwear': 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
  'accessory': 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
  'default': '/placeholder.png'
};

/**
 * Generate outfits from BoltProducts
 * @param products - Array of BoltProducts
 * @param archetype - Primary archetype for the outfits
 * @param gender - Gender to filter products by
 * @param count - Number of outfits to generate
 * @returns Array of generated outfits
 */
function generateOutfitsFromBoltProducts(
  products: BoltProduct[],
  archetype: string,
  gender: 'male' | 'female' = 'female',
  count: number = 3
): Outfit[] {
  // Filter products by gender
  const genderProducts = products.filter(product => product.gender === gender);
  
  if (genderProducts.length < 3) {
    console.warn(`Not enough ${gender} products to generate outfits`);
    return [];
  }
  
  // Group products by type
  const productsByType = groupProductsByType(genderProducts);
  
  // Filter products by archetype match
  const archetypeProducts = filterProductsByArchetype(genderProducts, archetype, 0.5);
  
  if (archetypeProducts.length < 3) {
    console.warn(`Not enough products matching archetype ${archetype}`);
    return [];
  }
  
  // Generate outfits
  const outfits: Outfit[] = [];
  
  // Get current season
  const currentSeason = getCurrentSeason();
  
  // Occasions for each archetype
  const occasions: Record<string, string[]> = {
    'klassiek': ['Werk', 'Formeel', 'Zakelijk diner'],
    'casual_chic': ['Casual', 'Weekend', 'Lunch'],
    'urban': ['Stad', 'Casual', 'Actief'],
    'streetstyle': ['Casual', 'Uitgaan', 'Festival'],
    'retro': ['Casual', 'Creatief', 'Weekend'],
    'luxury': ['Formeel', 'Gala', 'Speciale gelegenheid']
  };
  
  // Get occasions for the archetype
  const archetypeOccasions = occasions[archetype] || ['Casual', 'Werk', 'Weekend'];
  
  // Generate outfits
  for (let i = 0; i < count; i++) {
    // Select occasion for this outfit
    const occasion = archetypeOccasions[i % archetypeOccasions.length];
    
    // Create outfit
    const outfit = createOutfit(
      archetypeProducts,
      productsByType,
      archetype,
      occasion,
      currentSeason,
      i
    );
    
    if (outfit) {
      outfits.push(outfit);
    }
  }
  
  return outfits;
}

/**
 * Group BoltProducts by type
 * @param products - Array of BoltProducts
 * @returns Object with product types as keys and arrays of products as values
 */
function groupProductsByType(products: BoltProduct[]): Record<string, BoltProduct[]> {
  return products.reduce((groups, product) => {
    const type = product.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(product);
    return groups;
  }, {} as Record<string, BoltProduct[]>);
}

/**
 * Filter products by archetype match score
 * @param products - Array of BoltProducts
 * @param archetype - Archetype to filter by
 * @param minScore - Minimum match score (0-1)
 * @returns Array of products that match the archetype
 */
function filterProductsByArchetype(
  products: BoltProduct[],
  archetype: string,
  minScore: number = 0.5
): BoltProduct[] {
  return products.filter(product => {
    const score = product.archetypeMatch[archetype] || 0;
    return score >= minScore;
  });
}

/**
 * Get a fallback image URL for a product type
 * @param type - Product type
 * @returns Fallback image URL
 */
function getFallbackImage(type: string): string {
  const category = CATEGORY_MAPPING[type] || 'default';
  return FALLBACK_IMAGES[category as keyof typeof FALLBACK_IMAGES] || FALLBACK_IMAGES.default;
}

/**
 * Validate and get a safe image URL
 * @param imageUrl - Original image URL
 * @param type - Product type for fallback
 * @returns Valid image URL or fallback
 */
function getSafeImageUrl(imageUrl: string, type: string): string {
  // Check if URL is valid
  if (!imageUrl || !isValidImageUrl(imageUrl)) {
    console.warn(`Invalid image URL: ${imageUrl}, using fallback for ${type}`);
    return getFallbackImage(type);
  }
  
  return imageUrl;
}

/**
 * Create an outfit from products
 * @param archetypeProducts - Products that match the archetype
 * @param productsByType - Products grouped by type
 * @param archetype - Primary archetype for the outfit
 * @param occasion - Occasion for the outfit
 * @param season - Season for the outfit
 * @param index - Index for generating unique ID
 * @returns Generated outfit or null if not enough products
 */
function createOutfit(
  archetypeProducts: BoltProduct[],
  productsByType: Record<string, BoltProduct[]>,
  archetype: string,
  occasion: string,
  season: string,
  index: number
): Outfit | null {
  // Select products for the outfit
  const outfitProducts: BoltProduct[] = [];
  const selectedTypes: string[] = [];
  
  // Try to select one essential product
  for (const type of ESSENTIAL_TYPES) {
    if (productsByType[type] && productsByType[type].length > 0) {
      // Sort by archetype match score
      const sortedProducts = [...productsByType[type]].sort((a, b) => {
        const scoreA = a.archetypeMatch[archetype] || 0;
        const scoreB = b.archetypeMatch[archetype] || 0;
        return scoreB - scoreA;
      });
      
      // Select the best matching product
      const selectedProduct = sortedProducts[index % sortedProducts.length];
      if (selectedProduct) outfitProducts.push(selectedProduct);
      selectedTypes.push(type);
      
      // Only select one essential product
      break;
    }
  }
  
  // Try to select one bottom if not already selected
  if (!selectedTypes.some(type => CATEGORY_MAPPING[type] === 'bottom')) {
    const bottomTypes = Object.keys(productsByType).filter(type => CATEGORY_MAPPING[type] === 'bottom');
    
    for (const type of bottomTypes) {
      if (productsByType[type] && productsByType[type].length > 0) {
        // Sort by archetype match score
        const sortedProducts = [...productsByType[type]].sort((a, b) => {
          const scoreA = a.archetypeMatch[archetype] || 0;
          const scoreB = b.archetypeMatch[archetype] || 0;
          return scoreB - scoreA;
        });
        
        // Select the best matching product
        const selectedProduct = sortedProducts[index % sortedProducts.length];
        outfitProducts.push(selectedProduct);
        selectedTypes.push(type);
        break;
      }
    }
  }
  
  // Try to select one footwear if not already selected
  if (!selectedTypes.some(type => CATEGORY_MAPPING[type] === 'footwear')) {
    const footwearTypes = Object.keys(productsByType).filter(type => CATEGORY_MAPPING[type] === 'footwear');
    
    for (const type of footwearTypes) {
      if (productsByType[type] && productsByType[type].length > 0) {
        // Sort by archetype match score
        const sortedProducts = [...productsByType[type]].sort((a, b) => {
          const scoreA = a.archetypeMatch[archetype] || 0;
          const scoreB = b.archetypeMatch[archetype] || 0;
          return scoreB - scoreA;
        });
        
        // Select the best matching product
        const selectedProduct = sortedProducts[index % sortedProducts.length];
        outfitProducts.push(selectedProduct);
        selectedTypes.push(type);
        break;
      }
    }
  }
  
  // Try to select one optional product
  for (const type of OPTIONAL_TYPES) {
    if (productsByType[type] && productsByType[type].length > 0 && !selectedTypes.includes(type)) {
      // Sort by archetype match score
      const sortedProducts = [...productsByType[type]].sort((a, b) => {
        const scoreA = a.archetypeMatch[archetype] || 0;
        const scoreB = b.archetypeMatch[archetype] || 0;
        return scoreB - scoreA;
      });
      
      // Select the best matching product
      const selectedProduct = sortedProducts[index % sortedProducts.length];
      outfitProducts.push(selectedProduct);
      selectedTypes.push(type);
      
      // Only select one optional product
      break;
    }
  }
  
  // Check if we have enough products for an outfit
  if (outfitProducts.length < 2) {
    console.warn('Not enough products to create an outfit');
    return null;
  }
  
  // Generate outfit ID
  const outfitId = `bolt-outfit-${archetype}-${index}`;
  
  // Generate outfit title
  const title = generateOutfitTitle(
    archetype,
    occasion,
    outfitProducts.map(p => ({
      id: p.id,
      name: p.title,
      brand: p.brand,
      price: p.price,
      type: p.type,
      category: CATEGORY_MAPPING[p.type] || 'other'
    }))
  );
  
  // Generate outfit description
  const description = generateOutfitDescription(
    archetype,
    occasion,
    outfitProducts.map(p => ({
      id: p.id,
      name: p.title,
      brand: p.brand,
      price: p.price,
      type: p.type,
      category: CATEGORY_MAPPING[p.type] || 'other'
    }))
  );
  
  // Map product types to categories for structure
  const structure = outfitProducts.map(p => CATEGORY_MAPPING[p.type] || 'other');
  
  // Calculate match percentage (80-95%)
  const matchPercentage = 80 + Math.floor(Math.random() * 16);
  
  // Generate tags
  const tags = [
    archetype,
    ...outfitProducts.flatMap(p => p.styleTags).slice(0, 3),
    occasion.toLowerCase()
  ];
  
  // Validate and get safe image URL for the outfit
  const firstProduct = outfitProducts[0];
  const outfitImageUrl = getSafeImageUrl(
    firstProduct.imageUrl,
    firstProduct.type
  );
  
  // Count fallback images
  let fallbackImageCount = 0;
  const productsWithSafeImages = outfitProducts.map(p => {
    const safeImageUrl = getSafeImageUrl(p.imageUrl, p.type);
    if (safeImageUrl !== p.imageUrl) {
      fallbackImageCount++;
    }
    return {
      ...p,
      imageUrl: safeImageUrl
    };
  });
  
  // Log fallback image usage
  if (fallbackImageCount > 0) {
    console.log(`[OutfitGenerator] Using ${fallbackImageCount}/${productsWithSafeImages.length} fallback images for outfit ${outfitId}`);
  }
  
  // Create outfit object
  const outfit: Outfit = {
    id: outfitId,
    title,
    description,
    archetype,
    occasion,
    products: productsWithSafeImages.map(p => ({
      id: p.id,
      name: p.title,
      brand: p.brand,
      price: p.price,
      imageUrl: p.imageUrl,
      type: p.type,
      category: CATEGORY_MAPPING[p.type] || 'other',
      styleTags: p.styleTags,
      affiliateUrl: p.affiliateUrl
    })),
    imageUrl: outfitImageUrl, // Use safe image URL
    tags: Array.from(new Set(tags)), // Remove duplicates
    matchPercentage,
    explanation: '', // Will be generated later
    season: season as any,
    structure,
    weather: season === 'winter' ? 'cold' : season === 'summer' ? 'warm' : 'mild',
    categoryRatio: calculateCategoryRatio(productsWithSafeImages.map(p => CATEGORY_MAPPING[p.type] || 'other')),
    completeness: calculateCompleteness(productsWithSafeImages.map(p => CATEGORY_MAPPING[p.type] || 'other'))
  };
  
  // Generate explanation
  const explanation = generateOutfitExplanation(
    outfit,
    archetype,
    occasion
  );
  
  // Add explanation to outfit
  outfit.explanation = explanation;
  
  return outfit;
}

/**
 * Calculate category ratio for an outfit
 * @param categories - Array of categories in the outfit
 * @returns Category ratio object
 */
function calculateCategoryRatio(categories: string[]): Record<string, number> {
  const ratio: Record<string, number> = {
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
  categories.forEach(category => {
    if (ratio[category] !== undefined) {
      ratio[category]++;
    } else {
      ratio.other++;
    }
  });
  
  // Convert to percentages
  const total = categories.length;
  Object.keys(ratio).forEach(key => {
    ratio[key] = Math.round((ratio[key] / total) * 100);
  });
  
  return ratio;
}

/**
 * Calculate completeness score for an outfit
 * @param categories - Array of categories in the outfit
 * @returns Completeness score (0-100)
 */
function calculateCompleteness(categories: string[]): number {
  // Essential categories for a complete outfit
  const essentialCategories = ['top', 'bottom', 'footwear'];
  
  // Count how many essential categories are present
  const presentEssentials = essentialCategories.filter(category => 
    categories.includes(category)
  ).length;
  
  // Calculate completeness percentage
  const completeness = Math.round((presentEssentials / essentialCategories.length) * 100);
  
  return completeness;
}

export default {
  generateOutfitsFromBoltProducts
};