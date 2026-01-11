import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Heart,
  Target,
  Award,
  TrendingUp,
  Eye,
  ShoppingBag,
  RefreshCw,
  Sparkles,
  Zap,
  Palette,
  Settings as SettingsIcon,
  Shield
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useUser } from '../context/UserContext';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';
import { QuizResetModal } from '@/components/profile/QuizResetModal';
import { EmailPreferences } from '@/components/profile/EmailPreferences';
import { StyleProfileComparison } from '@/components/profile/StyleProfileComparison';
import { CookieSettings } from '@/components/profile/CookieSettings';
import { profileSyncService } from '@/services/data/profileSyncService';
import {
  PremiumHeaderCard,
  PremiumStatCard,
  PremiumActionCard,
  PremiumCard
} from '@/components/dashboard/PremiumBentoComponents';

/**
 * Premium Profile Page
 *
 * Beautiful gradient cards + smooth scroll
 * - Premium stat cards with gradients
 * - Gradient header (no backdrop-blur)
 * - Smart animations (desktop only)
 * - Scroll-optimized
 */
const ProfilePage: React.FC = () => {
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

      if (error) {
        console.error('Error fetching style profile:', error);
        return null;
      }

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

  const { data: recentActivity } = useQuery({
    queryKey: ['recentActivity', user?.id],
    queryFn: async () => {
      const client = supabase();
      if (!client || !user) return [];

      const { data, error } = await client
        .from('user_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) return [];
      return data || [];
    },
    enabled: !!user,
    staleTime: 60000,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <User className="w-16 h-16 mx-auto text-[var(--color-muted)] mb-4" />
          <h1 className="text-4xl font-bold text-[var(--color-text)] mb-4">Profiel</h1>
          <p className="text-[var(--color-muted)] mb-6">Log in om je persoonlijke profiel te bekijken</p>
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
  const primaryColors = colorProfile?.primaryColors || [];

  const level = gamificationStats?.current_level || 1;
  const xp = gamificationStats?.total_xp || 0;
  const nextLevelXP = level * 1000;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Helmet>
        <title>Profiel - FitFi</title>
        <meta name="description" content="Jouw persoonlijke stijlprofiel en account instellingen." />
      </Helmet>

      <Breadcrumbs />

      {/* Desktop Layout with Sidebar */}
      <div className="ff-container py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto">

          {/* Welcome Message - Premium */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[var(--color-text)] mb-2 lg:mb-3">
              Welkom terug, {user.email?.split('@')[0]}
            </h1>
            <p className="text-base lg:text-lg text-[var(--color-muted)]">
              Beheer je stijlprofiel en persoonlijke voorkeuren
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12">

            {/* Desktop Sidebar - Profile Overview */}
            <aside className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
              <div className="sticky top-24 space-y-6">

                {/* User Avatar & Identity Card */}
                <div className="bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-[var(--radius-2xl)] p-8 text-white shadow-[var(--shadow-elevated)]">
                  {/* Avatar */}
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center shadow-xl">
                    <User className="w-12 h-12 text-white" />
                  </div>

                  {/* User Info */}
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-2 truncate">
                      {user.email?.split('@')[0]}
                    </h2>
                    <p className="text-sm text-white/80 truncate mb-1">
                      {user.email}
                    </p>
                    {user.created_at && (
                      <p className="text-xs text-white/70">
                        Lid sinds {new Date(user.created_at).toLocaleDateString('nl-NL', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>

                  {/* XP Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm text-white/90 mb-3">
                      <span className="font-semibold">Level {level}</span>
                      <span>{xp} / {nextLevelXP} XP</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-white to-yellow-300 rounded-full transition-all duration-500"
                        style={{ width: `${(xp / nextLevelXP) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Stats Sidebar */}
                <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)]">
                  <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider mb-4">
                    Snelle Overzicht
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-muted)]">Stijlprofiel</span>
                      <span className={`text-sm font-bold ${hasStyleProfile ? 'text-emerald-600' : 'text-[var(--color-muted)]'}`}>
                        {hasStyleProfile ? '✓ Compleet' : 'Start quiz'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-muted)]">Opgeslagen Outfits</span>
                      <span className="text-sm font-bold text-[var(--color-text)]">
                        {savedOutfitsCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-muted)]">Activiteit</span>
                      <span className="text-sm font-bold text-[var(--color-text)]">
                        {recentActivity?.length || 0} acties
                      </span>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="w-full px-6 py-4 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl text-sm font-semibold text-[var(--color-text)] hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  Uitloggen
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">

              {/* Mobile Header Card (hidden on desktop) */}
              <div className="lg:hidden mb-6">
                <PremiumHeaderCard
                  user={user}
                  level={level}
                  xp={xp}
                  nextLevelXP={nextLevelXP}
                  onLogout={logout}
                />
              </div>

        {/* Stats Grid - Premium Gradient Cards (Mobile Only) */}
        <div className="lg:hidden grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <PremiumStatCard
            icon={<Target className="w-6 h-6" />}
            label="Stijlprofiel"
            value={hasStyleProfile ? 'Compleet' : 'Start'}
            subValue={archetype || 'Nog niet ingevuld'}
            variant={hasStyleProfile ? 'success' : 'neutral'}
            onClick={hasStyleProfile ? undefined : () => navigate('/onboarding')}
            delay={0}
          />
          <PremiumStatCard
            icon={<Heart className="w-6 h-6" />}
            label="Opgeslagen"
            value={savedOutfitsCount || 0}
            subValue="Outfits"
            variant="pink"
            onClick={() => navigate('/dashboard')}
            delay={0.05}
          />
          <PremiumStatCard
            icon={<Award className="w-6 h-6" />}
            label="Level"
            value={level}
            subValue={`${xp} XP`}
            variant="gold"
            delay={0.1}
          />
          <PremiumStatCard
            icon={<Zap className="w-6 h-6" />}
            label="Activiteit"
            value={recentActivity?.length || 0}
            subValue="Recente acties"
            variant="purple"
            delay={0.15}
          />
        </div>

        {/* Main Content Grid - Responsive */}
        <div className="grid md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <PremiumCard title="Snelle Acties" icon={<Sparkles className="w-6 h-6" />} delay={0.2}>
            <div className="space-y-3">
              <PremiumActionCard
                icon={<Eye className="w-5 h-5" />}
                title="Bekijk Outfits"
                description="Ontdek je gepersonaliseerde stijl"
                to="/results"
                gradient="from-blue-500 to-cyan-500"
              />
              <PremiumActionCard
                icon={<ShoppingBag className="w-5 h-5" />}
                title="Dashboard"
                description="Beheer je collectie"
                to="/dashboard"
                gradient="from-purple-500 to-pink-500"
              />
              <PremiumActionCard
                icon={<RefreshCw className="w-5 h-5" />}
                title="Quiz Opnieuw"
                description="Update je stijlprofiel"
                onClick={() => setShowResetModal(true)}
                gradient="from-emerald-500 to-teal-600"
              />
              <PremiumActionCard
                icon={<Sparkles className="w-5 h-5" />}
                title="Nova AI Chat"
                description="Krijg styling advies"
                to="/dashboard"
                gradient="from-amber-500 to-orange-600"
              />
            </div>
          </PremiumCard>

          {/* Style Profile */}
          {hasStyleProfile ? (
            <PremiumCard title="Mijn Stijl" icon={<Palette className="w-6 h-6" />} delay={0.25}>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--color-muted)] mb-2">Archetype</p>
                  <p className="text-2xl font-bold text-[var(--color-text)] mb-1">
                    {archetype || 'Niet beschikbaar'}
                  </p>
                  {paletteName && (
                    <p className="text-sm text-[var(--color-muted)]">{paletteName}</p>
                  )}
                </div>

                {primaryColors.length > 0 && (
                  <div>
                    <p className="text-sm text-[var(--color-muted)] mb-3">Jouw Kleuren</p>
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      {primaryColors.slice(0, 12).map((color: string, i: number) => (
                        <div
                          key={i}
                          className="aspect-square rounded-lg shadow-sm ring-1 ring-black/5 cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowResetModal(true)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-[var(--color-border)] text-sm font-semibold text-[var(--color-text)] hover:border-[var(--ff-color-primary-500)] hover:bg-[var(--color-bg)] transition-all"
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Quiz Opnieuw Doen
                </button>
              </div>
            </PremiumCard>
          ) : (
            <PremiumCard title="Start je Stijlreis" icon={<Sparkles className="w-6 h-6" />} delay={0.25}>
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)] flex items-center justify-center mb-4">
                  <Palette className="w-10 h-10 text-[var(--ff-color-primary-600)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                  Ontdek je unieke stijl
                </h3>
                <p className="text-[var(--color-muted)] mb-6">
                  Neem onze stijlquiz en ontvang gepersonaliseerde outfit aanbevelingen.
                </p>
                <Button onClick={() => navigate('/onboarding')} variant="primary">
                  <Sparkles className="w-4 h-4" />
                  Start Stijlquiz
                </Button>
              </div>
            </PremiumCard>
          )}

          {/* Email Preferences */}
          <EmailPreferences />

          {/* Cookie & Privacy Settings */}
          <PremiumCard title="Privacy & Cookies" icon={<Shield className="w-6 h-6" />} delay={0.3}>
            <CookieSettings />
          </PremiumCard>

          {/* Account Settings */}
          <PremiumCard title="Account" icon={<SettingsIcon className="w-6 h-6" />} delay={0.35}>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[var(--color-bg)]">
                <p className="text-sm text-[var(--color-muted)] mb-1">Email</p>
                <p className="text-sm font-medium text-[var(--color-text)]">{user.email}</p>
              </div>
              {user.created_at && (
                <div className="p-4 rounded-xl bg-[var(--color-bg)]">
                  <p className="text-sm text-[var(--color-muted)] mb-1">Lid sinds</p>
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    {new Date(user.created_at).toLocaleDateString('nl-NL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </PremiumCard>

          {/* Style Evolution */}
          {hasStyleProfile && (
            <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
              <PremiumCard title="Stijlevolutie" icon={<TrendingUp className="w-6 h-6" />} delay={0.4}>
                <StyleProfileComparison />
              </PremiumCard>
            </div>
          )}
        </div>
        {/* End Main Content Grid */}

            </div>
            {/* End Main Content */}

          </div>
          {/* End Flex Container */}
        </div>
        {/* End max-w-7xl Container */}
      </div>
      {/* End ff-container */}

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

export default ProfilePage;
