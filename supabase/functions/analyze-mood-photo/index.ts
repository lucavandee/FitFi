import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface MoodAnalysis {
  moodTags: string[];
  confidence: number;
  reasoning: string;
}

Deno.serve(async (req: Request) => {
  console.log('🎨 Mood analysis function called:', req.method);

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

    // Check admin status from JWT app_metadata (avoids RLS recursion)
    const isAdmin = user.app_metadata?.is_admin === true;

    if (!isAdmin) {
      console.log('❌ Not admin:', { userId: user.id, appMetadata: user.app_metadata });
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Admin verified, parsing image...');

    const formData = await req.formData();
    const file = formData.get('image') as File;
    const gender = formData.get('gender') as string;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🖼️ Analyzing image:', { fileName: file.name, size: file.size, gender });

    const arrayBuffer = await file.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('❌ OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const availableTags = {
      style: [
        'minimal', 'maximalist', 'scandinavian', 'bohemian', 'industrial',
        'vintage', 'modern', 'classic', 'avant-garde', 'streetwear',
        'preppy', 'romantic', 'edgy', 'elegant', 'casual'
      ],
      mood: [
        'confident', 'relaxed', 'sophisticated', 'playful', 'bold',
        'understated', 'dramatic', 'serene', 'energetic', 'refined',
        'cozy', 'polished', 'effortless', 'luxe', 'laid-back'
      ],
      aesthetic: [
        'clean', 'layered', 'structured', 'flowing', 'fitted',
        'oversized', 'tailored', 'artistic', 'athletic', 'chic',
        'timeless', 'contemporary', 'eclectic', 'monochrome', 'colorful'
      ]
    };

    const allTags = [
      ...availableTags.style,
      ...availableTags.mood,
      ...availableTags.aesthetic
    ];

    console.log('🤖 Calling OpenAI Vision API...');

    const prompt = `Analyze this fashion outfit image and suggest mood tags that describe its style and aesthetic.\n\nGender context: ${gender || 'unisex'}\n\nAvailable tags to choose from:\n${allTags.join(', ')}\n\nRequirements:\n1. Select 5-8 tags that best describe the outfit's style, mood, and aesthetic\n2. Consider: overall vibe, color palette, fit, formality, styling approach\n3. Think about what makes this outfit distinctive\n4. Consider the gender context when relevant\n\nRespond in JSON format:\n{\n  "moodTags": ["tag1", "tag2", ...],\n  "confidence": 0.85,\n  "reasoning": "Brief explanation of why these tags fit"\n}`;

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
                  url: `data:${file.type};base64,${base64Image}`,
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('❌ OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiData = await openaiResponse.json();
    console.log('📊 OpenAI response received');

    const content = openaiData.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const analysis: MoodAnalysis = JSON.parse(jsonMatch[0]);

    const validTags = analysis.moodTags.filter(tag =>
      allTags.includes(tag.toLowerCase())
    );

    console.log('✅ Analysis complete:', {
      suggestedTags: validTags.length,
      confidence: analysis.confidence
    });

    return new Response(
      JSON.stringify({
        success: true,
        moodTags: validTags,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (err) {
    console.error('❌ Function error:', err);
    return new Response(
      JSON.stringify({
        error: 'Analysis failed',
        details: (err as Error).message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});