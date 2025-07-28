import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const OnboardingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Onboarding</h1>
        <p className="text-gray-600 mb-6">Coming soon - Hier komt de stijlquiz</p>
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