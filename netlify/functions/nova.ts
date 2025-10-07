// netlify/functions/nova.ts
import type { Handler } from "@netlify/functions";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { generateColorAdvice, detectColorIntent } from "./lib/colorAdvice";
import { generateOutfit, detectOutfitIntent } from "./lib/outfitGenerator";

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const ORIGINS = ["https://www.fitfi.ai", "https://fitfi.ai", "http://localhost:5173", "http://localhost:8888"];
const START = "<<<FITFI_JSON>>>";
const END = "<<<END_FITFI_JSON>>>";

type Role = "system" | "user" | "assistant";
type Msg = { role: Role; content: string };

interface AIColorAnalysis {
  undertone: "warm" | "cool" | "neutral";
  skin_tone: string;
  hair_color: string;
  eye_color: string;
  seasonal_type: "spring" | "summer" | "autumn" | "winter";
  best_colors: string[];
  avoid_colors: string[];
  confidence: number;
  reasoning?: string;
}

interface UserContext {
  gender?: "male" | "female" | "non-binary" | "prefer-not-to-say";
  archetype?: string;
  bodyType?: string;
  stylePreferences?: string[];
  occasions?: string[];
  undertone?: "warm" | "cool" | "neutral";
  sizes?: { tops: string; bottoms: string; shoes: string };
  budget?: { min: number; max: number };
  baseColors?: string;
  preferredBrands?: string[];
  allQuizAnswers?: Record<string, any>;
  aiColorAnalysis?: AIColorAnalysis;
}

function okOrigin(o?: string) { return !!o && ORIGINS.includes(o); }
function nonEmptyUser(messages?: Msg[]): string | null {
  if (!Array.isArray(messages)) return null;
  const lastUser = [...messages].reverse().find(m => m?.role === "user");
  const text = (lastUser?.content ?? "").trim();
  return text.length ? text : null;
}

function detectIntentType(text: string): "greeting" | "question" | "complaint" | "style_request" | "unknown" {
  const lower = text.toLowerCase().trim();

  // Greetings
  if (/^(hi|hoi|hey|hallo|hai|yo|sup|hello|goedemorgen|goedemiddag|goedenavond)[\s!.?]*$/i.test(lower)) {
    return "greeting";
  }

  // Complaints / meta questions
  if (/(waarom|snap niet|begrijp niet|klopt niet|fout|verkeerd|altijd hetzelfde|saai|slaat niet op|absurd)/i.test(lower)) {
    return "complaint";
  }

  // Questions about Nova itself
  if (/(wie ben je|wat kun je|wat doe je|hoe werk je|wat is dit|help|uitleg)/i.test(lower)) {
    return "question";
  }

  // Style requests (keywords)
  if (/(outfit|kleding|stijl|look|combineren|dragen|passen|match|kleuren)/i.test(lower)) {
    return "style_request";
  }

  return "unknown";
}

function generateConversationalResponse(text: string, intentType: string, conversationHistory?: Msg[]): string {
  // Check if we already gave outfit advice in this conversation
  const hasGivenOutfit = conversationHistory?.some(m =>
    m.role === "assistant" && (m.content.includes("outfit") || m.content.includes("kleding"))
  );

  switch (intentType) {
    case "greeting":
      return "Hey! Leuk dat je er bent. Ik help je graag met je stijl. Vertel me, waar zoek je kleding voor? Een specifieke gelegenheid, of gewoon dagelijkse looks?";

    case "complaint":
      if (hasGivenOutfit) {
        return "Je hebt gelijk, laat me een andere richting opgaan. Wat voor stijl spreekt je meer aan? Denk aan: sportief, zakelijk, casual, elegant, alternatief... of vertel me gewoon wat je mooi vindt!";
      }
      return "Sorry! Laat me opnieuw beginnen. Om je goed te helpen: wat is je stijl? Meer casual, nett, sportief, elegant? En zijn er kleuren waar je van houdt of juist vermijdt?";

    case "question":
      return "Ik ben Nova, je persoonlijke style assistent. Ik help je outfits samenstellen die bij jou passen. Je kunt me vragen:\n\n• \"Wat past bij mij voor een date?\"\n• \"Casual outfit voor het weekend\"\n• \"Welke kleuren staan me goed?\"\n• \"Zakelijke look met karakter\"\n\nWaar kan ik je mee helpen?";

    case "style_request":
      return "Top! Laten we iets leuks voor je vinden. Geef me wat meer context: wat is de gelegenheid? Wat is je vibe (casual, nett, stoer)? En zijn er kleuren die je nu veel draagt?";

    case "unknown":
    default:
      if (text.length < 10) {
        return "Hmm, vertel me wat meer! Waar denk je aan? Een specifieke gelegenheid, een stijl die je wilt proberen, of wil je gewoon inspiratie?";
      }
      return "Interessant! Om je goed te adviseren: wat voor stijl past bij jou? En waar ga je deze kleding dragen?";
  }
}

function sampleProducts() {
  return [
    {
      id: "ABC123",
      retailer: "zalando",
      retailer_sku: "ABC123",
      title: "Overshirt wol blend — ecru",
      image: "https://images.pexels.com/photos/6311653/pexels-photo-6311653.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=2",
      url: "https://www.zalando.nl/voorbeeld?affid=fitfi",
      price: { current: 129.95, original: 159.95 },
      currency: "EUR",
      availability: "in_stock",
      sizes: ["S","M","L"],
      color: "ecru",
      badges: ["Aanrader"],
      reason: "Textuur en kleurmatch met jeans; werkt in lagen."
    },
    {
      id: "BKF-7788",
      retailer: "bijenkorf",
      retailer_sku: "7788",
      title: "Slim jeans mid-indigo",
      image: "https://images.pexels.com/photos/6311397/pexels-photo-6311397.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=2",
      url: "https://www.debijenkorf.nl/voorbeeld?affid=fitfi",
      price: { current: 99.95 },
      currency: "EUR",
      availability: "in_stock",
      sizes: ["29","30","31","32"],
      color: "indigo",
      badges: ["Essentieel"],
      reason: "Net silhouet, subtiele wassing — basis voor smart-casual."
    },
    {
      id: "ZAL-WHT-SNK",
      retailer: "zalando",
      title: "Witte sneaker — strak profiel",
      image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=2",
      url: "https://www.zalando.nl/voorbeeld-sneaker?affid=fitfi",
      price: { current: 89.95 },
      currency: "EUR",
      availability: "in_stock",
      sizes: ["40","41","42","43","44"],
      color: "wit",
      reason: "Frisse basis die het geheel modern en licht houdt."
    },
    {
      id: "BKF-TEE",
      retailer: "bijenkorf",
      title: "Heavyweight T-shirt — off-white",
      image: "https://images.pexels.com/photos/6311670/pexels-photo-6311670.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=2",
      url: "https://www.debijenkorf.nl/voorbeeld-tee?affid=fitfi",
      price: { current: 29.95 },
      currency: "EUR",
      availability: "in_stock",
      sizes: ["S","M","L","XL"],
      color: "off-white",
      reason: "Stevige stof geeft vorm; matcht met overshirt."
    }
  ];
}

function buildLocalResponse(
  traceId: string,
  explanation: string,
  products: any[],
  includeProducts: boolean = true
): string {
  const lines: string[] = [];
  const send = (obj: any) => lines.push(`data: ${JSON.stringify(obj)}\n\n`);

  send({ type: "meta", model: "fitfi-nova-local", traceId });

  // Send explanation in chunks (simulates streaming)
  const chunkSize = 50;
  for (let i = 0; i < explanation.length; i += chunkSize) {
    const chunk = explanation.slice(i, i + chunkSize);
    send({ type: "delta", text: chunk });
  }

  // Send products as dedicated JSON event (NO MARKERS!)
  if (includeProducts && products.length > 0) {
    send({
      type: "json",
      data: {
        type: "outfits",
        products,
        explanation
      }
    });
  }

  send({ type: "done" });

  return lines.join("");
}

function parseUserContext(headers: Record<string, any>): UserContext {
  const context: UserContext = {};

  // Gender - CRITICAL for avoiding assumptions
  if (headers["x-fitfi-gender"]) {
    const gender = headers["x-fitfi-gender"];
    if (["male", "female", "non-binary", "prefer-not-to-say"].includes(gender)) {
      context.gender = gender as "male" | "female" | "non-binary" | "prefer-not-to-say";
    }
  }

  if (headers["x-fitfi-archetype"]) {
    context.archetype = headers["x-fitfi-archetype"];
  }

  // Body type - CRITICAL for fit recommendations
  if (headers["x-fitfi-bodytype"]) {
    context.bodyType = headers["x-fitfi-bodytype"];
  }

  // Style preferences - CRITICAL for avoiding generic advice
  if (headers["x-fitfi-styleprefs"]) {
    try {
      context.stylePreferences = JSON.parse(headers["x-fitfi-styleprefs"]);
    } catch {}
  }

  // Occasions - CRITICAL for context-appropriate recommendations
  if (headers["x-fitfi-occasions"]) {
    try {
      context.occasions = JSON.parse(headers["x-fitfi-occasions"]);
    } catch {}
  }

  if (headers["x-fitfi-undertone"]) {
    context.undertone = headers["x-fitfi-undertone"] as "warm" | "cool" | "neutral";
  }

  if (headers["x-fitfi-sizes"]) {
    try {
      context.sizes = JSON.parse(headers["x-fitfi-sizes"]);
    } catch {}
  }

  if (headers["x-fitfi-budget"]) {
    try {
      context.budget = JSON.parse(headers["x-fitfi-budget"]);
    } catch {}
  }

  // Base colors preference from quiz
  if (headers["x-fitfi-basecolors"]) {
    context.baseColors = headers["x-fitfi-basecolors"];
  }

  // Preferred brands from quiz
  if (headers["x-fitfi-brands"]) {
    try {
      context.preferredBrands = JSON.parse(headers["x-fitfi-brands"]);
    } catch {}
  }

  // ALL quiz answers as fallback
  if (headers["x-fitfi-quiz"]) {
    try {
      context.allQuizAnswers = JSON.parse(headers["x-fitfi-quiz"]);
    } catch {}
  }

  // AI Color Analysis from photo
  if (headers["x-fitfi-coloranalysis"]) {
    try {
      context.aiColorAnalysis = JSON.parse(headers["x-fitfi-coloranalysis"]);
    } catch {}
  }

  return context;
}

async function callOpenAI(
  messages: OpenAIMessage[],
  userContext: UserContext,
  apiKey: string,
  traceId: string
): Promise<string> {
  const systemPrompt = `Je bent Nova, een premium style assistent voor FitFi.ai.

CONTEXT OVER USER (GEBRUIK ALTIJD):
${userContext.gender ? `- Gender: ${userContext.gender}` : "- Gender: ONBEKEND"}
${userContext.bodyType ? `- Lichaamsvorm: ${userContext.bodyType}` : ""}
${userContext.archetype ? `- Stijl archetype: ${userContext.archetype}` : ""}
${userContext.stylePreferences && userContext.stylePreferences.length > 0 ? `- Stijl voorkeuren: ${userContext.stylePreferences.join(", ")}` : ""}
${userContext.occasions && userContext.occasions.length > 0 ? `- Gelegenheden: ${userContext.occasions.join(", ")}` : ""}
${userContext.baseColors ? `- Basis kleurvoorkeur: ${userContext.baseColors}` : ""}
${userContext.preferredBrands && userContext.preferredBrands.length > 0 ? `- Favoriete merken: ${userContext.preferredBrands.join(", ")}` : ""}
${userContext.undertone ? `- Huidsondertoon: ${userContext.undertone}` : ""}
${userContext.sizes ? `- Maten: ${userContext.sizes.tops} (tops), ${userContext.sizes.bottoms} (broeken), ${userContext.sizes.shoes} (schoenen)` : ""}
${userContext.budget ? `- Budget: €${userContext.budget.min}-${userContext.budget.max} per item` : ""}

${userContext.aiColorAnalysis ? `
🎨 AI KLEURENANALYSE (uit foto):
✅ Persoonlijke kleurenanalyse beschikbaar!
- Ondertoon: ${userContext.aiColorAnalysis.undertone}
- Huidskleur: ${userContext.aiColorAnalysis.skin_tone}
- Haarkleur: ${userContext.aiColorAnalysis.hair_color}
- Oogkleur: ${userContext.aiColorAnalysis.eye_color}
- Seizoenstype: ${userContext.aiColorAnalysis.seasonal_type}
- Beste kleuren: ${userContext.aiColorAnalysis.best_colors.join(", ")}
- Vermijd kleuren: ${userContext.aiColorAnalysis.avoid_colors.join(", ")}
- Betrouwbaarheid: ${Math.round(userContext.aiColorAnalysis.confidence * 100)}%
${userContext.aiColorAnalysis.reasoning ? `- Waarom: ${userContext.aiColorAnalysis.reasoning}` : ""}

KRITIEKE REGEL - KLEUR MATCHING (gebruik dit ALTIJD als beschikbaar):
✅ Raad ALLEEN kleuren aan uit de "beste kleuren" lijst
✅ Leg uit WAAROM een kleur flatteert (undertone/seasonal match)
✅ Vermijd ALTIJD de "vermijd kleuren" lijst
✅ Gebruik specifieke kleurnamen (niet "blauw" maar "teal" of "navy")

Voorbeeld outfit beschrijving:
"Een camel chino (past perfect bij je warme undertone!)
Olijfgroen overhemd (autumn palette - flatteert je ${userContext.aiColorAnalysis.hair_color} haar)
Cream sneakers (complementeert je ${userContext.aiColorAnalysis.skin_tone} huidstint)"
` : ""}

${userContext.allQuizAnswers ? `\nALLE QUIZ DATA: ${JSON.stringify(userContext.allQuizAnswers, null, 2)}` : ""}

KRITIEKE REGEL - GENDER:
${!userContext.gender ? `
⚠️ GENDER IS ONBEKEND - MAAK GEEN AANNAMES!
- Vraag EERST: "Mag ik vragen of je een outfit zoekt voor heren of dames?"
- Of gebruik neutrale taal tot je het weet
- NOOIT automatisch aannemen!
` : `
✅ Gender bekend: ${userContext.gender}
- Voor male: pak, overhemd, pantalon, stropdas, manchetknopen
- Voor female: jurk, rok, blouse, hakken, sieraden
- Voor non-binary: mix of neutrale items, vraag voorkeur
- Voor prefer-not-to-say: gebruik neutrale taal, vraag voorkeur
`}

KRITIEKE REGEL - LICHAAMSVORM (VOORKOM GENERIEK ADVIES):
${userContext.bodyType ? `
✅ Lichaamsvorm bekend: ${userContext.bodyType}

PAS-RICHTLIJNEN PER LICHAAMSVORM:
- **inverted_triangle**: Breed bovenlichaam, smalle heupen
  → Vermijd: Te strakke tops, shoulder pads, horizontale strepen bovenlichaam
  → Raad aan: V-hals, verticale lijnen, statement broeken/rokken, donkere tops

- **athletic/rechthoekig**: Weinig taille definitie, rechte lijnen
  → Raad aan: Riem op natuurlijke taille, peplum, wrap-jurken, gelaagde looks
  → Vermijd: Te strakke rechte lijnen, shapeless oversized

- **pear/driehoek**: Smalle schouders, bredere heupen
  → Raad aan: Statement tops, boat necks, bright colors bovenlichaam, A-lijn rokken/broeken
  → Vermijd: Skinny jeans zonder lange top, cargo broeken, horizontale strepen onderlichaam

- **hourglass/zandloper**: Gedefinieerde taille, gebalanceerde schouders/heupen
  → Raad aan: Tailored fits, wrap-dresses, hoge taille, bodycon waar gepast
  → Vermijd: Shapeless oversized, drop-waist, te veel volume

- **apple/rond**: Volume rond middel, slankere benen
  → Raad aan: Empire waist, A-lijn, verticale lijnen, V-hals, monochrome looks
  → Vermijd: Te strakke taille, crop tops, belts op natuurlijke taille

GEBRUIK DIT BIJ ELKE OUTFIT AANBEVELING!
` : `
⚠️ LICHAAMSVORM ONBEKEND - Vraag eerst: "Wat voor pasvorm voel je je het prettigst in: slim-fit, regular-fit, of wat ruimer/oversized?"
`}

KRITIEKE REGEL - STIJLVOORKEUR (VOORKOM GENERIEK ADVIES):
${userContext.stylePreferences && userContext.stylePreferences.length > 0 ? `
✅ Stijlvoorkeuren bekend: ${userContext.stylePreferences.join(", ")}

MATCH ALTIJD MET HUN STIJL:
- **minimalist**: Clean lines, neutrale kleuren, tijdloze stukken, minder is meer
- **classic**: Tijdloze elegantie, gestructureerd, neutrale kleuren met subtiele accenten
- **bohemian**: Vrij, artistiek, lagen, prints, aardse tinten, flowy materialen
- **streetwear**: Urban, sneakers, hoodies, oversized, statement stukken, logo's
- **romantic**: Zachte stoffen, pastelkleuren, ruches, bloemenprints, vrouwelijke details
- **edgy**: Leather, asymmetrisch, zwart, studs, rock-inspired
- **preppy**: Gepolijst, collared shirts, blazers, loafers, traditional patterns

PAS ELKE AANBEVELING AAN DEZE STIJL!
` : `
⚠️ STIJLVOORKEUR ONBEKEND - Vraag: "Wat voor stijl vind je mooi: klassiek en tijdloos, modern en minimalistisch, of iets anders?"
`}

JE TAAK:
1. Voer een natuurlijk gesprek over stijl en mode
2. Stel slimme vervolgvragen om context te verzamelen
3. Als je genoeg info hebt over wat user wil (gelegenheid, stijl, kleuren), genereer dan een outfit advies
4. Wees persoonlijk, warm en professioneel - denk Apple × Lululemon niveau

CONVERSATIE FLOW:
- Bij vage input ("uitgaan", "inspiratie"): Vraag door naar specifieke gelegenheid, gewenste stijl/vibe, kleurvoorkeuren
- Bij context-rijke input: Geef concreet outfit advies met toelichting
- Onthoud wat user al heeft gezegd en bouw daarop voort
- Als gender onbekend en outfit gevraagd: EERST vragen voor wie de outfit is!

TOON:
- Nederlands, "je" vorm
- Premium maar toegankelijk
- Geen hyperbolen, wel enthousiast
- Concrete voorbeelden gebruiken
- Inclusief en respectvol

Als user genoeg context heeft gegeven voor een outfit, geef dan:
- Beschrijving van de complete look (passend bij gender!)
- Waarom deze items bij elkaar passen
- Hoe het bij de gelegenheid past

Wees GEEN papegaai - als user iets herhaalt of vastloopt, herken dat en help ze vooruit.`;

  const openaiMessages: OpenAIMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: openaiMessages,
        temperature: 0.8,
        max_tokens: 500,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Sorry, ik kon geen response genereren.";
  } catch (error) {
    console.error("OpenAI call failed:", error);
    throw error;
  }
}

export const handler: Handler = async (event) => {
  const origin = event.headers.origin || (event.headers as any).Origin;
  const traceId = randomUUID();
  const upstreamEnabled = (process.env.NOVA_UPSTREAM || "").toLowerCase() === "on" && !!process.env.OPENAI_API_KEY;

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": okOrigin(origin) ? origin! : ORIGINS[0],
        "Access-Control-Allow-Headers": "content-type, x-fitfi-tier, x-fitfi-uid, x-fitfi-gender, x-fitfi-bodytype, x-fitfi-styleprefs, x-fitfi-occasions, x-fitfi-archetype, x-fitfi-undertone, x-fitfi-sizes, x-fitfi-budget, x-fitfi-basecolors, x-fitfi-brands, x-fitfi-quiz, x-fitfi-coloranalysis",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  if (!okOrigin(origin)) return { statusCode: 403, body: "Forbidden" };

  const userContext = parseUserContext(event.headers);

  let supabase;
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey);
    }
  } catch (e) {
    console.warn("Supabase client creation failed:", e);
  }

  // AUTHENTICATION & RATE LIMITING CHECK (GRACEFUL DEGRADATION)
  const userId = event.headers["x-fitfi-uid"];

  // Check if userId looks like a valid UUID (contains dashes, not "anon")
  const isValidUserId = userId && userId !== "anon" && userId.includes("-");

  // Only enforce rate limiting for valid authenticated users
  if (isValidUserId && supabase) {
    try {
      const { data: accessCheck, error: accessError } = await supabase
        .rpc('can_use_nova', { p_user_id: userId });

      if (!accessError && accessCheck && accessCheck.length > 0) {
        const check = accessCheck[0];

        // Only block if user is authenticated but over limit or no quiz
        if (!check.can_use) {
          console.warn(`⛔ Access denied for ${userId}: ${check.reason}`);
          return {
            statusCode: 403,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": okOrigin(origin) ? origin! : ORIGINS[0],
            },
            body: JSON.stringify({
              error: "access_denied",
              message: check.reason,
              tier: check.tier,
              usage: {
                current: check.current_count,
                limit: check.tier_limit
              },
              action: check.reason.includes("quiz") ? "complete_quiz" : "upgrade"
            })
          };
        }

        // Increment usage counter for authenticated users
        await supabase.rpc('increment_nova_usage', { p_user_id: userId });
        console.log(`✅ Nova access: ${check.tier} (${check.current_count + 1}/${check.tier_limit})`);
      } else {
        console.warn("⚠️ Access check returned no data or error:", accessError);
        // Allow with degraded mode (no usage tracking)
      }
    } catch (checkError) {
      console.warn("⚠️ Could not validate Nova access:", checkError);
      // Allow with degraded mode (graceful degradation)
    }
  } else {
    // No valid user ID or no Supabase - allow with warning
    console.warn("⚠️ No valid auth user ID (got:", userId, ") - Allowing with degraded mode. Consider prompting user to log in.");
  }

  let body: { messages?: Msg[]; mode?: string } = {};
  try { body = JSON.parse(event.body || "{}"); } catch {}
  const userText = nonEmptyUser(body.messages);

  let explanation = "";
  let products: any[] = [];
  let responseType: "color" | "outfit" | "conversational" | "general" = "general";

  // First: detect conversational intent (greetings, complaints, questions)
  const intentType = userText ? detectIntentType(userText) : "unknown";

  if (userText && userContext.undertone && detectColorIntent(userText)) {
    // Color advice
    responseType = "color";
    explanation = generateColorAdvice(
      userContext.undertone,
      userContext.archetype || "casual_chic",
      userText
    );
  } else if (userText && detectOutfitIntent(userText)) {
    // Outfit generation
    responseType = "outfit";
    const result = await generateOutfit(userText, userContext, supabase);
    explanation = result.explanation;
    products = result.products;
  } else if (["greeting", "complaint", "question"].includes(intentType)) {
    // Conversational response (no products)
    responseType = "conversational";
    explanation = generateConversationalResponse(userText || "", intentType, body.messages);
    products = [];
  } else if (intentType === "style_request") {
    // Style request but needs more context
    responseType = "conversational";
    explanation = generateConversationalResponse(userText || "", intentType, body.messages);
    products = [];
  } else {
    // Unknown - ask for clarification
    responseType = "conversational";
    explanation = generateConversationalResponse(userText || "", "unknown", body.messages);
    products = [];
  }

  // Build response (no streaming in Netlify Functions V1)
  let responseBody: string = "";

  try {
    // Check if we should use OpenAI for conversational responses
    if (upstreamEnabled && userText && responseType === "conversational") {
      // Use OpenAI for intelligent conversation
      console.log("Using OpenAI for conversational response");

      try {
        const openaiResponse = await callOpenAI(
          body.messages || [],
          userContext,
          process.env.OPENAI_API_KEY!,
          traceId
        );

        explanation = openaiResponse;
        products = []; // Conversational - no products
        responseBody = buildLocalResponse(traceId, explanation, products, false);
      } catch (openaiError) {
        console.error("OpenAI failed, falling back to local:", openaiError);
        // Fallback to local response
        const includeProducts = responseType === "outfit" && products.length > 0;
        responseBody = buildLocalResponse(traceId, explanation, products, includeProducts);
      }
    } else {
      // Use local responses (color advice, outfit generation, or no OpenAI key)
      const includeProducts = responseType === "outfit" && products.length > 0;
      responseBody = buildLocalResponse(traceId, explanation, products, includeProducts);
    }
  } catch (err) {
    console.error("Response build error:", err);
    responseBody = buildLocalResponse(traceId, "Sorry, er ging iets mis.", [], false);
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Access-Control-Allow-Origin": okOrigin(origin) ? origin! : ORIGINS[0],
    },
    body: responseBody,
  };
};