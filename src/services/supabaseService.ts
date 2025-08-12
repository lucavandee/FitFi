import { supabase } from '../lib/supabaseClient';
import { QuizAnswers, QuizSubmission } from '../types/quiz';

// Get singleton client
const sb = supabase();

export interface SupabaseUser {
  id: string;
  name: string;
  email: string;
  gender?: 'male' | 'female';
  role?: string;
  isPremium?: boolean;
}

export interface GamificationData {
  id: string;
  user_id: string;
  points: number;
  level: string;
  badges: string[];
  streak: number;
  last_check_in: string | null;
  completed_challenges: string[];
  total_referrals: number;
  seasonal_event_progress: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Basic shape; pas desgewenst aan aan je bestaande types
export type QuizAnswer = any;

/**
 * Haal één quiz-antwoord op voor een user+step.
 * - Supabase: selecteert uit 'quiz_answers' met velden user_id, question_id, answer, updated_at
 * - Fallback: leest localStorage key `quiz:${userId}:${stepId}`
 */
export async function getQuizAnswer(userId: string, stepId: string): Promise<QuizAnswer | null> {
  try {
    if (!sb) {
      // Fallback (client only)
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem(`quiz:${userId}:${stepId}`);
        return raw ? JSON.parse(raw) : null;
      }
      return null;
    }

    const { data, error } = await sb
      .from('quiz_answers')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', stepId)
      .maybeSingle();

    if (error) {
      // Log zacht en val terug op null
      console.debug('[quiz:getQuizAnswer] supabase error', error);
      return null;
    }
    return data ?? null;
  } catch (e) {
    console.debug('[quiz:getQuizAnswer] exception', e);
    return null;
  }
}

/**
 * Execute Supabase operation with retry logic
 */
export async function executeWithRetry<T>(
  operation: () => Promise<{ data: T; error: any }>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation();
      
      if (result.error) {
        throw result.error;
      }
      
      return result.data;
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        break;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.warn(`[SupabaseService] Retry ${attempt}/${maxAttempts} after ${delay}ms:`, error);
    }
  }
  
  throw lastError;
}

/**
 * Get user gamification data
 */
export async function getUserGamification(userId: string): Promise<GamificationData | null> {
  if (!sb) {
    console.warn('[SupabaseService] Supabase not available for gamification');
    return null;
  }

  try {
    const { data, error } = await sb
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found, return null
        return null;
      }
      throw error;
    }

    return data as GamificationData;
  } catch (error) {
    console.error('[SupabaseService] Error fetching gamification data:', error);
    return null;
  }
}

/**
 * Update user gamification data
 */
export async function updateUserGamification(
  userId: string, 
  updates: Partial<Omit<GamificationData, 'id' | 'user_id' | 'created_at'>>
): Promise<GamificationData | null> {
  if (!sb) {
    console.warn('[SupabaseService] Supabase not available for gamification update');
    return null;
  }

  try {
    const { data, error } = await sb
      .from('user_gamification')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as GamificationData;
  } catch (error) {
    console.error('[SupabaseService] Error updating gamification data:', error);
    return null;
  }
}

/**
 * Submit quiz answers
 */
export async function submitQuizAnswers(userId: string, answers: QuizAnswers): Promise<boolean> {
  if (!sb) {
    console.warn('[SupabaseService] Supabase not available for quiz submission');
    return true; // Return true to not block user flow
  }

  try {
    const { error } = await sb
      .from('quiz_answers')
      .upsert({
        user_id: userId,
        question_id: 'style_quiz_v1',
        answer: answers,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('[SupabaseService] Quiz submission error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[SupabaseService] Quiz submission failed:', error);
    return false;
  }
}

/**
 * Get quiz submission for user
 */
export async function getQuizSubmission(userId: string): Promise<QuizSubmission | null> {
  if (!sb) {
    console.warn('[SupabaseService] Supabase not available for quiz data');
    return null;
  }

  try {
    const { data, error } = await sb
      .from('quiz_answers')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', 'style_quiz_v1')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No quiz data found
        return null;
      }
      throw error;
    }

    return {
      id: data.id,
      user_id: data.user_id,
      answers: data.answer,
      completed_at: data.created_at,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('[SupabaseService] Error fetching quiz submission:', error);
    return null;
  }
}