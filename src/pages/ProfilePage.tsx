import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  LogOut,
  RefreshCw,
  Palette,
  ShoppingBag,
  Settings,
  Heart,
  Calendar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useUser } from '../context/UserContext';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';
import { QuizResetModal } from '@/components/profile/QuizResetModal';
import { EmailPreferences } from '@/components/profile/EmailPreferences';

const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [showResetModal, setShowResetModal] = useState(false);

  const { data: styleProfile } = useQuery({
    queryKey: ['styleProfile', user?.id],
    queryFn: async () => {
      const client = supabase();
      if (!client || !user) return null;

      const { data, error } = await client
        .from('style_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching style profile:', error);
        return null;
      }

      return data;
    },
    enabled: !!user,
  });

  const { data: savedOutfitsCount } = useQuery({
    queryKey: ['savedOutfitsCount', user?.id],
    queryFn: async () => {
      const client = supabase();
      if (!client || !user) return 0;

      const { count, error } = await client
        .from('saved_outfits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error counting saved outfits:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-4xl font-bold text-[var(--color-text)] mb-4">Profiel</h1>
          <p className="text-[var(--color-muted)] mb-6">Log in om je profiel te bekijken</p>
          <Button as={Link} to="/inloggen" variant="primary" fullWidth>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  const hasStyleProfile = !!styleProfile;
  const profileCreatedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long' })
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Helmet>
        <title>Profiel - FitFi</title>
        <meta name="description" content="Jouw account en stijlprofiel." />
      </Helmet>

      <Breadcrumbs />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[var(--color-text)] mb-2">
                Profiel
              </h1>
              <p className="text-[var(--color-muted)]">
                Jouw account en stijl
              </p>
            </div>
            <Button onClick={logout} variant="ghost" className="hover-lift">
              <LogOut className="w-4 h-4" />
              Uitloggen
            </Button>
          </div>
        </div>

        {/* Account Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center text-white">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text)]">
                {user.name || user.email?.split('@')[0] || 'Gebruiker'}
              </h2>
              <div className="flex items-center gap-2 text-[var(--color-muted)]">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>
            </div>
          </div>

          {profileCreatedDate && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] pt-4 border-t border-[var(--color-border)]">
              <Calendar className="w-4 h-4" />
              Lid sinds {profileCreatedDate}
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<Palette className="w-5 h-5" />}
            label="Stijlprofiel"
            value={hasStyleProfile ? 'Ingevuld' : 'Nog niet'}
            variant={hasStyleProfile ? 'success' : 'neutral'}
          />
          <StatCard
            icon={<Heart className="w-5 h-5" />}
            label="Opgeslagen"
            value={savedOutfitsCount || 0}
            variant="neutral"
          />
          <StatCard
            icon={<ShoppingBag className="w-5 h-5" />}
            label="Outfits"
            value={hasStyleProfile ? 'Beschikbaar' : 'Start quiz'}
            variant={hasStyleProfile ? 'success' : 'neutral'}
          />
        </div>

        {/* Style Profile Section */}
        {hasStyleProfile ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
                <Palette className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                Jouw stijl
              </h3>
              <button
                onClick={() => setShowResetModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--ff-color-primary-600)] hover:bg-[var(--ff-color-primary-50)] dark:hover:bg-[var(--ff-color-primary-900)] rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Opnieuw doen
              </button>
            </div>

            {styleProfile.dominant_archetype && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--color-muted)] mb-1">Stijltype</p>
                  <p className="text-lg font-semibold text-[var(--color-text)] capitalize">
                    {styleProfile.dominant_archetype}
                  </p>
                </div>

                {styleProfile.color_season && (
                  <div>
                    <p className="text-sm text-[var(--color-muted)] mb-1">Kleurseizoen</p>
                    <p className="text-lg font-semibold text-[var(--color-text)] capitalize">
                      {styleProfile.color_season}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <Button as={Link} to="/results" variant="primary" fullWidth>
                    Bekijk outfits
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] rounded-2xl p-8 text-center mb-6"
          >
            <Palette className="w-12 h-12 mx-auto text-[var(--color-muted)] mb-4" />
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
              Nog geen stijlprofiel
            </h3>
            <p className="text-[var(--color-muted)] mb-6">
              Vul de quiz in om je stijlprofiel en outfits te krijgen.
            </p>
            <Button onClick={() => navigate('/onboarding')} variant="primary">
              Begin quiz
            </Button>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
            Acties
          </h3>

          <div className="space-y-3">
            <ActionButton
              icon={<ShoppingBag className="w-5 h-5" />}
              label="Dashboard"
              description="Bekijk je outfits en favorieten"
              to="/dashboard"
            />
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-start gap-4 p-4 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl hover:bg-[var(--color-bg)] hover:border-[var(--ff-color-primary-300)] transition-all group text-left w-full"
            >
              <div className="p-2 bg-[var(--ff-color-primary-100)] dark:bg-[var(--ff-color-primary-900)] rounded-lg group-hover:scale-110 transition-transform">
                <RefreshCw className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
              </div>
              <div>
                <div className="font-semibold text-[var(--color-text)] mb-1">
                  Quiz opnieuw doen
                </div>
                <div className="text-sm text-[var(--color-muted)]">
                  Update je stijlprofiel
                </div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Email Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <EmailPreferences />
        </motion.div>
      </div>

      {/* Quiz Reset Modal */}
      {user && (
        <QuizResetModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          userId={user.id}
        />
      )}
    </div>
  );
};

function StatCard({
  icon,
  label,
  value,
  variant = 'neutral',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  variant?: 'success' | 'neutral';
}) {
  const bgColor = variant === 'success'
    ? 'from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)]'
    : 'from-gray-50 to-gray-100';

  const textColor = variant === 'success'
    ? 'text-[var(--ff-color-primary-700)]'
    : 'text-[var(--color-text)]';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${bgColor} rounded-xl p-4 border-2 border-[var(--color-border)]`}
    >
      <div className="flex items-center gap-2 mb-2 text-[var(--color-muted)]">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className={`text-lg font-bold ${textColor}`}>
        {value}
      </div>
    </motion.div>
  );
}

function ActionButton({
  icon,
  label,
  description,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg)] border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] transition-all hover-lift"
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center text-white flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-[var(--color-text)]">{label}</div>
        <div className="text-sm text-[var(--color-muted)]">{description}</div>
      </div>
    </Link>
  );
}

export default ProfilePage;
