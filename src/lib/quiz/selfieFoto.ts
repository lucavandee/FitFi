/**
 * De selfie uit quizstap 14: waar hij staat, wat er naar de database mag en
 * hoe de quiz de analyse aanvraagt. Wat een analyse met het kleurprofiel doet,
 * staat in logic.ts (pasFotoAnalyseToe).
 *
 * De quiz uploadt de foto anoniem naar de privé bucket user-photos, in
 * anon_<sessie-id>/. Er is geen publieke link. De functie analyze-selfie-color
 * maakt zelf een link die 60 seconden werkt en geeft die aan OpenAI. In de
 * antwoorden, in localStorage en in style_profiles.photo_url staat alleen het
 * opslagpad, nooit de foto zelf als data-URL.
 */
import type { AnswerMap } from './types';

export type SelfieAnalyse = NonNullable<AnswerMap['colorAnalysis']>;

export const SELFIE_BUCKET = 'user-photos';
export const SELFIE_MAX_BYTES = 5 * 1024 * 1024;

/** Het opslagpad van de laatste upload. Was een publieke URL die niet werkte. */
export const SELFIE_PAD_SLEUTEL = 'ff_onboarding_photo_url';
/**
 * Oude sleutel voor de analyse. De quiz las hem bij het afronden, ook als hij
 * bij een eerdere foto hoorde. De analyse staat nu alleen in de antwoorden
 * (colorAnalysis); deze sleutel wordt alleen nog opgeruimd.
 */
export const SELFIE_ANALYSE_SLEUTEL = 'ff_onboarding_photo_analysis';

// Dezelfde drie typen die de bucket toelaat (allowed_mime_types).
const EXTENSIES: Record<string, 'jpg' | 'png' | 'webp'> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function extensieVoorType(type: string): 'jpg' | 'png' | 'webp' | null {
  return EXTENSIES[type] ?? null;
}

function willekeurigeHex(tekens = 12): string {
  const bytes = new Uint8Array(Math.ceil(tekens / 2));
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').slice(0, tekens);
}

/**
 * anon_<sessie-id>/<tijd>-<willekeurig>.<ext>. De extensie komt uit het
 * bestandstype, niet uit de bestandsnaam: "IMG_1234" zonder punt gaf eerder
 * de hele naam als extensie.
 */
export function maakSelfiePad(
  sessionId: string,
  type: string,
  nu: number = Date.now(),
  willekeurig: string = willekeurigeHex(),
): string | null {
  const extensie = extensieVoorType(type);
  if (!extensie) return null;
  return `anon_${sessionId}/${nu}-${willekeurig}.${extensie}`;
}

// Map, schuine streep, bestandsnaam. Een data-URL, blob-URL of http-URL valt
// erbuiten door de dubbele punt.
const OPSLAGPAD = /^[A-Za-z0-9_-]+\/[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function isOpslagPad(waarde: unknown): waarde is string {
  return typeof waarde === 'string' && waarde.length <= 200 && OPSLAGPAD.test(waarde);
}

/** Het sessie-id uit een pad in anon_<sessie-id>/, of null. */
export function sessieUitPad(pad: string): string | null {
  const treffer = /^anon_([0-9a-f-]{36})\//i.exec(pad);
  return treffer ? treffer[1] : null;
}

/**
 * Antwoorden zoals ze naar de database mogen: photoUrl alleen als opslagpad,
 * en zonder photoDataUrl. Die laatste zet ProfilePage.tsx lokaal neer en
 * belooft "alleen lokaal opgeslagen"; via quiz_answers kwam hij toch in
 * style_profiles terecht, net als de selfie als data-URL uit de oude quiz.
 */
export function antwoordenVoorDatabase<T extends Record<string, unknown>>(antwoorden: T): T {
  const kopie: Record<string, unknown> = { ...antwoorden };
  if (!isOpslagPad(kopie.photoUrl)) delete kopie.photoUrl;
  delete kopie.photoDataUrl;
  return kopie as T;
}

const ONDERTONEN = new Set(['warm', 'cool', 'neutral']);
const SEIZOENEN = new Set(['spring', 'summer', 'autumn', 'winter']);

export function isSelfieAnalyse(waarde: unknown): waarde is SelfieAnalyse {
  if (!waarde || typeof waarde !== 'object') return false;
  const a = waarde as Record<string, unknown>;
  return (
    typeof a.undertone === 'string' && ONDERTONEN.has(a.undertone) &&
    typeof a.seasonal_type === 'string' && SEIZOENEN.has(a.seasonal_type) &&
    Array.isArray(a.best_colors) &&
    Array.isArray(a.avoid_colors) &&
    typeof a.confidence === 'number'
  );
}

export type AnalyseUitkomst =
  | { status: 'ok'; analyse: SelfieAnalyse }
  | { status: 'limiet' }
  | { status: 'mislukt' };

/**
 * Vraagt de analyse aan bij analyze-selfie-color. Geeft nooit een
 * uitzondering: elke fout wordt 'mislukt', zodat de quiz een melding kan
 * tonen in plaats van stil door te gaan.
 */
export async function vraagSelfieAnalyse(opties: {
  pad: string;
  sessionId: string;
  supabaseUrl: string;
  anonKey: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}): Promise<AnalyseUitkomst> {
  const { pad, sessionId, supabaseUrl, anonKey, timeoutMs = 30_000 } = opties;
  const doeFetch = opties.fetcher ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
  const afbreken = new AbortController();
  const timer = setTimeout(() => afbreken.abort(), timeoutMs);
  try {
    const res = await doeFetch(`${supabaseUrl}/functions/v1/analyze-selfie-color`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
      body: JSON.stringify({ path: pad, sessionId }),
      signal: afbreken.signal,
    });
    if (res.status === 429) return { status: 'limiet' };
    if (!res.ok) return { status: 'mislukt' };
    const data: unknown = await res.json();
    return isSelfieAnalyse(data) ? { status: 'ok', analyse: data } : { status: 'mislukt' };
  } catch {
    return { status: 'mislukt' };
  } finally {
    clearTimeout(timer);
  }
}
