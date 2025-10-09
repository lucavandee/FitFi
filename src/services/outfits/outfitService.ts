import { supabase } from "@/lib/supabaseClient";
import { generateRecommendationsFromAnswers } from "@/engine/recommendationEngine";
import { generateNovaExplanation } from "@/engine/explainOutfit";
import type { Product } from "@/engine/types";
import type { Outfit } from "@/engine/types";

export interface GeneratedOutfit extends Outfit {
  explanation?: string;
}

class OutfitService {
  private productsCache: Product[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

  async getProducts(forceRefresh = false): Promise<Product[]> {
    if (
      !forceRefresh &&
      this.productsCache &&
      Date.now() - this.cacheTimestamp < this.CACHE_DURATION
    ) {
      return this.productsCache;
    }

    const client = supabase();
    if (!client) {
      console.warn('[OutfitService] No Supabase client, using fallback');
      return this.getFallbackProducts();
    }

    try {
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('in_stock', true);

      if (error) {
        console.error('[OutfitService] Error fetching products:', error);
        return this.getFallbackProducts();
      }

      if (!data || data.length === 0) {
        console.warn('[OutfitService] No products in database');
        return this.getFallbackProducts();
      }

      const products = data.map(this.mapDatabaseProduct);
      this.productsCache = products;
      this.cacheTimestamp = Date.now();

      console.log(`[OutfitService] Loaded ${products.length} products from database`);
      return products;
    } catch (error) {
      console.error('[OutfitService] Exception fetching products:', error);
      return this.getFallbackProducts();
    }
  }

  async generateOutfits(
    quizAnswers: Record<string, any>,
    count: number = 6
  ): Promise<GeneratedOutfit[]> {
    try {
      const products = await this.getProducts();

      if (products.length < 10) {
        console.error('[OutfitService] Not enough products to generate outfits');
        return [];
      }

      const outfits = generateRecommendationsFromAnswers(
        quizAnswers,
        products,
        count
      );

      const outfitsWithExplanations = outfits.map((outfit) => ({
        ...outfit,
        explanation: this.generateExplanation(outfit, quizAnswers),
      }));

      console.log(`[OutfitService] Generated ${outfitsWithExplanations.length} outfits`);
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
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      brand: dbProduct.brand,
      price: dbProduct.price,
      imageUrl: dbProduct.image_url,
      category: dbProduct.category,
      type: dbProduct.type,
      gender: dbProduct.gender,
      colors: dbProduct.colors || [],
      sizes: dbProduct.sizes || [],
      tags: dbProduct.tags || [],
      retailer: dbProduct.retailer,
      affiliateUrl: dbProduct.affiliate_url,
      productUrl: dbProduct.product_url,
      description: dbProduct.description,
      inStock: dbProduct.in_stock ?? true,
      rating: dbProduct.rating,
      reviewCount: dbProduct.review_count,
    };
  }

  private async getFallbackProducts(): Promise<Product[]> {
    try {
      const response = await fetch('/data/products/product_feed.json');
      if (!response.ok) {
        console.error('[OutfitService] Failed to load fallback products');
        return [];
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error('[OutfitService] Invalid fallback product data');
        return [];
      }

      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        imageUrl: item.image_url,
        category: item.category,
        type: item.type,
        gender: item.gender,
        colors: item.colors || [],
        sizes: item.sizes || [],
        tags: item.tags || [],
        retailer: item.retailer,
        affiliateUrl: item.affiliate_url,
        productUrl: item.product_url,
        description: item.description,
        inStock: item.in_stock ?? true,
        rating: item.rating,
        reviewCount: item.review_count,
      }));
    } catch (error) {
      console.error('[OutfitService] Error loading fallback products:', error);
      return [];
    }
  }

  clearCache(): void {
    this.productsCache = null;
    this.cacheTimestamp = 0;
  }
}

export const outfitService = new OutfitService();
