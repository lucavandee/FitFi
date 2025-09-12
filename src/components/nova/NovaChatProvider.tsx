import React, { createContext, useContext, useCallback, useEffect, useRef, useState, ReactNode } from "react";
import { track } from "@/utils/telemetry";
import type { Product } from "@/types/product";

type NovaStatus = "idle" | "opening" | "streaming" | "error" | "closed";

interface NovaMessage {
  id: string;
  content: string;
  timestamp: string;
}

interface NovaEvent {
  type: "message" | "products" | "error" | "complete";
  content?: string;
  products?: Product[];
  error?: string;
}

interface NovaEventBus {
  subscribe: (callback: (event: NovaEvent) => void) => () => void;
  emit: (event: NovaEvent) => void;
}

interface NovaProductBus {
  subscribe: (callback: (products: Product[] | null) => void) => () => void;
  emit: (products: Product[] | null) => void;
}

interface NovaChatContextType {
  isOpen: boolean;
  status: NovaStatus;
  show: () => void;
  hide: () => void;
  send: (message: string, options?: { mode?: string }) => Promise<void>;
  events: NovaEventBus;
  products: NovaProductBus;
}

const NovaChatContext = createContext<NovaChatContextType | null>(null);

function createEventBus(): NovaEventBus {
  const listeners = new Set<(event: NovaEvent) => void>();
  
  return {
    subscribe: (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    emit: (event) => {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error("[NovaEventBus] Listener error:", error);
        }
      });
    }
  };
}

function createProductBus(): NovaProductBus {
  const listeners = new Set<(products: Product[] | null) => void>();
  
  return {
    subscribe: (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    emit: (products) => {
      listeners.forEach(listener => {
        try {
          listener(products);
        } catch (error) {
          console.error("[NovaProductBus] Listener error:", error);
        }
      });
    }
  };
}

function generateId(): string {
  try {
    return crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

function validateMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return "Maak een smart-casual outfit onder €200";
  }
  return trimmed;
}

async function streamNovaChat(message: string, options: { mode?: string } = {}): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("/.netlify/functions/nova", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-fitfi-tier": "member",
        "x-fitfi-uid": generateId(),
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "Je bent Nova, FitFi's AI styling assistent. Geef outfit aanbevelingen in het Nederlands." },
          { role: "user", content: validateMessage(message) }
        ],
        mode: options.mode || "outfits"
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Nova API error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body from Nova API");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              window.dispatchEvent(new CustomEvent('nova-message', { detail: data }));
            }
            if (data.products) {
              window.dispatchEvent(new CustomEvent('nova-products', { detail: data.products }));
            }
          } catch (error) {
            console.warn("[Nova] Failed to parse SSE data:", error);
          }
        }
      }
    }

    window.dispatchEvent(new CustomEvent('nova-complete'));
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("Nova request timeout");
    }
    throw new Error(error.message || "Nova connection failed");
  }
}

interface NovaChatProviderProps {
  children: ReactNode;
}

export function NovaChatProvider({ children }: NovaChatProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<NovaStatus>("idle");
  const eventsRef = useRef<NovaEventBus>(createEventBus());
  const productsRef = useRef<NovaProductBus>(createProductBus());

  const show = useCallback(() => {
    setIsOpen(true);
    track("nova:open");
  }, []);

  const hide = useCallback(() => {
    setIsOpen(false);
    setStatus("idle");
    track("nova:close");
  }, []);

  const send = useCallback(async (message: string, options: { mode?: string } = {}) => {
    const validatedMessage = validateMessage(message);
    
    try {
      setStatus("opening");
      track("nova:send", { length: validatedMessage.length, mode: options.mode });
      
      setStatus("streaming");
      await streamNovaChat(validatedMessage, options);
      setStatus("idle");
    } catch (error: any) {
      setStatus("error");
      eventsRef.current.emit({
        type: "error",
        error: error.message || "Onbekende fout bij Nova"
      });
      throw error;
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event: CustomEvent) => {
      eventsRef.current.emit({
        type: "message",
        content: event.detail.content || ""
      });
    };

    const handleProducts = (event: CustomEvent) => {
      const products = Array.isArray(event.detail) ? event.detail : [];
      productsRef.current.emit(products);
      eventsRef.current.emit({
        type: "products",
        products
      });
    };

    const handleComplete = () => {
      setStatus("idle");
      eventsRef.current.emit({ type: "complete" });
    };

    window.addEventListener('nova-message', handleMessage as EventListener);
    window.addEventListener('nova-products', handleProducts as EventListener);
    window.addEventListener('nova-complete', handleComplete);

    return () => {
      window.removeEventListener('nova-message', handleMessage as EventListener);
      window.removeEventListener('nova-products', handleProducts as EventListener);
      window.removeEventListener('nova-complete', handleComplete);
    };
  }, []);

  const contextValue: NovaChatContextType = {
    isOpen,
    status,
    show,
    hide,
    send,
    events: eventsRef.current,
    products: productsRef.current
  };

  return (
    <NovaChatContext.Provider value={contextValue}>
      {children}
    </NovaChatContext.Provider>
  );
}

export function useNovaChat(): NovaChatContextType {
  const context = useContext(NovaChatContext);
  if (!context) {
    throw new Error("useNovaChat must be used within NovaChatProvider");
  }
  return context;
}