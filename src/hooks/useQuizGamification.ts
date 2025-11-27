import { useState, useEffect, useCallback } from 'react';
import { QUIZ_MILESTONES, CURIOSITY_TRIGGERS, QuizMilestone, CuriosityTrigger } from '@/types/gamification';

type QuizPhase = 'questions' | 'swipes' | 'calibration';

export function useQuizGamification(currentStep: number, phase: QuizPhase) {
  const [showMilestone, setShowMilestone] = useState<QuizMilestone | null>(null);
  const [showCuriosity, setShowCuriosity] = useState<CuriosityTrigger | null>(null);
  const [triggeredMilestones, setTriggeredMilestones] = useState<Set<string>>(new Set());

  const checkForMilestone = useCallback(() => {
    const milestone = QUIZ_MILESTONES.find(
      m => m.step === currentStep && m.phase === phase
    );

    if (milestone) {
      const key = `${milestone.phase}-${milestone.step}-${milestone.achievement}`;

      if (!triggeredMilestones.has(key)) {
        setShowMilestone(milestone);
        setTriggeredMilestones(prev => new Set(prev).add(key));
      }
    }
  }, [currentStep, phase, triggeredMilestones]);

  const checkForCuriosity = useCallback(() => {
    const trigger = CURIOSITY_TRIGGERS.find(
      t => t.step === currentStep && t.phase === phase
    );

    if (trigger && !showMilestone) {
      const key = `curiosity-${trigger.phase}-${trigger.step}`;

      if (!triggeredMilestones.has(key)) {
        setShowCuriosity(trigger);
        setTriggeredMilestones(prev => new Set(prev).add(key));
      }
    }
  }, [currentStep, phase, showMilestone, triggeredMilestones]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkForMilestone();
      checkForCuriosity();
    }, 500);

    return () => clearTimeout(timer);
  }, [checkForMilestone, checkForCuriosity]);

  const dismissMilestone = useCallback(() => {
    setShowMilestone(null);
  }, []);

  const dismissCuriosity = useCallback(() => {
    setShowCuriosity(null);
  }, []);

  return {
    showMilestone,
    showCuriosity,
    dismissMilestone,
    dismissCuriosity
  };
}
