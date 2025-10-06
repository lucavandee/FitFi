import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { streamChat, NovaEvent, NovaStreamOpts } from "@/services/ai/novaService";
import { fetchUserContext, buildSystemPrompt, buildContextHeaders, type NovaUserContext } from "@/services/nova/userContext";

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

function getUserId(): string | undefined {
  if (typeof window === "undefined") return undefined;

  const userStr = localStorage.getItem("fitfi_user");
  if (!userStr) return undefined;

  try {
    const user = JSON.parse(userStr);
    return user?.id;
  } catch {
    return undefined;
  }
}

export function NovaChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<NovaUserContext | null>(null);
  const [contextLoading, setContextLoading] = useState(true);

  const getWelcomeMessage = useCallback(() => {
    if (!userContext) {
      return "Hi! Ik ben Nova, je style assistent. Hoe kan ik je helpen? 👋";
    }

    const { archetype, colorProfile } = userContext;
    return `Hi! Ik zie dat je een ${archetype} stijl hebt met ${colorProfile.undertone} undertone. Zullen we je garderobe optimaliseren? 👋`;
  }, [userContext]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: getWelcomeMessage(),
    },
  ]);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    async function loadContext() {
      setContextLoading(true);
      try {
        const userId = getUserId();
        const context = await fetchUserContext(userId);
        setUserContext(context);

        if (context) {
          setMessages([
            {
              id: "welcome-1",
              role: "assistant",
              content: `Hi! Ik zie dat je een ${context.archetype} stijl hebt met ${context.colorProfile.undertone} undertone. Zullen we je garderobe optimaliseren? 👋`,
            },
          ]);
        }
      } catch (e) {
        console.error("[NovaChatProvider] Failed to load context:", e);
      } finally {
        setContextLoading(false);
      }
    }
    loadContext();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setError(null);
    setSending(false);
    setMessages([
      {
        id: "welcome-1",
        role: "assistant",
        content: getWelcomeMessage(),
      },
    ]);
  }, [getWelcomeMessage]);

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

      const convo: ChatMessage[] = [];

      let systemPrompt = opts?.prefaceSystem || "";
      if (!systemPrompt && userContext) {
        systemPrompt = buildSystemPrompt(userContext);
      }

      if (systemPrompt) {
        convo.push({ id: "sys", role: "system", content: systemPrompt });
      }

      const history = messages.slice(-8).map(({ role, content }) => ({ id: crypto.randomUUID(), role, content }));
      convo.push(...history, { id: userMsg.id, role: "user", content });

      const contextHeaders = userContext ? buildContextHeaders(userContext) : {};

      try {
        const iter = streamChat({
          mode: "style",
          messages: convo.map(({ role, content }) => ({ role, content })),
          signal: controller.signal,
          onEvent,
          headers: contextHeaders,
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
    [messages, userContext]
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