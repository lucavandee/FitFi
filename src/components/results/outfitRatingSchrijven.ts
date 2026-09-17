import {
  outfitKey as outfitKeyStandaard,
  saveOutfitRating as saveOutfitRatingStandaard,
  type OutfitRating,
  type SaveOutfitRatingInput,
} from "@/services/ratings/outfitRatings";
import { getSessionId as getSessionIdStandaard } from "@/utils/sessionId";
import trackStandaard from "@/utils/telemetry";
import { bewaarKeuze as bewaarKeuzeStandaard, magSchrijven } from "./outfitRatingGeheugen";

export interface RatingAfhankelijkheden {
  outfitKey: (productIds: string[]) => Promise<string>;
  saveOutfitRating: (
    input: SaveOutfitRatingInput
  ) => Promise<{ ok: true } | { ok: false; reden: string }>;
  bewaarKeuze: (sleutel: string, rating: OutfitRating) => void;
  track: (event: string, props: Record<string, unknown>) => void;
  getSessionId: () => string;
}

/** Echte afhankelijkheden, zoals de component ze vandaag gebruikt. */
export const STANDAARD_AFHANKELIJKHEDEN: RatingAfhankelijkheden = {
  outfitKey: outfitKeyStandaard,
  saveOutfitRating: saveOutfitRatingStandaard,
  bewaarKeuze: bewaarKeuzeStandaard,
  track: trackStandaard,
  getSessionId: getSessionIdStandaard,
};

export interface RatingStand {
  profileHash: string | null;
  sleutel: string | null;
  gekozen: OutfitRating | null;
  bezig: boolean;
}

export interface RatingContext {
  outfitId: string;
  productIds: string[];
  userId?: string | null;
}

export type RatingUitkomst =
  | { status: "overgeslagen" }
  | { status: "geschreven" }
  | { status: "mislukt"; reden: string };

/**
 * De schrijfactie achter OutfitRatingButtons (spec 5.6/6.6), losgetrokken
 * van React zodat hij in node te testen is -- zelfde patroon als
 * outfitRatingGeheugen.ts. Vóór deze fix zat deze logica (optimistische
 * update, outfitKey, de schrijfactie, terugdraaien, de twee
 * track-aanroepen) alleen in de component, en `renderToString` (de enige
 * manier waarop deze component eerder getest werd) vuurt geen klik: geen
 * enkel pad hier werd ooit geraakt door een test.
 *
 * Schrijft niets en raakt geen enkele afhankelijkheid aan als er niet
 * geschreven had mogen worden (geen hash/sleutel, al bezig, of dit is al de
 * gekozen rating): dat maakt "tweede klik op dezelfde knop schrijft niet
 * opnieuw" hier rechtstreeks testbaar, in plaats van alleen af te leiden uit
 * magSchrijven op zichzelf.
 *
 * Optimistisch bijwerken van React-state (setGekozen(rating) vóór de
 * schrijfactie) en het terugdraaien daarvan bij `status: "mislukt"` blijven
 * in de component: dat is UI-toestand, geen schrijflogica. Deze functie
 * geeft de component wel exact genoeg terug (geschreven/mislukt/
 * overgeslagen) om die beslissing te nemen.
 */
export async function voerRatingUit(
  stand: RatingStand,
  rating: OutfitRating,
  ctx: RatingContext,
  deps: RatingAfhankelijkheden = STANDAARD_AFHANKELIJKHEDEN
): Promise<RatingUitkomst> {
  if (!stand.profileHash || !stand.sleutel) return { status: "overgeslagen" };
  if (!magSchrijven(stand, rating)) return { status: "overgeslagen" };

  const key = await deps.outfitKey(ctx.productIds);
  const uitkomst = await deps.saveOutfitRating({
    profileHash: stand.profileHash,
    outfitKey: key,
    rating,
    sessionId: deps.getSessionId(),
    userId: ctx.userId ?? null,
  });

  if (uitkomst.ok) {
    deps.bewaarKeuze(stand.sleutel, rating);
    deps.track("outfit_rating", {
      outfit_id: ctx.outfitId,
      rating,
      item_count: ctx.productIds.length,
    });
    return { status: "geschreven" };
  }

  deps.track("outfit_rating_failed", { outfit_id: ctx.outfitId, rating, reden: uitkomst.reden });
  return { status: "mislukt", reden: uitkomst.reden };
}
