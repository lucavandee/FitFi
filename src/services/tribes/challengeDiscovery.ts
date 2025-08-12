import { supabase } from "@/lib/supabaseClient";
import { fetchTribeChallenges } from "@/services/data/tribeChallengesService";
import type { TribeChallenge } from "@/services/data/types";

/**
 * Challenge Discovery Service
 * Finds the best open challenge for a user based on their tribe memberships
 */

/**
 * Find the best open challenge for a user
 * Priority: (1) Challenges from joined tribes, (2) Global open challenges
 * 
 * @param userId - User ID to find challenges for
 * @returns Object with tribeId and challengeId, or null if no challenges found
 */
export async function findBestOpenChallenge(userId?: string): Promise<{ tribeId?: string; challengeId?: string } | null> {
  try {
    // 1) Get joined tribes for authenticated users
    const sb = supabase();
    let joinedTribes: string[] = [];
    
    if (sb && userId) {
      try {
        const { data, error } = await sb
          .from("tribe_members")
          .select("tribe_id")
          .eq("user_id", userId);
        
        if (!error && data) {
          joinedTribes = data.map((r: any) => r.tribe_id);
          console.log(`[ChallengeDiscovery] User ${userId} is member of ${joinedTribes.length} tribes`);
        }
      } catch (error) {
        console.warn('[ChallengeDiscovery] Could not fetch user tribes:', error);
      }
    }

    // 2) Search for open challenges within joined tribes first
    for (const tribeId of joinedTribes) {
      try {
        const challenges = await fetchTribeChallenges(tribeId, { 
          status: "open", 
          limit: 5 
        });
        
        const openChallenge = challenges.find(c => c.status === "open");
        if (openChallenge) {
          console.log(`[ChallengeDiscovery] Found open challenge in joined tribe: ${openChallenge.title}`);
          return { 
            tribeId: openChallenge.tribeId, 
            challengeId: openChallenge.id 
          };
        }
      } catch (error) {
        console.warn(`[ChallengeDiscovery] Error fetching challenges for tribe ${tribeId}:`, error);
        continue;
      }
    }

    // 3) Fallback: Search in popular tribes for global open challenges
    const fallbackTribes = joinedTribes.length === 0 ? [
      "tribe-italian-smart-casual",
      "tribe-streetstyle-europe",
      "tribe-minimalist-collective",
      "tribe-sustainable-fashion",
      "tribe-vintage-revival"
    ] : [];

    for (const tribeId of fallbackTribes) {
      try {
        const challenges = await fetchTribeChallenges(tribeId, { 
          status: "open", 
          limit: 3 
        });
        
        const openChallenge = challenges.find(c => c.status === "open");
        if (openChallenge) {
          console.log(`[ChallengeDiscovery] Found open challenge in fallback tribe: ${openChallenge.title}`);
          return { 
            tribeId: openChallenge.tribeId, 
            challengeId: openChallenge.id 
          };
        }
      } catch (error) {
        console.warn(`[ChallengeDiscovery] Error fetching fallback challenges for tribe ${tribeId}:`, error);
        continue;
      }
    }

    console.log('[ChallengeDiscovery] No open challenges found');
    return null;
  } catch (error) {
    console.error('[ChallengeDiscovery] Error finding best challenge:', error);
    return null;
  }
}

/**
 * Get challenge details by ID
 * 
 * @param challengeId - Challenge ID to fetch
 * @returns Challenge object or null if not found
 */
export async function getChallengeById(challengeId: string): Promise<TribeChallenge | null> {
  try {
    // Try to find challenge across all tribes
    // This is a simplified approach - in production you'd want to optimize this
    const fallbackTribes = [
      "tribe-italian-smart-casual",
      "tribe-streetstyle-europe",
      "tribe-minimalist-collective",
      "tribe-sustainable-fashion",
      "tribe-vintage-revival",
      "tribe-luxury-connoisseurs"
    ];

    for (const tribeId of fallbackTribes) {
      try {
        const challenges = await fetchTribeChallenges(tribeId);
        const challenge = challenges.find(c => c.id === challengeId);
        
        if (challenge) {
          console.log(`[ChallengeDiscovery] Found challenge ${challengeId} in tribe ${tribeId}`);
          return challenge;
        }
      } catch (error) {
        console.warn(`[ChallengeDiscovery] Error searching tribe ${tribeId} for challenge:`, error);
        continue;
      }
    }

    console.log(`[ChallengeDiscovery] Challenge ${challengeId} not found`);
    return null;
  } catch (error) {
    console.error('[ChallengeDiscovery] Error getting challenge by ID:', error);
    return null;
  }
}

/**
 * Get user's challenge participation status
 * 
 * @param userId - User ID
 * @param challengeId - Challenge ID
 * @returns Participation status
 */
export async function getUserChallengeStatus(
  userId: string, 
  challengeId: string
): Promise<{
  hasParticipated: boolean;
  submissionId?: string;
  score?: number;
  isWinner?: boolean;
}> {
  try {
    const sb = supabase();
    if (!sb) {
      return { hasParticipated: false };
    }

    const { data, error } = await sb
      .from("tribe_challenge_submissions")
      .select("id, score, isWinner")
      .eq("userId", userId)
      .eq("challengeId", challengeId)
      .maybeSingle();

    if (error) {
      console.warn('[ChallengeDiscovery] Error checking participation:', error);
      return { hasParticipated: false };
    }

    if (data) {
      return {
        hasParticipated: true,
        submissionId: data.id,
        score: data.score,
        isWinner: data.isWinner
      };
    }

    return { hasParticipated: false };
  } catch (error) {
    console.error('[ChallengeDiscovery] Error getting challenge status:', error);
    return { hasParticipated: false };
  }
}

/**
 * Get trending challenges across all tribes
 * 
 * @param limit - Number of challenges to return
 * @returns Array of trending challenges
 */
export async function getTrendingChallenges(limit: number = 5): Promise<TribeChallenge[]> {
  try {
    const allTribes = [
      "tribe-italian-smart-casual",
      "tribe-streetstyle-europe", 
      "tribe-minimalist-collective",
      "tribe-sustainable-fashion",
      "tribe-vintage-revival",
      "tribe-luxury-connoisseurs"
    ];

    const allChallenges: TribeChallenge[] = [];

    // Collect challenges from all tribes
    for (const tribeId of allTribes) {
      try {
        const challenges = await fetchTribeChallenges(tribeId, { 
          status: "open", 
          limit: 3 
        });
        allChallenges.push(...challenges);
      } catch (error) {
        console.warn(`[ChallengeDiscovery] Error fetching trending from tribe ${tribeId}:`, error);
        continue;
      }
    }

    // Sort by reward points and recency
    const sortedChallenges = allChallenges
      .sort((a, b) => {
        // Primary sort: reward points (higher first)
        const pointsDiff = (b.rewardPoints || 0) - (a.rewardPoints || 0);
        if (pointsDiff !== 0) return pointsDiff;
        
        // Secondary sort: creation date (newer first)
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();
        return bDate - aDate;
      })
      .slice(0, limit);

    console.log(`[ChallengeDiscovery] Found ${sortedChallenges.length} trending challenges`);
    return sortedChallenges;
  } catch (error) {
    console.error('[ChallengeDiscovery] Error getting trending challenges:', error);
    return [];
  }
}