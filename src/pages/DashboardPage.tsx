import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Seo from "@/components/Seo";
import { 
  User, 
  Settings, 
  TrendingUp, 
  Trophy, 
  Target,
  Users,
  Sparkles,
  ArrowRight,
  Gift
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useGamification } from '../context/GamificationContext';
import { useUserStats, useUserStreak, useReferrals, useNotifications, useTouchStreak, useAddXp } from '../hooks/useDashboard';
import { computeNextActions } from '../services/nba/nextBestActions';
import { NBAQuickActions } from '../components/Dashboard/NBAQuickActions';
import { GamificationPanel } from '../components/Dashboard/GamificationPanel';
import { NovaInsightCard } from '../components/Dashboard/NovaInsightCard';
import { ChallengeSnapshot } from '../components/Dashboard/ChallengeSnapshot';
import { ReferralCard } from '../components/Dashboard/ReferralCard';
import { NotificationsMini } from '../components/Dashboard/NotificationsMini';
import FeaturedOutfitCard from '../components/dashboard/FeaturedOutfitCard';
import StickyBottomBar from '../components/dashboard/StickyBottomBar';
import SafeWidget from '../components/dashboard/SafeWidget';
import Button from '../components/ui/Button';
import LoadingFallback from '../components/ui/LoadingFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';

const DashboardPage: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const { points, level, streak } = useGamification();
  
  // Dashboard data hooks
  const { data: userStats, isLoading: statsLoading } = useUserStats(user?.id);
  const { data: userStreak, isLoading: streakLoading } = useUserStreak(user?.id);
  const { data: referrals, isLoading: referralsLoading } = useReferrals(user?.id);
  const { data: notifications, isLoading: notificationsLoading } = useNotifications(user?.id);
  
  // Mutations
  const touchStreak = useTouchStreak();
  const addXp = useAddXp();

  const [featuredOutfit] = useState({
    id: 'featured-001',
    title: 'Casual Urban Look',
    description: 'Perfect voor een dag in de stad met vrienden',
    imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    matchPercentage: 92,
    archetype: 'casual_chic',
    tags: ['casual', 'urban', 'comfortable']
  });

  const handleClaimDaily = async () => {
    if (!user?.id) return;
    
    try {
      await touchStreak.mutateAsync(user.id);
      await addXp.mutateAsync({ userId: user.id, amount: 10, reason: 'daily_checkin' });
    } catch (error) {
      console.error('Daily claim failed:', error);
    }
  };

  // Compute next best actions
  const nbaContext = {
    hasQuiz: true, // Assume completed if on dashboard
    hasTribe: (referrals?.length || 0) > 0,
    hasPost: false,
    hasSubmission: false,
    referrals: referrals?.length || 0,
    streak: userStreak?.current_streak || 0,
    level: userStats?.level || 1
  };

  if (userLoading) {
    return <LoadingFallback fullScreen message="Dashboard laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Inloggen vereist</h2>
          <p className="text-gray-600 mb-6">Je moet ingelogd zijn om je dashboard te bekijken.</p>
          <Button as={Link} to="/inloggen" variant="primary" fullWidth>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 pb-20 md:pb-8">
      <Seo 
        title="Dashboard - FitFi"
        description="Jouw persoonlijke stijldashboard met outfit geschiedenis, aanbevelingen en styling insights."
      />
      <Helmet>
        <title>Dashboard - Jouw Stijlcentrum | FitFi</title>
        <meta name="description" content="Bekijk je stijlprofiel, outfits, challenges en voortgang op je persoonlijke FitFi dashboard." />
      </Helmet>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ErrorBoundary>
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">
                  Welkom terug, {user.name}!
                </h1>
                <p className="text-gray-600">
                  Hier is je persoonlijke stijloverzicht
                </p>
              </div>
              
              <Button
                as={Link}
                to="/profile"
                variant="outline"
                size="sm"
                icon={<Settings size={16} />}
                iconPosition="left"
                className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
              >
                Instellingen
              </Button>
            </div>
          </div>
        </ErrorBoundary>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <ErrorBoundary>
              <SafeWidget name="Quick Actions">
                <div className="bg-white rounded-3xl shadow-sm p-6">
                  <h2 className="text-xl font-medium text-gray-900 mb-6">Aanbevolen acties</h2>
                  <NBAQuickActions ctx={nbaContext} />
                </div>
              </SafeWidget>
            </ErrorBoundary>

            {/* Featured Outfit */}
            <ErrorBoundary>
              <SafeWidget name="Featured Outfit">
                <FeaturedOutfitCard 
                  outfit={featuredOutfit}
                  loading={false}
                />
              </SafeWidget>
            </ErrorBoundary>

            {/* Challenge Snapshot */}
            <ErrorBoundary>
              <SafeWidget name="Challenge Snapshot">
                <ChallengeSnapshot />
              </SafeWidget>
            </ErrorBoundary>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Gamification Panel */}
            <ErrorBoundary>
              <SafeWidget name="Gamification Panel">
                <GamificationPanel 
                  level={userStats?.level}
                  xp={userStats?.xp}
                  streak={userStreak?.current_streak}
                  loading={statsLoading || streakLoading}
                />
              </SafeWidget>
            </ErrorBoundary>

            {/* Nova Insight */}
            <ErrorBoundary>
              <SafeWidget name="Nova Insight">
                <NovaInsightCard 
                  text="Je stijl evolueert naar meer verfijnde keuzes. Probeer eens een statement accessoire!"
                  loading={false}
                />
              </SafeWidget>
            </ErrorBoundary>

            {/* Referral Card */}
            <ErrorBoundary>
              <SafeWidget name="Referral Card">
                <ReferralCard 
                  codeUrl={`https://fitfi.app/?ref=${user.id}`}
                  count={referrals?.length || 0}
                  goal={3}
                />
              </SafeWidget>
            </ErrorBoundary>

            {/* Notifications */}
            <ErrorBoundary>
              <SafeWidget name="Notifications">
                <NotificationsMini 
                  items={notifications}
                  loading={notificationsLoading}
                />
              </SafeWidget>
            </ErrorBoundary>
          </div>
        </div>

        {/* Quick Links */}
        <ErrorBoundary>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: '/outfits', label: 'Outfits', icon: <TrendingUp size={20} />, color: 'bg-blue-50 text-blue-600' },
              { href: '/gamification', label: 'Levels', icon: <Trophy size={20} />, color: 'bg-yellow-50 text-yellow-600' },
              { href: '/tribes', label: 'Tribes', icon: <Users size={20} />, color: 'bg-purple-50 text-purple-600' },
              { href: '/quiz', label: 'Quiz', icon: <Target size={20} />, color: 'bg-green-50 text-green-600' }
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:transform hover:scale-105 text-center group"
              >
                <div className={`w-12 h-12 ${link.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  {link.icon}
                </div>
                <span className="font-medium text-gray-900">{link.label}</span>
              </Link>
            ))}
          </div>
        </ErrorBoundary>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <StickyBottomBar 
        onClaimDaily={handleClaimDaily}
        userId={user.id}
      />
    </div>
  );
};

export default DashboardPage;