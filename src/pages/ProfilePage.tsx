import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  LogOut,
  RefreshCw,
  Palette,
  ShoppingBag,
  Settings,
  Heart,
  Calendar,
  Sparkles,
  Award,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useUser } from '../context/UserContext';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';
import { QuizResetModal } from '@/components/profile/QuizResetModal';
import { EmailPreferences } from '@/components/profile/EmailPreferences';
import { profileSyncService } from '@/services/data/profileSyncService';
import { LS_KEYS } from '@/lib/quiz/types';

const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [showResetModal, setShowResetModal] = useState(false);
  const [syncedProfile, setSyncedProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await profileSyncService.getProfile();
        console.log('[ProfilePage] Loaded profile:', profile);
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

      if (error) {
        console.error('Error fetching style profile:', error);
        return null;
      }

      console.log('[ProfilePage] Style profile from DB:', data);
      return data;
    },
    enabled: !!user,
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

      if (error) {
        console.error('Error counting saved outfits:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!user,
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

      if (error) {
        console.error('Error fetching gamification stats:', error);
        return null;
      }

      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-4xl font-bold text-[var(--color-text)] mb-4">Profiel</h1>
          <p className="text-[var(--color-muted)] mb-6">Log in om je profiel te bekijken</p>
          <Button as={Link} to="/inloggen" variant="primary" fullWidth>
            Inloggen
          </Button>
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
  const paletteName = colorProfile?.paletteName || colorProfile?.palette_name;

  const profileCreatedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long' })
    : null;

  console.log('[ProfilePage] Rendering with:', {
    hasStyleProfile,
    profile,
    archetype,
    colorProfile,
    paletteName
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Helmet>
        <title>Profiel - FitFi</title>
        <meta name="description" content="Jouw account en stijlprofiel." />
      </Helmet>

      <Breadcrumbs />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header with Hero Background */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] p-8 md:p-12 text-white"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
                <User className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {user.name || user.email?.split('@')[0] || 'Jouw Profiel'}
                </h1>
                <div className="flex items-center gap-2 text-white/80">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                {profileCreatedDate && (
                  <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                    <Calendar className="w-4 h-4" />
                    Lid sinds {profileCreatedDate}
                  </div>
                )}
              </div>
            </div>
            <Button onClick={logout} variant="ghost" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              <LogOut className="w-4 h-4" />
              Uitloggen
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Palette className="w-5 h-5" />}
            label="Stijlprofiel"
            value={hasStyleProfile ? '✓ Compleet' : 'Nog niet'}
            variant={hasStyleProfile ? 'success' : 'neutral'}
          />
          <StatCard
            icon={<Heart className="w-5 h-5" />}
            label="Opgeslagen"
            value={savedOutfitsCount || 0}
            variant="neutral"
          />
          <StatCard
            icon={<Award className="w-5 h-5" />}
            label="Level"
            value={gamificationStats?.current_level || 1}
            variant="neutral"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="XP"
            value={gamificationStats?.total_xp || 0}
            variant="neutral"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Style Profile Section */}
          {hasStyleProfile ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
                  Jouw Stijl
                </h3>
              </div>

              <div className="space-y-4">
                {archetype && (
                  <div className="p-4 bg-[var(--color-bg)] rounded-xl">
                    <p className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-1 font-semibold">Stijlarchetype</p>
                    <p className="text-2xl font-bold text-[var(--color-text)] capitalize">
                      {archetype}
                    </p>
                  </div>
                )}

                {paletteName && (
                  <div className="p-4 bg-[var(--color-bg)] rounded-xl">
                    <p className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-1 font-semibold">Kleurpalet</p>
                    <p className="text-lg font-semibold text-[var(--color-text)] capitalize">
                      {paletteName}
                    </p>
                  </div>
                )}

                {colorProfile && (
                  <div className="grid grid-cols-3 gap-2">
                    {colorProfile.primaryColors?.slice(0, 6).map((color: string, i: number) => (
                      <div
                        key={i}
                        className="h-12 rounded-lg border-2 border-[var(--color-border)]"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  <Button as={Link} to="/results" variant="primary" fullWidth className="gap-2">
                    <Eye className="w-4 h-4" />
                    Bekijk Outfits
                  </Button>
                  <button
                    onClick={() => setShowResetModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--ff-color-primary-600)] hover:bg-[var(--color-bg)] rounded-lg transition-colors border-2 border-[var(--color-border)]"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Quiz Opnieuw Doen
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] dark:from-[var(--ff-color-primary-900)] dark:to-[var(--ff-color-accent-900)] border-2 border-dashed border-[var(--ff-color-primary-300)] rounded-2xl p-8 text-center"
            >
              <Palette className="w-16 h-16 mx-auto text-[var(--ff-color-primary-600)] mb-4" />
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                Nog geen stijlprofiel
              </h3>
              <p className="text-[var(--color-muted)] mb-6">
                Ontdek je unieke stijl in slechts 5 minuten.
              </p>
              <Button onClick={() => navigate('/onboarding')} variant="primary" fullWidth className="gap-2">
                <Sparkles className="w-4 h-4" />
                Start Stijlquiz
              </Button>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-2xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              Snelle Acties
            </h3>

            <div className="space-y-3">
              <ActionButton
                icon={<ShoppingBag className="w-5 h-5" />}
                label="Dashboard"
                description="Bekijk je outfits en statistieken"
                to="/dashboard"
              />
              <ActionButton
                icon={<Heart className="w-5 h-5" />}
                label="Opgeslagen Outfits"
                description={`${savedOutfitsCount || 0} outfits opgeslagen`}
                to="/dashboard"
              />
              <ActionButton
                icon={<Award className="w-5 h-5" />}
                label="Achievements"
                description="Bekijk je voortgang"
                to="/dashboard"
              />
            </div>
          </motion.div>
        </div>

        {/* Email Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <EmailPreferences />
        </motion.div>
      </div>

      {/* Quiz Reset Modal */}
      {user && (
        <QuizResetModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          userId={user.id}
        />
      )}
    </div>
  );
};

function StatCard({
  icon,
  label,
  value,
  variant = 'neutral',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  variant?: 'success' | 'neutral';
}) {
  const bgColor = variant === 'success'
    ? 'from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)] dark:from-[var(--ff-color-primary-900)] dark:to-[var(--ff-color-accent-900)]'
    : 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700';

  const iconColor = variant === 'success'
    ? 'text-[var(--ff-color-primary-600)]'
    : 'text-[var(--color-muted)]';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${bgColor} rounded-xl p-4 border-2 border-[var(--color-border)] shadow-sm transition-shadow hover:shadow-md`}
    >
      <div className={`flex items-center gap-2 mb-2 ${iconColor}`}>
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-[var(--color-text)]">
        {value}
      </div>
    </motion.div>
  );
}

function ActionButton({
  icon,
  label,
  description,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg)] border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] transition-all hover:shadow-md group"
    >
      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[var(--color-text)] truncate">{label}</div>
        <div className="text-sm text-[var(--color-muted)] truncate">{description}</div>
      </div>
    </Link>
  );
}

export default ProfilePage;
