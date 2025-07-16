// src/services/boltService.ts
import { safeFetch, fetchWithRetry } from '../utils/fetchUtils';

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
 * Fetch data from local JSON files in /public/data/bolt/
 */
export const fetchFromBolt = async <T>(endpoint: string): Promise<T | null> => {
  const filename = mapEndpointToFilename(endpoint);
  const url = `/data/bolt/${filename}.json`;

  console.log("[🧠 boltService] Fetching from local file:", url);

  try {
    return await safeFetch<T>(url);
  } catch (error) {
    console.error("[❌ fetchFromBolt] Error fetching", endpoint, error);
    return null;
  }
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
