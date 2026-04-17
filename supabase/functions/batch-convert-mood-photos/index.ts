import { createClient } from 'npm:@supabase/supabase-js@2';
import { buildCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  console.log('🚀 Batch convert function called');
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
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

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Admin verified, fetching photos...');

    const { data: photos, error: fetchError } = await supabaseAdmin
      .from('mood_photos')
      .select('id, image_url, gender, mood_tags, display_order')
      .order('id');

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch photos: ' + fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Found ${photos.length} photos`);

    const results = [];
    let converted = 0;
    let skipped = 0;
    let failed = 0;

    for (const photo of photos) {
      console.log(`\n🔄 Processing photo ${photo.id}...`);
      console.log(`   URL: ${photo.image_url}`);

      if (photo.image_url.endsWith('.webp')) {
        console.log('   ✅ Already WebP, skipping');
        skipped++;
        results.push({ id: photo.id, status: 'skipped', reason: 'already webp' });
        continue;
      }

      try {
        const urlParts = photo.image_url.split('/storage/v1/object/public/mood-photos/');
        if (urlParts.length !== 2) {
          console.error('   ❌ Invalid URL format');
          failed++;
          results.push({ id: photo.id, status: 'failed', reason: 'invalid url' });
          continue;
        }

        const storagePath = urlParts[1];
        console.log(`   📁 Storage path: ${storagePath}`);

        const { data: fileData, error: downloadError } = await supabaseAdmin.storage
          .from('mood-photos')
          .download(storagePath);

        if (downloadError || !fileData) {
          console.error('   ❌ Download failed:', downloadError?.message);
          failed++;
          results.push({ id: photo.id, status: 'failed', reason: 'download failed' });
          continue;
        }

        console.log('   📥 Downloaded, size:', (fileData.size / 1024).toFixed(2) + 'KB');

        const fileBuffer = await fileData.arrayBuffer();

        console.log('   🔄 Converting to WebP...');

        let finalBuffer: ArrayBuffer;
        let savings = 0;

        try {
          const { createCanvas, loadImage } = await import('https://deno.land/x/canvas@v1.4.1/mod.ts');

          const img = await loadImage(new Uint8Array(fileBuffer));
          const canvas = createCanvas(img.width(), img.height());
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const webpBuffer = canvas.toBuffer('image/webp', { quality: 0.85 });
          finalBuffer = webpBuffer.buffer;
          savings = ((fileBuffer.byteLength - finalBuffer.byteLength) / fileBuffer.byteLength) * 100;

          console.log('   ✅ Converted:', {
            original: (fileBuffer.byteLength / 1024).toFixed(2) + 'KB',
            webp: (finalBuffer.byteLength / 1024).toFixed(2) + 'KB',
            savings: savings.toFixed(1) + '%'
          });
        } catch (conversionError) {
          console.error('   ❌ Conversion failed:', conversionError);
          failed++;
          results.push({ id: photo.id, status: 'failed', reason: 'conversion failed' });
          continue;
        }

        const pathParts = storagePath.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const baseFileName = fileName.split('.')[0];
        const newFileName = `${baseFileName}.webp`;
        const newPath = `${photo.gender}/${newFileName}`;

        console.log('   📤 Uploading as:', newPath);

        const { error: uploadError } = await supabaseAdmin.storage
          .from('mood-photos')
          .upload(newPath, finalBuffer, {
            contentType: 'image/webp',
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('   ❌ Upload failed:', uploadError.message);
          failed++;
          results.push({ id: photo.id, status: 'failed', reason: 'upload failed' });
          continue;
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('mood-photos')
          .getPublicUrl(newPath);

        console.log('   💾 Updating database...');

        const { error: updateError } = await supabaseAdmin
          .from('mood_photos')
          .update({ image_url: publicUrl })
          .eq('id', photo.id);

        if (updateError) {
          console.error('   ❌ Database update failed:', updateError.message);
          failed++;
          results.push({ id: photo.id, status: 'failed', reason: 'db update failed' });
          continue;
        }

        console.log('   🗑️ Deleting old file...');
        await supabaseAdmin.storage.from('mood-photos').remove([storagePath]);

        console.log('   ✅ Successfully converted!');
        converted++;
        results.push({ 
          id: photo.id, 
          status: 'converted', 
          savings: savings.toFixed(1) + '%',
          oldUrl: photo.image_url,
          newUrl: publicUrl
        });

      } catch (error) {
        console.error(`   ❌ Error processing photo ${photo.id}:`, error);
        failed++;
        results.push({ id: photo.id, status: 'failed', reason: (error as Error).message });
      }
    }

    const summary = {
      total: photos.length,
      converted,
      skipped,
      failed,
      results
    };

    console.log('\n🎉 Batch conversion complete:', summary);

    return new Response(
      JSON.stringify(summary),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('❌ Function error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal error: ' + (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});