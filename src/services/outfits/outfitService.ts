import { supabase } from "@/lib/supabaseClient";
import { generateRecommendationsFromAnswers } from "@/engine/recommendationEngine";
import { generateNovaExplanation } from "@/engine/explainOutfit";
import { filterByGender, getUserGender } from "@/services/products/genderFilter";
import { reclassifyProducts } from "@/engine/productClassifier";
import type { Product } from "@/engine/types";
import type { Outfit } from "@/engine/types";

export interface GeneratedOutfit extends Outfit {
  explanation?: string;
}

class OutfitService {
  private productsCache: Map<string, Product[]> = new Map();
  private cacheTimestamps: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 1000 * 60 * 30;

  async getProducts(gender?: string, forceRefresh = false): Promise<Product[]> {
    const cacheKey = gender || '_all';
    const cached = this.productsCache.get(cacheKey);
    const cachedAt = this.cacheTimestamps.get(cacheKey) ?? 0;

    if (!forceRefresh && cached && Date.now() - cachedAt < this.CACHE_DURATION) {
      return cached;
    }

    const client = supabase();
    if (!client) {
      console.warn('[OutfitService] No Supabase client available');
      return [];
    }

    try {
      let query = client
        .from('products')
        .select('*')
        .eq('in_stock', true);

      if (gender && gender !== 'unisex' && gender !== 'prefer-not-to-say') {
        query = query.or(`gender.eq.${gender},gender.eq.unisex`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[OutfitService] Error fetching products:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.warn('[OutfitService] No products in database');
        return [];
      }

      const rawProducts = data.map(this.mapDatabaseProduct);

      const { classified: products } = reclassifyProducts(rawProducts);

      this.productsCache.set(cacheKey, products);
      this.cacheTimestamps.set(cacheKey, Date.now());

      console.log(`[OutfitService] Loaded ${products.length} ${gender || 'all'}-gender classified products`);
      return products;
    } catch (error) {
      console.error('[OutfitService] Exception fetching products:', error);
      return [];
    }
  }

  async generateOutfits(
    quizAnswers: Record<string, any>,
    count: number = 6
  ): Promise<GeneratedOutfit[]> {
    try {
      const gender = quizAnswers.gender as string | undefined;
      const products = await this.getProducts(gender);

      console.log(`[OutfitService] Loaded ${products.length} products from database`);

      if (products.length === 0) {
        console.error('[OutfitService] No products available');
        return [];
      }

      // Generate outfits - recommendationEngine handles ALL filtering
      const outfits = generateRecommendationsFromAnswers(
        quizAnswers,
        products,
        count
      );

      if (outfits.length === 0) {
        console.warn('[OutfitService] No outfits generated - likely insufficient products after filtering');
        return [];
      }

      const outfitsWithExplanations = outfits.map((outfit) => ({
        ...outfit,
        explanation: this.generateExplanation(outfit, quizAnswers),
      }));

      console.log(`[OutfitService] Successfully generated ${outfitsWithExplanations.length} outfits`);
      return outfitsWithExplanations;
    } catch (error) {
      console.error('[OutfitService] Error generating outfits:', error);
      return [];
    }
  }

  private generateExplanation(outfit: Outfit, quizAnswers: Record<string, any>): string {
    try {
      const archetype = quizAnswers.archetype || outfit.archetype || 'casual_chic';
      const bodyType = quizAnswers.bodyType || 'balanced';
      const colorProfile = quizAnswers.colorProfile || { season: 'warm' };

      const parts: string[] = [];

      parts.push(`Deze outfit past perfect bij jouw ${archetype} stijl.`);

      if (outfit.products && outfit.products.length > 0) {
        const categories = [...new Set(outfit.products.map(p => p.category))];
        parts.push(`De combinatie van ${categories.join(', ')} creëert een harmonieus geheel.`);
      }

      if (colorProfile.season) {
        parts.push(`De kleuren zijn gekozen op basis van jouw ${colorProfile.season} ondertoon.`);
      }

      if (bodyType) {
        parts.push(`Het silhouet flatteert jouw ${bodyType} figuur.`);
      }

      return parts.join(' ');
    } catch (error) {
      console.error('[OutfitService] Error generating explanation:', error);
      return 'Deze outfit is speciaal voor jou samengesteld op basis van jouw stijlprofiel.';
    }
  }

  private mapDatabaseProduct(dbProduct: any): Product {
    const tags: string[] = dbProduct.tags || [];
    const style: string = dbProduct.style || '';
    const styleTags = style ? [...tags, ...style.split(/[,;/]+/).map((s: string) => s.trim()).filter(Boolean)] : tags;

    return {
      id: dbProduct.id,
      name: dbProduct.name || dbProduct.title,
      brand: dbProduct.brand,
      price: dbProduct.price,
      imageUrl: dbProduct.image_url || dbProduct.imageUrl,
      category: dbProduct.category,
      type: dbProduct.type,
      gender: dbProduct.gender,
      colors: dbProduct.colors || [],
      color: (dbProduct.colors || [])[0],
      sizes: dbProduct.sizes || [],
      tags,
      styleTags,
      retailer: dbProduct.retailer,
      affiliateUrl: dbProduct.affiliate_url || dbProduct.affiliateUrl,
      productUrl: dbProduct.product_url || dbProduct.productUrl,
      description: dbProduct.description,
      inStock: dbProduct.in_stock ?? true,
      rating: dbProduct.rating,
      reviewCount: dbProduct.review_count,
    };
  }

  clearCache(): void {
    this.productsCache.clear();
    this.cacheTimestamps.clear();
  }
}

export const outfitService = new OutfitService();
