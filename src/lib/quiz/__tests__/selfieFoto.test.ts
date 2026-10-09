/**
 * De selfie uit quizstap 14 aan de kant van de app: welk pad er ontstaat, wat
 * er naar de database mag en hoe een mislukte analyse terugkomt. Zie
 * src/lib/quiz/selfieFoto.ts.
 */
import { describe, expect, it, vi } from 'vitest';
import {
  antwoordenVoorDatabase,
  extensieVoorType,
  isOpslagPad,
  maakSelfiePad,
  sessieUitPad,
  vraagSelfieAnalyse,
  type SelfieAnalyse,
} from '../selfieFoto';

const SESSIE = '6f1c2b9e-3d4a-4c5b-9e8f-1a2b3c4d5e6f';
const PAD = `anon_${SESSIE}/1728400000000-abc123def456.jpg`;
const DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD';

function analyse(overschrijf: Partial<SelfieAnalyse> = {}): SelfieAnalyse {
  return {
    undertone: 'cool',
    skin_tone: 'light with cool undertone',
    hair_color: 'black',
    eye_color: 'blue',
    seasonal_type: 'winter',
    best_colors: ['navy', 'emerald'],
    avoid_colors: ['orange'],
    confidence: 0.8,
    ...overschrijf,
  };
}

describe('pad van de selfie', () => {
  it('komt in anon_<sessie>/ met de extensie uit het bestandstype', () => {
    expect(maakSelfiePad(SESSIE, 'image/jpeg', 1728400000000, 'abc123def456')).toBe(PAD);
    expect(maakSelfiePad(SESSIE, 'image/webp', 1, 'ff')).toBe(`anon_${SESSIE}/1-ff.webp`);
  });

  it('kent alleen de drie typen die de bucket toelaat', () => {
    expect(extensieVoorType('image/png')).toBe('png');
    expect(extensieVoorType('image/heic')).toBeNull();
    expect(maakSelfiePad(SESSIE, 'image/gif')).toBeNull();
  });

  it('maakt zonder vaste waarden een geldig pad met 12 willekeurige tekens', () => {
    const pad = maakSelfiePad(SESSIE, 'image/png');
    expect(pad).toMatch(new RegExp(`^anon_${SESSIE}/\\d+-[0-9a-f]{12}\\.png$`));
    expect(isOpslagPad(pad)).toBe(true);
  });

  it('herkent een opslagpad en geen data-, blob- of http-URL', () => {
    expect(isOpslagPad(PAD)).toBe(true);
    expect(isOpslagPad(DATA_URL)).toBe(false);
    expect(isOpslagPad('blob:https://fitfi.ai/123')).toBe(false);
    expect(isOpslagPad('https://x.supabase.co/storage/v1/object/public/user-photos/a/b.jpg')).toBe(false);
    expect(isOpslagPad(`anon_${SESSIE}/sub/b.jpg`)).toBe(false);
    expect(isOpslagPad(null)).toBe(false);
  });

  it('haalt het sessie-id terug uit een pad', () => {
    expect(sessieUitPad(PAD)).toBe(SESSIE);
    expect(sessieUitPad('a1b2/foto.jpg')).toBeNull();
  });
});

describe('antwoorden voor de database', () => {
  it('laten een data-URL in photoUrl en photoDataUrl weg', () => {
    const invoer = { gender: 'female', photoUrl: DATA_URL, photoDataUrl: DATA_URL };
    const uit = antwoordenVoorDatabase(invoer);
    expect(uit).toEqual({ gender: 'female' });
    // De invoer zelf blijft heel: de quiz werkt er lokaal mee door.
    expect(invoer.photoUrl).toBe(DATA_URL);
  });

  it('houden een opslagpad', () => {
    expect(antwoordenVoorDatabase({ photoUrl: PAD })).toEqual({ photoUrl: PAD });
  });
});

describe('vraagSelfieAnalyse', () => {
  const basis = {
    pad: PAD,
    sessionId: SESSIE,
    supabaseUrl: 'https://voorbeeld.supabase.co',
    anonKey: 'anon-sleutel',
  };

  function antwoord(status: number, body: unknown) {
    return vi.fn(async () => new Response(JSON.stringify(body), { status }));
  }

  it('stuurt pad en sessie, geen URL, naar de functie', async () => {
    const fetcher = antwoord(200, analyse());
    const uit = await vraagSelfieAnalyse({ ...basis, fetcher: fetcher as unknown as typeof fetch });
    expect(uit).toEqual({ status: 'ok', analyse: analyse() });

    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://voorbeeld.supabase.co/functions/v1/analyze-selfie-color');
    expect(JSON.parse(String(init.body))).toEqual({ path: PAD, sessionId: SESSIE });
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer anon-sleutel');
  });

  it('meldt de limiet apart', async () => {
    const uit = await vraagSelfieAnalyse({ ...basis, fetcher: antwoord(429, { error: 'Analysis limit reached' }) as unknown as typeof fetch });
    expect(uit).toEqual({ status: 'limiet' });
  });

  it('maakt van elke andere fout "mislukt", nooit een stille geslaagde analyse', async () => {
    for (const fetcher of [
      antwoord(500, { error: 'Color analysis failed' }),
      antwoord(403, { error: 'Photo path not allowed' }),
      antwoord(400, { error: 'Photo URL is required' }),
      antwoord(200, { undertone: 'warm' }),
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    ]) {
      const uit = await vraagSelfieAnalyse({ ...basis, fetcher: fetcher as unknown as typeof fetch });
      expect(uit).toEqual({ status: 'mislukt' });
    }
  });
});
