import { sha256Hex } from "@/utils/hash";

/**
 * outfit_key: sha256 van de gesorteerde, ontdubbelde product-ids (spec 5.6).
 * Gooit op een lege lijst in plaats van sha256("") terug te geven: een
 * outfit zonder producten heeft geen geldige identiteit, en zonder deze
 * guard zou elke lege outfit op dezelfde sleutel uitkomen (vandaag
 * onbereikbaar vanuit de UI, maar de guard kost niets).
 *
 * Een eigen bestand zonder Supabase-client, zodat scripts dezelfde sleutel
 * kunnen maken (scripts/keten/stijl-sets.ts): een goedgekeurde outfit en een
 * beoordeling in outfit_ratings zijn dan zonder extra kolom te koppelen.
 */
export async function outfitKey(productIds: string[]): Promise<string> {
  const ids = Array.from(new Set(productIds.map(String))).sort();
  if (ids.length === 0) {
    throw new Error("outfitKey: geen product-ids, een outfit zonder producten heeft geen geldige sleutel");
  }
  return sha256Hex(ids.join(","));
}
