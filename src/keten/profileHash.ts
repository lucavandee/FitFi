import { sha256Hex } from '@/utils/hash';
import type { TasteProfileInput } from './types';

/**
 * Normalisatie uit spec 5.2.1: gender, gesorteerde occasions, budget_min,
 * budget_max, gesorteerde no-go ids, gesorteerde lijst van (pair_id, chosen_set_id).
 * Twee mensen met dezelfde keuzes krijgen dezelfde string, dus dezelfde outfits.
 *
 * Niet te verwarren met hashProfile in
 * src/services/ratings/outfitRatings.ts: dat hasht de bestaande
 * quiz-antwoorden (LS_KEYS.QUIZ_ANSWERS via naarOutfitBepalendeVelden) voor
 * de huidige resultatenpagina en outfit_ratings. profileHash hier hasht de
 * genormaliseerde smaak-invoer van de nieuwe stylist-route (TasteProfileInput,
 * spec 5.2), inclusief de gesorteerde keuzes uit het paren-scherm. Twee
 * functies met twee betekenissen op twee tabellen; niet samenvoegen.
 */
export function normaliseerProfiel(p: TasteProfileInput): string {
  const occasions = [...p.occasions].sort();
  const nogo = [...p.nogo_product_ids].sort();
  const keuzes = p.choices.map((k) => `${k.pair_id}:${k.chosen_set_id}`).sort();
  return [
    p.gender,
    occasions.join(','),
    String(p.budget_min),
    String(p.budget_max),
    nogo.join(','),
    keuzes.join(','),
  ].join('|');
}

export async function profileHash(p: TasteProfileInput): Promise<string> {
  return sha256Hex(normaliseerProfiel(p));
}
