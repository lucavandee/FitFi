#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🔄 Starting batch WebP conversion...\n');

// Read .env file
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');

const getEnvVar = (key) => {
  const match = envContent.match(new RegExp(`${key}=["']?([^"'\\n]+)["']?`));
  return match ? match[1] : null;
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Could not find Supabase credentials in .env');
  process.exit(1);
}

console.log('📡 Calling Edge Function...');
console.log(`URL: ${SUPABASE_URL}/functions/v1/batch-convert-mood-photos\n`);

try {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/batch-convert-mood-photos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  console.log('📊 Response:');
  console.log(JSON.stringify(data, null, 2));
  console.log('');

  if (data.total) {
    console.log('📈 Summary:');
    console.log(`   Total photos: ${data.total}`);
    console.log(`   ✅ Converted: ${data.converted}`);
    console.log(`   ⏭️  Skipped: ${data.skipped}`);
    console.log(`   ❌ Failed: ${data.failed}`);
    console.log('');
  }

  console.log('✅ Batch conversion complete!\n');
  console.log('Check Supabase Dashboard for detailed logs:');
  console.log('→ Edge Functions → batch-convert-mood-photos → Logs');

  process.exit(data.failed > 0 ? 1 : 0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
