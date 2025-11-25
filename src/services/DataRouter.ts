import type { Product, Outfit, Season } from "@/engine";
import { fetchProducts, fetchOutfits } from "@/services/data/dataService";
import { outfitService } from "@/services/outfits/outfitService";
import { LS_KEYS } from "@/lib/quiz/types";

/**
 * Productaanbevelingen (met nette mapping naar engine/Product).
 */
export async function getRecommendedProducts(opts?: {
  count?: number;
  season?: Season;
  gender?: "male" | "female" | "unisex";
}): Promise<Product[]> {
  const { data } = await fetchProducts({ gender: opts?.gender });
  const items = (data || []).map((p) => ({
    id: p.id,
    title: p.title || p.name || "Product",
    name: p.name ?? p.title,
    brand: p.brand,
    price: p.price,
    original_price: p.original_price,
    imageUrl: p.imageUrl || p.image,
    url: p.url,
    retailer: p.retailer,
    category: p.category,
    description: p.description,
    tags: p.tags,
  }));
  return opts?.count ? items.slice(0, opts.count) : items;
}

/**
 * Outfitaanbevelingen - gebruikt OutfitService met recommendation engine.
 */
export async function getOutfitRecommendations(_userId?: string, opts?: { limit?: number }): Promise<Outfit[]> {
  try {
    const quizAnswersRaw = localStorage.getItem(LS_KEYS.QUIZ_ANSWERS);

    if (!quizAnswersRaw) {
      console.warn('[DataRouter] No quiz answers found, using fallback');
      return getFallbackOutfits();
    }

    const quizAnswers = JSON.parse(quizAnswersRaw);

    const outfits = await outfitService.generateOutfits(
      quizAnswers,
      opts?.limit || 6
    );

    if (outfits && outfits.length > 0) {
      console.log(`[DataRouter] Generated ${outfits.length} personalized outfits`);
      return outfits;
    }

    console.warn('[DataRouter] No outfits generated, using fallback');
    return getFallbackOutfits();
  } catch (error) {
    console.error('[DataRouter] Error generating outfits:', error);
    return getFallbackOutfits();
  }
}

function getFallbackOutfits(): Outfit[] {
  const prods = [];
  const chunks: Product[][] = [prods.slice(0, 4), prods.slice(4, 8), prods.slice(8, 12)];
  return chunks
    .filter((c) => c.length > 0)
    .map((c, i) => ({
      id: `outfit-${i + 1}`,
      title: `Outfit ${i + 1}`,
      products: c,
    }));
}

/**
 * FEED (compatibel met FeedPage): we leveren een lijst outfits.
 * - Simpel en robuust: gebruikt getOutfitRecommendations onder water.
 * - Optionele limit ondersteunt slicing voor UI.
 */
export async function getFeed(opts?: { limit?: number; userId?: string; count?: number; archetypes?: string[]; offset?: number }): Promise<Outfit[]> {
  const outfits = await getOutfitRecommendations(opts?.userId, { limit: opts?.limit || opts?.count });
  return opts?.limit ? outfits.slice(0, opts.limit) : outfits;
}