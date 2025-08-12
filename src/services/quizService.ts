import { supabase } from '../lib/supabaseClient';
import { QuizAnswers, QuizSubmission } from '../types/quiz';
import { quizSteps } from '../data/quizSteps';
import { getQuizAnswer } from './supabaseService';

// Get singleton client
const sb = supabase();

// Fallback quiz data
const mockQuizData = {
  steps: quizSteps,
  defaultAnswers: {
    stylePreferences: [],
    baseColors: '',
    bodyType: '',
    occasions: [],
    budgetRange: 100
  }
};

export class QuizService {
  private static instance: QuizService;
  
  static getInstance(): QuizService {
    if (!QuizService.instance) {
      QuizService.instance = new QuizService();
    }
    return QuizService.instance;
  }

  async getQuizSteps() {
    try {
      // Check if Supabase is available
      if (!import.meta.env.VITE_SUPABASE_URL) {
        console.warn('[QuizService] Supabase not configured, using fallback');
        return mockQuizData.steps;
      }

      // Try to fetch from Supabase (if we had quiz steps there)
      // For now, return local quiz steps
      return quizSteps;
    } catch (error) {
      console.error('[QuizService] Error fetching quiz steps:', error);
      return mockQuizData.steps;
    }
  }

  async submitAnswers(userId: string, answers: QuizAnswers): Promise<boolean> {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        console.warn('[QuizService] Supabase not configured, simulating success');
        return true;
      }

      if (!sb) {
        console.warn('[QuizService] Supabase client not available, simulating success');
        return true;
      }

      const { error } = await sb
        .from('quiz_answers')
        .upsert({
          user_id: userId,
          question_id: 'style_quiz_v1',
          answer: answers,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('[QuizService] Error submitting answers:', error);
      // Return true for fallback to prevent blocking user flow
      return true;
    }
  }

  async getUserAnswers(userId: string): Promise<QuizSubmission | null> {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        console.warn('[QuizService] Supabase not configured, returning null');
        return null;
      }

      // Use the improved getQuizAnswer function with proper error handling
      const data = await getQuizAnswer(userId, 'style_quiz_v1');

      return data ? {
        id: data.id,
        user_id: data.user_id,
        answers: data.answer,
        completed_at: data.created_at,
        created_at: data.created_at,
        updated_at: data.updated_at
      } : null;
    } catch (error) {
      console.error('[QuizService] Error fetching user answers:', error);
      return null;
    }
  }
}

export const quizService = QuizService.getInstance();