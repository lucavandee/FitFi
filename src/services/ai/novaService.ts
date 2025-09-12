import { track } from "@/utils/telemetry";
import type { Product } from "@/types/product";

// Environment check for Nova SSE availability
const NOVA_SSE_ACTIVE = import.meta.env.VITE_NOVA_SSE_ACTIVE !== 'false';

const START_MARKER = '<<<FITFI_JSON>>>';
const END_MARKER = '<<<END_FITFI_JSON>>>';

export type NovaMode = "outfits" | "chat";

export type NovaMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type NovaEvent = 
  | { type: "content"; content: string }
  | { type: "products"; products: Product[] }
  | { type: "done" }
  | { type: "error" };

export type StreamChatParams = {
  mode?: NovaMode;
  messages: NovaMessage[];
  onEvent?: (event: NovaEvent) => void;
};

function validateMessages(messages: NovaMessage[]): boolean {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  return messages.every(msg => 
    msg && 
    typeof msg.role === 'string' && 
    typeof msg.content === 'string' && 
    msg.content.trim().length > 0
  );
}

export async function* streamChat({
  mode = "outfits",
  messages,
  onEvent,
}: StreamChatParams): AsyncGenerator<NovaEvent, void, unknown> {
  // Check if Nova SSE is active
  if (!NOVA_SSE_ACTIVE) {
    track('nova:sse-inactive');
    onEvent?.({ type: 'error' });
    throw new Error('Nova chat is momenteel niet beschikbaar');
  }

  try {
    track('nova:request-start', { 
      messageCount: validMessages.length,
      mode 
    });

    // Validate messages before sending
    if (!validateMessages(messages)) {
      const error = new Error("Ongeldige berichten: alle berichten moeten niet-lege content hebben");
      onEvent?.({ type: "error" });
      return;
    }

    const response = await fetch("/.netlify/functions/nova", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-fitfi-tier": "visitor",
        "x-fitfi-uid": "anonymous"
      },
      body: JSON.stringify({ messages, mode }),
    });

    if (!response.ok) {
      track('nova:request-failed', { 
        status: response.status,
        statusText: response.statusText 
      });
      const errorText = await response.text();
      const error = new Error(`Nova API fout: ${response.status} - ${errorText}`);
      onEvent?.({ type: "error" });
      track("nova:error", { status: response.status, message: errorText });
      return;
    }

    if (!response.body) {
      track('nova:no-response-body');
      const error = new Error("Geen response body ontvangen van Nova API");
      onEvent?.({ type: "error" });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onEvent?.({ type: "done" });
        yield { type: "done" };
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          
          if (data.includes(START_MARKER)) {
            const start = data.indexOf(START_MARKER) + START_MARKER.length;
            const end = data.indexOf(END_MARKER);
            
            if (end > start) {
              try {
                const jsonStr = data.slice(start, end);
                const parsed = JSON.parse(jsonStr);
                
                if (parsed.products && Array.isArray(parsed.products)) {
                  const event = { type: "products" as const, products: parsed.products };
                  onEvent?.(event);
                  yield event;
                }
              } catch (parseError) {
                console.warn("JSON parse fout:", parseError);
                onEvent?.({ type: "error" });
                track("nova:parse_error", { data: data.slice(0, 100) });
              }
            }
          } else {
            const event = { type: "content" as const, content: data };
            onEvent?.(event);
            yield event;
          }
        }
      }
    }
    
    track('nova:stream-complete');
  } catch (error) {
    onEvent?.({ type: "error" });
    track('nova:stream-error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    track('nova:invalid-messages', { messageCount: messages.length });
    track("nova:stream_error", { message: (error as Error)?.message });
    console.error("Nova streaming fout:", error);
  }
}