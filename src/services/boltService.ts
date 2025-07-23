// src/services/boltService.ts
import { safeFetchWithFallback, fetchWithRetry } from '../utils/fetchUtils';
import dutchProducts from '../data/dutchProducts';
import { BoltProduct } from '../types/BoltProduct';
import { generateMockBoltProducts } from '../utils/boltProductsUtils';

/**
 * Maps API endpoints to JSON filenames
 */
const mapEndpointToFilename = (endpoint: string): string => {
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return cleanEndpoint.includes('/') ? cleanEndpoint.split('/')[0] : cleanEndpoint;
};

// Fallback: products getransformeerd naar BoltProduct structuur
const fallbackProducts = generateMockBoltProducts();

// Fallback: outfits met mock producten
const fallbackOutfits = [
  {
    id: "mock-outfit-1",
    title: "Casual Chic Look",
    archetype: "casual_chic",
    secondaryArchetype: "urban",
    mixFactor: 0.3,
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
    secondaryArchetype: "casual_chic",
    mixFactor: 0.2,
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
    secondaryArchetype: "urban",
    mixFactor: 0.4,
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
  products: fallbackProducts.slice(0, 20), // Limit to 20 products for performance
  outfits: fallbackOutfits.map(outfit => ({
    ...outfit,
    products: outfit.products.map(p => ({
      ...p,
      imageUrl: p.imageUrl || "https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2"
    }))
  })),
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
export const fetchFromBolt = async <T>(endpoint: string, retries: number = 1): Promise<T | null> => {
  const filename = mapEndpointToFilename(endpoint);
  const url = `${import.meta.env.BASE_URL}data/bolt/${filename}.json`;
  const fallback = mockData[filename] ?? null;

  console.log(`[🧠 boltService] Fetching from local file: ${url} (with ${retries} retries)`);

  try {
    const res = await fetch(url);
    let data = {};
    try {
      if (res.ok) {
        data = await res.json();
      } else {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      console.warn(`[boltService] Could not load ${filename}.json, using fallback:`, err);
      return fallback as T;
    }
    return data as T;
  } catch (error) {
    console.warn(`[🧠 boltService] Error fetching from ${url}, using fallback:`, error);
    return fallback as T;
  }
};

/**
 * Data service functies
 */
export const fetchChallenges = async () => {
  try {
    const challenges = await fetchFromBolt("challenges");
    if (!challenges || (Array.isArray(challenges) && challenges.length === 0)) {
      console.log("[🧠 boltService] No challenges found, using fallback");
      return mockData.challenges;
    }
    return challenges;
  } catch (error) {
    console.error("[❌ fetchChallenges] Error:", error);
    return mockData.challenges;
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
    const gamification = await fetchFromBolt("gamification");
    if (!gamification) {
      console.log("[🧠 boltService] No gamification data found, using fallback");
      return mockData.gamification;
    }
    return gamification;
  } catch (error) {
    console.error("[❌ fetchGamification] Error:", error);
    return mockData.gamification;
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
    const user = await fetchFromBolt("user");
    if (!user) {
      console.log("[🧠 boltService] No user data found, using fallback");
      return mockData.user;
    }
    return user;
  } catch (error) {
    console.error("[❌ fetchUser] Error:", error);
    return mockData.user;
  }
};

export const fetchProducts = async () => {
  try {
    const products = await fetchFromBolt("products", 2);
    if (!products || (Array.isArray(products) && products.length === 0)) {
      console.log("[🧠 boltService] No products found, using fallback");
      return mockData.products;
    }
    return products;
  } catch (error) {
    console.error("[❌ fetchProducts] Error:", error);
    return mockData.products;
  }
};

export const fetchOutfits = async () => {
  try {
    const outfits = await fetchFromBolt("outfits", 2);
    if (!outfits || (Array.isArray(outfits) && outfits.length === 0)) {
      console.log("[🧠 boltService] No outfits found, using fallback");
      return mockData.outfits;
    }
    return outfits;
  } catch (error) {
    console.error("[❌ fetchOutfits] Error:", error);
    return mockData.outfits;
  }
};

/**
 * Check if all required environment variables are available
 * @returns Whether all required environment variables are available
 */
export const checkEnvironmentVariables = (): boolean => {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_BOLT_API_URL',
    'VITE_BOLT_API_KEY'
  ];
  
  const missingVars = requiredVars.filter(
    varName => !import.meta.env[varName] || import.meta.env[varName] === ''
  );
  
  if (missingVars.length > 0) {
    console.warn(`
[⚠️ boltService] Ontbrekende omgevingsvariabelen:
${missingVars.map(v => `- ${v}`).join('\n')}

Fallback-data zal worden gebruikt voor ontbrekende functionaliteit.
    `);
    return false;
  }
  
  return true;
};

// Check environment variables on module load
checkEnvironmentVariables();

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