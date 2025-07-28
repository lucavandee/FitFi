import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Button from '../components/ui/Button';
import LoadingFallback from '../components/ui/LoadingFallback';

const DashboardPage: React.FC = () => {
  const { user, isLoading, logout } = useUser();

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

  return (
    <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600 mb-4">Welkom, {user.name}!</p>
        <p className="text-gray-600 mb-6">Coming soon - Hier komt je persoonlijke dashboard</p>
        <div className="space-y-4">
          <Button as={Link} to="/results" variant="primary" fullWidth>
            Bekijk Resultaten
          </Button>
          <Button as={Link} to="/" variant="outline" fullWidth>
            Terug naar Home
          </Button>
          <Button onClick={logout} variant="ghost" fullWidth>
            Uitloggen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;