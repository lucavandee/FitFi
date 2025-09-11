// src/components/nova/NovaChatProvider.tsx
import React, { createContext, useContext, useMemo, useRef, useState, useCallback } from "react";
import { track } from "@/utils/telemetry";
import { openNovaStream, NovaEvent } from "@/services/nova/novaClient";

export type NovaStatus = "idle" | "opening" | "streaming" | "error" | "closed" | "disabled";

export type NovaMessage = { role: "assistant" | "system"; content: string };

export type NovaChatCtx = {
  isOpen: boolean;
  status: NovaStatus;
  prefill?: string;

  open: () => void;
  close: () => void;
  toggle: () => void;
  setStatus: (s: NovaStatus) => void;
  setPrefill: (t?: string) => void;
  send: (prompt: string, opts?: Record<string, unknown>) => Promise<void>;

  launch: () => void;
  hide: () => void;
  start: (prompt: string, opts?: Record<string, unknown>) => Promise<void>;
  prompt: (prompt: string, opts?: Record<string, unknown>) => Promise<void>;

  /** PubSub voor inkomende AI-teksten (ChatPanel kan subscriben) */
  events: {
    subscribe: (fn: (m: NovaMessage) => void) => () => void;
  };

  /** true = fallback/demo; false = live */
  __fallback?: boolean;
};

const NovaChatContext = createContext<NovaChatCtx | null>(null);

const listeners: Set<(m: NovaMessage) => void> = new Set();
function emit(m: NovaMessage) {
  for (const fn of Array.from(listeners)) {
    try { fn(m); } catch {}
  }
}

const FALLBACK: NovaChatCtx = {
  isOpen: false,
  status: "disabled",
  open: () => (import.meta.env.DEV ? console.warn("[NovaChat] open() noop") : undefined),
  close: () => (import.meta.env.DEV ? console.warn("[NovaChat] close() noop") : undefined),
  toggle: () => (import.meta.env.DEV ? console.warn("[NovaChat] toggle() noop") : undefined),
  setStatus: () => {},
  setPrefill: () => {},
  async send(prompt: string) {
    if (import.meta.env.DEV) console.warn("[NovaChat] send() noop:", prompt);
    track("nova:prompt-login");
  },
  launch() { this.open(); },
  hide() { this.close(); },
  start(prompt: string, opts?: Record<string, unknown>) { return this.send(prompt, opts); },
  prompt(prompt: string, opts?: Record<string, unknown>) { return this.send(prompt, opts); },
  events: { subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); } },
  __fallback: true,
};

export function useNovaChat(): NovaChatCtx {
  const ctx = useContext(NovaChatContext);
  if (!ctx) return FALLBACK;
  return ctx;
}

type ProviderProps = { children: React.ReactNode };

export default function NovaChatProvider({ children }: ProviderProps) {
  const [isOpen, setOpen] = useState(false);
  const [status, setStatus] = useState<NovaStatus>("idle");
  const [prefill, setPrefill] = useState<string | undefined>(undefined);
  const [isFallback, setIsFallback] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const open = useCallback(() => {
    setOpen(true);
    track("nova:open");
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    setStatus("closed");
    track("nova:close");
  }, []);
  const toggle = useCallback(() => (isOpen ? close() : open()), [isOpen, open, close]);

  const send = useCallback(async (prompt: string, ctx?: Record<string, unknown>) => {
    const text = String(prompt || "").trim();
    if (!text) return;

    setStatus("opening");
    setIsFallback(false);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    // Track + context
    track("nova:prefill", { hasPrefill: !!prefill });
    track("nova:set-context", ctx || {});
    track("nova:prompt", { len: text.length });

    // Start SSE
    await openNovaStream(
      "/.netlify/functions/nova",
      { prompt: text, context: ctx || {} },
      {
        onStart: () => setStatus("streaming"),
        onHeartbeat: () => {},
        onPatch: (e: NovaEvent) => {
          // Verwacht: e.data.explanation
          const exp = (e as any)?.data?.explanation;
          if (typeof exp === "string" && exp.trim()) {
            emit({ role: "assistant", content: exp });
          }
        },
        onDone: () => {
          setStatus("idle");
          track("nova:done");
        },
        onError: (e) => {
          const msg = (e as any)?.error?.message || "Stream-fout";
          setStatus("error");
          setIsFallback(true);
          emit({
            role: "assistant",
            content:
              "Kleine hapering in de stream. Toch een voorstel: ga voor een cleane, smart-casual look met nette jeans, witte sneakers en een licht overshirt.",
          });
          track("nova:error", { message: msg });
        },
      },
      { signal: abortRef.current.signal }
    );
  }, [prefill]);

  const value = useMemo<NovaChatCtx>(() => ({
    isOpen,
    status,
    prefill,
    open,
    close,
    toggle,
    setStatus,
    setPrefill,
    send,
    launch: open,
    hide: close,
    start: send,
    prompt: send,
    events: {
      subscribe: (fn: (m: NovaMessage) => void) => {
        listeners.add(fn);
        return () => listeners.delete(fn);
      }
    },
    __fallback: isFallback,
  }), [isOpen, status, prefill, open, close, toggle, send, isFallback]);

  return (
    <NovaChatContext.Provider value={value}>
      {children}
    </NovaChatContext.Provider>
  );
}