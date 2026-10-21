/**
 * Live pad van het calibratiescherm naar engine v2.
 *
 * Apart van `engineV2Calibration.ts` gehouden: die module is bewust vrij van
 * Supabase, zodat de eisen op een vaste catalogus getest kunnen worden zonder
 * database. Hier komt de productbron erbij.
 *
 * `OutfitService.getProducts` doet al het voorwerk: sinds taak 7 (fixronde 1,
 * gedocumenteerd hier omdat deze aanroeper toen stilzwijgend meeveranderde)
 * is dat niet meer een ongefilterde `select * from products`, maar de RPC
 * `get_kandidaten` over de hele catalogus, gevolgd door classificatie en het
 * veiligheidsnet tegen kinderkleding (`reclassifyProducts` +
 * `filterVeiligeProducten`, via `bereidKandidatenVoorMetDiagnose`). Die
 * herclassificatie is de reden dat er geen twee paar schoenen meer in een
 * outfit kunnen belanden: een schoen met `category='bottom'` in de feed
 * wordt hier alsnog als footwear herkend.
 *
 * Tot 21 oktober 2026 vroeg dit pad de pool op met `getProducts(gender)`:
 * geen gelegenheden, het standaardbudget van 0 tot 150 euro en geen
 * pasvorm of print. De engine stelde de kaarten dan per gelegenheid samen uit
 * een pool die daar niet op gekozen was. Lucs quiz (streetwear, vier
 * gelegenheden, tot 500 euro) kreeg zo een oversized hoodie met een denim
 * rok als "formeel". Nu gaat de quiz mee zoals de uitslag hem ook meestuurt,
 * zonder de oordelen uit deze stap zelf: de kaarten en het alternatief bij
 * een wissel blijven dan dezelfde pool, hoe er ook beoordeeld wordt. Wie nog
 * niets beoordeelde, vraagt daardoor exact dezelfde pool als de uitslag, en
 * die staat dan al in de cache van outfitService.
 */
import { outfitService } from '@/services/outfits/outfitService';
import type {
  CalibrationOutfit,
  CalibrationOutfitItem,
} from '@/services/visualPreferences/calibrationService';
import {
  buildCalibrationOutfits,
  buildSlotAlternatives,
  seedVoorSessie,
  type BuildCalibrationOptions,
  type CalibrationQuizData,
  type CalibrationSlot,
} from './engineV2Calibration';

/** De quiz zoals de uitslag hem naar get_kandidaten stuurt, zonder de oordelen uit deze stap. */
export function poolAntwoordenVoorKalibratie(
  quizData: CalibrationQuizData | undefined
): Record<string, unknown> {
  const { calibrationRatings: _oordelen, ...antwoorden } = (quizData ?? {}) as Record<string, unknown>;
  return antwoorden;
}

export async function generateCalibrationOutfitsV2(
  quizData: CalibrationQuizData | undefined,
  sessionId?: string | null,
  options: BuildCalibrationOptions = {}
): Promise<CalibrationOutfit[]> {
  const products = await outfitService.getProducts(poolAntwoordenVoorKalibratie(quizData));

  if (products.length === 0) {
    console.warn('[CalibrationV2] geen producten beschikbaar');
    return [];
  }

  const outfits = buildCalibrationOutfits(products, quizData, {
    ...options,
    seed: options.seed ?? seedVoorSessie(sessionId),
  });

  console.log(
    `[CalibrationV2] ${outfits.length} outfits uit engine v2 (${products.length} producten, gelegenheden: ${
      (quizData?.occasions ?? []).join(', ') || 'geen'
    })`
  );

  return outfits;
}

/**
 * Vervang één item op de kaart. Het alternatief komt uit dezelfde gekeurde
 * outfits, dus met dezelfde garanties op gender, budget en productSafety als
 * de oorspronkelijke selectie. Items die al in deze outfit zitten worden
 * overgeslagen, zodat herhaald klikken door de alternatieven loopt.
 */
export async function swapCalibrationItemV2(
  quizData: CalibrationQuizData | undefined,
  outfit: CalibrationOutfit,
  slot: CalibrationSlot,
  sessionId?: string | null,
  options: BuildCalibrationOptions = {}
): Promise<CalibrationOutfitItem | null> {
  const products = await outfitService.getProducts(poolAntwoordenVoorKalibratie(quizData));
  if (products.length === 0) return null;

  const inGebruik = Object.values(outfit.items)
    .filter(Boolean)
    .map((item) => (item as CalibrationOutfitItem).id);

  const alternatieven = buildSlotAlternatives(products, quizData, slot, {
    ...options,
    seed: options.seed ?? seedVoorSessie(sessionId),
    excludeIds: inGebruik,
  });

  return alternatieven[0] ?? null;
}
