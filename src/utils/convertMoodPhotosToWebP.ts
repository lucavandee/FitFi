/**
 * Batch convert all mood photos to WebP
 * Call this from browser console on /admin/mood-photos page
 *
 * Usage:
 * import { convertAllMoodPhotosToWebP } from '@/utils/convertMoodPhotosToWebP';
 * await convertAllMoodPhotosToWebP();
 */

import { supabase } from '@/lib/supabaseClient';

export async function convertAllMoodPhotosToWebP() {
  console.log('🚀 Starting batch WebP conversion...\n');

  try {
    const session = await supabase.auth.getSession();

    if (!session.data.session?.access_token) {
      console.error('❌ Not logged in');
      return { error: 'Not logged in' };
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    console.log(`📡 Calling Edge Function: ${supabaseUrl}/functions/v1/batch-convert-mood-photos\n`);

    const response = await fetch(`${supabaseUrl}/functions/v1/batch-convert-mood-photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.data.session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Conversion failed:', data.error);
      return { error: data.error };
    }

    console.log('✅ Conversion complete!\n');
    console.log('📊 Summary:');
    console.log(`   Total: ${data.total}`);
    console.log(`   ✅ Converted: ${data.converted}`);
    console.log(`   ⏭️  Skipped: ${data.skipped}`);
    console.log(`   ❌ Failed: ${data.failed}`);
    console.log('\n📋 Detailed results:', data.results);

    return data;
  } catch (error) {
    console.error('❌ Error:', error);
    return { error: (error as Error).message };
  }
}

// Make it globally available in browser console
if (typeof window !== 'undefined') {
  (window as any).convertMoodPhotosToWebP = convertAllMoodPhotosToWebP;
}
