export type Role = "user" | "assistant" | "system";
export type Message = { role: Role; content: string };

export type NovaEvent =
  | { type: "delta"; text?: string }
  | { type: "done" }
  | { type: "error"; message?: string };

export type NovaStreamOpts = {
  mode: "style";
  messages: Message[];
  onEvent?: (e: NovaEvent) => void;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

const START_JSON = "<<<FITFI_JSON>>>";
const END_JSON = "<<<END_FITFI_JSON>>>";

/**
 * Lokale fallback wanneer Netlify function niet beschikbaar is
 */
async function* localNovaFallback(
  messages: Message[],
  onEvent?: (e: NovaEvent) => void
): AsyncGenerator<string, void, unknown> {
  const lastMessage = messages[messages.length - 1]?.content || "";

  const helpMessage = `Hoi! 👋

Nova werkt momenteel in **lokale modus** zonder database verbinding.

**Om de volledige AI styling ervaring te krijgen:**
1. Stop de huidige server (Ctrl+C)
2. Start met: \`npm run dev:netlify\`
3. Open: http://localhost:8888

Dan kan ik je helpen met:
- Persoonlijke outfit aanbevelingen
- 50+ producten uit de database
- Budget filtering
- Kleur advies op basis van je huidondertoon`;

  await new Promise(r => setTimeout(r, 300));

  for (const char of helpMessage) {
    yield char;
    onEvent?.({ type: "delta", text: char });
    await new Promise(r => setTimeout(r, 15));
  }

  onEvent?.({ type: "done" });
}

/**
 * Server-Sent Events streamer naar Netlify function.
 * Verwacht text/event-stream; individuele regels kunnen 'data: {json}' bevatten.
 */
export async function* streamChat(opts: NovaStreamOpts): AsyncGenerator<string, void, unknown> {
  const { messages, onEvent, signal, headers: customHeaders = {} } = opts;

  const hasUser = messages.some((m) => m.role === "user" && (m.content ?? "").trim().length > 0);
  if (!hasUser) {
    onEvent?.({ type: "error", message: "Lege gebruikersinvoer." });
    throw new Error("Empty user content not allowed");
  }

  let res: Response;

  // Get real user ID from localStorage if authenticated
  let userId = "anon";
  try {
    const userStr = localStorage.getItem("fitfi_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.id) {
        userId = user.id;
      }
    }
  } catch (e) {
    console.warn("Could not get user ID:", e);
  }

  try {
    res = await fetch("/.netlify/functions/nova", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-fitfi-tier": (import.meta as any).env?.VITE_FITFI_TIER ?? "free",
        "x-fitfi-uid": userId,
        ...customHeaders,
      },
      body: JSON.stringify({
        mode: opts.mode,
        messages,
        expected_markers: { start: START_JSON, end: END_JSON },
      }),
      signal,
    });
  } catch (fetchError) {
    console.warn("Nova endpoint niet beschikbaar, gebruik lokale fallback:", fetchError);
    yield* localNovaFallback(messages, onEvent);
    return;
  }

  if (!res.ok || !res.body) {
    if (res.status === 404) {
      console.warn("Nova function niet gevonden (404), gebruik lokale fallback");
      yield* localNovaFallback(messages, onEvent);
      return;
    }
    onEvent?.({ type: "error", message: "SSE niet beschikbaar." });
    throw new Error(`SSE failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    let lastActivity = Date.now();
    const timeout = 30000; // 30 seconds timeout

    while (true) {
      // Check timeout
      if (Date.now() - lastActivity > timeout) {
        console.warn("Stream timeout - geen data ontvangen voor 30s");
        throw new Error("Stream timeout");
      }

      const { value, done } = await reader.read();
      if (done) {
        console.log("Stream completed normally");
        break;
      }

      lastActivity = Date.now();
      buffer += decoder.decode(value, { stream: true });

      // Parse per lijn
      let idx: number;
      while ((idx = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);

        // Skip heartbeats
        if (line.startsWith("event: heartbeat")) continue;

        if (line.startsWith("data:")) {
          const data = line.slice(5).trim();
          if (data === "[DONE]") {
            onEvent?.({ type: "done" });
            yield "";
            return;
          }
          try {
            const payload = JSON.parse(data) as { type: string; text?: string; data?: any };
            if (payload.type === "delta") {
              const text = payload.text ?? "";
              onEvent?.({ type: "delta", text });
              yield text;
            } else if (payload.type === "json") {
              // Direct JSON event from server (products/outfits)
              onEvent?.({ type: "json", data: payload.data });
            } else if (payload.type === "done") {
              onEvent?.({ type: "done" });
              return;
            } else if (payload.type === "error") {
              onEvent?.({ type: "error", message: "Stream error" });
              throw new Error("Stream error from server");
            }
          } catch (parseErr) {
            // Niet-JSON (kan plain text zijn)
            if (data && !data.includes("heartbeat")) {
              onEvent?.({ type: "delta", text: data });
              yield data;
            }
          }
        }
      }
    }
    onEvent?.({ type: "done" });
  } catch (e: any) {
    const msg = e?.message || "Stream interrupted";
    console.error("SSE stream error:", msg);
    onEvent?.({ type: "error", message: msg });
    throw e;
  } finally {
    try {
      reader.releaseLock?.();
    } catch (releaseErr) {
      console.warn("Failed to release reader lock:", releaseErr);
    }
  }
}

export const NovaMarkers = { START_JSON, END_JSON };