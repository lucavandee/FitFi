import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import LoadingFallback from '../components/ui/LoadingFallback';

const OnboardingPage: React.FC = () => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <LoadingFallback fullScreen message="Onboarding laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Inloggen vereist</h2>
          <p className="mb-6">Je moet ingelogd zijn om de onboarding te starten.</p>
          <Button as={Link} to="/inloggen" variant="primary">
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welkom, {user.name}!</h1>
        <p className="text-gray-600 mb-6">Laten we je stijlprofiel opzetten</p>
        <div className="space-y-4">
          <Button as={Link} to="/dashboard" variant="primary" fullWidth>
            Ga naar Dashboard
          </Button>
          <Button as={Link} to="/" variant="outline" fullWidth>
            Terug naar Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;