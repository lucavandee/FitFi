export type NovaEvent =
  | { type: "started"; tier: string; uid: string; mode: string; model: string }
  | { type: "token"; content: string }
  | { type: "error"; message: string }
  | { type: "done" | "end" }
  | { type: "meta"; json: any };

export function streamNova({
  url = "/.netlify/functions/nova",
  tier = "visitor",
  uid = "anon",
  body
}: {
  url?: string;
  tier?: string;
  uid?: string;
  body: any;
}) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "x-fitfi-tier": tier,
    "x-fitfi-uid": uid,
    "accept": "text/event-stream"
  });

  const controller = new AbortController();
  const signal = controller.signal;

  const listeners = new Set<(ev: NovaEvent) => void>();
  const on = (fn: (ev: NovaEvent) => void) => (listeners.add(fn), () => listeners.delete(fn));
  const emit = (ev: NovaEvent) => listeners.forEach((fn) => fn(ev));

  (async () => {
    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal
    });

    if (!resp.ok || !resp.body) {
      emit({ type: "error", message: `HTTP ${resp.status}` });
      return;
    }

    const reader = resp.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const chunks = buf.split("\n\n");
      buf = chunks.pop() || "";
      for (const raw of chunks) {
        const line = raw.trim();
        if (!line) continue;
        if (line.startsWith(":")) continue; // heartbeat
        if (line.startsWith("data:")) {
          const data = line.slice(5).trim();
          if (data === "<<<FITFI_JSON>>>") {
            // read next data as JSON meta; the server sends it in distinct lines
            // The outer loop will deliver it next; keep a small state machine if needed
            continue;
          }
          if (data === "<<<END_FITFI_JSON>>>") continue;

          try {
            const json = JSON.parse(data);
            if (json && typeof json === "object") {
              if ("type" in json) emit(json as NovaEvent);
              else emit({ type: "meta", json });
            }
          } catch {
            // token stream
            emit({ type: "token", content: data });
          }
        }
      }
    }
  })().catch((e) => emit({ type: "error", message: String(e?.message || e) }));

  return {
    on,
    abort: () => controller.abort()
  };
}