// netlify/functions/nova.ts
import type { Handler } from '@netlify/functions';
import { randomUUID } from 'crypto';

type Mode = 'outfits' | 'archetype' | 'shop';
type Role = 'system' | 'user' | 'assistant';
type Msg = { role: Role; content: string };

const ORIGINS = ['https://www.fitfi.ai','https://fitfi.ai','http://localhost:5173'];

// Marker-based structured JSON in the text stream
const START = '<<<FITFI_JSON>>>';
const END   = '<<<END_FITFI_JSON>>>';

function okOrigin(o?: string) { return !!o && ORIGINS.includes(o); }
function routeModel(mode: Mode) {
  if (mode === 'outfits')   return process.env.NOVA_MODEL_OUTFITS   || 'gpt-4o';
  if (mode === 'archetype') return process.env.NOVA_MODEL_ARCHETYPE || 'gpt-4o-mini';
  return                      process.env.NOVA_MODEL_SHOP           || 'gpt-4o-mini';
}

function systemPrompt(mode: Mode) {
  if (mode === 'outfits') {
    return [
      "Je bent Nova, de AI-stylist van FitFi. Antwoord kort, helder en menselijk.",
      "Geef eerst een mini-uitleg (2-3 zinnen).",
      `Wanneer je outfit-voorstellen klaar hebt, encodeer een JSON-blok tussen ${START} en ${END} met { "explanation": string } (later voegen we producten toe).`,
      "Geen omlijnde codeblokken, geen extra mark-up buiten de markers."
    ].join(' ');
  }
  if (mode === 'archetype') {
    return "Je bent Nova. Vat iemands stijl-archetype beknopt samen (2-3 zinnen).";
  }
  return "Je bent Nova. Help kort met shoppen en stylingtips.";
}

// Minimal content filter tegen lege prompts
function normalizeMessages(messages: Msg[]): Msg[] {
  const safe = Array.isArray(messages) ? messages : [];
  const hasUser = safe.some(m => m?.role === 'user' && String(m.content || '').trim());
  if (!hasUser) {
    return [{ role: 'user', content: 'Maak een smart-casual outfit onder €200 met uitleg.' }];
  }
  return safe.slice(0, 40);
}

export const handler: Handler = async (event) => {
  const origin = event.headers.origin || (event.headers as any).Origin;
  const acceptsSSE = /text\/event-stream/i.test(event.headers.accept || '');
  const traceId = randomUUID();

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': okOrigin(origin) ? origin! : ORIGINS[0],
        'Access-Control-Allow-Headers': 'content-type, x-fitfi-tier, x-fitfi-uid',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: ''
    };
  }

  try {
    if (!okOrigin(origin)) return { statusCode: 403, body: 'Forbidden' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    const { mode, messages } = JSON.parse(event.body || '{}') as { mode?: Mode; messages?: Msg[] };
    const safeMode: Mode = (['outfits','archetype','shop'] as Mode[]).includes(mode as Mode) ? (mode as Mode) : 'outfits';
    const model = routeModel(safeMode);
    const serverMessages: Msg[] = [{ role: 'system', content: systemPrompt(safeMode) }, ...normalizeMessages(messages || [])];

    // Fallback naar éénmalige JSON als geen SSE gewenst/ondersteund
    if (!acceptsSSE || !process.env.OPENAI_API_KEY) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': okOrigin(origin) ? origin! : ORIGINS[0],
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          model,
          content: "Nova (fallback): streaming is niet actief. Zet OPENAI_API_KEY en deploy functions.",
          traceId
        })
      };
    }

    // SSE stream naar client
    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        const ping = () => controller.enqueue(enc.encode(`event: heartbeat\ndata: {"ts": ${Date.now()}}\n\n`));
        const send = (obj: any) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));

        // Meta
        send({ type: 'meta', model, traceId });

        // Upstream OpenAI stream
        const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`
          },
          body: JSON.stringify({
            model,
            messages: serverMessages,
            stream: true,
            temperature: 0.7
          }),
          // @ts-ignore Node hint for streaming
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
        let hb = setInterval(ping, 15000);

        try {
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = dec.decode(value);
            // OpenAI chunked lines "data: ..."
            const lines = chunk.split('\n').map(x => x.trim()).filter(Boolean);
            for (const line of lines) {
              if (!line.startsWith('data:')) continue;
              const data = line.slice(5).trim();
              if (data === '[DONE]') continue;
              let json: any = null;
              try { json = JSON.parse(data); } catch { json = null; }
              const delta = json?.choices?.[0]?.delta?.content ?? '';

              if (delta) {
                // stuur deeltekst naar client
                send({ type: 'chunk', delta });
              }
            }
          }
          // klaar
          send({ type: 'done' });
        } catch (e: any) {
          send({ type: 'error', message: e?.message || 'stream error', traceId });
        } finally {
          clearInterval(hb);
          controller.close();
        }
      }
    });

    return new Response(stream as any, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': okOrigin(origin) ? origin! : ORIGINS[0],
      }
    } as any);
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'nova function error', traceId: randomUUID() })
    };
  }
};