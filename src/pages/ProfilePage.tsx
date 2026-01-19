import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Heart, RefreshCw, Sparkles, Palette, Settings as SettingsIcon, Shield, LogOut, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '../context/UserContext';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';
import { QuizResetModal } from '@/components/profile/QuizResetModal';
import { EmailPreferences } from '@/components/profile/EmailPreferences';
import { CookieSettings } from '@/components/profile/CookieSettings';
import { profileSyncService } from '@/services/data/profileSyncService';
import { motion } from 'framer-motion';

/**
 * Profile Page V2 - Clean & Minimal
 *
 * Design Philosophy: Notion Settings Page
 * - Single column, clear sections
 * - Warm FitFi colors only (no blue/pink/purple)
 * - Settings-first (not stats dashboard)
 * - Mobile-perfect
 * - Clear hierarchy
 */
const ProfilePageV2: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [showResetModal, setShowResetModal] = useState(false);
  const [syncedProfile, setSyncedProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await profileSyncService.getProfile();
        setSyncedProfile(profile);
      } catch (error) {
        console.error('[ProfilePage] Error loading profile:', error);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  const { data: styleProfile } = useQuery({
    queryKey: ['styleProfile', user?.id],
    queryFn: async () => {
      const client = supabase();
      if (!client || !user) return null;

      const { data, error } = await client
        .from('style_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) return null;
      return data;
    },
    enabled: !!user,
    staleTime: 300000,
  });

  const { data: savedOutfitsCount } = useQuery({
    queryKey: ['savedOutfitsCount', user?.id],
    queryFn: async () => {
      const client = supabase();
      if (!client || !user) return 0;

      const { count, error } = await client
        .from('saved_outfits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) return 0;
      return count || 0;
    },
    enabled: !!user,
    staleTime: 60000,
  });

  const { data: gamificationStats } = useQuery({
    queryKey: ['gamificationStats', user?.id],
    queryFn: async () => {
      const client = supabase();
      if (!client || !user) return null;

      const { data, error } = await client
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) return null;
      return data;
    },
    enabled: !!user,
    staleTime: 120000,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-xl bg-[var(--ff-color-neutral-100)] flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-[var(--color-muted)]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-3">Profiel</h1>
          <p className="text-[var(--color-muted)] mb-6">Log in om je profiel te bekijken</p>
          <button
            onClick={() => navigate('/inloggen')}
            className="w-full px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-600)] transition-colors"
          >
            Inloggen
          </button>
        </div>
      </div>
    );
  }

  const hasStyleProfile = !!styleProfile || !!syncedProfile;
  const profile = styleProfile || syncedProfile;

  const archetype = profile?.archetype
    ? (typeof profile.archetype === 'string' ? profile.archetype : profile.archetype?.name || profile.archetype?.archetype)
    : null;

  const colorProfile = profile?.color_profile;
  const primaryColors = colorProfile?.primaryColors || [];

  const level = gamificationStats?.current_level || 1;
  const xp = gamificationStats?.total_xp || 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Helmet>
        <title>Profiel - FitFi</title>
        <meta name="description" content="Jouw persoonlijke profiel en instellingen." />
      </Helmet>

      <div className="ff-container py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">

          {/* Header - User Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 pb-8 border-b border-[var(--color-border)]"
          >
            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] flex items-center justify-center shadow-lg flex-shrink-0">
                <User className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-[var(--color-text)] mb-2">
                  {user.email?.split('@')[0]}
                </h1>
                <p className="text-base text-[var(--color-muted)] mb-3">{user.email}</p>
                {user.created_at && (
                  <p className="text-sm text-[var(--color-muted)]">
                    Lid sinds {new Date(user.created_at).toLocaleDateString('nl-NL', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats - Inline */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-[var(--color-text)] hover:text-[var(--ff-color-primary-700)] transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span className="text-lg font-semibold">{savedOutfitsCount || 0}</span>
                <span className="text-sm text-[var(--color-muted)]">Favorieten</span>
              </button>
              <div className="w-px h-6 bg-[var(--color-border)]" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--color-muted)]" />
                <span className="text-lg font-semibold text-[var(--color-text)]">Level {level}</span>
                <span className="text-sm text-[var(--color-muted)]">({xp} XP)</span>
              </div>
            </div>
          </motion.div>

          {/* Style Profile Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <Palette className="w-6 h-6" />
              Jouw Stijl
            </h2>

            {hasStyleProfile ? (
              <div className="p-6 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-25)] to-[var(--ff-color-accent-25)] border border-[var(--ff-color-primary-100)]">
                <div className="mb-4">
                  <p className="text-sm text-[var(--color-muted)] mb-1">Stijlprofiel</p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">
                    {archetype || 'Niet beschikbaar'}
                  </p>
                </div>

                {primaryColors.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-[var(--color-muted)] mb-3">Jouw Kleuren</p>
                    <div className="flex gap-2 flex-wrap">
                      {primaryColors.slice(0, 8).map((color: string, i: number) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-lg shadow-sm border border-white/50"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/results')}
                    className="flex-1 px-4 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-600)] transition-colors flex items-center justify-center gap-2"
                  >
                    Bekijk outfits
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowResetModal(true)}
                    className="px-4 py-3 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl font-semibold text-[var(--color-text)] hover:border-[var(--ff-color-primary-500)] transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Update
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
                <div className="w-16 h-16 rounded-xl bg-[var(--ff-color-neutral-100)] flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[var(--ff-color-primary-700)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                  Start je stijlreis
                </h3>
                <p className="text-[var(--color-muted)] mb-6">
                  Ontdek je unieke stijl met onze AI-powered quiz
                </p>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-600)] transition-colors inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Start stijlquiz
                </button>
              </div>
            )}
          </motion.section>

          {/* Email Preferences Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <EmailPreferences />
          </motion.section>

          {/* Privacy & Cookies Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Privacy & Cookies
            </h2>
            <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <CookieSettings />
            </div>
          </motion.section>

          {/* Account Settings Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <SettingsIcon className="w-6 h-6" />
              Account
            </h2>
            <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
              <div>
                <p className="text-sm text-[var(--color-muted)] mb-1">Email adres</p>
                <p className="text-base font-medium text-[var(--color-text)]">{user.email}</p>
              </div>
              {user.created_at && (
                <div>
                  <p className="text-sm text-[var(--color-muted)] mb-1">Account aangemaakt</p>
                  <p className="text-base font-medium text-[var(--color-text)]">
                    {new Date(user.created_at).toLocaleDateString('nl-NL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </motion.section>

          {/* Logout Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <button
              onClick={logout}
              className="w-full px-6 py-4 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl text-base font-semibold text-[var(--color-text)] hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Uitloggen
            </button>
          </motion.div>

        </div>
      </div>

      {/* Quiz Reset Modal */}
      {showResetModal && (
        <QuizResetModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          currentArchetype={archetype || undefined}
        />
      )}
    </div>
  );
};

export default ProfilePageV2;
