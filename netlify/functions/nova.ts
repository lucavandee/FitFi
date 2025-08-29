import type { Handler } from "@netlify/functions";

const DEFAULT_ORIGINS = [
  "https://www.fitfi.ai",
  "https://fitfi.ai",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8888"
];

function okOrigin(origin?: string | null) {
  if (!origin) return false;
  const allowed = (process.env.NOVA_ALLOWED_ORIGINS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const list = allowed.length ? allowed : DEFAULT_ORIGINS;
  return list.includes(origin);
}

function sseChunk(data: string) {
  return `data: ${data}\n\n`;
}

function heartbeat() {
  return `: keep-alive\n\n`;
}

export const handler: Handler = async (event) => {
  const origin = event.headers.origin;
  const corsOrigin = okOrigin(origin) ? (origin as string) : DEFAULT_ORIGINS[0];

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-fitfi-tier, x-fitfi-uid, accept"
      }
    };
  }

  // Simple health (GET)
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": corsOrigin
      },
      body: JSON.stringify({
        ok: true,
        hasKey: !!process.env.OPENAI_API_KEY,
        model: process.env.FITFI_NOVA_MODEL || "gpt-4o-mini"
      })
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": corsOrigin },
      body: "Method Not Allowed"
    };
  }

  // --- Parse request ---
  let body: any = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": corsOrigin },
      body: "Invalid JSON"
    };
  }

  const tier = event.headers["x-fitfi-tier"] || "visitor";
  const uid = event.headers["x-fitfi-uid"] || "anon";
  const mode = body?.mode ?? "outfits";
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> =
    Array.isArray(body?.messages) ? body.messages : [
      { role: "system", content: "You are Nova, an AI stylist for FitFi." },
      { role: "user", content: "Geef een korte begroeting in het Nederlands." }
    ];

  const model = process.env.FITFI_NOVA_MODEL || "gpt-4o-mini";
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": corsOrigin },
      body: "Server misconfigured: OPENAI_API_KEY missing"
    };
  }

  // --- SSE response stream ---
  return new Promise((resolve) => {
    const headers = {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": corsOrigin,
      "X-FitFi-Tier": String(tier),
      "X-FitFi-Uid": String(uid)
    };

    // @ts-ignore Netlify supports async iterables as body with these headers
    const stream = new ReadableStream({
      start: async (controller) => {
        const encoder = new TextEncoder();

        // Intro event
        controller.enqueue(encoder.encode(sseChunk(JSON.stringify({
          type: "started",
          tier,
          uid,
          mode,
          model
        }))));

        // Heartbeat timer
        let hb: any = setInterval(() => {
          controller.enqueue(encoder.encode(heartbeat()));
        }, 15000);

        try {
          // Call OpenAI (native fetch, Node 18+)
          const resp = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model,
              messages,
              temperature: 0.7,
              stream: true
            })
          });

          if (!resp.ok || !resp.body) {
            const errTxt = await resp.text().catch(() => String(resp.status));
            controller.enqueue(encoder.encode(sseChunk(JSON.stringify({
              type: "error",
              message: `OpenAI error: ${resp.status} ${errTxt}`
            }))));
            clearInterval(hb);
            controller.close();
            return;
          }

          const reader = resp.body.getReader();
          const dec = new TextDecoder();
          let buffer = "";

          // Stream OpenAI SSE → proxy as our SSE lines
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += dec.decode(value, { stream: true });

            // OpenAI sends "data: {...}\n\n"
            const parts = buffer.split("\n\n");
            buffer = parts.pop() || "";
            for (const part of parts) {
              const line = part.trim();
              if (!line.startsWith("data:")) continue;
              const json = line.slice(5).trim();
              if (json === "[DONE]") {
                controller.enqueue(encoder.encode(sseChunk(JSON.stringify({ type: "done" }))));
                break;
              }

              try {
                const delta = JSON.parse(json);
                const token = delta?.choices?.[0]?.delta?.content;
                if (typeof token === "string" && token.length) {
                  controller.enqueue(encoder.encode(sseChunk(JSON.stringify({
                    type: "token",
                    content: token
                  }))));
                }
              } catch {
                // ignore malformed chunk
              }
            }
          }

          // Example of structured JSON block (markers) at end (optional)
          // Stuur een klein JSON blok met metadata (handig voor client)
          const meta = {
            tier,
            uid,
            mode,
            timestamp: Date.now()
          };
          controller.enqueue(encoder.encode(sseChunk("<<<FITFI_JSON>>>")));
          controller.enqueue(encoder.encode(sseChunk(JSON.stringify(meta))));
          controller.enqueue(encoder.encode(sseChunk("<<<END_FITFI_JSON>>>")));

          controller.enqueue(encoder.encode(sseChunk(JSON.stringify({ type: "end" }))));

          clearInterval(hb);
          controller.close();
        } catch (err: any) {
          controller.enqueue(encoder.encode(sseChunk(JSON.stringify({
            type: "error",
            message: String(err?.message || err)
          }))));
          clearInterval(hb);
          controller.close();
        }
      }
    });

    resolve({
      statusCode: 200,
      headers,
      body: stream as any
    });
  });
};

export default handler;