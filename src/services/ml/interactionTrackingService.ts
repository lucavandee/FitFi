import { supabase } from '@/lib/supabaseClient';

/**
 * ML-powered interaction tracking service
 * Tracks all user-product interactions for personalization and learning
 */

export type InteractionType = 'view' | 'like' | 'dislike' | 'save' | 'click' | 'purchase';

export interface InteractionContext {
  outfitId?: string;
  position?: number;
  archetype?: string;
  page?: string;
  source?: string;
  [key: string]: any;
}

class InteractionTrackingService {
  private batchQueue: Array<{
    productId: string;
    type: InteractionType;
    context: InteractionContext;
  }> = [];

  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_DELAY = 2000; // 2 seconds

  /**
   * Track a product interaction
   * Batches requests for performance
   */
  async trackInteraction(
    productId: string,
    type: InteractionType,
    context: InteractionContext = {}
  ): Promise<void> {
    const client = supabase();
    if (!client) {
      console.warn('[InteractionTracking] No Supabase client available');
      return;
    }

    // Get current user
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      console.warn('[InteractionTracking] No authenticated user');
      return;
    }

    // Add to batch queue
    this.batchQueue.push({ productId, type, context });

    // If batch is full, flush immediately
    if (this.batchQueue.length >= this.BATCH_SIZE) {
      await this.flushBatch();
    } else {
      // Otherwise, schedule a flush
      this.scheduleBatchFlush();
    }
  }

  /**
   * Schedule a batch flush
   */
  private scheduleBatchFlush(): void {
    if (this.batchTimeout) {
      return; // Already scheduled
    }

    this.batchTimeout = setTimeout(() => {
      this.flushBatch();
    }, this.BATCH_DELAY);
  }

  /**
   * Flush the batch queue to database
   */
  private async flushBatch(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.batchQueue.length === 0) {
      return;
    }

    const client = supabase();
    if (!client) return;

    const { data: { user } } = await client.auth.getUser();
    if (!user) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    try {
      const records = batch.map(item => ({
        user_id: user.id,
        product_id: item.productId,
        interaction_type: item.type,
        context: item.context,
      }));

      const { error } = await client
        .from('product_interactions')
        .insert(records);

      if (error) {
        console.error('[InteractionTracking] Error saving batch:', error);
        // Re-queue on error
        this.batchQueue.push(...batch);
      } else {
        console.log(`[InteractionTracking] Saved ${records.length} interactions`);

        // Update user preferences in background (no await)
        this.updateUserPreferences(user.id);
      }
    } catch (error) {
      console.error('[InteractionTracking] Exception saving batch:', error);
      this.batchQueue.push(...batch);
    }
  }

  /**
   * Update user preferences based on interactions
   * Runs in background
   */
  private async updateUserPreferences(userId: string): Promise<void> {
    const client = supabase();
    if (!client) return;

    try {
      const { error } = await client.rpc('update_user_preferences_from_interactions', {
        p_user_id: userId
      });

      if (error) {
        console.error('[InteractionTracking] Error updating preferences:', error);
      } else {
        console.log('[InteractionTracking] Updated user preferences');
      }
    } catch (error) {
      console.error('[InteractionTracking] Exception updating preferences:', error);
    }
  }

  /**
   * Get user's interaction history
   */
  async getInteractionHistory(
    type?: InteractionType,
    limit: number = 100
  ): Promise<any[]> {
    const client = supabase();
    if (!client) return [];

    const { data: { user } } = await client.auth.getUser();
    if (!user) return [];

    let query = client
      .from('product_interactions')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('interaction_type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[InteractionTracking] Error fetching history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get user's preferred brands
   */
  async getPreferredBrands(): Promise<string[]> {
    const client = supabase();
    if (!client) return [];

    const { data: { user } } = await client.auth.getUser();
    if (!user) return [];

    const { data, error } = await client
      .from('user_product_preferences')
      .select('preferred_brands')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) {
      return [];
    }

    return data.preferred_brands || [];
  }

  /**
   * Get user's preferred colors
   */
  async getPreferredColors(): Promise<string[]> {
    const client = supabase();
    if (!client) return [];

    const { data: { user } } = await client.auth.getUser();
    if (!user) return [];

    const { data, error } = await client
      .from('user_product_preferences')
      .select('preferred_colors')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) {
      return [];
    }

    return data.preferred_colors || [];
  }

  /**
   * Get user's preferred price range
   */
  async getPreferredPriceRange(): Promise<{ min: number; max: number } | null> {
    const client = supabase();
    if (!client) return null;

    const { data: { user } } = await client.auth.getUser();
    if (!user) return null;

    const { data, error } = await client
      .from('user_product_preferences')
      .select('preferred_price_range')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data || !data.preferred_price_range) {
      return null;
    }

    // Parse int4range format: "[25,100)"
    const range = data.preferred_price_range;
    const match = range.match(/\[(\d+),(\d+)\)/);
    if (match) {
      return {
        min: parseInt(match[1]),
        max: parseInt(match[2])
      };
    }

    return null;
  }

  /**
   * Get interaction statistics
   */
  async getInteractionStats(): Promise<{
    total: number;
    likes: number;
    dislikes: number;
    saves: number;
    clicks: number;
  }> {
    const client = supabase();
    if (!client) {
      return { total: 0, likes: 0, dislikes: 0, saves: 0, clicks: 0 };
    }

    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return { total: 0, likes: 0, dislikes: 0, saves: 0, clicks: 0 };
    }

    const { data, error } = await client
      .from('product_interactions')
      .select('interaction_type')
      .eq('user_id', user.id);

    if (error || !data) {
      return { total: 0, likes: 0, dislikes: 0, saves: 0, clicks: 0 };
    }

    const stats = {
      total: data.length,
      likes: data.filter(i => i.interaction_type === 'like').length,
      dislikes: data.filter(i => i.interaction_type === 'dislike').length,
      saves: data.filter(i => i.interaction_type === 'save').length,
      clicks: data.filter(i => i.interaction_type === 'click').length,
    };

    return stats;
  }
}

export const interactionTrackingService = new InteractionTrackingService();

// Convenience functions
export const trackView = (productId: string, context?: InteractionContext) =>
  interactionTrackingService.trackInteraction(productId, 'view', context);

export const trackLike = (productId: string, context?: InteractionContext) =>
  interactionTrackingService.trackInteraction(productId, 'like', context);

export const trackDislike = (productId: string, context?: InteractionContext) =>
  interactionTrackingService.trackInteraction(productId, 'dislike', context);

export const trackSave = (productId: string, context?: InteractionContext) =>
  interactionTrackingService.trackInteraction(productId, 'save', context);

export const trackClick = (productId: string, context?: InteractionContext) =>
  interactionTrackingService.trackInteraction(productId, 'click', context);

export const trackPurchase = (productId: string, context?: InteractionContext) =>
  interactionTrackingService.trackInteraction(productId, 'purchase', context);
