import { supabase } from "@/lib/supabaseClient";
import { DATA_CONFIG } from "@/config/dataConfig";
import { withTimeout } from "@/lib/net/withTimeout";
import { withRetry } from "@/lib/net/withRetry";
import type {
  TribeChallenge,
  TribeChallengeSubmission,
  TribeRanking
} from "./types";

// Configuration
const TIMEOUT_MS = Number(import.meta.env.VITE_SUPABASE_HEALTHCHECK_TIMEOUT_MS || 3500);
const MAX_ATTEMPTS = Number(import.meta.env.VITE_SUPABASE_RETRY_MAX_ATTEMPTS || 3);
const BASE_DELAY = Number(import.meta.env.VITE_SUPABASE_RETRY_BASE_MS || 400);

/**
 * Get Supabase client with null safety
 */
function getClient() {
  const client = supabase();
  if (!client) {
    console.warn("[TribeChallengesService] Supabase not available - using fallback");
  }
  return client;
}

/**
 * Fetch local JSON with error handling
 */
const fetchLocalJson = async <T>(path: string): Promise<T[]> => {
  try {
    console.log(`[TribeChallengesService] Fetching local JSON: ${path}`);
    const res = await fetch(path, { 
      cache: "no-store",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      throw new Error(`Expected array but got ${typeof data} from ${path}`);
    }
    
    console.log(`[TribeChallengesService] Loaded ${data.length} items from ${path}`);
    return data as T[];
  } catch (error) {
    console.error(`[TribeChallengesService] Error fetching ${path}:`, error);
    throw error;
  }
};

/**
 * Execute operation with timeout and retry
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const runner = async () => {
    const sb = getClient();
    if (!sb) throw new Error('Supabase client not available');
    return await operation();
  };
  
  return await withTimeout(
    withRetry(runner, MAX_ATTEMPTS, BASE_DELAY),
    TIMEOUT_MS,
    operationName
  );
}

// =============== CHALLENGES ===============

/**
 * Get tribe challenges with Supabase-first fallback
 */
export const getTribeChallenges = async (
  tribeId?: string,
  options?: {
    status?: "draft" | "open" | "closed" | "archived";
    limit?: number;
  }
): Promise<TribeChallenge[]> => {
  // Try Supabase first if available
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const { data, error } = await executeWithRetry(async () => {
        const sb = getClient();
        if (!sb) throw new Error('Supabase client not available');
        
        let query = sb.from(DATA_CONFIG.SUPABASE.tables.tribeChallenges).select("*");
        
        // Apply filters
        if (tribeId) {
          query = query.eq("tribeId", tribeId);
        }
        if (options?.status) {
          query = query.eq("status", options.status);
        }
        if (options?.limit) {
          query = query.limit(options.limit);
        }
        
        // Order by creation date
        query = query.order("createdAt", { ascending: false });
        
        return await query;
      }, 'get_tribe_challenges');

      if (error) throw error;
      
      console.log(`[TribeChallengesService] Loaded ${(data || []).length} challenges from Supabase`);
      return data || [];
    } catch (err) {
      console.warn("[TribeChallengesService] Supabase fetch failed, using local JSON:", err);
    }
  }

  // Fallback to local JSON
  try {
    const all = await fetchLocalJson<TribeChallenge>(DATA_CONFIG.LOCAL_JSON.tribeChallenges);
    
    // Apply filters
    let filtered = all;
    
    if (tribeId) {
      filtered = filtered.filter(c => c.tribeId === tribeId);
    }
    if (options?.status) {
      filtered = filtered.filter(c => c.status === options.status);
    }
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }
    
    console.log(`[TribeChallengesService] Using ${filtered.length} challenges from local JSON`);
    return filtered;
  } catch (error) {
    console.error("[TribeChallengesService] Local JSON fallback failed:", error);
    return [];
  }
};

/**
 * Create new tribe challenge
 */
export const createTribeChallenge = async (
  challenge: Omit<TribeChallenge, 'id' | 'createdAt'>
): Promise<TribeChallenge> => {
  // Try Supabase first if available
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const { data, error } = await executeWithRetry(async () => {
        const sb = getClient();
        if (!sb) throw new Error('Supabase client not available');
        
        const challengeData = {
          ...challenge,
          id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        };
        
        return await sb
          .from(DATA_CONFIG.SUPABASE.tables.tribeChallenges)
          .insert([challengeData])
          .select()
          .single();
      }, 'create_tribe_challenge');

      if (error) throw error;
      
      console.log(`[TribeChallengesService] Created challenge via Supabase: ${data.id}`);
      return data;
    } catch (err) {
      console.warn("[TribeChallengesService] Supabase create failed:", err);
      throw err; // Don't fallback for mutations
    }
  }

  // No fallback for create operations - require Supabase
  throw new Error('Supabase required for creating challenges');
};

// =============== SUBMISSIONS ===============

/**
 * Get challenge submissions with Supabase-first fallback
 */
export const getChallengeSubmissions = async (
  challengeId: string,
  options?: {
    userId?: string;
    limit?: number;
    includeUserProfile?: boolean;
  }
): Promise<TribeChallengeSubmission[]> => {
  // Try Supabase first if available
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const { data, error } = await executeWithRetry(async () => {
        const sb = getClient();
        if (!sb) throw new Error('Supabase client not available');
        
        let query = sb.from(DATA_CONFIG.SUPABASE.tables.tribeChallengeSubmissions);
        
        // Include user profile if requested
        if (options?.includeUserProfile) {
          query = query.select(`
            *,
            user_profile:profiles!tribe_challenge_submissions_user_id_fkey(full_name, avatar_url)
          `);
        } else {
          query = query.select("*");
        }
        
        query = query.eq("challengeId", challengeId);
        
        // Apply filters
        if (options?.userId) {
          query = query.eq("userId", options.userId);
        }
        if (options?.limit) {
          query = query.limit(options.limit);
        }
        
        // Order by score (winners first), then by creation date
        query = query.order("score", { ascending: false, nullsLast: true });
        query = query.order("createdAt", { ascending: false });
        
        return await query;
      }, 'get_challenge_submissions');

      if (error) throw error;
      
      console.log(`[TribeChallengesService] Loaded ${(data || []).length} submissions from Supabase`);
      return data || [];
    } catch (err) {
      console.warn("[TribeChallengesService] Supabase submissions fetch failed, using local JSON:", err);
    }
  }

  // Fallback to local JSON
  try {
    const all = await fetchLocalJson<TribeChallengeSubmission>(DATA_CONFIG.LOCAL_JSON.tribeChallengeSubmissions);
    
    // Apply filters
    let filtered = all.filter(s => s.challengeId === challengeId);
    
    if (options?.userId) {
      filtered = filtered.filter(s => s.userId === options.userId);
    }
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }
    
    // Sort by score (winners first), then by creation date
    filtered.sort((a, b) => {
      if (a.score && b.score) {
        return b.score - a.score;
      }
      if (a.score && !b.score) return -1;
      if (!a.score && b.score) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    console.log(`[TribeChallengesService] Using ${filtered.length} submissions from local JSON`);
    return filtered;
  } catch (error) {
    console.error("[TribeChallengesService] Local JSON submissions fallback failed:", error);
    return [];
  }
};

/**
 * Create new challenge submission
 */
export const createChallengeSubmission = async (
  submission: Omit<TribeChallengeSubmission, 'id' | 'createdAt'>
): Promise<TribeChallengeSubmission> => {
  // Try Supabase first if available
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const { data, error } = await executeWithRetry(async () => {
        const sb = getClient();
        if (!sb) throw new Error('Supabase client not available');
        
        const submissionData = {
          ...submission,
          id: `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        };
        
        return await sb
          .from(DATA_CONFIG.SUPABASE.tables.tribeChallengeSubmissions)
          .insert([submissionData])
          .select(`
            *,
            user_profile:profiles!tribe_challenge_submissions_user_id_fkey(full_name, avatar_url)
          `)
          .single();
      }, 'create_challenge_submission');

      if (error) throw error;
      
      console.log(`[TribeChallengesService] Created submission via Supabase: ${data.id}`);
      return data;
    } catch (err) {
      console.warn("[TribeChallengesService] Supabase submission create failed:", err);
      throw err; // Don't fallback for mutations
    }
  }

  // No fallback for create operations - require Supabase
  throw new Error('Supabase required for creating submissions');
};

/**
 * Create new tribe challenge (admin only)
 */
export const createTribeChallenge = async (
  challenge: Omit<TribeChallenge, 'id' | 'createdAt'>
): Promise<TribeChallenge> => {
  // Try Supabase first if available
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const { data, error } = await executeWithRetry(async () => {
        const sb = getClient();
        if (!sb) throw new Error('Supabase client not available');
        
        const challengeData = {
          ...challenge,
          id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        };
        
        return await sb
          .from(DATA_CONFIG.SUPABASE.tables.tribeChallenges)
          .insert([challengeData])
          .select()
          .single();
      }, 'create_tribe_challenge');

      if (error) throw error;
      
      console.log(`[TribeChallengesService] Created challenge via Supabase: ${data.id}`);
      return data;
    } catch (err) {
      console.warn("[TribeChallengesService] Supabase challenge create failed:", err);
      throw err; // Don't fallback for mutations
    }
  }

  // No fallback for create operations - require Supabase
  throw new Error('Supabase required for creating challenges');
};

/**
 * Update tribe challenge status (admin only)
 */
export const updateTribeChallengeStatus = async (
  id: string, 
  status: "draft" | "open" | "closed" | "archived"
): Promise<TribeChallenge> => {
  if (!DATA_CONFIG.USE_SUPABASE) {
    throw new Error('Supabase required for updating challenges');
  }

  try {
    const { data, error } = await executeWithRetry(async () => {
      const sb = getClient();
      if (!sb) throw new Error('Supabase client not available');
      
      return await sb
        .from(DATA_CONFIG.SUPABASE.tables.tribeChallenges)
        .update({ status })
        .eq("id", id)
        .select()
        .single();
    }, 'update_challenge_status');

    if (error) throw error;
    
    console.log(`[TribeChallengesService] Updated challenge ${id} status to ${status}`);
    return data;
  } catch (err) {
    console.error("[TribeChallengesService] Status update failed:", err);
    throw err;
  }
};
/**
 * Update challenge submission score (admin only)
 */
export const updateSubmissionScore = async (
  submissionId: string,
  score: number,
  isWinner: boolean = false
): Promise<TribeChallengeSubmission> => {
  if (!DATA_CONFIG.USE_SUPABASE) {
    throw new Error('Supabase required for updating submissions');
  }

  try {
    const { data, error } = await executeWithRetry(async () => {
      const sb = getClient();
      if (!sb) throw new Error('Supabase client not available');
      
      return await sb
        .from(DATA_CONFIG.SUPABASE.tables.tribeChallengeSubmissions)
        .update({ score, isWinner })
        .eq("id", submissionId)
        .select()
        .single();
    }, 'update_submission_score');

    if (error) throw error;
    
    console.log(`[TribeChallengesService] Updated submission score: ${submissionId} -> ${score}`);
    return data;
  } catch (err) {
    console.error("[TribeChallengesService] Score update failed:", err);
    throw err;
  }
};

// =============== RANKING ===============

/**
 * Get tribe ranking with Supabase-first fallback
 */
export const getTribeRanking = async (
  options?: {
    limit?: number;
    tribeId?: string;
  }
): Promise<TribeRanking[]> => {
  // Try Supabase first if available
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const { data, error } = await executeWithRetry(async () => {
        const sb = getClient();
        if (!sb) throw new Error('Supabase client not available');
        
        let query = sb
          .from(DATA_CONFIG.SUPABASE.tables.tribeRanking)
          .select("*")
          .order("points", { ascending: false });
        
        // Apply filters
        if (options?.tribeId) {
          query = query.eq("tribeId", options.tribeId);
        }
        if (options?.limit) {
          query = query.limit(options.limit);
        }
        
        return await query;
      }, 'get_tribe_ranking');

      if (error) throw error;
      
      // Add rank numbers
      const rankedData = (data || []).map((ranking, index) => ({
        ...ranking,
        rank: index + 1
      }));
      
      console.log(`[TribeChallengesService] Loaded ${rankedData.length} rankings from Supabase`);
      return rankedData;
    } catch (err) {
      console.warn("[TribeChallengesService] Supabase ranking fetch failed, using local JSON:", err);
    }
  }

  // Fallback to local JSON
  try {
    const all = await fetchLocalJson<TribeRanking>(DATA_CONFIG.LOCAL_JSON.tribeRanking);
    
    // Apply filters
    let filtered = all;
    
    if (options?.tribeId) {
      filtered = filtered.filter(r => r.tribeId === options.tribeId);
    }
    
    // Sort by points (highest first)
    filtered.sort((a, b) => b.points - a.points);
    
    // Add rank numbers
    const rankedData = filtered.map((ranking, index) => ({
      ...ranking,
      rank: index + 1
    }));
    
    if (options?.limit) {
      rankedData.splice(options.limit);
    }
    
    console.log(`[TribeChallengesService] Using ${rankedData.length} rankings from local JSON`);
    return rankedData;
  } catch (error) {
    console.error("[TribeChallengesService] Local JSON ranking fallback failed:", error);
    return [];
  }
};

/**
 * Update tribe points (admin function)
 */
export const updateTribePoints = async (
  tribeId: string,
  pointsToAdd: number,
  reason?: string
): Promise<TribeRanking> => {
  if (!DATA_CONFIG.USE_SUPABASE) {
    throw new Error('Supabase required for updating tribe points');
  }

  try {
    const { data, error } = await executeWithRetry(async () => {
      const sb = getClient();
      if (!sb) throw new Error('Supabase client not available');
      
      // Use RPC function to atomically update points
      return await sb.rpc('update_tribe_points', {
        tribe_id: tribeId,
        points_to_add: pointsToAdd,
        reason: reason || 'Manual update'
      });
    }, 'update_tribe_points');

    if (error) throw error;
    
    console.log(`[TribeChallengesService] Updated tribe ${tribeId} points: +${pointsToAdd}`);
    return data;
  } catch (err) {
    console.error("[TribeChallengesService] Points update failed:", err);
    throw err;
  }
};

/**
 * Calculate tribe points from activities
 */
export const calculateTribePoints = (activities: {
  newMembers: number;
  posts: number;
  challengeSubmissions: number;
  challengeWins: number;
  likes: number;
  comments: number;
}): number => {
  const pointsConfig = {
    newMember: 50,        // Nieuwe member join
    post: 25,             // Nieuwe post
    challengeSubmission: 100, // Challenge deelname
    challengeWin: 500,    // Challenge winnen
    like: 5,              // Like ontvangen
    comment: 10           // Comment ontvangen
  };

  return (
    activities.newMembers * pointsConfig.newMember +
    activities.posts * pointsConfig.post +
    activities.challengeSubmissions * pointsConfig.challengeSubmission +
    activities.challengeWins * pointsConfig.challengeWin +
    activities.likes * pointsConfig.like +
    activities.comments * pointsConfig.comment
  );
};

/**
 * Get user's challenge participation status
 */
export const getUserChallengeParticipation = async (
  userId: string,
  challengeId: string
): Promise<{
  hasParticipated: boolean;
  submission?: TribeChallengeSubmission;
}> => {
  try {
    const submissions = await getChallengeSubmissions(challengeId, {
      userId,
      limit: 1
    });
    
    const userSubmission = submissions.find(s => s.userId === userId);
    
    return {
      hasParticipated: !!userSubmission,
      submission: userSubmission
    };
  } catch (error) {
    console.error("[TribeChallengesService] Error checking participation:", error);
    return { hasParticipated: false };
  }
};

/**
 * Get challenge statistics
 */
export const getChallengeStats = async (challengeId: string): Promise<{
  totalSubmissions: number;
  averageScore: number;
  winnerCount: number;
  topSubmissions: TribeChallengeSubmission[];
}> => {
  try {
    const submissions = await getChallengeSubmissions(challengeId);
    
    const totalSubmissions = submissions.length;
    const scoredSubmissions = submissions.filter(s => s.score !== undefined);
    const averageScore = scoredSubmissions.length > 0
      ? scoredSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / scoredSubmissions.length
      : 0;
    const winnerCount = submissions.filter(s => s.isWinner).length;
    const topSubmissions = submissions
      .filter(s => s.score && s.score >= 85)
      .slice(0, 5);
    
    return {
      totalSubmissions,
      averageScore: Math.round(averageScore),
      winnerCount,
      topSubmissions
    };
  } catch (error) {
    console.error("[TribeChallengesService] Error getting challenge stats:", error);
    return {
      totalSubmissions: 0,
      averageScore: 0,
      winnerCount: 0,
      topSubmissions: []
    };
  }
};

/**
 * Health check for tribe challenges service
 */
export const healthCheck = async (): Promise<{
  supabase: { healthy: boolean; responseTime?: number; error?: string };
  localJson: { healthy: boolean; responseTime?: number; error?: string };
}> => {
  const results = {
    supabase: { healthy: false, responseTime: 0, error: '' },
    localJson: { healthy: false, responseTime: 0, error: '' }
  };

  // Check Supabase
  if (DATA_CONFIG.USE_SUPABASE) {
    const startTime = Date.now();
    try {
      await getTribeChallenges(undefined, { limit: 1 });
      results.supabase = {
        healthy: true,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      results.supabase = {
        healthy: false,
        responseTime: Date.now() - startTime,
        error: (error as Error).message
      };
    }
  }

  // Check Local JSON
  const localStartTime = Date.now();
  try {
    await fetchLocalJson<TribeChallenge>(DATA_CONFIG.LOCAL_JSON.tribeChallenges);
    results.localJson = {
      healthy: true,
      responseTime: Date.now() - localStartTime
    };
  } catch (error) {
    results.localJson = {
      healthy: false,
      responseTime: Date.now() - localStartTime,
      error: (error as Error).message
    };
  }

  return results;
};