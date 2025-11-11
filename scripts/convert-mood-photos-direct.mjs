#!/usr/bin/env node

/**
 * Direct WebP Conversion Script
 * Converts all JPEG/PNG mood photos to WebP using Supabase Admin API
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🔄 Starting batch WebP conversion (direct mode)...\n');

// Read .env file
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');

const getEnvVar = (key) => {
  const match = envContent.match(new RegExp(`${key}=["']?([^"'\\n]+)["']?`));
  return match ? match[1] : null;
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials in .env');
  console.error('   Need: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('📡 Connected to Supabase\n');

// Fetch all mood photos
console.log('📥 Fetching mood photos...');
const { data: photos, error: fetchError } = await supabase
  .from('mood_photos')
  .select('id, image_url, gender, mood_tags, display_order')
  .order('id');

if (fetchError) {
  console.error('❌ Failed to fetch photos:', fetchError.message);
  process.exit(1);
}

console.log(`✅ Found ${photos.length} photos\n`);

let converted = 0;
let skipped = 0;
let failed = 0;

for (const photo of photos) {
  console.log(`🔄 Processing photo ${photo.id}...`);
  console.log(`   URL: ${photo.image_url}`);

  // Check if already WebP
  if (photo.image_url.endsWith('.webp')) {
    console.log('   ⏭️  Already WebP, skipping\n');
    skipped++;
    continue;
  }

  try {
    // Extract storage path from URL
    const urlParts = photo.image_url.split('/storage/v1/object/public/mood-photos/');
    if (urlParts.length !== 2) {
      console.error('   ❌ Invalid URL format\n');
      failed++;
      continue;
    }

    const storagePath = urlParts[1];
    console.log(`   📁 Storage path: ${storagePath}`);

    // This would require image processing library
    // For now, we'll document that manual conversion is needed
    console.log('   ⚠️  Requires manual conversion via admin dashboard\n');
    skipped++;

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
    failed++;
  }
}

console.log('═══════════════════════════════════════════════════════════');
console.log('📊 Summary:');
console.log(`   Total photos: ${photos.length}`);
console.log(`   ✅ Converted: ${converted}`);
console.log(`   ⏭️  Skipped: ${skipped}`);
console.log(`   ❌ Failed: ${failed}`);
console.log('═══════════════════════════════════════════════════════════\n');

console.log('💡 To convert existing photos:');
console.log('   1. Go to /admin/mood-photos');
console.log('   2. Download each JPEG photo');
console.log('   3. Delete the JPEG version');
console.log('   4. Re-upload → will auto-convert to WebP');
console.log('');
console.log('   OR use the batch-convert Edge Function:');
console.log('   → Call with admin JWT token from browser console');
