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
 * de eigenlijke voorkeuren veranderde.
 *
 * occasions komt via naarOutfitBepalendeVelden gesorteerd binnen, ook hier.
 * Eerder liet deze functie de klikvolgorde staan, met als motivering dat die
 * volgorde een rangschikking zou zijn ("eerste keuze" versus "tweede keuze").
 * Dat klopte niet: handleMultiSelect (OnboardingFlowPage.tsx) doet
 * `[...current, value]` bij aanklikken en filtert eruit bij opnieuw klikken,
 * de gelegenheden worden gerenderd als een rooster van gelijkwaardige
 * knoppen (geen geordende lijst), en quiz/logic.ts telt gelegenheden in een
 * `for`-lus die elke gelegenheid een vaste score geeft, ongeacht positie. De
 * klikvolgorde droeg dus geen betekenis, maar zorgde er wel voor dat twee
 * bezoekers met dezelfde smaak in een andere klikvolgorde dezelfde
 * profile_hash kregen (hashProfile sorteerde al) maar een andere seed, en zo
 * als één profiel telden in outfit_ratings terwijl ze verschillende
 * outfitsets beoordeelden. Spec 5.2.1
 * (docs/superpowers/specs/2026-09-14-keten-herbouw-design.md) is expliciet:
 * "gesorteerde occasions (...) Twee mensen met dezelfde keuzes krijgen
 * dezelfde outfits; dat is gewenst." Seed en hash normaliseren nu identiek,
 * via dezelfde functie.
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
