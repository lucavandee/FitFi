import React, { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useQuizAnswers } from '../hooks/useQuizAnswers';
import Button from '../components/ui/Button';
import LoadingFallback from '../components/ui/LoadingFallback';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, logout } = useUser();
  const { resetQuiz, isResetting } = useQuizAnswers();
  
  // Lazy load dashboard-specific Founders Block
  const FoundersBlockDashboard = React.lazy(() => 
    import('../components/founders/FoundersBlockDashboard')
  );


  if (isLoading) {
    return <LoadingFallback fullScreen message="Dashboard laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center max-w-md">
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

  return (
    <div className="min-h-screen bg-[#FAF8F6] py-12 px-4">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600 mb-4">Welkom, {user.name}!</p>
        <p className="text-gray-600 mb-6">Coming soon - Hier komt je persoonlijke dashboard</p>
        <div className="space-y-4">
          <Button as={Link} to="/results" variant="primary" fullWidth>
            Bekijk Resultaten
          </Button>
          <Button 
            onClick={handleQuizRestart}
            variant="outline" 
            fullWidth
            disabled={isResetting}
            aria-busy={isResetting}
          >
            {isResetting ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                Quiz resetten...
              </div>
            ) : (
              'Quiz opnieuw doen'
            )}
          </Button>
          <Button as={Link} to="/" variant="outline" fullWidth>
            Terug naar Home
          </Button>
          <Button onClick={logout} variant="ghost" fullWidth>
            Uitloggen
          </Button>
        </div>
      </div>
      
      {/* Founders Club Dashboard */}
      <div className="mt-12">
        <Suspense fallback={<LoadingFallback message="Founders Club laden..." />}>
          <FoundersBlockDashboard />
        </Suspense>
      </div>
    </div>
  );
};

export default DashboardPage;