// Netlify Functions v2 (Request/Response). Stabiele SSE + health + duidelijke logs.
type Mode = 'outfits'|'archetype'|'shop';
type Msg = { role:'system'|'user'|'assistant'; content:string };

const ORIGINS = [
  'https://www.fitfi.ai',
  'https://fitfi.ai',
  'https://fitfi.netlify.app',
  'http://localhost:5173'
];

function corsOrigin(o: string | null): string {
  try {
    if (!o) return ORIGINS[0];
    if (ORIGINS.includes(o)) return o;
    const u = new URL(o);
    if ((u.protocol === 'https:' || u.protocol === 'http:') && u.hostname.endsWith('.netlify.app')) return o;
  } catch {}
  return ORIGINS[0];
}

function routeModel(m: Mode) {
  if (m==='outfits')   return process.env.NOVA_MODEL_OUTFITS   || 'gpt-4o';
  if (m==='archetype') return process.env.NOVA_MODEL_ARCHETYPE || 'gpt-4o-mini';
  return                  process.env.NOVA_MODEL_SHOP          || 'gpt-4o-mini';
}

function systemPrompt(m: Mode) {
  const base = 'Je bent Nova, premium AI-stylist. Antwoord NL, kort en duidelijk. Geen generieke welkomsttekst na een vraag. Max. 1 verduidelijking.';
  if (m==='outfits')   return base + ' Geef 3 outfits met titel, 1–2 bullets en 1 zin "waarom".';
  if (m==='archetype') return base + ' Leg archetype uit in 3 bullets + 1 do/don't.';
  return                  base + ' Geef 3–5 shoprichtingen met filters (fit, materiaal, kleur).';
}

export default async (req: Request) => {
  const origin = req.headers.get('origin');
  const allow = corsOrigin(origin);
  const acceptsSSE = /text\/event-stream/i.test(req.headers.get('accept') || '');

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allow,
        'Access-Control-Allow-Headers': 'content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      }
    });
  }

  // Health
  if (req.method === 'GET') {
    return new Response(JSON.stringify({
      ok: true,
      fn: 'nova',
      node: process.version,
      hasKey: !!process.env.OPENAI_API_KEY
    }), {
      headers: { 'Access-Control-Allow-Origin': allow, 'Content-Type': 'application/json' }
    });
  }

  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      console.error('[nova] missing OPENAI_API_KEY');
      if (acceptsSSE) {
        const rs = new ReadableStream({
          start(c){ 
            c.enqueue(`data: ${JSON.stringify({type:'error', message:'missing OPENAI_API_KEY'})}\n\n`);
            c.enqueue('data: {"type":"done"}\n\n'); 
            c.close(); 
          }
        });
        return new Response(rs, {
          status: 200,
          headers: {
            'Content-Type':'text/event-stream; charset=utf-8',
            'Cache-Control':'no-cache, no-transform',
            'Connection':'keep-alive',
            'Access-Control-Allow-Origin': allow,
          }
        });
      }
      return new Response(JSON.stringify({ error:'missing OPENAI_API_KEY' }), {
        status: 500, headers: { 'Access-Control-Allow-Origin': allow, 'Content-Type':'application/json' }
      });
    }

    const { mode, messages, stream } = await req.json() as { mode: Mode; messages: Msg[]; stream?: boolean };
    const safe: Mode = (['outfits','archetype','shop'] as Mode[]).includes(mode) ? mode : 'outfits';
    if (!Array.isArray(messages) || !messages.length) {
      return new Response('Bad request', { status: 400, headers: { 'Access-Control-Allow-Origin': allow } });
    }

    const model = routeModel(safe);
    const serverMessages: Msg[] = [{ role:'system', content: systemPrompt(safe) }, ...messages];

    // SSE response
    if (acceptsSSE && stream !== false) {
      const enc = new TextEncoder();
      const rs = new ReadableStream({
        start: async (controller) => {
          const send = (obj: any) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
          send({ type:'meta', mode: safe, model });

          try {
            const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${key}` },
              body: JSON.stringify({ model, messages: serverMessages, stream: true, temperature: 0.7 }),
              // @ts-ignore
              duplex: 'half'
            });

            if (!upstream.ok || !upstream.body) {
              const txt = await upstream.text().catch(()=> '');
              console.error('[nova] upstream error', upstream.status, txt.slice(0,160));
              send({ type:'error', message:'upstream error', status: upstream.status });
              send({ type:'done' }); controller.close(); return;
            }

            const reader = upstream.body.getReader();
            const dec = new TextDecoder(); let buf = '';
            for (;;) {
              const { value, done } = await reader.read();
              if (done) break;
              buf += dec.decode(value, { stream: true });
              const lines = buf.split('\n'); buf = lines.pop() || '';
              for (const raw of lines) {
                const l = raw.trim();
                if (!l || !l.startsWith('data:')) continue;
                const payload = l.slice(5).trim();
                if (payload === '[DONE]') continue;
                try {
                  const obj = JSON.parse(payload);
                  const delta = obj.choices?.[0]?.delta?.content || '';
                  if (delta) send({ type:'chunk', delta });
                } catch {}
              }
            }
            send({ type:'done' }); controller.close();
          } catch (e: any) {
            console.error('[nova] network error', e?.message || e);
            send({ type:'error', message:'network error' }); send({ type:'done' });
            controller.close();
          }
        }
      });

      return new Response(rs, {
        status: 200,
        headers: {
          'Content-Type':'text/event-stream; charset=utf-8',
          'Cache-Control':'no-cache, no-transform',
          'Connection':'keep-alive',
          'Access-Control-Allow-Origin': allow,
        }
      });
    }

    // JSON fallback
    return new Response(JSON.stringify({ model, content:'Nova (fallback): streaming niet actief.' }), {
      headers: { 'Access-Control-Allow-Origin': allow, 'Content-Type':'application/json' }
    });

  } catch (err: any) {
    console.error('[nova] fatal', err?.message || err);
    return new Response(JSON.stringify({ error:'nova function error' }), {
      status: 500, headers: { 'Access-Control-Allow-Origin': corsOrigin(origin) }
    });
  }
};