import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  console.log('🚀 Function called:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('🔐 Auth header present:', !!authHeader);

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('🔧 Env check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!serviceRoleKey
    });

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the user's JWT and check if admin
    const token = authHeader.replace('Bearer ', '');
    console.log('👤 Getting user from token...');

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    console.log('👤 User check:', {
      hasUser: !!user,
      userId: user?.id?.substring(0, 8),
      error: authError?.message
    });

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token: ' + (authError?.message || 'no user') }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    console.log('🔍 Checking admin status...');

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    console.log('👔 Profile check:', {
      hasProfile: !!profile,
      isAdmin: profile?.is_admin,
      error: profileError?.message
    });

    if (profileError) {
      return new Response(
        JSON.stringify({ error: 'Profile lookup failed: ' + profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile?.is_admin) {
      return new Response(
        JSON.stringify({ error: 'Not authorized - admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Admin verified, parsing form data...');

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const gender = formData.get('gender') as string;
    const moodTagsStr = formData.get('moodTags') as string;
    const displayOrderStr = formData.get('displayOrder') as string;

    console.log('📋 Form data:', {
      hasFile: !!file,
      fileName: file?.name,
      gender,
      hasTags: !!moodTagsStr,
      displayOrder: displayOrderStr
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
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${gender}/${fileName}`;

    console.log('📤 Uploading to storage:', filePath);

    // Upload to storage using service role (bypasses RLS)
    const fileBuffer = await file.arrayBuffer();
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

    console.log('✅ File uploaded, getting public URL...');

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('mood-photos')
      .getPublicUrl(filePath);

    console.log('💾 Inserting into database...');

    // Insert into database using service role
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
      // Try to clean up uploaded file
      await supabaseAdmin.storage.from('mood-photos').remove([filePath]);
      return new Response(
        JSON.stringify({ error: 'Database insert failed: ' + dbError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Success! Photo ID:', data.id);

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
