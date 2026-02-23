import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Award, Info, ChevronDown, X } from 'lucide-react';
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
  emoji: string;
}

const ARCHETYPE_CONFIG: Record<string, {
  label: string;
  description: string;
  emoji: string;
  color: string;
  tagline: string;
  traits: string[];
}> = {
  'klassiek': {
    label: 'Klassiek',
    description: 'Tijdloze elegantie en verfijnde stukken',
    emoji: '👔',
    color: 'var(--ff-color-primary-600)',
    tagline: 'Tijdloos & verfijnd',
    traits: ['Preppy', 'Verzorgd', 'Professioneel']
  },
  'casual_chic': {
    label: 'Smart Casual',
    description: 'Relaxed maar verzorgd en gepolijst',
    emoji: '✨',
    color: 'var(--ff-color-accent-600)',
    tagline: 'Relaxed & gepolijst',
    traits: ['Toegankelijk', 'Veelzijdig', 'Modern']
  },
  'urban': {
    label: 'Urban',
    description: 'Moderne, expressieve streetstyle',
    emoji: '🎨',
    color: 'var(--ff-color-primary-500)',
    tagline: 'Expressief & urban',
    traits: ['Bold', 'Creatief', 'Trendy']
  },
  'sportief': {
    label: 'Athletic',
    description: 'Sportief, functioneel en comfortabel',
    emoji: '⚡',
    color: 'var(--ff-color-accent-700)',
    tagline: 'Actief & functioneel',
    traits: ['Performance', 'Comfort', 'Clean']
  },
  'minimalistisch': {
    label: 'Minimalistisch',
    description: 'Clean lijnen en neutrale elegantie',
    emoji: '◼️',
    color: 'var(--color-text)',
    tagline: 'Clean & architectural',
    traits: ['Tijdloos', 'Neutraal', 'Kwaliteit']
  },
  'luxury': {
    label: 'Luxury',
    description: 'Premium kwaliteit en verfijning',
    emoji: '💎',
    color: 'var(--ff-color-primary-700)',
    tagline: 'Premium & exclusief',
    traits: ['Hoogwaardig', 'Verfijnd', 'Statement']
  },
  'streetstyle': {
    label: 'Streetstyle',
    description: 'Bold, urban en vol karakter',
    emoji: '🔥',
    color: 'var(--ff-color-accent-600)',
    tagline: 'Bold & karaktervol',
    traits: ['Expressief', 'Uniek', 'Statement']
  },
  'retro': {
    label: 'Retro',
    description: 'Vintage-geïnspireerde stijl',
    emoji: '🕰️',
    color: 'var(--ff-color-primary-500)',
    tagline: 'Vintage & nostalgisch',
    traits: ['Nostalgisch', 'Karaktervol', 'Uniek']
  }
};

export function ArchetypePreviewEnhanced({ answers, currentStep, totalSteps }: ArchetypePreviewEnhancedProps) {
  const [archetype, setArchetype] = useState<string | null>(null);
  const [previousArchetype, setPreviousArchetype] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [showPreview, setShowPreview] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [allScores, setAllScores] = useState<ArchetypeScore[]>([]);
  const [isChanging, setIsChanging] = useState(false);

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

        const calculatedConfidence = Math.round((1 - profile.mixFactor) * 100);
        const newArchetype = profile.dominantArchetype;

        if (newArchetype !== archetype && archetype !== null) {
          setIsChanging(true);
          setPreviousArchetype(archetype);
          setTimeout(() => setIsChanging(false), 600);
        }

        setArchetype(newArchetype);
        setConfidence(Math.max(65, calculatedConfidence));
        setShowPreview(true);

        const scores: ArchetypeScore[] = Object.entries(profile.archetypeScores)
          .map(([key, score]) => {
            const config = ARCHETYPE_CONFIG[key] || ARCHETYPE_CONFIG['casual_chic'];
            return {
              archetype: key,
              score: Math.round((score as number) * 100),
              label: config.label,
              emoji: config.emoji
            };
          })
          .sort((a, b) => b.score - a.score);

        setAllScores(scores);

      } catch (error) {
        console.warn('[ArchetypePreview] Failed to calculate archetype:', error);
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
            className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-gradient-to-r from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] border border-[var(--ff-color-primary-200)] rounded-xl text-left"
            aria-expanded={!collapsed}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl flex-shrink-0">{config.emoji}</span>
              <div className="min-w-0">
                <span className="text-xs text-[var(--color-muted)]">Jouw stijlprofiel</span>
                <p className="text-sm font-bold text-[var(--color-text)] truncate">{config.label} · {confidence}% match</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-[var(--color-muted)] flex-shrink-0 transition-transform ${collapsed ? '' : 'rotate-180'}`} aria-hidden="true" />
          </button>
          {!collapsed && (
            <div className="mt-1 p-4 bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] border border-[var(--ff-color-primary-200)] rounded-xl">
              <p className="text-sm text-[var(--color-muted)] mb-2">{config.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {config.traits.map(trait => (
                  <span key={trait} className="inline-block px-2 py-0.5 bg-white/70 rounded-md text-xs font-medium text-[var(--color-text)]">{trait}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Desktop: full card */}
        <div className="hidden sm:block bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] border-2 border-[var(--ff-color-primary-200)] rounded-2xl overflow-hidden relative shadow-lg">

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ff-color-accent-200)] rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--ff-color-primary-200)] rounded-full blur-3xl opacity-20"></div>

          {/* Main Preview Card */}
          <div className="relative p-4 sm:p-6">
            <div className="flex items-start gap-4">

              {/* Animated Archetype Icon */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={archetype}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15
                  }}
                  className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-3xl sm:text-4xl relative"
                >
                  {config.emoji}

                  {/* Change indicator */}
                  {isChanging && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 0] }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 bg-[var(--ff-color-accent-400)] rounded-xl opacity-30"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[var(--ff-color-accent-600)] flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-[var(--color-muted)]">
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
                    className="text-lg sm:text-xl font-bold text-[var(--color-text)] mb-1"
                  >
                    {config.label}
                  </motion.h3>
                </AnimatePresence>

                <p className="text-sm text-[var(--color-muted)] mb-1">
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
                      className="inline-block px-2 py-0.5 bg-white/60 rounded-md text-xs font-medium text-[var(--color-text)]"
                    >
                      {trait}
                    </motion.span>
                  ))}
                </div>

                {/* Metrics Row */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">

                  {/* Confidence Badge */}
                  <motion.div
                    key={`confidence-${confidence}`}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-semibold text-[var(--color-text)]">
                      {confidence}% match
                    </span>
                  </motion.div>

                  {/* Progress Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                    <Award className="w-3.5 h-3.5 text-[var(--ff-color-accent-600)]" />
                    <span className="text-xs font-semibold text-[var(--color-text)]">
                      {progress}% compleet
                    </span>
                  </div>

                  {/* Info button */}
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/60 hover:bg-white rounded-lg transition-colors text-xs font-medium text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)]"
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
                    className="h-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-full"
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
                className="border-t border-[var(--ff-color-primary-200)] bg-white/40 backdrop-blur-sm overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-[var(--color-text)]">
                      Jouw top 3 stijlmatches
                    </h4>
                    <button
                      onClick={() => setShowComparison(false)}
                      className="p-1 hover:bg-white/60 rounded-lg transition-colors"
                      aria-label="Sluit vergelijking"
                    >
                      <X className="w-4 h-4 text-[var(--color-muted)]" />
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
                            ? 'bg-gradient-to-br from-[var(--ff-color-accent-500)] to-[var(--ff-color-accent-600)] text-white shadow-md'
                            : 'bg-[var(--color-bg)] text-[var(--color-muted)]'
                        }`}>
                          #{index + 1}
                        </div>

                        {/* Emoji */}
                        <div className="text-2xl">
                          {item.emoji}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[var(--color-text)]">
                              {item.label}
                            </span>
                            {item.archetype === archetype && (
                              <span className="text-xs font-medium text-[var(--ff-color-accent-600)]">
                                (jouw profiel)
                              </span>
                            )}
                          </div>

                          {/* Score bar */}
                          <div className="mt-1.5 h-1.5 bg-[var(--color-bg)] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.score}%` }}
                              transition={{ duration: 0.6, delay: index * 0.1 }}
                              className={`h-full rounded-full ${
                                item.archetype === archetype
                                  ? 'bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)]'
                                  : 'bg-[var(--color-muted)]'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex-shrink-0 text-sm font-bold text-[var(--color-text)]">
                          {item.score}%
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Helper text */}
                  <p className="mt-4 text-xs text-[var(--color-muted)] text-center">
                    💡 Deze scores passen zich aan op basis van je antwoorden
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
              className="px-4 sm:px-6 py-3 border-t border-[var(--ff-color-primary-200)] bg-white/30"
            >
              <p className="text-xs text-[var(--color-muted)] text-center">
                💡 Dit profiel past zich aan terwijl je verder gaat met de quiz
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
