import type { Handler } from '@netlify/functions';
import { randomUUID } from 'crypto';

type Mode = 'outfits'|'archetype'|'shop';
type Msg = { role:'system'|'user'|'assistant'; content:string };

const ORIGINS = [
  'https://www.fitfi.ai',
  'https://fitfi.ai',
  'https://fitfi.netlify.app',
  'http://localhost:5173',
];

function corsOrigin(o?: string) {
  try {
    if (!o) return ORIGINS[0];                              // allow no-origin (curl / health)
    const u = new URL(o);
    if (ORIGINS.includes(o)) return o;
    if ((u.protocol === 'https:' || u.protocol === 'http:') && u.hostname.endsWith('.netlify.app')) return o;
  } catch {}
  return ORIGINS[0];
}

function routeModel(mode: Mode) {
  if (mode === 'outfits')   return process.env.NOVA_MODEL_OUTFITS   || 'gpt-4o';
  if (mode === 'archetype') return process.env.NOVA_MODEL_ARCHETYPE || 'gpt-4o-mini';
  return                       process.env.NOVA_MODEL_SHOP          || 'gpt-4o-mini';
}

function systemPrompt(mode: Mode) {
  const base = [
    'Je bent Nova, premium AI-stylist. Antwoord NL, kort en duidelijk.',
    'Eerst een beknopte menselijke uitleg met bullets.',
    'DAARNA ALTIJD een machine-leesbare JSON payload tussen markers zonder codefences:',
    '<<<FITFI_JSON>>> ... <<<END_FITFI_JSON>>>',
    'JSON schema: {"type":"outfits","version":1,"outfits":[{"id":"string","title":"string","occasion":"string?","why":"string?","matchScore":0-100,"palette":["#RRGGBB",...],"budget":"low|mid|high?","items":[{"role":"top|bottom|outerwear|shoes|accessory","name":"string","color":"string?","note":"string?"}],"shopQuery":"string?"}]}',
    'Zet matchScore integer 0..100. Palet in hex (max 4). Gebruik korte, merkloze namen.',
    'GEEN markdown codefences in de JSON; alleen pure JSON tussen de markers.'
  ].join(' ');

  if (mode === 'outfits')   return base + ' Geef 3 outfits (casual/business/smart of passend bij het verzoek).';
  if (mode === 'archetype') return base + ' Voeg 2 outfits toe die het archetype belichamen.';
  return                       base + ' Toon shoppingrichtingen als outfits met generieke items.';
}

export const handler: Handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin;
  const allow = corsOrigin(origin);
  const acceptsSSE = /text\/event-stream/i.test(event.headers.accept || '');
  const traceId = randomUUID();

  // Lightweight GET / health
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': allow, 'Content-Type':'application/json' },
      body: JSON.stringify({ ok: true, function: 'nova', node: process.version })
    };
  }

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': allow,
        'Access-Control-Allow-Headers': 'content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: ''
    };
  }

  try {
    const key = process.env.OPENAI_API_KEY || '';
    if (!key) {
      // duidelijke fout (SSE of JSON)
      if (acceptsSSE) {
        const body = new ReadableStream({
          start: (c) => {
            c.enqueue(`data: ${JSON.stringify({ type:'error', message:'missing OPENAI_API_KEY', traceId })}\n\n`);
            c.enqueue(`data: ${JSON.stringify({ type:'done' })}\n\n`);
            c.close();
          }
        });
        return new Response(body as any, {
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': allow,
          }
        } as any);
      }
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': allow, 'Content-Type':'application/json' },
        body: JSON.stringify({ error: 'missing OPENAI_API_KEY', traceId })
      };
    }

    const { mode, messages, stream } = JSON.parse(event.body || '{}') as { mode: Mode; messages: Msg[]; stream?: boolean; };
    const safeMode: Mode = (['outfits','archetype','shop'] as Mode[]).includes(mode) ? mode : 'outfits';
    if (!Array.isArray(messages) || messages.length === 0) {
      return { statusCode: 400, headers:{'Access-Control-Allow-Origin': allow}, body: 'Bad request' };
    }

    const model = routeModel(safeMode);
    const serverMessages: Msg[] = [{ role:'system', content: systemPrompt(safeMode) }, ...messages];

    // SSE path
    if (acceptsSSE && stream !== false) {
      const streamBody = new ReadableStream({
        start: async (controller) => {
          const send = (obj:any) => controller.enqueue(`data: ${JSON.stringify(obj)}\n\n`);
          const ping = () => controller.enqueue(`:ping\n\n`);
          send({ type:'meta', mode: safeMode, model, traceId });

          try {
            const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
              },
              body: JSON.stringify({ model, messages: serverMessages, stream: true, temperature: 0.7 }),
              // @ts-ignore
              duplex: 'half'
            });

            if (!upstream.ok || !upstream.body) {
              const txt = await upstream.text().catch(()=> '');
              send({ type:'error', message: 'upstream error', detail: txt.slice(0,300), traceId });
              send({ type:'done' }); controller.close(); return;
            }

            const reader = upstream.body.getReader();
            const dec = new TextDecoder();
            let buf = '';
            const hb = setInterval(ping, 15000);

            for (;;) {
              const { value, done } = await reader.read();
              if (done) break;
              buf += dec.decode(value, { stream: true });
              const lines = buf.split('\n'); buf = lines.pop() || '';
              for (const line of lines) {
                const l = line.trim();
                if (!l || !l.startsWith('data:')) continue;
                const payload = l.slice(5).trim();
                if (payload === '[DONE]') continue;
                try {
                  const obj = JSON.parse(payload);
                  const delta = obj.choices?.[0]?.delta?.content || '';
                  if (delta) send({ type:'chunk', delta });
                } catch { /* ignore */ }
              }
            }
            clearInterval(hb);
            send({ type:'done' });
            controller.close();
          } catch (err:any) {
            send({ type:'error', message:'network error', traceId });
            send({ type:'done' }); controller.close();
          }
        }
      });

      return new Response(streamBody as any, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': allow,
        }
      } as any);
    }

    // JSON fallback
    return {
      statusCode: 200,
      headers: { 'Content-Type':'application/json; charset=utf-8', 'Access-Control-Allow-Origin': allow },
      body: JSON.stringify({ model, content: 'Nova (fallback): streaming niet actief.', traceId })
    };

  } catch (e) {
    return { statusCode: 500, headers:{'Access-Control-Allow-Origin': corsOrigin(origin)}, body: JSON.stringify({ error: 'nova function error', traceId: randomUUID() }) };
  }
};