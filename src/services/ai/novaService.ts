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

  // Get real user ID and tier from Supabase session (SINGLE SOURCE OF TRUTH)
  let userId = "anon";
  let userTier = "free";
  try {
    // Dynamic import to avoid circular dependency
    const { supabase } = await import('@/lib/supabaseClient');
    const sb = supabase();
    const { data: { session } } = await sb.auth.getSession();

    if (session?.user) {
      userId = session.user.id;
      console.log('✅ [novaService] Got userId from Supabase session:', {
        userId: userId.substring(0, 8) + '...',
        hasSession: true
      });

      // Get tier from profiles table
      try {
        const { data: profile } = await sb
          .from('profiles')
          .select('tier')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.tier) {
          userTier = profile.tier as string;
          console.log('✅ [novaService] Got tier from profiles:', userTier);
        }
      } catch (tierError) {
        console.warn('⚠️ [novaService] Could not fetch tier:', tierError);
      }
    } else {
      console.warn('⚠️ [novaService] No active Supabase session - user is NOT authenticated');
    }
  } catch (authError) {
    console.error('❌ [novaService] Auth check failed:', authError);
  }

  // CRITICAL: Load quiz data from DATABASE first, fallback to localStorage
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-fitfi-tier": userTier,
    "x-fitfi-uid": userId,
    ...customHeaders,
  };

  let quizAnswers: any = null;

  try {
    // FIRST: Try to get quiz data from DATABASE (if user is logged in)
    if (userId !== "anon") {
      const { supabase } = await import('@/lib/supabaseClient');
      const sb = supabase();

      if (sb) {
        const { data: profile, error } = await sb
          .from('style_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (profile && !error) {
          console.log('✅ [novaService] RAW DATABASE PROFILE:', profile);

          console.log('✅ [novaService] Loaded quiz data from DATABASE:', {
            gender: profile.gender,
            archetype: profile.archetype,
            bodyType: profile.body_type,
            hasQuizAnswers: !!profile.quiz_answers,
            quizAnswersKeys: profile.quiz_answers ? Object.keys(profile.quiz_answers) : []
          });

          // Use database data - merge database columns with quiz_answers JSON
          quizAnswers = {
            gender: profile.gender,
            bodyType: profile.body_type || profile.quiz_answers?.bodyType || profile.quiz_answers?.bodytype,
            archetype: profile.archetype,
            stylePreferences: profile.quiz_answers?.stylePreferences || profile.quiz_answers?.stylepreferences,
            occasions: profile.preferred_occasions || profile.quiz_answers?.occasions || profile.quiz_answers?.goals,
            sizes: profile.sizes || profile.quiz_answers?.sizes,
            budgetRange: profile.budget_range || profile.quiz_answers?.budgetRange || profile.quiz_answers?.budget,
            baseColors: profile.quiz_answers?.baseColors,
            colorAnalysis: profile.color_analysis || profile.quiz_answers?.colorAnalysis,
            ...(profile.quiz_answers || {}) // Include all other quiz answers
          };

          console.log('📦 [novaService] PROCESSED quiz data:', quizAnswers);
        } else if (error) {
          console.warn('⚠️ [novaService] Could not load profile from database:', error.message);
        } else {
          console.warn('⚠️ [novaService] No profile found in database for user');
        }
      }
    }

    // FALLBACK: If no database data, try localStorage
    if (!quizAnswers) {
      console.log('🔄 [novaService] No database data found, trying localStorage fallback...');
      const quizAnswersStr = localStorage.getItem("ff_quiz_answers") || localStorage.getItem("fitfi.quiz.answers");
      if (quizAnswersStr) {
        quizAnswers = JSON.parse(quizAnswersStr);
        console.log('✅ [novaService] SUCCESS: Using quiz data from localStorage (fallback)');
        console.log('📦 [novaService] localStorage quiz data:', {
          gender: quizAnswers.gender,
          bodyType: quizAnswers.bodyType,
          archetype: quizAnswers.archetype,
          stylePreferences: quizAnswers.stylePreferences,
          occasions: quizAnswers.occasions
        });
      } else {
        console.error('❌ [novaService] CRITICAL: No quiz data found in database OR localStorage');
        console.error('   This means Nova has NO context about the user!');
      }
    }

    // Send quiz data to Nova (if we have any)
    if (quizAnswers) {

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

      // Also send archetype if available
      if (quizAnswers.archetype) {
        headers["x-fitfi-archetype"] = quizAnswers.archetype;
      }

      // Send ALL quiz data as JSON fallback
      headers["x-fitfi-quiz"] = JSON.stringify(quizAnswers);

      console.log("📤 [novaService] Sending quiz data to Nova:", {
        source: userId !== "anon" ? "DATABASE" : "localStorage",
        gender: quizAnswers.gender,
        archetype: quizAnswers.archetype,
        bodyType: quizAnswers.bodyType,
        stylePrefs: quizAnswers.stylePreferences,
        occasions: quizAnswers.occasions,
        sizes: quizAnswers.sizes,
        hasColorAnalysis: !!quizAnswers.colorAnalysis
      });
    } else {
      console.warn("⚠️ [novaService] No quiz data found in database OR localStorage - Nova will have limited context");
    }
  } catch (e) {
    console.error("[novaService] Error loading quiz data from database:", e);
  }

  // DEBUG: Log what we're sending
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📤 [novaService] FINAL HEADERS BEING SENT TO NOVA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('User ID:', headers['x-fitfi-uid']);
  console.log('Tier:', headers['x-fitfi-tier']);
  console.log('Gender:', headers['x-fitfi-gender'] || '❌ MISSING');
  console.log('Body Type:', headers['x-fitfi-bodytype'] || '❌ MISSING');
  console.log('Archetype:', headers['x-fitfi-archetype'] || '❌ MISSING');
  console.log('Style Prefs:', headers['x-fitfi-styleprefs'] || '❌ MISSING');
  console.log('Occasions:', headers['x-fitfi-occasions'] || '❌ MISSING');
  console.log('Sizes:', headers['x-fitfi-sizes'] || '❌ MISSING');
  console.log('Budget:', headers['x-fitfi-budget'] || '❌ MISSING');
  console.log('Has Quiz Data:', !!headers['x-fitfi-quiz']);
  console.log('Has Color Analysis:', !!headers['x-fitfi-coloranalysis']);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    res = await fetch("/.netlify/functions/nova", {
      method: "POST",
      headers,
      body: JSON.stringify({
        mode: opts.mode,
        messages,
        expected_markers: { start: START_JSON, end: END_JSON },
      }),
      signal,
    });

    // DEBUG: Log response status
    console.log('📥 [novaService] Response received:', {
      status: res.status,
      ok: res.ok,
      hasBody: !!res.body
    });
  } catch (fetchError) {
    console.error("🔴 [novaService] Fetch error:", fetchError);
    console.warn("Nova endpoint niet beschikbaar, gebruik lokale fallback");
    yield* localNovaFallback(messages, onEvent);
    return;
  }

  if (!res.ok || !res.body) {
    // Handle specific error codes
    if (res.status === 401) {
      console.warn("⛔ Nova: Authentication required (401)");
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { error: "authentication_required", code: "AUTH_REQUIRED", message: "Log in om Nova te gebruiken" };
      }
      onEvent?.({ type: "error", message: errorData.message, code: errorData.code, data: errorData });
      const error = new Error(errorData.message || "Authentication required");
      (error as any).response = { data: errorData, status: 401 };
      (error as any).data = errorData;
      throw error;
    }

    if (res.status === 403) {
      console.warn("⛔ Nova: Access denied (403)");
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { error: "access_denied", code: "ACCESS_DENIED", message: "Toegang geweigerd" };
      }
      onEvent?.({ type: "error", message: errorData.message, code: errorData.code, data: errorData });
      const error = new Error(errorData.message || "Access denied");
      (error as any).response = { data: errorData, status: 403 };
      (error as any).data = errorData;
      throw error;
    }

    if (res.status === 404) {
      console.warn("Nova function niet gevonden (404), gebruik lokale fallback");
      yield* localNovaFallback(messages, onEvent);
      return;
    }

    if (res.status === 503) {
      console.error("⛔ Nova: Service unavailable (503)");
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { error: "service_unavailable", code: "SERVICE_UNAVAILABLE", message: "Nova is tijdelijk niet beschikbaar" };
      }
      onEvent?.({ type: "error", message: errorData.message, code: errorData.code });
      throw new Error(errorData.message || "Service unavailable");
    }

    // Generic error
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