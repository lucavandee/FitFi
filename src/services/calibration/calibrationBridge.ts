import { adaptiveOutfitGenerator, type AdaptiveOutfit } from './adaptiveOutfitGenerator';
import type { CalibrationOutfit } from '@/services/visualPreferences/calibrationService';
import type { Product } from '@/types/product';
import { supabase } from '@/lib/supabaseClient';

/**
 * Bridge service to integrate adaptive outfit generation with existing calibration UI
 */
export class CalibrationBridge {
  /**
   * Generate adaptive calibration outfits using the new intelligent system
   */
  static async generateAdaptiveCalibrationOutfits(
    userId: string | undefined,
    sessionId: string | undefined,
    quizData: any
  ): Promise<CalibrationOutfit[]> {
    try {
      // Get swipe history
      const swipeHistory = await this.getSwipeHistory(sessionId || userId || '');

      // Build generation context
      const context = {
        session_id: sessionId || userId || `session_${Date.now()}`,
        swipe_count: swipeHistory.length,
        exploration_rate: Math.max(0.1, 0.3 - (swipeHistory.length * 0.02)),
        user_profile: {
          archetype: quizData?.archetype || 'Casual',
          colors: quizData?.colors || quizData?.baseColors?.split(',') || [],
          budget: this.mapBudgetRange(quizData?.budgetRange),
          occasions: quizData?.occasions || ['casual', 'everyday']
        },
        swipe_history: this.calculateLearnedPreferences(swipeHistory)
      };

      // Generate adaptive outfits
      const adaptiveOutfits = await adaptiveOutfitGenerator.generateAdaptiveOutfits(context, 3);

      // Transform to CalibrationOutfit format
      const calibrationOutfits = adaptiveOutfits.map(outfit =>
        this.transformToCalibrationOutfit(outfit)
      );

      return calibrationOutfits;
    } catch (error) {
      console.error('[CalibrationBridge] Error generating adaptive outfits:', error);
      throw error;
    }
  }

  /**
   * Record feedback using the adaptive system
   */
  static async recordAdaptiveFeedback(
    outfitId: string,
    userId: string | undefined,
    sessionId: string | undefined,
    feedbackType: 'spot_on' | 'not_for_me' | 'maybe',
    outfitData: any
  ): Promise<void> {
    try {
      const swipeDirection = feedbackType === 'spot_on' ? 'right' : feedbackType === 'not_for_me' ? 'left' : 'maybe';

      // Extract outfit features
      const features = {
        colors: outfitData.dominantColors || [],
        styles: outfitData.archetypes || [],
        total_price: Object.values(outfitData.items || {}).reduce((sum: number, item: any) => sum + (item?.price || 0), 0),
        formality_score: this.estimateFormalityFromOccasion(outfitData.occasion),
        price_tier: this.determinePriceTier(
          Object.values(outfitData.items || {}).reduce((sum: number, item: any) => sum + (item?.price || 0), 0)
        )
      };

      // Record in database
      const { error } = await supabase.rpc('record_swipe', {
        p_session_id: sessionId || userId || `session_${Date.now()}`,
        p_user_id: userId,
        p_outfit_id: outfitId,
        p_swipe_direction: swipeDirection,
        p_outfit_features: features
      });

      if (error) {
        console.error('[CalibrationBridge] Error recording feedback:', error);
      }
    } catch (error) {
      console.error('[CalibrationBridge] Error in recordAdaptiveFeedback:', error);
    }
  }

  /**
   * Transform AdaptiveOutfit to CalibrationOutfit format
   */
  private static transformToCalibrationOutfit(adaptive: AdaptiveOutfit): CalibrationOutfit {
    const items: any = {};

    // Map products to calibration format
    adaptive.products.forEach(product => {
      const category = this.mapCategoryToCalibration(product.category);
      if (category) {
        items[category] = {
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          image_url: product.image_url,
          category: product.category,
          colors: product.colors,
          affiliate_link: product.affiliate_link
        };
      }
    });

    return {
      id: adaptive.id,
      items,
      archetypes: adaptive.visual_features.style_tags,
      dominantColors: adaptive.visual_features.dominant_colors,
      occasion: this.mapFormalityToOccasion(adaptive.visual_features.formality_score),
      explanation: adaptive.explanation,
      matchScore: adaptive.score.overall,
      badges: adaptive.badges || [],
      novaInsight: adaptive.nova_insight
    };
  }

  /**
   * Get swipe history from database
   */
  private static async getSwipeHistory(sessionId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('swipe_preferences')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[CalibrationBridge] Error fetching swipe history:', error);
      return [];
    }
  }

  /**
   * Calculate learned preferences from swipe history
   */
  private static calculateLearnedPreferences(swipeHistory: any[]) {
    const liked = swipeHistory.filter(s => ['right', 'up'].includes(s.swipe_direction));
    const disliked = swipeHistory.filter(s => ['left', 'down'].includes(s.swipe_direction));

    const likedColors = [...new Set(liked.flatMap(s => s.outfit_features?.colors || []))];
    const dislikedColors = [...new Set(disliked.flatMap(s => s.outfit_features?.colors || []))];
    const likedStyles = [...new Set(liked.flatMap(s => s.outfit_features?.styles || []))];
    const dislikedStyles = [...new Set(disliked.flatMap(s => s.outfit_features?.styles || []))];

    const prices = liked.map(s => s.outfit_features?.total_price || 0).filter(p => p > 0);
    const priceRange = prices.length > 0
      ? {
          min: Math.min(...prices),
          max: Math.max(...prices),
          preferred_avg: prices.reduce((a, b) => a + b, 0) / prices.length
        }
      : { min: 0, max: 1000, preferred_avg: 300 };

    const formalityScores = liked.map(s => s.outfit_features?.formality_score || 5);
    const formalityPreference = formalityScores.length > 0
      ? formalityScores.reduce((a, b) => a + b, 0) / formalityScores.length
      : 5;

    return {
      liked_colors: likedColors,
      disliked_colors: dislikedColors,
      liked_styles: likedStyles,
      disliked_styles: dislikedStyles,
      price_range: priceRange,
      formality_preference: formalityPreference,
      pattern_preference: 'mixed' as const
    };
  }

  /**
   * Helper: Map budget range to budget category
   */
  private static mapBudgetRange(budgetRange: number | undefined): 'low' | 'medium' | 'high' {
    if (!budgetRange) return 'medium';
    if (budgetRange <= 200) return 'low';
    if (budgetRange <= 400) return 'medium';
    return 'high';
  }

  /**
   * Helper: Map product category to calibration format
   */
  private static mapCategoryToCalibration(category: string): 'top' | 'bottom' | 'shoes' | null {
    const lower = category.toLowerCase();
    if (lower.includes('top') || lower.includes('shirt') || lower.includes('blouse')) return 'top';
    if (lower.includes('bottom') || lower.includes('pants') || lower.includes('jeans') || lower.includes('skirt')) return 'bottom';
    if (lower.includes('shoe') || lower.includes('footwear')) return 'shoes';
    return null;
  }

  /**
   * Helper: Map formality score to occasion
   */
  private static mapFormalityToOccasion(formality: number): string {
    if (formality >= 8) return 'formal';
    if (formality >= 6) return 'work';
    if (formality >= 4) return 'smart-casual';
    return 'casual';
  }

  /**
   * Helper: Estimate formality from occasion
   */
  private static estimateFormalityFromOccasion(occasion: string): number {
    const map: Record<string, number> = {
      'casual': 3,
      'everyday': 3,
      'smart-casual': 5,
      'work': 6,
      'business': 7,
      'evening': 7,
      'formal': 9
    };
    return map[occasion] || 5;
  }

  /**
   * Helper: Determine price tier
   */
  private static determinePriceTier(totalPrice: number): 'budget' | 'mid' | 'premium' {
    if (totalPrice <= 200) return 'budget';
    if (totalPrice <= 400) return 'mid';
    return 'premium';
  }
}
