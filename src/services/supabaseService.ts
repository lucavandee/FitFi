import { supabase } from '../lib/supabase';
import { UserProfile } from '../context/UserContext';
import { executeSupabaseOperation, SupabaseErrorContext } from '../utils/supabaseErrorHandler';

// Quiz answer retrieval with proper error handling
export const getQuizAnswer = async (userId: string, qId: string) => {
  return executeSupabaseOperation(
    async () => await supabase
      .from('quiz_answers')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', qId)
      .maybeSingle(),
    {
      operation: 'select',
      tableName: 'quiz_answers',
      userId
    },
    {
      fallbackValue: null,
      showToast: false // Don't show toast for quiz data loading
    }
  );
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Execute a function with retry logic
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Operation failed, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return executeWithRetry(operation, retries - 1);
    }
    throw error;
  }
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Fetch products from Supabase
 */
export async function fetchProductsFromSupabase() {
  return executeSupabaseOperation(
    async () => await supabase
      .from('products')
      .select('*')
      .limit(50),
    {
      operation: 'select',
      tableName: 'products'
    },
    {
      fallbackValue: [],
      showToast: false
    }
  );
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserProfile | null> {
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }

  const data = await executeSupabaseOperation(
    async () => await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single(),
    {
      operation: 'select',
      tableName: 'users',
      userId
    },
    {
      fallbackValue: null,
      showToast: false
    }
  );

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    gender: data.gender,
    stylePreferences: {
      casual: 3,
      formal: 3,
      sporty: 3,
      vintage: 3,
      minimalist: 3
    },
    isPremium: data.is_premium || false,
    savedRecommendations: []
  };
}

/**
 * Get user gamification data
 */
export async function getUserGamification(userId: string) {
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }

  let data = await executeSupabaseOperation(
    async () => await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .single(),
    {
      operation: 'select',
      tableName: 'user_gamification',
      userId
    },
    {
      fallbackValue: null,
      showToast: false
    }
  );

  // Create default record if not found
  if (!data) {
    const defaultData = {
      user_id: userId,
      points: 0,
      level: 'beginner',
      badges: [],
      streak: 0,
      completed_challenges: [],
      total_referrals: 0,
      seasonal_event_progress: {}
    };

    data = await executeSupabaseOperation(
      async () => await supabase
        .from('user_gamification')
        .insert([defaultData])
        .select()
        .single(),
      {
        operation: 'insert',
        tableName: 'user_gamification',
        userId
      },
      {
        fallbackValue: defaultData,
        showToast: false
      }
    );
  }

  return data;
}

/**
 * Update user gamification data
 */
export async function updateUserGamification(userId: string, updates: any) {
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }

  return executeWithRetry(async () => {
    const { data, error } = await supabase
      .from('user_gamification')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase gamification update error: ${error.message}`);
    }

    return data;
  });
}

/**
 * Complete a challenge
 */
export async function completeChallenge(userId: string, challengeId: string): Promise<boolean> {
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }

  return executeWithRetry(async () => {
    const { error } = await supabase
      .from('daily_challenges')
      .upsert({
        user_id: userId,
        challenge_id: challengeId,
        completed: true
      });

    if (error) {
      throw new Error(`Supabase challenge completion error: ${error.message}`);
    }

    return true;
  });
}

/**
 * Get daily challenges for user
 */
export async function getDailyChallenges(userId: string) {
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }

  return executeWithRetry(async () => {
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Supabase daily challenges error: ${error.message}`);
    }

    return data || [];
  });
}

/**
 * Safe achievements query with proper error handling
 */
export async function getAchievements(userId: string) {
  if (!isValidUUID(userId)) {
    console.warn('[Supabase] Invalid user ID format for achievements');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('quiz_achievements')
      .select('id, achievement_id, achievement_type, earned_at, metadata')
      .eq('user_id', userId);

    if (error) {
      // Don't throw on auth errors - return empty array instead
      if (error.code === '42501' || error.message.includes('permission denied')) {
        console.warn('[Supabase] Achievements permission denied, returning empty array');
        return [];
      }
      console.error('[Supabase] Achievements error:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Supabase] Achievements query failed:', error);
    return [];
  }
}

/**
 * Safe gamification query with fallback
 */
export const getGamificationSafe = async (userId: string) => {
  if (!isValidUUID(userId)) {
    return null;
  }

  try {
    return await getUserGamification(userId);
  } catch (error: any) {
    // Handle auth errors gracefully
    if (error.message?.includes('permission denied') || 
        error.message?.includes('401') || 
        error.message?.includes('403')) {
      console.warn('[Supabase] Gamification permission denied, using fallback');
      return {
        user_id: userId,
        points: 0,
        level: 'beginner',
        badges: [],
        streak: 0,
        completed_challenges: [],
        total_referrals: 0,
        seasonal_event_progress: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    throw error;
  }
};

/**
 * Fetch user achievements with proper error handling
 */
export async function fetchUserAchievements(userId: string) {
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }

  return executeWithRetry(async () => {
    const { data, error } = await supabase
      .from('quiz_achievements')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Supabase achievements error: ${error.message}`);
    }

    return data || [];
  });
}

export default {
  fetchProductsFromSupabase,
  getUserById,
  getUserGamification,
  updateUserGamification,
  completeChallenge,
  getDailyChallenges,
  fetchUserAchievements,
  getAchievements,
  getGamificationSafe
};