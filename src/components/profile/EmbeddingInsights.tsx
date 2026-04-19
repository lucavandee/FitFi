import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, TrendingUp, RefreshCw, Info } from 'lucide-react';
import { EmbeddingService } from '@/services/visualPreferences/embeddingService';
import type { LockedProfile } from '@/services/visualPreferences/embeddingService';

interface EmbeddingInsightsProps {
  userId?: string;
  sessionId?: string;
  onRecalibrate?: () => void;
}

export function EmbeddingInsights({ userId, sessionId, onRecalibrate }: EmbeddingInsightsProps) {
  const [profile, setProfile] = useState<LockedProfile | null>(null);
  const [influence, setInfluence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadEmbeddingData();
  }, [userId, sessionId]);

  const loadEmbeddingData = async () => {
    try {
      const lockedProfile = await EmbeddingService.getLockedProfile(userId, sessionId);
      const influenceData = await EmbeddingService.getInfluenceBreakdown(userId, sessionId);

      setProfile(lockedProfile);
      setInfluence(influenceData);
    } catch (err) {
      console.error('Failed to load embedding data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#FAFAF8] rounded w-1/3" />
          <div className="h-20 bg-[#FAFAF8] rounded" />
          <div className="h-4 bg-[#FAFAF8] rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!profile || !profile.locked_embedding) {
    return (
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 text-center">
        <Sparkles className="w-12 h-12 mx-auto text-[#8A8A8A] mb-3" />
        <p className="text-[#8A8A8A]">
          Voltooi de stijlquiz om je profiel te vullen
        </p>
      </div>
    );
  }

  const topArchetypes = EmbeddingService.getTopArchetypes(profile.locked_embedding, 3);
  const summary = formatArchetypeSummary(topArchetypes);
  const lockedDate = new Date(profile.embedding_locked_at);
  const monthsSinceLock = Math.floor(
    (Date.now() - lockedDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  const shouldRecalibrate = monthsSinceLock >= 6;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[#E5E5E5] rounded-2xl p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#A8513A]" />
              <h3 className="text-xl font-semibold text-[#1A1A1A]">
                Jouw Stijlprofiel
              </h3>
            </div>
            <p className="text-sm text-[#8A8A8A]">
              Versie {profile.embedding_version} • {summary}
            </p>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-[#A8513A] hover:text-[#C2654A] transition-colors flex items-center gap-1"
          >
            <Info className="w-4 h-4" />
            {showDetails ? 'Verberg' : 'Details'}
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {topArchetypes.map(({ archetype, score, percentage }, index) => (
            <ArchetypeBar
              key={archetype}
              archetype={archetype}
              score={score}
              percentage={percentage}
              rank={index + 1}
            />
          ))}
        </div>

        {showDetails && influence && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-[#E5E5E5] pt-4 space-y-3"
          >
            <div className="text-sm font-medium text-[#1A1A1A] mb-2">
              Hoe is dit profiel opgebouwd?
            </div>

            <InfluenceBar
              label="Quiz antwoorden"
              percentage={Math.round(influence.quiz_influence * 100)}
              color="blue"
            />
            <InfluenceBar
              label="Visuele voorkeuren (swipes)"
              percentage={Math.round(influence.swipes_influence * 100)}
              color="purple"
            />
            <InfluenceBar
              label="Outfit feedback"
              percentage={Math.round(influence.calibration_influence * 100)}
              color="green"
            />

            <div className="flex items-center gap-2 text-xs text-[#8A8A8A] mt-3">
              <Clock className="w-3.5 h-3.5" />
              Vastgelegd op {lockedDate.toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </motion.div>
        )}

        {shouldRecalibrate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl"
          >
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 mb-1">
                  Tijd voor een update?
                </p>
                <p className="text-xs text-amber-700 mb-3">
                  Je profiel is {monthsSinceLock} maanden oud. Stijl verandert — misschien tijd om opnieuw te calibreren?
                </p>
                {onRecalibrate && (
                  <button
                    onClick={onRecalibrate}
                    className="bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl text-sm py-2 px-4 inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Opnieuw calibreren
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function ArchetypeBar({
  archetype,
  score,
  percentage,
  rank
}: {
  archetype: string;
  score: number;
  percentage: number;
  rank: number;
}) {
  const formatted = archetype.replace(/_/g, ' ');
  const capitalizedFirst = formatted.charAt(0).toUpperCase() + formatted.slice(1);

  const rankColors: Record<number, string> = {
    1: 'bg-[#A8513A]',
    2: 'bg-[#C2654A]',
    3: 'bg-[#D4856E]'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full ${rankColors[rank] || 'bg-[#8A8A8A]'} text-white text-xs font-semibold flex items-center justify-center`}>
            {rank}
          </div>
          <span className="text-sm font-medium text-[#1A1A1A]">
            {capitalizedFirst}
          </span>
        </div>
        <span className="text-sm font-semibold text-[#A8513A]">
          {percentage}%
        </span>
      </div>
      <div className="h-2.5 bg-[#FAFAF8] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${rankColors[rank] || 'bg-[#8A8A8A]'} rounded-full`}
        />
      </div>
    </div>
  );
}

function InfluenceBar({
  label,
  percentage,
  color
}: {
  label: string;
  percentage: number;
  color: 'blue' | 'purple' | 'green';
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[#8A8A8A]">{label}</span>
        <span className="text-xs font-medium text-[#1A1A1A]">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-[#FAFAF8] rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function formatArchetypeSummary(
  topArchetypes: Array<{ archetype: string; percentage: number }>
): string {
  if (topArchetypes.length === 0) return '';

  const words = topArchetypes
    .slice(0, 3)
    .map(({ archetype }) => {
      const formatted = archetype.replace(/_/g, ' ');
      return formatted.split(' ')[0];
    });

  if (words.length === 1) return words[0];
  if (words.length === 2) return `${words[0]} en ${words[1]}`;
  return `${words[0]}, ${words[1]} en ${words[2]}`;
}
