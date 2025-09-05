/**
 * Nova Router – SSE client richting Netlify function.
 * 
 * Markers voor JSON-blokken: <<<FITFI_JSON>>> ... <<<END_FITFI_JSON>>>.
 */
export type NovaTier = "visitor" | "member" | "plus" | "founder";

export type NovaEvent =
  | { type: "open" }
  | { type: "text"; data: string }
  | { type: "json"; data: unknown }
  | { type: "error"; error: string }
  | { type: "done" };

export type NovaRequest = {
  prompt: string;
  context?: Record<string, unknown>;
  tier?: NovaTier;
  uid?: string;
  signal?: AbortSignal;
};

export async function* novaStream(req: NovaRequest): AsyncGenerator<NovaEvent, void, unknown> {
  const endpoint = (import.meta.env.VITE_FITFI_NOVA_ENDPOINT as string) || "/.netlify/functions/nova";
  const headers: Record<string, string> = { 
    "Content-Type": "application/json", 
    Accept: "text/event-stream" 
  };
  if (req.tier) headers["x-fitfi-tier"] = req.tier;
  if (req.uid) headers["x-fitfi-uid"] = req.uid;

  const resp = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt: req.prompt, context: req.context ?? {} }),
    signal: req.signal,
  });

  if (!resp.ok || !resp.body) {
    yield { type: "error", error: `Nova status ${resp.status}` };
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder("utf-8");

  yield { type: "open" };

  let buffer = "";
  let inJsonBlock = false;
  let jsonBuf = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const raw of lines) {
      const line = raw.trim();

      if (line.includes("<<<FITFI_JSON>>>")) {
        inJsonBlock = true;
        jsonBuf = "";
        continue;
      }
      if (line.includes("<<<END_FITFI_JSON>>>")) {
        inJsonBlock = false;
        const trimmed = jsonBuf.trim();
        if (trimmed) {
          try {
            yield { type: "json", data: JSON.parse(trimmed) };
          } catch (e: any) {
            yield { type: "error", error: `JSON parse error: ${e?.message || String(e)}` };
          }
        }
        jsonBuf = "";
        continue;
      }
      if (inJsonBlock) {
        jsonBuf += line + "\n";
        continue;
      }

      if (line.startsWith("data:")) {
        const text = line.slice(5).trim();
        if (text === "[DONE]") {
          yield { type: "done" };
          return;
        }
        if (text) yield { type: "text", data: text };
      }
    }
  }

  yield { type: "done" };
}

export async function novaAsk(req: NovaRequest): Promise<string> {
  const chunks: string[] = [];
  for await (const ev of novaStream(req)) {
    if (ev.type === "text") chunks.push(ev.data);
  }
  return chunks.join("");
}

export default { novaStream, novaAsk };