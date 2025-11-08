import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useUser } from '../context/UserContext';
import { EmbeddingInsights } from '@/components/profile/EmbeddingInsights';
import { EmbeddingTimeline } from '@/components/profile/EmbeddingTimeline';

const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Breadcrumbs />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[var(--color-text)] mb-2">Jouw Profiel</h1>
            <p className="text-[var(--color-muted)]">Welkom terug, {user.name}!</p>
          </div>
          <div className="flex gap-3">
            <Button as={Link} to="/dashboard" variant="outline">
              Dashboard
            </Button>
            <Button onClick={logout} variant="ghost">
              Uitloggen
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <EmbeddingInsights
            userId={user.id}
            onRecalibrate={() => navigate('/quiz')}
          />

          <EmbeddingTimeline userId={user.id} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;