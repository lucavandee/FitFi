/**
 * De product-ID's van outfits die de bezoeker in de kalibratie "spot on" vond.
 *
 * Tot 15 oktober 2026 ging een kalibratie-oordeel alleen naar de database
 * (record_swipe of outfit_calibration_feedback) en las de uitslag daar niets
 * van terug: de stap deed niets. Nu gaan de gelikete producten als
 * p_liked_ids naar get_kandidaten, dat er visueel vergelijkbare producten bij
 * zoekt (0,2 van de score, via de embeddings).
 *
 * Per outfit bewaard, zodat een ander oordeel over dezelfde outfit de likes
 * weer weghaalt.
 */
const SLEUTEL = 'ff_kalibratie_likes';

type Opslag = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type KalibratieOordeel = 'spot_on' | 'not_for_me' | 'maybe';

/** get_kandidaten verwacht uuid's; een ander ID laat de hele aanroep falen. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function lees(opslag: Opslag): Record<string, string[]> {
  try {
    const ruw = opslag.getItem(SLEUTEL);
    const kaart = ruw ? JSON.parse(ruw) : {};
    return kaart && typeof kaart === 'object' && !Array.isArray(kaart) ? kaart : {};
  } catch {
    return {};
  }
}

export function bewaarKalibratieOordeel(
  opslag: Opslag,
  outfitId: string,
  productIds: string[],
  oordeel: KalibratieOordeel
): void {
  const kaart = lees(opslag);
  if (oordeel === 'spot_on') kaart[outfitId] = productIds.filter((id) => UUID.test(id));
  else delete kaart[outfitId];
  opslag.setItem(SLEUTEL, JSON.stringify(kaart));
}

export function leesKalibratieLikes(opslag: Opslag): string[] {
  const ids = Object.values(lees(opslag)).flat();
  return [...new Set(ids.filter((id) => typeof id === 'string' && UUID.test(id)))];
}

/** Bij een nieuwe kalibratie: oude likes van een eerdere quiz tellen niet mee. */
export function wisKalibratie(opslag: Opslag): void {
  opslag.removeItem(SLEUTEL);
}
