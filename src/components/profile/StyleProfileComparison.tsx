import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, TrendingUp, RefreshCw } from 'lucide-react';

interface StyleProfile {
  id: string;
  archetype: any;
  color_profile: any;
  created_at: string;
  archived_at?: string;
  is_current?: boolean;
  reset_reason?: string;
}

interface StyleProfileComparisonProps {
  currentProfile: StyleProfile | null;
  history: StyleProfile[];
}

export function StyleProfileComparison({ currentProfile, history }: StyleProfileComparisonProps) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] rounded-2xl p-8 text-center border border-[var(--color-border)]">
        <RefreshCw className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
          Nog geen stijlevolutie
        </h3>
        <p className="text-[var(--color-muted)] text-sm">
          Je hebt je quiz nog niet opnieuw gedaan. Als je dat doet, zie je hier hoe je stijl is veranderd over tijd.
        </p>
      </div>
    );
  }

  const mostRecentHistory = history[0];

  const getArchetypeName = (archetype: any): string => {
    if (!archetype) return 'Onbekend';
    if (typeof archetype === 'string') return archetype;
    if (archetype.name) return archetype.name;
    return 'Onbekend';
  };

  const getColorTemperature = (profile: any): string => {
    if (!profile) return 'Neutraal';
    if (profile.temperature) return profile.temperature;
    if (profile.season) {
      const season = profile.season.toLowerCase();
      if (season.includes('lente') || season.includes('herfst')) return 'Warm';
      if (season.includes('zomer') || season.includes('winter')) return 'Koel';
    }
    return 'Neutraal';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysBetween = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const oldArchetype = getArchetypeName(mostRecentHistory.archetype);
  const newArchetype = currentProfile ? getArchetypeName(currentProfile.archetype) : null;
  const oldColor = getColorTemperature(mostRecentHistory.color_profile);
  const newColor = currentProfile ? getColorTemperature(currentProfile.color_profile) : null;

  const hasChanged = oldArchetype !== newArchetype || oldColor !== newColor;
  const daysBetween = mostRecentHistory.archived_at && currentProfile?.created_at
    ? getDaysBetween(mostRecentHistory.created_at, currentProfile.created_at)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
            Jouw Stijlevolutie
          </h3>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            {history.length} {history.length === 1 ? 'keer' : 'keer'} de quiz gedaan
          </p>
        </div>
        {daysBetween && (
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--ff-color-primary-600)]">
              {daysBetween}
            </div>
            <div className="text-xs text-[var(--color-muted)]">dagen later</div>
          </div>
        )}
      </div>

      {/* Comparison Cards */}
      {currentProfile && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Old Profile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[var(--color-bg)] rounded-2xl p-6 border border-[var(--color-border)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-[var(--color-muted)] text-white text-xs px-3 py-1 rounded-bl-lg">
              Oud profiel
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-4">
                <Calendar className="w-3 h-3" />
                {formatDate(mostRecentHistory.created_at)}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-[var(--color-muted)] mb-1">Archetype</div>
                  <div className="text-lg font-bold text-[var(--color-text)]">
                    {oldArchetype}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[var(--color-muted)] mb-1">Kleurprofiel</div>
                  <div className="text-sm font-medium text-[var(--color-text)]">
                    {oldColor}
                  </div>
                </div>

                {mostRecentHistory.reset_reason && (
                  <div className="pt-3 border-t border-[var(--color-border)]">
                    <div className="text-xs text-[var(--color-muted)] mb-1">Reset reden</div>
                    <div className="text-sm italic text-[var(--color-muted)]">
                      "{mostRecentHistory.reset_reason}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-[var(--color-surface)] border-2 border-[var(--ff-color-primary-500)] rounded-full p-3 shadow-lg">
              <ArrowRight className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
            </div>
          </div>

          {/* New Profile */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] dark:from-[var(--ff-color-primary-900)] dark:to-[var(--ff-color-accent-900)] rounded-2xl p-6 border-2 border-[var(--ff-color-primary-300)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-[var(--ff-color-primary-600)] text-white text-xs px-3 py-1 rounded-bl-lg font-semibold">
              Huidig profiel
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs text-[var(--ff-color-primary-700)] dark:text-[var(--ff-color-primary-300)] mb-4">
                <Calendar className="w-3 h-3" />
                {formatDate(currentProfile.created_at)}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-[var(--ff-color-primary-700)] dark:text-[var(--ff-color-primary-300)] mb-1">
                    Archetype
                  </div>
                  <div className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                    {newArchetype}
                    {hasChanged && oldArchetype !== newArchetype && (
                      <span className="text-xs bg-[var(--ff-color-accent-500)] text-white px-2 py-0.5 rounded-full">
                        Nieuw!
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[var(--ff-color-primary-700)] dark:text-[var(--ff-color-primary-300)] mb-1">
                    Kleurprofiel
                  </div>
                  <div className="text-sm font-medium text-[var(--color-text)] flex items-center gap-2">
                    {newColor}
                    {hasChanged && oldColor !== newColor && (
                      <span className="text-xs bg-[var(--ff-color-accent-500)] text-white px-2 py-0.5 rounded-full">
                        Veranderd!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Insight */}
      {hasChanged ? (
        <div className="bg-[var(--ff-color-primary-50)] dark:bg-[var(--ff-color-primary-900)] rounded-xl p-4 border border-[var(--ff-color-primary-200)]">
          <p className="text-sm text-[var(--ff-color-primary-700)] dark:text-[var(--ff-color-primary-300)]">
            <strong>Je stijl is geëvolueerd!</strong> {oldArchetype !== newArchetype && `Van ${oldArchetype} naar ${newArchetype}.`} {oldColor !== newColor && `Je kleurprofiel is veranderd van ${oldColor} naar ${newColor}.`}
          </p>
        </div>
      ) : currentProfile && (
        <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-muted)]">
            Je archetype en kleurprofiel zijn hetzelfde gebleven. Dit getuigt van een consistente persoonlijke stijl!
          </p>
        </div>
      )}

      {/* Full History Timeline */}
      {history.length > 1 && (
        <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
          <h4 className="text-sm font-semibold text-[var(--color-text)] mb-4">
            Volledige geschiedenis ({history.length} profielen)
          </h4>
          <div className="space-y-3">
            {history.map((profile, index) => (
              <div
                key={profile.id}
                className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-lg"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-[var(--color-text)]">
                    {getArchetypeName(profile.archetype)}
                  </div>
                  <div className="text-xs text-[var(--color-muted)]">
                    {formatDate(profile.created_at)}
                    {profile.archived_at && ` — ${formatDate(profile.archived_at)}`}
                  </div>
                </div>
                <div className="text-xs text-[var(--color-muted)]">
                  #{history.length - index}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
