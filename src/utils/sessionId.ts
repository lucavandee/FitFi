/**
 * Eén sessie-id voor de hele app.
 *
 * De app had er twee, met verschillende sleutels EN verschillende opslag:
 *
 *   ff_session_id      localStorage    profiel claimen, foto-upload, Nova
 *   fitfi_session_id   sessionStorage  swipes, calibratie
 *
 * Die matchten nooit. Een anonieme gebruiker schreef zijn swipes weg onder het
 * ene id (style_swipes.session_id) en zijn stijlprofiel onder het andere
 * (style_profiles.session_id), waardoor de twee niet aan elkaar te koppelen
 * waren. De visuele voorkeur die uit de swipes wordt berekend kon dus nooit bij
 * het profiel terechtkomen waar hij bij hoorde.
 *
 * Gekozen: ff_session_id in localStorage.
 *
 * De sleutel omdat de meeste plekken die al gebruiken, waaronder de enige die
 * er echt van afhangt: profileSyncService.ts:155 zoekt bij een volgend bezoek
 * het anonieme profiel op via deze id.
 *
 * localStorage en niet sessionStorage omdat een sessie hier "dit apparaat"
 * betekent en niet "dit tabblad". De hele anonieme flow is: quiz doen,
 * resultaten bekijken, later terugkomen en een account maken om het profiel te
 * claimen. Met sessionStorage gooit het sluiten van de tab de enige verwijzing
 * naar dat profiel weg. Dat OnboardingFlowPage.tsx:428 de id expliciet wist bij
 * een quiz-reset is het bewijs dat hij normaal juist hoort te blijven staan.
 *
 * Het moet een UUID zijn: style_swipes.session_id en swipe_preferences.session_id
 * zijn allebei UUID NOT NULL. Een waarde in een ander formaat, zoals de
 * `${Date.now()}_${random}` die affiliate.ts hier vroeger in zette, laat elke
 * insert stuk lopen op een castfout die alleen in de console belandt.
 */

const KEY = 'ff_session_id';

/** Oude sleutel uit sessionStorage. Alleen om lopende bezoeken over te nemen. */
const OUDE_KEY = 'fitfi_session_id';

const UUID_PATROON =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(waarde: string | null | undefined): boolean {
  return typeof waarde === 'string' && UUID_PATROON.test(waarde);
}

function nieuweUuid(): string {
  // crypto.randomUUID ontbreekt op oudere Safari en op http-origins.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const hex = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function lees(opslag: Storage | undefined, sleutel: string): string | null {
  try {
    return opslag?.getItem(sleutel) ?? null;
  } catch {
    return null; // private mode, geblokkeerde cookies
  }
}

/**
 * Het sessie-id voor dit apparaat. Altijd een geldige UUID.
 *
 * Neemt eenmalig een geldige waarde over uit de oude sessionStorage-sleutel,
 * zodat iemand die midden in de quiz zit zijn swipes niet kwijtraakt.
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return nieuweUuid();

  const bestaand = lees(window.localStorage, KEY);
  if (isUuid(bestaand)) return bestaand as string;

  const overgenomen = lees(window.sessionStorage, OUDE_KEY);
  const id = isUuid(overgenomen) ? (overgenomen as string) : nieuweUuid();

  try {
    window.localStorage.setItem(KEY, id);
  } catch {
    // Niet kunnen opslaan is vervelend maar niet fataal: de aanroeper krijgt
    // een geldige id en de insert slaagt. Alleen een volgend bezoek herkent
    // deze gebruiker dan niet meer.
  }
  return id;
}

/** Wist het sessie-id. Alleen gebruiken bij een bewuste reset van de quiz. */
export function resetSessionId(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
    window.sessionStorage.removeItem(OUDE_KEY);
  } catch {
    /* niets te doen */
  }
}
