import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface FullAnalysis {
  moodTags: string[];
  archetypeWeights: Record<string, number>;
  dominantColors: string[];
  styleAttributes: { formality: number; boldness: number };
  confidence: number;
  reasoning: string;
}

const ARCHETYPES = ['MINIMALIST', 'CLASSIC', 'SMART_CASUAL', 'STREETWEAR', 'ATHLETIC', 'AVANT_GARDE'];

const ALLOWED_TAGS = [
  'minimal', 'clean', 'monochrome', 'modern', 'refined', 'tonal', 'effen', 'simpel',
  'classic', 'tailored', 'preppy', 'elegant', 'sophisticated', 'timeless', 'vintage', 'smart', 'formal',
  'smart-casual', 'casual', 'layered', 'knit', 'warm', 'relaxed',
  'street', 'urban', 'oversized', 'streetwear', 'hoodie', 'sneaker',
  'sport', 'athletic', 'performance', 'tech', 'athleisure',
  'avant', 'conceptual', 'asymmetric', 'statement', 'edge', 'dramatic',
  'kantoor', 'evening', 'weekend', 'date', 'summer', 'winter', 'autumn', 'spring',
  'power', 'flowing', 'feminine', 'masculine', 'sustainable', 'heritage',
  'bomber', 'cargo', 'denim', 'leather', 'utility', 'crochet', 'floral',
  'boho', 'romantic', 'grunge', 'retro', 'sporty', 'cozy', 'effortless', 'chic',
  'dutch', 'premium', 'sleek', 'bold', 'soft', 'fresh',
];

const ALLOWED_COLORS = [
  'zwart', 'wit', 'grijs', 'beige', 'camel', 'navy', 'blauw', 'groen',
  'olijf', 'bordeaux', 'bruin', 'terracotta', 'roze', 'creme', 'cognac',
  'goud', 'rood', 'geel', 'kobalt', 'nude', 'oranje', 'lila', 'turquoise',
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isAdmin = user.app_metadata?.is_admin === true;
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;
    const gender = formData.get('gender') as string;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Image = btoa(binary);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `You are a fashion style analysis expert for FitFi, a Dutch style profiling platform.

Analyze this fashion outfit photo and provide a COMPLETE style analysis.

Gender context: ${gender || 'unisex'}

You must return a JSON object with ALL of these fields:

1. "moodTags" - Array of 4-6 tags from this list: ${ALLOWED_TAGS.join(', ')}
   Pick tags that describe the vibe, fit, formality, and occasion.

2. "archetypeWeights" - Object with weights for these 6 style archetypes. Weights MUST sum to exactly 1.0.
   Archetypes: ${ARCHETYPES.join(', ')}
   - MINIMALIST: Clean lines, muted colors, architectural, less-is-more
   - CLASSIC: Timeless, tailored, preppy, heritage, polished
   - SMART_CASUAL: Relaxed polish, layered, versatile, approachable
   - STREETWEAR: Urban, oversized, sneaker culture, bold graphics
   - ATHLETIC: Performance, sporty, tech fabrics, athleisure
   - AVANT_GARDE: Conceptual, asymmetric, dramatic, deconstructed
   Give the primary archetype 0.45-0.75, secondary 0.15-0.35, and optionally a third 0.05-0.20.
   Only include archetypes with weight > 0.

3. "dominantColors" - Array of 1-3 main colors from this Dutch color list: ${ALLOWED_COLORS.join(', ')}
   Pick the most prominent colors in the outfit (not the background).

4. "styleAttributes" - Object with exactly two keys:
   - "formality": number 0.0 (ultra casual / gym) to 1.0 (black tie / gala)
   - "boldness": number 0.0 (safe / understated / neutral) to 1.0 (maximum statement / dramatic)

5. "confidence" - Your confidence in this analysis, 0.0 to 1.0.

6. "reasoning" - One sentence explaining the overall style assessment.

Respond with ONLY the JSON object, no markdown formatting.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${file.type};base64,${base64Image}`,
                detail: 'low'
              }
            }
          ]
        }],
        max_tokens: 800,
        temperature: 0.4
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in response');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response');
    }

    const analysis: FullAnalysis = JSON.parse(jsonMatch[0]);

    const validTags = (analysis.moodTags || []).filter(
      (tag: string) => ALLOWED_TAGS.includes(tag.toLowerCase())
    );

    const validColors = (analysis.dominantColors || []).filter(
      (color: string) => ALLOWED_COLORS.includes(color.toLowerCase())
    );

    const validWeights: Record<string, number> = {};
    let weightSum = 0;
    if (analysis.archetypeWeights) {
      for (const arch of ARCHETYPES) {
        const w = analysis.archetypeWeights[arch];
        if (typeof w === 'number' && w > 0) {
          validWeights[arch] = Math.round(w * 100) / 100;
          weightSum += validWeights[arch];
        }
      }
      if (weightSum > 0 && Math.abs(weightSum - 1.0) > 0.01) {
        for (const key of Object.keys(validWeights)) {
          validWeights[key] = Math.round((validWeights[key] / weightSum) * 100) / 100;
        }
      }
    }

    const formality = typeof analysis.styleAttributes?.formality === 'number'
      ? Math.max(0, Math.min(1, Math.round(analysis.styleAttributes.formality * 100) / 100))
      : 0.5;
    const boldness = typeof analysis.styleAttributes?.boldness === 'number'
      ? Math.max(0, Math.min(1, Math.round(analysis.styleAttributes.boldness * 100) / 100))
      : 0.3;

    return new Response(
      JSON.stringify({
        success: true,
        moodTags: validTags,
        archetypeWeights: validWeights,
        dominantColors: validColors,
        styleAttributes: { formality, boldness },
        confidence: analysis.confidence || 0.75,
        reasoning: analysis.reasoning || ''
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({
        error: 'Analysis failed',
        details: (err as Error).message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
