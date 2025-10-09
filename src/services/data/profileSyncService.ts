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
    const client = supabase();
    if (!client) return this.getLocalProfile();

    try {
      const { data: { user } } = await client.auth.getUser();

      if (user) {
        const { data, error } = await client
          .from('style_profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (error) {
          console.error('[ProfileSync] Error fetching from Supabase:', error);
          return this.getLocalProfile();
        }

        if (data) {
          this.cacheProfile(data);
          localStorage.setItem(SYNC_STATUS_KEY, 'synced');
          localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
          return data;
        }
      } else {
        const sessionId = localStorage.getItem('ff_session_id');
        if (sessionId) {
          const { data, error } = await client
            .from('style_profiles')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false })
            .maybeSingle();

          if (error) {
            console.error('[ProfileSync] Error fetching by session:', error);
            return this.getLocalProfile();
          }

          if (data) {
            this.cacheProfile(data);
            localStorage.setItem(SYNC_STATUS_KEY, 'synced');
            localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
            return data;
          }
        }
      }

      return this.getLocalProfile();
    } catch (error) {
      console.error('[ProfileSync] Exception in getProfile:', error);
      return this.getLocalProfile();
    }
  }

  async syncLocalToRemote(): Promise<boolean> {
    if (this.syncInProgress) {
      console.log('[ProfileSync] Sync already in progress');
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
        console.log('[ProfileSync] No Supabase client available');
        this.syncInProgress = false;
        return false;
      }

      const localProfile = this.getLocalProfile();
      if (!localProfile || !localProfile.quiz_answers) {
        console.log('[ProfileSync] No local data to sync');
        this.syncInProgress = false;
        return false;
      }

      const { data: { user } } = await client.auth.getUser();
      const sessionId = localStorage.getItem('ff_session_id') || crypto.randomUUID();

      if (!localStorage.getItem('ff_session_id')) {
        localStorage.setItem('ff_session_id', sessionId);
      }

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
      };

      const { error } = await client
        .from('style_profiles')
        .insert(profileData);

      if (error) {
        console.error('[ProfileSync] Error syncing to Supabase:', error);
        localStorage.setItem(SYNC_STATUS_KEY, 'error');
        this.syncInProgress = false;
        return false;
      }

      console.log('[ProfileSync] Successfully synced to Supabase');
      localStorage.setItem(SYNC_STATUS_KEY, 'synced');
      localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
      this.syncInProgress = false;
      return true;
    } catch (error) {
      console.error('[ProfileSync] Exception during sync:', error);
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
      console.log('[ProfileSync] Auto-syncing pending data...');
      await this.syncLocalToRemote();
    } else if (status === 'synced') {
      const lastSync = localStorage.getItem(LAST_SYNC_KEY);
      if (!lastSync || Date.now() - parseInt(lastSync) > CACHE_DURATION) {
        console.log('[ProfileSync] Cache expired, refreshing...');
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
      console.error('[ProfileSync] Error reading local profile:', error);
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
      console.error('[ProfileSync] Error caching profile:', error);
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
}

export const profileSyncService = new ProfileSyncService();
