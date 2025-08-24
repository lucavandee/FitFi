import type { NovaOutfitsPayload } from "@/lib/outfitSchema";
import { getUserTier, getUID } from "@/utils/session";

// Custom error types for Nova service
export class NovaAuthError extends Error {
  constructor(message: string = "Authentication required for Nova") {
    super(message);
    this.name = "NovaAuthError";
  }
}

export class NovaQuotaError extends Error {
  constructor(message: string = "Nova quota exceeded") {
    super(message);
    this.name = "NovaQuotaError";
  }
}

export type NovaMode = "outfits" | "archetype" | "shop";
export type Role = "system" | "user" | "assistant";
export interface ChatMessage {
  role: Role;
  content: string;
}

export interface NovaStreamEvent {
  type: "meta" | "chunk" | "done" | "error" | "json";
  model?: string;
  traceId?: string;
  delta?: string;
  data?: NovaOutfitsPayload;
}

const START = "<<<FITFI_JSON>>>";
const END = "<<<END_FITFI_JSON>>>";
const START_LEN = START.length; // 16
const TAIL_HOLD = Math.max(START_LEN - 1, 8); // houd altijd wat staart vast om split markers te vangen

export async function* streamChat({
  mode,
  messages,
  signal,
  onEvent,
  requireAuth = true,
}: {
  mode: NovaMode;
  messages: ChatMessage[];
  signal?: AbortSignal;
  onEvent?: (evt: NovaStreamEvent) => void;
  requireAuth?: boolean;
}): AsyncGenerator<string, void, unknown> {
  const dbg = import.meta.env.VITE_NOVA_DEBUG === "true";

  // Check authentication if required
  if (requireAuth) {
    // Check if user has valid session (basic check)
    const hasValidSession =
      document.cookie.includes("fitfi_uid") ||
      localStorage.getItem("fitfi_uid");
    if (!hasValidSession) {
      onEvent?.({ type: "error" });
      throw new NovaAuthError("Sessie vereist voor Nova");
    }
  }

  // Check quota limits
  const tier = getUserTier();
  const uid = getUID();

  if (!checkQuotaLimit(tier, uid)) {
    onEvent?.({ type: "error" });
    throw new NovaQuotaError(`Quota overschreden voor ${tier} tier`);
  }

  const res = await fetch("/.netlify/functions/nova", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      "x-fitfi-tier": getUserTier(),
      "x-fitfi-uid": getUID(),
    },
    body: JSON.stringify({ mode, messages, stream: true }),
    signal,
  });

  const ctype = (res.headers.get("content-type") || "").toLowerCase();
  if (!(res.ok && res.body && ctype.includes("text/event-stream"))) {
    if (dbg) {
      const txt = await res.text().catch(() => "");
      console.debug("[NOVA] non-SSE", res.status, ctype, txt.slice(0, 200));
    }
    onEvent?.({ type: "error" });
    throw new Error("NOVA_SSE_INACTIVE");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let sseBuf = "";
  let jsonMode = false;
  let jsonBuf = "";
  let textBuf = ""; // menselijk zichtbare tekst die we chunk-veilig opbouwen

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    sseBuf += decoder.decode(value, { stream: true });
    const lines = sseBuf.split("\n");
    sseBuf = lines.pop() || "";

    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith(":") || !line.startsWith("data:")) continue;

      const payload = line.slice(5).trim();
      let evt: any;
      try {
        evt = JSON.parse(payload);
      } catch {
        evt = null;
      }

      const delta = evt?.type === "chunk" ? (evt.delta ?? "") : "";

      // --- JSON marker capture (werkt ook tijdens streaming) ---
      if (delta) {
        if (!jsonMode) {
          // voeg toe aan textBuf en zoek START (ook als START over chunkgrens valt)
          textBuf += delta;
          let i = textBuf.indexOf(START);
          if (i >= 0) {
            // emit alles vóór START
            const human = textBuf.slice(0, i);
            if (human) {
              onEvent?.({ type: "chunk", delta: human });
              yield human;
            }
            // enter JSON-mode
            jsonMode = true;
            jsonBuf = textBuf.slice(i + START_LEN);
            textBuf = "";
          } else {
            // geen START nog → emit bijna alles, houd staart vast voor mogelijke gesplitste marker
            if (textBuf.length > TAIL_HOLD) {
              const emit = textBuf.slice(0, textBuf.length - TAIL_HOLD);
              if (emit) {
                onEvent?.({ type: "chunk", delta: emit });
                yield emit;
              }
              textBuf = textBuf.slice(textBuf.length - TAIL_HOLD);
            }
          }
        } else {
          // in JSON-mode: append en zoek END (kan ook over meerdere chunks)
          jsonBuf += delta;
          let j = jsonBuf.indexOf(END);
          if (j >= 0) {
            const jsonPayload = jsonBuf.slice(0, j);
            try {
              const parsed = JSON.parse(jsonPayload) as NovaOutfitsPayload;
              onEvent?.({ type: "json", data: parsed });
            } catch (e) {
              if (dbg) console.warn("[NOVA] JSON parse failed", e);
            }
            // verlaat JSON-mode, verwerk rest na END als normale tekst
            const rest = jsonBuf.slice(j + END.length);
            jsonMode = false;
            jsonBuf = "";
            if (rest) {
              textBuf += rest;
              // probeer direct START opnieuw te vinden in rest
              let k = textBuf.indexOf(START);
              if (k >= 0) {
                const human = textBuf.slice(0, k);
                if (human) {
                  onEvent?.({ type: "chunk", delta: human });
                  yield human;
                }
                jsonMode = true;
                jsonBuf = textBuf.slice(k + START_LEN);
                textBuf = "";
              }
            }
          }
          // als END nog niet gevonden is: niets tonen (JSON blijft verborgen)
        }
      }

      if (evt?.type === "meta") {
        onEvent?.({ type: "meta", model: evt.model, traceId: evt.traceId });
      } else if (evt?.type === "done") {
        // flush tail zonder markers
        if (!jsonMode && textBuf) {
          onEvent?.({ type: "chunk", delta: textBuf });
          yield textBuf;
          textBuf = "";
        }
        onEvent?.({ type: "done" });
      } else if (evt?.type === "error") {
        onEvent?.({ type: "error" });
      }
    }
  }
}
