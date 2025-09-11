// netlify/functions/nova.ts
/**
 * Nova SSE Function
 * - POST /.netlify/functions/nova
 * - Headers: x-fitfi-tier, x-fitfi-uid
 * - Response: text/event-stream (fallback: JSON)
 *
 * Geen externe API nodig: we genereren een plausibele uitleg on-the-fly.
 */

type ReqBody = { prompt?: string; context?: Record<string, unknown> };

const encoder = new TextEncoder();

function sseChunk(event: string, data: any) {
  return encoder.encode(`event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`);
}

function craftExplanation(prompt?: string, ctx?: Record<string, unknown>) {
  const gender = (ctx?.["gender"] as string) || "";
  const base =
    "We kozen voor een cleane, smart-casual look: nette jeans, frisse witte sneaker en een licht overshirt. Minimalistisch, comfortabel en direct shoppable.";

  const twist =
    typeof prompt === "string" && prompt.length > 0
      ? ` Je vraag "${prompt.slice(0, 120)}${prompt.length > 120 ? "…" : ""}" vertalen we naar stille luxe: rustige kleuren, goede pasvorm, en materialen met structuur.`
      : "";

  const g =
    gender === "female"
      ? " Subtiel vrouwelijk accent met een getailleerd silhouet en zachte tinten."
      : gender === "male"
      ? " Strak mannelijk silhouet met nette verhoudingen."
      : "";

  return base + twist + g;
}

export async function handler(event: any) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body: ReqBody = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    body = {};
  }

  const wantsSSE =
    (event.headers?.accept || "").toLowerCase().includes("text/event-stream") &&
    typeof (globalThis as any).ReadableStream !== "undefined";

  const explanation = craftExplanation(body.prompt, body.context || {});
  const uid = event.headers?.["x-fitfi-uid"] || "anon";

  // Fallback naar 1x JSON als SSE niet kan
  if (!wantsSSE) {
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-cache",
        "access-control-allow-origin": "*",
      },
      body: JSON.stringify({ explanation, uid, mode: "json" }),
    };
  }

  const stream = new ReadableStream({
    start(controller) {
      // Handshake heartbeat
      controller.enqueue(sseChunk("heartbeat", { ts: Date.now() }));

      // Eerste patch
      controller.enqueue(sseChunk("FITFI_JSON", { explanation }));

      // Een korte "narrowing" patch (simuleer model dat verfijnt)
      const refine = setTimeout(() => {
        controller.enqueue(
          sseChunk("FITFI_JSON", {
            explanation:
              explanation +
              " We kozen zachte contrasten (ecru, steengrijs) en schoenen met een strakke zool voor een moderne, verfijnde look.",
          })
        );
      }, 350);

      // Hartslag elke 10s (failsafe)
      const hb = setInterval(() => {
        try {
          controller.enqueue(sseChunk("heartbeat", { ts: Date.now() }));
        } catch {
          clearInterval(hb);
        }
      }, 10000);

      // Afronden
      const done = setTimeout(() => {
        controller.enqueue(sseChunk("done", { ok: true }));
        clearInterval(hb);
        clearTimeout(refine);
        controller.close();
      }, 900);

      // Als de client afbreekt
      (event as any).rawUrl && (event as any).isBase64Encoded; // no-op to keep bundlers from pruning
    },
    cancel() {
      // nothing required; timers cleared in normal path
    },
  });

  return new Response(stream as any, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "access-control-allow-origin": "*",
    },
    status: 200,
  } as any);
}