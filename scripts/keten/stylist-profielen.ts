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
 * neutrals, zoals src/data/quizSteps.ts ze kent) en die gaan daarna door
 * profielVanQuizAnswers (src/keten/vanQuiz.ts), de functie die ook de
 * stylist-route van een echte bezoeker draait. Daardoor komen alleen de assen
 * in het profiel die uit een echt antwoord komen, met de zekerheid die dat
 * antwoord ook bij een bezoeker krijgt, en geeft dezelfde voorkeur dezelfde
 * cache-sleutel ongeacht waar het profiel vandaan komt.
 *
 * Dat is de reparatie van de meting van 1 oktober 2026 (spec 5.2.1, herziening
 * van 1 oktober): het vulscript bouwde zijn profielen rechtstreeks uit
 * STYLE_ASSEN (src/keten/personas.ts), met zes assen op een zekerheid van 0,5
 * tot 0,9. Formality, lightness en shoe_type geeft geen bezoeker op, dus de
 * gevulde set stond onder een sleutel die niemand kon bereiken. STYLE_ASSEN
 * blijft bestaan, ook voor het harnas (stylist-run.ts) dat bewust rijkere
 * persona's modelleert, maar het vulscript leest er alleen nog de drie
 * waarden uit die een quiz ook oplevert (silhouette, pattern, color_temp).
 *
 * Noot voor wie vanQuiz.ts uitbreidt: de quiz vraagt lightness al (verplicht,
 * stap 4) maar vanQuiz.ts maakt er nog geen as van. Zodra dat wel gebeurt,
 * krijgt elke bezoeker een lightness in zijn sleutel en missen de sleutels
 * van dit bestand die as. De test in __tests__/stylist-profielen.test.ts geeft zijn
 * bezoekers daarom al een lightness-antwoord: hij gaat rood op het moment dat
 * die vertaling erbij komt, en dan hoort quizAntwoordenVanPersona het
 * bijpassende antwoord van de persona mee te geven.
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
 * relaxed, oversized), `prints` (effen, subtiel, statement) en `neutrals`
 * (warm, koel, neutraal). De waarden komen uit STYLE_ASSEN van de eerste
 * stijlvoorkeur van de persona: silhouette wordt fit, pattern wordt prints en
 * color_temp wordt neutrals. De woordenlijst van de quiz bevat voor deze drie
 * assen alle waarden van de tagger (SILHOUETTES, COLOR_TEMPS en PATTERNS in
 * tagging.ts); alleen bij prints komt "gemengd" erbij, waar vanQuiz.ts geen
 * as van maakt.
 *
 * Formality, lightness en shoe_type uit STYLE_ASSEN gaan bewust NIET mee: dat
 * zijn geen antwoorden die een bezoeker geeft.
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
 * heeft dan twee van de drie assen: silhouette en color_temp. Dat is een
 * sleutel die een echte bezoeker vandaag kan produceren, en het bewijst dat
 * de stylist ook met een dunnere invoer zes geldige outfits aflevert.
 *
 * Het vorige "halve set"-profiel (drie assen onbekend, drie met zekerheid
 * 0,25) was geen sleutel die een bezoeker kon raken: de lightness die het
 * meegaf geeft geen bezoeker op, en de zekerheid zit niet meer in de sleutel.
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
