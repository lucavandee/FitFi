export const handler = async () => {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (obj: any) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      // Klein beetje metadata
      send({ type: "meta", model: "fitfi-nova-stub", traceId: `stub-${Date.now()}` });

      // Eén “chunk” zodat de UI netjes laat zien dat er iets terugkomt
      send({
        type: "chunk",
        delta:
          "Nova is tijdelijk offline. We hebben je function endpoint wel gevonden ✔️. " +
          "Zodra de OpenAI-key en backend klaarstaan stroomt hier live advies binnen."
      });

      // Klaar
      send({ type: "done" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // CORS (optioneel, maar kan handig zijn bij lokaal testen)
      "Access-Control-Allow-Origin": "*",
    },
  });
};
