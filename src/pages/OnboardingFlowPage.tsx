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
    if (phase === 'questions') return Math.round(((currentStep + 1) / quizSteps.length) * 100);
    if (phase === 'swipes') return 100;
    if (phase === 'calibration') return 100;
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
      {/* Fullscreen quiz shell — geen Navbar, geen Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', minHeight: '-webkit-fill-available', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', overflow: 'hidden' }}>
        <Helmet>
          <title>Start je Style Report – FitFi</title>
          <meta name="description" content="Beantwoord enkele vragen en zie welke stijl bij je past." />
        </Helmet>

        {/* ── HEADER BAR ── */}
        <div style={{ flexShrink: 0, backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', padding: '10px 16px 0', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                Stap {currentStep + 1} van {quizSteps.length}
              </span>
              <button
                onClick={handleCancel}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}
                aria-label="Stop de quiz"
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <div style={{ height: '3px', backgroundColor: 'var(--color-bg)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--ff-color-primary-600), var(--ff-color-accent-600))',
                  borderRadius: '99px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px 32px', boxSizing: 'border-box' }}>

            <ArchetypePreview
              answers={answers}
              currentStep={currentStep}
              totalSteps={quizSteps.length}
            />

            <AnimatedQuestionTransition questionKey={currentStep} direction="forward">
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                {currentStep === 0 && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: 'var(--ff-color-accent-50)', borderRadius: '99px', fontSize: '12px', fontWeight: 500, color: 'var(--ff-color-accent-700)', marginBottom: '16px' }}>
                    <Clock style={{ width: '12px', height: '12px' }} />
                    Minder dan 2 minuten
                  </div>
                )}
                <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 700, lineHeight: 1.25, marginBottom: '10px', color: 'var(--color-text)' }}>
                  {step.title}
                </h1>
                {step.description && (
                  <p style={{ fontSize: '15px', color: 'var(--color-muted)', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto' }}>
                    {step.description}
                  </p>
                )}
                {step.field === 'stylePreferences' && (
                  <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--ff-color-primary-600)', fontWeight: 500 }}>
                    <CheckCircle style={{ width: '14px', height: '14px' }} />
                    Kies 2–3 stijlen
                  </div>
                )}
              </div>
            </AnimatedQuestionTransition>

            {/* ── ANTWOORD OPTIES ── */}

            {/* Checkbox / multiselect */}
            {(step.type === 'checkbox' || step.type === 'multiselect') && step.options && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                {step.options.map((option) => {
                  const isSelected = (answers[step.field as keyof QuizAnswers] as string[] || []).includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleMultiSelect(step.field, option.value)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '12px',
                        padding: '14px 16px', minHeight: '64px',
                        borderRadius: '14px',
                        border: `2px solid ${isSelected ? 'var(--ff-color-primary-600)' : 'var(--color-border)'}`,
                        backgroundColor: isSelected ? 'var(--ff-color-primary-50)' : 'var(--color-surface)',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'border-color 0.15s, background-color 0.15s',
                      }}
                    >
                      <div style={{
                        width: '20px', height: '20px', flexShrink: 0, marginTop: '1px',
                        borderRadius: '6px',
                        border: `2px solid ${isSelected ? 'var(--ff-color-primary-600)' : 'var(--color-border)'}`,
                        backgroundColor: isSelected ? 'var(--ff-color-primary-600)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}>
                        {isSelected && <CheckCircle style={{ width: '13px', height: '13px', color: 'white' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text)', lineHeight: 1.3 }}>{option.label}</div>
                        {option.description && (
                          <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '3px', lineHeight: 1.5 }}>{option.description}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Radio / select */}
            {(step.type === 'radio' || step.type === 'select') && step.options && (
              <div style={{ display: 'grid', gridTemplateColumns: step.options.length > 3 ? 'repeat(auto-fill, minmax(240px, 1fr))' : '1fr', gap: '10px' }}>
                {step.options.map((option) => {
                  const isSelected = answers[step.field as keyof QuizAnswers] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleAnswer(step.field, option.value)}
                      aria-pressed={isSelected}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '14px 16px', minHeight: '64px',
                        borderRadius: '14px',
                        border: `2px solid ${isSelected ? 'var(--ff-color-primary-600)' : 'var(--color-border)'}`,
                        backgroundColor: isSelected ? 'var(--ff-color-primary-50)' : 'var(--color-surface)',
                        cursor: 'pointer', textAlign: 'left', width: '100%',
                        transition: 'border-color 0.15s, background-color 0.15s',
                      }}
                    >
                      <div style={{
                        width: '20px', height: '20px', flexShrink: 0,
                        borderRadius: '50%',
                        border: `2px solid ${isSelected ? 'var(--ff-color-primary-600)' : 'var(--color-border)'}`,
                        backgroundColor: isSelected ? 'var(--ff-color-primary-600)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}>
                        {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text)', lineHeight: 1.3 }}>{option.label}</div>
                        {option.description && (
                          <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '3px', lineHeight: 1.5 }}>{option.description}</div>
                        )}
                      </div>
                      {isSelected && (
                        <svg style={{ width: '18px', height: '18px', flexShrink: 0, color: 'var(--ff-color-primary-600)' }} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Slider / budget */}
            {step.type === 'slider' && (
              <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--ff-color-primary-600)', lineHeight: 1 }}>
                    €{answers[step.field as keyof QuizAnswers] || step.min || 50}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)', marginTop: '6px' }}>
                    {(answers[step.field as keyof QuizAnswers] as number || step.min || 50) < 75 ? 'Budget' : (answers[step.field as keyof QuizAnswers] as number || step.min || 50) < 150 ? 'Middensegment' : 'Premium'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>Per kledingstuk</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => { const v = (answers[step.field as keyof QuizAnswers] as number) || step.min || 50; handleAnswer(step.field, Math.max(step.min || 0, v - (step.step || 5))); }}
                      style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid var(--ff-color-primary-300)', backgroundColor: 'var(--color-surface)', color: 'var(--ff-color-primary-700)', fontSize: '20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      aria-label="Verlaag budget"
                    >−</button>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }}>€</span>
                      <input
                        type="number"
                        min={step.min || 0}
                        max={step.max || 100}
                        step={step.step || 1}
                        value={answers[step.field as keyof QuizAnswers] as number || step.min || 50}
                        onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= (step.min || 0) && v <= (step.max || 100)) handleAnswer(step.field, v); }}
                        style={{ width: '96px', paddingLeft: '24px', paddingRight: '8px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '12px', border: '2px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', textAlign: 'center', fontWeight: 700, fontSize: '16px' }}
                        aria-label="Budget invoeren"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => { const v = (answers[step.field as keyof QuizAnswers] as number) || step.min || 50; handleAnswer(step.field, Math.min(step.max || 100, v + (step.step || 5))); }}
                      style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid var(--ff-color-primary-600)', backgroundColor: 'var(--ff-color-primary-600)', color: 'white', fontSize: '20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      aria-label="Verhoog budget"
                    >+</button>
                  </div>
                </div>
                <input
                  type="range"
                  min={step.min || 0}
                  max={step.max || 100}
                  step={step.step || 1}
                  value={answers[step.field as keyof QuizAnswers] as number || step.min || 50}
                  onChange={(e) => handleAnswer(step.field, parseInt(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--ff-color-primary-600)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--color-muted)' }}>
                  <span>€{step.min || 0} Budget</span>
                  <span>€75–150 Midden</span>
                  <span>€{step.max || 100}+ Premium</span>
                </div>
              </div>
            )}

            {/* Sizes */}
            {step.type === 'sizes' && (
              <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {getSizeFieldsForGender(answers.gender).map((field) => (
                  <div key={field.name}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}>{field.label}</label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={((answers.sizes as any) || {})[field.name] || ""}
                        onChange={(e) => { const s = (answers.sizes as any) || {}; handleAnswer('sizes', { ...s, [field.name]: e.target.value }); }}
                        style={{ width: '100%', padding: '12px 40px 12px 14px', minHeight: '52px', borderRadius: '12px', border: '2px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '15px', appearance: 'none', cursor: 'pointer' }}
                      >
                        <option value="">Weet ik niet / Sla over</option>
                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-muted)' }}>
                        <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                      </div>
                    </div>
                  </div>
                ))}
                <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{step.helperText ?? 'Je kunt deze stap overslaan als je wilt.'}</p>
              </div>
            )}

            {/* Photo Upload */}
            {step.type === 'photo' && (
              <PhotoUpload
                value={answers.photoUrl as string}
                onChange={(url) => handleAnswer('photoUrl', url)}
                onAnalysisComplete={(analysis) => handleAnswer('colorAnalysis', analysis)}
              />
            )}

          </div>
        </div>

        {/* ── BOTTOM BAR ── altijd volledig zichtbaar */}
        <div style={{
          flexShrink: 0,
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.07)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '10px 16px 12px', boxSizing: 'border-box' }}>

            {step?.required && !canProceed() && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px', fontSize: '12px', color: 'var(--color-muted)' }}>
                <AlertCircle style={{ width: '13px', height: '13px', flexShrink: 0 }} aria-hidden="true" />
                <span>{attemptedNext ? getValidationError() : 'Selecteer een optie om door te gaan'}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '48px', height: '48px', flexShrink: 0,
                  borderRadius: '12px',
                  border: '2px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentStep === 0 ? 0.25 : 1,
                  transition: 'opacity 0.15s',
                }}
                aria-label="Vorige vraag"
              >
                <ArrowLeft style={{ width: '18px', height: '18px' }} />
              </button>

              {step && !step.required && (
                <button
                  onClick={handleSkip}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 16px', height: '48px', flexShrink: 0,
                    borderRadius: '12px',
                    border: '2px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-muted)',
                    fontSize: '14px', fontWeight: 500,
                    whiteSpace: 'nowrap', cursor: 'pointer',
                  }}
                >
                  Overslaan
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={isSubmitting}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  flex: 1, height: '48px', minWidth: 0,
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: canProceed() || !step?.required ? 'var(--ff-color-primary-700)' : 'var(--ff-color-primary-300)',
                  color: 'white',
                  fontSize: '15px', fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  boxShadow: canProceed() || !step?.required ? '0 2px 10px rgba(0,0,0,0.18)' : 'none',
                }}
                aria-label={currentStep === quizSteps.length - 1 ? 'Bekijk antwoorden' : 'Volgende'}
              >
                <span style={{ whiteSpace: 'nowrap' }}>
                  {isSubmitting ? 'Verwerken...' : currentStep === quizSteps.length - 1 ? 'Bekijk antwoorden' : 'Volgende'}
                </span>
                {!isSubmitting && <ArrowRight style={{ width: '17px', height: '17px', flexShrink: 0 }} />}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button
                onClick={handleSaveAndContinueLater}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
              >
                <Clock style={{ width: '11px', height: '11px' }} />
                Opslaan en later verder
              </button>
            </div>

          </div>
        </div>

      </div>
      {/* Einde quiz shell */}



      {/* Review Modal — samenvatting van keuzes voor submit */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="bg-[var(--color-surface)] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-5 sm:p-8 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto"
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

            <ul className="space-y-1.5 mb-6" role="list">
              {quizSteps.map((s, idx) => {
                const val = answers[s.field as keyof QuizAnswers];
                const hasValue = val !== undefined && val !== null && val !== '' &&
                  (Array.isArray(val) ? val.length > 0 : true);
                let displayVal = '—';
                if (hasValue) {
                  if (Array.isArray(val)) {
                    const joined = (val as string[]).join(', ');
                    displayVal = joined.length > 60 ? joined.slice(0, 57) + '…' : joined;
                  } else if (typeof val === 'number') {
                    displayVal = s.field === 'budgetRange' ? `€${val} per kledingstuk` : String(val);
                  } else if (typeof val === 'object') {
                    const entries = Object.entries(val as Record<string, string>).filter(([, v]) => v);
                    displayVal = entries.length > 0 ? entries.map(([, v]) => v).join(' · ') : 'Ingevuld';
                  } else {
                    displayVal = String(val);
                  }
                }
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => { setShowReviewModal(false); setCurrentStep(idx); }}
                      className="text-left w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--ff-color-primary-50)] transition-colors group"
                      aria-label={`Ga naar vraag ${idx + 1}: ${s.title}`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        hasValue
                          ? 'bg-[var(--ff-color-primary-600)] text-white'
                          : s.required
                          ? 'bg-[var(--ff-color-danger-100)] text-[var(--ff-color-danger-600)]'
                          : 'bg-[var(--ff-color-neutral-200)] text-[var(--color-muted)]'
                      }`}>
                        {hasValue ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text)] leading-tight truncate">{s.title}</p>
                        <p className={`text-xs mt-0.5 truncate ${
                          hasValue
                            ? 'text-[var(--color-muted)]'
                            : s.required
                            ? 'text-[var(--ff-color-danger-600)] font-medium'
                            : 'text-[var(--color-muted)]'
                        }`}>
                          {hasValue ? displayVal : s.required ? 'Vereist — klik om in te vullen' : 'Overgeslagen'}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--color-border)] group-hover:text-[var(--ff-color-primary-500)] transition-colors flex-shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>

            {quizSteps.some(s => s.required && !answers[s.field as keyof QuizAnswers]) && (
              <p className="flex items-center gap-2 text-xs font-medium text-[var(--ff-color-danger-600)] mb-3 px-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Vul de gemarkeerde vragen in om door te gaan</span>
              </p>
            )}
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
