import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Heart,
  Calendar,
  Award,
  Zap,
  RefreshCw,
  LogOut,
  ArrowRight,
  User,
  Mail,
  Crown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { useUser } from '../context/UserContext';
import { EmbeddingInsights } from '@/components/profile/EmbeddingInsights';
import { EmbeddingTimeline } from '@/components/profile/EmbeddingTimeline';
import { gamificationService } from '@/services/gamification/gamificationService';
import { supabase } from '@/lib/supabaseClient';

const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['gamification', user?.id],
    queryFn: () => gamificationService.getUserStats(user!.id),
    enabled: !!user,
    staleTime: 30000,
  });

  const { data: savedOutfits } = useQuery({
    queryKey: ['savedOutfits', user?.id],
    queryFn: async () => {
      const client = supabase();
      if (!client || !user) return [];

      const { data, error } = await client
        .from('saved_outfits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching saved outfits:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });

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

  const levelInfo = stats ? gamificationService.getNextLevelInfo(stats.total_xp) : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Breadcrumbs />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] border-b-2 border-[var(--color-border)]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[var(--ff-color-primary-400)] to-[var(--ff-color-accent-400)] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[var(--ff-color-accent-400)] to-[var(--ff-color-primary-400)] rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center text-white shadow-2xl"
              >
                <User className="w-10 h-10" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-[var(--color-text)] mb-2 flex items-center gap-3">
                  {user.name || 'Style Enthusiast'}
                  {stats && stats.current_level >= 10 && (
                    <Crown className="w-8 h-8 text-[var(--ff-color-primary-600)]" />
                  )}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-[var(--color-muted)] flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                  {levelInfo && (
                    <span className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-sm font-semibold text-[var(--ff-color-primary-700)] border border-[var(--color-border)]">
                      {levelInfo.current.icon} {levelInfo.current.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button as={Link} to="/dashboard" variant="outline" className="hover-lift">
                Dashboard
              </Button>
              <Button onClick={logout} variant="ghost" className="hover-lift">
                <LogOut className="w-4 h-4" />
                Uitloggen
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Zap className="w-5 h-5" />}
                label="Total XP"
                value={stats.total_xp.toLocaleString()}
                gradient="from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)]"
              />
              <StatCard
                icon={<Award className="w-5 h-5" />}
                label="Achievements"
                value={stats.achievements_count}
                gradient="from-[var(--ff-color-accent-600)] to-[var(--ff-color-accent-700)]"
              />
              <StatCard
                icon={<Heart className="w-5 h-5" />}
                label="Saved Outfits"
                value={stats.outfits_saved}
                gradient="from-[var(--ff-color-primary-700)] to-[var(--ff-color-accent-700)]"
              />
              <StatCard
                icon={<Calendar className="w-5 h-5" />}
                label="Streak"
                value={`${stats.daily_streak}d`}
                gradient="from-[var(--ff-color-accent-600)] to-[var(--ff-color-primary-600)]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              Jouw Stijl DNA
            </h2>
            <EmbeddingInsights
              userId={user.id}
              onRecalibrate={() => navigate('/quiz')}
            />
          </div>

          {/* Saved Outfits Mini Gallery */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
                <Heart className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
                Opgeslagen Outfits
              </h2>
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-700)] flex items-center gap-1"
              >
                Bekijk alles
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {savedOutfits && savedOutfits.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {savedOutfits.map((outfit: any, index: number) => (
                  <motion.div
                    key={outfit.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="aspect-square rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)] border-2 border-[var(--color-border)] hover-lift overflow-hidden"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-[var(--ff-color-primary-400)]" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] rounded-2xl p-8 text-center">
                <Heart className="w-12 h-12 mx-auto text-[var(--color-muted)] mb-3" />
                <p className="text-[var(--color-muted)] mb-4">
                  Nog geen opgeslagen outfits
                </p>
                <Button as={Link} to="/dashboard" variant="primary" size="sm">
                  Ontdek outfits
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Style Timeline */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
            Jouw Stijlevolutie
          </h2>
          <EmbeddingTimeline userId={user.id} />
        </div>
      </div>
    </div>
  );
};

function StatCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-[var(--color-border)] hover-lift"
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-3 shadow-md`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-[var(--color-text)] mb-1">
        {value}
      </div>
      <div className="text-sm text-[var(--color-muted)] font-medium">
        {label}
      </div>
    </motion.div>
  );
}

export default ProfilePage;