import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
          <Link
            to="/inloggen"
            className="block w-full px-6 py-3 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors text-center"
          >
            Inloggen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[var(--color-text)] mb-2">Jouw Profiel</h1>
            <p className="text-[var(--color-muted)]">Welkom terug, {user.name}!</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/dashboard"
              className="px-4 py-2 border border-[var(--color-border)] rounded-[var(--radius-lg)] text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-[var(--radius-lg)] transition-colors"
            >
              Uitloggen
            </button>
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