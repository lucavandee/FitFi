import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/utils/telemetry";
import { openNovaStream, NovaEvent } from "@/services/nova/novaClient";
import { mockNovaStream } from "@/services/nova/novaMock";

export type ChatMessage = { id: string; role: "user" | "assistant" | "system"; text: string; ts: number };

type Ctx = {
  open: boolean;
  minimized: boolean;
  unread: number;
  setOpen: (v: boolean) => void;
  toggleMinimize: () => void;
  messages: ChatMessage[];
  send: (text: string) => Promise<void>;
  busy: boolean;
  seedWelcomeIfNeeded: () => void;
};

const NovaChatCtx = createContext<Ctx | null>(null);
const USE_DEV_MOCK = import.meta.env.DEV && (import.meta.env.VITE_DEV_MOCK_NOVA ?? "0") === "1";
const STORAGE_KEY = "fitfi:nova:chat";
const WELCOME_SEEDED_KEY = "fitfi:nova:welcomeSeeded";
const uid = () => Math.random().toString(36).slice(2);

function NovaChatProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [unread, setUnread] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const backendProblemRef = useRef(false);

  // restore
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setMessages(parsed.messages || []);
        setUnread(parsed.unread || 0);
      }
    } catch {}
  }, []);
  // persist
  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, unread })); } catch {}
  }, [messages, unread]);

  useEffect(() => { if (open) setUnread(0); }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleMinimize() { setMinimized((m) => !m); track("cta:secondary", { where: "chat-minimize" }); }

  function pushAssistant(text: string) {
    const assistant: ChatMessage = { id: uid(), role: "assistant", text, ts: Date.now() };
    setMessages((m) => [...m, assistant]);
    if (!open) setUnread((u) => u + 1);
  }

  async function send(text: string) {
    if (!text.trim()) return;
    backendProblemRef.current = false;
    const userMsg: ChatMessage = { id: uid(), role: "user", text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setBusy(true);
    track("nova:open", { source: "chat" });

    try {
      if (USE_DEV_MOCK) {
        for await (const e of mockNovaStream()) {
          if (e.type === "FITFI_JSON" && e.phase === "patch" && e.data?.explanation) {
            pushAssistant(e.data.explanation);
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
              if (e.type === "FITFI_JSON") {
                const t = e.data?.explanation || e.data?.text;
                if (t) {
                  pushAssistant(t);
                  track("nova:patch", { source: "chat" });
                }
              }
            },
            onDone: () => track("nova:done", { source: "chat" }),
            onError: () => { backendProblemRef.current = true; },
            onStart: () => {}
          },
          { signal: abortRef.current.signal }
        );
      }
    } finally {
      setBusy(false);
      if (backendProblemRef.current) {
        pushAssistant(
          "⚠️ Onze live-stream is tijdelijk niet bereikbaar. " +
          "Hier is alvast een tip: combineer neutrale basics met één statement piece. 👕✨"
        );
        track("nova:error", { source: "chat" });
      }
    }
  }

  function seedWelcomeIfNeeded() {
    try {
      if (sessionStorage.getItem(WELCOME_SEEDED_KEY) === "1") return;
      const hello: ChatMessage = {
        id: uid(), role: "assistant",
        text: "Hoi! Ik ben Nova. Wil je snelle outfit-inspiratie of een korte kleurcheck? 👗✨",
        ts: Date.now()
      };
      setMessages((m) => [...m, hello]);
      sessionStorage.setItem(WELCOME_SEEDED_KEY, "1");
      setUnread((u) => (open ? u : u + 1));
    } catch {}
  }

  const value = useMemo(() => ({
    open, minimized, unread, setOpen, toggleMinimize, messages, send, busy, seedWelcomeIfNeeded
  }), [open, minimized, unread, messages, busy]);

  return <NovaChatCtx.Provider value={value}>{children}</NovaChatCtx.Provider>;
}

export function useNovaChat() {
  const ctx = useContext(NovaChatCtx);
  if (!ctx) throw new Error("useNovaChat must be used within NovaChatProvider");
  return ctx;
}

export default NovaChatProvider;