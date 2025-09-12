export type NovaEvent = 
  | { type: "delta"; text?: string }
  | { type: "done" }
  | { type: "error"; message?: string };

export type NovaStreamOpts = {
  mode: "style" | "general";
  messages: Array<{ role: string; content: string }>;
  signal?: AbortSignal;
  onEvent?: (event: NovaEvent) => void;
};

export async function* streamChat(opts: NovaStreamOpts): AsyncGenerator<string, void, unknown> {
  const { messages, signal, onEvent } = opts;
  
  try {
    // Check if Nova SSE is available
    const sseActive = import.meta.env.VITE_NOVA_SSE_ACTIVE === "true";
    if (!sseActive) {
      onEvent?.({ type: "error", message: "Nova chat is momenteel niet beschikbaar" });
      return;
    }

    const response = await fetch("/.netlify/functions/nova", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-fitfi-tier": localStorage.getItem("fitfi.user.tier") || "visitor",
        "x-fitfi-uid": localStorage.getItem("fitfi.user.id") || "anonymous",
      },
      body: JSON.stringify({ messages }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
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
              onEvent?.({ type: "done" });
              return;
            }

            // Check for JSON blocks
            if (data.includes("<<<FITFI_JSON>>>")) {
              const jsonMatch = data.match(/<<<FITFI_JSON>>>(.*?)<<<END_FITFI_JSON>>>/);
              if (jsonMatch) {
                try {
                  const jsonData = JSON.parse(jsonMatch[1]);
                  // Handle product data or other structured responses
                  onEvent?.({ type: "delta", text: `\n[Producten gevonden: ${jsonData.products?.length || 0}]\n` });
                } catch (e) {
                  console.warn("Failed to parse JSON block:", e);
                }
              }
            } else if (data.trim()) {
              onEvent?.({ type: "delta", text: data });
              yield data;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return;
    }
    onEvent?.({ type: "error", message: "Verbinding onderbroken" });
    throw error;
  }
}