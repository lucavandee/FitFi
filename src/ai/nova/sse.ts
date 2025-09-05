// Nova SSE client – POST naar /.netlify/functions/nova met headers x-fitfi-tier en x-fitfi-uid
// Parse streaming tekst + eventuele JSON-blokken tussen <<<FITFI_JSON>>> … <<<END_FITFI_JSON>>>.
import { incTokens } from "@/utils/usage";

export type NovaRole = "system" | "user" | "assistant";
export interface NovaMessage { role: NovaRole; content: string }
export interface NovaStreamOptions {
  uid: string;
  tier: Tier;
  messages: NovaMessage[];
  onToken: (t: string) => void;
  onDone?: (finalText: string) => void;
  onJson?: (obj: unknown) => void;   // voor bijv. tool-calls / metadata
  onError?: (e: unknown) => void;
  meta?: Record<string, unknown>;
  signal?: AbortSignal;
}

function approxTokensFromChars(chars: number) {
  // ruwe schatting 1 token ≈ 4 chars
  return Math.max(1, Math.floor(chars / 4));
}

export default async function novaStream(opts: NovaStreamOptions) {
  const ctrl = new AbortController();
  const signal = opts.signal || ctrl.signal;

  let final = "";
  try {
    const res = await fetch("/.netlify/functions/nova", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
        "x-fitfi-tier": opts.tier,
        "x-fitfi-uid": opts.uid,
      },
      body: JSON.stringify({ messages: opts.messages, meta: opts.meta || {} }),
      signal,
    });

    if (!res.ok || !res.body) throw new Error(`Nova HTTP ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Eerst speciale JSON-blokken afvangen
      while (buffer.includes("<<<FITFI_JSON>>>") && buffer.includes("<<<END_FITFI_JSON>>>")) {
        const start = buffer.indexOf("<<<FITFI_JSON>>>");
        const end = buffer.indexOf("<<<END_FITFI_JSON>>>", start);
        if (end === -1) break;
        const before = buffer.slice(0, start);
        const jsonBlock = buffer.slice(start + "<<<FITFI_JSON>>>".length, end);
        const after = buffer.slice(end + "<<<END_FITFI_JSON>>>".length);
        buffer = before + after;
        try { opts.onJson && opts.onJson(JSON.parse(jsonBlock)); } catch { /* ignore parse errors */ }
      }

      // Daarna klassieke SSE "data:" lijnen verwerken
      const parts = buffer.split("\n\n");
      // Laatste stukje kan incompleet zijn -> terugzetten in buffer
      buffer = parts.pop() || "";
      for (const chunk of parts) {
        const lines = chunk.split("\n").filter(Boolean);
        for (const ln of lines) {
          if (ln.startsWith("data:")) {
            const data = ln.slice(5).trimStart();
            if (data === "[DONE]") {
              // afsluiter
              buffer = "";
              break;
            }
            // normale tekst-token
            opts.onToken(data);
            final += data;
            incTokens(opts.uid, approxTokensFromChars(data.length));
          }
        }
      }
    }

    opts.onDone && opts.onDone(final);
  } catch (e) {
    opts.onError && opts.onError(e);
  }

  return { abort: () => ctrl.abort(), get text() { return final; } };
}