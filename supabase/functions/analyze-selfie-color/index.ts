import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ColorAnalysis {
  undertone: 'warm' | 'cool' | 'neutral';
  skin_tone: string;
  hair_color: string;
  eye_color: string;
  seasonal_type: 'spring' | 'summer' | 'autumn' | 'winter';
  best_colors: string[];
  avoid_colors: string[];
  confidence: number;
  reasoning?: string;
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { photoUrl, userId, isAnonymous } = await req.json();

    if (!photoUrl) {
      return new Response(
        JSON.stringify({ error: 'Photo URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🔒 PREMIUM ONLY: Check if user has premium access
    if (userId && !isAnonymous) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('tier, subscription_status')
        .eq('id', userId)
        .maybeSingle();

      const isPremium = profile?.tier === 'premium' || profile?.tier === 'founder';
      const hasActiveSubscription = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing';

      if (!isPremium && !hasActiveSubscription) {
        console.log('[analyze-selfie-color] Premium required:', { userId, tier: profile?.tier });
        return new Response(
          JSON.stringify({
            error: 'Premium feature',
            message: 'Color analysis is een premium functie. Upgrade je account om deze feature te gebruiken.',
            requiresPremium: true
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('[analyze-selfie-color] Analyzing photo:', { photoUrl, userId, isAnonymous });

    // Call OpenAI Vision API for color analysis
    const prompt = `Analyze this selfie for personal color analysis. Determine:
1. Skin undertone (warm, cool, or neutral)
2. Skin tone description
3. Hair color
4. Eye color
5. Seasonal color type (spring, summer, autumn, or winter)
6. Best colors that complement their natural coloring (5-8 specific colors)
7. Colors to avoid (3-5 colors)

Respond in JSON format:
{
  "undertone": "warm" | "cool" | "neutral",
  "skin_tone": "light/medium/deep with warm/cool undertone",
  "hair_color": "specific color",
  "eye_color": "specific color",
  "seasonal_type": "spring" | "summer" | "autumn" | "winter",
  "best_colors": ["color1", "color2", ...],
  "avoid_colors": ["color1", "color2", ...],
  "confidence": 0.85,
  "reasoning": "Brief explanation of the analysis"
}`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: photoUrl,
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 600,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('[analyze-selfie-color] OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Color analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const analysis: ColorAnalysis = JSON.parse(jsonMatch[0]);

    console.log('[analyze-selfie-color] Analysis complete:', {
      undertone: analysis.undertone,
      seasonal_type: analysis.seasonal_type,
      confidence: analysis.confidence
    });

    // Store in database if user is authenticated
    if (userId && !isAnonymous) {
      try {
        const { error: dbError } = await supabaseAdmin
          .from('photo_analyses')
          .insert({
            user_id: userId,
            photo_url: photoUrl,
            analysis_result: analysis,
            detected_colors: analysis.best_colors,
            detected_style: analysis.seasonal_type,
            match_score: Math.round(analysis.confidence * 100),
            suggestions: analysis.best_colors.slice(0, 3)
          });

        if (dbError) {
          console.error('[analyze-selfie-color] Database insert error:', dbError);
          // Don't fail the request if DB insert fails
        } else {
          console.log('[analyze-selfie-color] Stored analysis in database');
        }
      } catch (dbErr) {
        console.error('[analyze-selfie-color] Database error:', dbErr);
        // Continue anyway
      }
    }

    return new Response(
      JSON.stringify(analysis),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (err) {
    console.error('[analyze-selfie-color] Function error:', err);
    return new Response(
      JSON.stringify({
        error: 'Analysis failed',
        details: (err as Error).message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});