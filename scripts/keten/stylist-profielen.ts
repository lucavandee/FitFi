/**
 * Standaardprofielen van het stylist-vulscript (scripts/keten/stylist-vul-cache.ts).
 *
 * Staat in een eigen bestand omdat het vulscript bij het importeren meteen
 * main() draait, dus een test kan het niet laden. Een entry-check in het
 * vulscript zelf (zoals stylist-run.ts hem heeft) is geen oplossing: `npm run
 * keten:stylist-vul` draait zonder --script, en dan zet vite-node het
 * bestandspad niet in process.argv, waardoor het script stil niets zou doen.
 *
 * Eén regel: elk standaardprofiel gaat door dezelfde vertaling als een
 * bezoeker uit de quiz. Een persona wordt eerst quiz-antwoorden (fit, prints,
 * neutrals en lightness, zoals src/data/quizSteps.ts ze kent) en die gaan
 * daarna door profielVanQuizAnswers (src/keten/vanQuiz.ts), de functie die
 * ook de stylist-route van een echte bezoeker draait. Daardoor komen alleen
 * de assen in het profiel die uit een echt antwoord komen, met de zekerheid
 * die dat antwoord ook bij een bezoeker krijgt, en geeft dezelfde voorkeur
 * dezelfde cache-sleutel ongeacht waar het profiel vandaan komt.
 *
 * Dat is de reparatie van de meting van 1 oktober 2026 (spec 5.2.1, herziening
 * van 1 oktober): het vulscript bouwde zijn profielen rechtstreeks uit
 * STYLE_ASSEN (src/keten/personas.ts), met zes assen op een zekerheid van 0,5
 * tot 0,9. Formality en shoe_type geeft geen bezoeker op, dus de gevulde set
 * stond onder een sleutel die niemand kon bereiken. STYLE_ASSEN blijft
 * bestaan, ook voor het harnas (stylist-run.ts) dat bewust rijkere persona's
 * modelleert, maar het vulscript leest er alleen nog de vier waarden uit die
 * een quiz ook oplevert (silhouette, pattern, color_temp en lightness).
 *
 * Lightness stond in die eerste reparatie nog bij de assen die geen bezoeker
 * opgeeft. Dat klopte niet: de quiz vraagt hem wel (verplicht, stap 4), alleen
 * vertaalde vanQuiz.ts het antwoord niet en gooide het weg. Sinds de tweede
 * fix van 1 oktober 2026 maakt vanQuiz.ts er een as van, en geeft
 * quizAntwoordenVanPersona de lichtheid van de persona mee.
 *
 * Noot voor wie vanQuiz.ts nog verder uitbreidt: elke as die de quiz vertaalt,
 * krijgt elke bezoeker in zijn sleutel, en mist het vulscript hem tot deze
 * module hem meegeeft. De test in __tests__/stylist-profielen.test.ts geeft
 * zijn bezoekers een antwoord per vertaalde quizvraag en gaat rood op het
 * moment dat een vertaling erbij komt die hier ontbreekt. Voeg de vraag dan
 * eerst aan de bezoekers in die test toe.
 */
import { KETEN_PERSONAS, STYLE_ASSEN, type KetenPersona } from "../../src/keten/personas";
import type { TasteProfileInput } from "../../src/keten/types";
import { profielVanQuizAnswers } from "../../src/keten/vanQuiz";

export interface NaamProfiel {
  naam: string;
  profiel: TasteProfileInput;
}

export function slug(naam: string): string {
  return naam
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * De quiz-antwoorden van een bezoeker die precies deze persona is. Dezelfde
 * velden en dezelfde waardenlijsten als de quiz: `fit` (slim, regular,
 * relaxed, oversized), `prints` (effen, subtiel, statement), `neutrals`
 * (warm, koel, neutraal) en `lightness` (licht, medium, donker). De waarden
 * komen uit STYLE_ASSEN van de eerste stijlvoorkeur van de persona:
 * silhouette wordt fit, pattern wordt prints, color_temp wordt neutrals en
 * lightness blijft lightness. De woordenlijst van de quiz bevat voor deze vier
 * assen alle waarden van de tagger (SILHOUETTES, COLOR_TEMPS, LIGHTNESS en
 * PATTERNS in tagging.ts); alleen bij prints komt "gemengd" erbij, waar
 * vanQuiz.ts geen as van maakt.
 *
 * Formality en shoe_type uit STYLE_ASSEN gaan bewust NIET mee: de quiz vraagt
 * ze niet, dus geen bezoeker geeft ze op.
 */
export function quizAntwoordenVanPersona(persona: KetenPersona): Record<string, unknown> {
  const stijl = persona.stylePreferences[0];
  const assen = STYLE_ASSEN[stijl];
  if (!assen) {
    throw new Error(`Geen vaste assen gedefinieerd voor stijl "${stijl}" (persona "${persona.naam}").`);
  }
  return {
    gender: persona.gender,
    occasions: persona.occasions,
    budget: { min: persona.budget_min, max: persona.budget_max },
    fit: assen.silhouette?.value,
    prints: assen.pattern?.value,
    neutrals: assen.color_temp?.value,
    lightness: assen.lightness?.value,
  };
}

function profielUitAntwoorden(
  persona: KetenPersona,
  antwoorden: Record<string, unknown>,
  sessionId: string
): TasteProfileInput {
  const profiel = profielVanQuizAnswers(antwoorden, sessionId);
  if (!profiel) {
    throw new Error(`profielVanQuizAnswers gaf geen profiel voor persona "${persona.naam}".`);
  }
  return profiel;
}

export function profielVanPersona(persona: KetenPersona): TasteProfileInput {
  return profielUitAntwoorden(
    persona,
    quizAntwoordenVanPersona(persona),
    `stylist-vulcache-${slug(persona.naam)}`
  );
}

/**
 * Vijfde profiel (keuze 3, plan-3-stylist.md): dezelfde gender, gelegenheden
 * en budget als de basispersona, maar een bezoeker die de printsvraag niet
 * beantwoordt. Dat is de enige quizvraag over een as die niet verplicht is
 * (`prints` heeft `required: false` in src/data/quizSteps.ts), en wie
 * "Mix van alles" kiest geeft vanQuiz.ts ook geen pattern-as. De sleutel
 * heeft dan drie van de vier assen: silhouette, color_temp en lightness. Dat
 * is een sleutel die een echte bezoeker vandaag kan produceren, en het
 * bewijst dat de stylist ook met een dunnere invoer zes geldige outfits
 * aflevert.
 *
 * Het vorige "halve set"-profiel (drie assen onbekend, drie met zekerheid
 * 0,25) was geen sleutel die een bezoeker kon raken: het had geen silhouette,
 * terwijl de quiz de pasvorm verplicht vraagt (`required: true` in
 * src/data/quizSteps.ts), en de zekerheid zit niet meer in de sleutel.
 */
export function onzekerProfiel(basisPersona: KetenPersona): TasteProfileInput {
  return profielUitAntwoorden(
    basisPersona,
    { ...quizAntwoordenVanPersona(basisPersona), prints: undefined },
    `stylist-vulcache-${slug(basisPersona.naam)}-halve-set`
  );
}

export function standaardProfielen(): NaamProfiel[] {
  const vast = KETEN_PERSONAS.map((p) => ({ naam: p.naam, profiel: profielVanPersona(p) }));
  const minimalistisch = KETEN_PERSONAS.find((p) => p.naam === "vrouw minimalistisch");
  if (!minimalistisch) {
    throw new Error('KETEN_PERSONAS mist "vrouw minimalistisch", nodig voor het vijfde (halve-set) profiel.');
  }
  const vijfde: NaamProfiel = {
    naam: "vrouw minimalistisch (halve set)",
    profiel: onzekerProfiel(minimalistisch),
  };
  return [...vast, vijfde];
}
