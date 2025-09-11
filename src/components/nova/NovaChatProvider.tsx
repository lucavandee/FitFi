// src/components/nova/NovaChatProvider.tsx
import React, { createContext, useContext, useMemo, useRef, useState, useCallback } from "react";
import { streamChat, type ChatMessage, type NovaMode, type NovaStreamEvent } from "@/services/ai/novaService";
import type { Product } from "@/types/product";

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
  products: { subscribe: (fn: (items: Product[]) => void) => () => void };

  __fallback?: boolean;
};

const NovaChatContext = createContext<NovaChatCtx | null>(null);
const textListeners: Set<(m: NovaMessage) => void> = new Set();
const productListeners: Set<(items: Product[]) => void> = new Set();

function emitText(m: NovaMessage) { for (const fn of Array.from(textListeners)) try { fn(m); } catch {} }
function emitProducts(items: Product[]) { for (const fn of Array.from(productListeners)) try { fn(items); } catch {} }

const FALLBACK: NovaChatCtx = {
  isOpen: false, status: "disabled",
  open: () => {}, close: () => {}, toggle: () => {},
  setStatus: () => {}, setPrefill: () => {},
  async send() {}, launch() { this.open(); }, hide() { this.close(); },
  start(prompt, opts) { return this.send(prompt, opts); },
  prompt(prompt, opts) { return this.send(prompt, opts); },
  events: { subscribe: (fn) => { textListeners.add(fn); return () => textListeners.delete(fn); } },
  products: { subscribe: (fn) => { productListeners.add(fn); return () => productListeners.delete(fn); } },
  __fallback: true,
};

export function useNovaChat(): NovaChatCtx {
  const ctx = useContext(NovaChatContext);
  return ctx || FALLBACK;
}

function NovaChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [status, setStatus] = useState<NovaStatus>("idle");
  const [prefill, setPrefill] = useState<string | undefined>(undefined);
  const [isFallback, setIsFallback] = useState(false);
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
      { role: "system", content: "Nova van FitFi: kort, helder, menselijk. Geef een beknopte uitleg én, indien geschikt, een JSON-blok met products[]." },
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
            if (typeof evt.data.explanation === "string") {
              acc = evt.data.explanation;
              emitText({ role: "assistant", content: acc });
            }
            if (Array.isArray(evt.data.products) && evt.data.products.length) {
              emitProducts(evt.data.products as Product[]);
            }
          }
        }
      })) {
        acc += delta;
        emitText({ role: "assistant", content: acc });
      }

      setStatus("idle");
    } catch {
      setStatus("error");
      setIsFallback(true);
      emitText({
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
    events: { subscribe: (fn) => { textListeners.add(fn); return () => textListeners.delete(fn); } },
    products: { subscribe: (fn) => { productListeners.add(fn); return () => productListeners.delete(fn); } },
    __fallback: isFallback,
  }), [isOpen, status, prefill, open, close, toggle, send, isFallback]);

  return <NovaChatContext.Provider value={value}>{children}</NovaChatContext.Provider>;
}

export default NovaChatProvider;
export { NovaChatProvider }; // <-- named export toegevoegd