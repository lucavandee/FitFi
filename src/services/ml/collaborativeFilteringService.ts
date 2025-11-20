import { supabase } from '@/lib/supabaseClient';
import type { Product } from '@/engine/types';

/**
 * Collaborative Filtering Service
 * "Users like you also liked..." recommendations
 */

export interface SimilarUser {
  userId: string;
  similarityScore: number;
}

export interface CollaborativeRecommendation {
  product: Product;
  likedByCount: number;
  averageSimilarityScore: number;
}

class CollaborativeFilteringService {
  private readonly CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Find users similar to current user
   * Uses cached results if available
   */
  async findSimilarUsers(limit: number = 50): Promise<SimilarUser[]> {
    const client = supabase();
    if (!client) return [];

    const { data: { user } } = await client.auth.getUser();
    if (!user) return [];

    // Check cache first
    const cached = await this.getCachedSimilarUsers(user.id);
    if (cached) {
      console.log('[CollaborativeFiltering] Using cached similar users');
      return cached.slice(0, limit);
    }

    // Compute similar users
    console.log('[CollaborativeFiltering] Computing similar users...');
    const { data, error } = await client.rpc('find_similar_users', {
      p_user_id: user.id,
      p_limit: limit
    });

    if (error) {
      console.error('[CollaborativeFiltering] Error finding similar users:', error);
      return [];
    }

    const similarUsers: SimilarUser[] = (data || []).map((row: any) => ({
      userId: row.similar_user_id,
      similarityScore: parseFloat(row.similarity_score)
    }));

    // Cache results
    await this.cacheSimilarUsers(user.id, similarUsers);

    return similarUsers;
  }

  /**
   * Get cached similar users
   */
  private async getCachedSimilarUsers(userId: string): Promise<SimilarUser[] | null> {
    const client = supabase();
    if (!client) return null;

    const { data, error } = await client
      .from('similar_users_cache')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    // Parse cached data
    const similarUsers: SimilarUser[] = data.similar_user_ids.map((id: string) => ({
      userId: id,
      similarityScore: data.similarity_scores[id] || 0
    }));

    return similarUsers;
  }

  /**
   * Cache similar users
   */
  private async cacheSimilarUsers(userId: string, similarUsers: SimilarUser[]): Promise<void> {
    const client = supabase();
    if (!client) return;

    const similarUserIds = similarUsers.map(u => u.userId);
    const similarityScores = similarUsers.reduce((acc, u) => {
      acc[u.userId] = u.similarityScore;
      return acc;
    }, {} as Record<string, number>);

    const expiresAt = new Date(Date.now() + this.CACHE_TTL).toISOString();

    const { error } = await client
      .from('similar_users_cache')
      .upsert({
        user_id: userId,
        similar_user_ids: similarUserIds,
        similarity_scores: similarityScores,
        computed_at: new Date().toISOString(),
        expires_at: expiresAt
      });

    if (error) {
      console.error('[CollaborativeFiltering] Error caching similar users:', error);
    }
  }

  /**
   * Get product recommendations based on similar users
   */
  async getCollaborativeRecommendations(
    count: number = 20,
    excludeSeenProducts: boolean = true
  ): Promise<CollaborativeRecommendation[]> {
    const client = supabase();
    if (!client) return [];

    const { data: { user } } = await client.auth.getUser();
    if (!user) return [];

    // Find similar users
    const similarUsers = await this.findSimilarUsers(50);
    if (similarUsers.length === 0) {
      console.log('[CollaborativeFiltering] No similar users found');
      return [];
    }

    const similarUserIds = similarUsers.map(u => u.userId);
    console.log(`[CollaborativeFiltering] Found ${similarUserIds.length} similar users`);

    // Get products liked by similar users
    const { data: interactions, error } = await client
      .from('product_interactions')
      .select(`
        product_id,
        user_id,
        product:products(*)
      `)
      .in('user_id', similarUserIds)
      .eq('interaction_type', 'like');

    if (error) {
      console.error('[CollaborativeFiltering] Error fetching interactions:', error);
      return [];
    }

    if (!interactions || interactions.length === 0) {
      console.log('[CollaborativeFiltering] Similar users have no likes yet');
      return [];
    }

    // Get user's seen products (if excluding)
    let seenProductIds: string[] = [];
    if (excludeSeenProducts) {
      seenProductIds = await this.getSeenProductIds(user.id);
    }

    // Aggregate product recommendations
    const productCounts = new Map<string, {
      product: any;
      likedByUserIds: Set<string>;
      totalSimilarityScore: number;
    }>();

    for (const interaction of interactions) {
      const productId = interaction.product_id;

      // Skip if user has already seen this product
      if (seenProductIds.includes(productId)) {
        continue;
      }

      if (!productCounts.has(productId)) {
        productCounts.set(productId, {
          product: interaction.product,
          likedByUserIds: new Set(),
          totalSimilarityScore: 0
        });
      }

      const entry = productCounts.get(productId)!;
      entry.likedByUserIds.add(interaction.user_id);

      // Add similarity score of the user who liked this
      const similarUser = similarUsers.find(u => u.userId === interaction.user_id);
      if (similarUser) {
        entry.totalSimilarityScore += similarUser.similarityScore;
      }
    }

    // Convert to recommendations and sort by score
    const recommendations: CollaborativeRecommendation[] = Array.from(productCounts.entries())
      .map(([productId, data]) => ({
        product: data.product,
        likedByCount: data.likedByUserIds.size,
        averageSimilarityScore: data.totalSimilarityScore / data.likedByUserIds.size
      }))
      .filter(rec => rec.product) // Filter out null products
      .sort((a, b) => {
        // Sort by liked count first, then by similarity score
        if (a.likedByCount !== b.likedByCount) {
          return b.likedByCount - a.likedByCount;
        }
        return b.averageSimilarityScore - a.averageSimilarityScore;
      })
      .slice(0, count);

    console.log(`[CollaborativeFiltering] Generated ${recommendations.length} recommendations`);

    return recommendations;
  }

  /**
   * Get product IDs user has already seen
   */
  private async getSeenProductIds(userId: string): Promise<string[]> {
    const client = supabase();
    if (!client) return [];

    const { data, error } = await client
      .from('product_interactions')
      .select('product_id')
      .eq('user_id', userId)
      .in('interaction_type', ['view', 'like', 'dislike', 'save']);

    if (error || !data) {
      return [];
    }

    return data.map(row => row.product_id);
  }

  /**
   * Get products that similar users bought together
   * "Frequently bought together" feature
   */
  async getFrequentlyBoughtTogether(
    productId: string,
    count: number = 5
  ): Promise<Product[]> {
    const client = supabase();
    if (!client) return [];

    // Find users who liked/purchased this product
    const { data: usersWhoLiked, error: error1 } = await client
      .from('product_interactions')
      .select('user_id')
      .eq('product_id', productId)
      .in('interaction_type', ['like', 'save', 'purchase']);

    if (error1 || !usersWhoLiked || usersWhoLiked.length === 0) {
      return [];
    }

    const userIds = usersWhoLiked.map(row => row.user_id);

    // Find other products these users liked
    const { data: otherProducts, error: error2 } = await client
      .from('product_interactions')
      .select(`
        product_id,
        product:products(*)
      `)
      .in('user_id', userIds)
      .eq('interaction_type', 'like')
      .neq('product_id', productId); // Exclude the original product

    if (error2 || !otherProducts) {
      return [];
    }

    // Count frequency
    const productFrequency = new Map<string, { product: any; count: number }>();
    for (const item of otherProducts) {
      if (!productFrequency.has(item.product_id)) {
        productFrequency.set(item.product_id, {
          product: item.product,
          count: 0
        });
      }
      productFrequency.get(item.product_id)!.count++;
    }

    // Sort by frequency and return top N
    const sorted = Array.from(productFrequency.values())
      .filter(item => item.product) // Filter out null products
      .sort((a, b) => b.count - a.count)
      .slice(0, count)
      .map(item => item.product);

    return sorted;
  }

  /**
   * Clear similar users cache for current user
   * Useful after significant preference changes
   */
  async clearCache(): Promise<void> {
    const client = supabase();
    if (!client) return;

    const { data: { user } } = await client.auth.getUser();
    if (!user) return;

    await client
      .from('similar_users_cache')
      .delete()
      .eq('user_id', user.id);

    console.log('[CollaborativeFiltering] Cache cleared');
  }
}

export const collaborativeFilteringService = new CollaborativeFilteringService();
