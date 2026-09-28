/**
 * Canonieke persona-data voor de feed-poort (spec 5.7).
 *
 * Een bron voor de vier vaste persona's, gebruikt door twee harnassen:
 * plan 1 (scripts/keten/persona-run.ts, get_kandidaten -> runEngineV2) en
 * plan 3 (scripts/keten/stylist-run.ts, get_kandidaten -> compose-outfits).
 * Bevat alleen de rauwe feiten uit de spec (naam, gender, gelegenheden,
 * budget, stijlvoorkeuren); elke afnemer leidt zelf zijn eigen vorm af
 * (quiz-antwoorden respectievelijk assen met zekerheid), zodat een wijziging
 * aan een persona op een plek gebeurt.
 */
import type { Assen } from "./types";

export interface KetenPersona {
  naam: string;
  gender: "male" | "female";
  occasions: string[];
  budget_min: number;
  budget_max: number;
  stylePreferences: string[];
}

export const KETEN_PERSONAS: KetenPersona[] = [
  { naam: "man klassiek", gender: "male", occasions: ["work"], budget_min: 50, budget_max: 150, stylePreferences: ["classic"] },
  { naam: "vrouw minimalistisch", gender: "female", occasions: ["work", "date"], budget_min: 25, budget_max: 100, stylePreferences: ["minimalist"] },
  { naam: "man streetwear", gender: "male", occasions: ["casual", "party"], budget_min: 25, budget_max: 100, stylePreferences: ["streetwear"] },
  { naam: "vrouw romantisch", gender: "female", occasions: ["date", "travel"], budget_min: 25, budget_max: 75, stylePreferences: ["romantic"] },
];

/**
 * Vaste assen per stijlvoorkeur (plan 3, taak 6b/8). DE ENIGE PLEK waar deze
 * tabel staat: scripts/keten/stylist-vul-cache.ts (vult de cache) en
 * scripts/keten/stylist-run.ts (het harnas dat diezelfde cache uitleest)
 * importeren hem allebei vandaan. profileHash (src/keten/profileHash.ts)
 * hasht per as de naam, de waarde en de afgeronde confidence; liepen de twee
 * scripts uit elkaar (wat hier eerder is gebeurd: silhouette "regular" tegen
 * "slim" voor "minimalist"), dan vult het vulscript een set onder sleutel A
 * terwijl het harnas onder sleutel B leest. Geen foutmelding, geen lege
 * uitvoer, alleen een cache die nooit raakt, terwijl elke vulronde wel
 * `claude -p`-capaciteit kost.
 *
 * Waarden uit de echte taggerwoordenlijst (scripts/keten/tagging.ts:
 * SILHOUETTES, COLOR_TEMPS, LIGHTNESS, PATTERNS, SHOE_TYPES) zodat
 * get_kandidaten er ook daadwerkelijk op kan scoren. Met de hand gekozen,
 * geen meting: vandaar hier expliciet genoemd in plaats van stilzwijgend
 * aangenomen. De echte keuze-afleiding (pair_sets) komt in plan 4; tot dan
 * dragen de vier KETEN_PERSONAS hun axes direct (keuze 3, plan-3-stylist.md).
 */
export const STYLE_ASSEN: Record<string, Partial<Assen>> = {
  classic: {
    formality: { value: 4, confidence: 0.8 },
    silhouette: { value: "regular", confidence: 0.8 },
    color_temp: { value: "koel", confidence: 0.6 },
    lightness: { value: "donker", confidence: 0.6 },
    pattern: { value: "effen", confidence: 0.8 },
    shoe_type: { value: "net", confidence: 0.8 },
  },
  minimalist: {
    formality: { value: 3, confidence: 0.7 },
    silhouette: { value: "slim", confidence: 0.7 },
    color_temp: { value: "neutraal", confidence: 0.7 },
    lightness: { value: "medium", confidence: 0.6 },
    pattern: { value: "effen", confidence: 0.9 },
    shoe_type: { value: "net", confidence: 0.6 },
  },
  streetwear: {
    formality: { value: 2, confidence: 0.8 },
    silhouette: { value: "oversized", confidence: 0.8 },
    color_temp: { value: "koel", confidence: 0.5 },
    lightness: { value: "donker", confidence: 0.5 },
    pattern: { value: "statement", confidence: 0.7 },
    shoe_type: { value: "sneaker", confidence: 0.9 },
  },
  romantic: {
    formality: { value: 3, confidence: 0.6 },
    silhouette: { value: "relaxed", confidence: 0.6 },
    color_temp: { value: "warm", confidence: 0.7 },
    lightness: { value: "licht", confidence: 0.6 },
    pattern: { value: "subtiel", confidence: 0.6 },
    shoe_type: { value: "sandaal", confidence: 0.6 },
  },
};
