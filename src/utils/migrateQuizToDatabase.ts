/**
 * Utility to migrate quiz data from localStorage to database
 * Run this once if you have quiz data in localStorage but not in database
 */

import { supabase } from '@/lib/supabaseClient';

export async function migrateQuizToDatabase(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔄 [Migration] Starting quiz data migration from localStorage to database...');

    // Get quiz data from localStorage
    const quizAnswersStr = localStorage.getItem('ff_quiz_answers') || localStorage.getItem('fitfi.quiz.answers');
    const colorProfileStr = localStorage.getItem('ff_color_profile');
    const archetypeStr = localStorage.getItem('ff_style_archetype') || localStorage.getItem('ff_archetype');

    if (!quizAnswersStr) {
      return { success: false, error: 'No quiz data found in localStorage' };
    }

    let quizAnswers: Record<string, any>;
    let colorProfile: Record<string, any> | null;
    let archetype: unknown;
    try {
      quizAnswers = JSON.parse(quizAnswersStr);
      colorProfile = colorProfileStr ? JSON.parse(colorProfileStr) : null;
      archetype = archetypeStr ? JSON.parse(archetypeStr) : quizAnswers.archetype;
    } catch {
      return { success: false, error: 'Failed to parse quiz data from localStorage' };
    }

    console.log('📦 [Migration] Found quiz data in localStorage:', {
      gender: quizAnswers.gender,
      bodyType: quizAnswers.bodyType,
      archetype,
      hasColorProfile: !!colorProfile
    });

    // Get Supabase client
    const client = supabase();
    if (!client) {
      return { success: false, error: 'Supabase client not initialized' };
    }

    // Get current user
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log('👤 [Migration] User authenticated:', user.email);

    // Check if profile already exists
    const { data: existingProfile } = await client
      .from('style_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingProfile) {
      console.log('⚠️ [Migration] Profile already exists, updating...');

      const { error: updateError } = await client
        .from('style_profiles')
        .update({
          gender: quizAnswers.gender,
          archetype,
          color_profile: colorProfile,
          color_analysis: quizAnswers.colorAnalysis || null,
          photo_url: quizAnswers.photoUrl || null,
          quiz_answers: quizAnswers,
          sizes: quizAnswers.sizes || null,
          budget_range: quizAnswers.budgetRange ? { min: 0, max: quizAnswers.budgetRange } : null,
          preferred_occasions: quizAnswers.occasions || [],
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('❌ [Migration] Update failed:', updateError);
        return { success: false, error: updateError.message };
      }

      console.log('✅ [Migration] Profile updated successfully!');
      return { success: true };
    }

    // Insert new profile
    const { error: insertError } = await client
      .from('style_profiles')
      .insert({
        user_id: user.id,
        gender: quizAnswers.gender,
        archetype,
        color_profile: colorProfile,
        color_analysis: quizAnswers.colorAnalysis || null,
        photo_url: quizAnswers.photoUrl || null,
        quiz_answers: quizAnswers,
        sizes: quizAnswers.sizes || null,
        budget_range: quizAnswers.budgetRange ? { min: 0, max: quizAnswers.budgetRange } : null,
        preferred_occasions: quizAnswers.occasions || [],
        completed_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('❌ [Migration] Insert failed:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('✅ [Migration] Profile created successfully!');
    console.log('✅ [Migration] Quiz data migrated to database!');

    return { success: true };
  } catch (error) {
    console.error('❌ [Migration] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Make it available in console for manual execution
if (typeof window !== 'undefined') {
  (window as any).migrateQuizToDatabase = migrateQuizToDatabase;
}
