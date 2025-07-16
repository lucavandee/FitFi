// src/services/boltService.ts
import { safeFetchWithFallback } from '../utils/fetchUtils';
import dutchProducts from '../data/dutchProducts';
import { BoltProduct } from '../types/BoltProduct';

/**
 * Maps API endpoints to JSON filenames
 */
const mapEndpointToFilename = (endpoint: string): string => {
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return cleanEndpoint.includes('/') ? cleanEndpoint.split('/')[0] : cleanEndpoint;
};

// Fallback: products getransformeerd naar BoltProduct structuur
const fallbackProducts = dutchProducts.map((p, i) => ({
  id: `bolt-${p.id}`,
  title: p.name,
  brand: p.brand || "FitFi Brand",
  type: p.type || p.category || "top",
  gender: i % 2 === 0 ? "female" : "male",
  color: p.styleTags?.includes("black") ? "black" : "beige",
  dominantColorHex: p.styleTags?.includes("black") ? "#000000" : "#F5F5DC",
  styleTags: p.styleTags || ["casual"],
  season: "all_season",
  archetypeMatch: {
    casual_chic: 0.8,
    klassiek: 0.6
  },
  material: "Mixed materials",
  price: p.price || 49.99,
  imageUrl: p.imageUrl || "https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
  affiliateUrl: `https://example.com/product/${p.id}`,
  source: "mock"
}));

// Fallback: outfits met mock producten
const fallbackOutfits = [
  {
    id: "mock-outfit-1",
    title: "Casual Chic Look",
    archetype: "casual_chic",
    occasion: "Casual",
    products: fallbackProducts.slice(0, 3),
    imageUrl: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2",
    tags: ["casual", "comfortable", "everyday", "minimal"],
    matchPercentage: 92,
    explanation: "Comfortabel en stijlvol, met neutrale kleuren en cleane lijnen.",
    season: "autumn",
    structure: ["top", "bottom", "footwear"],
    weather: "mild",
    categoryRatio: {
      top: 33, bottom: 33, footwear: 33,
      accessory: 0, outerwear: 0, dress: 0, jumpsuit: 0, other: 0
    },
    completeness: 100
  },
  {
    id: "mock-outfit-2",
    title: "Klassieke Werkoutfit",
    archetype: "klassiek",
    occasion: "Werk",
    products: fallbackProducts.slice(3, 6),
    imageUrl: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2",
    tags: ["formal", "business", "professional", "elegant"],
    matchPercentage: 95,
    explanation: "Elegante en professionele look met tijdloze kleuren.",
    season: "autumn",
    structure: ["top", "bottom", "footwear", "accessory"],
    weather: "mild",
    categoryRatio: {
      top: 25, bottom: 25, footwear: 25, accessory: 25,
      outerwear: 0, dress: 0, jumpsuit: 0, other: 0
    },
    completeness: 100
  },
  {
    id: "mock-outfit-3",
    title: "Urban Streetstyle Look",
    archetype: "streetstyle",
    occasion: "Uitgaan",
    products: fallbackProducts.slice(6, 9),
    imageUrl: "https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2",
    tags: ["street", "urban", "trendy", "casual"],
    matchPercentage: 88,
    explanation: "Statement items en comfort voor een avond uit.",
    season: "autumn",
    structure: ["top", "bottom", "footwear"],
    weather: "mild",
    categoryRatio: {
      top: 33, bottom: 33, footwear: 33,
      accessory: 0, outerwear: 0, dress: 0, jumpsuit: 0, other: 0
    },
    completeness: 100
  }
];

// Complete fallback dataset per endpoint
const mockData: Record<string, any> = {
  products: fallbackProducts,
  outfits: fallbackOutfits,
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
 * Data service functies
 */
export const fetchChallenges = async () => {
  try {
    return await fetchFromBolt("challenges");
  } catch (error) {
    console.error("[❌ fetchChallenges] Error:", error);
    return null;
  }
};

export const completeChallenge = async (userId: string, challengeId: string) => {
  console.log(`[✅ MOCK] Challenge completed: ${challengeId} for user ${userId}`);
  return {
    success: true,
    message: `Challenge ${challengeId} completed successfully`,
    userId,
    challengeId,
    completedAt: new Date().toISOString()
  };
};

export const fetchGamification = async () => {
  try {
    return await fetchFromBolt("gamification");
  } catch (error) {
    console.error("[❌ fetchGamification] Error:", error);
    return null;
  }
};

export const updateGamification = async (userId: string, updates: any) => {
  console.log(`[✅ MOCK] Gamification updated for user ${userId}`, updates);
  return {
    success: true,
    message: "Gamification data updated successfully",
    userId,
    updates,
    updatedAt: new Date().toISOString()
  };
};

export const fetchUser = async () => {
  try {
    return await fetchFromBolt("user");
  } catch (error) {
    console.error("[❌ fetchUser] Error:", error);
    return null;
  }
};

export const fetchProducts = async () => {
  try {
    return await fetchFromBolt("products");
  } catch (error) {
    console.error("[❌ fetchProducts] Error:", error);
    return null;
  }
};

export const fetchOutfits = async () => {
  try {
    return await fetchFromBolt("outfits");
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
  fetchOutfits
};