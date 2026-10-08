import { createClient } from 'npm:@supabase/supabase-js@2';
import { buildCorsHeaders } from "../_shared/cors.ts";
import {
  BUCKET,
  LINK_SECONDEN,
  MAX_ANALYSES_PER_SESSIE,
  controleerPad,
  leesAnalyse,
  rolUitToken,
} from "./regels.ts";

/**
 * Kleuranalyse van de selfie uit quizstap 14.
 *
 * In: { path, sessionId }. De quiz uploadt de foto zelf, anoniem, naar
 * user-photos/anon_<sessionId>/. Die bucket is privé: een publieke URL bestaat
 * niet (die gaf "Bucket not found", en daardoor kreeg OpenAI de foto nooit).
 * Deze functie controleert dat het pad in de map van de aanroeper ligt, maakt
 * met de service role een link die LINK_SECONDEN geldig is, en geeft alleen
 * die link aan OpenAI.
 *
 * Uit: de ColorAnalysis die PhotoUpload.tsx verwacht. 429 als de sessie haar
 * limiet heeft bereikt; elke andere fout is een gewone foutstatus, zodat de
 * quiz een melding kan tonen in plaats van stil door te gaan.
 */
Deno.serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req);
  const antwoord = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return antwoord({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
      return antwoord({ error: 'Server configuration error' }, 500);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    let body: { path?: unknown; sessionId?: unknown } | null = null;
    try {
      body = await req.json();
    } catch {
      return antwoord({ error: 'Invalid request body' }, 400);
    }
    const path = body?.path;
    const sessionId = body?.sessionId;

    if (!path) {
      return antwoord({ error: 'Photo path is required' }, 400);
    }

    // Wie belt er? De quiz stuurt de anon-sleutel. Alleen een token met rol
    // authenticated is een ingelogde gebruiker, en dat token controleert
    // Supabase Auth hier. Een gebruikers-id uit de body telt nooit.
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    let userId: string | null = null;
    if (rolUitToken(token) === 'authenticated') {
      const { data, error: authError } = await supabaseAdmin.auth.getUser(token);
      if (authError || !data?.user) {
        return antwoord({ error: 'Invalid token' }, 401);
      }
      userId = data.user.id;
    }

    const controle = controleerPad(path, { sessionId, userId });
    if (!controle.ok) {
      console.log('[analyze-selfie-color] Pad geweigerd:', { reden: controle.reden, ingelogd: !!userId });
      return antwoord({ error: 'Photo path not allowed' }, 403);
    }

    // Alleen premium voor ingelogde aanroepers, zoals in de vorige versie.
    // De quiz belt anoniem; daar geldt de limiet per sessie hieronder.
    if (userId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('tier, subscription_status')
        .eq('id', userId)
        .maybeSingle();

      const isPremium = profile?.tier === 'premium' || profile?.tier === 'founder';
      const hasActiveSubscription = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing';

      if (!isPremium && !hasActiveSubscription) {
        console.log('[analyze-selfie-color] Premium required:', { tier: profile?.tier });
        return antwoord({
          error: 'Premium feature',
          message: 'Color analysis is een premium functie. Upgrade je account om deze feature te gebruiken.',
          requiresPremium: true
        }, 403);
      }
    }

    // Limiet per sessie: tel de bestanden in anon_<sessie-id>/. Mappen dieper
    // in de boom tellen niet mee; die kan deze functie ook niet analyseren.
    if (controle.soort === 'sessie') {
      const { data: objecten, error: lijstFout } = await supabaseAdmin.storage
        .from(BUCKET)
        .list(controle.map, { limit: 1000 });
      if (lijstFout) {
        console.error('[analyze-selfie-color] Map tellen mislukt:', lijstFout.message);
        return antwoord({ error: 'Analysis failed' }, 500);
      }
      const aantal = (objecten ?? []).filter((o) => o.id !== null).length;
      if (aantal > MAX_ANALYSES_PER_SESSIE) {
        console.log('[analyze-selfie-color] Limiet bereikt:', { aantal });
        return antwoord({ error: 'Analysis limit reached', limit: MAX_ANALYSES_PER_SESSIE }, 429);
      }
    }

    // De enige link naar de foto die de functie uitgeeft: ondertekend en kort
    // geldig. Nooit loggen, het token zit in de URL.
    const { data: link, error: linkFout } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(controle.pad, LINK_SECONDEN);
    if (linkFout || !link?.signedUrl) {
      return antwoord({ error: 'Photo not found' }, 404);
    }

    console.log('[analyze-selfie-color] Analyzing photo:', { soort: controle.soort });

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
                  url: link.signedUrl,
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 600,
        temperature: 0.7,
        // Niet bewaren als opgeslagen completion in het OpenAI-dashboard.
        // Staat de standaard al op false, dan verandert dit niets; het maakt
        // het alleen expliciet.
        store: false
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('[analyze-selfie-color] OpenAI API error:', openaiResponse.status, errorText.slice(0, 500));
      return antwoord({ error: 'Color analysis failed' }, 500);
    }

    const openaiData = await openaiResponse.json();
    const analysis = leesAnalyse(openaiData?.choices?.[0]?.message?.content);

    if (!analysis) {
      console.error('[analyze-selfie-color] Geen bruikbare analyse in het antwoord');
      return antwoord({ error: 'Analysis failed' }, 500);
    }

    console.log('[analyze-selfie-color] Analysis complete:', {
      undertone: analysis.undertone,
      seasonal_type: analysis.seasonal_type,
      confidence: analysis.confidence
    });

    // Store in database if user is authenticated
    if (userId) {
      try {
        const { error: dbError } = await supabaseAdmin
          .from('photo_analyses')
          .insert({
            user_id: userId,
            // Het opslagpad, geen URL: de bucket is privé.
            photo_url: controle.pad,
            analysis_result: analysis,
            detected_colors: analysis.best_colors,
            detected_style: analysis.seasonal_type,
            match_score: Math.round(analysis.confidence * 100),
            suggestions: analysis.best_colors.slice(0, 3)
          });

        if (dbError) {
          console.error('[analyze-selfie-color] Database insert error:', dbError);
          // Don't fail the request if DB insert fails
        }
      } catch (dbErr) {
        console.error('[analyze-selfie-color] Database error:', dbErr);
        // Continue anyway
      }
    }

    return antwoord(analysis, 200);

  } catch (err) {
    console.error('[analyze-selfie-color] Function error:', err);
    return antwoord({ error: 'Analysis failed' }, 500);
  }
});
