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
