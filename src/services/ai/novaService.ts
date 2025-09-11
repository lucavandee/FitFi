// src/services/ai/novaService.ts
export type NovaMode = "outfits" | "archetype" | "shop";
export type Role = "system" | "user" | "assistant";
export interface ChatMessage { role: Role; content: string; }

export interface NovaStreamEvent {
  type: "meta" | "chunk" | "done" | "error" | "json";
  model?: string;
  traceId?: string;
  delta?: string;
  data?: any;
}

const START = "<<<FITFI_JSON>>>";
const END   = "<<<END_FITFI_JSON>>>";

export async function* streamChat({
  mode = "outfits",
  messages,
  signal,
  onEvent
}: {
  mode?: NovaMode;
  messages: ChatMessage[];
  signal?: AbortSignal | null;
  onEvent?: (evt: NovaStreamEvent) => void;
}): AsyncGenerator<string, void, unknown> {
  const res = await fetch("/.netlify/functions/nova", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      "x-fitfi-tier": (import.meta.env.VITE_FITFI_TIER || "free").toString(),
      "x-fitfi-uid": getUid(),
    },
    body: JSON.stringify({ mode, messages }),
    signal: signal ?? undefined,
  });

  const ctype = (res.headers.get("content-type") || "").toLowerCase();
  if (!(res.ok && res.body && ctype.includes("text/event-stream"))) {
    onEvent?.({ type: "error" });
    throw new Error("NOVA_SSE_INACTIVE");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let jsonMode = false;
  let jsonBuf = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() || "";

    for (const blk of blocks) {
      const line = blk.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      const payload = line.slice(6).trim();
      let evt: any = null;
      try { evt = JSON.parse(payload); } catch { evt = null; }

      if (evt?.type === "meta") { onEvent?.({ type: "meta", model: evt.model, traceId: evt.traceId }); continue; }
      if (evt?.type === "error") { onEvent?.({ type: "error" }); continue; }
      if (evt?.type === "done")  { onEvent?.({ type: "done" });  continue; }

      const delta = evt?.type === "chunk" ? String(evt.delta ?? "") : "";
      if (!delta) continue;

      // JSON markers capteren in de doorstromende tekst
      if (!jsonMode) {
        const i = delta.indexOf(START);
        if (i >= 0) {
          jsonMode = true;
          jsonBuf = "";
          jsonBuf += delta.slice(i + START.length);
          const human = delta.slice(0, i);
          if (human) { onEvent?.({ type: "chunk", delta: human }); yield human; }
          continue;
        }
      } else {
        const j = delta.indexOf(END);
        if (j >= 0) {
          jsonBuf += delta.slice(0, j);
          try {
            const parsed = JSON.parse(jsonBuf);
            onEvent?.({ type: "json", data: parsed });
          } catch {}
          jsonMode = false;
          const rest = delta.slice(j + END.length);
          if (rest) { onEvent?.({ type: "chunk", delta: rest }); yield rest; }
          continue;
        } else {
          jsonBuf += delta;
          continue;
        }
      }

      onEvent?.({ type: "chunk", delta });
      yield delta;
    }
  }
}

function getUid(): string {
  try {
    const KEY = "fitfi.uid";
    const cur = localStorage.getItem(KEY);
    if (cur) return cur;
    const uid = crypto.randomUUID();
    localStorage.setItem(KEY, uid);
    return uid;
  } catch {
    return "anon";
  }
}