/**
 * Van de oordelen in de kalibratiestap naar de product-ID's die
 * get_kandidaten meeweegt (p_liked_ids en p_disliked_ids).
 *
 * Tot 21 oktober 2026 deed een oordeel niets voor de uitslag: met
 * USE_ADAPTIVE_SYSTEM ging het via record_swipe naar swipe_preferences, en
 * niets las dat terug bij het samenstellen. Nu bewaart de quiz de stukken van
 * elke beoordeelde outfit in `calibrationRatings`, en naarKandidatenParams
 * stuurt ze mee. "Twijfel" telt niet mee.
 */
import type { CalibrationOutfit } from '@/services/visualPreferences/calibrationService';
import type { KalibratieBeoordelingen } from '@/services/outfits/kandidaten';
import { isUuid } from '@/utils/sessionId';

export type KalibratieOordeel = 'spot_on' | 'not_for_me' | 'maybe';

function stukkenVan(outfit: CalibrationOutfit): string[] {
  return Object.values(outfit.items)
    .map((item) => item?.id)
    .filter((id): id is string => typeof id === 'string' && isUuid(id));
}

/**
 * De stukken zoals ze nu op de kaart staan, dus na een eventuele wissel. Een
 * stuk in een gelikete en een afgewezen outfit telt als like: het lag niet aan
 * dat ene stuk, en afgewezen stukken vallen helemaal uit de pool.
 */
export function beoordelingenUitKalibratie(
  outfits: CalibrationOutfit[],
  oordelen: Record<string, KalibratieOordeel>
): KalibratieBeoordelingen {
  const liked: string[] = [];
  const disliked: string[] = [];
  for (const outfit of outfits) {
    const oordeel = oordelen[outfit.id];
    const doel = oordeel === 'spot_on' ? liked : oordeel === 'not_for_me' ? disliked : null;
    if (!doel) continue;
    for (const id of stukkenVan(outfit)) if (!doel.includes(id)) doel.push(id);
  }
  return { liked, disliked: disliked.filter((id) => !liked.includes(id)) };
}
