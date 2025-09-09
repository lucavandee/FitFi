import type { Handler } from "@netlify/functions";

const HEARTBEAT_MS = 15000;

function writeEvent(res: any, data: unknown) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function startHeaders() {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-fitfi-tier, x-fitfi-uid",
  };
}

const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, x-fitfi-tier, x-fitfi-uid",
      },
      body: ""
    };
  }

  return {
    statusCode: 200,
    headers: startHeaders(),
    body: "",
    isBase64Encoded: false,
    multiValueHeaders: undefined,
  } as any;
};

// Netlify Node stream workaround: export default and also use onRequest hook
const _handler: Handler = async (event, context) => {
  const response = (context as any).succeed || (context as any).res;
  const res = (response && response.socket && response) || (context as any).res;

  // @ts-ignore netlify streams
  const netlifyRes = (context as any).res || (context as any).succeed;
  const serverRes = netlifyRes || (global as any).res;

  const { rawUrl, body } = event;
  const url = new URL(rawUrl);

  // Start streaming:
  (serverRes || (context as any).res).writeHead(200, startHeaders());

  // Announce start
  writeEvent(serverRes, { type: "FITFI_JSON", phase: "start", ts: Date.now() });

  // Heartbeats
  const hb = setInterval(() => {
    writeEvent(serverRes, { type: "heartbeat", ts: Date.now() });
  }, HEARTBEAT_MS);

  try {
    // Parse input
    const payload = body ? JSON.parse(body) : {};
    const { prompt, context: fitfiContext, tier = "free", uid = "anon" } = payload ?? {};

    // System constraints for explainability (short, human, outfit reasoning)
    const system = [
      "You are Nova, an AI stylist for FitFi.",
      "Always return short, human explanations for outfits (2 sentences).",
      "Keep a friendly, expert tone. Avoid placeholders.",
      "When uncertain, make the best safe assumption and proceed.",
    ].join(" ");

    // Simulated streaming phases (replace with your actual LLM stream integration)
    // PATCH 1: acknowledging context
    writeEvent(serverRes, {
      type: "FITFI_JSON",
      phase: "patch",
      ts: Date.now(),
      data: {
        stage: "context-ack",
        uid,
        tier,
        receivedContext: !!fitfiContext,
      }
    });

    // PATCH 2: suggestion scaffold (outfit explainability stub)
    writeEvent(serverRes, {
      type: "FITFI_JSON",
      phase: "patch",
      ts: Date.now(),
      data: {
        stage: "explainability",
        explanation: "Slank silhouet door tapered broek; koele blauwtinten sluiten aan op je huidondertoon en blijven veelzijdig.",
      }
    });

    // PATCH 3: done
    writeEvent(serverRes, {
      type: "FITFI_JSON",
      phase: "done",
      ts: Date.now(),
      data: { ok: true }
    });

  } catch (e: any) {
    writeEvent(serverRes, {
      type: "FITFI_JSON",
      phase: "error",
      ts: Date.now(),
      error: { message: e?.message || "Nova crashed" }
    });
  } finally {
    clearInterval(hb);
    // small delay to flush
    setTimeout(() => {
      (serverRes || (context as any).res).end();
    }, 20);
  }

  // Netlify requires a return, but stream already sent:
  return {
    statusCode: 200,
    headers: startHeaders(),
    body: ""
  };
};

export { _handler as handler };