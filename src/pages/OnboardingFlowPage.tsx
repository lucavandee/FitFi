import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CircleCheck as CheckCircle, Clock, AlertCircle, X, Sparkles } from "lucide-react";
import { quizSteps, getSizeFieldsForGender, getStyleOptionsForGender } from "@/data/quizSteps";
import { supabase } from "@/lib/supabaseClient";
import { computeResult } from "@/lib/quiz/logic";
import { StyleProfileGenerator } from "@/services/styleProfile/styleProfileGenerator";
import { LS_KEYS } from "@/lib/quiz/types";
import PhotoUpload from "@/components/quiz/PhotoUpload";
import { VisualPreferenceStepClean as VisualPreferenceStep } from "@/components/quiz/VisualPreferenceStepClean";
import { CalibrationStep } from "@/components/quiz/CalibrationStep";
import { EmailCapturePrompt } from "@/components/quiz/EmailCapturePrompt";
import { EmbeddingService } from "@/services/visualPreferences/embeddingService";
import { VisualPreferenceService } from "@/services/visualPreferences/visualPreferenceService";
import { AnimatedQuestionTransition } from "@/components/quiz/AnimatedQuestionTransition";
import { ResultsRevealSequence } from "@/components/results/ResultsRevealSequence";
import { PhaseTransition } from "@/components/quiz/PhaseTransition";
import { ArchetypePreviewEnhanced as ArchetypePreview } from "@/components/quiz/ArchetypePreviewEnhanced";
import toast from "react-hot-toast";

type QuizAnswers = {
  gender?: string;
  stylePreferences?: string[];
  baseColors?: string;
  bodyType?: string;
  occasions?: string[];
  budgetRange?: number;
  sizes?: any;
  colorAnalysis?: any;
  photoUrl?: string;
  fit?: string;
  materials?: string[];
  goals?: string[];
  prints?: string;
  visualPreferencesCompleted?: boolean;
  calibrationCompleted?: boolean;
};

type QuizPhase = 'questions' | 'swipes' | 'calibration' | 'reveal';

export default function OnboardingFlowPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phase, setPhase] = useState<QuizPhase>('questions');
  const [sessionId] = useState(() => localStorage.getItem('ff_session_id') || crypto.randomUUID());
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(() => {
    return !!localStorage.getItem('ff_email_captured');
  });
  const [revealData, setRevealData] = useState<{
    archetype: string;
    archetypeDescription: string;
    colorProfile: any;
  } | null>(null);

  // Nova inline reactions
  const [showNovaReaction, setShowNovaReaction] = useState(false);
  const [lastAnsweredField, setLastAnsweredField] = useState<string | null>(null);

  // Phase transitions
  const [showTransition, setShowTransition] = useState(false);
  const [transitionTo, setTransitionTo] = useState<'swipes' | 'calibration' | 'reveal' | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);


  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam === 'visual') {
      setPhase('swipes');
      const existingAnswers = localStorage.getItem(LS_KEYS.QUIZ_ANSWERS);
      if (existingAnswers) {
        try {
          setAnswers(JSON.parse(existingAnswers));
        } catch {
        }
      }
    }
  }, [searchParams]);

  const totalSteps = quizSteps.length + 2;

  // Get current step with dynamic options injection
  const getCurrentStep = () => {
    const baseStep = quizSteps[currentStep];
    if (!baseStep) return null;

    // Inject dynamic style options based on selected gender
    if (baseStep.field === 'stylePreferences') {
      return {
        ...baseStep,
        options: getStyleOptionsForGender(answers.gender)
      };
    }

    // Inject dynamic size fields based on selected gender
    if (baseStep.field === 'sizes') {
      return {
        ...baseStep,
        sizeFields: getSizeFieldsForGender(answers.gender)
      };
    }

    return baseStep;
  };

  const step = getCurrentStep();

  const getProgress = () => {
    if (phase === 'questions') return ((currentStep + 1) / totalSteps) * 100;
    if (phase === 'swipes') return ((quizSteps.length + 0.5) / totalSteps) * 100;
    if (phase === 'calibration') return ((quizSteps.length + 1.5) / totalSteps) * 100;
    return 100;
  };

  const progress = getProgress();

  const autosave = (updated: QuizAnswers) => {
    try {
      localStorage.setItem(LS_KEYS.QUIZ_ANSWERS, JSON.stringify(updated));
    } catch (_) {}
  };

  const handleAnswer = (field: string, value: any) => {
    const updated = { ...answers, [field]: value };
    setAnswers(updated);
    autosave(updated);
    setAttemptedNext(false);

    setLastAnsweredField(field);
    setShowNovaReaction(true);
    setTimeout(() => setShowNovaReaction(false), 3500);
  };

  const handleMultiSelect = (field: string, value: string) => {
    setAnswers(prev => {
      const current = (prev[field as keyof QuizAnswers] as string[]) || [];
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      const updated = { ...prev, [field]: newValue };
      autosave(updated);
      return updated;
    });
    setAttemptedNext(false);
  };

  const canProceed = () => {
    if (!step) return false;
    const answer = answers[step.field as keyof QuizAnswers];
    if (!step.required) return true;
    if (step.type === 'checkbox' || step.type === 'multiselect') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer !== undefined && answer !== null && answer !== '';
  };

  // Get validation error message for current step
  const getValidationError = () => {
    if (!step || !step.required) return null;
    const answer = answers[step.field as keyof QuizAnswers];

    if (step.type === 'checkbox' || step.type === 'multiselect') {
      if (!Array.isArray(answer) || answer.length === 0) {
        return 'Selecteer minimaal één optie om verder te gaan';
      }
    } else {
      if (answer === undefined || answer === null || answer === '') {
        return 'Dit veld is verplicht om verder te gaan';
      }
    }
    return null;
  };

  const handleSkip = () => {
    setAttemptedNext(false);
    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (phase === 'questions') {
      setShowReviewModal(true);
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      setAttemptedNext(true);
      return;
    }

    setShowNovaReaction(false);
    setAttemptedNext(false);

    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(prev => prev + 1);

      if (currentStep === 2 && !emailCaptured && !showEmailCapture) {
        setShowEmailCapture(true);
      }
    } else if (phase === 'questions') {
      setShowReviewModal(true);
    } else if (phase === 'swipes') {
      setTransitionTo('calibration');
      setShowTransition(true);
    } else {
      handleSubmit();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAndContinueLater = () => {
    autosave(answers);
    toast.success('Je antwoorden zijn opgeslagen. Je kunt later verdergaan.');
    navigate('/');
  };

  const handleConfirmProceed = () => {
    setShowConfirmationModal(false);
    setShowReviewModal(false);
    setTransitionTo('swipes');
    setShowTransition(true);
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
    if (transitionTo) {
      setPhase(transitionTo);
      setTransitionTo(null);
    }
  };

  const handleSwipesComplete = () => {
    setAnswers(prev => ({ ...prev, visualPreferencesCompleted: true }));
    setTransitionTo('calibration');
    setShowTransition(true);
  };

  const handleCalibrationComplete = async () => {
    setAnswers(prev => ({ ...prev, calibrationCompleted: true }));
    await handleSubmit();
  };

  const handleBack = () => {
    setAttemptedNext(false); // Reset validation state when going back

    if (phase === 'swipes') {
      setPhase('questions');
      setCurrentStep(quizSteps.length - 1);
    } else if (phase === 'calibration') {
      setPhase('swipes');
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    // Clear any local storage quiz data
    localStorage.removeItem(LS_KEYS.QUIZ_ANSWERS);
    localStorage.removeItem('ff_session_id');
    // Navigate to home
    navigate('/');
  };

  const saveQuizAnswersIndividually = async (
    client: any,
    userId: string
  ): Promise<void> => {
    try {
      const answersToSave = Object.entries(answers).map(([key, value]) => ({
        user_id: userId,
        question_id: key,
        answer: value,
      }));

      const { error } = await client
        .from('quiz_answers')
        .upsert(answersToSave, {
          onConflict: 'user_id,question_id',
          ignoreDuplicates: false
        });

      if (error) throw error;
    } catch {
    }
  };

  const saveToSupabase = async (
    client: any,
    user: any,
    sessionId: string,
    result: any,
    retryCount = 0
  ): Promise<boolean> => {
    try {
      const profileData = {
        user_id: user?.id || null,
        session_id: !user ? sessionId : null,
        gender: answers.gender,
        archetype: result.archetype,
        color_profile: result.color,
        color_analysis: answers.colorAnalysis || null,
        photo_url: answers.photoUrl || null,
        quiz_answers: answers,
        sizes: answers.sizes || null,
        budget_range: answers.budgetRange ? { min: 0, max: answers.budgetRange } : null,
        preferred_occasions: answers.occasions || [],
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Check if profile exists first
      let existingProfile: any = null;
      if (user?.id) {
        const { data } = await client
          .from('style_profiles')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .maybeSingle();
        existingProfile = data;
      }

      let error: any = null;

      if (existingProfile) {
        const updateResult = await client
          .from('style_profiles')
          .update(profileData)
          .eq('id', existingProfile.id);
        error = updateResult.error;
      } else {
        const insertResult = await client
          .from('style_profiles')
          .insert(profileData);
        error = insertResult.error;
      }

      if (error) {
        if (retryCount < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return saveToSupabase(client, user, sessionId, result, retryCount + 1);
        }
        return false;
      }

      if (user?.id) {
        await saveQuizAnswersIndividually(client, user.id);
      }

      // Verify the save by fetching it back
      const verifyQuery = user?.id
        ? client.from('style_profiles').select('id, completed_at').eq('user_id', user.id)
        : client.from('style_profiles').select('id, completed_at').eq('session_id', sessionId);

      const { data: verifyData, error: verifyError } = await verifyQuery
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (verifyError || !verifyData) return false;

      return true;
    } catch {
      if (retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return saveToSupabase(client, user, sessionId, result, retryCount + 1);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Get user/session for swipe data
      const client = supabase();
      let userId: string | null = null;

      if (client?.auth) {
        try {
          const { data } = await client.auth.getUser();
          userId = data?.user?.id || null;
        } catch {
        }
      }

      const photoAnalysis = localStorage.getItem('ff_onboarding_photo_analysis');

      let colorProfile: any;
      let archetype: any;
      let profileResult: any;

      try {
        profileResult = await StyleProfileGenerator.generateStyleProfile(
          answers as any,
          userId || undefined,
          !userId ? sessionId : undefined
        );

        colorProfile = profileResult.colorProfile;
        archetype = profileResult.archetype;

        if (photoAnalysis) {
          try {
            const analysis = JSON.parse(photoAnalysis);
            colorProfile = {
              ...colorProfile,
              photoAnalysis: analysis,
              undertone: analysis.undertone || colorProfile.undertone,
              seasonalType: analysis.seasonal_type || colorProfile.seasonalType
            };
          } catch {
          }
        }
      } catch {
        const fallbackResult = computeResult(answers as any);
        colorProfile = fallbackResult.color;
        archetype = fallbackResult.archetype;
      }

      localStorage.setItem(LS_KEYS.QUIZ_ANSWERS, JSON.stringify(answers));
      localStorage.setItem(LS_KEYS.COLOR_PROFILE, JSON.stringify(colorProfile));
      localStorage.setItem(LS_KEYS.ARCHETYPE, JSON.stringify(archetype));
      localStorage.setItem(LS_KEYS.RESULTS_TS, Date.now().toString());
      localStorage.setItem(LS_KEYS.QUIZ_COMPLETED, "1");
      localStorage.setItem('ff_session_id', sessionId);

      // client and userId already declared above
      let syncSuccess = false;
      let user: any = null;

      if (client?.auth && !userId) {
        try {
          const { data } = await client.auth.getUser();
          user = data?.user || null;
          userId = user?.id || null;
        } catch {
        }
      } else if (userId && client?.auth) {
        try {
          const { data } = await client.auth.getUser();
          user = data?.user || null;
        } catch {
        }
      }

      if (client && userId) {
        if (answers.gender) {
          try {
            await client
              .from('profiles')
              .update({ gender: answers.gender })
              .eq('id', userId);
          } catch {
          }
        }

        const { archetypeToDutch } = await import('@/config/archetypeMapping');
        const dutchArchetype = archetypeToDutch(archetype);

        const updatedResult = {
          color: colorProfile,
          archetype: dutchArchetype
        };

        syncSuccess = await saveToSupabase(client, user, sessionId, updatedResult);

        if (syncSuccess && answers.visualPreferencesCompleted && answers.calibrationCompleted) {
          try {
            const embedding = await VisualPreferenceService.computeVisualEmbedding(userId, sessionId);

            if (embedding && Object.keys(embedding).length > 0) {
              await client
                .from('style_profiles')
                .update({
                  visual_preference_embedding: embedding,
                  visual_preference_completed_at: new Date().toISOString()
                })
                .eq(userId ? 'user_id' : 'session_id', userId || sessionId);
            }

            await EmbeddingService.lockEmbedding(userId, sessionId);
          } catch {
          }
        }
      }

      localStorage.setItem('ff_sync_status', syncSuccess ? 'synced' : 'pending');

      setRevealData({
        archetype: archetype || 'Balanced Minimalist',
        archetypeDescription: 'Jouw stijl combineert eenvoud met elegantie. Je waardeert kwaliteit boven kwantiteit.',
        colorProfile: colorProfile
      });

      setPhase('reveal');
      setIsSubmitting(false);
    } catch {
      const fallbackResult = computeResult(answers as any);

      localStorage.setItem(LS_KEYS.QUIZ_ANSWERS, JSON.stringify(answers));
      localStorage.setItem(LS_KEYS.COLOR_PROFILE, JSON.stringify(fallbackResult.color));
      localStorage.setItem(LS_KEYS.ARCHETYPE, JSON.stringify(fallbackResult.archetype));
      localStorage.setItem(LS_KEYS.RESULTS_TS, Date.now().toString());
      localStorage.setItem(LS_KEYS.QUIZ_COMPLETED, "1");
      localStorage.setItem('ff_sync_status', 'pending');

      setRevealData({
        archetype: fallbackResult.archetype || 'Balanced Minimalist',
        archetypeDescription: 'Jouw stijl combineert eenvoud met elegantie. Je waardeert kwaliteit boven kwantiteit.',
        colorProfile: fallbackResult.color
      });

      toast.error('Er ging iets mis bij het opslaan, maar je resultaten zijn lokaal bewaard.');

      setPhase('reveal');
      setIsSubmitting(false);
    }
  };

  if (phase === 'reveal' && revealData) {
    return (
      <ResultsRevealSequence
        archetype={revealData.archetype}
        archetypeDescription={revealData.archetypeDescription}
        colorProfile={revealData.colorProfile}
        onComplete={() => navigate('/results')}
      />
    );
  }

  if (phase === 'swipes') {
    return (
      <>
        <motion.main
          key="swipes-phase"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]"
        >
          <Helmet>
            <title>Jouw Visuele Voorkeuren – FitFi</title>
            <meta name="description" content="Swipe door outfits om je stijl te verfijnen" />
          </Helmet>

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--color-border)] backdrop-blur-sm"
          >
            <div className="ff-container py-3 sm:py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium">Visuele Voorkeuren</span>
                <motion.span
                  key={progress}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs sm:text-sm text-[var(--color-muted)]"
                >
                  {Math.round(progress)}% compleet
                </motion.span>
              </div>
              <div className="h-2 sm:h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>

          <VisualPreferenceStep
            onComplete={handleSwipesComplete}
            userGender={answers.gender as 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'}
          />
        </motion.main>

        {/* Phase Transition for swipes */}
        {showTransition && transitionTo && (
          <PhaseTransition
            fromPhase={phase}
            toPhase={transitionTo}
            onContinue={handleTransitionComplete}
          />
        )}
      </>
    );
  }

  if (phase === 'calibration') {
    return (
      <>
        <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] relative">
          <Helmet>
            <title>Verfijn Je Profiel – FitFi</title>
            <meta name="description" content="Rate outfits om je aanbevelingen te perfectioneren" />
          </Helmet>

          {/* Loading Overlay */}
          {isSubmitting && (
            <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] p-8 max-w-md text-center shadow-[var(--shadow-elevated)]">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center animate-pulse">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Je Style DNA wordt gegenereerd...</h3>
                <p className="text-sm text-[var(--color-text)]/70">Dit duurt nog een paar seconden</p>
              </div>
            </div>
          )}

          <div className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
            <div className="ff-container py-3 sm:py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium">Outfit Calibratie</span>
                <span className="text-xs sm:text-sm text-[var(--color-muted)] tabular-nums">{Math.round(progress)}% compleet</span>
              </div>
              <div className="h-2 sm:h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <CalibrationStep
            sessionId={sessionId}
            onComplete={handleCalibrationComplete}
            onBack={handleBack}
          />
        </main>

        {/* Phase Transition for calibration */}
        {showTransition && transitionTo && (
          <PhaseTransition
            fromPhase={phase}
            toPhase={transitionTo}
            onContinue={handleTransitionComplete}
          />
        )}
      </>
    );
  }

  // Null check: if step is not available, show loading
  if (!step && phase === 'questions') {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-[var(--color-text)]">Quiz wordt geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <Helmet>
          <title>Start je Style Report – FitFi</title>
          <meta name="description" content="Beantwoord enkele vragen en zie welke stijl bij je past." />
        </Helmet>

      {/* Progress Bar */}
      <div className="sticky top-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-sm border-b border-[var(--color-border)] shadow-sm">
        <div className="ff-container py-2.5 sm:py-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-[var(--color-text)] flex-shrink-0">
                {currentStep + 1} / {quizSteps.length}
              </span>
              {step && (
                <span className="text-xs text-[var(--color-muted)] truncate hidden sm:block">
                  — {step.title.length > 40 ? step.title.substring(0, 40) + '…' : step.title}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleSaveAndContinueLater}
                className="hidden sm:flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors px-2 py-1 rounded hover:bg-[var(--color-bg)]"
                title="Opslaan en later verdergaan"
              >
                <Clock className="w-3.5 h-3.5" />
                Opslaan & later verder
              </button>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-[var(--color-bg)] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)]"
                aria-label="Stop de quiz"
                title="Stoppen"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-muted)] hover:text-[var(--color-text)]" />
              </button>
            </div>
          </div>
          <div className="relative h-1.5 bg-[var(--color-bg)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content - Simplified, Centered Layout */}
      <div className="ff-container py-6 sm:py-8 md:py-10 lg:py-12 pb-32">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-6">{/* Main Question Content */}
            <div className="flex-1">

          {/* Email Capture Prompt - DISABLED during quiz for focus
          {showEmailCapture && currentStep === 3 && (
            <EmailCapturePrompt
              onDismiss={() => setShowEmailCapture(false)}
              onEmailSaved={(email) => {
                setEmailCaptured(true);
                setShowEmailCapture(false);
              }}
            />
          )}
          */}

          {/* Real-time Archetype Preview - Shows from step 3 onwards */}
          <ArchetypePreview
            answers={answers}
            currentStep={currentStep}
            totalSteps={quizSteps.length}
          />

          {/* Question Header - Responsive typography */}
          <AnimatedQuestionTransition
            questionKey={currentStep}
            direction="forward"
          >
            <div className="text-center mb-6 sm:mb-8 lg:mb-10">
              {/* Time estimate only on first question */}
              {currentStep === 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ff-color-accent-50)] rounded-full text-xs font-medium text-[var(--ff-color-accent-700)] mb-4">
                  <Clock className="w-3 h-3" />
                  Minder dan 2 minuten
                </div>
              )}

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-4 lg:px-0 leading-tight">
                {step.title}
                {step.required && <span className="text-[var(--ff-color-accent-600)] ml-2">*</span>}
              </h1>

              {/* Inline Error Message */}
              {attemptedNext && getValidationError() && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 px-4 py-3 mx-4 lg:mx-0 bg-[var(--ff-color-danger-50)] border border-[var(--ff-color-danger-200)] rounded-lg text-[var(--ff-color-danger-700)] text-sm font-medium"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span>{getValidationError()}</span>
                </motion.div>
              )}

              {step.description && (
                <p className="text-sm sm:text-base lg:text-lg text-[var(--color-muted)] max-w-2xl lg:max-w-3xl mx-auto lg:mx-0 px-4 lg:px-0 leading-relaxed">
                  {step.description}
                </p>
              )}

              {/* Multi-select hint for stylePreferences */}
              {step.field === 'stylePreferences' && step.type === 'checkbox' && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs sm:text-sm text-[var(--ff-color-primary-600)]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Tip: Kies 2-3 stijlen die het beste bij je passen</span>
                </div>
              )}
            </div>
          </AnimatedQuestionTransition>

          {/* Answer Options - 52px+ touch targets */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {/* Checkbox (Multiple Select) - Mobile-first touch targets */}
            {(step.type === 'checkbox' || step.type === 'multiselect') && step.options && (
              <>
                {/* Selection counter for stylePreferences */}
                {step.field === 'stylePreferences' && (
                  <div className="text-center mb-2 sm:mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--ff-color-primary-50)] rounded-full text-xs font-medium text-[var(--ff-color-primary-700)]">
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--ff-color-primary-600)] text-white text-xs font-bold">
                        {(answers[step.field as keyof QuizAnswers] as string[] || []).length}
                      </span>
                      {(answers[step.field as keyof QuizAnswers] as string[] || []).length === 0
                        ? 'Geen stijlen'
                        : (answers[step.field as keyof QuizAnswers] as string[] || []).length === 1
                          ? '1 stijl'
                          : `${(answers[step.field as keyof QuizAnswers] as string[] || []).length} stijlen`
                      }
                    </span>
                  </div>
                )}

                <div className="grid gap-3 sm:gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {step.options.map((option) => {
                  const isSelected = (answers[step.field as keyof QuizAnswers] as string[] || []).includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleMultiSelect(step.field, option.value)}
                      className={`text-left p-3 sm:p-4 min-h-[52px] rounded-xl sm:rounded-[var(--radius-xl)] border-2 transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'border-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-50)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--ff-color-primary-300)]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected
                            ? 'border-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-600)]'
                            : 'border-[var(--color-border)]'
                        }`}>
                          {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm sm:text-base mb-0.5">{option.label}</div>
                          {option.description && (
                            <div className="text-xs sm:text-sm text-[var(--color-muted)]">{option.description}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
                </div>
              </>
            )}

            {/* Radio (Single Select) - Mobile-first touch targets */}
            {(step.type === 'radio' || step.type === 'select') && step.options && (
              <div className="grid gap-3 sm:gap-3 md:grid-cols-2 lg:grid-cols-2">
                {step.options.map((option) => {
                  const isSelected = answers[step.field as keyof QuizAnswers] === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(step.field, option.value)}
                      className={`w-full text-left p-3 sm:p-4 min-h-[52px] rounded-xl sm:rounded-[var(--radius-xl)] border-2 transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'border-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-50)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--ff-color-primary-300)]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected
                            ? 'border-[var(--ff-color-primary-600)]'
                            : 'border-[var(--color-border)]'
                        }`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[var(--ff-color-primary-600)]" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm sm:text-base mb-0.5">{option.label}</div>
                          {option.description && (
                            <div className="text-xs sm:text-sm text-[var(--color-muted)]">{option.description}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Slider */}
            {step.type === 'slider' && (
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-4 sm:p-5">
                <div className="text-center mb-4 sm:mb-5">
                  <div className="text-4xl sm:text-5xl font-bold text-[var(--ff-color-primary-600)] mb-1.5">
                    €{answers[step.field as keyof QuizAnswers] || step.min || 50}
                  </div>
                  <div className="text-sm font-medium text-[var(--color-text)] mb-0.5">
                    {(answers[step.field as keyof QuizAnswers] as number || step.min || 50) < 75
                      ? 'Budget'
                      : (answers[step.field as keyof QuizAnswers] as number || step.min || 50) < 150
                      ? 'Middensegment'
                      : 'Premium'}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--color-muted)] mb-3">Per kledingstuk</div>

                  {/* Plus/Minus Controls for Mobile-Friendly Adjustment */}
                  <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        const currentVal = (answers[step.field as keyof QuizAnswers] as number) || step.min || 50;
                        const newVal = Math.max((step.min || 0), currentVal - (step.step || 5));
                        handleAnswer(step.field, newVal);
                      }}
                      className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-[var(--color-surface)] border-2 border-[var(--ff-color-primary-300)] text-[var(--ff-color-primary-700)] font-bold text-xl flex items-center justify-center hover:bg-[var(--ff-color-primary-50)] active:scale-95 transition-all shadow-sm"
                      aria-label="Verlaag budget"
                    >
                      −
                    </button>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none">€</span>
                      <input
                        id="budget-input"
                        type="number"
                        min={step.min || 0}
                        max={step.max || 100}
                        step={step.step || 1}
                        value={answers[step.field as keyof QuizAnswers] as number || step.min || 50}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= (step.min || 0) && val <= (step.max || 100)) {
                            handleAnswer(step.field, val);
                          }
                        }}
                        className="w-24 sm:w-28 pl-7 pr-3 py-2.5 sm:py-2 rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-center font-bold text-lg sm:text-base focus:border-[var(--ff-color-primary-600)] focus:outline-none transition-colors"
                        aria-label="Budget invoeren"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const currentVal = (answers[step.field as keyof QuizAnswers] as number) || step.min || 50;
                        const newVal = Math.min((step.max || 100), currentVal + (step.step || 5));
                        handleAnswer(step.field, newVal);
                      }}
                      className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-[var(--ff-color-primary-600)] border-2 border-[var(--ff-color-primary-600)] text-white font-bold text-xl flex items-center justify-center hover:bg-[var(--ff-color-primary-700)] active:scale-95 transition-all shadow-md"
                      aria-label="Verhoog budget"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={step.min || 0}
                  max={step.max || 100}
                  step={step.step || 1}
                  value={answers[step.field as keyof QuizAnswers] as number || step.min || 50}
                  onChange={(e) => handleAnswer(step.field, parseInt(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer bg-[var(--color-bg)]"
                  style={{
                    background: `linear-gradient(to right, var(--ff-color-primary-600) 0%, var(--ff-color-primary-600) ${((((answers[step.field as keyof QuizAnswers] as number || step.min || 50) - (step.min || 0)) / ((step.max || 100) - (step.min || 0))) * 100)}%, var(--color-bg) ${((((answers[step.field as keyof QuizAnswers] as number || step.min || 50) - (step.min || 0)) / ((step.max || 100) - (step.min || 0))) * 100)}%, var(--color-bg) 100%)`
                  }}
                />
                <div className="flex justify-between mt-4 text-xs text-[var(--color-muted)]">
                  <div className="text-left">
                    <div className="font-medium text-[var(--color-text)]">€{step.min || 0}</div>
                    <div>Budget</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-[var(--color-text)]">€75-150</div>
                    <div>Middensegment</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[var(--color-text)]">€{step.max || 100}+</div>
                    <div>Premium</div>
                  </div>
                </div>
              </div>
            )}

            {/* Sizes */}
            {step.type === 'sizes' && (
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 space-y-6">
                {getSizeFieldsForGender(answers.gender).map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium mb-3">{field.label}</label>
                    <select
                      className="w-full px-4 py-3 rounded-[var(--radius-lg)] border-2 border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--ff-color-primary-600)] focus:outline-none transition-colors"
                      value={((answers.sizes as any) || {})[field.name] || ""}
                      onChange={(e) => {
                        const currentSizes = (answers.sizes as any) || {};
                        handleAnswer('sizes', { ...currentSizes, [field.name]: e.target.value });
                      }}
                    >
                      <option value="">Weet ik niet / Sla over</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    {(field as any).helperText && (
                      <p className="mt-2 text-xs text-[var(--color-muted)] italic">{(field as any).helperText}</p>
                    )}
                  </div>
                ))}
                {step.helperText ? (
                  <p className="text-sm text-[var(--color-muted)] italic">
                    {step.helperText}
                  </p>
                ) : (
                  <p className="text-sm text-[var(--color-muted)] italic">
                    Je kunt deze stap overslaan als je wilt.
                  </p>
                )}
              </div>
            )}

            {/* Photo Upload */}
            {step.type === 'photo' && (
              <PhotoUpload
                value={answers.photoUrl as string}
                onChange={(url) => handleAnswer('photoUrl', url)}
                onAnalysisComplete={(analysis) => {
                  handleAnswer('colorAnalysis', analysis);
                }}
              />
            )}
          </div>

          {/* Help Text - Required field indicator */}
          {step.required && !attemptedNext && (
            <p className="text-center text-xs text-[var(--color-muted)] mt-4">
              * Verplicht veld
            </p>
          )}
            </div>
            {/* End Main Question Content */}

          </div>
          {/* End Flex Container */}
        </div>
        {/* End Max Width Container */}
      </div>
      {/* End FF Container */}

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)] border-t border-[var(--color-border)] shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="w-full px-4 pt-3 pb-4 max-w-3xl mx-auto">

          {/* Primary row: Vorige + (Sla over) + Volgende */}
          <div className="flex items-center gap-2">
            {/* Vorige — fixed width, icon only on mobile */}
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="inline-flex items-center justify-center gap-2 min-w-[52px] w-[52px] sm:w-auto sm:px-5 py-3.5 min-h-[52px] bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl font-semibold text-sm hover:bg-[var(--ff-color-primary-50)] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
              aria-label="Ga terug naar vorige vraag"
            >
              <ArrowLeft className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Vorige</span>
            </button>

            {/* Sla over — only for optional steps, shrinks to fit */}
            {step && !step.required && (
              <button
                onClick={handleSkip}
                className="inline-flex items-center justify-center px-4 py-3.5 min-h-[52px] bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-[var(--color-muted)] rounded-xl font-medium text-sm hover:bg-[var(--ff-color-primary-50)] hover:text-[var(--color-text)] active:scale-[0.98] transition-all flex-shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
                aria-label="Sla deze stap over"
              >
                Sla over
              </button>
            )}

            {/* Volgende — takes remaining space */}
            <button
              onClick={handleNext}
              disabled={(!canProceed() && step?.required) || isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[52px] bg-[var(--ff-color-primary-700)] text-white rounded-xl font-bold text-base hover:bg-[var(--ff-color-primary-600)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
              aria-label={isSubmitting ? "Quiz wordt verwerkt" : (currentStep === quizSteps.length - 1 ? "Bekijk mijn antwoorden" : "Ga naar volgende vraag")}
            >
              {isSubmitting ? (
                <span>Verwerken...</span>
              ) : currentStep === quizSteps.length - 1 ? (
                <>
                  <span className="truncate">Bekijk mijn antwoorden</span>
                  <ArrowRight className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                </>
              ) : (
                <>
                  <span>Volgende</span>
                  <ArrowRight className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                </>
              )}
            </button>
          </div>

          {/* Save and continue later — mobile only */}
          <div className="flex justify-center mt-2.5 sm:hidden">
            <button
              onClick={handleSaveAndContinueLater}
              className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors px-3 py-1.5 min-h-[36px] rounded-lg"
            >
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Opslaan en later verder</span>
            </button>
          </div>

        </div>
      </div>

    </main>

      {/* Review Modal — samenvatting van keuzes voor submit */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-labelledby="review-modal-title"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 id="review-modal-title" className="text-xl font-bold text-[var(--color-text)]">
                  Laatste stap: check je keuzes.
                </h3>
                <p className="text-sm text-[var(--color-muted)] mt-0.5">
                  Je kunt altijd terug en aanpassen.
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-[var(--ff-color-primary-50)] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)]"
                aria-label="Sluit overzicht"
              >
                <X className="w-5 h-5 text-[var(--color-muted)]" />
              </button>
            </div>

            <ul className="space-y-2.5 mb-6">
              {quizSteps.map((s, idx) => {
                const val = answers[s.field as keyof QuizAnswers];
                const hasValue = val !== undefined && val !== null && val !== '' &&
                  (Array.isArray(val) ? val.length > 0 : true);
                let displayVal = '—';
                if (hasValue) {
                  if (Array.isArray(val)) {
                    displayVal = (val as string[]).join(', ');
                  } else if (typeof val === 'number') {
                    displayVal = s.field === 'budgetRange' ? `€${val}` : String(val);
                  } else if (typeof val === 'object') {
                    displayVal = 'Ingevuld';
                  } else {
                    displayVal = String(val);
                  }
                }
                return (
                  <li key={s.id} className="flex items-start gap-3">
                    <button
                      onClick={() => { setShowReviewModal(false); setCurrentStep(idx); }}
                      className="text-left flex-1 flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--ff-color-primary-50)] transition-colors group"
                      aria-label={`Ga naar vraag ${idx + 1}: ${s.title}`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                        hasValue
                          ? 'bg-[var(--ff-color-primary-600)] text-white'
                          : s.required
                          ? 'bg-[var(--ff-color-danger-100)] text-[var(--ff-color-danger-600)]'
                          : 'bg-[var(--ff-color-neutral-200)] text-[var(--color-muted)]'
                      }`}>
                        {hasValue ? <CheckCircle className="w-3 h-3" /> : idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text)] leading-tight">{s.title}</p>
                        <p className={`text-xs mt-0.5 truncate ${hasValue ? 'text-[var(--color-muted)]' : s.required ? 'text-[var(--ff-color-danger-600)]' : 'text-[var(--color-muted)]'}`}>
                          {hasValue ? displayVal : s.required ? 'Nog niet ingevuld — klik om aan te passen' : 'Overgeslagen'}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--color-border)] group-hover:text-[var(--ff-color-primary-500)] transition-colors flex-shrink-0 mt-1" />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmProceed}
                disabled={quizSteps.some(s => s.required && !answers[s.field as keyof QuizAnswers])}
                className="w-full px-6 py-3.5 min-h-[52px] bg-[var(--ff-color-primary-700)] text-white rounded-xl font-bold hover:bg-[var(--ff-color-primary-600)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
              >
                <span>Maak mijn rapport</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => { setShowReviewModal(false); }}
                className="w-full px-6 py-3 min-h-[48px] border-2 border-[var(--color-border)] rounded-xl font-semibold text-[var(--color-text)] hover:bg-[var(--ff-color-primary-50)] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)]"
              >
                Terug naar vragen
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
            role="dialog"
            aria-labelledby="cancel-modal-title"
            aria-describedby="cancel-modal-desc"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--ff-color-danger-100)] flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-[var(--ff-color-danger-600)]" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="cancel-modal-title" className="text-xl font-bold text-[var(--color-text)]">Quiz annuleren?</h3>
                  <p className="text-sm text-[var(--color-muted)]">Je voortgang gaat verloren</p>
                </div>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 hover:bg-[var(--ff-color-primary-50)] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)]"
                aria-label="Sluit modal"
              >
                <X className="w-5 h-5 text-[var(--color-muted)]" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <p id="cancel-modal-desc" className="text-[var(--color-text)]">
                Wil je je voortgang bewaren en later verdergaan, of wil je alles wissen?
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSaveAndContinueLater}
                className="w-full px-6 py-3.5 min-h-[52px] bg-[var(--ff-color-primary-700)] text-white rounded-xl font-bold hover:bg-[var(--ff-color-primary-600)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
              >
                <span>Opslaan en later verder</span>
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full px-6 py-3 border-2 border-[var(--color-border)] rounded-xl font-semibold text-[var(--color-text)] hover:bg-[var(--ff-color-primary-50)] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)]"
              >
                Doorgaan met quiz
              </button>
              <button
                onClick={confirmCancel}
                className="w-full px-6 py-3 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors underline underline-offset-2"
              >
                Alles wissen en stoppen
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Phase Transition for questions phase */}
      {showTransition && transitionTo && (
        <PhaseTransition
          fromPhase={phase}
          toPhase={transitionTo}
          onContinue={handleTransitionComplete}
        />
      )}
    </>
  );
}
