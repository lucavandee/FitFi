import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8888",
  "https://fitfi.ai",
  "https://www.fitfi.ai",
];

function okOrigin(o?: string) {
  return !!o && ORIGINS.includes(o);
}

export const handler: Handler = async (event) => {
  const origin = event.headers.origin;

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": okOrigin(origin) ? origin! : ORIGINS[0],
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": okOrigin(origin) ? origin! : ORIGINS[0],
      },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { photoUrl, userId } = JSON.parse(event.body || "{}");

    if (!photoUrl || !userId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": okOrigin(origin) ? origin! : ORIGINS[0],
        },
        body: JSON.stringify({ error: "photoUrl and userId required" }),
      };
    }

    if (!OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": okOrigin(origin) ? origin! : ORIGINS[0],
        },
        body: JSON.stringify({ error: "OpenAI API key not configured" }),
      };
    }

    // Call OpenAI Vision API
    const visionResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a professional color analyst. Analyze the person's photo and determine:
1. Skin undertone (warm/cool/neutral)
2. Skin tone depth (fair/light/medium/tan/deep)
3. Hair color (blonde/brown/black/red/grey/white)
4. Eye color (blue/green/brown/hazel/grey)
5. Seasonal color type (spring/summer/autumn/winter)
6. Best colors that flatter them (10 specific colors)
7. Colors to avoid (5 colors)

Respond ONLY in valid JSON format:
{
  "undertone": "warm",
  "skin_tone": "medium",
  "hair_color": "brown",
  "eye_color": "brown",
  "seasonal_type": "autumn",
  "best_colors": ["olive", "camel", "rust", "cream", "terracotta", "chocolate", "teal", "coral", "gold", "burgundy"],
  "avoid_colors": ["bright pink", "icy blue", "pure white", "neon yellow", "cool grey"],
  "confidence": 0.85,
  "reasoning": "Warm undertone with medium skin depth suggests autumn palette with earthy, warm tones"
}`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this person's coloring for a personal color analysis",
                },
                {
                  type: "image_url",
                  image_url: { url: photoUrl },
                },
              ],
            },
          ],
          max_tokens: 500,
        }),
      }
    );

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error("OpenAI Vision API error:", errorText);
      throw new Error(`OpenAI Vision API failed: ${visionResponse.status}`);
    }

    const visionData = await visionResponse.json();
    const content = visionData.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI Vision");
    }

    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Invalid response format from AI");
    }

    // Add metadata
    analysis.analysis_date = new Date().toISOString();
    analysis.analyzed_by = "openai-gpt-4o-vision";

    // Save to database
    if (SUPABASE_URL && SUPABASE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      const { error: updateError } = await supabase
        .from("style_profiles")
        .update({
          color_analysis: analysis,
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Failed to save analysis:", updateError);
        // Continue anyway - user still gets analysis
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": okOrigin(origin) ? origin! : ORIGINS[0],
      },
      body: JSON.stringify(analysis),
    };
  } catch (error) {
    console.error("Color analysis error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": okOrigin(origin) ? origin! : ORIGINS[0],
      },
      body: JSON.stringify({
        error: "Color analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
