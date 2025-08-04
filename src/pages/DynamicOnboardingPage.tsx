import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useUser } from '../context/UserContext';
import DynamicOnboardingFlow from '../components/onboarding/DynamicOnboardingFlow';
import { RealtimeProfile, OutfitPreview } from '../types/dynamicOnboarding';
import LoadingFallback from '../components/ui/LoadingFallback';
import NovaChat from '../components/ai/NovaChat';

const DynamicOnboardingPage: React.FC = () => {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();

  const handleOnboardingComplete = (profile: RealtimeProfile, outfits: OutfitPreview[]) => {
    // Navigate to results with dynamic data
    navigate('/results', {
      state: {
        dynamicProfile: profile,
        dynamicOutfits: outfits,
        onboardingType: 'dynamic'
      }
    });
  };

  if (isLoading) {
    return <LoadingFallback fullScreen message="Gebruiker laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Inloggen vereist</h2>
          <p className="text-gray-600 mb-6">Je moet ingelogd zijn om de dynamische onboarding te starten.</p>
          <button 
            onClick={() => navigate('/inloggen')}
            className="w-full bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] py-3 px-6 rounded-2xl font-medium transition-colors"
          >
            Inloggen
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dynamische Stijlontdekking - AI-Powered Onboarding | FitFi</title>
        <meta name="description" content="Ontdek jouw perfecte stijl met Nova's dynamische AI-onboarding. Realtime aanpassingen en directe outfit-previews." />
        <meta property="og:title" content="Dynamische Stijlontdekking - AI-Powered Onboarding" />
        <meta property="og:description" content="Realtime AI-onboarding met directe outfit-previews en gedragsanalyse." />
        <link rel="canonical" href="https://fitfi.app/dynamic-onboarding" />
      </Helmet>

      <DynamicOnboardingFlow onComplete={handleOnboardingComplete} />
      
      {/* Nova Chat for Onboarding */}
      <NovaChat 
        context="onboarding"
      />
    </>
  );
};

export default DynamicOnboardingPage;