import { supabase } from "@/lib/supabaseClient";
import { generateRecommendationsFromAnswers } from "@/engine/recommendationEngine";
import { generateNovaExplanation } from "@/engine/explainOutfit";
import { filterByGender, getUserGender } from "@/services/products/genderFilter";
import { curatedMaleProducts } from "@/data/curatedProducts";
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
        console.warn('[OutfitService] No products in database, using fallback');
        return this.getFallbackProducts();
      }

      const products = data.map(this.mapDatabaseProduct);

      this.productsCache = products;
      this.cacheTimestamp = Date.now();

      const retailerCounts = products.reduce((acc, p) => {
        acc[p.retailer || 'Unknown'] = (acc[p.retailer || 'Unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log(`[OutfitService] Loaded ${products.length} products from unified catalog:`, retailerCounts);
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
      // Get all products - filtering is now done in recommendationEngine
      const products = await this.getProducts();

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
      sizes: dbProduct.sizes || [],
      tags: dbProduct.tags || [],
      retailer: dbProduct.retailer,
      affiliateUrl: dbProduct.affiliate_url || dbProduct.affiliateUrl,
      productUrl: dbProduct.product_url || dbProduct.productUrl,
      description: dbProduct.description,
      inStock: dbProduct.in_stock ?? true,
      rating: dbProduct.rating,
      reviewCount: dbProduct.review_count,
    };
  }

  private async getFallbackProducts(): Promise<Product[]> {
    console.log('[OutfitService] Using curated male products as fallback');

    return curatedMaleProducts.map((product) => ({
      id: product.id,
      name: product.title,
      brand: product.retailer,
      price: product.price.current,
      imageUrl: product.image,
      category: product.category || 'general',
      type: product.category || 'clothing',
      gender: product.gender,
      colors: product.color ? [product.color] : [],
      sizes: product.sizes || [],
      tags: [],
      retailer: product.retailer,
      affiliateUrl: product.url,
      productUrl: product.url,
      description: product.reason || '',
      inStock: product.availability === 'in_stock',
      rating: 4.5,
      reviewCount: 0,
    }));
  }

  clearCache(): void {
    this.productsCache = null;
    this.cacheTimestamp = 0;
  }
}

export const outfitService = new OutfitService();
