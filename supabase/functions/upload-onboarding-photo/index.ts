import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Session-Id',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const { file, filename, sessionId } = await req.json();

    if (!file || !filename || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: file, filename, sessionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Optional: Check if authenticated and use user ID if available
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Convert base64 to Uint8Array
    const base64Data = file.split(',')[1] || file;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Generate path: use userId if authenticated, sessionId if anonymous
    const fileExt = filename.split('.').pop();
    const fileName = `selfie-${Date.now()}.${fileExt}`;
    const folder = userId || `anon_${sessionId}`;
    const filePath = `${folder}/${fileName}`;

    // Upload using service role (bypasses RLS)
    const { data, error } = await supabase.storage
      .from('user-photos')
      .upload(filePath, bytes, {
        contentType: `image/${fileExt}`,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('[upload-onboarding-photo] Upload error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-photos')
      .getPublicUrl(data.path);

    console.log('[upload-onboarding-photo] Upload successful:', {
      userId: userId || 'anonymous',
      sessionId,
      path: data.path,
    });

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        path: data.path,
        isAnonymous: !userId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[upload-onboarding-photo] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});