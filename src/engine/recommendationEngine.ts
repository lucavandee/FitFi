import React from 'react';
import { UserProfile, Product, Outfit, Season, ProductCategory, UserArchetypeProfile, OutfitGenerationOptions, Weather, ExtendedUserProfile, VariationLevel } from './types';
import { filterAndSortProducts, getTopProductsByType } from './filterAndSortProducts';
import { analyzeUserProfile, determineArchetypesFromAnswers, getStyleKeywords } from './profile-mapping';
import dutchProducts from '../data/dutchProducts';
import { getCurrentSeason, isProductInSeason, getProductCategory, getTypicalWeatherForSeason } from './helpers';
import { getZalandoProducts } from '../data/zalandoProductsAdapter';
import { isValidImageUrl } from '../utils/imageUtils';
import { env } from '../utils/env';
import { fetchProductsFromSupabase } from '../services/supabaseService';

// Dynamic import for code splitting
const generateOutfits = React.lazy(() => import('./generateOutfits'));
/**
 * Interface for recommendation options
 */
interface RecommendationOptions {
  excludeIds?: string[];
  count?: number;
  preferredOccasions?: string[];
  preferredSeasons?: Season[];
  weather?: Weather;
  variationLevel?: VariationLevel;
  enforceCompletion?: boolean;
  minCompleteness?: number;
  useZalandoProducts?: boolean;
}

/**
 * Generates personalized recommendations for a user
 * 
 * @param user - The user profile to generate recommendations for
 * @param options - Optional configuration for recommendations
 * @returns Array of recommended outfits
 */
export function generateRecommendations(user: UserProfile, options?: RecommendationOptions): Outfit[] {
  if (!env.USE_SUPABASE) {
    console.log('Supabase uitgeschakeld – fallback actief');
  }
  
  // Step 1: Get current season or preferred season
  const preferredSeasons = options?.preferredSeasons;
  const currentSeason = preferredSeasons && preferredSeasons.length > 0 
    ? preferredSeasons[0] 
    : getCurrentSeason();
  
  console.log("Active season:", currentSeason);
  
  // Step 2: Get weather condition (if specified or derive from season)
  const weather = options?.weather || getTypicalWeatherForSeason(currentSeason);
  console.log("Weather condition:", weather);
  
  // Step 3: Get all available products from local data
  const useZalandoProducts = options?.useZalandoProducts !== undefined ? options.useZalandoProducts : true;
  
  // Use an async IIFE to handle the async product loading
  return (async () => {
    let allProducts: Product[] = [];
    
    // Try to get Supabase products if enabled
    if (env.USE_SUPABASE) {
      try {
        const supabaseProducts = await fetchProductsFromSupabase();
        if (supabaseProducts && supabaseProducts.length > 0) {
          console.log('[FitFi] Supabase producten geladen:', supabaseProducts.length);
          
          // Convert to Product format
          allProducts = supabaseProducts.map(p => ({
            id: p.id,
            name: p.name,
            imageUrl: p.image_url || p.imageUrl,
            type: p.type || p.category,
            category: p.category,
            styleTags: p.tags || ['casual'],
            description: p.description || `${p.name} van ${p.brand || 'onbekend merk'}`,
            price: typeof p.price === 'number' ? p.price : parseFloat(p.price || '0'),
            brand: p.brand,
            affiliateUrl: p.url || p.affiliate_url,
            season: ['spring', 'summer', 'autumn', 'winter'] // Default all seasons
          }));
        } else {
          console.log('[FitFi] Geen Supabase producten beschikbaar, terugvallen op Zalando of lokale data');
        }
      } catch (error) {
        console.error('Error loading Supabase products:', error);
        console.log('[FitFi] Fout bij laden Supabase producten, terugvallen op Zalando of lokale data');
      }
    }
    
    // If no Supabase products, try Zalando if enabled
    if (allProducts.length === 0 && useZalandoProducts) {
      try {
        const zalandoProducts = await getZalandoProducts();
        if (zalandoProducts && zalandoProducts.length > 0) {
          console.log('[FitFi] Zalando producten geladen:', zalandoProducts.length);
          allProducts = zalandoProducts;
        } else {
          console.log('[FitFi] Geen Zalando producten beschikbaar, terugvallen op lokale data');
          allProducts = getProductsFromLocalData();
        }
      } catch (error) {
        console.error('Error loading Zalando products:', error);
        console.log('[FitFi] Fout bij laden Zalando producten, terugvallen op lokale data');
        allProducts = getProductsFromLocalData();
      }
    } else if (allProducts.length === 0) {
      // If Zalando not enabled or no products from Supabase, use local data
      allProducts = getProductsFromLocalData();
    }
    
    // Ensure all products have valid image URLs
    const validProducts = allProducts.filter(product => {
      const isValid = product.imageUrl && isValidImageUrl(product.imageUrl);
      
      if (!isValid) {
        console.warn(`⚠️ Broken image gefilterd: ${product.imageUrl} (${product.name})`);
      }
      
      return isValid;
    });
    
    console.log(`[FitFi] Filtered out ${allProducts.length - validProducts.length} products with invalid images`);
    console.log(`[FitFi] Using ${validProducts.length} products with valid images`);
    
    // Step 4: Filter products by season
    const seasonalProducts = validProducts.filter(product => isProductInSeason(product, currentSeason));
    console.log("Products suitable for season:", seasonalProducts.length);
    
    // Step 5: Determine user's archetypes (primary and secondary)
    const { primaryArchetype, secondaryArchetype, mixFactor } = determineUserArchetypes(user);
    console.log(`Determined archetypes: ${primaryArchetype} (${Math.round((1-mixFactor)*100)}%) + ${secondaryArchetype} (${Math.round(mixFactor*100)}%)`);
    
    // Step 6: Filter and sort products based on user preferences
    // Use seasonal products if we have enough, otherwise fall back to all products
    const productsToUse = seasonalProducts.length >= 10 ? seasonalProducts : validProducts;
    const sortedProducts = filterAndSortProducts(productsToUse, user);
    console.log(`Filtered and sorted ${sortedProducts.length} products`);
    
    // Log product category distribution
    logProductCategoryDistribution(sortedProducts);
    
    // Step 7: Generate outfits with options
    const count = options?.count || 3;
    const excludeIds = options?.excludeIds || [];
    const preferredOccasions = options?.preferredOccasions;
    const variationLevel = options?.variationLevel || 'medium';
    const enforceCompletion = options?.enforceCompletion !== undefined ? options.enforceCompletion : true;
    const minCompleteness = options?.minCompleteness || 80;
    
    // Generate outfits with options
    const outfits = generateOutfits(
      primaryArchetype, 
      sortedProducts, 
      count, 
      secondaryArchetype, 
      mixFactor,
      {
        excludeIds,
        preferredOccasions,
        preferredSeasons: preferredSeasons || [currentSeason],
        weather,
        maxAttempts: 10,
        variationLevel,
        enforceCompletion,
        minCompleteness
      }
    );
    console.log(`Generated ${outfits.length} outfits`);
    
    // Log outfit composition
    outfits.forEach((outfit, index) => {
      console.log(`Outfit ${index + 1} composition:`, 
        outfit.products.map(p => `${p.type || p.category} (${getProductCategory(p)})`).join(', ')
      );
      
      // Log structure if available
      if (outfit.structure) {
        console.log(`Outfit ${index + 1} structure:`, outfit.structure.join(', '));
      }
      
      // Log completeness and category ratio
      console.log(`Outfit ${index + 1} completeness:`, outfit.completeness);
      console.log(`Outfit ${index + 1} category ratio:`, outfit.categoryRatio);
      
      // Log season and weather
      console.log(`Outfit ${index + 1} season:`, outfit.season);
      console.log(`Outfit ${index + 1} weather:`, outfit.weather);
    });
    
    return outfits;
  })();
}

/**
 * Logs the distribution of product categories
 */
function logProductCategoryDistribution(products: Product[]): void {
  const categoryCounts: Record<string, number> = {};
  
  products.forEach(product => {
    const category = getProductCategory(product);
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  console.log("Product category distribution:", categoryCounts);
}

/**
 * Gets products from local data source
 * @returns Array of products
 */
function getProductsFromLocalData(): Product[] {
  // Convert Dutch products to our Product interface
  const products = dutchProducts.map(product => ({
    id: product.id,
    name: product.name,
    imageUrl: product.imageUrl || '/placeholder.png',
    type: product.type,
    category: product.category,
    styleTags: product.styleTags,
    description: `Prachtige ${product.type?.toLowerCase() || 'item'} in ${product.styleTags?.join(', ') || 'veelzijdige'} stijl.`,
    price: product.price || Math.floor(Math.random() * 100) + 20, // Use provided price or random price between 20-120
    brand: product.brand || 'FitFi Collection',
    affiliateUrl: '#',
    season: product.season // Include season information
  }));
  
  // Filter out products with invalid image URLs
  const validProducts = products.filter(product => {
    const isValid = product.imageUrl && isValidImageUrl(product.imageUrl);
    
    if (!isValid) {
      console.warn(`⚠️ Broken image gefilterd: ${product.imageUrl} (${product.name})`);
    }
    
    return isValid;
  });
  
  console.log(`[FitFi] Filtered out ${products.length - validProducts.length} local products with invalid images`);
  console.log(`[FitFi] Using ${validProducts.length} local products with valid images`);
  
  return validProducts;
}

/**
 * Determines the user's primary and secondary style archetypes based on their preferences
 * @param user - User profile
 * @returns Object with primary and secondary archetypes and mix factor
 */
function determineUserArchetypes(user: UserProfile): {
  primaryArchetype: string;
  secondaryArchetype: string;
  mixFactor: number;
} {
  if (!user || !user.stylePreferences) {
    return {
      primaryArchetype: 'casual_chic',
      secondaryArchetype: 'klassiek',
      mixFactor: 0.3
    };
  }
  
  // If we have style preferences, use them for more accurate analysis
  if (user.stylePreferences) {
    const profileAnalysis = analyzeUserProfile(user.stylePreferences);
    return {
      primaryArchetype: profileAnalysis.dominantArchetype,
      secondaryArchetype: profileAnalysis.secondaryArchetype,
      mixFactor: profileAnalysis.mixFactor
    };
  }
  
  // Create mock quiz answers based on style preferences
  const mockAnswers: Record<string, any> = {
    style: getPreferredStyle(user.stylePreferences),
    gender: user.gender || 'female', // Default to female if not specified
    comfort: getComfortLevel(user.stylePreferences)
  };
  
  // Use the determineArchetypesFromAnswers function
  return determineArchetypesFromAnswers(mockAnswers, user.stylePreferences);
}

/**
 * Gets the preferred style based on style preferences
 * @param preferences - User's style preferences
 * @returns Preferred style
 */
function getPreferredStyle(preferences: Record<string, number>): string {
  // Find the style with the highest preference value
  let highestValue = 0;
  let preferredStyle = 'casual';
  
  Object.entries(preferences).forEach(([style, value]) => {
    if (value > highestValue) {
      highestValue = value;
      preferredStyle = style;
    }
  });
  
  // Map our internal style names to the ones expected by mapAnswersToArchetype
  const styleMapping: Record<string, string> = {
    'casual': 'casual',
    'formal': 'classic',
    'sporty': 'streetwear',
    'vintage': 'vintage',
    'minimalist': 'minimalist'
  };
  
  return styleMapping[preferredStyle] || 'casual';
}

/**
 * Gets the comfort level based on style preferences
 * @param preferences - User's style preferences
 * @returns Comfort level (1-10)
 */
function getComfortLevel(preferences: Record<string, number>): number {
  // Higher preference for casual and sporty styles indicates higher comfort preference
  const casualPreference = preferences.casual || 0;
  const sportyPreference = preferences.sporty || 0;
  
  // Calculate comfort level (1-10)
  const comfortLevel = Math.round(((casualPreference + sportyPreference) / 10) * 5) + 5;
  
  // Ensure comfort level is between 1 and 10
  return Math.min(Math.max(comfortLevel, 1), 10);
}

/**
 * Gets recommended products for a user
 * 
 * @param user - The user profile to get recommendations for
 * @param count - Number of products to recommend
 * @param season - Optional specific season to filter by
 * @param useZalandoProducts - Whether to use Zalando products
 * @returns Array of recommended products
 */
export function getRecommendedProducts(
  user: UserProfile, 
  count: number = 9, 
  season?: Season,
  useZalandoProducts: boolean = true
): Product[] {
  // Use an async IIFE to handle the async product loading
  return (async () => {
    // Get current season or use specified season
    const activeSeason = season || getCurrentSeason();
    console.log("Active season for product recommendations:", activeSeason);
    
    // Get all available products
    let allProducts: Product[] = [];
    
    // Try to get Supabase products if enabled
    if (env.USE_SUPABASE) {
      try {
        const supabaseProducts = await fetchProductsFromSupabase();
        if (supabaseProducts && supabaseProducts.length > 0) {
          console.log('[FitFi] Supabase producten geladen voor aanbevelingen:', supabaseProducts.length);
          
          // Convert to Product format
          allProducts = supabaseProducts.map(p => ({
            id: p.id,
            name: p.name,
            imageUrl: p.image_url || p.imageUrl,
            type: p.type || p.category,
            category: p.category,
            styleTags: p.tags || ['casual'],
            description: p.description || `${p.name} van ${p.brand || 'onbekend merk'}`,
            price: typeof p.price === 'number' ? p.price : parseFloat(p.price || '0'),
            brand: p.brand,
            affiliateUrl: p.url || p.affiliate_url,
            season: ['spring', 'summer', 'autumn', 'winter'] // Default all seasons
          }));
        } else {
          console.log('[FitFi] Geen Supabase producten beschikbaar, terugvallen op Zalando of lokale data');
        }
      } catch (error) {
        console.error('Error loading Supabase products:', error);
        console.log('[FitFi] Fout bij laden Supabase producten, terugvallen op Zalando of lokale data');
      }
    }
    
    // If no Supabase products, try Zalando if enabled
    if (allProducts.length === 0 && useZalandoProducts) {
      try {
        const zalandoProducts = await getZalandoProducts();
        if (zalandoProducts && zalandoProducts.length > 0) {
          console.log('[FitFi] Zalando producten geladen voor aanbevelingen:', zalandoProducts.length);
          allProducts = zalandoProducts;
        } else {
          console.log('[FitFi] Geen Zalando producten beschikbaar, terugvallen op lokale data');
          allProducts = getProductsFromLocalData();
        }
      } catch (error) {
        console.error('Error loading Zalando products:', error);
        console.log('[FitFi] Fout bij laden Zalando producten, terugvallen op lokale data');
        allProducts = getProductsFromLocalData();
      }
    } else if (allProducts.length === 0) {
      // If Zalando not enabled or no products from Supabase, use local data
      allProducts = getProductsFromLocalData();
    }
    
    // Ensure all products have valid image URLs
    const validProducts = allProducts.filter(product => {
      const isValid = product.imageUrl && isValidImageUrl(product.imageUrl);
      
      if (!isValid) {
        console.warn(`⚠️ Broken image gefilterd: ${product.imageUrl} (${product.name})`);
      }
      
      return isValid;
    });
    
    console.log(`[FitFi] Using ${validProducts.length} products with valid images for recommendations`);
    
    // Filter products by season
    const seasonalProducts = validProducts.filter(product => isProductInSeason(product, activeSeason));
    console.log("Products suitable for season:", seasonalProducts.length);
    
    // Use seasonal products if we have enough, otherwise fall back to all products
    const productsToUse = seasonalProducts.length >= count ? seasonalProducts : validProducts;
    
    // Filter and sort products based on user preferences
    const sortedProducts = filterAndSortProducts(productsToUse, user);
    
    // Get top products by type to ensure diversity
    return getTopProductsByType(sortedProducts, Math.ceil(count / 3));
  })();
}

export default {
  generateRecommendations,
  getRecommendedProducts
};