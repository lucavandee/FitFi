import React from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { outfitKey, saveOutfitRating, type OutfitRating } from "@/services/ratings/outfitRatings";
import { getSessionId } from "@/utils/sessionId";
import track from "@/utils/telemetry";
import { abonneer, bewaarKeuze, leesKeuze, magSchrijven, onthoudSleutel } from "./outfitRatingGeheugen";

export interface OutfitRatingButtonsProps {
  outfitId: string;
  productIds: string[];
  /** sha256 van de quiz-antwoorden; null zolang die nog niet berekend is. */
  profileHash: string | null;
  userId?: string | null;
}

// Bewust geen verticale padding-utility hier (die telt het design-check-
// script als overtreding); de hoogte komt uit min-h-[48px] met verticale
// centrering via items-center.
const BASIS =
  "flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-4 text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
const RUST = "border-[#E5E5E5] text-[#1A1A1A] hover:border-[#A85740]";
const GEKOZEN = "border-[#A85740] bg-[#F4E8E3] text-[#A85740]";

/**
 * Het stuurcijfer uit de spec (5.6, 6.6): per outfit "Zou ik dragen" of
 * "Nooit". Schrijft naar outfit_ratings; onthoudt de keuze per profiel en
 * outfit in localStorage zodat een herlaad geen tweede rij geeft.
 *
 * De beginstand komt uit de useState-initializer (niet uit een effect),
 * zodat hij ook bij renderToString en direct bij de eerste render klopt.
 * Verandert profileHash, geef dan een key mee zodat de component opnieuw
 * mount (zie EnhancedResultsPage).
 */
export function OutfitRatingButtons({ outfitId, productIds, profileHash, userId }: OutfitRatingButtonsProps) {
  const sleutel = onthoudSleutel(profileHash, outfitId);
  const [gekozen, setGekozen] = React.useState<OutfitRating | null>(() => (sleutel ? leesKeuze(sleutel) : null));
  const [bezig, setBezig] = React.useState(false);

  React.useEffect(() => {
    if (!sleutel) return;
    return abonneer(sleutel, (rating) => setGekozen(rating));
  }, [sleutel]);

  const kies = async (rating: OutfitRating) => {
    if (!profileHash || !sleutel) return;
    if (!magSchrijven({ profileHash, gekozen, bezig }, rating)) return;
    setBezig(true);
    const vorige = gekozen;
    setGekozen(rating);
    try {
      const key = await outfitKey(productIds);
      const uitkomst = await saveOutfitRating({
        profileHash,
        outfitKey: key,
        rating,
        sessionId: getSessionId(),
        userId: userId ?? null,
      });
      if (uitkomst.ok) {
        bewaarKeuze(sleutel, rating);
        track("outfit_rating", { outfit_id: outfitId, rating, item_count: productIds.length });
      } else {
        setGekozen(vorige);
        track("outfit_rating_failed", { outfit_id: outfitId, rating, reden: uitkomst.reden });
      }
    } finally {
      setBezig(false);
    }
  };

  const uitgeschakeld = !profileHash || bezig;

  return (
    <div
      className="mt-4 flex gap-2"
      onClick={(e) => e.stopPropagation()}
      role="group"
      aria-label="Zou je deze outfit dragen?"
    >
      <button
        type="button"
        disabled={uitgeschakeld}
        aria-pressed={gekozen === "zou_dragen"}
        onClick={() => kies("zou_dragen")}
        className={`${BASIS} ${gekozen === "zou_dragen" ? GEKOZEN : RUST}`}
      >
        <ThumbsUp className="w-5 h-5" aria-hidden="true" />
        Zou ik dragen
      </button>
      <button
        type="button"
        disabled={uitgeschakeld}
        aria-pressed={gekozen === "nooit"}
        onClick={() => kies("nooit")}
        className={`${BASIS} ${gekozen === "nooit" ? GEKOZEN : RUST}`}
      >
        <ThumbsDown className="w-5 h-5" aria-hidden="true" />
        Nooit
      </button>
    </div>
  );
}
