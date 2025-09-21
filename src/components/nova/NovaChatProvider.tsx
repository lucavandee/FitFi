import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { streamChat, NovaEvent, NovaStreamOpts } from "@/services/ai/novaService";

export type ChatMessage = { id: string; role: "user" | "assistant" | "system"; content: string };
type SendOpts = { prefaceSystem?: string };

type NovaChatContextValue = {
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  sending: boolean;
  error: string | null;
  messages: ChatMessage[];
  send: (text: string, opts?: SendOpts) => Promise<void>;
  reset: () => void;
};

const NovaChatContext = createContext<NovaChatContextValue | null>(null);

export function NovaChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hi! Zullen we je stijl scherp zetten? 👋 Vertel: voor welke situatie zoeken we een outfit?",
    },
  ]);

  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setError(null);
    setSending(false);
    setMessages([
      {
        id: "welcome-1",
        role: "assistant",
        content:
          "Hi! Zullen we je stijl scherp zetten? 👋 Vertel: voor welke situatie zoeken we een outfit?",
      },
    ]);
  }, []);

  const send = useCallback(
    async (text: string, opts?: SendOpts) => {
      const content = (text ?? "").trim();
      if (!content) {
        // Geen lege berichten naar de SSE-backend sturen.
        return;
      }
      setError(null);
      setSending(true);

      const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content };
      setMessages((prev) => [...prev, userMsg]);

      const controller = new AbortController();
      abortRef.current = controller;

      const onEvent = (ev: NovaEvent) => {
        if (ev.type === "delta") {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            // Als de laatste geen assistant is, start een nieuwe; anders append.
            if (!last || last.role !== "assistant") {
              return [...prev, { id: crypto.randomUUID(), role: "assistant", content: ev.text ?? "" }];
            }
            const updated = [...prev];
            updated[updated.length - 1] = { ...last, content: (last.content ?? "") + (ev.text ?? "") };
            return updated;
          });
        } else if (ev.type === "done") {
          // no-op
        } else if (ev.type === "error") {
          setError("Er ging iets mis met de chatverbinding.");
        }
      };

      // Bouw messages-array (optionele system-preface voor consistentie)
      const convo: ChatMessage[] = [];
      if (opts?.prefaceSystem) {
        convo.push({ id: "sys", role: "system", content: opts.prefaceSystem });
      }
      // Houd geschiedenis compact: laatste 8 regels + nieuw bericht
      const history = messages.slice(-8).map(({ role, content }) => ({ id: crypto.randomUUID(), role, content }));
      convo.push(...history, { id: userMsg.id, role: "user", content });

      try {
        const iter = streamChat({
          mode: "style",
          messages: convo.map(({ role, content }) => ({ role, content })),
          signal: controller.signal,
          onEvent,
        } as NovaStreamOpts);

        for await (const _chunk of iter) {
          // consumptie gebeurt via onEvent (delta)
        }
      } catch (e) {
        setError("De verbinding werd onderbroken.");
      } finally {
        setSending(false);
        abortRef.current = null;
      }
    },
    [messages]
  );

  const value = useMemo<NovaChatContextValue>(
    () => ({ isOpen, setOpen, sending, error, messages, send, reset }),
    [isOpen, sending, error, messages, send, reset]
  );

  return <NovaChatContext.Provider value={value}>{children}</NovaChatContext.Provider>;
}

export function useNovaChat() {
  const ctx = useContext(NovaChatContext);
  if (!ctx) throw new Error("useNovaChat must be used within NovaChatProvider");
  return ctx;
}

// Exporteer ook default om import-drift te voorkomen.
export default NovaChatProvider;