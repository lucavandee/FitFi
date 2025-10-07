// netlify/functions/nova.ts
import type { Handler } from "@netlify/functions";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { generateColorAdvice, detectColorIntent } from "./lib/colorAdvice";
import { generateOutfit, detectOutfitIntent } from "./lib/outfitGenerator";

const ORIGINS = ["https://www.fitfi.ai", "https://fitfi.ai", "http://localhost:5173", "http://localhost:8888"];
const START = "<<<FITFI_JSON>>>";
const END = "<<<END_FITFI_JSON>>>";

type Role = "system" | "user" | "assistant";
type Msg = { role: Role; content: string };

interface UserContext {
  archetype?: string;
  undertone?: "warm" | "cool" | "neutral";
  sizes?: { tops: string; bottoms: string; shoes: string };
  budget?: { min: number; max: number };
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

  if (headers["x-fitfi-archetype"]) {
    context.archetype = headers["x-fitfi-archetype"];
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

  return context;
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
        "Access-Control-Allow-Headers": "content-type, x-fitfi-tier, x-fitfi-uid, x-fitfi-archetype, x-fitfi-undertone, x-fitfi-sizes, x-fitfi-budget",
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
    if (!upstreamEnabled || !userText || responseType !== "general") {
      // Include products only for outfit responses (not for color, conversational, etc.)
      const includeProducts = responseType === "outfit" && products.length > 0;
      responseBody = buildLocalResponse(traceId, explanation, products, includeProducts);
    } else {
      // Upstream (OpenAI) - not implemented yet, use fallback
      responseBody = buildLocalResponse(traceId, explanation, products, true);
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