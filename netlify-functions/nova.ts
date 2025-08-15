import type { Handler } from '@netlify/functions';
import { randomUUID } from 'crypto';

type Mode = 'outfits'|'archetype'|'shop';
type Msg = { role:'system'|'user'|'assistant'; content:string };

const ORIGINS = ['https://www.fitfi.ai','https://fitfi.ai','http://localhost:5173'];
const okOrigin = (o?:string) => !!o && ORIGINS.includes(o);

function routeModel(mode: Mode){
  if(mode==='outfits')   return process.env.NOVA_MODEL_OUTFITS   || 'gpt-4o';
  if(mode==='archetype') return process.env.NOVA_MODEL_ARCHETYPE || 'gpt-4o-mini';
  return                    process.env.NOVA_MODEL_SHOP          || 'gpt-4o-mini';
}
function systemPrompt(mode: Mode){
  const base = [
    'Je bent Nova, een premium AI-stylist. Antwoord altijd in het Nederlands, kort en duidelijk.',
    'Stuur geen algemene welkomstteksten terug nadat de gebruiker al iets vroeg.',
    'Vraag max. 1 verduidelijkende vraag als informatie ontbreekt (gelegenheid, seizoen, vibe, budget).'
  ].join(' ');
  if(mode==='outfits')   return base + ' Geef 3 outfits met titel, 1-2 bullets en 1 zin "waarom".';
  if(mode==='archetype') return base + ' Leg archetype uit in 3 bullets + 1 do/don\'t.';
  return                   base + ' Geef 3-5 shoprichtingen met filters (fit, materiaal, kleur).';
}

export const handler: Handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin;
  const acceptsSSE = /text\/event-stream/i.test(event.headers.accept || '');
  const traceId = randomUUID();

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': okOrigin(origin) ? origin! : ORIGINS[0],
        'Access-Control-Allow-Headers': 'content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: ''
    };
  }

  try {
    if (!okOrigin(origin)) return { statusCode: 403, body: 'Forbidden' };

    const { mode, messages, stream } = JSON.parse(event.body || '{}') as { mode: Mode; messages: Msg[]; stream?: boolean; };
    const safeMode: Mode = (['outfits','archetype','shop'] as Mode[]).includes(mode) ? mode : 'outfits';
    if (!Array.isArray(messages) || messages.length === 0) return { statusCode: 400, body: 'Bad request' };

    const model = routeModel(safeMode);
    const serverMessages: Msg[] = [{ role:'system', content: systemPrompt(safeMode) }, ...messages];

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
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`
              },
              body: JSON.stringify({ model, messages: serverMessages, stream: true, temperature: 0.7 }),
              // @ts-ignore
              duplex: 'half'
            });

            if (!upstream.ok || !upstream.body) {
              const txt = await upstream.text().catch(()=> '');
              send({ type:'error', message:'upstream error', detail: txt.slice(0,300), traceId });
              send({ type:'done' });
              controller.close(); return;
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
          } catch {
            send({ type:'error', message:'network error', traceId });
            send({ type:'done' });
            controller.close();
          }
        }
      });

      return new Response(streamBody as any, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': okOrigin(origin) ? origin! : ORIGINS[0],
        }
      } as any);
    }

    // JSON fallback
    return {
      statusCode: 200,
      headers: {
        'Content-Type':'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': okOrigin(origin) ? origin! : ORIGINS[0],
      },
      body: JSON.stringify({ model, content: 'Nova (fallback): streaming niet actief.', traceId })
    };

  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: 'nova function error', traceId: randomUUID() }) };
  }
};