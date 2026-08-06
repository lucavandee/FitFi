/**
 * Live pad van het calibratiescherm naar engine v2.
 *
 * Apart van `engineV2Calibration.ts` gehouden: die module is bewust vrij van
 * Supabase, zodat de eisen op een vaste catalogus getest kunnen worden zonder
 * database. Hier komt de productbron erbij.
 *
 * `OutfitService.getProducts` doet al het voorwerk dat het adaptieve pad
 * oversloeg: filteren op in_stock en is_kids, gender-filter, variant-dedupe en
 * `reclassifyProducts` (de enige plek die een verkeerd gelabelde `category`
 * corrigeert). Die herclassificatie is de reden dat er geen twee paar schoenen
 * meer in een outfit kunnen belanden: een schoen met `category='bottom'` in de
 * feed wordt hier alsnog als footwear herkend.
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

export async function generateCalibrationOutfitsV2(
  quizData: CalibrationQuizData | undefined,
  sessionId?: string | null,
  options: BuildCalibrationOptions = {}
): Promise<CalibrationOutfit[]> {
  const gender = typeof quizData?.gender === 'string' ? quizData.gender : undefined;
  const products = await outfitService.getProducts(gender);

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
  const gender = typeof quizData?.gender === 'string' ? quizData.gender : undefined;
  const products = await outfitService.getProducts(gender);
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
