import { getSupabase } from '@/lib/supabase';

export interface MoodPhoto {
  id: number;
  image_url: string;
  mood_tags: string[];
  archetype_weights: Record<string, number>;
  dominant_colors: string[];
  style_attributes: Record<string, number>;
  active: boolean;
  display_order: number;
  created_at?: string;
}

export interface StyleSwipe {
  id?: number;
  user_id?: string;
  session_id?: string;
  mood_photo_id: number;
  swipe_direction: 'left' | 'right';
  swipe_order?: number;
  response_time_ms: number;
  created_at?: string;
}

export interface VisualPreferenceEmbedding {
  [archetype: string]: number;
}

export interface NovaSwipeInsight {
  id?: string;
  user_id?: string;
  session_id?: string;
  insight_message: string;
  insight_trigger: 'color' | 'style' | 'speed' | 'pattern';
  confidence: number;
  shown_at_swipe_count: number;
  dismissed_at?: string;
  auto_hidden?: boolean;
  created_at?: string;
}

export class VisualPreferenceService {
  private static getClient() {
    const client = getSupabase();
    if (!client) {
      console.warn('⚠️ [VisualPreferenceService] Supabase client not available');
    }
    return client;
  }

  static async getMoodPhotos(limit = 10): Promise<MoodPhoto[]> {
    const client = this.getClient();
    if (!client) {
      return [];
    }

    const { data, error } = await client
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
    const client = this.getClient();
    if (!client) {
      console.warn('⚠️ Swipe not saved - client unavailable');
      return;
    }

    const { error } = await client
      .from('style_swipes')
      .insert(swipe);

    if (error) {
      console.error('Failed to record swipe:', error);
      throw error;
    }
  }

  static async getUserSwipes(userId: string): Promise<StyleSwipe[]> {
    const client = this.getClient();
    if (!client) {
      return [];
    }

    const { data, error } = await client
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
    const client = this.getClient();
    if (!client) {
      return [];
    }

    const { data, error } = await client
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
    const client = this.getClient();
    if (!client) {
      console.warn('⚠️ Cannot compute visual embedding - no client');
      return {};
    }

    const { data, error } = await client.rpc('compute_visual_preference_embedding', {
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
    const client = this.getClient();
    if (!client) {
      console.warn('⚠️ No Supabase client for visual embedding');
      return null;
    }

    let query = client
      .from('style_profiles')
      .select('visual_preference_embedding');

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else {
      console.warn('⚠️ No userId or sessionId provided for visual embedding');
      return null;
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('❌ Failed to fetch visual embedding from style_profiles:', error);
      return null;
    }

    if (!data) {
      console.warn('⚠️ No style_profile found - user may not have completed swipes yet');
      return null;
    }

    const embedding = data.visual_preference_embedding;

    if (!embedding || Object.keys(embedding).length === 0) {
      console.warn('⚠️ Empty visual embedding in profile - computing from swipes...');
      return await this.computeVisualEmbedding(userId, sessionId);
    }

    console.log('✅ Visual embedding loaded from profile:', embedding);
    return embedding;
  }

  static async markSwipeSessionComplete(
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    const client = this.getClient();
    if (!client) {
      console.warn('⚠️ Cannot mark session complete - no client');
      return;
    }

    let query = client
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
    const client = this.getClient();
    if (!client) {
      return { total: 0, likes: 0, rejects: 0, avgResponseTime: 0 };
    }

    let query = client
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

  static async recordInsight(
    insight: Omit<NovaSwipeInsight, 'id' | 'created_at'>
  ): Promise<void> {
    const client = this.getClient();
    if (!client) {
      console.warn('⚠️ Cannot record insight - no client');
      return;
    }

    const { error } = await client
      .from('nova_swipe_insights')
      .insert(insight);

    if (error) {
      console.error('Failed to record insight:', error);
      throw error;
    }
  }

  static async dismissInsight(insightId: string): Promise<void> {
    const client = this.getClient();
    if (!client) {
      console.warn('⚠️ Cannot dismiss insight - no client');
      return;
    }

    const { error } = await client
      .from('nova_swipe_insights')
      .update({
        dismissed_at: new Date().toISOString()
      })
      .eq('id', insightId);

    if (error) {
      console.error('Failed to dismiss insight:', error);
      throw error;
    }
  }

  static async getInsightHistory(
    userId?: string,
    sessionId?: string
  ): Promise<NovaSwipeInsight[]> {
    const client = this.getClient();
    if (!client) {
      return [];
    }

    const { data, error } = await client.rpc('get_user_insight_history', {
      p_user_id: userId || null,
      p_session_id: sessionId || null
    });

    if (error) {
      console.error('Failed to fetch insight history:', error);
      return [];
    }

    return data || [];
  }

  static async getInsightEffectiveness(): Promise<Array<{
    trigger_type: string;
    total_shown: number;
    manually_dismissed: number;
    avg_confidence: number;
    dismissal_rate: number;
  }>> {
    const client = this.getClient();
    if (!client) {
      return [];
    }

    const { data, error } = await client.rpc('get_insight_effectiveness');

    if (error) {
      console.error('Failed to fetch insight effectiveness:', error);
      return [];
    }

    return data || [];
  }
}
