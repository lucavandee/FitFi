import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Wand2, X } from 'lucide-react';
import { track } from '@/utils/analytics';

interface WelcomeTourProps {
  userName?: string;
  onComplete: () => void;
}

type TourStep = 'welcome' | 'outfits' | 'nova' | 'complete';

export function WelcomeTour({ userName, onComplete }: WelcomeTourProps) {
  const [step, setStep] = useState<TourStep>('welcome');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('ff_welcome_tour_completed');
    if (hasSeenTour) {
      setIsVisible(false);
      onComplete();
    } else {
      track('welcome_tour_started');
    }
  }, [onComplete]);

  const handleNext = () => {
    track('welcome_tour_step', { step });
    if (step === 'welcome') setStep('outfits');
    else if (step === 'outfits') setStep('nova');
    else if (step === 'nova') {
      setStep('complete');
      setTimeout(() => {
        track('welcome_tour_completed');
        localStorage.setItem('ff_welcome_tour_completed', 'true');
        setIsVisible(false);
        onComplete();
      }, 1500);
    }
  };

  const handleSkip = () => {
    track('welcome_tour_skipped', { step });
    localStorage.setItem('ff_welcome_tour_completed', 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const steps = {
    welcome: {
      icon: <Sparkles className="w-12 h-12 text-[var(--ff-color-primary-600)]" />,
      title: `Welkom${userName ? `, ${userName}` : ''}!`,
      description: 'Je stijlprofiel is klaar. Laat me je laten zien hoe je dashboard werkt.',
      highlight: null
    },
    outfits: {
      icon: <Heart className="w-12 h-12 text-[var(--ff-color-primary-600)]" />,
      title: 'Persoonlijke Aanbevelingen',
      description: 'Ontdek outfits die bij jouw stijl passen. Klik voor details of om te shoppen.',
      highlight: 'outfits'
    },
    nova: {
      icon: <Wand2 className="w-12 h-12 text-[var(--ff-color-primary-600)]" />,
      title: 'Nova AI Stylist',
      description: 'Stel vragen, krijg stijladvies, of laat Nova nieuwe combinaties voor je maken.',
      highlight: 'nova'
    },
    complete: {
      icon: <Sparkles className="w-12 h-12 text-[var(--ff-color-primary-600)]" />,
      title: 'Klaar!',
      description: 'Ontdek je outfits of chat met Nova. Veel plezier!',
      highlight: null
    }
  };

  const currentStep = steps[step];

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleSkip}
          />
        )}
      </AnimatePresence>

      {/* Tour Card */}
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md mx-4"
          >
            <div className="bg-[var(--color-surface)] rounded-3xl shadow-2xl border border-[var(--color-border)] p-8 relative">
              {/* Close button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-bg)] transition-colors"
                aria-label="Skip tour"
              >
                <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
              </button>

              {/* Content */}
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="flex justify-center"
                >
                  {currentStep.icon}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-[var(--color-text)] mb-3">
                    {currentStep.title}
                  </h2>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    {currentStep.description}
                  </p>
                </motion.div>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 pt-2">
                  {['welcome', 'outfits', 'nova', 'complete'].map((s, i) => (
                    <div
                      key={s}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        s === step
                          ? 'w-8 bg-[var(--ff-color-primary-600)]'
                          : i < ['welcome', 'outfits', 'nova', 'complete'].indexOf(step)
                          ? 'w-2 bg-[var(--ff-color-primary-400)]'
                          : 'w-2 bg-[var(--color-border)]'
                      }`}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {step !== 'complete' && (
                    <button
                      onClick={handleSkip}
                      className="flex-1 px-6 py-3 border-2 border-[var(--color-border)] rounded-xl font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
                    >
                      Skip
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="flex-1 px-6 py-3 bg-[var(--ff-color-primary-600)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
                  >
                    {step === 'complete' ? 'Start Browsen!' : 'Volgende'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spotlight highlights */}
      {currentStep.highlight && (
        <div className="fixed inset-0 z-[99] pointer-events-none">
          {/* This would spotlight specific elements - simplified for now */}
        </div>
      )}
    </>
  );
}
