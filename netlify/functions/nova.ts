import { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
    body:
      "event: FITFI_JSON\n" +
      "data: {\"explanation\":\"Welkom bij Nova ✨ — hier komt straks je echte AI output\"}\n\n",
  };
};