import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Award, Info, ChevronDown, X } from 'lucide-react';
import { convertStyleArrayToPreferences, analyzeUserProfile } from '@/engine/profile-mapping';

interface ArchetypePreviewEnhancedProps {
  answers: Record<string, any>;
  currentStep: number;
  totalSteps: number;
}

interface ArchetypeScore {
  archetype: string;
  score: number;
  label: string;
}

const ARCHETYPE_CONFIG: Record<string, {
  label: string;
  description: string;
  color: string;
  tagline: string;
  traits: string[];
}> = {
  'klassiek': {
    label: 'Klassiek',
    description: 'Tijdloze elegantie en verfijnde stukken',
    color: '#A85740',
    tagline: 'Tijdloos & verfijnd',
    traits: ['Preppy', 'Verzorgd', 'Professioneel']
  },
  'casual_chic': {
    label: 'Smart Casual',
    description: 'Relaxed maar verzorgd en gepolijst',
    color: '#A85740',
    tagline: 'Relaxed & gepolijst',
    traits: ['Toegankelijk', 'Veelzijdig', 'Modern']
  },
  'urban': {
    label: 'Urban',
    description: 'Moderne, expressieve streetstyle',
    color: '#A85740',
    tagline: 'Expressief & urban',
    traits: ['Bold', 'Creatief', 'Trendy']
  },
  'sportief': {
    label: 'Athletic',
    description: 'Sportief, functioneel en comfortabel',
    color: '#9A503B',
    tagline: 'Actief & functioneel',
    traits: ['Performance', 'Comfort', 'Clean']
  },
  'minimalistisch': {
    label: 'Minimalistisch',
    description: 'Clean lijnen en neutrale elegantie',
    color: '#1A1A1A',
    tagline: 'Clean & architectural',
    traits: ['Tijdloos', 'Neutraal', 'Kwaliteit']
  },
  'luxury': {
    label: 'Luxury',
    description: 'Premium kwaliteit en verfijning',
    color: '#9A503B',
    tagline: 'Premium & exclusief',
    traits: ['Hoogwaardig', 'Verfijnd', 'Statement']
  },
  'streetstyle': {
    label: 'Streetstyle',
    description: 'Bold, urban en vol karakter',
    color: '#A85740',
    tagline: 'Bold & karaktervol',
    traits: ['Expressief', 'Uniek', 'Statement']
  },
  'retro': {
    label: 'Retro',
    description: 'Vintage-geïnspireerde stijl',
    color: '#A85740',
    tagline: 'Vintage & nostalgisch',
    traits: ['Nostalgisch', 'Karaktervol', 'Uniek']
  }
};

// Hier stond een matchpercentage ("{n}% match") naast het stijlprofiel. Dat was
// geen meting: het kwam uit de mix van gekozen stijlen en werd nooit lager dan
// 65 getoond. Het is weg, net als de emoji per archetype; iconen komen uit
// Lucide (CLAUDE.md deel 9).
export function ArchetypePreviewEnhanced({ answers, currentStep, totalSteps }: ArchetypePreviewEnhancedProps) {
  const [archetype, setArchetype] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [allScores, setAllScores] = useState<ArchetypeScore[]>([]);

  useEffect(() => {
    if (currentStep < 2) {
      setShowPreview(false);
      return;
    }

    const calculateArchetype = () => {
      try {
        if (!answers.stylePreferences || !Array.isArray(answers.stylePreferences) || answers.stylePreferences.length === 0) {
          return;
        }

        const stylePrefs = convertStyleArrayToPreferences(answers.stylePreferences);
        const occasions = Array.isArray(answers.occasions) ? answers.occasions : [];
        const profile = analyzeUserProfile(stylePrefs, occasions);

        setArchetype(profile.dominantArchetype);
        setShowPreview(true);

        const scores: ArchetypeScore[] = profile.archetypeScores
          .map((item) => {
            const config = ARCHETYPE_CONFIG[item.archetype] || ARCHETYPE_CONFIG['casual_chic'];
            return {
              archetype: item.archetype,
              score: Math.round(item.score * 100),
              label: config.label
            };
          })
          .sort((a, b) => b.score - a.score);

        setAllScores(scores);

      } catch (error) {
      }
    };

    calculateArchetype();
  }, [answers, currentStep]);

  if (!showPreview || !archetype) {
    return null;
  }

  const config = ARCHETYPE_CONFIG[archetype] || ARCHETYPE_CONFIG['casual_chic'];
  const progress = Math.round((currentStep / totalSteps) * 100);
  const topThree = allScores.slice(0, 3);
  // De scores zijn geen percentages: ze lopen boven de 100 (gemeten: 142, 132
  // en 91 na twee stijlkeuzes). Geen getal dus, alleen de volgorde en een balk
  // ten opzichte van de hoogste score.
  const hoogsteScore = topThree[0]?.score || 1;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="preview"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="mb-4 sm:mb-6"
      >
        {/* Mobile: compact pill that expands on tap */}
        <div className="sm:hidden">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-gradient-to-r from-[#F5F0EB] to-[#F5F0EB] border border-[#F4E8E3] rounded-xl text-left"
            aria-expanded={!collapsed}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="min-w-0">
                <span className="text-xs text-[#6E6E6E]">Jouw stijlprofiel</span>
                <p className="text-sm font-bold text-[#1A1A1A] truncate">{config.label}</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-[#6E6E6E] flex-shrink-0 transition-transform ${collapsed ? '' : 'rotate-180'}`} aria-hidden="true" />
          </button>
          {!collapsed && (
            <div className="mt-1 p-4 bg-gradient-to-br from-[#F5F0EB] to-[#F5F0EB] border border-[#F4E8E3] rounded-xl">
              <p className="text-sm text-[#6E6E6E] mb-2">{config.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {config.traits.map(trait => (
                  <span key={trait} className="inline-block px-2 py-0.5 bg-white/70 rounded-md text-xs font-medium text-[#1A1A1A]">{trait}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Desktop: full card */}
        <div className="hidden sm:block bg-gradient-to-br from-[#F5F0EB] to-[#F5F0EB] border-2 border-[#F4E8E3] rounded-2xl overflow-hidden relative shadow-lg">

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4E8E3] rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#F4E8E3] rounded-full blur-3xl opacity-20"></div>

          {/* Main Preview Card */}
          <div className="relative p-4 sm:p-6">
            <div className="flex items-start gap-4">

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#A85740] flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-[#6E6E6E]">
                    Jouw stijlprofiel
                  </span>
                </div>

                {/* Archetype Name with change animation */}
                <AnimatePresence mode="wait">
                  <motion.h3
                    key={archetype}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-1"
                  >
                    {config.label}
                  </motion.h3>
                </AnimatePresence>

                <p className="text-sm text-[#6E6E6E] mb-1">
                  {config.description}
                </p>

                {/* Traits */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {config.traits.map((trait, idx) => (
                    <motion.span
                      key={trait}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="inline-block px-2 py-0.5 bg-white/60 rounded-md text-xs font-medium text-[#1A1A1A]"
                    >
                      {trait}
                    </motion.span>
                  ))}
                </div>

                {/* Metrics Row */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">

                  {/* Progress Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                    <Award className="w-3.5 h-3.5 text-[#A85740]" />
                    <span className="text-xs font-semibold text-[#1A1A1A]">
                      {progress}% compleet
                    </span>
                  </div>

                  {/* Info button */}
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/60 hover:bg-white rounded-lg transition-colors text-xs font-medium text-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A85740]"
                    aria-label="Bekijk alle archetypes"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Vergelijk</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showComparison ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-1.5 bg-white/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-[#A85740] to-[#A85740] rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Archetype Comparison Expandable */}
          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-[#F4E8E3] bg-white/40 backdrop-blur-sm overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-[#1A1A1A]">
                      Jouw top 3 stijlmatches
                    </h4>
                    <button
                      onClick={() => setShowComparison(false)}
                      className="p-1 hover:bg-white/60 rounded-lg transition-colors"
                      aria-label="Sluit vergelijking"
                    >
                      <X className="w-4 h-4 text-[#6E6E6E]" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {topThree.map((item, index) => (
                      <motion.div
                        key={item.archetype}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          item.archetype === archetype
                            ? 'bg-white shadow-sm'
                            : 'bg-white/50'
                        }`}
                      >
                        {/* Rank Badge */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? 'bg-gradient-to-br from-[#A85740] to-[#A85740] text-white shadow-md'
                            : 'bg-[#FAFAF8] text-[#6E6E6E]'
                        }`}>
                          #{index + 1}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#1A1A1A]">
                              {item.label}
                            </span>
                            {item.archetype === archetype && (
                              <span className="text-xs font-medium text-[#A85740]">
                                (jouw profiel)
                              </span>
                            )}
                          </div>

                          {/* Score bar */}
                          <div className="mt-1.5 h-1.5 bg-[#FAFAF8] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.round((item.score / hoogsteScore) * 100)}%` }}
                              transition={{ duration: 0.6, delay: index * 0.1 }}
                              className={`h-full rounded-full ${
                                item.archetype === archetype
                                  ? 'bg-gradient-to-r from-[#A85740] to-[#A85740]'
                                  : 'bg-[#6E6E6E]'
                              }`}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Helper text */}
                  <p className="mt-4 text-xs text-[#6E6E6E] text-center">
                    Deze scores passen zich aan op basis van je antwoorden
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Helper (always visible) */}
          {!showComparison && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="px-4 sm:px-6 py-3 border-t border-[#F4E8E3] bg-white/30"
            >
              <p className="text-xs text-[#6E6E6E] text-center">
                Dit profiel past zich aan terwijl je verder gaat met de quiz
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
