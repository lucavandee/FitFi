// src/services/nova/novaClient.ts
export type NovaEvent =
  | { type: "heartbeat"; ts: number }
  | { type: "meta"; model: string; traceId: string }
  | { type: "chunk"; delta: string }
  | { type: "done"; data?: any }
  | { type: "error"; message: string; detail?: string; traceId?: string };

export type NovaHandlers = {
  onStart?: () => void;
  onMeta?: (e: NovaEvent & { type: "meta" }) => void;
  onChunk?: (e: NovaEvent & { type: "chunk" }) => void;
  onDone?: (e?: NovaEvent) => void;
  onError?: (e: NovaEvent & { type: "error" }) => void;
  onHeartbeat?: (e: NovaEvent & { type: "heartbeat" }) => void;
};

const START_MARKER = '<<<FITFI_JSON>>>';
const END_MARKER = '<<<END_FITFI_JSON>>>';

export async function openNovaStream(
  endpoint: string,
  payload: { mode?: string; messages?: Array<{ role: string; content: string }> },
  handlers: NovaHandlers,
  fetchInit?: RequestInit & { signal?: AbortSignal }
) {
  const ctrl = new AbortController();
  const signal = fetchInit?.signal ?? ctrl.signal;

  // Get real user ID if authenticated, otherwise use tracking UID
  let uid = "anon";
  try {
    const userStr = localStorage.getItem("fitfi_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.id) {
        uid = user.id; // Real authenticated user ID
      } else {
        uid = getOrCreateUid(); // Fallback to tracking UID
      }
    } else {
      uid = getOrCreateUid(); // Fallback to tracking UID
    }
  } catch (e) {
    uid = getOrCreateUid(); // Fallback to tracking UID
  }

  const tier = (import.meta.env.VITE_FITFI_TIER || "free").toString();

  handlers.onStart?.();

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "text/event-stream",
        "x-fitfi-tier": tier,
        "x-fitfi-uid": uid,
      },
      body: JSON.stringify(payload || {}),
      signal,
      ...fetchInit,
    });

    const ctype = (res.headers.get("content-type") || "").toLowerCase();

    // Fallback: geen SSE? Dan 1x JSON lezen
    if (!ctype.includes("text/event-stream")) {
      const data = await res.json().catch(() => ({}));
      handlers.onChunk?.({ type: "chunk", delta: data.content || "Nova (fallback): geen streaming beschikbaar." });
      handlers.onDone?.({ type: "done", data: { ok: true, mode: "json" } });
      return () => ctrl.abort();
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let fullText = "";

    const flushBlocks = () => {
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";
      for (const block of parts) {
        const ev = parseSSEBlock(block);
        if (!ev) continue;

        switch (ev.type) {
          case "heartbeat":
            handlers.onHeartbeat?.(ev);
            break;
          case "meta":
            handlers.onMeta?.(ev);
            break;
          case "chunk":
            fullText += ev.delta;
            handlers.onChunk?.(ev);
            // Check voor FITFI_JSON markers in de volledige tekst
            checkForStructuredData(fullText, handlers);
            break;
          case "done":
            handlers.onDone?.(ev);
            break;
          case "error":
            handlers.onError?.(ev);
            break;
        }
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      flushBlocks();
    }

    // closing tail
    if (buffer) {
      buffer += "\n\n";
      flushBlocks();
    }

    handlers.onDone?.({ type: "done", data: { ok: true, mode: "sse" } });
  } catch (err: any) {
    handlers.onError?.({ type: "error", message: err?.message || "SSE-verbinding mislukt" });
  }

  return () => ctrl.abort();
}

function parseSSEBlock(block: string): NovaEvent | null {
  const lines = block.split("\n").map((l) => l.trim());
  let ev = "message";
  const data: string[] = [];

  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith(":")) continue; // comment/heartbeat
    if (line.startsWith("event:")) {
      ev = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      data.push(line.slice(5).trim());
    }
  }

  const raw = data.join("\n");
  let json: any = {};
  try {
    json = raw ? JSON.parse(raw) : {};
  } catch {
    json = { text: raw };
  }

  if (ev === "heartbeat") return { type: "heartbeat", ts: Number(json?.ts ?? Date.now()) };
  
  // Parse verschillende event types
  if (json.type === "meta") return { type: "meta", model: json.model, traceId: json.traceId };
  if (json.type === "chunk") return { type: "chunk", delta: json.delta || "" };
  if (json.type === "done") return { type: "done", data: json };
  if (json.type === "error") return { type: "error", message: json.message || "Onbekende fout", detail: json.detail, traceId: json.traceId };

  return null;
}

function checkForStructuredData(fullText: string, handlers: NovaHandlers) {
  const startIdx = fullText.indexOf(START_MARKER);
  const endIdx = fullText.indexOf(END_MARKER);
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const jsonStr = fullText.slice(startIdx + START_MARKER.length, endIdx);
    try {
      const parsed = JSON.parse(jsonStr);
      // Emit als chunk voor backwards compatibility
      if (parsed.explanation) {
        handlers.onChunk?.({ type: "chunk", delta: `\n\n[Structured] ${parsed.explanation}` });
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
}

function getOrCreateUid(): string {
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