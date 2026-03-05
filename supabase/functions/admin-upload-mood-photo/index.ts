import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

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
    const file = formData.get('file') as File;
    const gender = formData.get('gender') as string;
    const moodTagsStr = formData.get('moodTags') as string;
    const displayOrderStr = formData.get('displayOrder') as string;
    const archetypeWeightsStr = formData.get('archetypeWeights') as string;
    const dominantColorsStr = formData.get('dominantColors') as string;
    const styleAttributesStr = formData.get('styleAttributes') as string;

    if (!file || !gender || !moodTagsStr || !displayOrderStr) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields (file, gender, moodTags, displayOrder)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const moodTags = JSON.parse(moodTagsStr);
    const displayOrder = parseInt(displayOrderStr);

    let archetypeWeights = {};
    if (archetypeWeightsStr) {
      try { archetypeWeights = JSON.parse(archetypeWeightsStr); } catch { /* keep default */ }
    }

    let dominantColors: string[] = [];
    if (dominantColorsStr) {
      try { dominantColors = JSON.parse(dominantColorsStr); } catch { /* keep default */ }
    }

    let styleAttributes = {};
    if (styleAttributesStr) {
      try { styleAttributes = JSON.parse(styleAttributesStr); } catch { /* keep default */ }
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${gender}/${fileName}`;

    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from('mood-photos')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: 'Upload failed: ' + uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('mood-photos')
      .getPublicUrl(filePath);

    const { data, error: dbError } = await supabaseAdmin
      .from('mood_photos')
      .insert({
        image_url: publicUrl,
        gender,
        mood_tags: moodTags,
        archetype_weights: archetypeWeights,
        dominant_colors: dominantColors,
        style_attributes: styleAttributes,
        active: true,
        display_order: displayOrder
      })
      .select()
      .single();

    if (dbError) {
      await supabaseAdmin.storage.from('mood-photos').remove([filePath]);
      return new Response(
        JSON.stringify({ error: 'Database insert failed: ' + dbError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
