/**
 * Nova Router – client util voor SSE-gesprekken met de Netlify function.
 * 
 * Post naar /.netlify/functions/nova met verplichte headers.
 * Parse SSE en yield berichten als async iterator.
 * Ondersteunt FITFI_JSON-blokken (tussen <<<FITFI_JSON>>> /* placeholder removed */ <<<END_FITFI_JSON>>>).
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

/**
 * Start een Nova-gesprek via SSE en yield events.
 * 
 * Gebruik:
 * ```
 * for await (const ev of novaStream({ prompt, context, tier, uid })) { /* placeholder removed */ }
 * ```
 */
export async function* novaStream(req: NovaRequest): AsyncGenerator<NovaEvent, void, unknown> {
  const endpoint = (import.meta.env.VITE_FITFI_NOVA_ENDPOINT as string) || "/.netlify/functions/nova";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream",
  };
  if (req.tier) headers["x-fitfi-tier"] = req.tier;
  if (req.uid) headers["x-fitfi-uid"] = req.uid;

  const body = JSON.stringify({
    prompt: req.prompt,
    context: req.context ?? {},
  });

  const resp = await fetch(endpoint, {
    method: "POST",
    headers,
    body,
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

  // SSE loop
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Verwerk per regel
    const lines = buffer.split(/\r?\n/);
    // Laatste stuk kan incompleet zijn → bewaar
    buffer = lines.pop() ?? "";

    for (const raw of lines) {
      const line = raw.trim();

      // FITFI JSON blokken
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
            const obj = JSON.parse(trimmed);
            yield { type: "json", data: obj };
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

      // Standaard SSE: "data: /* placeholder removed */"
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

/**
 * Helper: haal volledige tekstrespons op (buffer alle text-events).
 */
export async function novaAsk(req: NovaRequest): Promise<string> {
  const chunks: string[] = [];
  for await (const ev of novaStream(req)) {
    if (ev.type === "text") chunks.push(ev.data);
  }
  return chunks.join("");
}

export default { novaStream, novaAsk };