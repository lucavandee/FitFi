import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type ChatMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  ts?: number;
};

type NovaChatContextValue = {
  enabled: boolean;
  open: () => void;
  close: () => void;
  isOpen: boolean;
  send: (text: string) => Promise<void>;
  messages: ChatMessage[];
  reset: () => void;
};

const NovaChatContext = createContext<NovaChatContextValue | null>(null);

type Props = {
  children: ReactNode;
};

/**
 * Provider — in dev staat Nova standaard uit via env flags.
 * UI moet gracieus degraderen (geen crashes).
 */
export default function NovaChatProvider({ children }: Props) {
  const enabled =
    (import.meta.env.VITE_NOVA_ENABLED ?? "false").toString() === "true";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const idRef = useRef(0);

  const nextId = useCallback(() => {
    idRef.current += 1;
    return String(idRef.current);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const reset = useCallback(() => setMessages([]), []);

  // In dev / wanneer SSE uit staat, doen we niets.
  const send = useCallback(
    async (text: string) => {
      // Altijd lokaal echo-en zodat UI voorspelbaar blijft
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user", content: text, ts: Date.now() },
      ]);

      if (!enabled) {
        // Dev: voeg een mock-antwoord toe zodat de UI levend voelt
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            content:
              "Nova staat uit in deze omgeving. (VITE_NOVA_ENABLED=false) – dit is een mock antwoord.",
            ts: Date.now(),
          },
        ]);
        return;
      }

      // TODO: echte SSE/endpoint aanroepen wanneer enabled === true
      // Bijv. fetch('/.netlify/functions/nova', { method: 'POST', body: JSON.stringify({ text }) })
      // en streamen opzetten. Voor nu minimalistisch houden:
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: "Dank! (live Nova-antwoord zou hier verschijnen.)",
          ts: Date.now(),
        },
      ]);
    },
    [enabled, nextId]
  );

  const value = useMemo<NovaChatContextValue>(
    () => ({ enabled, open, close, isOpen, send, messages, reset }),
    [enabled, open, close, isOpen, send, messages, reset]
  );

  return (
    <NovaChatContext.Provider value={value}>
      {children}
    </NovaChatContext.Provider>
  );
}

/**
 * **Non-crashing hook**
 * Als er geen provider is, geven we een no-op fallback terug.
 * Zo breekt de UI nooit, geheel conform "dev uit, gracieus degraderen".
 */
export function useNovaChat(): NovaChatContextValue {
  const ctx = useContext(NovaChatContext);
  if (ctx) return ctx;

  // Fallback: no-op implementatie (enabled=false) — voorkomt crash.
  const noop = () => {};
  const noopAsync = async () => {};
  return {
    enabled: false,
    isOpen: false,
    open: noop,
    close: noop,
    send: noopAsync,
    messages: [],
    reset: noop,
  };
}