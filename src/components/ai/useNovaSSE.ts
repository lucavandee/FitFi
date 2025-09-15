import { useCallback, useRef, useState } from "react";
import type { NovaEvent, NovaRequest, NovaHeaders } from "./types";
import { track } from "./types";

/**
 * Parseert een binnenkomende SSE "data:" regel.
 * Server stuurt regels met "FITFI_JSON { ... }" + heartbeats.
 */
function parseSSEDataLine(line: string): NovaEvent[] {
  const events: NovaEvent[] = [];
  const trimmed = line.trim();

  if (!trimmed) return events;

  // Heartbeat (lege events of bekende ping)
  if (trimmed === "data: [heartbeat]" || trimmed === "data:[heartbeat]") {
    events.push({ type: "heartbeat", ts: Date.now() });
    return events;
  }

  // Standaard SSE prefix
  const prefix = "data:";
  const content = trimmed.startsWith(prefix) ? trimmed.slice(prefix.length).trim() : trimmed;

  // FITFI_JSON marker (voorkeursformaat)
  const marker = "FITFI_JSON";
  const markerIdx = content.indexOf(marker);
  if (markerIdx !== -1) {
    const jsonStr = content.slice(markerIdx + marker.length).trim();
    try {
      const parsed = JSON.parse(jsonStr);
      // Verwachte velden: { type, ... }
      if (parsed && typeof parsed.type === "string") {
        const t = parsed.type as NovaEvent["type"];
        if (t === "delta" && typeof parsed.delta === "string") {
          events.push({ type: "delta", delta: parsed.delta, ts: parsed.ts ?? Date.now() });
        } else if (t === "complete" && typeof parsed.message === "string") {
          events.push({
            type: "complete",
            message: parsed.message,
            usage: parsed.usage,
            ts: parsed.ts ?? Date.now(),
          });
        } else if (t === "error") {
          events.push({
            type: "error",
            message: parsed.message || "Onbekende fout",
            code: parsed.code,
            ts: parsed.ts ?? Date.now(),
          });
        } else if (
          t === "nova:open" ||
          t === "nova:prefill" ||
          t === "nova:set-context" ||
          t === "nova:prompt-login" ||
          t === "heartbeat"
        ) {
          if (t === "heartbeat") {
            events.push({ type: "heartbeat", ts: parsed.ts ?? Date.now() });
          } else {
            events.push({ ...parsed, ts: parsed.ts ?? Date.now() });
          }
        }
      }
      return events;
    } catch {
      // Valt terug naar vrije-tekst delta
      events.push({ type: "delta", delta: jsonStr, ts: Date.now() });
      return events;
    }
  }

  // Fallback: behandel complete regel als delta
  events.push({ type: "delta", delta: content, ts: Date.now() });
  return events;
}

/**
 * Streamt via POST naar /.netlify/functions/nova met text/event-stream response.
 */
export function useNovaSSE(endpoint = "/.netlify/functions/nova") {
  const controllerRef = useRef<AbortController | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const start = useCallback(
    async (req: NovaRequest, headers?: NovaHeaders, onEvent?: (e: NovaEvent) => void) => {
      if (isLoading) return;
      setLoading(true);
      setLastError(null);
      controllerRef.current?.abort();
      controllerRef.current = new AbortController();

      try {
        track("nova:open");
        const res = await fetch(endpoint, {
          method: "POST",
          signal: controllerRef.current.signal,
          headers: {
            Accept: "text/event-stream",
            "Content-Type": "application/json",
            ...(headers?.["x-fitfi-tier"] ? { "x-fitfi-tier": headers["x-fitfi-tier"]! } : {}),
            ...(headers?.["x-fitfi-uid"] ? { "x-fitfi-uid": headers["x-fitfi-uid"]! } : {}),
          },
          body: JSON.stringify(req),
        });

        if (!res.ok || !res.body) {
          const msg = `SSE response invalid: ${res.status} ${res.statusText}`;
          setLastError(msg);
          onEvent?.({ type: "error", message: msg, ts: Date.now() });
          setLoading(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // SSE events gescheiden door dubbele newline
          let idx: number;
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const chunk = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);

            // Iedere chunk kan meerdere "data:" regels bevatten
            const lines = chunk.split("\n").filter(Boolean);
            for (const line of lines) {
              const events = parseSSEDataLine(line);
              for (const ev of events) {
                onEvent?.(ev);
              }
            }
          }
        }

        // Beëindigd zonder expliciete error → complete event sturen als niets gestuurd is
        onEvent?.({ type: "complete", message: "", ts: Date.now() });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Onbekende streamfout";
        setLastError(msg);
        onEvent?.({ type: "error", message: msg, ts: Date.now() });
      } finally {
        setLoading(false);
      }
    },
    [endpoint, isLoading]
  );

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setLoading(false);
  }, []);

  return { start, stop, isLoading, lastError };
}