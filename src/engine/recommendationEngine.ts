import { UserProfile, Product, Outfit } from './types';
import { filterAndSortProducts } from './filterAndSortProducts';
import { generateOutfits } from './generateOutfits';
import dutchProducts from '../data/dutchProducts';
import { DUTCH_ARCHETYPES, mapAnswersToArchetype, getArchetypeById } from '../config/profile-mapping.js';

/**
 * Generates personalized recommendations for a user
 * 
 * @param user - The user profile to generate recommendations for
 * @returns Array of recommended outfits
 */
export function generateRecommendations(user: UserProfile): Outfit[] {
  console.log('Supabase uitgeschakeld – fallback actief');
  
  // Step 1: Get all available products from local data
  const allProducts = getProductsFromLocalData();
  
  // Step 2: Determine user's archetype
  const archetype = determineUserArchetype(user);
  console.log(`Determined archetype: ${archetype}`);
  
  // Step 3: Filter and sort products based on user preferences
  const sortedProducts = filterAndSortProducts(allProducts, user);
  console.log(`Filtered and sorted ${sortedProducts.length} products`);
  
  // Step 4: Generate outfits based on archetype and sorted products
  const outfits = generateOutfits(archetype, sortedProducts, 3);
  console.log(`Generated ${outfits.length} outfits`);
  
  return outfits;
}

/**
 * Gets products from local data source
 * @returns Array of products
 */
function getProductsFromLocalData(): Product[] {
  // Convert Dutch products to our Product interface
  return dutchProducts.map(product => ({
    id: product.id,
    name: product.name,
    imageUrl: product.imageUrl || '/placeholder.png',
    type: product.type,
    styleTags: product.styleTags,
    description: `Prachtige ${product.type?.toLowerCase() || 'item'} in ${product.styleTags?.join(', ') || 'veelzijdige'} stijl.`,
    price: Math.floor(Math.random() * 100) + 20, // Random price between 20-120
    brand: product.brand || 'FitFi Collection',
    affiliateUrl: '#'
  }));
}

/**
 * Determines the user's style archetype based on their preferences
 * @param user - User profile
 * @returns Archetype ID
 */
function determineUserArchetype(user: UserProfile): string {
  if (!user || !user.stylePreferences) {
    return 'casual_chic'; // Default archetype
  }
  
  // Create mock quiz answers based on style preferences
  const mockAnswers: Record<string, any> = {
    style: getPreferredStyle(user.stylePreferences),
    gender: user.gender || 'female', // Default to female if not specified
    comfort: getComfortLevel(user.stylePreferences)
  };
  
  // Use the existing mapping function from profile-mapping.js
  return mapAnswersToArchetype(mockAnswers);
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

export default generateRecommendations;