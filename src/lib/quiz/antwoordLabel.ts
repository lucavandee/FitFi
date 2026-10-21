import { getStyleOptionsForGender, quizSteps } from "@/data/quizSteps";

/**
 * Het label van een opgeslagen antwoord, zoals de bezoeker het in de quiz
 * zag. Het overzicht voor het versturen toonde tot 21 oktober 2026 de ruwe
 * waarden ("female", "minimalist, classic", "laag", "work"). De stijlopties
 * verschillen per geslacht; een onbekende waarde blijft staan zoals hij is.
 */
export function labelVanAntwoord(veld: string, waarde: string, gender?: string): string {
  const opties =
    veld === "stylePreferences"
      ? getStyleOptionsForGender(gender)
      : quizSteps.find((s) => s.field === veld)?.options ?? [];
  return opties.find((o) => o.value === waarde)?.label ?? waarde;
}
