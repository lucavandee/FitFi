import { supabase } from '@/lib/supabaseClient';

interface MatchFeedback {
  outfit_id: string;
  shown_score: number;
  user_rating: number; // 1-5 stars
  feedback_text?: string;
}

interface FeedbackAnalytics {
  outfit_id: string;
  feedback_count: number;
  avg_shown_score: number;
  avg_user_rating: number;
  avg_user_score_pct: number;
  score_discrepancy: number;
  first_feedback: string;
  last_feedback: string;
}

const sb = supabase();

/**
 * Submit user feedback for an outfit match score
 */
export async function submitMatchFeedback(
  feedback: MatchFeedback
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await sb.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await sb
      .from('outfit_match_feedback')
      .insert({
        user_id: user.id,
        outfit_id: feedback.outfit_id,
        shown_score: feedback.shown_score,
        user_rating: feedback.user_rating,
        feedback_text: feedback.feedback_text
      });

    if (error) {
      console.error('Failed to submit feedback:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error submitting feedback:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Get user's previous feedback for an outfit
 */
export async function getUserFeedback(
  outfitId: string
): Promise<MatchFeedback | null> {
  try {
    const { data: { user } } = await sb.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await sb
      .from('outfit_match_feedback')
      .select('*')
      .eq('user_id', user.id)
      .eq('outfit_id', outfitId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Failed to get user feedback:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      outfit_id: data.outfit_id,
      shown_score: data.shown_score,
      user_rating: data.user_rating,
      feedback_text: data.feedback_text
    };
  } catch (error) {
    console.error('Unexpected error getting feedback:', error);
    return null;
  }
}

/**
 * Get analytics for an outfit (admin only)
 */
export async function getOutfitAnalytics(
  outfitId: string
): Promise<FeedbackAnalytics | null> {
  try {
    const { data, error } = await sb
      .from('outfit_match_feedback_analytics')
      .select('*')
      .eq('outfit_id', outfitId)
      .maybeSingle();

    if (error) {
      console.error('Failed to get outfit analytics:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error getting analytics:', error);
    return null;
  }
}

/**
 * Get all feedback analytics (admin only)
 */
export async function getAllFeedbackAnalytics(): Promise<FeedbackAnalytics[]> {
  try {
    const { data, error } = await sb
      .from('outfit_match_feedback_analytics')
      .select('*')
      .order('feedback_count', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Failed to get all analytics:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error getting all analytics:', error);
    return [];
  }
}

/**
 * Update existing feedback
 */
export async function updateMatchFeedback(
  feedbackId: string,
  updates: Partial<MatchFeedback>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await sb
      .from('outfit_match_feedback')
      .update({
        user_rating: updates.user_rating,
        feedback_text: updates.feedback_text
      })
      .eq('id', feedbackId);

    if (error) {
      console.error('Failed to update feedback:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating feedback:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}
