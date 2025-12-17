import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product';

export interface OutfitScore {
  style_match: number;       // 0-1: How well it matches their archetype
  color_harmony: number;     // 0-1: Color theory score
  price_optimization: number; // 0-1: Budget fit
  occasion_fit: number;      // 0-1: Occasion appropriateness
  novelty: number;           // 0-1: Visual diversity (avoid repetition)
  overall: number;           // Weighted average
}

export interface AdaptiveOutfit {
  id: string;
  products: Product[];
  score: OutfitScore;
  explanation: string;
  price_breakdown: {
    total: number;
    tier: 'budget' | 'mid' | 'premium';
    value_score: number; // Quality/price ratio
  };
  visual_features: {
    dominant_colors: string[];
    style_tags: string[];
    formality_score: number; // 1-10
    pattern_complexity: 'minimal' | 'moderate' | 'detailed';
  };
  nova_insight?: string; // Real-time Nova tip
  badges?: string[]; // UI diversity badges
}

interface SwipeHistory {
  liked_colors: string[];
  disliked_colors: string[];
  liked_styles: string[];
  disliked_styles: string[];
  price_range: { min: number; max: number; preferred_avg: number };
  formality_preference: number; // 1-10 average
  pattern_preference: 'minimal' | 'moderate' | 'detailed' | 'mixed';
}

interface GenerationContext {
  session_id: string;
  swipe_count: number;
  exploration_rate: number; // 0-1: Higher = more diverse
  user_profile: {
    archetype: string;
    colors: string[];
    budget: 'low' | 'medium' | 'high';
    occasions: string[];
  };
  swipe_history?: SwipeHistory;
  visual_embedding?: Record<string, number>; // From mood photos
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
}

export class AdaptiveOutfitGenerator {
  private static SCORING_WEIGHTS = {
    style_match: 0.30,
    color_harmony: 0.25,
    price_optimization: 0.20,
    occasion_fit: 0.15,
    novelty: 0.10
  };

  private static PRICE_TIERS = {
    budget: { min: 0, max: 200, target: 150 },
    mid: { min: 150, max: 400, target: 250 },
    premium: { min: 300, max: 800, target: 500 }
  };

  /**
   * Generate adaptive outfits that learn from swipe behavior
   */
  async generateAdaptiveOutfits(
    context: GenerationContext,
    count: number = 3
  ): Promise<AdaptiveOutfit[]> {
    const outfits: AdaptiveOutfit[] = [];

    // Get available products
    const products = await this.getProductPool(context);

    // Get recommendations from learned preferences
    const recommendations = await this.getAdaptiveRecommendations(context.session_id);

    // Generate diverse outfits with exploration/exploitation balance
    for (let i = 0; i < count; i++) {
      const shouldExplore = Math.random() < context.exploration_rate;

      const outfit = shouldExplore
        ? await this.generateExploratoryOutfit(products, context, i)
        : await this.generateOptimizedOutfit(products, context, recommendations, i);

      if (outfit) {
        outfits.push(outfit);
      }
    }

    // Ensure diversity across the set
    return this.ensureOutfitDiversity(outfits);
  }

  /**
   * Generate outfit optimized for learned preferences
   */
  private async generateOptimizedOutfit(
    products: Product[],
    context: GenerationContext,
    recommendations: any,
    index: number
  ): Promise<AdaptiveOutfit | null> {
    const swipeHistory = context.swipe_history;

    // Filter products by learned preferences
    const preferredProducts = products.filter(p => {
      // Color preference
      const hasPreferredColor = swipeHistory?.liked_colors.some(c =>
        p.colors?.includes(c)
      ) ?? true;

      // Style preference
      const hasPreferredStyle = swipeHistory?.liked_styles.some(s =>
        p.style?.includes(s)
      ) ?? true;

      // Price preference
      const inPriceRange = swipeHistory
        ? p.price >= swipeHistory.price_range.min && p.price <= swipeHistory.price_range.max
        : true;

      // Avoid disliked features
      const hasDislikedColor = swipeHistory?.disliked_colors.some(c =>
        p.colors?.includes(c)
      ) ?? false;

      return (hasPreferredColor || hasPreferredStyle) && inPriceRange && !hasDislikedColor;
    });

    // Build outfit from filtered products
    const outfit = await this.buildOutfitFromProducts(
      preferredProducts.length > 0 ? preferredProducts : products,
      context,
      'optimized'
    );

    if (!outfit) return null;

    // Add Nova insight for optimization
    outfit.nova_insight = this.generateNovaInsight(outfit, context, 'optimized');

    return outfit;
  }

  /**
   * Generate exploratory outfit to discover new preferences
   */
  private async generateExploratoryOutfit(
    products: Product[],
    context: GenerationContext,
    index: number
  ): Promise<AdaptiveOutfit | null> {
    // Deliberately try new combinations
    const outfit = await this.buildOutfitFromProducts(products, context, 'exploratory');

    if (!outfit) return null;

    // Add Nova insight for exploration
    outfit.nova_insight = this.generateNovaInsight(outfit, context, 'exploratory');

    return outfit;
  }

  /**
   * Build outfit from product pool with smart selection
   */
  private async buildOutfitFromProducts(
    products: Product[],
    context: GenerationContext,
    strategy: 'optimized' | 'exploratory'
  ): Promise<AdaptiveOutfit | null> {
    // Product selection strategy
    const top = this.selectProduct(products, 'top', context);
    const bottom = this.selectProduct(products, 'bottom', context);
    const footwear = this.selectProduct(products, 'footwear', context);

    if (!top || !bottom || !footwear) {
      console.warn('[AdaptiveOutfitGenerator] Could not build complete outfit');
      return null;
    }

    const outfitProducts = [top, bottom, footwear];
    const totalPrice = outfitProducts.reduce((sum, p) => sum + (p.price || 0), 0);

    // Extract visual features
    const colors = [...new Set(outfitProducts.flatMap(p => p.colors || []))];
    const styles = [...new Set(outfitProducts.flatMap(p => p.style ? [p.style] : []))];

    // Calculate multi-dimensional scores
    const scores = this.calculateOutfitScores(outfitProducts, context, colors, totalPrice);

    // Generate explanation
    const explanation = this.generateExplanation(outfitProducts, scores, context);

    // Determine price tier
    const priceTier = this.determinePriceTier(totalPrice);

    return {
      id: `outfit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      products: outfitProducts,
      score: scores,
      explanation,
      price_breakdown: {
        total: totalPrice,
        tier: priceTier,
        value_score: this.calculateValueScore(outfitProducts, totalPrice)
      },
      visual_features: {
        dominant_colors: colors.slice(0, 3),
        style_tags: styles,
        formality_score: this.calculateFormalityScore(outfitProducts),
        pattern_complexity: this.assessPatternComplexity(outfitProducts)
      }
    };
  }

  /**
   * Multi-dimensional outfit scoring
   */
  private calculateOutfitScores(
    products: Product[],
    context: GenerationContext,
    colors: string[],
    totalPrice: number
  ): OutfitScore {
    // Style match (based on archetype + visual embeddings)
    const styleMatch = this.scoreStyleMatch(
      products,
      context.user_profile.archetype,
      context.visual_embedding
    );

    // Color harmony (boost with seasonal colors if season provided)
    let colorHarmony = this.scoreColorHarmony(colors);
    if (context.season) {
      colorHarmony = this.applySeasonalBoost(colors, colorHarmony, context.season);
    }

    // Price optimization
    const priceOptimization = this.scorePriceOptimization(
      totalPrice,
      context.user_profile.budget,
      context.swipe_history
    );

    // Occasion fit
    const occasionFit = this.scoreOccasionFit(products, context.user_profile.occasions);

    // Novelty (avoid showing similar outfits)
    const novelty = 0.8; // TODO: Compare with previously shown outfits

    // Weighted overall score
    const overall =
      styleMatch * AdaptiveOutfitGenerator.SCORING_WEIGHTS.style_match +
      colorHarmony * AdaptiveOutfitGenerator.SCORING_WEIGHTS.color_harmony +
      priceOptimization * AdaptiveOutfitGenerator.SCORING_WEIGHTS.price_optimization +
      occasionFit * AdaptiveOutfitGenerator.SCORING_WEIGHTS.occasion_fit +
      novelty * AdaptiveOutfitGenerator.SCORING_WEIGHTS.novelty;

    return {
      style_match: Math.round(styleMatch * 100) / 100,
      color_harmony: Math.round(colorHarmony * 100) / 100,
      price_optimization: Math.round(priceOptimization * 100) / 100,
      occasion_fit: Math.round(occasionFit * 100) / 100,
      novelty: Math.round(novelty * 100) / 100,
      overall: Math.round(overall * 100) / 100
    };
  }

  private scoreStyleMatch(
    products: Product[],
    archetype: string,
    visualEmbedding?: Record<string, number>
  ): number {
    // Advanced archetype matching with style tag analysis
    const archetypeStyleTags: Record<string, string[]> = {
      'Minimalist': ['clean', 'simple', 'monochrome', 'modern', 'sleek'],
      'Classic': ['timeless', 'elegant', 'refined', 'sophisticated', 'traditional'],
      'Bold': ['statement', 'vibrant', 'edgy', 'dramatic', 'colorful'],
      'Casual': ['relaxed', 'comfortable', 'everyday', 'laid-back', 'easy'],
      'Streetwear': ['urban', 'trendy', 'street', 'sporty', 'contemporary'],
      'Bohemian': ['free-spirited', 'eclectic', 'artistic', 'flowing', 'natural'],
      'Romantic': ['feminine', 'soft', 'delicate', 'pretty', 'vintage']
    };

    const targetTags = archetypeStyleTags[archetype] || [];
    if (targetTags.length === 0) return 0.75;

    let matchCount = 0;
    let totalChecks = 0;

    products.forEach(product => {
      const productStyle = product.style?.toLowerCase() || '';
      const productTags = product.tags?.map(t => t.toLowerCase()) || [];

      targetTags.forEach(tag => {
        totalChecks++;
        if (productStyle.includes(tag) || productTags.some(t => t.includes(tag))) {
          matchCount++;
        }
      });
    });

    let baseScore = totalChecks > 0 ? Math.min(0.95, 0.60 + (matchCount / totalChecks) * 0.35) : 0.75;

    // Apply visual embedding boost if available
    if (visualEmbedding && Object.keys(visualEmbedding).length > 0) {
      const embeddingBoost = this.calculateVisualEmbeddingBoost(products, visualEmbedding);
      baseScore = Math.min(1.0, baseScore * (1 + embeddingBoost * 0.15)); // Max 15% boost
    }

    return baseScore;
  }

  /**
   * Calculate boost from visual embeddings (mood photos)
   */
  private calculateVisualEmbeddingBoost(
    products: Product[],
    visualEmbedding: Record<string, number>
  ): number {
    // Map products to embedding dimensions
    let totalBoost = 0;
    let boostCount = 0;

    products.forEach(product => {
      const productStyle = product.style?.toLowerCase() || '';
      const productTags = product.tags?.map(t => t.toLowerCase()) || [];
      const searchText = `${productStyle} ${productTags.join(' ')}`;

      // Check each embedding dimension
      for (const [dimension, score] of Object.entries(visualEmbedding)) {
        if (score > 0.5 && searchText.includes(dimension.toLowerCase())) {
          totalBoost += score;
          boostCount++;
        }
      }
    });

    return boostCount > 0 ? totalBoost / boostCount : 0;
  }

  /**
   * Apply seasonal color boost
   */
  private applySeasonalBoost(
    colors: string[],
    baseScore: number,
    season: 'spring' | 'summer' | 'autumn' | 'winter'
  ): number {
    const seasonalColors: Record<string, string[]> = {
      spring: ['pastel', 'pink', 'mint', 'yellow', 'lavender', 'peach', 'coral'],
      summer: ['white', 'light blue', 'yellow', 'coral', 'turquoise', 'lime', 'bright'],
      autumn: ['burgundy', 'brown', 'orange', 'olive', 'rust', 'camel', 'terracotta'],
      winter: ['navy', 'black', 'grey', 'burgundy', 'forest', 'charcoal', 'plum']
    };

    const seasonColors = seasonalColors[season] || [];
    const matchingColors = colors.filter(c =>
      seasonColors.some(sc => c.toLowerCase().includes(sc))
    );

    // Boost score by up to 10% if colors match season
    const seasonalBoost = (matchingColors.length / Math.max(colors.length, 1)) * 0.10;
    return Math.min(1.0, baseScore + seasonalBoost);
  }

  private scoreColorHarmony(colors: string[]): number {
    // Advanced color harmony using color theory principles
    if (colors.length === 0) return 0.50;
    if (colors.length === 1) return 1.0; // Perfect monochrome

    // Define color relationships
    const colorFamilies: Record<string, string[]> = {
      neutrals: ['black', 'white', 'grey', 'gray', 'beige', 'cream', 'navy'],
      warm: ['red', 'orange', 'yellow', 'brown', 'burgundy', 'coral'],
      cool: ['blue', 'green', 'purple', 'teal', 'cyan', 'mint'],
      earth: ['brown', 'tan', 'olive', 'khaki', 'terracotta']
    };

    // Check for neutral base (always harmonious)
    const hasNeutral = colors.some(c =>
      colorFamilies.neutrals.some(n => c.toLowerCase().includes(n))
    );

    // Check if colors are from same family (analogous)
    let sameFamily = false;
    for (const family of Object.values(colorFamilies)) {
      const familyCount = colors.filter(c =>
        family.some(f => c.toLowerCase().includes(f))
      ).length;
      if (familyCount === colors.length) {
        sameFamily = true;
        break;
      }
    }

    // Scoring logic
    if (colors.length === 2) {
      if (hasNeutral || sameFamily) return 0.95;
      return 0.85; // Complementary pair
    }

    if (colors.length === 3) {
      if (hasNeutral && sameFamily) return 0.90;
      if (hasNeutral || sameFamily) return 0.80;
      return 0.70; // Triadic
    }

    // More than 3 colors
    if (hasNeutral) return 0.75; // Neutrals help
    return 0.65; // Complex palette
  }

  private scorePriceOptimization(
    totalPrice: number,
    budget: 'low' | 'medium' | 'high',
    swipeHistory?: SwipeHistory
  ): number {
    const tierTargets = {
      low: 150,
      medium: 250,
      high: 500
    };

    const target = swipeHistory?.price_range.preferred_avg || tierTargets[budget];
    const deviation = Math.abs(totalPrice - target);
    const maxDeviation = target * 0.5; // 50% tolerance

    return Math.max(0, 1 - deviation / maxDeviation);
  }

  private scoreOccasionFit(products: Product[], occasions: string[]): number {
    // Advanced occasion matching with formality scoring
    const occasionFormality: Record<string, number> = {
      'casual': 2,
      'everyday': 3,
      'work': 6,
      'business': 7,
      'smart-casual': 5,
      'evening': 7,
      'formal': 9,
      'party': 6,
      'date': 7,
      'weekend': 3,
      'sport': 1,
      'brunch': 4
    };

    if (occasions.length === 0) return 0.85;

    // Calculate average target formality
    const targetFormality = occasions.reduce((sum, occ) => {
      const formality = occasionFormality[occ.toLowerCase()] || 5;
      return sum + formality;
    }, 0) / occasions.length;

    // Calculate outfit formality
    const outfitFormality = this.calculateFormalityScore(products);

    // Score based on formality match (within 2 points = good)
    const formalityDiff = Math.abs(outfitFormality - targetFormality);

    if (formalityDiff <= 1) return 0.95;
    if (formalityDiff <= 2) return 0.85;
    if (formalityDiff <= 3) return 0.70;
    return 0.55;
  }

  private calculateValueScore(products: Product[], totalPrice: number): number {
    // Quality/price ratio (placeholder - needs product quality data)
    const avgPrice = totalPrice / products.length;
    if (avgPrice < 50) return 0.6;
    if (avgPrice < 100) return 0.8;
    return 0.95;
  }

  private calculateFormalityScore(products: Product[]): number {
    // 1 = very casual, 10 = very formal
    const formalityKeywords: Record<string, number> = {
      // Very casual (1-3)
      'joggers': 1, 'sweatpants': 1, 'hoodie': 2, 'sneakers': 2, 't-shirt': 2,
      'shorts': 2, 'flip-flops': 1, 'tank': 2, 'athletic': 1,
      // Casual (4-5)
      'jeans': 4, 'casual': 4, 'polo': 5, 'chinos': 5, 'loafers': 5,
      'sweater': 5, 'cardigan': 5, 'boots': 5,
      // Smart casual (6-7)
      'blazer': 7, 'dress shirt': 7, 'blouse': 6, 'oxford': 6, 'derby': 7,
      'slacks': 6, 'pencil skirt': 7, 'midi dress': 6,
      // Formal (8-10)
      'suit': 9, 'tuxedo': 10, 'gown': 9, 'evening': 9, 'formal': 9,
      'dress shoes': 8, 'heels': 7, 'tie': 8, 'bow tie': 9
    };

    let totalFormality = 0;
    let count = 0;

    products.forEach(product => {
      const name = product.name?.toLowerCase() || '';
      const category = product.category?.toLowerCase() || '';
      const style = product.style?.toLowerCase() || '';
      const searchText = `${name} ${category} ${style}`;

      // Find matching keywords
      for (const [keyword, score] of Object.entries(formalityKeywords)) {
        if (searchText.includes(keyword)) {
          totalFormality += score;
          count++;
          break; // Only count first match per product
        }
      }

      // Default scores by category if no keyword match
      if (count === 0) {
        if (category.includes('bottom') || category.includes('pants')) totalFormality += 4;
        else if (category.includes('top') || category.includes('shirt')) totalFormality += 4;
        else if (category.includes('footwear') || category.includes('shoes')) totalFormality += 5;
        else totalFormality += 5;
        count++;
      }
    });

    return count > 0 ? Math.round(totalFormality / count) : 5;
  }

  private assessPatternComplexity(products: Product[]): 'minimal' | 'moderate' | 'detailed' {
    // Analyze visual complexity based on product characteristics
    const complexityKeywords = {
      minimal: ['solid', 'plain', 'simple', 'monochrome', 'clean', 'basic'],
      detailed: ['print', 'pattern', 'floral', 'striped', 'checkered', 'graphic', 'embroidered', 'textured']
    };

    let minimalCount = 0;
    let detailedCount = 0;

    products.forEach(product => {
      const searchText = `${product.name} ${product.description} ${product.tags?.join(' ')}`.toLowerCase();

      complexityKeywords.minimal.forEach(keyword => {
        if (searchText.includes(keyword)) minimalCount++;
      });

      complexityKeywords.detailed.forEach(keyword => {
        if (searchText.includes(keyword)) detailedCount++;
      });
    });

    if (detailedCount > minimalCount * 2) return 'detailed';
    if (minimalCount > detailedCount * 2) return 'minimal';
    return 'moderate';
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    products: Product[],
    scores: OutfitScore,
    context: GenerationContext
  ): string {
    const explanations: string[] = [];

    if (scores.style_match > 0.8) {
      explanations.push(`Perfect match voor je ${context.user_profile.archetype} stijl`);
    }

    if (scores.color_harmony > 0.85) {
      explanations.push('Kleuren harmoniëren prachtig');
    }

    if (scores.price_optimization > 0.8) {
      explanations.push('Uitstekende prijs-kwaliteit verhouding');
    }

    return explanations.join('. ') + '.';
  }

  /**
   * Generate Nova AI insight
   */
  private generateNovaInsight(
    outfit: AdaptiveOutfit,
    context: GenerationContext,
    strategy: 'optimized' | 'exploratory'
  ): string {
    if (strategy === 'exploratory') {
      return `💡 Dit is een nieuwe stijl voor je. Laat me weten wat je ervan vindt!`;
    }

    if (outfit.score.overall > 0.9) {
      return `✨ Top match! Dit past perfect bij je voorkeuren.`;
    }

    if (outfit.price_breakdown.value_score > 0.9) {
      return `💰 Geweldige deal — premium kwaliteit voor deze prijs.`;
    }

    return `👌 Solide keuze gebaseerd op je swipes.`;
  }

  /**
   * Product selection helpers with intelligent filtering
   */
  private selectProduct(
    products: Product[],
    category: string,
    context: GenerationContext
  ): Product | null {
    let categoryProducts = products.filter(p => p.category === category);
    if (categoryProducts.length === 0) return null;

    const swipeHistory = context.swipe_history;

    // If we have swipe history, apply learned preferences
    if (swipeHistory) {
      // Prefer products with liked colors
      const withLikedColors = categoryProducts.filter(p =>
        swipeHistory.liked_colors.some(c => p.colors?.includes(c))
      );

      // Prefer products with liked styles
      const withLikedStyles = categoryProducts.filter(p =>
        swipeHistory.liked_styles.some(s => p.style?.includes(s))
      );

      // Avoid products with disliked colors
      categoryProducts = categoryProducts.filter(p =>
        !swipeHistory.disliked_colors.some(c => p.colors?.includes(c))
      );

      // Filter by learned price range (with 20% tolerance)
      const priceMin = swipeHistory.price_range.min * 0.8;
      const priceMax = swipeHistory.price_range.max * 1.2;
      categoryProducts = categoryProducts.filter(p =>
        p.price >= priceMin && p.price <= priceMax
      );

      // Prioritize products that match multiple preferences
      if (withLikedColors.length > 0 && withLikedStyles.length > 0) {
        const bestMatches = withLikedColors.filter(p => withLikedStyles.includes(p));
        if (bestMatches.length > 0) categoryProducts = bestMatches;
        else if (withLikedColors.length > 0) categoryProducts = withLikedColors;
        else if (withLikedStyles.length > 0) categoryProducts = withLikedStyles;
      }
    }

    // If filtering resulted in no products, fall back to original set
    if (categoryProducts.length === 0) {
      categoryProducts = products.filter(p => p.category === category);
    }

    // Smart selection with slight randomness (top 30% by relevance)
    const topN = Math.max(1, Math.ceil(categoryProducts.length * 0.3));
    const topProducts = categoryProducts.slice(0, topN);

    return topProducts[Math.floor(Math.random() * topProducts.length)];
  }

  private determinePriceTier(price: number): 'budget' | 'mid' | 'premium' {
    if (price <= 200) return 'budget';
    if (price <= 400) return 'mid';
    return 'premium';
  }

  /**
   * Ensure visual diversity across outfit set
   */
  private ensureOutfitDiversity(outfits: AdaptiveOutfit[]): AdaptiveOutfit[] {
    if (outfits.length <= 1) return outfits;

    const diverseOutfits: AdaptiveOutfit[] = [];
    const usedColorSchemes = new Set<string>();
    const usedPriceTiers = new Set<string>();
    const usedFormality = new Set<number>();

    // Sort by overall score (best first)
    const sortedOutfits = [...outfits].sort((a, b) => b.score.overall - a.score.overall);

    for (const outfit of sortedOutfits) {
      // Create fingerprint for this outfit
      const colorKey = outfit.visual_features.dominant_colors.slice(0, 2).sort().join('-');
      const priceKey = outfit.price_breakdown.tier;
      const formalityKey = Math.floor(outfit.visual_features.formality_score / 2) * 2; // Group by 2s

      // Calculate diversity score
      let diversityBonus = 0;
      if (!usedColorSchemes.has(colorKey)) diversityBonus += 0.3;
      if (!usedPriceTiers.has(priceKey)) diversityBonus += 0.2;
      if (!usedFormality.has(formalityKey)) diversityBonus += 0.2;

      // Only add if diverse OR if we don't have enough outfits yet
      if (diversityBonus > 0.3 || diverseOutfits.length < 2) {
        diverseOutfits.push(outfit);
        usedColorSchemes.add(colorKey);
        usedPriceTiers.add(priceKey);
        usedFormality.add(formalityKey);
      }

      // Stop once we have enough diverse outfits
      if (diverseOutfits.length >= outfits.length) break;
    }

    // If we didn't get enough, add remaining by score
    if (diverseOutfits.length < outfits.length) {
      for (const outfit of sortedOutfits) {
        if (!diverseOutfits.includes(outfit)) {
          diverseOutfits.push(outfit);
          if (diverseOutfits.length >= outfits.length) break;
        }
      }
    }

    // Add diversity badges for UI
    return diverseOutfits.map((outfit, index) => {
      const badges: string[] = [];

      if (index === 0) badges.push('Top Match');
      if (outfit.price_breakdown.tier === 'budget') badges.push('Best Value');
      if (outfit.price_breakdown.tier === 'premium') badges.push('Premium');
      if (outfit.visual_features.formality_score >= 7) badges.push('Elegant');
      if (outfit.visual_features.formality_score <= 3) badges.push('Casual');
      if (outfit.visual_features.pattern_complexity === 'minimal') badges.push('Minimalist');
      if (outfit.visual_features.dominant_colors.length === 1) badges.push('Monochrome');

      return {
        ...outfit,
        badges
      };
    });
  }

  /**
   * Get product pool from database
   */
  private async getProductPool(context: GenerationContext): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .limit(100);

    if (error) {
      console.error('[AdaptiveOutfitGenerator] Error fetching products:', error);
      return [];
    }

    return data as Product[];
  }

  /**
   * Get adaptive recommendations from database
   */
  private async getAdaptiveRecommendations(sessionId: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_adaptive_recommendations', {
      p_session_id: sessionId
    });

    if (error) {
      console.error('[AdaptiveOutfitGenerator] Error getting recommendations:', error);
      return {};
    }

    return data;
  }
}

export const adaptiveOutfitGenerator = new AdaptiveOutfitGenerator();
