import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useQuizAnswers } from '../hooks/useQuizAnswers';
import { useUserStats, useUserStreak, useTouchStreak, useReferrals, useNotifications } from '@/hooks/useDashboard';
import { NovaInsightCard } from '@/components/Dashboard/NovaInsightCard';
import { GamificationPanel } from '@/components/Dashboard/GamificationPanel';
import { NBAQuickActions } from '@/components/Dashboard/NBAQuickActions';
import { ReferralCard } from '@/components/Dashboard/ReferralCard';
import { NotificationsMini } from '@/components/Dashboard/NotificationsMini';
import { ChallengeSnapshot } from '@/components/Dashboard/ChallengeSnapshot';
import { navigationService } from '@/services/navigation/NavigationService';
import Button from '../components/ui/Button';
import LoadingFallback from '../components/ui/LoadingFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { track } from '../utils/analytics';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: userLoading } = useUser();
  const { resetQuiz, isResetting } = useQuizAnswers();
  const userId = user?.id;

  // Dashboard data hooks
  const { data: stats } = useUserStats(userId);
  const { data: streak } = useUserStreak(userId);
  const touch = useTouchStreak();
  const { data: refs } = useReferrals(userId);
  const { data: notes } = useNotifications(userId);

  // Auto-touch daily streak on mount
  React.useEffect(() => { 
    if (userId) touch.mutate(userId); 
  }, [userId]);

  if (userLoading) {
    return <LoadingFallback fullScreen message="Dashboard laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-card text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Inloggen vereist</h2>
          <p className="mb-6">Je moet ingelogd zijn om het dashboard te gebruiken.</p>
          <Button as={Link} to="/inloggen" variant="primary">
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  const handleQuizRestart = async () => {
    try {
      const success = await resetQuiz();
      
      if (success) {
        toast.success('Quiz opnieuw gestart!');
        navigate('/quiz', { replace: true });
      }
    } catch (error) {
      console.error('Quiz restart error:', error);
      toast.error('Kan quiz niet resetten. Probeer opnieuw.');
    }
  };

  // Compute NBA context with real data
  const ctx = {
    hasQuiz: true,             // TODO: uit profiel/answers afleiden
    hasTribe: true,            // TODO: derive from tribe membership
    hasPost: (stats?.posts ?? 0) > 0,
    hasSubmission: (stats?.submissions ?? 0) > 0,
    referrals: refs?.length ?? 0,
    streak: streak?.current_streak ?? 0,
    level: stats?.level ?? 1,
  };

  const inviteUrl = `${location.origin}/?ref=${userId ?? "guest"}`;
  
  // Nova insight (TODO: replace with real AI-generated insight)
  const insight = `Deze week scoor je met warme lagen in navy & camel. Combineer een knit met een lichte overcoat en voeg suede loafer toe voor +style.`; // TODO: vervangen door Nova AI

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Welkom terug, {user.name}!
          </h1>
          <p className="text-gray-600">
            Klaar voor je volgende stijl-avontuur?
          </p>
        </div>

        {/* Nova Daily Insight */}
        <ErrorBoundary>
          <NovaInsightCard text={insight} />
        </ErrorBoundary>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* NBA Quick Actions */}
          <div className="md:col-span-2">
            <ErrorBoundary>
              <NBAQuickActions ctx={ctx} />
            </ErrorBoundary>
          </div>
          
          {/* Gamification Panel */}
          <ErrorBoundary>
            <GamificationPanel 
              level={stats?.level ?? 1} 
              xp={stats?.xp ?? 0} 
              streak={streak?.current_streak ?? 0} 
            />
          </ErrorBoundary>
        </div>

        {/* Secondary Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Referral Card */}
          <ErrorBoundary>
            <ReferralCard 
              codeUrl={inviteUrl} 
              count={refs?.length ?? 0} 
              goal={3}
            />
          </ErrorBoundary>
          
          {/* Notifications Mini */}
          <ErrorBoundary>
            <NotificationsMini items={notes ?? []} />
          </ErrorBoundary>
          
          {/* Challenges Snapshot */}
          <ErrorBoundary>
            <ChallengeSnapshot />
          </ErrorBoundary>
        </div>

        {/* Legacy Actions (Fallback) */}
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h3 className="font-medium text-gray-900 mb-4">Snelle acties</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              as={Link}
              to="/results"
              variant="primary"
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] p-4 h-auto flex-col items-start text-left"
              onClick={() => track('dashboard_action_click', { action: 'view_results' })}
            >
              <span className="font-semibold mb-1">Bekijk Resultaten</span>
              <span className="text-sm opacity-90">Je gepersonaliseerde outfit aanbevelingen</span>
            </Button>
            
            <Button
              as={Link}
              to="/outfits"
              variant="outline"
              className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white p-4 h-auto flex-col items-start text-left"
              onClick={() => track('dashboard_action_click', { action: 'browse_outfits' })}
            >
              <span className="font-semibold mb-1">Ontdek Outfits</span>
              <span className="text-sm opacity-90">Browse door alle outfit aanbevelingen</span>
            </Button>
            
            <Button
              onClick={handleQuizRestart}
              variant="outline"
              disabled={isResetting}
              className="border-gray-300 text-gray-600 hover:bg-gray-50 p-4 h-auto flex-col items-start text-left"
            >
              <span className="font-semibold mb-1">
                {isResetting ? 'Quiz resetten...' : 'Quiz Opnieuw'}
              </span>
              <span className="text-sm opacity-90">Herstart je stijlanalyse</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;