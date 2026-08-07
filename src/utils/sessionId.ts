/**
 * Eén sessie-id voor de hele app, en het moet een UUID zijn.
 *
 * Aanleiding (2026-08-07). Twee plekken schreven naar dezelfde sleutel
 * `fitfi_session_id` in sessionStorage, met een ander formaat:
 *
 *   - src/components/quiz/VisualPreferenceStepClean.tsx zette er een
 *     crypto.randomUUID() in;
 *   - src/utils/affiliate.ts zette er `${Date.now()}_${random}` in, dus
 *     bijvoorbeeld "1754521234567_x8k2m9qp1".
 *
 * Wie het eerst schreef, won. De kolom swipe_preferences.session_id is
 * `UUID NOT NULL`, en style_swipes.session_id ook. Had een gebruiker dus
 * ergens een affiliate-link aangeraakt voordat hij bij de swipes of de
 * calibratie kwam, dan stond er een niet-UUID in de sleutel en faalde daarna
 * elke insert en elke RPC op een castfout. Die fouten werden alleen
 * ge-console.error'd, dus de gebruiker merkte niets en de data verdween.
 *
 * Deze module is de enige plek die de sleutel mag zetten. Een waarde die er
 * al staat maar geen UUID is, wordt vervangen: liever een nieuwe sessie dan
 * een sessie die niets kan opslaan.
 */

const KEY = 'fitfi_session_id';

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

/** Het sessie-id voor deze tab. Altijd een geldige UUID. */
export function getSessionId(): string {
  try {
    const bestaand = sessionStorage.getItem(KEY);
    if (isUuid(bestaand)) return bestaand as string;

    const nieuw = nieuweUuid();
    sessionStorage.setItem(KEY, nieuw);
    return nieuw;
  } catch {
    // sessionStorage kan gooien in private mode of met geblokkeerde cookies.
    return nieuweUuid();
  }
}
