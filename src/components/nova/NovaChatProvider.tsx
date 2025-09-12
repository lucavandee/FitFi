import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { track } from "@/utils/telemetry";

export type NovaStatus = "idle" | "opening" | "streaming" | "error";

export interface NovaEvent {
  type: "message" | "products" | "error" | "done";
  content?: string;
  products?: any[];
  error?: string;
}

export interface NovaMessage {
  content: string;
  products?: any[];
}

export interface NovaChatContext {
  isOpen: boolean;
  status: NovaStatus;
  open: () => void;
  hide: () => void;
  send: (prompt: string, options?: { mode?: string }) => Promise<void>;
  events: {
    subscribe: (callback: (message: NovaMessage) => void) => () => void;
  };
  products: {
    subscribe: (callback: (products: any[] | null) => void) => () => void;
  };
}

const Context = createContext<NovaChatContext | null>(null);

export function useNovaChat(): NovaChatContext {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useNovaChat must be used within NovaChatProvider");
  }
  return ctx;
}

interface NovaChatProviderProps {
  children: ReactNode;
}

export default function NovaChatProvider({ children }: NovaChatProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<NovaStatus>("idle");
  
  const eventSubscribers = useRef<Set<(message: NovaMessage) => void>>(new Set());
  const productSubscribers = useRef<Set<(products: any[] | null) => void>>(new Set());

  const open = useCallback(() => {
    track("nova:open");
    setIsOpen(true);
  }, []);

  const hide = useCallback(() => {
    track("nova:hide");
    setIsOpen(false);
  }, []);

  const send = useCallback(async (prompt: string, options?: { mode?: string }) => {
    if (!prompt.trim()) {
      throw new Error("Prompt mag niet leeg zijn");
    }

    setStatus("opening");
    track("nova:send", { promptLength: prompt.length, mode: options?.mode });

    try {
      const response = await fetch("/.netlify/functions/nova", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-fitfi-tier": "visitor",
          "x-fitfi-uid": "anonymous"
        },
        body: JSON.stringify({
          messages: [
            { role: "user", content: prompt }
          ],
          mode: options?.mode || "outfits"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("Geen response body ontvangen");
      }

      setStatus("streaming");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setStatus("idle");
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                const message: NovaMessage = {
                  content: parsed.content,
                  products: parsed.products
                };
                
                eventSubscribers.current.forEach(callback => callback(message));
                
                if (parsed.products) {
                  productSubscribers.current.forEach(callback => callback(parsed.products));
                }
              }
            } catch (e) {
              console.warn("Failed to parse SSE data:", data);
            }
          }
        }
      }

      setStatus("idle");
    } catch (error) {
      setStatus("error");
      track("nova:error", { error: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }, []);

  const events = {
    subscribe: useCallback((callback: (message: NovaMessage) => void) => {
      eventSubscribers.current.add(callback);
      return () => {
        eventSubscribers.current.delete(callback);
      };
    }, [])
  };

  const products = {
    subscribe: useCallback((callback: (products: any[] | null) => void) => {
      productSubscribers.current.add(callback);
      return () => {
        productSubscribers.current.delete(callback);
      };
    }, [])
  };

  const value: NovaChatContext = {
    isOpen,
    status,
    open,
    hide,
    send,
    events,
    products
  };

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}