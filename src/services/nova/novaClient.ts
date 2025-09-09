export type NovaEvent =
  | { type: "FITFI_JSON"; phase: "start" | "patch" | "done" | "error"; ts: number; data?: any; error?: any }
  | { type: "heartbeat"; ts: number };

export type NovaHandlers = {
  onStart?: (e: NovaEvent) => void;
  onPatch?: (e: NovaEvent) => void;
  onDone?: (e: NovaEvent) => void;
  onError?: (e: NovaEvent) => void;
  onHeartbeat?: (e: NovaEvent) => void;
};

export function openNovaStream(
  endpoint: string,
  payload: Record<string, any>,
  handlers: NovaHandlers,
  opts: { signal?: AbortSignal } = {}
) {
  const { onStart, onPatch, onDone, onError, onHeartbeat } = handlers;

  const ctrl = new AbortController();
  const signal = opts.signal ?? ctrl.signal;

  const ev = new EventSourcePolyfill(endpoint, {
    headers: { "Content-Type": "application/json" },
    payload: JSON.stringify(payload),
    method: "POST",
    withCredentials: false
  });

  function close() {
    try { ev.close(); } catch {}
    try { ctrl.abort(); } catch {}
  }

  ev.onmessage = (msg: MessageEvent) => {
    try {
      const data = JSON.parse(msg.data) as NovaEvent;
      if (data.type === "FITFI_JSON") {
        if (data.phase === "start") onStart?.(data);
        else if (data.phase === "patch") onPatch?.(data);
        else if (data.phase === "done") onDone?.(data);
        else if (data.phase === "error") onError?.(data);
      } else if (data.type === "heartbeat") {
        onHeartbeat?.(data);
      }
    } catch (e) {
      // Swallow JSON parse errors silently
    }
  };

  ev.onerror = (e) => {
    console.error("🔴 Nova EventSource error", e);
    onError?.({ type: "FITFI_JSON", phase: "error", ts: Date.now(), error: { message: "stream-error" } });
    close();
  };

  signal.addEventListener("abort", () => {
    close();
  });

  return { close };
}

/**
 * Super-small EventSource polyfill that supports POST by upgrading via fetch.
 * If your environment already has an EventSource that supports POST, replace this.
 */
class EventSourcePolyfill {
  private url: string;
  private opts: any;
  private controller: AbortController;
  private reader?: ReadableStreamDefaultReader<Uint8Array>;
  public onmessage: (ev: MessageEvent) => void = () => {};
  public onerror: (ev?: any) => void = () => {};

  constructor(url: string, opts: any) {
    this.url = url;
    this.opts = opts;
    this.controller = new AbortController();
    this.start();
  }

  private async start() {
    try {
      const res = await fetch(this.url, {
        method: this.opts.method || "POST",
        headers: this.opts.headers || {},
        body: this.opts.payload || undefined,
        signal: this.controller.signal
      });
      if (!res.ok || !res.body) {
        this.onerror(new Error("Bad response"));
        return;
      }
      this.reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const chunk = await this.reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          const line = part.trim();
          if (line.startsWith("data:")) {
            const data = line.slice(5).trim();
            this.onmessage(new MessageEvent("message", { data }));
          }
        }
      }
    } catch (e) {
      this.onerror(e);
    }
  }

  public close() {
    try { this.reader?.cancel(); } catch {}
    try { this.controller.abort(); } catch {}
  }
}