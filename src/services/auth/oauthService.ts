import { supabase } from '@/lib/supabaseClient';

export const OAuthService = {
  /**
   * Sign in with Google OAuth
   * Redirects to Google login, then back to /dashboard
   */
  async signInWithGoogle() {
    const sb = supabase();
    if (!sb) throw new Error('Supabase not available');

    const { data, error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in with Apple OAuth
   * Redirects to Apple login, then back to /dashboard
   */
  async signInWithApple() {
    const sb = supabase();
    if (!sb) throw new Error('Supabase not available');

    const { data, error } = await sb.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Check if user came from OAuth redirect
   * Call this on app mount to handle OAuth callbacks
   */
  async handleOAuthCallback() {
    const sb = supabase();
    if (!sb) return null;

    try {
      const { data: { session }, error } = await sb.auth.getSession();

      if (error) {
        console.error('[OAuth] Callback error:', error);
        return null;
      }

      if (session?.user) {
        console.log('[OAuth] User authenticated:', session.user.email);
        return session.user;
      }

      return null;
    } catch (err) {
      console.error('[OAuth] Unexpected callback error:', err);
      return null;
    }
  },
};
