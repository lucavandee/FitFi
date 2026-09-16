import { fnv1a32 } from "@/utils/hash";
import { stableStringify } from "@/utils/stableJson";

/**
 * Vaste seed voor engine v2 uit de quiz-antwoorden. Zonder seed nam de engine
 * een tijdvenster van vijf minuten, waardoor dezelfde antwoorden om de vijf
 * minuten andere outfits gaven (spec 2). Met deze seed geven dezelfde
 * antwoorden dezelfde outfits, ook na een herlaad.
 *
 * Gooit door wat `stableStringify` gooit als `answers` een `NaN`, `Infinity`
 * of een circulaire verwijzing bevat (bijvoorbeeld een budgetgrens die door
 * een mislukte parse `NaN` is geworden). Dat is bewust: zonder die fout zou
 * zo'n kapot antwoord stil dezelfde seed geven als een antwoord met een
 * echte `null`-waarde, en dus straks dezelfde cache-sleutel. Een crash is
 * zichtbaar, een verkeerde hash niet. De aanroeper (de quizflow, taak 7) moet
 * dit opvangen of de antwoorden vooraf valideren voor hij ze hier inlegt: in
 * tegenstelling tot de oude tijdvenster-fallback, die nooit crashte, kan deze
 * functie dat nu wel.
 */
export function seedFromAnswers(answers: Record<string, any>): number {
  return fnv1a32(stableStringify(answers ?? {}));
}
