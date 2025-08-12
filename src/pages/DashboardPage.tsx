import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useUser } from '@/context/UserContext';
import { useQuizAnswers } from '@/hooks/useQuizAnswers';
import { useABVariant } from '@/hooks/useABVariant';
import {
  useUserStats,
  useUserStreak,
  useTouchStreak,
  useReferrals,
  useNotifications,
  useAddXp,
} from '@/hooks/useDashboard';
import { NovaInsightCard } from '@/components/Dashboard/NovaInsightCard';
import { GamificationPanel } from '@/components/Dashboard/GamificationPanel';
import { NBAQuickActions } from '@/components/Dashboard/NBAQuickActions';
import { ReferralCard } from '@/components/Dashboard/ReferralCard';
import { NotificationsMini } from '@/components/Dashboard/NotificationsMini';
import { ChallengeSnapshot } from '@/components/Dashboard/ChallengeSnapshot';
import FeaturedOutfitCard from '@/components/dashboard/FeaturedOutfitCard';
import StickyMobileCTA from '@/components/dashboard/StickyMobileCTA';
import Button from '@/components/ui/Button';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import LoadingFallback from '@/components/ui/LoadingFallback';
import { routeTo } from '@/services/navigation/NavigationService';
import { track } from '@/utils/analytics';
import toast from 'react-hot-toast';

// Kleine helper: vangt widgetfouten lokaal + voegt analytics toe
const SafeWidget: React.FC<{ name: string; children: React.ReactNode }> = ({ name, children }) => (
  <ErrorBoundary
    onError={(err) => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'widget_error', {
          event_category: 'error',
          event_label: name,
          error_message: err.message,
        });
      }
    }}
    fallback={<div className="bg-white rounded-2xl p-6 shadow"><div className="text-sm text-gray-500">Kon {name} niet laden.</div></div>}
  >
    {children}
  </ErrorBoundary>
);

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isLoading: userLoading } = useUser();
  const { resetQuiz, isResetting } = useQuizAnswers();
  const abVariant = useABVariant('dashboard_cta');
  const userId = user?.id;

  // Data hooks
  const { data: stats, isLoading: statsLoading } = useUserStats(userId);
  const { data: streak, isLoading: streakLoading } = useUserStreak(userId);
  const { data: refs, isLoading: refsLoading } = useReferrals(userId);
  const { data: notes, isLoading: notesLoading } = useNotifications(userId);

  const touch = useTouchStreak();
  const addXp = useAddXp();

  // Prefetch critical routes
  React.useEffect(() => {
    if (userId) {
      // Prefetch outfits and results for faster navigation
      queryClient.prefetchQuery({
        queryKey: ['outfits', userId],
        queryFn: () => fetch('/api/outfits').then(res => res.json()),
        staleTime: 5 * 60 * 1000 // 5 minutes
      });
      
      queryClient.prefetchQuery({
        queryKey: ['results', userId],
        queryFn: () => fetch('/api/results').then(res => res.json()),
        staleTime: 5 * 60 * 1000
      });
    }
  }, [userId, queryClient]);

  // Touch streak bij binnenkomst (idempotent via service)
  React.useEffect(() => {
    if (userId) touch.mutate(userId);
  }, [userId]);

  const handleClaimDaily = async () => {
    if (!userId) return;
    try {
      // Track A/B variant
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'cta_click', {
          variant: abVariant,
          label: 'claim_daily',
          userId
        });
      }
      
      await touch.mutateAsync(userId);
      await addXp.mutateAsync({ userId, amount: 10 });
      toast.success('+10 XP toegevoegd!');
      track('daily_xp_claimed', { userId, where: 'dashboard' });
    } catch (e) {
      console.error(e);
      toast.error('Claimen mislukt. Probeer opnieuw.');
    }
  };

  const handleQuizRestart = async () => {
    try {
      // Track A/B variant
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'cta_click', {
          variant: abVariant,
          label: 'quiz_restart',
          userId
        });
      }
      
      const ok = await resetQuiz();
      if (ok) {
        toast.success('Quiz opnieuw gestart!');
        navigate('/quiz', { replace: true });
      }
    } catch (e) {
      console.error(e);
      toast.error('Kan quiz niet resetten.');
    }
  };

  const handleOutfitsClick = () => {
    // Track A/B variant
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'cta_click', {
        variant: abVariant,
        label: 'discover_outfits',
        userId
      });
    }
    
    track('dashboard_outfits_click', { userId, variant: abVariant });
    navigate('/outfits');
  };

  // NBA context
  const ctx = {
    hasQuiz: true,
    hasTribe: true,
    hasPost: (stats?.posts ?? 0) > 0,
    hasSubmission: (stats?.submissions ?? 0) > 0,
    referrals: refs?.length ?? 0,
    streak: streak?.current_streak ?? 0,
    level: stats?.level ?? 1,
  };

  const inviteUrl = `${location.origin}/?ref=${encodeURIComponent(userId ?? 'guest')}`;
  const insight = `Deze week scoor je met warme lagen in navy — combineer textuur met minimalistische sneakers.`;

  // Mock featured outfit data
  const featuredOutfit = {
    id: 'featured-001',
    title: 'Modern Minimalist Look',
    description: 'Tijdloze elegantie met een moderne twist. Perfect voor werk en weekend.',
    imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
    matchPercentage: 94,
    archetype: 'casual_chic',
    tags: ['minimalist', 'versatile', 'elegant']
  };

  // Loading state (eerste paint)
  if (userLoading) return <div className="p-8">Even laden…</div>;

  return (
    <>
      <Helmet>
        <title>Dashboard - FitFi | Jouw Persoonlijke Stijlassistent</title>
        <meta name="description" content="Bekijk je stijlprofiel, ontdek nieuwe outfits en verdien punten met FitFi's AI-powered styling platform." />
        
        {/* Referral Social Preview */}
        <meta property="og:title" content="Ontdek jouw AI Stijlprofiel met FitFi" />
        <meta property="og:description" content="Doe de quiz, ontdek je stijl en zie outfits die perfect bij jou passen." />
        <meta property="og:image" content={`${window.location.origin}/images/referral-preview.jpg`} />
        <meta property="og:url" content={inviteUrl} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ontdek jouw AI Stijlprofiel met FitFi" />
        <meta name="twitter:description" content="Doe de quiz, ontdek je stijl en zie outfits die perfect bij jou passen." />
        <meta name="twitter:image" content={`${window.location.origin}/images/referral-preview.jpg`} />
      </Helmet>
      
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-1">Welkom terug, {user?.name ?? 'Gast'}!</h1>
            <p className="text-gray-600">Klaar voor je volgende stijl‑avontuur?</p>
          </div>
          <Link to="/profile" className="px-4 py-2 rounded-full bg-gray-900 text-white hover:opacity-90">Profiel</Link>
        </header>

        {/* Top: Nova insight + Gamification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SafeWidget name="NovaInsight">
            <NovaInsightCard
              insight={insight}
              onSeeOutfits={() => navigate(routeTo('outfits'))}
            />
          </SafeWidget>

          <SafeWidget name="GamificationPanel">
            <GamificationPanel
              streak={streak?.current_streak ?? 0}
              level={stats?.level ?? 1}
              xp={stats?.xp ?? 0}
              onClaimDaily={handleClaimDaily}
              loading={streakLoading || statsLoading}
            />
          </SafeWidget>

          <SafeWidget name="NextBestActions">
            <NBAQuickActions ctx={ctx} />
          </SafeWidget>
        </div>

        {/* Middle: 2‑koloms content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <SafeWidget name="OutfitCTA">
              <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Ga verder met je outfits</h3>
                  <p className="text-gray-600 text-sm">Bekijk suggesties op basis van je stijlprofiel.</p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleOutfitsClick}
                    data-ab-variant={abVariant}
                  >
                    Ontdek Outfits
                  </Button>
                    data-ab-variant={abVariant}
                  <Button variant="outline" disabled={isResetting} onClick={handleQuizRestart}>
                    {isResetting ? 'Quiz resetten…' : 'Quiz opnieuw'}
                  </Button>
                </div>
              </div>
            </SafeWidget>

            <SafeWidget name="FeaturedOutfit">
              <FeaturedOutfitCard
                outfit={featuredOutfit}
                loading={false}
              />
            </SafeWidget>

            <SafeWidget name="ChallengeSnapshot">
              <ChallengeSnapshot />
            </SafeWidget>
          </div>

          <div className="space-y-6">
            <SafeWidget name="Referrals">
              <ReferralCard codeUrl={inviteUrl} count={refs?.length ?? 0} goal={3} />
            </SafeWidget>

            <SafeWidget name="Notifications">
              <NotificationsMini items={notes} loading={notesLoading} />
            </SafeWidget>
          </div>
        </div>
        
        {/* Sticky Mobile CTA */}
        <StickyMobileCTA
          onClaimDaily={handleClaimDaily}
          userId={userId}
        />
      </div>
    </div>
    </>
  );
};

export default DashboardPage;