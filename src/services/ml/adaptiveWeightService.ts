import { getSupabase } from '@/lib/supabase';

/**
 * Adaptive Weight Service
 * Learns from user feedback to improve archetype weights over time
 */

export interface OutfitFeedback {
  id?: string;
  user_id?: string;
  session_id?: string;
  outfit_id: string;
  liked: boolean;
  archetype: string;
  secondary_archetype?: string;
  occasion?: string;
  feedback_type: 'like' | 'dislike' | 'save' | 'skip';
  created_at?: string;
}

export interface ArchetypeWeightUpdate {
  archetype: string;
  current_weight: number;
  adjustment: number;
  new_weight: number;
  confidence: number;
  sample_size: number;
}

export interface AdaptiveProfile {
  user_id: string;
  archetype_weights: Record<string, number>;
  learning_rate: number;
  total_feedback_count: number;
  last_updated: string;
}

/**
 * Record outfit feedback (like/dislike/save/skip)
 */
export async function recordOutfitFeedback(
  feedback: Omit<OutfitFeedback, 'id' | 'created_at'>
): Promise<void> {
  const client = getSupabase();
  if (!client) {
    console.warn('⚠️ [AdaptiveWeights] Supabase not available - feedback not saved');
    return;
  }

  const { error } = await client
    .from('outfit_match_feedback')
    .insert({
      user_id: feedback.user_id || null,
      session_id: feedback.session_id || null,
      outfit_id: feedback.outfit_id,
      liked: feedback.liked,
      archetype: feedback.archetype,
      secondary_archetype: feedback.secondary_archetype || null,
      occasion: feedback.occasion || null,
      feedback_type: feedback.feedback_type
    });

  if (error) {
    console.error('Failed to record outfit feedback:', error);
    throw error;
  }

  console.log(`✅ [AdaptiveWeights] Recorded ${feedback.feedback_type} feedback for ${feedback.archetype}`);
}

/**
 * Get feedback statistics for a user
 */
export async function getFeedbackStats(
  userId?: string,
  sessionId?: string
): Promise<{
  total: number;
  likes: number;
  dislikes: number;
  saves: number;
  skips: number;
  byArchetype: Record<string, { likes: number; dislikes: number; total: number }>;
}> {
  const client = getSupabase();
  if (!client) {
    return {
      total: 0,
      likes: 0,
      dislikes: 0,
      saves: 0,
      skips: 0,
      byArchetype: {}
    };
  }

  let query = client
    .from('outfit_match_feedback')
    .select('feedback_type, liked, archetype');

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (sessionId) {
    query = query.eq('session_id', sessionId);
  } else {
    return {
      total: 0,
      likes: 0,
      dislikes: 0,
      saves: 0,
      skips: 0,
      byArchetype: {}
    };
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Failed to fetch feedback stats:', error);
    return {
      total: 0,
      likes: 0,
      dislikes: 0,
      saves: 0,
      skips: 0,
      byArchetype: {}
    };
  }

  const stats = {
    total: data.length,
    likes: data.filter(f => f.feedback_type === 'like').length,
    dislikes: data.filter(f => f.feedback_type === 'dislike').length,
    saves: data.filter(f => f.feedback_type === 'save').length,
    skips: data.filter(f => f.feedback_type === 'skip').length,
    byArchetype: {} as Record<string, { likes: number; dislikes: number; total: number }>
  };

  // Group by archetype
  data.forEach(item => {
    if (!item.archetype) return;

    if (!stats.byArchetype[item.archetype]) {
      stats.byArchetype[item.archetype] = { likes: 0, dislikes: 0, total: 0 };
    }

    stats.byArchetype[item.archetype].total++;
    if (item.liked) {
      stats.byArchetype[item.archetype].likes++;
    } else {
      stats.byArchetype[item.archetype].dislikes++;
    }
  });

  return stats;
}

/**
 * Calculate adaptive archetype weights based on feedback
 * Uses exponential moving average for smooth learning
 */
export async function calculateAdaptiveWeights(
  userId?: string,
  sessionId?: string,
  baseWeights?: Record<string, number>
): Promise<Record<string, number>> {
  const stats = await getFeedbackStats(userId, sessionId);

  // If no feedback yet, return base weights
  if (stats.total < 3) {
    console.log('🧠 [AdaptiveWeights] Not enough feedback yet, using base weights');
    return baseWeights || {};
  }

  console.log(`🧠 [AdaptiveWeights] Calculating weights from ${stats.total} feedback items`);

  // Start with base weights or equal distribution
  const adaptiveWeights: Record<string, number> = { ...(baseWeights || {}) };

  // Learning rate: decreases as we get more data (more confidence = smaller adjustments)
  const learningRate = Math.max(0.05, 1 / Math.sqrt(stats.total));

  // Calculate adjustment for each archetype based on like ratio
  Object.entries(stats.byArchetype).forEach(([archetype, archetypeStats]) => {
    const likeRatio = archetypeStats.likes / archetypeStats.total;
    const sampleSize = archetypeStats.total;

    // Confidence: higher sample size = higher confidence
    const confidence = Math.min(1, sampleSize / 10);

    // Current weight (default to 50 if not set)
    const currentWeight = adaptiveWeights[archetype] || 50;

    // Target weight based on feedback (0-100 scale)
    const targetWeight = likeRatio * 100;

    // Adjustment with learning rate and confidence
    const adjustment = (targetWeight - currentWeight) * learningRate * confidence;

    // Apply adjustment
    const newWeight = Math.max(0, Math.min(100, currentWeight + adjustment));

    adaptiveWeights[archetype] = Math.round(newWeight);

    console.log(`🧠 [AdaptiveWeights] ${archetype}: ${currentWeight} → ${newWeight} (likes: ${archetypeStats.likes}/${sampleSize}, confidence: ${Math.round(confidence * 100)}%)`);
  });

  return adaptiveWeights;
}

/**
 * Get weight adjustments (for analytics/debugging)
 */
export async function getWeightAdjustments(
  userId?: string,
  sessionId?: string,
  baseWeights?: Record<string, number>
): Promise<ArchetypeWeightUpdate[]> {
  const stats = await getFeedbackStats(userId, sessionId);
  const adaptiveWeights = await calculateAdaptiveWeights(userId, sessionId, baseWeights);

  const updates: ArchetypeWeightUpdate[] = [];

  Object.entries(stats.byArchetype).forEach(([archetype, archetypeStats]) => {
    const currentWeight = baseWeights?.[archetype] || 50;
    const newWeight = adaptiveWeights[archetype] || 50;
    const adjustment = newWeight - currentWeight;
    const confidence = Math.min(1, archetypeStats.total / 10);

    updates.push({
      archetype,
      current_weight: currentWeight,
      adjustment,
      new_weight: newWeight,
      confidence,
      sample_size: archetypeStats.total
    });
  });

  return updates.sort((a, b) => Math.abs(b.adjustment) - Math.abs(a.adjustment));
}

/**
 * Save adaptive weights to user profile
 */
export async function saveAdaptiveWeights(
  userId: string,
  weights: Record<string, number>
): Promise<void> {
  const client = getSupabase();
  if (!client) {
    console.warn('⚠️ [AdaptiveWeights] Supabase not available - weights not saved');
    return;
  }

  const stats = await getFeedbackStats(userId);

  const { error } = await client
    .from('style_profiles')
    .update({
      adaptive_archetype_weights: weights,
      total_feedback_count: stats.total,
      last_weight_update: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to save adaptive weights:', error);
    throw error;
  }

  console.log(`✅ [AdaptiveWeights] Saved adaptive weights for user ${userId}`);
}

/**
 * Get adaptive weights from profile (cached)
 */
export async function getAdaptiveWeights(
  userId?: string,
  sessionId?: string
): Promise<Record<string, number> | null> {
  const client = getSupabase();
  if (!client) {
    return null;
  }

  let query = client
    .from('style_profiles')
    .select('adaptive_archetype_weights, total_feedback_count, last_weight_update')
    .limit(1)
    .maybeSingle();

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (sessionId) {
    query = query.eq('session_id', sessionId);
  } else {
    return null;
  }

  const { data, error } = await query;

  if (error || !data) {
    return null;
  }

  // Check if weights are fresh (updated in last 24 hours with enough feedback)
  const lastUpdate = data.last_weight_update ? new Date(data.last_weight_update) : null;
  const hoursSinceUpdate = lastUpdate ? (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60) : Infinity;

  // Recalculate if stale or if we have significantly more feedback
  const currentFeedback = await getFeedbackStats(userId, sessionId);
  const feedbackDelta = Math.abs(currentFeedback.total - (data.total_feedback_count || 0));

  if (hoursSinceUpdate > 24 || feedbackDelta > 5) {
    console.log('🧠 [AdaptiveWeights] Cached weights are stale, recalculating...');
    const freshWeights = await calculateAdaptiveWeights(userId, sessionId, data.adaptive_archetype_weights);

    // Save fresh weights
    if (userId) {
      await saveAdaptiveWeights(userId, freshWeights);
    }

    return freshWeights;
  }

  return data.adaptive_archetype_weights || null;
}

/**
 * Apply adaptive weights to archetype scores
 * Blends quiz-based scores with learned preferences
 */
export function applyAdaptiveWeights(
  baseScores: Record<string, number>,
  adaptiveWeights: Record<string, number> | null,
  blendFactor: number = 0.3
): Record<string, number> {
  if (!adaptiveWeights || Object.keys(adaptiveWeights).length === 0) {
    return baseScores;
  }

  const blendedScores: Record<string, number> = {};

  // Blend base scores with adaptive weights
  Object.keys(baseScores).forEach(archetype => {
    const baseScore = baseScores[archetype] || 0;
    const adaptiveScore = adaptiveWeights[archetype] || baseScore;

    // Blend: 70% base (quiz) + 30% adaptive (feedback)
    blendedScores[archetype] = baseScore * (1 - blendFactor) + adaptiveScore * blendFactor;
  });

  console.log('🧠 [AdaptiveWeights] Applied adaptive blending (70% quiz + 30% feedback)');

  return blendedScores;
}
