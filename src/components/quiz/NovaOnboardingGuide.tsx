import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronUp } from 'lucide-react';

interface NovaOnboardingGuideProps {
  currentStep: number;
  totalSteps: number;
  answers: Record<string, any>;
  phase: 'questions' | 'swipes' | 'calibration';
  onOpenChat?: () => void;
}

export function NovaOnboardingGuide({
  currentStep,
  totalSteps,
  answers,
  phase,
  onOpenChat
}: NovaOnboardingGuideProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    // Check for Nova insights first (e.g., color analysis)
    const insights = JSON.parse(localStorage.getItem('ff_nova_insights') || '[]');
    const latestInsight = insights[insights.length - 1];

    if (latestInsight && Date.now() - latestInsight.timestamp < 10000) {
      // Show insight if less than 10 seconds old
      setCurrentMessage(latestInsight.message);
      setIsMinimized(false);
      // Clear after showing
      setTimeout(() => {
        const message = getContextualMessage();
        setCurrentMessage(message);
      }, 8000);
    } else {
      const message = getContextualMessage();
      setCurrentMessage(message);
      setIsMinimized(false);
    }
  }, [currentStep, phase, answers]);

  const getContextualMessage = (): string => {
    if (phase === 'swipes') {
      return 'Swipe naar rechts op looks die je aantrekken! Ik leer van je keuzes.';
    }

    if (phase === 'calibration') {
      return 'Perfect! Nu kalibreer ik je stijlprofiel met echte outfits.';
    }

    const progress = Math.round((currentStep / totalSteps) * 100);

    if (currentStep === 0) {
      return 'Hoi! Ik ben Nova, jouw AI styling assistent. Laten we je perfecte stijl ontdekken!';
    }

    if (currentStep === 1 && answers.gender) {
      const gender = answers.gender;
      if (gender === 'male') {
        return 'Geweldig! Ik heb 250+ herenoutfits klaarstaan voor jou.';
      } else if (gender === 'female') {
        return 'Perfect! Ik heb 350+ damesoutfits in mijn database voor jou.';
      }
    }

    if (answers.stylePreferences && answers.stylePreferences.length > 0) {
      const styles = answers.stylePreferences;
      if (styles.includes('minimal') || styles.includes('modern')) {
        return 'Minimalistisch! Dat past bij 47 topmerken in mijn database.';
      }
      if (styles.includes('classic')) {
        return 'Klassiek! Je hebt een tijdloze smaak - daar kan ik veel mee.';
      }
      if (styles.includes('streetwear')) {
        return 'Streetwear! Ik zie al hoe ik je stijl ga samenstellen.';
      }
    }

    if (progress < 30) {
      return `${progress}% klaar! Je outfits worden al gegenereerd...`;
    }

    if (progress < 60) {
      return 'Interessant! Ik begin je stijlprofiel te zien...';
    }

    if (progress < 90) {
      return 'Nog even! Je persoonlijke Style DNA is bijna klaar.';
    }

    return 'Laatste stap! Straks laat ik je 50+ perfecte outfits zien.';
  };

  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        onClick={() => setIsMinimized(false)}
      >
        <Sparkles className="w-6 h-6 text-white" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 right-6 z-50 max-w-xs"
      >
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-elevated)] p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm">Nova</div>
                <div className="text-xs text-[var(--color-text)]/60">AI Styling Assistent</div>
              </div>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-[var(--color-text)]/40 hover:text-[var(--color-text)] transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Message */}
          <motion.p
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-[var(--color-text)]/80 leading-relaxed"
          >
            {currentMessage}
          </motion.p>

          {/* Progress indicator */}
          {phase === 'questions' && (
            <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between text-xs text-[var(--color-text)]/60 mb-1">
                <span>Voortgang</span>
                <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-[var(--color-bg)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* CTA for questions */}
          {onOpenChat && phase === 'questions' && currentStep > 2 && (
            <button
              onClick={onOpenChat}
              className="mt-3 w-full text-xs py-2 px-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors text-[var(--color-text)]/70 hover:text-[var(--color-text)]"
            >
              💬 Stel me een vraag
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
