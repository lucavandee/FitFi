// Deno-test voor analyze-selfie-color, zonder netwerk: Deno.serve en fetch
// worden vervangen, zodat de functie tegen een nagebootste Supabase en OpenAI
// draait. Draai met:
//   deno test --allow-env supabase/functions/analyze-selfie-color/index.test.ts
// De zuivere regels (pad, token, antwoord) staan ook in vitest:
// src/lib/quiz/__tests__/selfieFunctie.test.ts.

const SUPABASE = 'https://voorbeeld.supabase.co';
const SESSIE = '6f1c2b9e-3d4a-4c5b-9e8f-1a2b3c4d5e6f';
const ANDERE_SESSIE = '0a0b0c0d-1e1f-4a2b-8c3d-4e5f6a7b8c9d';
const GEBRUIKER = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const PAD = `anon_${SESSIE}/1728400000000-abc123def456.jpg`;

function jwt(payload: Record<string, unknown>): string {
  const deel = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${deel({ alg: 'HS256', typ: 'JWT' })}.${deel(payload)}.handtekening`;
}
const ANON_SLEUTEL = jwt({ role: 'anon' });
const GEBRUIKER_TOKEN = jwt({ role: 'authenticated', sub: GEBRUIKER });

const GOEDE_ANALYSE = {
  undertone: 'warm',
  skin_tone: 'medium with warm undertone',
  hair_color: 'dark brown',
  eye_color: 'brown',
  seasonal_type: 'autumn',
  best_colors: ['camel', 'olive', 'rust'],
  avoid_colors: ['icy blue'],
  confidence: 0.82,
  reasoning: 'Golden undertone.',
};

interface Wereld {
  bestandenInMap: number;
  bestaatFoto: boolean;
  openaiInhoud: string;
  tier: string | null;
}

interface Logboek {
  openai: Array<Record<string, unknown>>;
  gesigneerd: string[];
  ingevoegd: number;
}

function maakFetch(wereld: Wereld, log: Logboek) {
  return async (invoer: Request | URL | string, init?: RequestInit): Promise<Response> => {
    const url = typeof invoer === 'string' ? invoer : invoer instanceof URL ? invoer.href : invoer.url;
    const methode = (init?.method ?? (invoer instanceof Request ? invoer.method : 'GET')).toUpperCase();
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

    if (url === 'https://api.openai.com/v1/chat/completions') {
      log.openai.push(JSON.parse(String(init?.body)));
      return json({ choices: [{ message: { content: wereld.openaiInhoud } }] });
    }
    if (url.startsWith(`${SUPABASE}/storage/v1/object/list/user-photos`)) {
      const lijst = Array.from({ length: wereld.bestandenInMap }, (_, i) => ({ name: `f${i}.jpg`, id: `id-${i}` }));
      // Een submap komt terug zonder id en telt niet mee.
      return json([{ name: 'submap', id: null }, ...lijst]);
    }
    if (url.startsWith(`${SUPABASE}/storage/v1/object/sign/user-photos/`)) {
      const pad = decodeURIComponent(url.slice(`${SUPABASE}/storage/v1/object/sign/user-photos/`.length));
      log.gesigneerd.push(pad);
      if (!wereld.bestaatFoto) return json({ statusCode: '404', error: 'not_found', message: 'Object not found' }, 400);
      return json({ signedURL: `/object/sign/user-photos/${pad}?token=geheim` });
    }
    if (url.startsWith(`${SUPABASE}/auth/v1/user`)) {
      return json({ id: GEBRUIKER, aud: 'authenticated', role: 'authenticated' });
    }
    if (url.startsWith(`${SUPABASE}/rest/v1/profiles`)) {
      return json(wereld.tier ? { tier: wereld.tier, subscription_status: null } : null);
    }
    if (url.startsWith(`${SUPABASE}/rest/v1/photo_analyses`) && methode === 'POST') {
      log.ingevoegd += 1;
      return new Response(null, { status: 201 });
    }
    throw new Error(`onverwachte fetch: ${methode} ${url}`);
  };
}

type Handler = (req: Request) => Promise<Response>;
let handler: Handler | null = null;

async function laadFunctie(): Promise<Handler> {
  if (handler) return handler;
  Deno.env.set('SUPABASE_URL', SUPABASE);
  Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', jwt({ role: 'service_role' }));
  Deno.env.set('OPENAI_API_KEY', 'sk-test');
  // deno-lint-ignore no-explicit-any
  (Deno as any).serve = (h: Handler) => {
    handler = h;
    return {};
  };
  await import('./index.ts');
  if (!handler) throw new Error('Deno.serve is niet aangeroepen');
  return handler;
}

async function roep(
  body: unknown,
  opties: { wereld?: Partial<Wereld>; token?: string; methode?: string } = {},
) {
  const h = await laadFunctie();
  const wereld: Wereld = {
    bestandenInMap: 1,
    bestaatFoto: true,
    openaiInhoud: JSON.stringify(GOEDE_ANALYSE),
    tier: null,
    ...opties.wereld,
  };
  const log: Logboek = { openai: [], gesigneerd: [], ingevoegd: 0 };
  const echteFetch = globalThis.fetch;
  globalThis.fetch = maakFetch(wereld, log) as typeof fetch;
  try {
    const res = await h(
      new Request('https://functie.test/analyze-selfie-color', {
        method: opties.methode ?? 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://fitfi.ai',
          Authorization: `Bearer ${opties.token ?? ANON_SLEUTEL}`,
        },
        body: opties.methode === 'OPTIONS' ? undefined : JSON.stringify(body),
      }),
    );
    const tekst = await res.text();
    return { status: res.status, headers: res.headers, body: tekst ? JSON.parse(tekst) : null, log };
  } finally {
    globalThis.fetch = echteFetch;
  }
}

function gelijk(werkelijk: unknown, verwacht: unknown, wat: string): void {
  if (werkelijk !== verwacht) {
    throw new Error(`${wat}: verwacht ${JSON.stringify(verwacht)}, kreeg ${JSON.stringify(werkelijk)}`);
  }
}

Deno.test('preflight geeft de toegestane origin terug', async () => {
  const r = await roep(null, { methode: 'OPTIONS' });
  gelijk(r.status, 200, 'status');
  gelijk(r.headers.get('Access-Control-Allow-Origin'), 'https://fitfi.ai', 'origin');
});

Deno.test('zonder pad: 400 en geen OpenAI', async () => {
  const r = await roep({ sessionId: SESSIE });
  gelijk(r.status, 400, 'status');
  gelijk(r.log.openai.length, 0, 'openai-aanroepen');
});

Deno.test('pad in de map van een andere sessie: 403 en geen link', async () => {
  const r = await roep({ path: PAD, sessionId: ANDERE_SESSIE });
  gelijk(r.status, 403, 'status');
  gelijk(r.log.gesigneerd.length, 0, 'gesigneerde links');
  gelijk(r.log.openai.length, 0, 'openai-aanroepen');
});

Deno.test('geldig pad: OpenAI krijgt alleen de ondertekende link en de quiz de analyse', async () => {
  const r = await roep({ path: PAD, sessionId: SESSIE }, { wereld: { bestandenInMap: 2 } });
  gelijk(r.status, 200, 'status');
  gelijk(r.body.undertone, 'warm', 'ondertoon');
  gelijk(r.body.seasonal_type, 'autumn', 'seizoen');
  gelijk(r.log.gesigneerd[0], PAD, 'gesigneerd pad');
  const verzoek = r.log.openai[0] as {
    model: string;
    store: boolean;
    messages: Array<{ content: Array<{ type: string; image_url?: { url: string; detail: string } }> }>;
  };
  gelijk(verzoek.model, 'gpt-4o-mini', 'model');
  gelijk(verzoek.store, false, 'store');
  const beeld = verzoek.messages[0].content.find((c) => c.type === 'image_url');
  gelijk(beeld?.image_url?.url, `${SUPABASE}/storage/v1/object/sign/user-photos/${PAD}?token=geheim`, 'link naar OpenAI');
  gelijk(beeld?.image_url?.detail, 'low', 'detail');
  gelijk(r.log.ingevoegd, 0, 'anoniem slaat niets op in photo_analyses');
});

Deno.test('drie bestanden in de sessiemap mag, vier niet', async () => {
  const drie = await roep({ path: PAD, sessionId: SESSIE }, { wereld: { bestandenInMap: 3 } });
  gelijk(drie.status, 200, 'drie');
  const vier = await roep({ path: PAD, sessionId: SESSIE }, { wereld: { bestandenInMap: 4 } });
  gelijk(vier.status, 429, 'vier');
  gelijk(vier.log.openai.length, 0, 'geen OpenAI boven de limiet');
});

Deno.test('foto bestaat niet: 404', async () => {
  const r = await roep({ path: PAD, sessionId: SESSIE }, { wereld: { bestaatFoto: false } });
  gelijk(r.status, 404, 'status');
  gelijk(r.log.openai.length, 0, 'openai-aanroepen');
});

Deno.test('onbruikbaar antwoord van het model: foutstatus, geen nepanalyse', async () => {
  const r = await roep({ path: PAD, sessionId: SESSIE }, { wereld: { openaiInhoud: 'Sorry, I cannot help with that.' } });
  gelijk(r.status, 500, 'status');
  gelijk(r.body.undertone, undefined, 'geen ondertoon');
});

Deno.test('ingelogd zonder premium: 403 met requiresPremium', async () => {
  const r = await roep(
    { path: `${GEBRUIKER}/1728400000000-abc123def456.jpg`, sessionId: SESSIE },
    { token: GEBRUIKER_TOKEN, wereld: { tier: 'free' } },
  );
  gelijk(r.status, 403, 'status');
  gelijk(r.body.requiresPremium, true, 'requiresPremium');
});

Deno.test('ingelogd met premium, eigen map: analyse en opgeslagen in photo_analyses', async () => {
  const r = await roep(
    { path: `${GEBRUIKER}/1728400000000-abc123def456.jpg`, sessionId: SESSIE },
    { token: GEBRUIKER_TOKEN, wereld: { tier: 'premium' } },
  );
  gelijk(r.status, 200, 'status');
  gelijk(r.log.ingevoegd, 1, 'photo_analyses');
});

Deno.test('anon-sleutel met een gebruikersmap uit de body: 403', async () => {
  const r = await roep({ path: `${GEBRUIKER}/1728400000000-abc123def456.jpg`, sessionId: SESSIE });
  gelijk(r.status, 403, 'status');
});
