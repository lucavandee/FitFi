import type { Handler } from "@netlify/functions";

export const handler: Handler = async () => ({
  statusCode: 200,
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  },
  body:
    "event: FITFI_JSON\n" +
    'data: {"explanation":"Welkom bij Nova ✨ — SSE function online."}\n\n',
});