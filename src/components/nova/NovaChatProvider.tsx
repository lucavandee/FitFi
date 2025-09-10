// src/components/nova/NovaChatProvider.tsx
import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { track } from "@/utils/telemetry";

export type NovaStatus = "idle" | "opening" | "streaming" | "error" | "closed" | "disabled";

export type NovaChatCtx = {
  /** UI state */
  isOpen: boolean;
  status: NovaStatus;
  prefill?: string;

  /** Actions */
  open: () => void;
  close: () => void;
  toggle: () => void;
  setStatus: (s: NovaStatus) => void;
  setPrefill: (t?: string) => void;
  send: (prompt: string, opts?: Record<string, unknown>) => Promise<void>;

  /** Aliassen voor bredere compatibiliteit (sommige call-sites gebruiken andere namen) */
  launch: () => void;
  hide: () => void;
  start: (prompt: string, opts?: Record<string, unknown>) => Promise<void>;
  prompt: (prompt: string, opts?: Record<string, unknown>) => Promise<void>;

  /** true als we in fallback/no-op modus zitten */
  __fallback?: boolean;
};

const NovaChatContext = createContext<NovaChatCtx | null>(null);

/** No-op fallback die NIET crasht als de provider ontbreekt. */
const FALLBACK: NovaChatCtx = {
  isOpen: false,
  status: "disabled",
  prefill: undefined,
  open: () => {
    if (import.meta.env.DEV) console.warn("[NovaChat] Provider ontbreekt — open() noop");
  },
  close: () => {
    if (import.meta.env.DEV) console.warn("[NovaChat] Provider ontbreekt — close() noop");
  },
  toggle: () => {
    if (import.meta.env.DEV) console.warn("[NovaChat] Provider ontbreekt — toggle() noop");
  },
  setStatus: () => {
    if (import.meta.env.DEV) console.warn("[NovaChat] Provider ontbreekt — setStatus() noop");
  },
  setPrefill: () => {
    if (import.meta.env.DEV) console.warn("[NovaChat] Provider ontbreekt — setPrefill() noop");
  },
  async send(prompt: string) {
    if (import.meta.env.DEV) console.warn("[NovaChat] Provider ontbreekt — send() noop:", prompt);
    track("nova:prompt-login"); // behoud event voor funnels
  },
  // aliassen
  launch() { this.open(); },
  hide() { this.close(); },
  async start(prompt: string, opts?: Record<string, unknown>) { return this.send(prompt, opts); },
  async prompt(prompt: string, opts?: Record<string, unknown>) { return this.send(prompt, opts); },
  __fallback: true,
};

/** Hook: geeft NOOIT meer een throw; valt veilig terug op FALLBACK. */
export function useNovaChat(): NovaChatCtx {
  const ctx = useContext(NovaChatContext);
  if (!ctx) {
    if (import.meta.env.DEV) console.warn("[NovaChat] useNovaChat buiten provider — fallback actief");
    return FALLBACK;
  }
  return ctx;
}

type ProviderProps = { children: React.ReactNode };

export function NovaChatProvider({ children }: ProviderProps) {
  const [isOpen, setOpen] = useState(false);
  const [status, setStatus] = useState<NovaStatus>("idle");
  const [prefill, setPrefill] = useState<string | undefined>(undefined);

  const open = useCallback(() => {
    setOpen(true);
    setStatus("opening");
    track("nova:open");
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setStatus("closed");
    track("nova:close");
  }, []);

  const toggle = useCallback(() => {
    setOpen((v) => {
      const next = !v;
      track(next ? "nova:open" : "nova:close");
      return next;
    });
  }, []);

  const send = useCallback(async (prompt: string, opts?: Record<string, unknown>) => {
    // Hier kun je later je echte stream-start callen (novaClient)
    // Voor nu: registreer telemetry en zet een plausibele status-cyclus.
    track("nova:prefill", { hasPrefill: !!prefill });
    track("nova:set-context", opts || {});
    track("nova:prompt", { len: prompt?.length || 0 });

    setStatus("streaming");
    // Simuleer minimale latency in dev; in prod meteen klaarzetten
    await Promise.resolve();
    setStatus("idle");
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
    // aliassen
    launch: open,
    hide: close,
    start: send,
    prompt: send,
    __fallback: false,
  }), [isOpen, status, prefill, open, close, toggle, send]);

  return (
    <NovaChatContext.Provider value={value}>
      {children}
    </NovaChatContext.Provider>
  );
}

NovaChatProvider.displayName = "NovaChatProvider";
export default NovaChatProvider;