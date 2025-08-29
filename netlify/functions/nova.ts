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

export const handler: Handler = async (event) => {
  const origin = event.headers.origin;
  const corsOrigin = okOrigin(origin) ? (origin as string) : DEFAULT_ORIGINS[0];

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

  // Health (GET)
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

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const mode = body?.mode ?? "outfits";
    const traceId = crypto.randomUUID();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": corsOrigin
      },
      body: JSON.stringify({
        traceId,
        mode,
        content:
          "Nova fallback: streaming staat nu uit. Je request is ontvangen; de function werkt en CORS is in orde."
      })
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": corsOrigin
      },
      body: JSON.stringify({ error: "nova function error", message: String(e?.message || e) })
    };
  }
};

export default handler;