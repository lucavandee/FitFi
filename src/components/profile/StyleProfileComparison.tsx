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
      <div className="bg-[#FFFFFF] rounded-2xl p-8 text-center border border-[#E5E5E5]">
        <RefreshCw className="w-12 h-12 text-[#8A8A8A] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
          Nog geen stijlevolutie
        </h3>
        <p className="text-[#8A8A8A] text-sm">
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
          <h3 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#C2654A]" />
            Jouw Stijlevolutie
          </h3>
          <p className="text-sm text-[#8A8A8A] mt-1">
            {history.length} {history.length === 1 ? 'keer' : 'keer'} de quiz gedaan
          </p>
        </div>
        {daysBetween && (
          <div className="text-right">
            <div className="text-2xl font-bold text-[#C2654A]">
              {daysBetween}
            </div>
            <div className="text-xs text-[#8A8A8A]">dagen later</div>
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
            className="bg-[#FAFAF8] rounded-2xl p-6 border border-[#E5E5E5] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-[#8A8A8A] text-white text-xs px-3 py-1 rounded-bl-lg">
              Oud profiel
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs text-[#8A8A8A] mb-4">
                <Calendar className="w-3 h-3" />
                {formatDate(mostRecentHistory.created_at)}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-[#8A8A8A] mb-1">Archetype</div>
                  <div className="text-lg font-bold text-[#1A1A1A]">
                    {oldArchetype}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#8A8A8A] mb-1">Kleurprofiel</div>
                  <div className="text-sm font-medium text-[#1A1A1A]">
                    {oldColor}
                  </div>
                </div>

                {mostRecentHistory.reset_reason && (
                  <div className="pt-3 border-t border-[#E5E5E5]">
                    <div className="text-xs text-[#8A8A8A] mb-1">Reset reden</div>
                    <div className="text-sm italic text-[#8A8A8A]">
                      "{mostRecentHistory.reset_reason}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-[#FFFFFF] border-2 border-[#C2654A] rounded-full p-3 shadow-lg">
              <ArrowRight className="w-6 h-6 text-[#C2654A]" />
            </div>
          </div>

          {/* New Profile */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-[#FAF5F2] to-[#FAF5F2] dark:from-[#5A2010] dark:to-[#5A2010] rounded-2xl p-6 border-2 border-[#D4856E] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-[#C2654A] text-white text-xs px-3 py-1 rounded-bl-lg font-semibold">
              Huidig profiel
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs text-[#A8513A] dark:text-[#D4856E] mb-4">
                <Calendar className="w-3 h-3" />
                {formatDate(currentProfile.created_at)}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-[#A8513A] dark:text-[#D4856E] mb-1">
                    Archetype
                  </div>
                  <div className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                    {newArchetype}
                    {hasChanged && oldArchetype !== newArchetype && (
                      <span className="text-xs bg-[#C2654A] text-white px-2 py-0.5 rounded-full">
                        Nieuw!
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#A8513A] dark:text-[#D4856E] mb-1">
                    Kleurprofiel
                  </div>
                  <div className="text-sm font-medium text-[#1A1A1A] flex items-center gap-2">
                    {newColor}
                    {hasChanged && oldColor !== newColor && (
                      <span className="text-xs bg-[#C2654A] text-white px-2 py-0.5 rounded-full">
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
        <div className="bg-[#FAF5F2] dark:bg-[#5A2010] rounded-xl p-4 border border-[#F4E8E3]">
          <p className="text-sm text-[#A8513A] dark:text-[#D4856E]">
            <strong>Je stijl is geëvolueerd!</strong> {oldArchetype !== newArchetype && `Van ${oldArchetype} naar ${newArchetype}.`} {oldColor !== newColor && `Je kleurprofiel is veranderd van ${oldColor} naar ${newColor}.`}
          </p>
        </div>
      ) : currentProfile && (
        <div className="bg-[#FFFFFF] rounded-xl p-4 border border-[#E5E5E5]">
          <p className="text-sm text-[#8A8A8A]">
            Je archetype en kleurprofiel zijn hetzelfde gebleven. Dit getuigt van een consistente persoonlijke stijl!
          </p>
        </div>
      )}

      {/* Full History Timeline */}
      {history.length > 1 && (
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E5E5E5]">
          <h4 className="text-sm font-semibold text-[#1A1A1A] mb-4">
            Volledige geschiedenis ({history.length} profielen)
          </h4>
          <div className="space-y-3">
            {history.map((profile, index) => (
              <div
                key={profile.id}
                className="flex items-center justify-between p-3 bg-[#FAFAF8] rounded-lg"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#1A1A1A]">
                    {getArchetypeName(profile.archetype)}
                  </div>
                  <div className="text-xs text-[#8A8A8A]">
                    {formatDate(profile.created_at)}
                    {profile.archived_at && ` — ${formatDate(profile.archived_at)}`}
                  </div>
                </div>
                <div className="text-xs text-[#8A8A8A]">
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
