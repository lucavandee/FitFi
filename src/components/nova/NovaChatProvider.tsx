import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import { track } from "@/utils/telemetry";
import { openNovaStream, NovaEvent } from "@/services/nova/novaClient";
import { mockNovaStream } from "@/services/nova/novaMock";

export type ChatMessage = { id: string; role: "user" | "assistant" | "system"; text: string; ts: number };

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  messages: ChatMessage[];
  send: (text: string) => Promise<void>;
  busy: boolean;
};

const NovaChatCtx = createContext<Ctx | null>(null);

const USE_DEV_MOCK = import.meta.env.DEV && (import.meta.env.VITE_DEV_MOCK_NOVA ?? "1") === "1";

function uid() {
  return Math.random().toString(36).slice(2);
}

function NovaChatProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function send(text: string) {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: uid(), role: "user", text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setBusy(true);
    track("nova:open", { source: "chat" });

    try {
      if (USE_DEV_MOCK) {
        for await (const e of mockNovaStream()) {
          if (e.type === "FITFI_JSON" && e.phase === "patch" && e.data?.explanation) {
            const assistant: ChatMessage = {
              id: uid(),
              role: "assistant",
              text: e.data.explanation,
              ts: Date.now()
            };
            setMessages((m) => [...m, assistant]);
            track("nova:patch", { source: "chat" });
          }
        }
        track("nova:done", { source: "chat" });
      } else {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        openNovaStream(
          "/.netlify/functions/nova",
          { prompt: text, context: { channel: "chat" } },
          {
            onPatch: (e: NovaEvent) => {
              if (e.type === "FITFI_JSON" && e.data?.explanation) {
                const assistant: ChatMessage = {
                  id: uid(),
                  role: "assistant",
                  text: e.data.explanation,
                  ts: Date.now()
                };
                setMessages((m) => [...m, assistant]);
                track("nova:patch", { source: "chat" });
              }
            },
            onDone: () => track("nova:done", { source: "chat" }),
            onError: (e) => {
              const assistant: ChatMessage = { id: uid(), role: "system", text: String(e?.error?.message || "Er ging iets mis"), ts: Date.now() };
              setMessages((m) => [...m, assistant]);
              track("nova:error", { source: "chat" });
            },
            onStart: () => {},
            onHeartbeat: () => {}
          },
          { signal: abortRef.current.signal }
        );
      }
    } finally {
      setBusy(false);
    }
  }

  const value = useMemo<Ctx>(() => ({ open, setOpen, messages, send, busy }), [open, messages, busy]);

  return <NovaChatCtx.Provider value={value}>{children}</NovaChatCtx.Provider>;
}

export function useNovaChat() {
  const ctx = useContext(NovaChatCtx);
  if (!ctx) throw new Error("useNovaChat must be used within NovaChatProvider");
  return ctx;
}

export default NovaChatProvider;