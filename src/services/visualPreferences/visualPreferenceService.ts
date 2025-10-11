import { supabase } from '@/lib/supabase';

export interface MoodPhoto {
  id: string;
  image_url: string;
  style_tags: string[];
  archetype_weights: Record<string, number>;
  color_palette: string[];
  occasion: string;
  season: string;
  active: boolean;
  display_order: number;
}

export interface StyleSwipe {
  id?: string;
  user_id?: string;
  session_id?: string;
  mood_photo_id: string;
  swipe_direction: 'left' | 'right';
  response_time_ms: number;
  created_at?: string;
}

export interface VisualPreferenceEmbedding {
  [archetype: string]: number;
}

export class VisualPreferenceService {
  static async getMoodPhotos(limit = 10): Promise<MoodPhoto[]> {
    const { data, error } = await supabase
      .from('mood_photos')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch mood photos:', error);
      throw error;
    }

    return data || [];
  }

  static async recordSwipe(swipe: Omit<StyleSwipe, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('style_swipes')
      .insert(swipe);

    if (error) {
      console.error('Failed to record swipe:', error);
      throw error;
    }
  }

  static async getUserSwipes(userId: string): Promise<StyleSwipe[]> {
    const { data, error } = await supabase
      .from('style_swipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch user swipes:', error);
      throw error;
    }

    return data || [];
  }

  static async getSessionSwipes(sessionId: string): Promise<StyleSwipe[]> {
    const { data, error } = await supabase
      .from('style_swipes')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch session swipes:', error);
      throw error;
    }

    return data || [];
  }

  static async computeVisualEmbedding(
    userId?: string,
    sessionId?: string
  ): Promise<VisualPreferenceEmbedding> {
    const { data, error } = await supabase.rpc('compute_visual_preference_embedding', {
      p_user_id: userId || null,
      p_session_id: sessionId || null
    });

    if (error) {
      console.error('Failed to compute visual embedding:', error);
      throw error;
    }

    return data || {};
  }

  static async getVisualEmbeddingFromProfile(
    userId?: string,
    sessionId?: string
  ): Promise<VisualPreferenceEmbedding | null> {
    let query = supabase
      .from('style_profiles')
      .select('visual_preference_embedding')
      .single();

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else {
      return null;
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch visual embedding:', error);
      return null;
    }

    return data?.visual_preference_embedding || null;
  }

  static async markSwipeSessionComplete(
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    let query = supabase
      .from('style_profiles')
      .update({ swipe_session_completed: true });

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else {
      throw new Error('Either userId or sessionId must be provided');
    }

    const { error } = await query;

    if (error) {
      console.error('Failed to mark swipe session complete:', error);
      throw error;
    }
  }

  static getTopArchetypes(
    embedding: VisualPreferenceEmbedding,
    limit = 3
  ): Array<{ archetype: string; score: number }> {
    return Object.entries(embedding)
      .map(([archetype, score]) => ({ archetype, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  static async getSwipeStats(
    userId?: string,
    sessionId?: string
  ): Promise<{
    total: number;
    likes: number;
    rejects: number;
    avgResponseTime: number;
  }> {
    let query = supabase
      .from('style_swipes')
      .select('swipe_direction, response_time_ms');

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else {
      return { total: 0, likes: 0, rejects: 0, avgResponseTime: 0 };
    }

    const { data, error } = await query;

    if (error || !data) {
      return { total: 0, likes: 0, rejects: 0, avgResponseTime: 0 };
    }

    const likes = data.filter(s => s.swipe_direction === 'right').length;
    const rejects = data.filter(s => s.swipe_direction === 'left').length;
    const avgResponseTime =
      data.reduce((sum, s) => sum + (s.response_time_ms || 0), 0) / data.length;

    return {
      total: data.length,
      likes,
      rejects,
      avgResponseTime: Math.round(avgResponseTime)
    };
  }
}
