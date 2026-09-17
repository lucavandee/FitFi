import { naarGelegenheden, naarGender } from "./kandidaten";

/**
 * Whitelist van quiz-antwoorden die vandaag aantoonbaar de outfitkeuze
 * bepalen: dezelfde drie velden (gender, occasions, budget) die
 * naarKandidatenParams (kandidaten.ts) gebruikt om de RPC-kandidatenpool op
 * te bouwen. Alles buiten deze drie in LS_KEYS.QUIZ_ANSWERS -- inclusief
 * photoDataUrl, dat tot 5 MB base64 kan zijn (ProfilePage.tsx) -- verandert
 * geen enkele RPC-kandidaat en hoort dus ook geen andere profile_hash of
 * seed te geven. Vóór deze fix hashten hashProfile (outfitRatings.ts) en
 * seedFromAnswers (answersSeed.ts) de hele antwoordenset, dus het toevoegen
 * of verwijderen van een foto gaf een andere hash, andere outfits en zette
 * eerder "Zou ik dragen"/"Nooit"-keuzes terug op onbeslist.
 *
 * Spec 5.2.1 (docs/superpowers/specs/2026-09-14-keten-herbouw-design.md)
 * noemt voor de taste_profiles-hash ook gesorteerde nogo-ids en een
 * gesorteerde lijst van (pair_id, chosen_set_id). Die twee ontbreken hier
 * bewust: ze horen bij de pair-gebaseerde onboarding v2 achter de vlag
 * keten_v2 (spec 6), die dit plan niet bouwt -- LS_KEYS.QUIZ_ANSWERS heeft
 * vandaag geen nogo- of choices-veld om te hashen. Zodra onboarding v2 die
 * velden vult, horen ze in deze whitelist te komen.
 *
 * stylePreferences (de huidige quiz-stijlkeuze) beïnvloedt engine v2 wél
 * (buildProfile.ts, quizStylesToArchetypes) maar bepaalt geen RPC-kandidaat:
 * de kandidatenpool zelf is voor iedereen met dezelfde gender/occasions/
 * budget identiek, alleen de compositie daarbinnen verschilt. Deze whitelist
 * gaat over identiteit voor de meting (profile_hash) en reproduceerbaarheid
 * van de tiebreak (seed), niet over volledige stylistische equivalentie;
 * zie de docblocks in outfitRatings.ts en answersSeed.ts voor waarom de
 * twee gebruikers hiervan (hash vs seed) niet identiek hoeven te
 * normaliseren.
 */
export interface OutfitBepalendeVelden {
  gender: string;
  occasions: string[];
  budget: { min: number; max: number } | null;
}

/**
 * Bewust GEEN hergebruik van naarBudget (kandidaten.ts): die rondt af en
 * dwingt altijd een geldig getal af (inclusief een default van 150) zodat de
 * RPC nooit op een kapot budget struikelt. Voor profile_hash en de seed is
 * dat verkeerd: een NaN uit een mislukte parse moet zichtbaar blijven (een
 * throw via stableStringify, zie utils/stableJson.ts), niet stilletjes in
 * dezelfde default verdwijnen als een profiel dat écht geen budget koos --
 * anders krijgen die twee dezelfde hash.
 */
function naarBudgetVoorIdentiteit(answers: Record<string, any>): { min: number; max: number } | null {
  const b = answers.budget;
  if (b && typeof b === "object" && "max" in b) {
    return { min: b.min ?? 0, max: b.max };
  }
  if (typeof answers.budgetRange === "number") {
    return { min: 0, max: answers.budgetRange };
  }
  return null;
}

/** De drie outfitbepalende velden uit de quiz-antwoorden, ongesorteerd. */
export function naarOutfitBepalendeVelden(answers: Record<string, any>): OutfitBepalendeVelden {
  const a = answers ?? {};
  return {
    gender: naarGender(a.gender),
    occasions: naarGelegenheden(a.occasions),
    budget: naarBudgetVoorIdentiteit(a),
  };
}
