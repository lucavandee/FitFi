import type { Handler } from "@netlify/functions";
import { randomUUID } from "crypto";

const ORIGINS = ['https://www.fitfi.ai','https://fitfi.ai','http://localhost:5173'];
const START = '<<<FITFI_JSON>>>';
const END   = '<<<END_FITFI_JSON>>>';

type Role = 'system' | 'user' | 'assistant';
type Msg = { role: Role; content: string };

function okOrigin(o?: string) { return !!o && ORIGINS.includes(o); }

function craftExplanation(prompt?: string) {
  const base = "We kozen voor een cleane, smart-casual look: nette jeans, frisse witte sneaker en een licht overshirt. Minimalistisch, comfortabel en direct shoppable.";
  const twist = prompt ? ` Je vraag "${String(prompt).slice(0,120)}${String(prompt).length>120?'…':''}" vertalen we naar stille luxe met rustige tinten en structuur.` : "";
  return base + twist;
}

function sampleProducts() {
  return [
    {
      id: "ABC123",
      retailer: "zalando",
      retailer_sku: "ABC123",
      title: "Overshirt wol blend — ecru",
      image: "https://images.pexels.com/photos/6311653/pexels-photo-6311653.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=2",
      url: "https://www.zalando.nl/voorbeeld?affid=fitfi",
      price: { current: 129.95, original: 159.95 },
      currency: "EUR",
      availability: "in_stock",
      sizes: ["S","M","L"],
      color: "ecru",
      badges: ["Aanrader"],
      reason: "Textuur en kleurmatch met jeans; werkt in lagen."
    },
    {
      id: "BKF-7788",
      retailer: "bijenkorf",
      retailer_sku: "7788",
      title: "Slim jeans mid-indigo",
      image: "https://images.pexels.com/photos/6311397/pexels-photo-6311397.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=2",
      url: "https://www.debijenkorf.nl/voorbeeld?affid=fitfi",
      price: { current: 99.95 },
      currency: "EUR",
      availability: "in_stock",
      sizes: ["29","30","31","32"],
      color: "indigo",
      badges: ["Essentieel"],
      reason: "Net silhouet, subtiele wassing — basis voor smart-casual."
    },
    {
      id: "ZAL-WHT-SNK",
      retailer: "zalando",
      title: "Witte sneaker — strak profiel",
      image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=2",
      url: "https://www.zalando.nl/voorbeeld-sneaker?affid=fitfi",
      price: { current: 89.95 },
      currency: "EUR",
      availability: "in_stock",
      sizes: ["40","41","42","43","44"],
      color: "wit",
      reason: "Frisse basis die het geheel modern en licht houdt."
    },
    {
      id: "BKF-TEE",
      retailer: "bijenkorf",
      title: "Heavyweight T-shirt — off-white",
      image: "https://images.pexels.com/photos/6311670/pexels-photo-6311670.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=2",
      url: "https://www.debijenkorf.nl/voorbeeld-tee?affid=fitfi",
      price: { current: 29.95 },
      currency: "EUR",
      availability: "in_stock",
      sizes: ["S","M","L","XL"],
      color: "off-white",
      reason: "Stevige stof geeft vorm; matcht met overshirt."
    }
  ];
}

export const handler: Handler = async (event) => {
  const origin = event.headers.origin || (event.headers as any).Origin;
  const acceptsSSE = /text\/event-stream/i.test(event.headers.accept || '');
  const traceId = randomUUID();

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

  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  if (!okOrigin(origin)) return { statusCode: 403, body: 'Forbidden' };

  let body: { messages?: Msg[] } = {};
  try { body = JSON.parse(event.body || '{}'); } catch {}

  const user = (body.messages || []).find(m => m.role === 'user');
  const explanation = craftExplanation(user?.content);

  // SSE stream met: meta → chunk (human) → chunk (markers-JSON) → done
  if (acceptsSSE) {
    const enc = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const send = (obj: any) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
        send({ type: 'meta', model: 'fitfi-nova-local', traceId });

        // Kleine human chunk
        send({ type: 'chunk', delta: explanation.slice(0, Math.ceil(explanation.length * 0.6)) });

        // Markers JSON + eventuele resttekst
        const payload = { explanation, products: sampleProducts() };
        const markerChunk = `${START}${JSON.stringify(payload)}${END}`;
        send({ type: 'chunk', delta: markerChunk });

        const rest = explanation.slice(Math.ceil(explanation.length * 0.6));
        if (rest) send({ type: 'chunk', delta: rest });

        send({ type: 'done' });
        controller.close();
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
  }

  // Fallback JSON
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': okOrigin(origin) ? origin! : ORIGINS[0],
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({ explanation, products: sampleProducts(), traceId, mode: 'json' })
  };
};