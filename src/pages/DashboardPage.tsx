import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { DashboardProvider, useDashboard } from '../context/DashboardContext';
import { useQuizAnswers } from '../hooks/useQuizAnswers';
import Button from '../components/ui/Button';
import LoadingFallback from '../components/ui/LoadingFallback';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import FoundersCard from '../components/dashboard/FoundersCard';
import QuickActions from '../components/dashboard/QuickActions';
import toast from 'react-hot-toast';

const DashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useUser();
  const { resetQuiz, isResetting } = useQuizAnswers();
  const { data, isLoading: dashboardLoading } = useDashboard();

  if (isLoading) {
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

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Skeleton Header */}
          <div className="bg-white rounded-3xl shadow-card p-6 mb-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
          
          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl shadow-card p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded-2xl"></div>
            </div>
            <div className="bg-white rounded-3xl shadow-card p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="space-y-3">
                <div className="h-12 bg-gray-200 rounded-xl"></div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Dashboard Header */}
        {data?.profile && (
          <DashboardHeader profile={data.profile} />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Founders Club Card */}
          {data?.referrals && (
            <FoundersCard 
              referrals={data.referrals}
              shareLink={data.shareLink ?? ''}
            />
          )}

          {/* Quick Actions */}
          <QuickActions 
            onRestartQuiz={handleQuizRestart}
            isResetting={isResetting}
          />
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

export default DashboardPage;