import { supabase } from "@/lib/supabaseClient";
import { sha256Hex } from "@/utils/hash";
import { stableStringify } from "@/utils/stableJson";

export type OutfitRating = "zou_dragen" | "nooit";

/**
 * profile_hash voor outfit_ratings: sha256 van de quiz-antwoorden zoals ze in
 * localStorage staan (LS_KEYS.QUIZ_ANSWERS), met gesorteerde sleutels. In
 * plan 4 wordt dit de hash van taste_profiles (spec 5.2.1); tot die tijd is
 * dit de enige stabiele identiteit van een profiel.
 */
export async function hashProfile(answers: Record<string, any>): Promise<string> {
  return sha256Hex(stableStringify(answers ?? {}));
}

/** outfit_key: sha256 van de gesorteerde, ontdubbelde product-ids (spec 5.6). */
export async function outfitKey(productIds: string[]): Promise<string> {
  const ids = Array.from(new Set(productIds.map(String))).sort();
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
 * Schrijft een beoordeling. Geeft de fout terug in plaats van te gooien: een
 * mislukte meting mag de resultatenpagina nooit breken. De aanroeper (taak 9/10)
 * logt of toont dit, deze functie beslist niet hoe dat zichtbaar wordt.
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
    if (error) return { ok: false, reden: error.message || "insert mislukt" };
    return { ok: true };
  } catch (e) {
    return { ok: false, reden: e instanceof Error ? e.message : "onbekende fout" };
  }
}
