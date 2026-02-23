import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Award, ChevronDown } from 'lucide-react';
import { convertStyleArrayToPreferences, analyzeUserProfile } from '@/engine/profile-mapping';

interface ArchetypePreviewProps {
  answers: Record<string, any>;
  currentStep: number;
  totalSteps: number;
}

// Archetype display config met Nederlandse namen
const ARCHETYPE_CONFIG: Record<string, {
  label: string;
  description: string;
  emoji: string;
  color: string;
}> = {
  'klassiek': {
    label: 'Klassiek',
    description: 'Tijdloze elegantie en verfijnde stukken',
    emoji: '👔',
    color: 'var(--ff-color-primary-600)'
  },
  'casual_chic': {
    label: 'Smart Casual',
    description: 'Relaxed maar verzorgd en gepolijst',
    emoji: '✨',
    color: 'var(--ff-color-accent-600)'
  },
  'urban': {
    label: 'Urban/Streetwear',
    description: 'Moderne, expressieve streetstyle',
    emoji: '🎨',
    color: 'var(--ff-color-primary-500)'
  },
  'sportief': {
    label: 'Athletic',
    description: 'Sportief, functioneel en comfortabel',
    emoji: '⚡',
    color: 'var(--ff-color-accent-700)'
  },
  'minimalistisch': {
    label: 'Minimalistisch',
    description: 'Clean lijnen en neutrale elegantie',
    emoji: '◼️',
    color: 'var(--color-text)'
  },
  'luxury': {
    label: 'Luxury',
    description: 'Premium kwaliteit en verfijning',
    emoji: '💎',
    color: 'var(--ff-color-primary-700)'
  },
  'streetstyle': {
    label: 'Streetstyle',
    description: 'Bold, urban en vol karakter',
    emoji: '🔥',
    color: 'var(--ff-color-accent-600)'
  },
  'retro': {
    label: 'Retro',
    description: 'Vintage-geïnspireerde stijl',
    emoji: '🕰️',
    color: 'var(--ff-color-primary-500)'
  }
};

export function ArchetypePreview({ answers, currentStep, totalSteps }: ArchetypePreviewProps) {
  const [archetype, setArchetype] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [showPreview, setShowPreview] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    // Only show after gender + style + occasions are answered (step 3+)
    if (currentStep < 2) {
      setShowPreview(false);
      return;
    }

    // Calculate archetype from current answers
    const calculateArchetype = () => {
      try {
        // Need at least stylePreferences to calculate
        if (!answers.stylePreferences || !Array.isArray(answers.stylePreferences) || answers.stylePreferences.length === 0) {
          return;
        }

        // Convert style array to preferences
        const stylePrefs = convertStyleArrayToPreferences(answers.stylePreferences);

        // Get occasions if available
        const occasions = Array.isArray(answers.occasions) ? answers.occasions : [];

        // Analyze profile with occasion awareness
        const profile = analyzeUserProfile(stylePrefs, occasions);

        // Set archetype and calculate confidence based on mix factor
        // Lower mixFactor = higher confidence (dominant archetype is clear)
        const calculatedConfidence = Math.round((1 - profile.mixFactor) * 100);

        setArchetype(profile.dominantArchetype);
        setConfidence(Math.max(60, calculatedConfidence)); // Min 60% to avoid looking uncertain
        setShowPreview(true);

        console.log('[ArchetypePreview] Calculated:', {
          archetype: profile.dominantArchetype,
          confidence: calculatedConfidence,
          scores: profile.archetypeScores,
          occasions
        });
      } catch (error) {
        console.warn('[ArchetypePreview] Failed to calculate archetype:', error);
      }
    };

    calculateArchetype();
  }, [answers, currentStep]);

  // Don't show if we don't have enough data
  if (!showPreview || !archetype) {
    return null;
  }

  const config = ARCHETYPE_CONFIG[archetype] || ARCHETYPE_CONFIG['casual_chic'];
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="mb-4 sm:mb-6"
      >
        {/* Mobile: compact pill — always collapsed by default */}
        <div className="sm:hidden">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-gradient-to-r from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] border border-[var(--ff-color-primary-200)] rounded-xl text-left"
            aria-expanded={!collapsed}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg flex-shrink-0">{config.emoji}</span>
              <div className="min-w-0">
                <span className="text-xs text-[var(--color-muted)]">Jouw stijlprofiel</span>
                <p className="text-sm font-bold text-[var(--color-text)] truncate">{config.label} · {confidence}%</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-[var(--color-muted)] flex-shrink-0 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} aria-hidden="true" />
          </button>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1 p-3 bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] border border-[var(--ff-color-primary-200)] rounded-xl overflow-hidden"
            >
              <p className="text-sm text-[var(--color-muted)] mb-2">{config.description}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-md shadow-sm">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-semibold">{confidence}% match</span>
                </div>
                <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs text-[var(--color-muted)]">{progress}%</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Desktop: full card */}
        <div className="hidden sm:block bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] border-2 border-[var(--ff-color-primary-200)] rounded-2xl p-4 sm:p-6 shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--ff-color-accent-200)] rounded-full blur-3xl opacity-20"></div>
          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center text-3xl">
              {config.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[var(--ff-color-accent-600)] flex-shrink-0" />
                <span className="text-sm font-medium text-[var(--color-muted)]">Jouw stijlprofiel</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">{config.label}</h3>
              <p className="text-sm text-[var(--color-muted)] mb-3">{config.description}</p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-semibold text-[var(--color-text)]">{confidence}% match</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                  <Award className="w-3.5 h-3.5 text-[var(--ff-color-accent-600)]" />
                  <span className="text-xs font-semibold text-[var(--color-text)]">{progress}% compleet</span>
                </div>
              </div>
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
          <div className="mt-3 pt-3 border-t border-[var(--ff-color-primary-200)]">
            <p className="text-xs text-[var(--color-muted)] text-center">
              Dit profiel past zich aan terwijl je verder gaat met de quiz
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
