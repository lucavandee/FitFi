import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles, Trophy, Zap, Home } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to FitFi! 🎉',
    description: 'Laten we je even rondleiden. Dit duurt maar 30 seconden en helpt je om het maximale uit FitFi te halen.',
    icon: <Home className="w-6 h-6" />,
    position: 'center',
  },
  {
    id: 'nova',
    title: 'Nova - Je AI Style Assistent',
    description: 'Stel vragen, vraag advies, of laat Nova outfits voor je samenstellen. Altijd beschikbaar via deze chat bubble.',
    icon: <Sparkles className="w-6 h-6" />,
    targetSelector: '[data-tour="nova-launcher"]',
    position: 'left',
  },
  {
    id: 'gamification',
    title: 'Verdien XP & Achievements 🏆',
    description: 'Level up je style! Elke actie geeft XP. Unlock achievements, behaal milestones en wordt deel van de community.',
    icon: <Trophy className="w-6 h-6" />,
    targetSelector: '[data-tour="gamification"]',
    position: 'top',
  },
  {
    id: 'refine',
    title: 'Verfijn Je Stijl',
    description: 'Swipe door looks die je mooi vindt. FitFi leert van je keuzes en maakt steeds betere matches.',
    icon: <Zap className="w-6 h-6" />,
    targetSelector: '[data-tour="refine-style"]',
    position: 'top',
  },
  {
    id: 'complete',
    title: 'Je bent klaar! 🎊',
    description: 'Tijd om je eerste outfit te ontdekken. Veel plezier en welkom bij FitFi!',
    icon: <Sparkles className="w-6 h-6" />,
    position: 'center',
  },
];

const STORAGE_KEY = 'fitfi_tour_completed';

export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem(STORAGE_KEY);

    if (!hasCompletedTour) {
      setTimeout(() => {
        setIsActive(true);
      }, 1500);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const step = TOUR_STEPS[currentStep];
    if (step.targetSelector) {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });

        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setTargetPosition(null);
    }
  }, [currentStep, isActive]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeTour();
  };

  const completeTour = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsActive(false);
  };

  if (!isActive) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isCenterStep = step.position === 'center';

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={handleSkip}
      />

      {/* Spotlight */}
      {targetPosition && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: targetPosition.top - 8,
            left: targetPosition.left - 8,
            width: targetPosition.width + 16,
            height: targetPosition.height + 16,
          }}
        >
          <div className="w-full h-full rounded-2xl border-4 border-[var(--ff-color-primary-500)] shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] animate-pulse" />
        </motion.div>
      )}

      {/* Tour Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`fixed z-[10000] ${
            isCenterStep
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
              : getCardPosition(step.position, targetPosition)
          } max-w-md w-[90vw] sm:w-96`}
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-[var(--color-border)] p-6 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[var(--ff-color-primary-500)]/20 to-[var(--ff-color-accent-500)]/20 blur-3xl" />

            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors z-10"
              aria-label="Sluit tour"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="relative">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center text-white mb-4 shadow-lg">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-[var(--color-muted)] mb-6 leading-relaxed">
                {step.description}
              </p>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {TOUR_STEPS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-[var(--ff-color-primary-600)]'
                        : 'w-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
                    }`}
                    aria-label={`Ga naar stap ${index + 1}`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {!isFirstStep && (
                  <button
                    onClick={handlePrev}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-[var(--color-border)] text-[var(--color-text)] font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Vorige
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className={`${
                    isFirstStep ? 'flex-1' : 'flex-[2]'
                  } px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--ff-color-primary-700)] to-[var(--ff-color-accent-700)] text-white font-semibold hover:from-[var(--ff-color-primary-600)] hover:to-[var(--ff-color-accent-600)] transition-all flex items-center justify-center gap-2 shadow-lg`}
                >
                  {isLastStep ? 'Start met FitFi' : 'Volgende'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Skip link */}
              {!isLastStep && (
                <button
                  onClick={handleSkip}
                  className="w-full mt-3 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  Overslaan
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function getCardPosition(
  position: 'top' | 'bottom' | 'left' | 'right' | 'center' | undefined,
  targetPosition: { top: number; left: number; width: number; height: number } | null
): string {
  if (!targetPosition) return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';

  const offset = 24;

  switch (position) {
    case 'top':
      return `bottom-[calc(100vh-${targetPosition.top}px+${offset}px)] left-1/2 -translate-x-1/2`;
    case 'bottom':
      return `top-[${targetPosition.top + targetPosition.height + offset}px] left-1/2 -translate-x-1/2`;
    case 'left':
      return `top-[${targetPosition.top}px] right-[calc(100vw-${targetPosition.left}px+${offset}px)]`;
    case 'right':
      return `top-[${targetPosition.top}px] left-[${targetPosition.left + targetPosition.width + offset}px]`;
    default:
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
  }
}

export function resetTour() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
