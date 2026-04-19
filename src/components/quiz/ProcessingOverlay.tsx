/**
 * ProcessingOverlay Component
 *
 * Clear, reassuring loading state during quiz submission
 * with progress indication and messaging
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Palette, Shirt, CheckCircle } from 'lucide-react';

interface ProcessingStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  duration: number; // ms
}

const PROCESSING_STEPS: ProcessingStep[] = [
  {
    id: 'analyzing',
    label: 'Je antwoorden analyseren...',
    icon: <Brain className="w-6 h-6" />,
    duration: 2000
  },
  {
    id: 'color',
    label: 'Kleurenprofiel bepalen...',
    icon: <Palette className="w-6 h-6" />,
    duration: 1500
  },
  {
    id: 'style',
    label: 'Style DNA samenstellen...',
    icon: <Shirt className="w-6 h-6" />,
    duration: 2000
  },
  {
    id: 'complete',
    label: 'Profiel gereed!',
    icon: <CheckCircle className="w-6 h-6" />,
    duration: 500
  }
];

interface ProcessingOverlayProps {
  /** Show overlay */
  isVisible: boolean;

  /** Custom message */
  message?: string;

  /** Show step-by-step progress? */
  showSteps?: boolean;

  /** Completion callback */
  onComplete?: () => void;
}

export function ProcessingOverlay({
  isVisible,
  message,
  showSteps = true,
  onComplete
}: ProcessingOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isVisible || !showSteps) {
      setCurrentStepIndex(0);
      setCompletedSteps(new Set());
      return;
    }

    // Auto-progress through steps
    const currentStep = PROCESSING_STEPS[currentStepIndex];
    if (!currentStep) return;

    const timer = setTimeout(() => {
      setCompletedSteps(prev => new Set(prev).add(currentStep.id));

      if (currentStepIndex < PROCESSING_STEPS.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        // All steps complete
        if (onComplete) {
          setTimeout(onComplete, 500);
        }
      }
    }, currentStep.duration);

    return () => clearTimeout(timer);
  }, [isVisible, currentStepIndex, showSteps, onComplete]);

  const currentStep = PROCESSING_STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / PROCESSING_STEPS.length) * 100;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-[#FFFFFF] rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          {/* Animated Icon */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            {/* Spinning gradient ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#C2654A] via-[#C2654A] to-[#C2654A] opacity-20"
              style={{
                background: 'conic-gradient(from 0deg, #C2654A, #C2654A, #C2654A)'
              }}
            />

            {/* Inner icon */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-2 rounded-full bg-gradient-to-r from-[#C2654A] to-[#C2654A] flex items-center justify-center text-white"
            >
              {showSteps && currentStep ? currentStep.icon : <Sparkles className="w-8 h-8" />}
            </motion.div>
          </div>

          {/* Main Message */}
          <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-2">
            {message || (showSteps && currentStep ? currentStep.label : 'Je Style DNA wordt gegenereerd...')}
          </h3>

          <p className="text-sm text-[#8A8A8A] mb-6">
            Dit duurt nog een paar seconden
          </p>

          {/* Progress Bar */}
          {showSteps && (
            <div className="mb-6">
              <div className="h-2 bg-[#FAFAF8] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[#C2654A] to-[#C2654A]"
                />
              </div>
              <div className="mt-2 text-xs font-medium text-[#C2654A]">
                {Math.round(progress)}% voltooid
              </div>
            </div>
          )}

          {/* Step List */}
          {showSteps && (
            <div className="space-y-3 text-left">
              {PROCESSING_STEPS.map((step, index) => {
                const isCompleted = completedSteps.has(step.id);
                const isCurrent = index === currentStepIndex;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: isCurrent || isCompleted ? 1 : 0.4,
                      x: 0
                    }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isCompleted
                          ? 'bg-green-100 text-green-600'
                          : isCurrent
                          ? 'bg-[#FAF5F2] text-[#C2654A]'
                          : 'bg-[#FAFAF8] text-[#8A8A8A]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isCurrent || isCompleted
                          ? 'text-[#1A1A1A]'
                          : 'text-[#8A8A8A]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Reassurance Message */}
          <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
            <p className="text-xs text-[#8A8A8A] leading-relaxed">
              We analyseren je voorkeuren om een persoonlijk stijlprofiel samen te stellen.
              Je resultaten worden veilig opgeslagen.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ProcessingOverlay;
