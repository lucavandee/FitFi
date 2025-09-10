import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/utils/analytics";
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

const USE_DEV_MOCK = import.meta.env.DEV && (import.meta.env.VITE_DEV_MOCK_NOVA ?? "1") === "1";
const STORAGE_KEY = "fitfi:nova:chat";
const WELCOME_SEEDED_KEY = "fitfi:nova:welcomeSeeded";

function uid() { return Math.random().toString(36).slice(2); }

function NovaChatProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [unread, setUnread] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  // restore session
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
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, unread }));
    } catch {}
  }, [messages, unread]);

  // unread logic
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleMinimize() {
    setMinimized((m) => !m);
    track("cta:secondary", { where: "chat-minimize", to: !minimized });
  }

  async function send(text: string) {
    if (!text.trim()) return;
    track("nova:message-attempt", { messageLength: text.length });
    const userMsg: ChatMessage = { id: uid(), role: "user", text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setBusy(true);
    track("nova:open", { source: "chat" });

    const pushAssistant = (t: string) => {
      const assistant: ChatMessage = { id: uid(), role: "assistant", text: t, ts: Date.now() };
      setMessages((m) => [...m, assistant]);
      if (!open) setUnread((u) => u + 1);
    };

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
              if (e.type === "FITFI_JSON" && (e.data?.explanation || e.data?.text)) {
                pushAssistant(e.data.explanation || e.data.text);
                track("nova:patch", { source: "chat" });
              }
            },
            onDone: () => track("nova:done", { source: "chat" }),
            onError: (e) => {
              pushAssistant("Er ging iets mis. Probeer het nogmaals of specificeer je vraag.");
              track("nova:error", { source: "chat", message: e?.error?.message });
            },
            onStart: () => {}
          },
          { signal: abortRef.current.signal }
        );
      }
      track("nova:message-success", { responseLength: messages[messages.length - 1]?.text?.length || 0 });
    } catch (error) {
      track("nova:message-error", { error: error instanceof Error ? error.message : "Unknown error" });
      const errorMsg: ChatMessage = { 
        id: uid(), 
        role: "assistant", 
        text: "Sorry, ik kan je vraag nu niet beantwoorden. Probeer het later opnieuw of kies een van de suggesties hieronder.", 
        ts: Date.now() 
      };
      setMessages((m) => [...m, errorMsg]);
    } finally {
      setBusy(false);
    }
  }

  // seed welcome once per session
  function seedWelcomeIfNeeded() {
    try {
      if (sessionStorage.getItem(WELCOME_SEEDED_KEY) === "1") return;
      const hello: ChatMessage = {
        id: uid(),
        role: "assistant",
        text: "Hoi! Ik ben Nova. Wil je snelle outfit-inspiratie of een korte kleurcheck? 👗✨",
        ts: Date.now()
      };
      setMessages((m) => [...m, hello]);
      sessionStorage.setItem(WELCOME_SEEDED_KEY, "1");
      setUnread((u) => (open ? u : u + 1));
    } catch {}
  }

  const value = useMemo<Ctx>(() => ({
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