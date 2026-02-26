import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Target, RefreshCw } from 'lucide-react';
import { EmbeddingService } from '@/services/visualPreferences/embeddingService';

interface ArchetypeDistribution {
  archetype: string;
  user_count: number;
  avg_score: number;
}

interface StabilityDistribution {
  category: string;
  user_count: number;
  percentage: number;
}

export function EmbeddingAnalytics() {
  const [archetypes, setArchetypes] = useState<ArchetypeDistribution[]>([]);
  const [stability, setStability] = useState<StabilityDistribution[]>([]);
  const [stats, setStats] = useState({
    totalLocked: 0,
    avgTimeToLock: 0,
    avgArchetypesPerUser: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');

      // Get archetype distribution
      const { data: archetypeData } = await supabase.rpc('get_archetype_distribution');
      if (archetypeData) {
        setArchetypes(archetypeData.slice(0, 10));
      }

      // Get stability distribution
      const { data: stabilityData } = await supabase.rpc('get_stability_distribution');
      if (stabilityData) {
        const total = stabilityData.reduce((sum: number, s: any) => sum + s.user_count, 0);
        setStability(
          stabilityData.map((s: any) => ({
            ...s,
            percentage: total > 0 ? Math.round((s.user_count / total) * 100) : 0
          }))
        );
      }

      // Get general stats
      const { data: statsData } = await supabase.rpc('get_embedding_stats');
      if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[var(--color-bg)] rounded w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-32 bg-[var(--color-bg)] rounded" />
            <div className="h-32 bg-[var(--color-bg)] rounded" />
            <div className="h-32 bg-[var(--color-bg)] rounded" />
          </div>
          <div className="h-96 bg-[var(--color-bg)] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
            Embedding Analytics
          </h1>
          <p className="text-[var(--color-muted)]">
            Inzicht in style profiles en archetype distributie
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="ff-btn ff-btn-secondary inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Ververs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          label="Locked Profiles"
          value={stats.totalLocked.toLocaleString()}
          color="blue"
        />
        <StatCard
          icon={Target}
          label="Gem. Tijd tot Lock"
          value={`${Math.round(stats.avgTimeToLock)} min`}
          color="purple"
        />
        <StatCard
          icon={BarChart3}
          label="Gem. Archetypes/User"
          value={stats.avgArchetypesPerUser.toFixed(1)}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-6"
        >
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--ff-color-primary-700)]" />
            Top 10 Archetypes
          </h3>

          <div className="space-y-4">
            {archetypes.map((item, index) => (
              <div key={item.archetype}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {item.archetype.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-muted)]">
                      {item.user_count} users
                    </span>
                    <span className="text-sm font-semibold text-[var(--ff-color-primary-700)]">
                      {Math.round(item.avg_score)}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--ff-color-primary-600)] rounded-full"
                    style={{
                      width: `${Math.min(100, (item.user_count / archetypes[0].user_count) * 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-6"
        >
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--ff-color-primary-700)]" />
            Preference Stabiliteit
          </h3>

          <div className="space-y-6">
            {stability.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-[var(--color-text)]">
                      {item.category}
                    </div>
                    <div className="text-xs text-[var(--color-muted)] mt-1">
                      {item.user_count} gebruikers ({item.percentage}%)
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[var(--ff-color-primary-700)]">
                    {item.percentage}%
                  </div>
                </div>
                <div className="h-3 bg-[var(--color-bg)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getStabilityColor(item.category)}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-muted)]">
              <strong>Very Stable (≥90%):</strong> Preferences blijven consistent<br />
              <strong>Moderately Stable (70-90%):</strong> Kleine veranderingen<br />
              <strong>Volatile (&lt;70%):</strong> Significante stijl evolutie
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: any;
  label: string;
  value: string;
  color: 'blue' | 'purple' | 'green';
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    green: 'bg-green-50 text-green-600 border-green-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[var(--color-muted)] mb-2">{label}</p>
          <p className="text-3xl font-bold text-[var(--color-text)]">{value}</p>
        </div>
        <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

function getStabilityColor(category: string): string {
  switch (category) {
    case 'Very Stable':
      return 'bg-green-500';
    case 'Moderately Stable':
      return 'bg-amber-500';
    case 'Volatile':
      return 'bg-red-500';
    default:
      return 'bg-[var(--color-muted)]';
  }
}
