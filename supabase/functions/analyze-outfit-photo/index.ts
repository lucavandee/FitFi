import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  photoUrl: string;
  userProfile?: {
    archetype: string;
    undertone: string;
    colorPalette: string[];
    stylePreferences: string[];
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get OpenAI API key from environment
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const { photoUrl, userProfile }: AnalysisRequest = await req.json();

    if (!photoUrl) {
      return new Response(
        JSON.stringify({ error: "Photo URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build prompt based on user profile
    const profileContext = userProfile
      ? `
User Profile:
- Style Archetype: ${userProfile.archetype}
- Skin Undertone: ${userProfile.undertone}
- Color Palette: ${userProfile.colorPalette.join(", ")}
- Style Preferences: ${userProfile.stylePreferences.join(", ")}`
      : "";

    const prompt = `Je bent Nova, een expert fashion stylist. Analyseer deze outfit foto en geef gedetailleerde feedback.
${profileContext}

Geef je analyse in het volgende JSON format:
{
  "detected_items": ["item1", "item2", ...],
  "detected_colors": ["color1", "color2", ...],
  "detected_style": "style_name",
  "match_score": 0-100,
  "feedback": "Menselijke, vriendelijke feedback in het Nederlands (max 3-4 zinnen)",
  "suggestions": ["tip1", "tip2", "tip3"]
}

Als er een user profiel is, beoordeel dan hoe goed de outfit past bij:
- Hun archetype
- Hun kleurenpalet
- Hun undertone
- Hun style preferences

Wees specifiek en actionable in je feedback.`;

    // Call OpenAI Vision API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: photoUrl },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const analysisText = openaiData.choices[0]?.message?.content || "";

    // Parse JSON response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : analysisText;
      analysis = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse analysis:", analysisText);
      // Fallback to raw text
      analysis = {
        detected_items: [],
        detected_colors: [],
        detected_style: "unknown",
        match_score: 50,
        feedback: analysisText,
        suggestions: [],
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        raw_response: analysisText,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error analyzing photo:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to analyze photo",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
