import { supabase } from "@/lib/supabaseClient";
import { sha256Hex } from "@/utils/hash";
import { stableStringify } from "@/utils/stableJson";
import { naarOutfitBepalendeVelden } from "@/services/outfits/profielIdentiteit";

export type OutfitRating = "zou_dragen" | "nooit";

/**
 * profile_hash voor outfit_ratings: sha256 van de whitelist uit spec 5.2.1
 * (profielIdentiteit.ts) -- gender, gesorteerde occasions en budget -- niet
 * meer van de hele antwoordenset. Vóór deze fix hashte dit de complete
 * LS_KEYS.QUIZ_ANSWERS, inclusief photoDataUrl (tot 5 MB base64,
 * ProfilePage.tsx): een foto toevoegen of verwijderen gaf dan een andere
 * hash, andere outfits, en zette bestaande "Zou ik dragen"/"Nooit"-keuzes
 * terug op onbeslist (ze staan in localStorage onder de oude hash, zie
 * outfitRatingGeheugen.ts). Occasions worden hier gesorteerd (spec 5.2.1:
 * "gesorteerde occasions"), in tegenstelling tot answersSeed.ts, dat de
 * gekozen volgorde bewust laat staan -- zie de docblock daar voor waarom
 * die twee hier mogen verschillen.
 */
export async function hashProfile(answers: Record<string, any>): Promise<string> {
  const velden = naarOutfitBepalendeVelden(answers);
  return sha256Hex(
    stableStringify({ ...velden, occasions: [...velden.occasions].sort() })
  );
}

/**
 * outfit_key: sha256 van de gesorteerde, ontdubbelde product-ids (spec 5.6).
 * Gooit op een lege lijst in plaats van sha256("") terug te geven: een
 * outfit zonder producten heeft geen geldige identiteit, en zonder deze
 * guard zou elke lege outfit op dezelfde sleutel uitkomen (vandaag
 * onbereikbaar vanuit de UI, maar de guard kost niets).
 */
export async function outfitKey(productIds: string[]): Promise<string> {
  const ids = Array.from(new Set(productIds.map(String))).sort();
  if (ids.length === 0) {
    throw new Error("outfitKey: geen product-ids, een outfit zonder producten heeft geen geldige sleutel");
  }
  return sha256Hex(ids.join(","));
}

export interface SaveOutfitRatingInput {
  profileHash: string;
  outfitKey: string;
  rating: OutfitRating;
  sessionId: string;
  userId?: string | null;
}

/**
 * Op deze tabel heeft de insert-policy precies één voorwaarde die een
 * anonieme of ingelogde bezoeker zelf kan raken: `session_id is not null`
 * (de andere helft, `user_id = auth.uid()`, raakt alleen iemand die een
 * user_id van een ander probeert mee te sturen). Een ontbrekende of lege
 * session_id geeft daarom een RLS-weigering (Postgres-foutcode 42501), niet
 * de not-null-constraint op de kolom: de policy wint. Supabase geeft die
 * weigering terug als HTTP 401 met een kale melding die het woord
 * "session_id" niet noemt en op zichzelf leest als een auth-probleem. Zonder
 * uitleg zou wie op `reden` afgaat dus in inlog- of rechtenlogica gaan
 * zoeken terwijl de oorzaak een ontbrekende session_id is.
 */
const RLS_GEWEIGERD = "42501";

/**
 * Schrijft een beoordeling. Geeft de fout terug in plaats van te gooien: een
 * mislukte meting mag de resultatenpagina nooit breken. Wél wordt elke
 * mislukking gelogd met console.error: de vorige tabel (results_feedback)
 * kreeg in maanden twee rijen zonder dat iemand het merkte, en dat mag deze
 * meting niet nog eens overkomen. De log bevat de foutcode en de afgeleide
 * oorzaak, nooit de ruwe input (session_id, profile_hash, outfit_key,
 * user_id) van de bezoeker.
 */
export async function saveOutfitRating(
  input: SaveOutfitRatingInput
): Promise<{ ok: true } | { ok: false; reden: string }> {
  const client = supabase();
  if (!client) return { ok: false, reden: "geen Supabase-client" };

  try {
    const { error } = await client.from("outfit_ratings").insert({
      profile_hash: input.profileHash,
      outfit_key: input.outfitKey,
      rating: input.rating,
      session_id: input.sessionId,
      user_id: input.userId ?? null,
    });
    if (error) {
      const reden =
        error.code === RLS_GEWEIGERD
          ? `insert geweigerd door outfit_ratings: session_id ontbreekt waarschijnlijk (rls ${RLS_GEWEIGERD}: ${error.message})`
          : error.message || "insert mislukt";
      console.error("[outfitRatings] saveOutfitRating mislukt:", {
        code: error.code ?? "onbekend",
        reden,
      });
      return { ok: false, reden };
    }
    return { ok: true };
  } catch (e) {
    const reden = e instanceof Error ? e.message : "onbekende fout";
    console.error("[outfitRatings] saveOutfitRating mislukt (netwerkfout):", { reden });
    return { ok: false, reden };
  }
}
