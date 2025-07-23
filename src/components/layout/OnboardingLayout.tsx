import React from 'react';
import { Outlet } from 'react-router-dom';
import { OnboardingProvider } from '../../context/OnboardingContext';

/**
 * Layout component for onboarding flow
 * Provides the OnboardingContext to all nested routes
 */
const OnboardingLayout: React.FC = () => {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B]">
        <Outlet />
      </div>
    </OnboardingProvider>
  );
};

export default OnboardingLayout;