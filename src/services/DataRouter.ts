import type { Product, Outfit, Season } from "@/engine";
import { fetchProducts, fetchOutfits } from "@/services/data/dataService";

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
 * Outfitaanbevelingen (bouwt desnoods op producten als fallback).
 */
export async function getOutfitRecommendations(_userId?: string): Promise<Outfit[]> {
  const { data } = await fetchOutfits();
  if (data && data.length) return data;

  // fallback: bouw 3 outfits uit products
  const prods = await getRecommendedProducts({ count: 12 });
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
export async function getFeed(opts?: { limit?: number; userId?: string }): Promise<Outfit[]> {
  const outfits = await getOutfitRecommendations(opts?.userId);
  return opts?.limit ? outfits.slice(0, opts.limit) : outfits;
}