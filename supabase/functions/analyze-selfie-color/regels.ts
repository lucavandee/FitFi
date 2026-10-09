/**
 * Regels van analyze-selfie-color die geen netwerk nodig hebben: welk pad een
 * aanroeper mag laten analyseren, wie er belt, en of het antwoord van OpenAI
 * de vorm heeft die de quiz verwacht.
 *
 * Bewust zonder Deno-globals en zonder npm:-imports, zodat vitest dit bestand
 * vanuit src/ kan importeren (src/lib/quiz/__tests__/selfieFunctie.test.ts).
 * Hetzelfde patroon als _shared/productClassifier.ts.
 */

/** Privé bucket. Er bestaat geen publieke URL, alleen een ondertekende link. */
export const BUCKET = 'user-photos';

/** Zo lang werkt de link die OpenAI krijgt. */
export const LINK_SECONDEN = 60;

/**
 * Zoveel foto's mag één anonieme sessie laten analyseren. Geteld als het
 * aantal bestanden in anon_<sessie-id>/, want elke upload krijgt een nieuwe
 * naam. Een nieuwe sessie begint weer bij nul, en hetzelfde pad opnieuw
 * insturen telt niet: dit houdt herhalen per ongeluk en een snelle lus tegen,
 * geen vastberaden misbruiker.
 */
export const MAX_ANALYSES_PER_SESSIE = 3;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// De quiz maakt <tijd>-<willekeurig>.<jpg|png|webp>. Ruimer dan dat, zodat
// ook oudere namen als selfie-<tijd>.jpeg passen, maar nooit een schuine
// streep, een punt vooraan of een andere extensie.
const BESTANDSNAAM = /^[A-Za-z0-9][A-Za-z0-9_-]{0,99}\.(?:jpe?g|png|webp)$/i;

export function isUuid(waarde: unknown): waarde is string {
  return typeof waarde === 'string' && UUID.test(waarde);
}

export type Padcontrole =
  | { ok: true; pad: string; map: string; soort: 'sessie' | 'gebruiker' }
  | { ok: false; reden: 'geen-pad' | 'vorm' | 'andere-map' };

/**
 * Een aanroeper laat alleen een foto uit zijn eigen map analyseren:
 * anon_<sessie-id>/ uit de quiz, of de map met zijn eigen gebruikers-id.
 * `userId` komt uit een token dat Supabase Auth gecontroleerd heeft, nooit
 * uit de body.
 */
export function controleerPad(
  pad: unknown,
  wie: { sessionId?: unknown; userId?: string | null },
): Padcontrole {
  if (typeof pad !== 'string' || pad === '') return { ok: false, reden: 'geen-pad' };

  const delen = pad.split('/');
  if (delen.length !== 2) return { ok: false, reden: 'vorm' };
  const [map, bestand] = delen;
  if (!BESTANDSNAAM.test(bestand)) return { ok: false, reden: 'vorm' };

  if (isUuid(wie.sessionId) && map === `anon_${wie.sessionId}`) {
    return { ok: true, pad, map, soort: 'sessie' };
  }
  if (isUuid(wie.userId) && map === wie.userId) {
    return { ok: true, pad, map, soort: 'gebruiker' };
  }
  return { ok: false, reden: 'andere-map' };
}

/**
 * De rol uit een Supabase-JWT, zonder de handtekening te controleren. Alleen
 * om de route te kiezen: de anon-sleutel is zelf ook een JWT, met rol anon.
 * Een token met rol authenticated gaat daarna altijd langs auth.getUser, en
 * dat controleert wel.
 */
export function rolUitToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const delen = token.split('.');
  if (delen.length !== 3) return null;
  try {
    const base64 = delen[1].replace(/-/g, '+').replace(/_/g, '/');
    const opgevuld = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(opgevuld));
    return typeof payload?.role === 'string' ? payload.role : null;
  } catch {
    return null;
  }
}

/** Het antwoord dat de quiz verwacht (PhotoUpload.tsx, AnswerMap.colorAnalysis). */
export interface ColorAnalysis {
  undertone: 'warm' | 'cool' | 'neutral';
  skin_tone: string;
  hair_color: string;
  eye_color: string;
  seasonal_type: 'spring' | 'summer' | 'autumn' | 'winter';
  best_colors: string[];
  avoid_colors: string[];
  confidence: number;
  reasoning?: string;
}

const ONDERTONEN = new Set(['warm', 'cool', 'neutral']);
const SEIZOENEN = new Set(['spring', 'summer', 'autumn', 'winter']);

function tekst(waarde: unknown): string {
  return typeof waarde === 'string' ? waarde : '';
}

function tekstLijst(waarde: unknown): string[] {
  return Array.isArray(waarde) ? waarde.filter((x): x is string => typeof x === 'string') : [];
}

/**
 * Leest de analyse uit het antwoord van het model. Geeft null als ondertoon of
 * seizoen ontbreekt of geen bekende waarde heeft: dan is er geen analyse, en
 * dan mag de quiz ook niet doen alsof.
 *
 * Een zekerheid als 85 in plaats van 0.85 wordt teruggerekend; ontbreekt hij,
 * dan wordt hij 0, zodat de quiz het seizoen niet uit deze analyse haalt
 * (die eist 0.6, lib/quiz/logic.ts).
 */
export function leesAnalyse(inhoud: unknown): ColorAnalysis | null {
  if (typeof inhoud !== 'string') return null;
  const blok = inhoud.match(/\{[\s\S]*\}/);
  if (!blok) return null;

  let ruw: Record<string, unknown>;
  try {
    ruw = JSON.parse(blok[0]);
  } catch {
    return null;
  }
  if (!ruw || typeof ruw !== 'object') return null;

  const undertone = typeof ruw.undertone === 'string' ? ruw.undertone.toLowerCase() : '';
  const seizoen = typeof ruw.seasonal_type === 'string' ? ruw.seasonal_type.toLowerCase() : '';
  if (!ONDERTONEN.has(undertone) || !SEIZOENEN.has(seizoen)) return null;

  let confidence = typeof ruw.confidence === 'number' && Number.isFinite(ruw.confidence) ? ruw.confidence : 0;
  if (confidence > 1 && confidence <= 100) confidence = confidence / 100;
  if (confidence < 0 || confidence > 1) confidence = 0;

  const analyse: ColorAnalysis = {
    undertone: undertone as ColorAnalysis['undertone'],
    skin_tone: tekst(ruw.skin_tone),
    hair_color: tekst(ruw.hair_color),
    eye_color: tekst(ruw.eye_color),
    seasonal_type: seizoen as ColorAnalysis['seasonal_type'],
    best_colors: tekstLijst(ruw.best_colors),
    avoid_colors: tekstLijst(ruw.avoid_colors),
    confidence,
  };
  if (typeof ruw.reasoning === 'string') analyse.reasoning = ruw.reasoning;
  return analyse;
}
