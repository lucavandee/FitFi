import { fnv1a32 } from "@/utils/hash";
import { stableStringify } from "@/utils/stableJson";
import { naarOutfitBepalendeVelden } from "./profielIdentiteit";

/**
 * Vaste seed voor engine v2 uit de quiz-antwoorden. Zonder seed nam de engine
 * een tijdvenster van vijf minuten, waardoor dezelfde antwoorden om de vijf
 * minuten andere outfits gaven (spec 2). Met deze seed geven dezelfde
 * antwoorden dezelfde outfits, ook na een herlaad.
 *
 * Gehasht wordt niet meer de hele antwoordenset, maar alleen de whitelist uit
 * profielIdentiteit.ts (gender, occasions, budget): dezelfde velden die
 * hashProfile (outfitRatings.ts) gebruikt voor profile_hash. Zonder die
 * whitelist gaf photoDataUrl (tot 5 MB base64, ProfilePage.tsx) toevoegen of
 * verwijderen een andere seed en dus andere outfits, zonder dat er iets aan
 * de eigenlijke voorkeuren veranderde. In tegenstelling tot hashProfile
 * worden occasions hier NIET gesorteerd: engine v2 krijgt de volledige
 * quizAnswers los van deze seed (die bepaalt alleen de tie-break-volgorde
 * binnen de engine, niet de content-scoring), en de bestaande tests
 * verwachten bewust dat de gekozen volgorde ("eerste keuze" versus "tweede
 * keuze") een andere seed geeft. Seed en hash hoeven niet dezelfde functie te
 * zijn (ze dienen een ander doel: reproduceerbare tie-break versus
 * profiel-identiteit voor de meting), zolang ze dezelfde stabiliteitsgarantie
 * hebben: ongevoelig voor velden die de outfitkeuze niet bepalen, gevoelig
 * voor velden die dat wel doen.
 *
 * Gooit door wat `stableStringify` gooit als een van de whitelist-velden een
 * `NaN`, `Infinity` of een circulaire verwijzing bevat (bijvoorbeeld een
 * budgetgrens die door een mislukte parse `NaN` is geworden). Dat is bewust:
 * zonder die fout zou zo'n kapot antwoord stil dezelfde seed geven als een
 * antwoord met een echte `null`-waarde, en dus straks dezelfde cache-sleutel.
 * Een crash is zichtbaar, een verkeerde hash niet. De aanroeper (de
 * quizflow, taak 7) moet dit opvangen of de antwoorden vooraf valideren voor
 * hij ze hier inlegt: in tegenstelling tot de oude tijdvenster-fallback, die
 * nooit crashte, kan deze functie dat nu wel. Een circulaire verwijzing
 * buiten de whitelist (bijvoorbeeld in photoDataUrl of een ander genegeerd
 * veld) crasht expres niet meer: die data wordt nooit gelezen.
 */
export function seedFromAnswers(answers: Record<string, any>): number {
  return fnv1a32(stableStringify(naarOutfitBepalendeVelden(answers)));
}
