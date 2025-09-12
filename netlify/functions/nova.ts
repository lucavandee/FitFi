// netlify/functions/nova.ts
import type { Handler } from "@netlify/functions";
import { randomUUID } from "crypto";

const ORIGINS = ["https://www.fitfi.ai", "https://fitfi.ai", "http://localhost:5173"];
const START = "<<<FITFI_JSON>>>";
const END = "<<<END_FITFI_JSON>>>";

type Role = "system" | "user" | "assistant";
type Msg = { role: Role; content: string };

function okOrigin(o?: string) { return !!o && ORIGINS.includes(o); }
function nonEmptyUser(messages?: Msg[]): string | null {
  if (!Array.isArray(messages)) return null;
  const lastUser = [...messages].reverse().find(m => m?.role === "user");
  const text = (lastUser?.content ?? "").trim();
  return text.length ? text : null;
}

function craftExplanation(prompt?: string) {
  const base = "We kozen voor een cleane, smart-casual look: nette jeans, frisse witte sneaker en een licht overshirt. Minimalistisch, comfortabel en direct shoppable.";
  const twist = prompt ? ` Je vraag "${String(prompt).slice(0,120)}${String(prompt).length>120?"…":""}" vertalen we naar stille luxe met rustige tinten en structuur.` : "";
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

function streamLocal(controller: ReadableStreamDefaultController, enc: TextEncoder, traceId: string, explanation: string) {
  const send = (obj: any) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
  send({ type: "meta", model: "fitfi-nova-local", traceId });

  const head = explanation.slice(0, Math.ceil(explanation.length * 0.6));
  if (head) send({ type: "chunk", delta: head });

  const payload = { explanation, products: sampleProducts() };
  send({ type: "chunk", delta: `${START}${JSON.stringify(payload)}${END}` });

  const tail = explanation.slice(Math.ceil(explanation.length * 0.6));
  if (tail) send({ type: "chunk", delta: tail });

  send({ type: "done" });
}

export const handler: Handler = async (event) => {
  const origin = event.headers.origin || (event.headers as any).Origin;
  const traceId = randomUUID();
  const upstreamEnabled = (process.env.NOVA_UPSTREAM || "").toLowerCase() === "on" && !!process.env.OPENAI_API_KEY;

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": okOrigin(origin) ? origin! : ORIGINS[0],
        "Access-Control-Allow-Headers": "content-type, x-fitfi-tier, x-fitfi-uid",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  if (!okOrigin(origin)) return { statusCode: 403, body: "Forbidden" };

  // Input
  let body: { messages?: Msg[]; mode?: string } = {};
  try { body = JSON.parse(event.body || "{}"); } catch {}
  const userText = nonEmptyUser(body.messages);
  const explanation = craftExplanation(userText || undefined);

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const heartbeat = setInterval(() => controller.enqueue(enc.encode(`event: heartbeat\ndata: {"ts":${Date.now()}}\n\n`)), 15000);
      try {
        // 🔒 Standaard: lokale stream (nooit OpenAI aanroepen als prompt leeg OF upstream disabled)
        if (!upstreamEnabled || !userText) {
          streamLocal(controller, enc, traceId, explanation);
          return;
        }

        // ✅ Upstream pad (alleen als expliciet aan + niet-lege prompt)
        const messages: Msg[] = [
          { role: "system", content: "Nova van FitFi: kort, helder, menselijk. Geef een beknopte uitleg én, indien geschikt, een JSON-blok met products[]." },
          { role: "user", content: userText }
        ];

        const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY || ""}`,
          },
          body: JSON.stringify({
            model: process.env.NOVA_MODEL_OUTFITS || "gpt-4o-mini",
            messages,
            stream: true,
            temperature: 0.7,
          }),
          // @ts-ignore
          duplex: "half",
        });

        if (!upstream.ok || !upstream.body) {
          // OpenAI weigerde (bv. "messages: text content blocks must be non-empty") → lokale fallback
          streamLocal(controller, enc, traceId, explanation);
          return;
        }

        // Stream OpenAI door
        const send = (obj: any) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
        send({ type: "meta", model: "fitfi-nova-openai", traceId });

        const reader = upstream.body.getReader();
        const dec = new TextDecoder();
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = dec.decode(value);
          const lines = chunk.split("\n").map(l => l.trim()).filter(Boolean);
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (data === "[DONE]") continue;
            let json: any = null;
            try { json = JSON.parse(data); } catch {}
            const delta = json?.choices?.[0]?.delta?.content ?? "";
            if (delta) send({ type: "chunk", delta });
          }
        }

        send({ type: "done" });
      } catch {
        // Onbekende fout → alsnog lokale fallback
        streamLocal(controller, enc, traceId, explanation);
      } finally {
        clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream as any, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": okOrigin(origin) ? origin! : ORIGINS[0],
    },
  } as any);
};