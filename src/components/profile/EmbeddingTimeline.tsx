import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, TrendingUp, TrendingDown, Plus, Minus, ArrowRight } from 'lucide-react';

interface TimelineSnapshot {
  version: number;
  embedding: Record<string, number>;
  snapshot_trigger: string;
  created_at: string;
  changes: Record<string, {
    old: number;
    new: number;
    delta: number;
  }> | null;
}

interface EmbeddingTimelineProps {
  userId: string;
}

export function EmbeddingTimeline({ userId }: EmbeddingTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineSnapshot[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [compareVersion, setCompareVersion] = useState<number | null>(null);
  const [comparison, setComparison] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, [userId]);

  useEffect(() => {
    if (selectedVersion !== null && compareVersion !== null) {
      loadComparison();
    }
  }, [selectedVersion, compareVersion]);

  const loadTimeline = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');

      const { data, error } = await supabase.rpc('get_user_embedding_timeline', {
        p_user_id: userId
      });

      if (error) throw error;
      setTimeline(data || []);

      if (data && data.length > 0) {
        setSelectedVersion(data[data.length - 1].version);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const loadComparison = async () => {
    if (selectedVersion === null || compareVersion === null) return;

    try {
      const { supabase } = await import('@/lib/supabase');

      const { data, error } = await supabase.rpc('compare_embedding_versions', {
        p_user_id: userId,
        p_version_1: compareVersion,
        p_version_2: selectedVersion
      });

      if (error) throw error;
      setComparison(data || []);
    } catch (err) {
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#FAFAF8] rounded w-1/3" />
          <div className="h-40 bg-[#FAFAF8] rounded" />
        </div>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 text-center">
        <GitBranch className="w-12 h-12 mx-auto text-[#8A8A8A] mb-3" />
        <p className="text-[#8A8A8A]">
          Nog geen embedding geschiedenis beschikbaar
        </p>
      </div>
    );
  }

  const selectedSnapshot = timeline.find(s => s.version === selectedVersion);

  return (
    <div className="space-y-6">
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-[#A8513A]" />
          Stijl Evolutie
        </h3>

        <div className="space-y-3 mb-6">
          {timeline.map((snapshot, index) => (
            <TimelineItem
              key={snapshot.version}
              snapshot={snapshot}
              isSelected={selectedVersion === snapshot.version}
              isCompare={compareVersion === snapshot.version}
              onSelect={() => setSelectedVersion(snapshot.version)}
              onCompare={() => {
                if (compareVersion === snapshot.version) {
                  setCompareVersion(null);
                } else {
                  setCompareVersion(snapshot.version);
                }
              }}
              isLatest={index === timeline.length - 1}
            />
          ))}
        </div>

        {selectedVersion !== null && compareVersion !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[#E5E5E5] pt-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-[#1A1A1A]">
                Vergelijking: v{compareVersion} → v{selectedVersion}
              </h4>
              <button
                onClick={() => setCompareVersion(null)}
                className="text-xs text-[#8A8A8A] hover:text-[#1A1A1A]"
              >
                Sluit
              </button>
            </div>

            <div className="space-y-2">
              {comparison
                .filter(c => c.change_type !== 'stable')
                .map((change) => (
                  <ChangeRow key={change.archetype} change={change} />
                ))}

              {comparison.every(c => c.change_type === 'stable') && (
                <p className="text-sm text-[#8A8A8A] text-center py-4">
                  Geen significante veranderingen tussen deze versies
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {selectedSnapshot && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedVersion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6"
          >
            <h4 className="text-sm font-semibold text-[#1A1A1A] mb-4">
              Versie {selectedSnapshot.version} Details
            </h4>

            <div className="space-y-3">
              {Object.entries(selectedSnapshot.embedding)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([archetype, score]) => (
                  <div key={archetype}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-[#1A1A1A]">
                        {archetype.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-semibold text-[#A8513A]">
                        {Math.round(score)}
                      </span>
                    </div>
                    <div className="h-2 bg-[#FAFAF8] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#C2654A] rounded-full"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>

            {selectedSnapshot.changes && Object.keys(selectedSnapshot.changes).length > 0 && (
              <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
                <p className="text-xs font-semibold text-[#1A1A1A] mb-3">
                  Veranderingen sinds vorige versie:
                </p>
                <div className="space-y-2">
                  {Object.entries(selectedSnapshot.changes).map(([archetype, change]) => (
                    <div
                      key={archetype}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-[#8A8A8A]">
                        {archetype.replace(/_/g, ' ')}
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${
                        change.delta > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {change.delta > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {change.delta > 0 ? '+' : ''}{Math.round(change.delta)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function TimelineItem({
  snapshot,
  isSelected,
  isCompare,
  onSelect,
  onCompare,
  isLatest
}: {
  snapshot: TimelineSnapshot;
  isSelected: boolean;
  isCompare: boolean;
  onSelect: () => void;
  onCompare: () => void;
  isLatest: boolean;
}) {
  const triggerLabels: Record<string, string> = {
    quiz_complete: 'Quiz voltooid',
    swipes_complete: 'Swipes voltooid',
    calibration_complete: 'Calibratie voltooid',
    manual_update: 'Handmatige update'
  };

  const date = new Date(snapshot.created_at);

  return (
    <div
      className={`p-4 border rounded-2xl transition-all cursor-pointer ${
        isSelected
          ? 'border-[#C2654A] bg-[var(--overlay-accent-08a)]'
          : isCompare
          ? 'border-amber-500 bg-amber-50'
          : 'border-[#E5E5E5] hover:border-[#D4856E]'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-[#1A1A1A]">
              Versie {snapshot.version}
            </span>
            {isLatest && (
              <span className="px-2 py-0.5 text-xs font-medium bg-[#A8513A] text-white rounded-full">
                Huidig
              </span>
            )}
          </div>
          <p className="text-xs text-[#8A8A8A]">
            {triggerLabels[snapshot.snapshot_trigger] || snapshot.snapshot_trigger} •{' '}
            {date.toLocaleDateString('nl-NL', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onCompare();
          }}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            isCompare
              ? 'bg-amber-500 text-white'
              : 'text-[#8A8A8A] hover:text-[#C2654A]'
          }`}
        >
          {isCompare ? 'Vergelijk aan' : 'Vergelijk'}
        </button>
      </div>
    </div>
  );
}

function ChangeRow({ change }: { change: any }) {
  const getIcon = () => {
    switch (change.change_type) {
      case 'new':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'removed':
        return <Minus className="w-4 h-4 text-red-600" />;
      case 'increased':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreased':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <ArrowRight className="w-4 h-4 text-[#8A8A8A]" />;
    }
  };

  const getLabel = () => {
    switch (change.change_type) {
      case 'new':
        return 'Nieuw';
      case 'removed':
        return 'Verwijderd';
      case 'increased':
        return `+${Math.round(change.delta)}`;
      case 'decreased':
        return `${Math.round(change.delta)}`;
      default:
        return 'Geen verandering';
    }
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-[#FAFAF8] rounded-lg">
      <div className="flex items-center gap-2">
        {getIcon()}
        <span className="text-sm text-[#1A1A1A]">
          {change.archetype.replace(/_/g, ' ')}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        {change.change_type !== 'new' && change.change_type !== 'removed' && (
          <>
            <span className="text-[#8A8A8A]">
              {Math.round(change.v1_score)}
            </span>
            <ArrowRight className="w-3 h-3 text-[#8A8A8A]" />
            <span className="font-semibold text-[#1A1A1A]">
              {Math.round(change.v2_score)}
            </span>
          </>
        )}
        <span className={`font-semibold ${
          change.change_type === 'new' || change.change_type === 'increased'
            ? 'text-green-600'
            : change.change_type === 'removed' || change.change_type === 'decreased'
            ? 'text-red-600'
            : 'text-[#8A8A8A]'
        }`}>
          {getLabel()}
        </span>
      </div>
    </div>
  );
}
