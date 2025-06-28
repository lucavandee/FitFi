import { API_CONFIG, USE_BOLT } from '../config/app-config';
import { UserProfile } from '../context/UserContext';
import { isValidImageUrl } from '../utils/imageUtils';

/**
 * Bolt API service
 * This service provides functions to fetch data from the Bolt API
 * with proper error handling and fallbacks
 */

// Simulated network delay for realistic testing
const SIMULATED_DELAY = 800;

// Simulated success rate (0-1)
const SIMULATED_SUCCESS_RATE = 1.0;

/**
 * Fetch data from the Bolt API with error handling and fallbacks
 * @param endpoint - API endpoint to fetch from
 * @param params - Optional parameters for the request
 * @returns Promise that resolves to the fetched data or fallback data
 */
export async function fetchFromBolt<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  // If Bolt API is disabled, use fallback immediately
  if (!USE_BOLT) {
    console.log(`[Bolt API] Disabled - using fallback for ${endpoint}`);
    return getFallbackData<T>(endpoint, params);
  }

  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY));
    
    // In a real implementation, this would be an actual API call
    // For now, we'll simulate success/failure based on a probability
    if (Math.random() > SIMULATED_SUCCESS_RATE) {
      throw new Error("Simulated Bolt API failure");
    }
    
    // Log the request
    console.log(`[Bolt API] Fetching from ${endpoint}`, params);
    
    // Simulate different endpoints
    switch (endpoint) {
      case '/api/bolt/outfits':
        return simulateOutfitsResponse(params) as unknown as T;
      case '/api/bolt/user':
        return simulateUserResponse(params.userId) as unknown as T;
      case '/api/bolt/gamification':
        return simulateGamificationResponse(params.userId) as unknown as T;
      case '/api/bolt/challenges':
        return simulateChallengesResponse(params.userId) as unknown as T;
      case '/api/bolt/products':
        return simulateProductsResponse(params.category, params.count) as unknown as T;
      default:
        // For unknown endpoints, return fallback data
        return getFallbackData<T>(endpoint, params);
    }
  } catch (error) {
    // Log the error
    console.error(`[Bolt API] Error fetching from ${endpoint}:`, error);
    
    // Return fallback data
    return getFallbackData<T>(endpoint, params);
  }
}

/**
 * Get fallback data for a specific endpoint
 * @param endpoint - API endpoint
 * @param params - Request parameters
 * @returns Fallback data for the endpoint
 */
function getFallbackData<T>(endpoint: string, params: Record<string, any> = {}): T {
  console.log(`[Bolt API] Using fallback data for ${endpoint}`);
  
  // Return appropriate fallback data based on the endpoint
  switch (endpoint) {
    case '/api/bolt/outfits':
      return simulateOutfitsResponse(params) as unknown as T;
    case '/api/bolt/user':
      return simulateUserResponse(params.userId) as unknown as T;
    case '/api/bolt/gamification':
      return simulateGamificationResponse(params.userId) as unknown as T;
    case '/api/bolt/challenges':
      return simulateChallengesResponse(params.userId) as unknown as T;
    case '/api/bolt/products':
      return simulateProductsResponse(params.category, params.count) as unknown as T;
    default:
      // For unknown endpoints, return an empty object
      console.warn(`[Bolt API] No fallback data available for ${endpoint}`);
      return {} as T;
  }
}

/**
 * Simulate an outfits response from the Bolt API
 * @param params - Request parameters
 * @returns Simulated outfits response
 */
const simulateOutfitsResponse = (params: Record<string, any>) => {
  const { user, count = 3 } = params;
  
  // Generate outfit IDs
  const outfitIds = Array.from({ length: count }, (_, i) => `bolt-outfit-${i + 1}`);
  
  // Generate outfits
  return {
    outfits: outfitIds.map((id, index) => ({
      id,
      title: `Bolt ${index === 0 ? 'Casual' : index === 1 ? 'Formal' : 'Streetwear'} Outfit`,
      description: `Een ${index === 0 ? 'casual' : index === 1 ? 'formele' : 'streetwear'} outfit samengesteld door Bolt AI.`,
      archetype: index === 0 ? 'casual_chic' : index === 1 ? 'klassiek' : 'streetstyle',
      occasion: index === 0 ? 'Casual' : index === 1 ? 'Werk' : 'Uitgaan',
      products: [
        {
          id: `bolt-product-${index}-1`,
          name: `${index === 0 ? 'Casual' : index === 1 ? 'Formal' : 'Streetwear'} Top`,
          brand: 'Bolt Fashion',
          price: 49.99 + (index * 10),
          imageUrl: `https://images.pexels.com/photos/${5935748 + index}/pexels-photo-${5935748 + index}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2`,
          type: 'top',
          category: 'top',
          styleTags: [index === 0 ? 'casual' : index === 1 ? 'formal' : 'streetstyle']
        },
        {
          id: `bolt-product-${index}-2`,
          name: `${index === 0 ? 'Casual' : index === 1 ? 'Formal' : 'Streetwear'} Bottom`,
          brand: 'Bolt Fashion',
          price: 69.99 + (index * 10),
          imageUrl: `https://images.pexels.com/photos/${1082529 + index}/pexels-photo-${1082529 + index}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2`,
          type: 'bottom',
          category: 'bottom',
          styleTags: [index === 0 ? 'casual' : index === 1 ? 'formal' : 'streetstyle']
        },
        {
          id: `bolt-product-${index}-3`,
          name: `${index === 0 ? 'Casual' : index === 1 ? 'Formal' : 'Streetwear'} Shoes`,
          brand: 'Bolt Fashion',
          price: 89.99 + (index * 10),
          imageUrl: `https://images.pexels.com/photos/${267301 + index}/pexels-photo-${267301 + index}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2`,
          type: 'footwear',
          category: 'footwear',
          styleTags: [index === 0 ? 'casual' : index === 1 ? 'formal' : 'streetstyle']
        }
      ],
      imageUrl: `https://images.pexels.com/photos/${2043590 + index}/pexels-photo-${2043590 + index}.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2`,
      tags: [index === 0 ? 'casual' : index === 1 ? 'formal' : 'streetstyle', 'bolt', 'ai-generated'],
      matchPercentage: 85 + (index * 5),
      explanation: `Deze outfit past bij jouw ${index === 0 ? 'casual' : index === 1 ? 'formele' : 'streetwear'} stijlvoorkeuren en is perfect voor ${index === 0 ? 'dagelijks gebruik' : index === 1 ? 'werk of formele gelegenheden' : 'een avond uit'}.`,
      season: 'autumn',
      structure: ['top', 'bottom', 'footwear'],
      weather: 'mild',
      categoryRatio: {
        top: 33,
        bottom: 33,
        footwear: 33,
        accessory: 0,
        outerwear: 0,
        dress: 0,
        jumpsuit: 0,
        other: 0
      },
      completeness: 90 + (index * 2)
    }))
  };
};

/**
 * Simulate a user response from the Bolt API
 * @param userId - User ID to fetch
 * @returns Simulated user response
 */
const simulateUserResponse = (userId: string): UserProfile => {
  return {
    id: userId,
    name: 'Bolt Test User',
    email: 'bolt-test@example.com',
    gender: 'female',
    stylePreferences: {
      casual: 4,
      formal: 3,
      sporty: 2,
      vintage: 4,
      minimalist: 5
    },
    isPremium: false,
    savedRecommendations: ['bolt-outfit-1', 'bolt-outfit-2']
  };
};

/**
 * Simulate a gamification response from the Bolt API
 * @param userId - User ID to fetch gamification data for
 * @returns Simulated gamification response
 */
const simulateGamificationResponse = (userId: string) => {
  return {
    id: `bolt-gamification-${userId}`,
    user_id: userId,
    points: 250,
    level: 'pro',
    badges: ['first_quiz', 'seven_day_streak', 'style_explorer'],
    streak: 7,
    last_check_in: new Date().toISOString(),
    completed_challenges: ['view3', 'shareLook', 'saveOutfit', 'completeProfile'],
    total_referrals: 2,
    seasonal_event_progress: {
      winter_fashion_week: {
        progress: 60,
        completed_tasks: ['task1', 'task2', 'task3'],
        rewards_claimed: ['reward1']
      }
    },
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  };
};

/**
 * Simulate a challenges response from the Bolt API
 * @param userId - User ID to fetch challenges for
 * @returns Simulated challenges response
 */
const simulateChallengesResponse = (userId: string) => {
  return {
    challenges: [
      {
        id: 'bolt-challenge-1',
        user_id: userId,
        challenge_id: 'view3',
        completed: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'bolt-challenge-2',
        user_id: userId,
        challenge_id: 'shareLook',
        completed: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'bolt-challenge-3',
        user_id: userId,
        challenge_id: 'saveOutfit',
        completed: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'bolt-challenge-4',
        user_id: userId,
        challenge_id: 'completeProfile',
        completed: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'bolt-challenge-5',
        user_id: userId,
        challenge_id: 'visitShop',
        completed: false,
        created_at: new Date().toISOString()
      }
    ]
  };
};

/**
 * Simulate a products response from the Bolt API
 * @param category - Optional category to filter by
 * @param count - Number of products to return
 * @returns Simulated products response
 */
const simulateProductsResponse = (category?: string, count: number = 20) => {
  // Generate product IDs
  const productIds = Array.from({ length: count }, (_, i) => `bolt-product-${i + 1}`);
  
  // Product categories
  const categories = ['top', 'bottom', 'footwear', 'accessory', 'outerwear'];
  
  // Generate products
  const products = productIds.map((id, index) => {
    // Determine category
    const productCategory = category || categories[index % categories.length];
    
    // Determine image URL based on category
    let imageUrl = '';
    switch (productCategory) {
      case 'top':
        imageUrl = `https://images.pexels.com/photos/${5935748 + index}/pexels-photo-${5935748 + index}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2`;
        break;
      case 'bottom':
        imageUrl = `https://images.pexels.com/photos/${1082529 + index}/pexels-photo-${1082529 + index}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2`;
        break;
      case 'footwear':
        imageUrl = `https://images.pexels.com/photos/${267301 + index}/pexels-photo-${267301 + index}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2`;
        break;
      case 'accessory':
        imageUrl = `https://images.pexels.com/photos/${1280064 + index}/pexels-photo-${1280064 + index}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2`;
        break;
      case 'outerwear':
        imageUrl = `https://images.pexels.com/photos/${7679720 + index}/pexels-photo-${7679720 + index}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2`;
        break;
      default:
        imageUrl = `https://images.pexels.com/photos/${5935748 + index}/pexels-photo-${5935748 + index}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2`;
    }
    
    // Ensure image URL is valid
    if (!isValidImageUrl(imageUrl)) {
      imageUrl = 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2';
    }
    
    return {
      id,
      name: `Bolt ${productCategory.charAt(0).toUpperCase() + productCategory.slice(1)} ${index + 1}`,
      brand: 'Bolt Fashion',
      price: 49.99 + (index * 5),
      imageUrl,
      type: productCategory,
      category: productCategory,
      styleTags: ['casual', 'bolt', index % 2 === 0 ? 'minimalist' : 'streetstyle'],
      description: `Een stijlvolle ${productCategory} van Bolt Fashion, perfect voor dagelijks gebruik.`,
      season: ['spring', 'summer', 'autumn', 'winter']
    };
  });
  
  return { products };
};

export default {
  fetchFromBolt
};