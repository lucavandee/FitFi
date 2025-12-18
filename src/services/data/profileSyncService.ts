import { supabase } from "@/lib/supabaseClient";
import { LS_KEYS } from "@/lib/quiz/types";

export type SyncStatus = 'synced' | 'pending' | 'error' | 'unknown';

export interface StyleProfile {
  user_id?: string;
  session_id?: string;
  gender?: string;
  archetype?: any;
  color_profile?: any;
  color_analysis?: any;
  photo_url?: string;
  quiz_answers?: any;
  sizes?: any;
  budget_range?: any;
  preferred_occasions?: string[];
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
const SYNC_STATUS_KEY = 'ff_sync_status';
const LAST_SYNC_KEY = 'ff_last_sync';

class ProfileSyncService {
  private syncInProgress = false;

  async getProfile(): Promise<StyleProfile | null> {
    console.log('[ProfileSync] 🔍 Getting profile...');

    const client = supabase();
    if (!client) {
      console.warn('[ProfileSync] No Supabase client, using local profile');
      return this.getLocalProfile();
    }

    try {
      const { data: { user } } = await client.auth.getUser();
      console.log('[ProfileSync] Auth status:', {
        hasUser: !!user,
        userId: user?.id?.substring(0, 8)
      });

      if (user) {
        console.log('[ProfileSync] Fetching profile from database for user:', user.id.substring(0, 8));
        const { data, error } = await client
          .from('style_profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (error) {
          console.error('[ProfileSync] ❌ Error fetching profile:', error);
          const localProfile = this.getLocalProfile();
          console.log('[ProfileSync] Falling back to local profile:', !!localProfile);
          return localProfile;
        }

        if (data) {
          console.log('[ProfileSync] ✅ Profile found in database:', {
            id: data.id?.substring(0, 8),
            archetype: data.archetype,
            completedAt: data.completed_at,
            hasQuizAnswers: !!data.quiz_answers
          });

          // Merge individual quiz answers if they exist
          const { data: quizAnswers } = await client
            .from('quiz_answers')
            .select('*')
            .eq('user_id', user.id);

          if (quizAnswers && quizAnswers.length > 0) {
            const answersMap: any = {};
            quizAnswers.forEach((qa: any) => {
              answersMap[qa.question_id] = qa.answer;
            });
            data.quiz_answers = { ...data.quiz_answers, ...answersMap };
            console.log('[ProfileSync] Merged individual quiz answers:', quizAnswers.length);
          }

          // Cache to localStorage
          console.log('[ProfileSync] Caching profile to localStorage...');
          this.cacheProfile(data);

          // Verify cache was written
          const cachedQuizAnswers = localStorage.getItem(LS_KEYS.QUIZ_ANSWERS);
          const cachedArchetype = localStorage.getItem(LS_KEYS.ARCHETYPE);
          const cachedCompleted = localStorage.getItem(LS_KEYS.QUIZ_COMPLETED);

          console.log('[ProfileSync] Cache verification:', {
            hasQuizAnswers: !!cachedQuizAnswers,
            hasArchetype: !!cachedArchetype,
            quizCompleted: cachedCompleted,
            answersLength: cachedQuizAnswers?.length || 0
          });

          localStorage.setItem(SYNC_STATUS_KEY, 'synced');
          localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
          console.log('✅ [ProfileSync] Profile loaded from database and cached successfully');
          return data;
        } else {
          console.warn('[ProfileSync] ⚠️ No profile found in database for user');
        }
      } else {
        const sessionId = localStorage.getItem('ff_session_id');
        console.log('[ProfileSync] No user, checking session:', sessionId?.substring(0, 8));

        if (sessionId) {
          const { data, error } = await client
            .from('style_profiles')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false })
            .maybeSingle();

          if (error) {
            console.error('[ProfileSync] ❌ Error fetching session profile:', error);
            return this.getLocalProfile();
          }

          if (data) {
            console.log('[ProfileSync] ✅ Session profile found');
            this.cacheProfile(data);
            localStorage.setItem(SYNC_STATUS_KEY, 'synced');
            localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
            return data;
          }
        }
      }

      console.log('[ProfileSync] No profile in database, using local');
      return this.getLocalProfile();
    } catch (error) {
      console.error('[ProfileSync] ❌ Exception during getProfile:', error);
      return this.getLocalProfile();
    }
  }

  async syncLocalToRemote(): Promise<boolean> {
    if (this.syncInProgress) {
      console.log('[ProfileSync] Sync already in progress, skipping');
      return false;
    }

    const syncStatus = localStorage.getItem(SYNC_STATUS_KEY);
    if (syncStatus === 'synced') {
      const lastSync = localStorage.getItem(LAST_SYNC_KEY);
      if (lastSync && Date.now() - parseInt(lastSync) < CACHE_DURATION) {
        console.log('[ProfileSync] Recently synced, skipping');
        return true;
      }
    }

    this.syncInProgress = true;

    try {
      const client = supabase();
      if (!client) {
        console.warn('[ProfileSync] No Supabase client available');
        this.syncInProgress = false;
        return false;
      }

      const localProfile = this.getLocalProfile();
      if (!localProfile || !localProfile.quiz_answers) {
        console.warn('[ProfileSync] No local profile to sync');
        this.syncInProgress = false;
        return false;
      }

      const { data: { user } } = await client.auth.getUser();
      const sessionId = localStorage.getItem('ff_session_id') || crypto.randomUUID();

      if (!localStorage.getItem('ff_session_id')) {
        localStorage.setItem('ff_session_id', sessionId);
      }

      console.log('[ProfileSync] 💾 Starting sync...', {
        hasUser: !!user,
        userId: user?.id?.substring(0, 8)
      });

      const profileData = {
        user_id: user?.id || null,
        session_id: !user ? sessionId : null,
        gender: localProfile.gender,
        archetype: localProfile.archetype,
        color_profile: localProfile.color_profile,
        color_analysis: localProfile.color_analysis,
        photo_url: localProfile.photo_url,
        quiz_answers: localProfile.quiz_answers,
        sizes: localProfile.sizes,
        budget_range: localProfile.budget_range,
        preferred_occasions: localProfile.preferred_occasions || [],
        completed_at: localProfile.completed_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Check if profile exists
      let existingProfile: any = null;
      if (user?.id) {
        const { data } = await client
          .from('style_profiles')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .maybeSingle();
        existingProfile = data;
      }

      let error: any = null;

      if (existingProfile) {
        console.log('[ProfileSync] 🔄 Updating existing profile');
        const updateResult = await client
          .from('style_profiles')
          .update(profileData)
          .eq('id', existingProfile.id);
        error = updateResult.error;
      } else {
        console.log('[ProfileSync] ✨ Creating new profile');
        const insertResult = await client
          .from('style_profiles')
          .insert(profileData);
        error = insertResult.error;
      }

      if (error) {
        console.error('[ProfileSync] ❌ Sync failed:', error);
        localStorage.setItem(SYNC_STATUS_KEY, 'error');
        this.syncInProgress = false;
        return false;
      }

      console.log('[ProfileSync] ✅ Sync successful');
      localStorage.setItem(SYNC_STATUS_KEY, 'synced');
      localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
      this.syncInProgress = false;
      return true;
    } catch (error) {
      console.error('[ProfileSync] ❌ Sync exception:', error);
      localStorage.setItem(SYNC_STATUS_KEY, 'error');
      this.syncInProgress = false;
      return false;
    }
  }

  getSyncStatus(): SyncStatus {
    const status = localStorage.getItem(SYNC_STATUS_KEY);
    return (status as SyncStatus) || 'unknown';
  }

  async checkAndSync(): Promise<void> {
    const status = this.getSyncStatus();

    if (status === 'pending' || status === 'error') {
      await this.syncLocalToRemote();
    } else if (status === 'synced') {
      const lastSync = localStorage.getItem(LAST_SYNC_KEY);
      if (!lastSync || Date.now() - parseInt(lastSync) > CACHE_DURATION) {
        await this.getProfile();
      }
    }
  }

  private getLocalProfile(): StyleProfile | null {
    try {
      const quizAnswers = localStorage.getItem(LS_KEYS.QUIZ_ANSWERS);
      const archetype = localStorage.getItem(LS_KEYS.ARCHETYPE);
      const colorProfile = localStorage.getItem(LS_KEYS.COLOR_PROFILE);
      const completedAt = localStorage.getItem(LS_KEYS.RESULTS_TS);

      if (!quizAnswers) return null;

      const answers = JSON.parse(quizAnswers);

      return {
        quiz_answers: answers,
        archetype: archetype ? JSON.parse(archetype) : null,
        color_profile: colorProfile ? JSON.parse(colorProfile) : null,
        gender: answers.gender,
        color_analysis: answers.colorAnalysis,
        photo_url: answers.photoUrl,
        sizes: answers.sizes,
        budget_range: answers.budgetRange ? { min: 0, max: answers.budgetRange } : null,
        preferred_occasions: answers.occasions || [],
        completed_at: completedAt ? new Date(parseInt(completedAt)).toISOString() : undefined,
      };
    } catch (error) {
      return null;
    }
  }

  private cacheProfile(profile: StyleProfile): void {
    try {
      if (profile.quiz_answers) {
        localStorage.setItem(LS_KEYS.QUIZ_ANSWERS, JSON.stringify(profile.quiz_answers));
      }
      if (profile.archetype) {
        localStorage.setItem(LS_KEYS.ARCHETYPE, JSON.stringify(profile.archetype));
      }
      if (profile.color_profile) {
        localStorage.setItem(LS_KEYS.COLOR_PROFILE, JSON.stringify(profile.color_profile));
      }
      if (profile.completed_at) {
        localStorage.setItem(LS_KEYS.RESULTS_TS, new Date(profile.completed_at).getTime().toString());
      }
      localStorage.setItem(LS_KEYS.QUIZ_COMPLETED, "1");
    } catch (error) {
      // Silent fail
    }
  }

  clearCache(): void {
    localStorage.removeItem(SYNC_STATUS_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);
    localStorage.removeItem(LS_KEYS.QUIZ_ANSWERS);
    localStorage.removeItem(LS_KEYS.ARCHETYPE);
    localStorage.removeItem(LS_KEYS.COLOR_PROFILE);
    localStorage.removeItem(LS_KEYS.RESULTS_TS);
    localStorage.removeItem(LS_KEYS.QUIZ_COMPLETED);
  }

  /**
   * Archive current profile and reset quiz for the authenticated user.
   * Returns info about the archived profile and days since last quiz.
   */
  async archiveAndResetQuiz(resetReason?: string): Promise<{
    success: boolean;
    old_archetype?: string;
    days_since_last_quiz?: number;
    error?: string;
  }> {
    const client = supabase();
    if (!client) {
      return { success: false, error: 'Supabase client not available' };
    }

    try {
      const { data, error } = await client.rpc('archive_and_reset_quiz', {
        p_reset_reason: resetReason || null
      });

      if (error) {
        console.error('[ProfileSync] Error archiving and resetting quiz:', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error || data.message };
      }

      // Clear local cache after successful reset
      this.clearCache();

      return {
        success: true,
        old_archetype: data.old_archetype,
        days_since_last_quiz: data.days_since_last_quiz
      };
    } catch (error) {
      console.error('[ProfileSync] Exception during archiveAndResetQuiz:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get user's style profile history.
   * Returns current profile and array of archived profiles.
   */
  async getProfileHistory(): Promise<{
    current_profile: any | null;
    history: any[];
    total_resets: number;
  } | null> {
    const client = supabase();
    if (!client) return null;

    try {
      const { data, error } = await client.rpc('get_style_profile_history');

      if (error) {
        console.error('[ProfileSync] Error fetching profile history:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[ProfileSync] Exception during getProfileHistory:', error);
      return null;
    }
  }
}

export const profileSyncService = new ProfileSyncService();
