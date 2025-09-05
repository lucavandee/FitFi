import filterAndSortProducts from "./filterAndSortProducts";
import explainOutfit from "./explainOutfit";
import type { StyleProfile } from "@/types/style";

export interface RecommendInput {
  products: Product[];
  profile?: StyleProfile;
  limit?: number;
}

export default function recommend({ products, profile, limit = 6 }: RecommendInput): Outfit[] {
  // Simpele baseline: filter op gender en kies een handvol combinaties.
  const gender = profile?.gender || "unisex";
  const pool = filterAndSortProducts(products, { gender });
  const slice = pool.slice(0, Math.max(2, limit));
  const outfits: Outfit[] = slice.map((p, idx) => ({
    id: `auto-${idx}`,
    name: `Outfit ${idx + 1}`,
    items: [p],
    score: 70 + (idx % 25),
  }));
  return outfits.map(o => ({ ...o, explanation: explainOutfit(o) }));
}