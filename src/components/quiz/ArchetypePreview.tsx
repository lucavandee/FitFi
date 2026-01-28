import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Award } from 'lucide-react';
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="mb-6 sm:mb-8"
      >
        <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] border-2 border-[var(--ff-color-primary-200)] rounded-2xl p-4 sm:p-6 shadow-lg overflow-hidden relative">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--ff-color-accent-200)] rounded-full blur-3xl opacity-20"></div>

          <div className="relative flex items-start gap-4">
            {/* Archetype Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-3xl sm:text-4xl"
            >
              {config.emoji}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[var(--ff-color-accent-600)] flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-[var(--color-muted)]">
                  Jouw stijlprofiel
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text)] mb-1">
                {config.label}
              </h3>

              <p className="text-sm text-[var(--color-muted)] mb-3">
                {config.description}
              </p>

              {/* Confidence & Progress */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {/* Confidence Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-semibold text-[var(--color-text)]">
                    {confidence}% match
                  </span>
                </div>

                {/* Progress Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                  <Award className="w-3.5 h-3.5 text-[var(--ff-color-accent-600)]" />
                  <span className="text-xs font-semibold text-[var(--color-text)]">
                    {progress}% compleet
                  </span>
                </div>
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

          {/* Helper Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-3 pt-3 border-t border-[var(--ff-color-primary-200)]"
          >
            <p className="text-xs text-[var(--color-muted)] text-center">
              💡 Dit profiel past zich aan terwijl je verder gaat met de quiz
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
