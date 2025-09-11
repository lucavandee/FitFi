// src/components/nova/NovaChatProvider.tsx
import React, { createContext, useContext, useMemo, useRef, useState, useCallback } from "react";
import { streamChat, type ChatMessage, type NovaMode, type NovaStreamEvent } from "@/services/ai/novaService";
import type { RailProduct } from "@/services/shop/types";

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
  send: (prompt: string, opts?: { mode?: NovaMode; context?: Record<string, unknown> }) => Promise<void>;

  launch: () => void;
  hide: () => void;
  start: (prompt: string, opts?: { mode?: NovaMode; context?: Record<string, unknown> }) => Promise<void>;
  prompt: (prompt: string, opts?: { mode?: NovaMode; context?: Record<string, unknown> }) => Promise<void>;

  events: { subscribe: (fn: (m: NovaMessage) => void) => () => void };
  products: { subscribe: (fn: (items: RailProduct[]) => void) => () => void; get: () => RailProduct[] };

  __fallback?: boolean;
};

const NovaChatContext = createContext<NovaChatCtx | null>(null);
const msgListeners: Set<(m: NovaMessage) => void> = new Set();
const prodListeners: Set<(p: RailProduct[]) => void> = new Set();

function emitMsg(m: NovaMessage) { for (const fn of Array.from(msgListeners)) try { fn(m); } catch {} }
function emitProds(p: RailProduct[]) { for (const fn of Array.from(prodListeners)) try { fn(p); } catch {} }

const FALLBACK: NovaChatCtx = {
  isOpen: false, status: "disabled",
  open: () => {}, close: () => {}, toggle: () => {},
  setStatus: () => {}, setPrefill: () => {},
  async send() {}, launch() { this.open(); }, hide() { this.close(); },
  start(prompt, opts) { return this.send(prompt, opts); },
  prompt(prompt, opts) { return this.send(prompt, opts); },
  events: { subscribe: (fn) => { msgListeners.add(fn); return () => msgListeners.delete(fn); } },
  products: { subscribe: (fn) => { prodListeners.add(fn); return () => prodListeners.delete(fn); }, get: () => [] },
  __fallback: true,
};

export function useNovaChat(): NovaChatCtx {
  const ctx = useContext(NovaChatContext);
  return ctx || FALLBACK;
}

export default function NovaChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [status, setStatus] = useState<NovaStatus>("idle");
  const [prefill, setPrefill] = useState<string | undefined>(undefined);
  const [isFallback, setIsFallback] = useState(false);
  const lastProductsRef = useRef<RailProduct[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => { setOpen(false); setStatus("closed"); }, []);
  const toggle = useCallback(() => (isOpen ? close() : open()), [isOpen, open, close]);

  const send = useCallback(async (prompt: string, opts?: { mode?: NovaMode; context?: Record<string, unknown> }) => {
    const text = String(prompt || "").trim();
    if (!text) return;

    setStatus("opening");
    setIsFallback(false);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const messages: ChatMessage[] = [
      { role: "system", content: "Nova van FitFi: kort, helder, menselijk. Encodeer {explanation, products[]} tussen markers." },
      { role: "user", content: text }
    ];

    let acc = "";
    try {
      setStatus("streaming");

      for await (const delta of streamChat({
        mode: opts?.mode || "outfits",
        messages,
        signal: abortRef.current.signal,
        onEvent: (evt: NovaStreamEvent) => {
          if (evt.type === "json" && evt.data) {
            const exp = typeof evt.data.explanation === "string" ? evt.data.explanation : "";
            const prods: RailProduct[] = Array.isArray(evt.data.products) ? evt.data.products : [];
            if (exp) { acc = exp; emitMsg({ role: "assistant", content: acc }); }
            if (prods.length) { lastProductsRef.current = prods; emitProds(prods); }
          }
        }
      })) {
        acc += delta;
        emitMsg({ role: "assistant", content: acc });
      }

      setStatus("idle");
    } catch {
      setStatus("error");
      setIsFallback(true);
      emitMsg({
        role: "assistant",
        content: "Kleine hapering in de stream. Toch een voorstel: smart-casual met nette jeans, witte sneaker en licht overshirt — rustig, modern en shoppable."
      });
    } finally {
      abortRef.current = null;
    }
  }, []);

  const value = useMemo<NovaChatCtx>(() => ({
    isOpen, status, prefill,
    open, close, toggle, setStatus, setPrefill,
    send, launch: open, hide: close, start: send, prompt: send,
    events: { subscribe: (fn) => { msgListeners.add(fn); return () => msgListeners.delete(fn); } },
    products: {
      subscribe: (fn) => { prodListeners.add(fn); return () => prodListeners.delete(fn); },
      get: () => lastProductsRef.current
    },
    __fallback: isFallback,
  }), [isOpen, status, prefill, open, close, toggle, send, isFallback]);

  return <NovaChatContext.Provider value={value}>{children}</NovaChatContext.Provider>;
}