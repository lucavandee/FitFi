// src/services/boltService.ts
import { safeFetch, safeFetchWithFallback } from '../utils/fetchUtils';

/**
 * Maps API endpoints to JSON filenames
 */
const mapEndpointToFilename = (endpoint: string): string => {
  // Remove leading slash and convert to filename
  const cleanEndpoint = endpoint.replace(/^\//, '');
  
  // Handle nested endpoints
  if (cleanEndpoint.includes('/')) {
    // For endpoints like "challenges/complete", just use the first part
    return cleanEndpoint.split('/')[0];
  }

  return cleanEndpoint;
};

/**
 * Mock data for fallback when JSON files are not available
 */
const mockData: Record<string, any> = {
  challenges: [
    {
      id: "challenge-1",
      title: "Bekijk je outfit van vandaag",
      description: "Open je aanbevolen outfit en klik op minstens één product.",
      points: 10,
      completed: false
    },
    {
      id: "challenge-2",
      title: "Vergelijk twee stijlen",
      description: "Bekijk producten van minstens twee verschillende archetypes.",
      points: 15,
      completed: false
    }
  ],
  products: [
    {
      id: "mock-product-1",
      title: "Mock T-shirt",
      brand: "FitFi",
      type: "shirt",
      gender: "female",
      color: "white",
      dominantColorHex: "#FFFFFF",
      styleTags: ["casual", "minimal", "clean"],
      season: "all_season",
      archetypeMatch: {
        "casual_chic": 0.9,
        "urban": 0.6
      },
      material: "Cotton",
      price: 29.99,
      imageUrl: "https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
      affiliateUrl: "https://example.com/product/mock-1",
      source: "mock"
    },
    {
      id: "mock-product-2",
      title: "Mock Jeans",
      brand: "FitFi",
      type: "jeans",
      gender: "female",
      color: "blue",
      dominantColorHex: "#0000FF",
      styleTags: ["casual", "denim"],
      season: "all_season",
      archetypeMatch: {
        "casual_chic": 0.8,
        "streetstyle": 0.7
      },
      material: "Denim",
      price: 59.99,
      imageUrl: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
      affiliateUrl: "https://example.com/product/mock-2",
      source: "mock"
    }
  ],
  outfits: [
    {
      id: "mock-outfit-1",
      title: "Casual Chic Look",
      description: "Een moeiteloze combinatie van comfort en stijl, perfect voor dagelijks gebruik.",
      archetype: "casual_chic",
      occasion: "Casual",
      products: [
        {
          id: "mock-product-1",
          name: "Mock T-shirt",
          brand: "FitFi",
          price: 29.99,
          imageUrl: "https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
          type: "shirt",
          category: "top",
          styleTags: ["casual", "minimal", "clean"]
        },
        {
          id: "mock-product-2",
          name: "Mock Jeans",
          brand: "FitFi",
          price: 59.99,
          imageUrl: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
          type: "jeans",
          category: "bottom",
          styleTags: ["casual", "denim"]
        }
      ],
      imageUrl: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2",
      tags: ["casual", "comfortable", "everyday", "minimal"],
      matchPercentage: 92,
      explanation: "Deze outfit combineert comfort met stijl, perfect voor jouw casual chic voorkeuren.",
      season: "autumn",
      structure: ["top", "bottom"],
      weather: "mild",
      categoryRatio: {
        top: 50,
        bottom: 50,
        footwear: 0,
        accessory: 0,
        outerwear: 0,
        dress: 0,
        jumpsuit: 0,
        other: 0
      },
      completeness: 80
    }
  ],
  gamification: {
    id: "mock-gamification",
    user_id: "mock-user",
    points: 120,
    level: "beginner",
    badges: ["first_quiz"],
    streak: 2,
    last_check_in: new Date().toISOString(),
    completed_challenges: ["view3", "shareLook"],
    total_referrals: 1,
    seasonal_event_progress: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  user: {
    id: "mock-user",
    name: "Test User",
    email: "test@example.com",
    gender: "female",
    stylePreferences: {
      casual: 3,
      formal: 3,
      sporty: 3,
      vintage: 3,
      minimalist: 3
    },
    isPremium: false,
    savedRecommendations: []
  }
};

/**
 * Fetch data from local JSON files in /public/data/bolt/
 */
export const fetchFromBolt = async <T>(endpoint: string): Promise<T | null> => {
  const filename = mapEndpointToFilename(endpoint);
  const url = `/data/bolt/${filename}.json`;
  const fallback = mockData[filename] ?? null;

  console.log("[🧠 boltService] Fetching from local file:", url);

  return await safeFetchWithFallback<T>(url, fallback as T);
};

/**
 * Haalt alle gamification challenges op
 */
export const fetchChallenges = async () => {
  try {
    const data = await fetchFromBolt("challenges");
    return data;
  } catch (error) {
    console.error("[❌ fetchChallenges] Error:", error);
    return null;
  }
};

/**
 * Markeert een challenge als voltooid (mock implementation)
 */
export const completeChallenge = async (userId: string, challengeId: string) => {
  console.log(`[✅ MOCK] Challenge completed: ${challengeId} for user ${userId}`);
  
  // Simulate successful completion
  return {
    success: true,
    message: `Challenge ${challengeId} completed successfully`,
    userId,
    challengeId,
    completedAt: new Date().toISOString()
  };
};

/**
 * Haalt gamification data op
 */
export const fetchGamification = async (userId?: string) => {
  try {
    const data = await fetchFromBolt("gamification");
    return data;
  } catch (error) {
    console.error("[❌ fetchGamification] Error:", error);
    return null;
  }
};

/**
 * Update gamification data (mock implementation)
 */
export const updateGamification = async (userId: string, updates: any) => {
  console.log(`[✅ MOCK] Gamification updated for user ${userId}`, updates);
  
  // Simulate successful update
  return {
    success: true,
    message: "Gamification data updated successfully",
    userId,
    updates,
    updatedAt: new Date().toISOString()
  };
};

/**
 * Haalt user data op
 */
export const fetchUser = async (userId?: string) => {
  try {
    const data = await fetchFromBolt("user");
    return data;
  } catch (error) {
    console.error("[❌ fetchUser] Error:", error);
    return null;
  }
};

/**
 * Haalt products op
 */
export const fetchProducts = async () => {
  try {
    const data = await fetchFromBolt("products");
    return data;
  } catch (error) {
    console.error("[❌ fetchProducts] Error:", error);
    return null;
  }
};

/**
 * Haalt outfits op
 */
export const fetchOutfits = async () => {
  try {
    const data = await fetchFromBolt("outfits");
    return data;
  } catch (error) {
    console.error("[❌ fetchOutfits] Error:", error);
    return null;
  }
};

export default {
  fetchFromBolt,
  fetchChallenges,
  completeChallenge,
  fetchGamification,
  updateGamification,
  fetchUser,
  fetchProducts,
  fetchOutfits,
};