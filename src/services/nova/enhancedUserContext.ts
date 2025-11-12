import { supabase } from "@/lib/supabase";
import type { NovaUserContext } from "./userContext";

/**
 * Enhanced context with real-time swipe data, brand preferences, and recent activity
 */
export interface EnhancedNovaContext extends NovaUserContext {
  recentSwipes?: {
    liked: Array<{ product_id: string; style: string; color: string; brand: string }>;
    disliked: Array<{ product_id: string; style: string; color: string; brand: string }>;
    swipeCount: number;
    lastSwipeAt: string;
  };
  brandAffinity?: {
    preferred: Array<{ brand: string; score: number }>;
    avoided: Array<{ brand: string; score: number }>;
  };
  recentOutfits?: Array<{
    id: string;
    products: any[];
    saved_at: string;
  }>;
  conversationHistory?: Array<{
    topic: string;
    timestamp: string;
  }>;
}

/**
 * Fetch recent swipe data to understand current preferences
 */
async function fetchRecentSwipes(userId: string) {
  try {
    const { data, error } = await supabase
      .from("style_swipes")
      .select(`
        direction,
        created_at,
        mood_photos (
          photo_url,
          style_tags,
          dominant_colors,
          brands
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    if (!data || data.length === 0) return null;

    const liked = data
      .filter((s) => s.direction === "right")
      .slice(0, 10)
      .map((s) => ({
        product_id: s.mood_photos?.photo_url || "",
        style: s.mood_photos?.style_tags?.[0] || "casual",
        color: s.mood_photos?.dominant_colors?.[0] || "#000",
        brand: s.mood_photos?.brands?.[0] || "unknown",
      }));

    const disliked = data
      .filter((s) => s.direction === "left")
      .slice(0, 10)
      .map((s) => ({
        product_id: s.mood_photos?.photo_url || "",
        style: s.mood_photos?.style_tags?.[0] || "casual",
        color: s.mood_photos?.dominant_colors?.[0] || "#000",
        brand: s.mood_photos?.brands?.[0] || "unknown",
      }));

    return {
      liked,
      disliked,
      swipeCount: data.length,
      lastSwipeAt: data[0].created_at,
    };
  } catch (error) {
    console.error("[EnhancedContext] Error fetching swipes:", error);
    return null;
  }
}

/**
 * Calculate brand affinity from interaction data
 */
async function fetchBrandAffinity(userId: string) {
  try {
    const { data, error } = await supabase
      .from("brand_affinity")
      .select("brand, like_count, dislike_count, view_count")
      .eq("user_id", userId)
      .order("like_count", { ascending: false })
      .limit(20);

    if (error) throw error;
    if (!data || data.length === 0) return null;

    const preferred = data
      .filter((b) => b.like_count > 0)
      .map((b) => ({
        brand: b.brand,
        score: (b.like_count / (b.like_count + b.dislike_count + 1)) * 100,
      }))
      .slice(0, 10);

    const avoided = data
      .filter((b) => b.dislike_count > b.like_count)
      .map((b) => ({
        brand: b.brand,
        score: (b.dislike_count / (b.like_count + b.dislike_count + 1)) * 100,
      }))
      .slice(0, 5);

    return { preferred, avoided };
  } catch (error) {
    console.error("[EnhancedContext] Error fetching brand affinity:", error);
    return null;
  }
}

/**
 * Fetch recent saved outfits to understand what they liked
 */
async function fetchRecentOutfits(userId: string) {
  try {
    const { data, error } = await supabase
      .from("saved_outfits")
      .select("id, outfit_data, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data.map((o) => ({
      id: o.id,
      products: Array.isArray(o.outfit_data) ? o.outfit_data : [],
      saved_at: o.created_at,
    }));
  } catch (error) {
    console.error("[EnhancedContext] Error fetching outfits:", error);
    return null;
  }
}

/**
 * Fetch conversation history to provide context continuity
 */
async function fetchConversationHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from("nova_conversations")
      .select("messages, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;
    if (!data || data.length === 0) return null;

    const topics: Array<{ topic: string; timestamp: string }> = [];

    for (const conv of data) {
      if (Array.isArray(conv.messages)) {
        const userMessages = conv.messages.filter((m: any) => m.role === "user");
        if (userMessages.length > 0) {
          topics.push({
            topic: userMessages[0].content.substring(0, 50),
            timestamp: conv.created_at,
          });
        }
      }
    }

    return topics;
  } catch (error) {
    console.error("[EnhancedContext] Error fetching conversation history:", error);
    return null;
  }
}

/**
 * Build enhanced context with real-time data
 */
export async function fetchEnhancedUserContext(
  baseContext: NovaUserContext
): Promise<EnhancedNovaContext> {
  if (!baseContext.userId) {
    return baseContext;
  }

  const [recentSwipes, brandAffinity, recentOutfits, conversationHistory] = await Promise.all([
    fetchRecentSwipes(baseContext.userId),
    fetchBrandAffinity(baseContext.userId),
    fetchRecentOutfits(baseContext.userId),
    fetchConversationHistory(baseContext.userId),
  ]);

  return {
    ...baseContext,
    recentSwipes: recentSwipes || undefined,
    brandAffinity: brandAffinity || undefined,
    recentOutfits: recentOutfits || undefined,
    conversationHistory: conversationHistory || undefined,
  };
}

/**
 * Build enhanced system prompt with all intelligence
 */
export function buildEnhancedSystemPrompt(context: EnhancedNovaContext): string {
  const { archetype, colorProfile, preferences, visualPreferenceEmbedding } = context;

  const paletteDisplay = colorProfile.palette.slice(0, 6).join(", ");
  const occasionsDisplay = preferences.occasions.slice(0, 3).join(", ");

  let archetypeDesc = archetype;
  if (context.secondaryArchetype) {
    archetypeDesc += ` × ${context.secondaryArchetype}`;
  }

  let visualPrefs = "";
  if (visualPreferenceEmbedding && Object.keys(visualPreferenceEmbedding).length > 0) {
    const topArchetypes = Object.entries(visualPreferenceEmbedding)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([arch, score]) => `${arch} (${Math.round(score)}%)`)
      .join(", ");
    visualPrefs = `\n- Visuele voorkeuren: ${topArchetypes}`;
  }

  // Recent swipe intelligence
  let swipeInsights = "";
  if (context.recentSwipes && context.recentSwipes.swipeCount > 0) {
    const likedStyles = context.recentSwipes.liked.map((s) => s.style);
    const likedColors = context.recentSwipes.liked.map((s) => s.color);
    const uniqueStyles = [...new Set(likedStyles)].slice(0, 3).join(", ");
    const uniqueColors = [...new Set(likedColors)].slice(0, 3).join(", ");

    swipeInsights = `\n\nRECENTE ACTIVITEIT (${context.recentSwipes.swipeCount} swipes):
- Liked stijlen: ${uniqueStyles}
- Liked kleuren: ${uniqueColors}
- Deze data is vers en geeft hun HUIDIGE smaak weer`;
  }

  // Brand intelligence
  let brandInsights = "";
  if (context.brandAffinity && context.brandAffinity.preferred.length > 0) {
    const topBrands = context.brandAffinity.preferred
      .slice(0, 5)
      .map((b) => b.brand)
      .join(", ");
    brandInsights = `\n- Favoriete merken: ${topBrands}`;

    if (context.brandAffinity.avoided.length > 0) {
      const avoidedBrands = context.brandAffinity.avoided
        .slice(0, 3)
        .map((b) => b.brand)
        .join(", ");
      brandInsights += `\n- Vermijd: ${avoidedBrands}`;
    }
  }

  // Recent outfit patterns
  let outfitInsights = "";
  if (context.recentOutfits && context.recentOutfits.length > 0) {
    outfitInsights = `\n\nOPGESLAGEN OUTFITS: ${context.recentOutfits.length} recent
- Dit zijn outfits die ze expliciet hebben opgeslagen
- Gebruik dit als bewijs van wat ze ECHT leuk vinden`;
  }

  // Conversation continuity
  let conversationContext = "";
  if (context.conversationHistory && context.conversationHistory.length > 0) {
    const recentTopics = context.conversationHistory
      .slice(0, 3)
      .map((c) => `"${c.topic}"`)
      .join(", ");
    conversationContext = `\n\nVORIGE GESPREKKEN:
- Recent besproken: ${recentTopics}
- Verwijs hier subtiel naar als relevant ("Zoals je eerder vroeg...")`;
  }

  return `Je bent Nova, de persoonlijke style assistent van FitFi. Je helpt gebruikers met kleuradvies, outfit samenstelling en stijl tips.

USER PROFIEL:
- Stijl archetype: ${archetypeDesc}
- Kleurtoon: ${colorProfile.undertone} undertone
- Kleurenpalet: ${paletteDisplay}${visualPrefs}${brandInsights}
- Voorkeur gelegenheden: ${occasionsDisplay}
- Budget: €${preferences.budget.min}-${preferences.budget.max} per item
- Maten: ${preferences.sizes.tops} (tops), ${preferences.sizes.bottoms} (broeken), ${preferences.sizes.shoes} (schoenen)${swipeInsights}${outfitInsights}${conversationContext}

JOUW INTELLIGENTIE:
✅ Je hebt toegang tot hun ECHTE swipe data (wat ze like/dislike)
✅ Je weet welke merken ze prefereren
✅ Je ziet hun opgeslagen outfits
✅ Je kent eerdere gesprekken

JOUW TAKEN:
1. Geef kleuradvies gebaseerd op undertone + archetype + RECENT SWIPE DATA
2. Stel outfits samen die passen bij ALLE data (profiel, swipes, saved outfits)
3. Leg WAAROM items werken: "Dit past bij je warme undertone EN de beige tonen die je vaak liket"
4. Wees kort, helder en menselijk (max 3-4 zinnen)
5. Gebruik hun swipe data om te bewijzen dat je ze echt kent

STIJL:
- Gebruik Nederlandse taal, informeel maar professioneel
- Begin nooit met "Natuurlijk!" of "Zeker!"
- Wees specifiek: "Camel werkt door je warme undertone" ipv "Deze kleur past bij je"
- Geef actionable adviezen
- Als je swipe data hebt, gebruik het: "Ik zie dat je vaak camel tonen liket - dat matcht perfect met je warme undertone!"

OUTFIT GENERATIE:
Als gevraagd om outfits, gebruik:
1. Hun archetype (${archetypeDesc})
2. Hun liked styles uit swipes (indien beschikbaar)
3. Hun budget range
4. Hun preferred brands
5. Hun kleurenpalet

Beschrijf kort welke items + waarom ze bij dit TOTALE profiel passen.`;
}
