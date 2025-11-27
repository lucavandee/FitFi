import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Share2, Download } from 'lucide-react';
import { fireConfetti, confettiPresets } from '@/utils/confetti';
import { track } from '@/utils/analytics';

interface ResultsRevealSequenceProps {
  archetype: string;
  archetypeDescription: string;
  colorProfile: any;
  onComplete: () => void;
}

type RevealStage = 'loading' | 'archetypeReveal' | 'shareCard' | 'complete';

export function ResultsRevealSequence({
  archetype,
  archetypeDescription,
  colorProfile,
  onComplete
}: ResultsRevealSequenceProps) {
  const [stage, setStage] = useState<RevealStage>('loading');
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    'Jouw antwoorden analyseren...',
    'Kleurprofiel berekenen...',
    'Stijlprofiel samenstellen...',
    'Aanbevelingen genereren...'
  ];

  useEffect(() => {
    if (stage === 'loading') {
      track('results_reveal_started', { archetype });
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => setStage('archetypeReveal'), 300);
            return 100;
          }
          return prev + 2.5;
        });
      }, 30);

      const stepInterval = setInterval(() => {
        setLoadingStep(prev => {
          if (prev >= loadingSteps.length - 1) {
            clearInterval(stepInterval);
            return prev;
          }
          return prev + 1;
        });
      }, 400);

      return () => {
        clearInterval(progressInterval);
        clearInterval(stepInterval);
      };
    }

    if (stage === 'archetypeReveal') {
      track('results_archetype_revealed', { archetype });
      setTimeout(() => {
        setStage('shareCard');
        fireConfetti({ particleCount: 30, spread: 60, startVelocity: 20 });
      }, 2000);
    }

    if (stage === 'shareCard') {
      setTimeout(() => {
        setStage('complete');
        onComplete();
      }, 2500);
    }
  }, [stage, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[var(--color-bg)] to-[var(--ff-color-primary-50)]">
      <AnimatePresence mode="wait">
        {stage === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-screen p-8"
          >
            <div className="max-w-md w-full space-y-8 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] opacity-20"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <motion.div
                    className="absolute inset-4 rounded-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] opacity-40"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [360, 180, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <div className="absolute inset-8 rounded-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
              </motion.div>

              <div className="space-y-4">
                <motion.h2
                  className="text-2xl font-bold text-[var(--color-text)]"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Je Style DNA wordt gegenereerd...
                </motion.h2>

                <div className="relative h-3 bg-[var(--color-surface)] rounded-full overflow-hidden border border-[var(--color-border)]">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <motion.p
                  className="text-sm text-[var(--color-text-secondary)]"
                  key={loadingStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {loadingSteps[loadingStep]}
                </motion.p>

                <div className="pt-4 text-xs text-[var(--color-text-secondary)] space-y-1">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: progress > 25 ? 1 : 0 }}
                  >
                    ✓ Antwoorden verwerkt
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: progress > 60 ? 1 : 0 }}
                  >
                    ✓ Stijlprofiel samengesteld
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: progress > 90 ? 1 : 0 }}
                  >
                    ✓ Klaar om te delen
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'archetypeReveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-screen p-8"
          >
            <div className="text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <p className="text-xl text-[var(--color-text-secondary)] mb-4">
                  Jouw perfecte stijl is...
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
                className="relative"
              >
                <motion.div
                  className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] opacity-20 blur-xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.3, 0.2]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                />
                <div className="relative bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white px-12 py-8 rounded-3xl shadow-2xl">
                  <Sparkles className="w-8 h-8 mx-auto mb-4" />
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight uppercase">
                    {archetype}
                  </h1>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="text-lg text-[var(--color-text-secondary)] max-w-md mx-auto"
              >
                {archetypeDescription}
              </motion.p>
            </div>
          </motion.div>
        )}

        {stage === 'shareCard' && (
          <motion.div
            key="share"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-screen p-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md w-full bg-[var(--color-surface)] rounded-3xl shadow-2xl p-8 border border-[var(--color-border)]"
            >
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                    {archetype}
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Jouw unieke stijlprofiel
                  </p>
                </div>

                {colorProfile && (
                  <div className="space-y-3 text-left">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-secondary)]">Kleurtemperatuur</span>
                      <span className="font-semibold text-[var(--color-text)] capitalize">
                        {colorProfile.temperature}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-secondary)]">Kleurpalet</span>
                      <span className="font-semibold text-[var(--color-text)]">
                        {colorProfile.paletteName}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      track('results_share_clicked', { archetype });
                      const text = `Mijn stijl is ${archetype}. Ontdek jouw unieke stijlprofiel op FitFi.ai`;
                      if (navigator.share) {
                        navigator.share({ text, url: window.location.origin });
                      }
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[var(--ff-color-primary-600)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Delen
                  </button>
                  <button
                    onClick={() => {
                      track('results_view_outfits_clicked', { archetype });
                      onComplete();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-[var(--color-border)] rounded-xl font-semibold hover:bg-[var(--color-surface)] transition-colors"
                  >
                    Bekijk Outfits
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
