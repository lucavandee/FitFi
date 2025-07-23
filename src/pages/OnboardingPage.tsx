import React from 'react';
import { Outlet } from 'react-router-dom';

const OnboardingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-dark">
      <Outlet />
    </div>
  );
};

export default OnboardingPage;