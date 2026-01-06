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
  Zap
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
import { profileSyncService } from '@/services/data/profileSyncService';
import { BentoGrid } from '@/components/dashboard/BentoGrid';
import {
  ProfileHeaderWidget,
  StyleSummaryWidget,
  QuickStatsWidget,
  ProfileQuickActions,
  RecentActivityWidget,
  SettingsWidget
} from '@/components/profile/ProfileWidgets';

/**
 * Clean Profile Page
 *
 * Premium Bento Grid layout matching Dashboard
 *
 * Performance Optimizations:
 * - No heavy gradient header (old version was 300px+)
 * - No AnimatePresence tabs (eliminated re-render overhead)
 * - Animations disabled on mobile
 * - Scroll optimizations (will-change, contain)
 * - Query stale-time optimization
 * - Simplified component tree
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

  // Optimized queries with staleTime
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
    staleTime: 300000, // 5 minutes
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
    staleTime: 60000, // 1 minute
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
    staleTime: 120000, // 2 minutes
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
    staleTime: 60000, // 1 minute
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

  // Quick stats
  const stats = [
    {
      icon: Target,
      label: 'Stijlprofiel',
      value: hasStyleProfile ? 'Compleet' : 'Leeg',
      subValue: archetype || 'Start quiz',
      onClick: hasStyleProfile ? undefined : () => navigate('/onboarding')
    },
    {
      icon: Heart,
      label: 'Opgeslagen',
      value: savedOutfitsCount || 0,
      subValue: 'Outfits',
      onClick: () => navigate('/dashboard')
    },
    {
      icon: Award,
      label: 'Level',
      value: level,
      subValue: `${xp} XP`
    },
    {
      icon: Zap,
      label: 'Activiteit',
      value: recentActivity?.length || 0,
      subValue: 'Recente acties'
    }
  ];

  // Quick actions
  const actions = [
    {
      icon: Eye,
      title: 'Bekijk Outfits',
      description: 'Ontdek je gepersonaliseerde stijl',
      to: '/results'
    },
    {
      icon: ShoppingBag,
      title: 'Dashboard',
      description: 'Beheer je collectie',
      to: '/dashboard'
    },
    {
      icon: RefreshCw,
      title: 'Quiz opnieuw',
      description: 'Update je stijlprofiel',
      to: '/onboarding'
    },
    {
      icon: Sparkles,
      title: 'Nova AI Chat',
      description: 'Krijg styling advies',
      to: '/dashboard' // Nova opens from dashboard
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Helmet>
        <title>Profiel - FitFi</title>
        <meta name="description" content="Jouw persoonlijke stijlprofiel en account instellingen." />
      </Helmet>

      <Breadcrumbs />

      {/* Compact Header */}
      <div className="py-8 sm:py-12 bg-[var(--color-bg)]">
        <div className="ff-container">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-[var(--color-muted)] mb-2">
              Profiel
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text)]">
              {user.name || user.email?.split('@')[0] || 'Account'}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content - Bento Grid */}
      <div className="ff-container pb-24">
        <div className="max-w-7xl mx-auto">
          <BentoGrid>
            {/* Profile Header */}
            <ProfileHeaderWidget
              user={user}
              level={level}
              xp={xp}
              nextLevelXP={nextLevelXP}
            />

            {/* Quick Stats */}
            <QuickStatsWidget stats={stats} />

            {/* Style Summary */}
            {hasStyleProfile && (
              <StyleSummaryWidget
                archetype={archetype}
                paletteName={paletteName}
                primaryColors={primaryColors}
              />
            )}

            {/* Quick Actions */}
            <ProfileQuickActions actions={actions} />

            {/* Recent Activity */}
            {recentActivity && recentActivity.length > 0 && (
              <RecentActivityWidget activities={recentActivity} />
            )}

            {/* Email Preferences */}
            <EmailPreferences />

            {/* Settings */}
            <SettingsWidget onLogout={logout} />

            {/* Style Evolution (if history exists) */}
            {hasStyleProfile && (
              <StyleProfileComparison />
            )}
          </BentoGrid>
        </div>
      </div>

      {/* Quiz Reset Modal */}
      {showResetModal && (
        <QuizResetModal onClose={() => setShowResetModal(false)} />
      )}
    </div>
  );
};

export default ProfilePage;
