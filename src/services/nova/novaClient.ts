// src/services/nova/novaClient.ts
export type NovaEvent =
  | { type: "heartbeat"; ts: number }
  | { type: "meta"; model: string; traceId: string }
  | { type: "chunk"; delta: string }
  | { type: "done"; data?: any }
  | { type: "error"; message: string; detail?: string; traceId?: string };

export type NovaHandlers = {
  onStart?: () => void;
  onMeta?: (e: NovaEvent & { type: "meta" }) => void;
  onChunk?: (e: NovaEvent & { type: "chunk" }) => void;
  onDone?: (e?: NovaEvent) => void;
  onError?: (e: NovaEvent & { type: "error" }) => void;
  onHeartbeat?: (e: NovaEvent & { type: "heartbeat" }) => void;
};

const START_MARKER = '<<<FITFI_JSON>>>';
const END_MARKER = '<<<END_FITFI_JSON>>>';

export async function openNovaStream(
  endpoint: string,
  payload: { mode?: string; messages?: Array<{ role: string; content: string }> },
  handlers: NovaHandlers,
  fetchInit?: RequestInit & { signal?: AbortSignal }
) {
  const ctrl = new AbortController();
  const signal = fetchInit?.signal ?? ctrl.signal;

  // Get real user ID if authenticated, otherwise use tracking UID
  let uid = "anon";
  try {
    const userStr = localStorage.getItem("fitfi_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.id) {
        uid = user.id; // Real authenticated user ID
      } else {
        uid = getOrCreateUid(); // Fallback to tracking UID
      }
    } else {
      uid = getOrCreateUid(); // Fallback to tracking UID
    }
  } catch (e) {
    uid = getOrCreateUid(); // Fallback to tracking UID
  }

  const tier = (import.meta.env.VITE_FITFI_TIER || "free").toString();

  // Rate limit check (30 requests per minute for Nova)
  try {
    const { supabase } = await import('@/lib/supabaseClient');
    const { data: rateLimitData, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_identifier: uid,
      p_identifier_type: uid === 'anon' ? 'ip' : 'user',
      p_endpoint: '/functions/nova',
      p_max_requests: 30,
      p_window_minutes: 1,
    });

    if (!rateLimitError && rateLimitData && !rateLimitData.allowed) {
      const resetAt = new Date(rateLimitData.reset_at);
      const retryAfter = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
      handlers.onError?.({
        type: 'error',
        message: `Rate limit bereikt. Probeer het over ${retryAfter} seconden opnieuw.`,
        detail: `Je hebt het maximum van 30 berichten per minuut bereikt. Reset om ${resetAt.toLocaleTimeString()}.`,
      });
      return () => ctrl.abort();
    }
  } catch (rateLimitCheckError) {
    // Fail open: if rate limit check fails, allow the request
    console.warn('Rate limit check failed, allowing request:', rateLimitCheckError);
  }

  // Load quiz data from localStorage to send to Nova
  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "text/event-stream",
    "x-fitfi-tier": tier,
    "x-fitfi-uid": uid,
  };

  try {
    // Get quiz answers from localStorage (try both key formats)
    const quizAnswersStr = localStorage.getItem("ff_quiz_answers") || localStorage.getItem("fitfi.quiz.answers");
    if (quizAnswersStr) {
      const quizAnswers = JSON.parse(quizAnswersStr);

      // Send ALL critical fields to Nova
      if (quizAnswers.gender) {
        headers["x-fitfi-gender"] = quizAnswers.gender;
      }

      if (quizAnswers.bodyType) {
        headers["x-fitfi-bodytype"] = quizAnswers.bodyType;
      }

      if (quizAnswers.stylePreferences) {
        headers["x-fitfi-styleprefs"] = JSON.stringify(quizAnswers.stylePreferences);
      }

      if (quizAnswers.occasions) {
        headers["x-fitfi-occasions"] = JSON.stringify(quizAnswers.occasions);
      }

      if (quizAnswers.baseColors) {
        headers["x-fitfi-basecolors"] = quizAnswers.baseColors;
      }

      if (quizAnswers.sizes) {
        headers["x-fitfi-sizes"] = JSON.stringify(quizAnswers.sizes);
      }

      if (quizAnswers.budgetRange) {
        headers["x-fitfi-budget"] = JSON.stringify({ min: 0, max: quizAnswers.budgetRange });
      }

      if (quizAnswers.colorAnalysis) {
        headers["x-fitfi-coloranalysis"] = JSON.stringify(quizAnswers.colorAnalysis);
      }

      // Send ALL quiz data as fallback
      headers["x-fitfi-quiz"] = quizAnswersStr;

      console.log("📤 Sending quiz data to Nova:", {
        gender: quizAnswers.gender,
        bodyType: quizAnswers.bodyType,
        stylePrefs: quizAnswers.stylePreferences,
        occasions: quizAnswers.occasions,
        sizes: quizAnswers.sizes,
        hasColorAnalysis: !!quizAnswers.colorAnalysis
      });
    } else {
      console.warn("⚠️ No quiz data found in localStorage - Nova will have limited context");
    }

    // Get archetype from localStorage (try both key formats)
    const archetypeStr = localStorage.getItem("ff_style_archetype") || localStorage.getItem("fitfi.archetype");
    if (archetypeStr) {
      try {
        const archetype = JSON.parse(archetypeStr);
        headers["x-fitfi-archetype"] = archetype;
      } catch {}
    }

    // Get color profile undertone (try both key formats)
    const colorProfileStr = localStorage.getItem("ff_color_profile") || localStorage.getItem("fitfi.color_profile");
    if (colorProfileStr) {
      try {
        const colorProfile = JSON.parse(colorProfileStr);
        if (colorProfile.temperature) {
          headers["x-fitfi-undertone"] = colorProfile.temperature;
        }
      } catch {}
    }
  } catch (e) {
    console.error("Error loading quiz data for Nova:", e);
  }

  handlers.onStart?.();

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload || {}),
      signal,
      ...fetchInit,
    });

    const ctype = (res.headers.get("content-type") || "").toLowerCase();

    // Fallback: geen SSE? Dan 1x JSON lezen
    if (!ctype.includes("text/event-stream")) {
      const data = await res.json().catch(() => ({}));
      handlers.onChunk?.({ type: "chunk", delta: data.content || "Nova (fallback): geen streaming beschikbaar." });
      handlers.onDone?.({ type: "done", data: { ok: true, mode: "json" } });
      return () => ctrl.abort();
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let fullText = "";

    const flushBlocks = () => {
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";
      for (const block of parts) {
        const ev = parseSSEBlock(block);
        if (!ev) continue;

        switch (ev.type) {
          case "heartbeat":
            handlers.onHeartbeat?.(ev);
            break;
          case "meta":
            handlers.onMeta?.(ev);
            break;
          case "chunk":
            fullText += ev.delta;
            handlers.onChunk?.(ev);
            // Check voor FITFI_JSON markers in de volledige tekst
            checkForStructuredData(fullText, handlers);
            break;
          case "done":
            handlers.onDone?.(ev);
            break;
          case "error":
            handlers.onError?.(ev);
            break;
        }
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      flushBlocks();
    }

    // closing tail
    if (buffer) {
      buffer += "\n\n";
      flushBlocks();
    }

    handlers.onDone?.({ type: "done", data: { ok: true, mode: "sse" } });
  } catch (err: any) {
    handlers.onError?.({ type: "error", message: err?.message || "SSE-verbinding mislukt" });
  }

  return () => ctrl.abort();
}

function parseSSEBlock(block: string): NovaEvent | null {
  const lines = block.split("\n").map((l) => l.trim());
  let ev = "message";
  const data: string[] = [];

  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith(":")) continue; // comment/heartbeat
    if (line.startsWith("event:")) {
      ev = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      data.push(line.slice(5).trim());
    }
  }

  const raw = data.join("\n");
  let json: any = {};
  try {
    json = raw ? JSON.parse(raw) : {};
  } catch {
    json = { text: raw };
  }

  if (ev === "heartbeat") return { type: "heartbeat", ts: Number(json?.ts ?? Date.now()) };
  
  // Parse verschillende event types
  if (json.type === "meta") return { type: "meta", model: json.model, traceId: json.traceId };
  if (json.type === "chunk") return { type: "chunk", delta: json.delta || "" };
  if (json.type === "done") return { type: "done", data: json };
  if (json.type === "error") return { type: "error", message: json.message || "Onbekende fout", detail: json.detail, traceId: json.traceId };

  return null;
}

function checkForStructuredData(fullText: string, handlers: NovaHandlers) {
  const startIdx = fullText.indexOf(START_MARKER);
  const endIdx = fullText.indexOf(END_MARKER);
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const jsonStr = fullText.slice(startIdx + START_MARKER.length, endIdx);
    try {
      const parsed = JSON.parse(jsonStr);
      // Emit als chunk voor backwards compatibility
      if (parsed.explanation) {
        handlers.onChunk?.({ type: "chunk", delta: `\n\n[Structured] ${parsed.explanation}` });
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
}

function getOrCreateUid(): string {
  try {
    const KEY = "fitfi.uid";
    const cur = localStorage.getItem(KEY);
    if (cur) return cur;
    const uid = crypto.randomUUID();
    localStorage.setItem(KEY, uid);
    return uid;
  } catch {
    return "anon";
  }
}