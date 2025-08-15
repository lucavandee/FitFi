export type NovaMode = 'outfits' | 'archetype' | 'shop';

type Msg = { role: 'system' | 'user' | 'assistant'; content: string };

const ENV = {
  ENDPOINT: '/.netlify/functions/nova',
  MODEL_OUTFITS: import.meta.env.VITE_NOVA_MODEL_OUTFITS || 'gpt-4o',
  MODEL_ARCHETYPE: import.meta.env.VITE_NOVA_MODEL_ARCHETYPE || 'gpt-4o-mini',
  MODEL_SHOP: import.meta.env.VITE_NOVA_MODEL_SHOP || 'gpt-4o-mini',
  MOCK: import.meta.env.VITE_USE_MOCK_DATA === 'true',
};

export function systemPrompt(mode: NovaMode): string {
  switch (mode) {
    case 'outfits':
      return [
        'Je bent Nova, een premium AI-stylist.',
        'Taken: genereer outfits die passen bij het profiel, seizoen en archetype.',
        'Antwoorden: kort, stijlvol, met 3 duidelijke opties en shop-klare bullets.',
        'Geef match-reden (1 zin) en kleuradvies.',
      ].join(' ');
    case 'archetype':
      return [
        'Je bent Nova, een stijl-analist.',
        'Taken: leg archetypes uit, geef herkenbare signalen en do\'s/don'ts.',
        'Antwoorden: beknopt, met 3 concrete tips.',
      ].join(' ');
    case 'shop':
      return [
        'Je bent Nova, een shopping-assistent.',
        'Taken: suggereer productcategorieën en filters; vermijd merken zonder context.',
        'Antwoorden: lijst met 3-5 productrichtingen en filters (fit, materiaal, kleur).',
      ].join(' ');
  }
}

export function routeModel(mode: NovaMode): string {
  if (mode === 'outfits') return ENV.MODEL_OUTFITS;
  if (mode === 'archetype') return ENV.MODEL_ARCHETYPE;
  return ENV.MODEL_SHOP;
}

/** Client-side streaming reader.
 *  Probeert eerst server-stream (event stream / NDJSON).
 *  Valt terug op één respons + progressive reveal. */
export async function* streamChat(params: {
  mode: NovaMode;
  messages: Msg[];
  signal?: AbortSignal;
}): AsyncGenerator<string, void, unknown> {
  // Optioneel: directe mock
  if (ENV.MOCK) {
    const text = mockAnswer(params.mode, params.messages);
    // progressive reveal
    for (const chunk of chunkify(text)) {
      yield chunk;
      await sleep(30);
    }
    return;
  }

  // Probeer server (Netlify function) met SSE preference
  try {
    const res = await fetch(ENV.ENDPOINT, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'   // <-- prefer SSE
      },
      body: JSON.stringify({
        mode: params.mode,
        model: routeModel(params.mode),
        messages: [
          { role: 'system', content: systemPrompt(params.mode) },
          ...params.messages,
        ],
        stream: true
      }),
      signal: params.signal,
    });

    const ctype = res.headers.get('content-type') || '';
    // --- SSE PATH ---
    if (res.ok && res.body && ctype.includes('text/event-stream')) {
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });

        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const raw of lines) {
          const line = raw.trim();
          if (!line) continue;
          if (line.startsWith(':')) continue; // heartbeat
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.type === 'chunk' && typeof evt.delta === 'string') {
              yield evt.delta;
            }
            // meta / done / error can be handled by caller if needed
          } catch {
            // lenient: some providers send plain text
            yield payload;
          }
        }
      }
      return;
    }

    // --- JSON FALLBACK ---
    const json = await res.json().catch(() => ({}));
    const text = json?.content || 'Er ging iets mis.';
    for (const chunk of chunkify(text)) {
      yield chunk;
      await sleep(20);
    }
  } catch (e) {
    const text = 'Netwerkprobleem — offline mode.';
    for (const chunk of chunkify(text)) {
      yield chunk;
      await sleep(25);
    }
  }
}

function mockAnswer(mode: NovaMode, messages: Msg[]): string {
  const last = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  if (mode === 'outfits') {
    return `Hier zijn 3 outfits op basis van je vraag: ${last}\n\n1) Smart casual — donkerblauwe jeans, wit oxford, suede loafer.\n2) Clean athleisure — tapered jogger, merino crew, retro runner.\n3) Minimal chic — wolblend pantalon, rib knit, chelsea boots.\n\nWaarom: silhouet in balans, kleuren in jouw palet.`;
  }
  if (mode === 'archetype') {
    return `Jouw stijl neigt naar "Modern Minimal". Signal: neutrale kleuren, strakke fits, weinig branding. Do: textuurmix. Don't: te veel contrast.`;
  }
  return `Shoprichtingen: 1) Merino knit crew, 2) Straight/dark denim, 3) Suede sneakers in taupe, 4) Overshirt in wolblend, 5) Minimal leather belt.`;
}

function* chunkify(s: string) {
  const step = 14;
  for (let i = 0; i < s.length; i += step) yield s.slice(i, i + step);
}
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));