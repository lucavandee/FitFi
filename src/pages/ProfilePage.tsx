import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';

const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Profiel</h1>
          <p className="text-gray-600 mb-6">Je moet ingelogd zijn om je profiel te bekijken</p>
          <Button as={Link} to="/inloggen" variant="primary" fullWidth>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Profiel</h1>
        <p className="text-gray-600 mb-4">Welkom, {user.name}!</p>
        <p className="text-gray-600 mb-6">Coming soon - Hier komt je profielpagina</p>
        <div className="space-y-4">
          <Button as={Link} to="/dashboard" variant="primary" fullWidth>
            Ga naar Dashboard
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

export default ProfilePage;