import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  console.log('🚀 Admin upload function called:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    console.log('🔐 Auth header present:', !!authHeader);

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
      console.error('❌ Auth failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User authenticated:', user.id.substring(0, 8));

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile?.is_admin) {
      console.error('❌ Not admin');
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Admin verified');

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const gender = formData.get('gender') as string;
    const moodTagsStr = formData.get('moodTags') as string;
    const displayOrderStr = formData.get('displayOrder') as string;

    console.log('📋 Form data received:', {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size ? `${(file.size / 1024).toFixed(2)}KB` : 'unknown',
      gender,
      tagsCount: moodTagsStr ? JSON.parse(moodTagsStr).length : 0
    });

    if (!file || !gender || !moodTagsStr || !displayOrderStr) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const moodTags = JSON.parse(moodTagsStr);
    const displayOrder = parseInt(displayOrderStr);

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${gender}/${fileName}`;

    console.log('📤 Uploading to storage:', filePath);

    // Get file buffer
    const fileBuffer = await file.arrayBuffer();

    // Upload to storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('mood-photos')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Upload failed: ' + uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ File uploaded successfully');

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('mood-photos')
      .getPublicUrl(filePath);

    console.log('💾 Inserting into database...');

    // Insert into database
    const { data, error: dbError } = await supabaseAdmin
      .from('mood_photos')
      .insert({
        image_url: publicUrl,
        gender: gender,
        mood_tags: moodTags,
        active: true,
        display_order: displayOrder
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      // Cleanup: remove uploaded file
      await supabaseAdmin.storage.from('mood-photos').remove([filePath]);
      return new Response(
        JSON.stringify({ error: 'Database insert failed: ' + dbError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Photo added successfully! ID:', data.id);
    console.log('📊 Format:', file.type, '| Size:', (file.size / 1024).toFixed(2) + 'KB');

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('❌ Function error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});