import { Outfit } from '../engine';
import { BoltProduct } from '../types/BoltProduct';
import { generateOutfitExplanation } from '../engine/explainOutfit';
import { isValidImageUrl } from '../utils/imageUtils';

/**
 * Category mapping for product types
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
 * Enrich an outfit with BoltProducts
 * @param outfit - Outfit to enrich
 * @param products - Array of BoltProducts to use
 * @returns Enriched outfit
 */
function enrichOutfitWithBoltProducts(outfit: Outfit, products: BoltProduct[]): Outfit {
  // Filter products by gender based on outfit archetype
  // For simplicity, we'll assume female for all outfits
  const genderProducts = products.filter(product => product.gender === 'female');
  
  if (genderProducts.length === 0) {
    console.warn('No products matching gender found');
    return outfit;
  }
  
  // Filter products by archetype match
  const archetypeProducts = genderProducts.filter(product => {
    const score = product.archetypeMatch[outfit.archetype] || 0;
    return score >= 0.5;
  });
  
  if (archetypeProducts.length === 0) {
    console.warn(`No products matching archetype ${outfit.archetype} found`);
    return outfit;
  }
  
  // Group products by type
  const productsByType = archetypeProducts.reduce((groups, product) => {
    const type = product.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(product);
    return groups;
  }, {} as Record<string, BoltProduct[]>);
  
  // Get product types needed for the outfit
  const neededTypes = getNeededProductTypes(outfit);
  
  // Select products for the outfit
  const selectedProducts: BoltProduct[] = [];
  
  // Try to select one product for each needed type
  for (const type of neededTypes) {
    if (productsByType[type] && productsByType[type].length > 0) {
      // Sort by archetype match score
      const sortedProducts = [...productsByType[type]].sort((a, b) => {
        const scoreA = a.archetypeMatch[outfit.archetype] || 0;
        const scoreB = b.archetypeMatch[outfit.archetype] || 0;
        return scoreB - scoreA;
      });
      
      // Select the best matching product
      const selectedProduct = sortedProducts[0];
      if (selectedProduct) selectedProducts.push(selectedProduct);
    }
  }
  
  // If we couldn't find products for all needed types, add some random products
  if (selectedProducts.length < 3 && archetypeProducts.length >= 3) {
    // Sort all products by archetype match score
    const sortedProducts = [...archetypeProducts].sort((a, b) => {
      const scoreA = a.archetypeMatch[outfit.archetype] || 0;
      const scoreB = b.archetypeMatch[outfit.archetype] || 0;
      return scoreB - scoreA;
    });
    
    // Add products until we have at least 3
    for (let i = 0; selectedProducts.length < 3 && i < sortedProducts.length; i++) {
      const product = sortedProducts[i];
      if (product && !selectedProducts.some(p => p.id === product.id)) {
        selectedProducts.push(product);
      }
    }
  }
  
  // If we still don't have enough products, return the original outfit
  if (selectedProducts.length < 2) {
    console.warn('Not enough products to enrich outfit');
    return outfit;
  }
  
  // Validate and get safe image URLs for products
  let fallbackImageCount = 0;
  const productsWithSafeImages = selectedProducts.map(p => {
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
    console.log(`[OutfitEnricher] Using ${fallbackImageCount}/${productsWithSafeImages.length} fallback images for outfit ${outfit.id}`);
  }
  
  // Create enriched outfit
  const enrichedOutfit: Outfit = {
    ...outfit,
    products: productsWithSafeImages.map(p => ({
      id: p.id,
      name: p.title,
      brand: p.brand,
      price: p.price,
      imageUrl: p.imageUrl,
      url: p.affiliateUrl,
      retailer: 'Zalando',
      category: CATEGORY_MAPPING[p.type] || 'other'
    })),
    imageUrl: productsWithSafeImages.length > 0
      ? getSafeImageUrl(productsWithSafeImages[0]!.imageUrl, productsWithSafeImages[0]!.type)
      : FALLBACK_IMAGES.default,
    structure: productsWithSafeImages.map(p => CATEGORY_MAPPING[p.type] || 'other'),
    categoryRatio: calculateCategoryRatio(productsWithSafeImages.map(p => CATEGORY_MAPPING[p.type] || 'other')),
  }
  
  // Generate explanation
  const explanation = generateOutfitExplanation(
    enrichedOutfit,
    outfit.archetype,
    outfit.occasion
  );
  
  // Add explanation to enriched outfit
  enrichedOutfit.explanation = explanation;
  
  return enrichedOutfit;
}

/**
 * Get needed product types for an outfit
 * @param outfit - Outfit to get needed types for
 * @returns Array of needed product types
 */
function getNeededProductTypes(outfit: Outfit): string[] {
  // Essential product types
  const essentialTypes = ['top', 'shirt', 'blouse', 'trui', 'sweater'];
  
  // Bottom types
  const bottomTypes = ['broek', 'jeans', 'rok', 'short', 'legging'];
  
  // Footwear types
  const footwearTypes = ['schoenen', 'sneaker'];
  
  // Optional types
  const optionalTypes = ['jas', 'tas', 'accessoire', 'vest'];
  
  // Combine all types
  return [...essentialTypes, ...bottomTypes, ...footwearTypes, ...optionalTypes];
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
 * Get a fallback image URL for a product type
 * @param type - Product type
 * @returns Fallback image URL
 */
function getFallbackImage(type: string): string {
  const category = CATEGORY_MAPPING[type] || 'default';
  return FALLBACK_IMAGES[category as keyof typeof FALLBACK_IMAGES] || FALLBACK_IMAGES.default;
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
      ratio[category] = (ratio[category] ?? 0) + 1;
    } else {
      ratio.other = (ratio.other ?? 0) + 1;
    }
  });
  
  // Convert to percentages
  const total = categories.length;
  Object.keys(ratio).forEach(key => {
    ratio[key] = Math.round(((ratio[key] ?? 0) / total) * 100);
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
  enrichOutfitWithBoltProducts
};