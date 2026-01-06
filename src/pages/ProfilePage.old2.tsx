import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Eye,
  Target,
  Zap,
  Crown,
  Star,
  ChevronRight
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

const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [showResetModal, setShowResetModal] = useState(false);
  const [syncedProfile, setSyncedProfile] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'style' | 'activity'>('overview');

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
  });

  const { data: profileHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['profileHistory', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return await profileSyncService.getProfileHistory();
    },
    enabled: !!user,
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
  const xpProgress = (xp % 1000) / 10;

  const profileCreatedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long' })
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Helmet>
        <title>Profiel - FitFi</title>
        <meta name="description" content="Jouw persoonlijke stijlprofiel en account instellingen." />
      </Helmet>

      <Breadcrumbs />

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Premium Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--ff-color-primary-600)] via-[var(--ff-color-primary-700)] to-[var(--ff-color-accent-600)] shadow-2xl"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 2%, transparent 0%),
                               radial-gradient(circle at 75% 75%, white 2%, transparent 0%)`,
              backgroundSize: '60px 60px'
            }} />
          </div>

          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-6 flex-1">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center ring-4 ring-white/30 shadow-xl">
                    <User className="w-12 h-12 md:w-16 md:h-16 text-white" />
                  </div>
                  {level >= 5 && (
                    <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center ring-4 ring-white/30 shadow-lg">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                  )}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 truncate">
                    {user.name || user.email?.split('@')[0] || 'Jouw Profiel'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/90 mb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    {profileCreatedDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Sinds {profileCreatedDate}</span>
                      </div>
                    )}
                  </div>

                  <div className="max-w-xs">
                    <div className="flex items-center justify-between text-xs text-white/80 mb-2">
                      <span className="font-semibold">Level {level}</span>
                      <span>{xp} / {nextLevelXP} XP</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-white to-yellow-300 rounded-full shadow-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={logout}
                  variant="ghost"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Uitloggen</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview - IMPROVED CONTRAST */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <PremiumStatCard
            icon={<Target className="w-6 h-6" />}
            label="Stijlprofiel"
            value={hasStyleProfile ? 'Compleet' : 'Start quiz'}
            subValue={archetype || 'Nog niet ingevuld'}
            variant={hasStyleProfile ? 'success' : 'neutral'}
            onClick={() => hasStyleProfile ? setSelectedTab('style') : navigate('/onboarding')}
          />
          <PremiumStatCard
            icon={<Heart className="w-6 h-6" />}
            label="Opgeslagen"
            value={savedOutfitsCount?.toString() || '0'}
            subValue="Outfits"
            variant="accent"
            onClick={() => navigate('/dashboard')}
          />
          <PremiumStatCard
            icon={<Award className="w-6 h-6" />}
            label="Level"
            value={level.toString()}
            subValue={`${xp} XP`}
            variant="gold"
          />
          <PremiumStatCard
            icon={<Zap className="w-6 h-6" />}
            label="Activiteit"
            value={recentActivity?.length.toString() || '0'}
            subValue="Recente acties"
            variant="neutral"
            onClick={() => setSelectedTab('activity')}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overzicht', icon: ShoppingBag },
            { id: 'style', label: 'Mijn Stijl', icon: Palette },
            { id: 'activity', label: 'Activiteit', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white shadow-lg'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <PremiumCard title="Snelle Acties" icon={<Sparkles className="w-6 h-6" />}>
                <div className="space-y-3">
                  <QuickActionButton
                    icon={<Eye className="w-5 h-5" />}
                    title="Bekijk Outfits"
                    description="Ontdek je gepersonaliseerde stijl"
                    to="/results"
                    gradient="from-blue-500 to-cyan-500"
                  />
                  <QuickActionButton
                    icon={<ShoppingBag className="w-5 h-5" />}
                    title="Dashboard"
                    description="Beheer je collectie"
                    to="/dashboard"
                    gradient="from-purple-500 to-pink-500"
                  />
                  <QuickActionButton
                    icon={<RefreshCw className="w-5 h-5" />}
                    title="Quiz Opnieuw"
                    description="Update je stijlprofiel"
                    onClick={() => setShowResetModal(true)}
                    gradient="from-orange-500 to-red-500"
                  />
                </div>
              </PremiumCard>

              <PremiumCard title="Instellingen" icon={<Settings className="w-6 h-6" />}>
                <EmailPreferences />
              </PremiumCard>
            </motion.div>
          )}

          {selectedTab === 'style' && (
            <motion.div
              key="style"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {hasStyleProfile ? (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <PremiumCard title="Stijlarchetype" icon={<Target className="w-6 h-6" />}>
                      <div className="text-center py-8">
                        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)] dark:from-[var(--ff-color-primary-900)] dark:to-[var(--ff-color-accent-900)] flex items-center justify-center mb-4">
                          <Sparkles className="w-12 h-12 text-[var(--ff-color-primary-600)]" />
                        </div>
                        <h3 className="text-3xl font-bold text-[var(--color-text)] mb-2 capitalize">
                          {archetype || 'Niet ingevuld'}
                        </h3>
                        <p className="text-[var(--color-muted)] mb-6">
                          Jouw unieke stijlidentiteit
                        </p>
                        <Button as={Link} to="/results" variant="primary" fullWidth>
                          Bekijk Matching Outfits
                        </Button>
                      </div>
                    </PremiumCard>

                    <PremiumCard title="Kleurpalet" icon={<Palette className="w-6 h-6" />}>
                      {paletteName && (
                        <div className="mb-4">
                          <p className="text-sm text-[var(--color-muted)] mb-1">Seizoen</p>
                          <p className="text-xl font-bold text-[var(--color-text)] capitalize">
                            {paletteName}
                          </p>
                        </div>
                      )}
                      {primaryColors.length > 0 ? (
                        <div>
                          <p className="text-sm text-[var(--color-muted)] mb-3">Jouw Kleuren</p>
                          <div className="grid grid-cols-6 gap-2 mb-6">
                            {primaryColors.slice(0, 12).map((color: string, i: number) => (
                              <motion.div
                                key={i}
                                whileHover={{ scale: 1.1 }}
                                className="aspect-square rounded-lg border-2 border-[var(--color-border)] shadow-sm cursor-pointer"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => setShowResetModal(true)}
                            className="w-full px-4 py-2.5 rounded-lg border-2 border-[var(--color-border)] text-sm font-medium text-[var(--color-text)] hover:border-[var(--ff-color-primary-300)] hover:bg-[var(--color-bg)] transition-all"
                          >
                            <RefreshCw className="w-4 h-4 inline mr-2" />
                            Quiz Opnieuw Doen
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-[var(--color-muted)]">
                          <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Geen kleurgegevens beschikbaar</p>
                        </div>
                      )}
                    </PremiumCard>
                  </div>

                  {/* Style Evolution Section */}
                  {profileHistory && (
                    <PremiumCard title="Stijlevolutie" icon={<TrendingUp className="w-6 h-6" />}>
                      {historyLoading ? (
                        <div className="text-center py-12">
                          <RefreshCw className="w-8 h-8 animate-spin text-[var(--color-muted)] mx-auto mb-4" />
                          <p className="text-[var(--color-muted)]">Laden...</p>
                        </div>
                      ) : (
                        <StyleProfileComparison
                          currentProfile={profileHistory.current_profile}
                          history={profileHistory.history || []}
                        />
                      )}
                    </PremiumCard>
                  )}
                </>
              ) : (
                <PremiumCard title="Start je Stijlreis" icon={<Sparkles className="w-6 h-6" />}>
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)] dark:from-[var(--ff-color-primary-900)] dark:to-[var(--ff-color-accent-900)] flex items-center justify-center mb-6">
                      <Palette className="w-12 h-12 text-[var(--ff-color-primary-600)]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">
                      Ontdek je unieke stijl
                    </h3>
                    <p className="text-[var(--color-muted)] mb-8 max-w-md mx-auto">
                      Neem onze gedetailleerde stijlquiz en ontvang gepersonaliseerde outfit aanbevelingen.
                    </p>
                    <Button onClick={() => navigate('/onboarding')} variant="primary" className="px-8">
                      <Sparkles className="w-4 h-4" />
                      Start Stijlquiz
                    </Button>
                  </div>
                </PremiumCard>
              )}
            </motion.div>
          )}

          {selectedTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PremiumCard title="Recente Activiteit" icon={<TrendingUp className="w-6 h-6" />}>
                {recentActivity && recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity: any, i: number) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg)] border-2 border-[var(--color-border)]"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center text-white flex-shrink-0">
                          <Star className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--color-text)] truncate">
                            {activity.action_type}
                          </p>
                          <p className="text-sm text-[var(--color-muted)]">
                            {new Date(activity.created_at).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[var(--color-muted)]">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Geen recente activiteit</p>
                    <p className="text-sm mt-2">Begin met het ontdekken van outfits!</p>
                  </div>
                )}
              </PremiumCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <QuizResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        currentArchetype={archetype || undefined}
      />
    </div>
  );
};

function PremiumStatCard({
  icon,
  label,
  value,
  subValue,
  variant = 'neutral',
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue: string;
  variant?: 'success' | 'accent' | 'gold' | 'neutral';
  onClick?: () => void;
}) {
  const variantClasses = {
    success: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    accent: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white',
    gold: 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white',
    neutral: 'bg-gradient-to-br from-gray-200 to-slate-300 dark:from-gray-700 dark:to-slate-700 text-gray-900 dark:text-white',
  };

  return (
    <motion.button
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      onClick={onClick}
      disabled={!onClick}
      className={`${variantClasses[variant]} rounded-2xl p-5 text-left transition-all shadow-lg hover:shadow-xl ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <div className="opacity-90 mb-3">
        {icon}
      </div>
      <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold mb-1">
        {value}
      </div>
      <div className="text-sm opacity-80 truncate">
        {subValue}
      </div>
    </motion.button>
  );
}

function PremiumCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[var(--color-border)]">
        <div className="text-[var(--ff-color-primary-600)]">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text)]">
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );
}

function QuickActionButton({
  icon,
  title,
  description,
  to,
  onClick,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  to?: string;
  onClick?: () => void;
  gradient: string;
}) {
  const content = (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg)] border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] transition-all group cursor-pointer">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[var(--color-text)] flex items-center gap-2">
          {title}
          <ChevronRight className="w-4 h-4 text-[var(--color-muted)] group-hover:translate-x-1 transition-transform" />
        </div>
        <div className="text-sm text-[var(--color-muted)] truncate">
          {description}
        </div>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return <button onClick={onClick} className="w-full text-left">{content}</button>;
}

export default ProfilePage;
