import { supabase } from '@/lib/supabaseClient';
import type { VisualPreferenceEmbedding } from './visualPreferenceService';

export interface StyleEmbedding {
  [archetype: string]: number;
}

export interface EmbeddingSources {
  quiz_weight: number;
  swipes_weight: number;
  calibration_weight: number;
  locked_at?: string;
}

export interface EmbeddingSnapshot {
  id: string;
  user_id?: string;
  session_id?: string;
  style_profile_id: string;
  version: number;
  embedding: StyleEmbedding;
  sources: Record<string, number>;
  snapshot_trigger: 'quiz_complete' | 'swipes_complete' | 'calibration_complete' | 'manual_update';
  created_at: string;
}

export interface LockedProfile {
  id: string;
  user_id?: string;
  session_id?: string;
  archetype: string;
  locked_embedding: StyleEmbedding;
  embedding_locked_at: string;
  embedding_version: number;
  embedding_sources: EmbeddingSources;
}

export class EmbeddingService {
  /**
   * Get Supabase client or return null
   */
  private static getClient() {
    const client = supabase();
    if (!client) {
      console.warn('⚠️ [EmbeddingService] Supabase client not available');
    }
    return client;
  }

  /**
   * Compute final embedding (doesn't lock yet)
   */
  static async computeFinalEmbedding(
    userId?: string,
    sessionId?: string
  ): Promise<StyleEmbedding> {
    const client = this.getClient();
    if (!client) {
      console.warn('⚠️ [EmbeddingService] Cannot compute embedding - no client');
      return {};
    }

    const { data, error } = await client.rpc('compute_final_embedding', {
      p_user_id: userId || null,
      p_session_id: sessionId || null
    });

    if (error) {
      console.error('Failed to compute final embedding:', error);
      throw error;
    }

    return data || {};
  }

  /**
   * Lock embedding after calibration - creates immutable vector
   */
  static async lockEmbedding(
    userId?: string,
    sessionId?: string
  ): Promise<StyleEmbedding> {
    const client = this.getClient();
    if (!client) {
      console.warn('⚠️ [EmbeddingService] Cannot lock embedding - no client');
      return {};
    }

    const { data, error } = await client.rpc('lock_style_embedding', {
      p_user_id: userId || null,
      p_session_id: sessionId || null
    });

    if (error) {
      console.error('Failed to lock embedding:', error);
      throw error;
    }

    return data || {};
  }

  /**
   * Get locked embedding (for outfit generation)
   */
  static async getLockedEmbedding(
    userId?: string,
    sessionId?: string
  ): Promise<StyleEmbedding | null> {
    const client = this.getClient();
    if (!client) {
      return null;
    }

    let query = client
      .from('style_profiles')
      .select('locked_embedding')
      .not('embedding_locked_at', 'is', null)
      .order('created_at', { ascending: false })
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

    if (error) {
      console.error('Failed to fetch locked embedding:', error);
      return null;
    }

    return data?.locked_embedding || null;
  }

  /**
   * Get full locked profile with metadata
   */
  static async getLockedProfile(
    userId?: string,
    sessionId?: string
  ): Promise<LockedProfile | null> {
    const client = this.getClient();
    if (!client) {
      return null;
    }

    let query = client
      .from('style_profiles')
      .select('id, user_id, session_id, archetype, locked_embedding, embedding_locked_at, embedding_version, embedding_sources')
      .not('embedding_locked_at', 'is', null)
      .order('created_at', { ascending: false })
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

    if (error) {
      console.error('Failed to fetch locked profile:', error);
      return null;
    }

    return data as LockedProfile | null;
  }

  /**
   * Check if embedding is locked
   */
  static async isEmbeddingLocked(
    userId?: string,
    sessionId?: string
  ): Promise<boolean> {
    const client = this.getClient();
    if (!client) {
      return false;
    }

    let query = client
      .from('style_profiles')
      .select('embedding_locked_at')
      .not('embedding_locked_at', 'is', null)
      .limit(1)
      .maybeSingle();

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else {
      return false;
    }

    const { data, error } = await query;

    if (error) {
      return false;
    }

    return data?.embedding_locked_at != null;
  }

  /**
   * Get all embedding snapshots (history)
   */
  static async getEmbeddingHistory(
    userId?: string,
    sessionId?: string
  ): Promise<EmbeddingSnapshot[]> {
    const client = this.getClient();
    if (!client) {
      return [];
    }

    let query = client
      .from('style_embedding_snapshots')
      .select('*')
      .order('version', { ascending: true });

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else {
      return [];
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch embedding history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get embedding stability metrics
   */
  static async getStabilityMetrics(userId: string): Promise<Array<{
    version: number;
    created_at: string;
    embedding: StyleEmbedding;
    stability_score: number;
  }>> {
    const client = this.getClient();
    if (!client) {
      return [];
    }

    const { data, error } = await client.rpc('get_embedding_stability', {
      p_user_id: userId
    });

    if (error) {
      console.error('Failed to fetch stability metrics:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get top archetypes from embedding
   */
  static getTopArchetypes(
    embedding: StyleEmbedding,
    limit = 3
  ): Array<{ archetype: string; score: number; percentage: number }> {
    const total = Object.values(embedding).reduce((sum, score) => sum + score, 0);

    return Object.entries(embedding)
      .map(([archetype, score]) => ({
        archetype,
        score,
        percentage: total > 0 ? Math.round((score / total) * 100) : 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Compare two embeddings (for A/B testing or evolution tracking)
   */
  static compareEmbeddings(
    embedding1: StyleEmbedding,
    embedding2: StyleEmbedding
  ): {
    similarity: number;
    changed_archetypes: string[];
    new_archetypes: string[];
    removed_archetypes: string[];
  } {
    const allArchetypes = new Set([
      ...Object.keys(embedding1),
      ...Object.keys(embedding2)
    ]);

    let totalDiff = 0;
    let count = 0;
    const changed: string[] = [];
    const newArchetypes: string[] = [];
    const removed: string[] = [];

    allArchetypes.forEach(archetype => {
      const score1 = embedding1[archetype] || 0;
      const score2 = embedding2[archetype] || 0;

      if (score1 === 0 && score2 > 0) {
        newArchetypes.push(archetype);
      } else if (score1 > 0 && score2 === 0) {
        removed.push(archetype);
      } else if (Math.abs(score1 - score2) > 10) {
        changed.push(archetype);
      }

      totalDiff += Math.abs(score1 - score2);
      count++;
    });

    // Similarity: 100 = identical, 0 = completely different
    const similarity = 100 - Math.min(100, (totalDiff / count));

    return {
      similarity: Math.round(similarity),
      changed_archetypes: changed,
      new_archetypes: newArchetypes,
      removed_archetypes: removed
    };
  }

  /**
   * Create manual snapshot (for testing or updates)
   */
  static async createSnapshot(
    userId?: string,
    sessionId?: string,
    trigger: 'quiz_complete' | 'swipes_complete' | 'calibration_complete' | 'manual_update' = 'manual_update'
  ): Promise<void> {
    const embedding = await this.computeFinalEmbedding(userId, sessionId);

    let profileQuery = supabase
      .from('style_profiles')
      .select('id, embedding_version')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (userId) {
      profileQuery = profileQuery.eq('user_id', userId);
    } else if (sessionId) {
      profileQuery = profileQuery.eq('session_id', sessionId);
    } else {
      throw new Error('Either userId or sessionId must be provided');
    }

    const { data: profile, error: profileError } = await profileQuery;

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    const { error } = await supabase
      .from('style_embedding_snapshots')
      .insert({
        user_id: userId || null,
        session_id: !userId ? sessionId : null,
        style_profile_id: profile.id,
        version: (profile.embedding_version || 0) + 1,
        embedding,
        sources: {
          quiz: 0.40,
          swipes: 0.35,
          calibration: 0.25
        },
        snapshot_trigger: trigger
      });

    if (error) {
      console.error('Failed to create snapshot:', error);
      throw error;
    }
  }

  /**
   * Format embedding for display
   */
  static formatEmbeddingForDisplay(embedding: StyleEmbedding): string {
    const top = this.getTopArchetypes(embedding, 3);
    return top
      .map(({ archetype, percentage }) =>
        `${archetype.replace(/_/g, ' ')} (${percentage}%)`
      )
      .join(' • ');
  }

  /**
   * Get embedding influence breakdown
   */
  static async getInfluenceBreakdown(
    userId?: string,
    sessionId?: string
  ): Promise<{
    quiz_influence: number;
    swipes_influence: number;
    calibration_influence: number;
    total_archetypes: number;
  } | null> {
    const profile = await this.getLockedProfile(userId, sessionId);

    if (!profile || !profile.embedding_sources) {
      return null;
    }

    return {
      quiz_influence: profile.embedding_sources.quiz_weight || 0,
      swipes_influence: profile.embedding_sources.swipes_weight || 0,
      calibration_influence: profile.embedding_sources.calibration_weight || 0,
      total_archetypes: Object.keys(profile.locked_embedding || {}).length
    };
  }
}
