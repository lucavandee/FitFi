import { fnv1a32 } from "@/utils/hash";
import { stableStringify } from "@/utils/stableJson";

/**
 * Vaste seed voor engine v2 uit de quiz-antwoorden. Zonder seed nam de engine
 * een tijdvenster van vijf minuten, waardoor dezelfde antwoorden om de vijf
 * minuten andere outfits gaven (spec 2). Met deze seed geven dezelfde
 * antwoorden dezelfde outfits, ook na een herlaad.
 */
export function seedFromAnswers(answers: Record<string, any>): number {
  return fnv1a32(stableStringify(answers ?? {}));
}
