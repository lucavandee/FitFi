import { track } from "@/utils/telemetry";

export interface NovaMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface NovaRequest {
  messages: NovaMessage[];
  mode?: string;
  context?: Record<string, any>;
}

export interface NovaResponse {
  content: string;
  products?: any[];
  done?: boolean;
}

export class NovaService {
  private baseUrl: string;

  constructor(baseUrl = "/.netlify/functions") {
    this.baseUrl = baseUrl;
  }

  async streamChat(request: NovaRequest): Promise<ReadableStream<NovaResponse>> {
    track("nova:stream-start", { 
      messageCount: request.messages.length,
      mode: request.mode 
    });

    const response = await fetch(`${this.baseUrl}/nova`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-fitfi-tier": "visitor",
        "x-fitfi-uid": "anonymous"
      },
      body: JSON.stringify({ prompt, context: context || {}, mode: opts?.mode || "outfits" }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Nova API error: ${response.status} - ${errorText || response.statusText}`);
      track("nova:stream-error", { 
        status: response.status,
        error: errorText 
      });
      throw new Error(`Nova API error: ${response.status} ${errorText}`);
    }

    if (!response.body) {
      throw new Error("No response body received from Nova API");
    }

    return new ReadableStream({
      start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        function pump(): Promise<void> {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              track("nova:stream-complete");
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  controller.enqueue(parsed);
                } catch (e) {
                  console.warn("Failed to parse SSE data:", data);
                }
              }
            }

            return pump();
          });
        }

        return pump();
      }
    });
  }

  async sendMessage(prompt: string, options?: { mode?: string }): Promise<NovaResponse> {
    if (!prompt.trim()) {
      throw new Error("Prompt cannot be empty");
    }

    const request: NovaRequest = {
      messages: [
        { role: "user", content: prompt.trim() }
      ],
      mode: options?.mode || "outfits"
    };

    const stream = await this.streamChat(request);
    const reader = stream.getReader();
    let lastResponse: NovaResponse = { content: "" };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      lastResponse = value;
    }

    return lastResponse;
  }
}

export const novaService = new NovaService();