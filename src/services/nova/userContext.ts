import { supabase } from "@/lib/supabase";

export interface ColorProfile {
  undertone: "warm" | "cool" | "neutral";
  palette: string[];
  avoid: string[];
  complementary: [string, string][];
  confidence: number;
}

export interface AIColorAnalysis {
  undertone: "warm" | "cool" | "neutral";
  skin_tone: string;
  hair_color: string;
  eye_color: string;
  seasonal_type: "spring" | "summer" | "autumn" | "winter";
  best_colors: string[];
  avoid_colors: string[];
  confidence: number;
  reasoning?: string;
  analysis_date?: string;
  analyzed_by?: string;
}

export interface NovaUserContext {
  userId?: string;
  sessionId?: string;
  gender?: "male" | "female" | "non-binary" | "prefer-not-to-say";
  archetype: string;
  secondaryArchetype?: string;
  bodyType?: string;
  stylePreferences?: string[];
  colorProfile: ColorProfile;
  aiColorAnalysis?: AIColorAnalysis;
  preferences: {
    occasions: string[];
    budget: { min: number; max: number };
    brands: string[];
    sizes: {
      tops: string;
      bottoms: string;
      shoes: string;
    };
  };
  quizAnswers: Record<string, any>;
  completedAt: string;
}

export async function fetchUserContext(
  userId?: string
): Promise<NovaUserContext | null> {
  try {
    if (!userId) {
      const sessionId = getSessionId();
      if (!sessionId) return null;

      const { data, error } = await supabase
        .from("style_profiles")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (error) {
        console.error("[UserContext] Error fetching by session:", error);
        return null;
      }

      if (!data) return null;
      return parseStyleProfile(data);
    }

    const { data, error } = await supabase
      .from("style_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (error) {
      console.error("[UserContext] Error fetching by user_id:", error);
      return null;
    }

    if (!data) return null;
    return parseStyleProfile(data);
  } catch (e) {
    console.error("[UserContext] Fetch failed:", e);
    return null;
  }
}

function parseStyleProfile(data: any): NovaUserContext {
  const colorProfile = parseColorProfile(data.color_advice || data.color_profile);
  const aiColorAnalysis = data.color_analysis ? parseAIColorAnalysis(data.color_analysis) : undefined;
  const quizAnswers = data.quiz_answers || {};

  // Parse gender from DB or quiz answers
  let gender: "male" | "female" | "non-binary" | "prefer-not-to-say" | undefined;
  if (data.gender && ["male", "female", "non-binary", "prefer-not-to-say"].includes(data.gender)) {
    gender = data.gender;
  } else if (quizAnswers.gender) {
    gender = quizAnswers.gender;
  }

  return {
    userId: data.user_id,
    sessionId: data.session_id,
    gender,
    archetype: data.archetype || "casual_chic",
    secondaryArchetype: quizAnswers.secondary_archetype,
    bodyType: quizAnswers.bodyType,
    stylePreferences: quizAnswers.stylePreferences || [],
    colorProfile,
    aiColorAnalysis,
    preferences: {
      occasions: data.preferred_occasions || quizAnswers.occasions || ["casual", "work"],
      budget: data.budget_range || quizAnswers.budget || { min: 50, max: 150 },
      brands: quizAnswers.preferred_brands || [],
      sizes: data.sizes || {
        tops: quizAnswers.size_top || "M",
        bottoms: quizAnswers.size_bottom || "31",
        shoes: quizAnswers.size_shoes || "42",
      },
    },
    quizAnswers,
    completedAt: data.completed_at || data.created_at,
  };
}

function parseAIColorAnalysis(data: any): AIColorAnalysis | undefined {
  if (!data || typeof data !== "object") return undefined;

  return {
    undertone: data.undertone || "neutral",
    skin_tone: data.skin_tone || "",
    hair_color: data.hair_color || "",
    eye_color: data.eye_color || "",
    seasonal_type: data.seasonal_type || "autumn",
    best_colors: Array.isArray(data.best_colors) ? data.best_colors : [],
    avoid_colors: Array.isArray(data.avoid_colors) ? data.avoid_colors : [],
    confidence: data.confidence || 0.5,
    reasoning: data.reasoning,
    analysis_date: data.analysis_date,
    analyzed_by: data.analyzed_by,
  };
}

function parseColorProfile(data: any): ColorProfile {
  if (!data) {
    return {
      undertone: "neutral",
      palette: ["black", "white", "grey", "navy", "camel"],
      avoid: [],
      complementary: [],
      confidence: 0.5,
    };
  }

  return {
    undertone: data.undertone || "neutral",
    palette: Array.isArray(data.palette) ? data.palette : [],
    avoid: Array.isArray(data.avoid) ? data.avoid : [],
    complementary: Array.isArray(data.complementary) ? data.complementary : [],
    confidence: data.confidence || 0.5,
  };
}

function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fitfi_session_id") || sessionStorage.getItem("fitfi_session_id");
}

export function buildSystemPrompt(context: NovaUserContext): string {
  const { archetype, colorProfile, preferences } = context;

  const paletteDisplay = colorProfile.palette.slice(0, 6).join(", ");
  const occasionsDisplay = preferences.occasions.slice(0, 3).join(", ");

  let archetypeDesc = archetype;
  if (context.secondaryArchetype) {
    archetypeDesc += ` × ${context.secondaryArchetype}`;
  }

  return `Je bent Nova, de persoonlijke style assistent van FitFi. Je helpt gebruikers met kleuradvies, outfit samenstelling en stijl tips.

USER PROFIEL:
- Stijl archetype: ${archetypeDesc}
- Kleurtoon: ${colorProfile.undertone} undertone
- Kleurenpalet: ${paletteDisplay}
- Voorkeur gelegenheden: ${occasionsDisplay}
- Budget: €${preferences.budget.min}-${preferences.budget.max} per item
- Maten: ${preferences.sizes.tops} (tops), ${preferences.sizes.bottoms} (broeken), ${preferences.sizes.shoes} (schoenen)

JOUW TAKEN:
1. Geef kleuradvies gebaseerd op undertone + archetype
2. Stel outfits samen die passen bij het profiel
3. Leg WAAROM items werken voor deze persoon uit
4. Wees kort, helder en menselijk (max 3-4 zinnen)

STIJL:
- Gebruik Nederlandse taal, informeel maar professioneel
- Begin nooit met "Natuurlijk!" of "Zeker!"
- Wees specifiek: "Camel werkt door je warme undertone" ipv "Deze kleur past bij je"
- Geef actionable adviezen

Als je gevraagd wordt om outfits samen te stellen, beschrijf kort welke items je zou kiezen en waarom ze bij dit profiel passen.`;
}

export function buildContextHeaders(context: NovaUserContext | null): Record<string, string> {
  if (!context) {
    return {};
  }

  const headers: Record<string, string> = {
    "x-fitfi-archetype": context.archetype,
    "x-fitfi-undertone": context.colorProfile.undertone,
    "x-fitfi-sizes": JSON.stringify(context.preferences.sizes),
    "x-fitfi-budget": JSON.stringify(context.preferences.budget),
  };

  // Add gender if available (CRITICAL for avoiding assumptions!)
  if (context.gender) {
    headers["x-fitfi-gender"] = context.gender;
  }

  // Add body type for fit recommendations
  if (context.bodyType) {
    headers["x-fitfi-bodytype"] = context.bodyType;
  }

  // Add style preferences
  if (context.stylePreferences && context.stylePreferences.length > 0) {
    headers["x-fitfi-styleprefs"] = JSON.stringify(context.stylePreferences);
  }

  // Add preferred occasions
  if (context.preferences.occasions && context.preferences.occasions.length > 0) {
    headers["x-fitfi-occasions"] = JSON.stringify(context.preferences.occasions);
  }

  // Add base colors from quiz
  if (context.quizAnswers?.baseColors) {
    headers["x-fitfi-basecolors"] = context.quizAnswers.baseColors;
  }

  // Add preferred brands from quiz
  if (context.preferences.brands && context.preferences.brands.length > 0) {
    headers["x-fitfi-brands"] = JSON.stringify(context.preferences.brands);
  }

  // Add ALL quiz answers as fallback (for any data we might have missed)
  if (context.quizAnswers && Object.keys(context.quizAnswers).length > 0) {
    headers["x-fitfi-quiz"] = JSON.stringify(context.quizAnswers);
  }

  // Add AI color analysis from photo (if available)
  if (context.aiColorAnalysis) {
    headers["x-fitfi-coloranalysis"] = JSON.stringify(context.aiColorAnalysis);
  }

  return headers;
}
