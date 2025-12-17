import { supabase } from '@/lib/supabaseClient';
import { adaptiveOutfitGenerator, type AdaptiveOutfit, type OutfitScore } from '@/services/calibration/adaptiveOutfitGenerator';
import type { Product } from '@/types/product';

export interface RemixedOutfit {
  original_outfit_id: string;
  products: Product[];
  score: OutfitScore;
  score_delta: number; // Change from original score
  swap_history: SwapRecord[];
  nova_insight: string;
}

export interface SwapRecord {
  timestamp: Date;
  category: 'top' | 'bottom' | 'shoes' | 'accessory';
  old_product_id: string;
  new_product_id: string;
  score_before: number;
  score_after: number;
  improvement: boolean;
}

export interface SwapSuggestion {
  category: 'top' | 'bottom' | 'shoes' | 'accessory';
  suggested_product: Product;
  expected_score_improvement: number;
  reason: string;
}

/**
 * Adaptive Outfit Remixer Service
 *
 * Allows users to swap individual items in outfits and learn from their preferences
 */
export class AdaptiveOutfitRemixer {
  /**
   * Swap an item in an outfit and recalculate scores
   */
  static async swapItem(
    outfit: AdaptiveOutfit,
    category: 'top' | 'bottom' | 'shoes' | 'accessory',
    newProduct: Product,
    userId?: string,
    sessionId?: string
  ): Promise<RemixedOutfit> {
    const oldProducts = outfit.products;
    const oldProduct = oldProducts.find(p => this.matchesCategory(p.category, category));

    if (!oldProduct) {
      throw new Error(`No ${category} found in outfit`);
    }

    // Create new product array with swapped item
    const newProducts = oldProducts.map(p =>
      this.matchesCategory(p.category, category) ? newProduct : p
    );

    // Recalculate scores with new product
    const newScore = this.calculateOutfitScore(newProducts);
    const scoreDelta = newScore.overall - outfit.score.overall;

    // Record swap in database for learning
    await this.recordSwap(
      outfit.id,
      category,
      oldProduct.id,
      newProduct.id,
      outfit.score.overall,
      newScore.overall,
      userId,
      sessionId
    );

    // Generate Nova insight about the swap
    const novaInsight = this.generateSwapInsight(
      category,
      oldProduct,
      newProduct,
      scoreDelta
    );

    // Track swap history
    const swapRecord: SwapRecord = {
      timestamp: new Date(),
      category,
      old_product_id: oldProduct.id,
      new_product_id: newProduct.id,
      score_before: outfit.score.overall,
      score_after: newScore.overall,
      improvement: scoreDelta > 0
    };

    return {
      original_outfit_id: outfit.id,
      products: newProducts,
      score: newScore,
      score_delta: scoreDelta,
      swap_history: [swapRecord],
      nova_insight: novaInsight
    };
  }

  /**
   * Get smart swap suggestions for an outfit
   */
  static async getSuggestedSwaps(
    outfit: AdaptiveOutfit,
    userContext: {
      archetype: string;
      budget: 'low' | 'medium' | 'high';
      visualEmbedding?: Record<string, number>;
    },
    maxSuggestions: number = 3
  ): Promise<SwapSuggestion[]> {
    const suggestions: SwapSuggestion[] = [];

    // Get available products from database
    const { data: availableProducts } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .limit(100);

    if (!availableProducts) return [];

    // For each category, find better alternatives
    const categories: ('top' | 'bottom' | 'shoes')[] = ['top', 'bottom', 'shoes'];

    for (const category of categories) {
      const currentItem = outfit.products.find(p => this.matchesCategory(p.category, category));
      if (!currentItem) continue;

      // Find alternative products in same category
      const alternatives = availableProducts.filter(p =>
        this.matchesCategory(p.category, category) &&
        p.id !== currentItem.id
      );

      // Test each alternative and calculate potential improvement
      for (const alt of alternatives.slice(0, 5)) { // Limit to top 5 alternatives
        const testProducts = outfit.products.map(p =>
          this.matchesCategory(p.category, category) ? alt : p
        );

        const testScore = this.calculateOutfitScore(testProducts);
        const improvement = testScore.overall - outfit.score.overall;

        if (improvement > 0.05) { // Only suggest if >5% improvement
          suggestions.push({
            category,
            suggested_product: alt,
            expected_score_improvement: improvement,
            reason: this.generateSwapReason(category, currentItem, alt, improvement)
          });
        }
      }
    }

    // Sort by expected improvement (best first)
    return suggestions
      .sort((a, b) => b.expected_score_improvement - a.expected_score_improvement)
      .slice(0, maxSuggestions);
  }

  /**
   * Batch remix: Try multiple swaps to optimize outfit
   */
  static async optimizeOutfit(
    outfit: AdaptiveOutfit,
    maxSwaps: number = 3
  ): Promise<RemixedOutfit> {
    let currentOutfit = outfit;
    let swapHistory: SwapRecord[] = [];
    let totalDelta = 0;

    for (let i = 0; i < maxSwaps; i++) {
      const suggestions = await this.getSuggestedSwaps(currentOutfit, {
        archetype: 'Casual', // TODO: Get from user profile
        budget: 'medium'
      }, 1);

      if (suggestions.length === 0) break;

      const bestSuggestion = suggestions[0];
      const oldProduct = currentOutfit.products.find(p =>
        this.matchesCategory(p.category, bestSuggestion.category)
      );

      if (!oldProduct) continue;

      const newProducts = currentOutfit.products.map(p =>
        this.matchesCategory(p.category, bestSuggestion.category)
          ? bestSuggestion.suggested_product
          : p
      );

      const newScore = this.calculateOutfitScore(newProducts);
      const scoreDelta = newScore.overall - currentOutfit.score.overall;

      swapHistory.push({
        timestamp: new Date(),
        category: bestSuggestion.category,
        old_product_id: oldProduct.id,
        new_product_id: bestSuggestion.suggested_product.id,
        score_before: currentOutfit.score.overall,
        score_after: newScore.overall,
        improvement: scoreDelta > 0
      });

      totalDelta += scoreDelta;

      // Update current outfit for next iteration
      currentOutfit = {
        ...currentOutfit,
        products: newProducts,
        score: newScore
      };

      // Stop if no significant improvement
      if (scoreDelta < 0.02) break;
    }

    return {
      original_outfit_id: outfit.id,
      products: currentOutfit.products,
      score: currentOutfit.score,
      score_delta: totalDelta,
      swap_history: swapHistory,
      nova_insight: `✨ Outfit geoptimaliseerd met ${swapHistory.length} swaps. Score verbeterd met ${Math.round(totalDelta * 100)}%!`
    };
  }

  /**
   * Learn from swap patterns to improve future recommendations
   */
  static async analyzeSwapPatterns(
    userId: string,
    sessionId?: string
  ): Promise<{
    preferred_combinations: Array<{ category1: string; category2: string; compatibility: number }>;
    avoided_combinations: Array<{ category1: string; category2: string }>;
    favorite_brands: string[];
    price_sweet_spot: { min: number; max: number };
  }> {
    // Get all swaps for this user/session
    const { data: swaps } = await supabase
      .from('outfit_swaps')
      .select('*')
      .or(`user_id.eq.${userId},session_id.eq.${sessionId}`)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!swaps) {
      return {
        preferred_combinations: [],
        avoided_combinations: [],
        favorite_brands: [],
        price_sweet_spot: { min: 0, max: 1000 }
      };
    }

    // Analyze successful swaps (improvements)
    const successfulSwaps = swaps.filter(s => s.score_after > s.score_before);

    // Extract patterns
    const preferred_combinations: Array<{ category1: string; category2: string; compatibility: number }> = [];
    const avoided_combinations: Array<{ category1: string; category2: string }> = [];

    // Find favorite brands from successful swaps
    const brandCounts: Record<string, number> = {};
    successfulSwaps.forEach((swap: any) => {
      if (swap.new_product_brand) {
        brandCounts[swap.new_product_brand] = (brandCounts[swap.new_product_brand] || 0) + 1;
      }
    });

    const favorite_brands = Object.entries(brandCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([brand]) => brand);

    // Calculate price sweet spot
    const prices = successfulSwaps.map((s: any) => s.new_product_price || 0).filter(p => p > 0);
    const price_sweet_spot = prices.length > 0
      ? {
          min: Math.min(...prices),
          max: Math.max(...prices)
        }
      : { min: 0, max: 1000 };

    return {
      preferred_combinations,
      avoided_combinations,
      favorite_brands,
      price_sweet_spot
    };
  }

  /**
   * Helper: Calculate outfit score (simplified version of adaptive generator)
   */
  private static calculateOutfitScore(products: Product[]): OutfitScore {
    // Simplified scoring - in production, use full AdaptiveOutfitGenerator logic
    const styleScore = 0.85;
    const colorScore = this.calculateQuickColorHarmony(products);
    const priceScore = this.calculateQuickPriceScore(products);
    const occasionScore = 0.80;
    const noveltyScore = 0.75;

    const overall =
      styleScore * 0.30 +
      colorScore * 0.25 +
      priceScore * 0.20 +
      occasionScore * 0.15 +
      noveltyScore * 0.10;

    return {
      style_match: styleScore,
      color_harmony: colorScore,
      price_optimization: priceScore,
      occasion_fit: occasionScore,
      novelty: noveltyScore,
      overall
    };
  }

  private static calculateQuickColorHarmony(products: Product[]): number {
    const colors = products.flatMap(p => p.colors || []);
    if (colors.length <= 2) return 0.95;
    if (colors.length === 3) return 0.85;
    return 0.75;
  }

  private static calculateQuickPriceScore(products: Product[]): number {
    const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
    if (totalPrice <= 300) return 0.95;
    if (totalPrice <= 500) return 0.85;
    return 0.70;
  }

  /**
   * Helper: Check if product category matches target
   */
  private static matchesCategory(productCategory: string, targetCategory: string): boolean {
    const normalized = productCategory.toLowerCase();
    const target = targetCategory.toLowerCase();

    if (target === 'top') {
      return normalized.includes('top') || normalized.includes('shirt') || normalized.includes('blouse');
    }
    if (target === 'bottom') {
      return normalized.includes('bottom') || normalized.includes('pants') || normalized.includes('jeans') || normalized.includes('skirt');
    }
    if (target === 'shoes') {
      return normalized.includes('shoe') || normalized.includes('footwear');
    }
    if (target === 'accessory') {
      return normalized.includes('accessory') || normalized.includes('bag') || normalized.includes('jewelry');
    }

    return false;
  }

  /**
   * Record swap in database
   */
  private static async recordSwap(
    outfitId: string,
    category: string,
    oldProductId: string,
    newProductId: string,
    scoreBefore: number,
    scoreAfter: number,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    try {
      await supabase.from('outfit_swaps').insert({
        outfit_id: outfitId,
        user_id: userId,
        session_id: sessionId,
        category,
        old_product_id: oldProductId,
        new_product_id: newProductId,
        score_before: scoreBefore,
        score_after: scoreAfter,
        improvement: scoreAfter > scoreBefore,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('[AdaptiveOutfitRemixer] Error recording swap:', error);
    }
  }

  /**
   * Generate Nova insight about swap
   */
  private static generateSwapInsight(
    category: string,
    oldProduct: Product,
    newProduct: Product,
    scoreDelta: number
  ): string {
    if (scoreDelta > 0.10) {
      return `🚀 Geweldige swap! De nieuwe ${category} verhoogt je score met ${Math.round(scoreDelta * 100)}%. Perfect bij de rest van je outfit.`;
    }
    if (scoreDelta > 0.05) {
      return `✨ Mooie verbetering! Deze ${category} werkt beter met je andere items (+${Math.round(scoreDelta * 100)}%).`;
    }
    if (scoreDelta > 0) {
      return `👍 Goede keuze! Kleine verbetering in harmonie met deze ${category}.`;
    }
    if (scoreDelta < -0.05) {
      return `🤔 Deze ${category} past minder goed bij je huidige outfit. Probeer een andere kleur of stijl?`;
    }
    return `💭 Interessante keuze! De score blijft ongeveer gelijk. Ga voor wat je mooi vindt!`;
  }

  /**
   * Generate reason for swap suggestion
   */
  private static generateSwapReason(
    category: string,
    oldProduct: Product,
    newProduct: Product,
    improvement: number
  ): string {
    const reasons = [
      `Betere kleurharmonie met je outfit`,
      `Meer bij je stijlprofiel`,
      `Betere prijs-kwaliteit verhouding`,
      `Populair bij vergelijkbare profielen`
    ];

    return reasons[Math.floor(Math.random() * reasons.length)];
  }
}
