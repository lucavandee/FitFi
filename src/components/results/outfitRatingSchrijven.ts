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

  // outfitKey gooit op een lege productIds-lijst (zie outfitRatings.ts); dat
  // gooien blijft zo. Vandaag onbereikbaar (de engine levert altijd complete
  // outfits), maar zonder deze try/catch zou de throw hier naar buiten
  // ontsnappen: de optimistische setGekozen in OutfitRatingButtons staat dan
  // al, de promise wordt afgewezen zonder afhandeling, en de bezoeker ziet
  // een keuze die niet is weggeschreven. Vang daarom hier, net als een
  // geweigerde schrijfactie, met de echte foutmelding in `reden`.
  let key: string;
  let uitkomst: Awaited<ReturnType<RatingAfhankelijkheden["saveOutfitRating"]>>;
  try {
    key = await deps.outfitKey(ctx.productIds);
    uitkomst = await deps.saveOutfitRating({
      profileHash: stand.profileHash,
      outfitKey: key,
      rating,
      sessionId: deps.getSessionId(),
      userId: ctx.userId ?? null,
    });
  } catch (e) {
    const reden = e instanceof Error ? e.message : String(e);
    deps.track("outfit_rating_failed", { outfit_id: ctx.outfitId, rating, reden });
    return { status: "mislukt", reden };
  }

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
