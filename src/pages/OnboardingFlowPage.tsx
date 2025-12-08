import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CircleCheck as CheckCircle, Sparkles } from "lucide-react";
import { quizSteps, getSizeFieldsForGender } from "@/data/quizSteps";
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
import { CircularProgressIndicator } from "@/components/quiz/CircularProgressIndicator";
import { AnimatedQuestionTransition } from "@/components/quiz/AnimatedQuestionTransition";
import { ResultsRevealSequence } from "@/components/results/ResultsRevealSequence";
import { NovaInlineReaction } from "@/components/quiz/NovaInlineReaction";
import { PhaseTransition } from "@/components/quiz/PhaseTransition";
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


  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam === 'visual') {
      setPhase('swipes');
      const existingAnswers = localStorage.getItem(LS_KEYS.QUIZ_ANSWERS);
      if (existingAnswers) {
        try {
          setAnswers(JSON.parse(existingAnswers));
        } catch (err) {
          console.error('Failed to load existing answers:', err);
        }
      }
    }
  }, [searchParams]);

  const totalSteps = quizSteps.length + 2;
  const step = quizSteps[currentStep];

  const getProgress = () => {
    if (phase === 'questions') return ((currentStep + 1) / totalSteps) * 100;
    if (phase === 'swipes') return ((quizSteps.length + 0.5) / totalSteps) * 100;
    if (phase === 'calibration') return ((quizSteps.length + 1.5) / totalSteps) * 100;
    return 100;
  };

  const progress = getProgress();

  const handleAnswer = (field: string, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));

    // Show Nova reaction for this answer
    setLastAnsweredField(field);
    setShowNovaReaction(true);

    // Auto-hide after 3.5 seconds
    setTimeout(() => {
      setShowNovaReaction(false);
    }, 3500);
  };

  const handleMultiSelect = (field: string, value: string) => {
    setAnswers(prev => {
      const current = (prev[field as keyof QuizAnswers] as string[]) || [];
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];

      return { ...prev, [field]: newValue };
    });
  };

  const canProceed = () => {
    const answer = answers[step.field as keyof QuizAnswers];
    if (!step.required) return true;
    if (step.type === 'checkbox' || step.type === 'multiselect') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer !== undefined && answer !== null && answer !== '';
  };

  const handleNext = () => {
    setShowNovaReaction(false); // Hide reaction when moving forward

    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(prev => prev + 1);

      if (currentStep === 2 && !emailCaptured && !showEmailCapture) {
        setShowEmailCapture(true);
      }
    } else if (phase === 'questions') {
      // Show transition to swipes
      setTransitionTo('swipes');
      setShowTransition(true);
    } else if (phase === 'swipes') {
      // Show transition to calibration
      setTransitionTo('calibration');
      setShowTransition(true);
    } else {
      handleSubmit();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
    if (transitionTo) {
      setPhase(transitionTo);
      setTransitionTo(null);
    }
  };

  const handleSwipesComplete = () => {
    console.log('[OnboardingFlow] ✅ handleSwipesComplete called!');
    setAnswers(prev => ({ ...prev, visualPreferencesCompleted: true }));
    // Show transition
    setTransitionTo('calibration');
    setShowTransition(true);
    console.log('[OnboardingFlow] 🎬 Transition started: swipes → calibration');
  };

  const handleCalibrationComplete = async () => {
    console.log('[OnboardingFlow] Calibration complete, starting submit...');
    setAnswers(prev => ({ ...prev, calibrationCompleted: true }));
    await handleSubmit();
  };

  const handleBack = () => {
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

      for (const answerData of answersToSave) {
        await client
          .from('quiz_answers')
          .upsert(answerData, {
            onConflict: 'user_id,question_id',
          });
      }

      console.log('✅ [OnboardingFlow] Individual quiz answers saved');
    } catch (error) {
      console.error('⚠️ [OnboardingFlow] Failed to save individual answers:', error);
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
      const { error } = await client
        .from('style_profiles')
        .insert({
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
        });

      if (error) {
        if (retryCount < 2) {
          console.warn(`⚠️ [OnboardingFlow] Save failed (attempt ${retryCount + 1}/3), retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return saveToSupabase(client, user, sessionId, result, retryCount + 1);
        }
        console.error('❌ [OnboardingFlow] Error saving to Supabase after 3 attempts:', error);
        return false;
      }

      if (user?.id) {
        await saveQuizAnswersIndividually(client, user.id);
      }

      console.log('✅ [OnboardingFlow] Quiz saved to Supabase successfully!');
      return true;
    } catch (error) {
      console.error('❌ [OnboardingFlow] Exception during save:', error);
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
        } catch (e) {
          console.warn('Could not get user for profile generation', e);
        }
      }

      // ✅ GENERATE COMPLETE STYLE PROFILE FROM QUIZ + SWIPES + PHOTO
      console.log('[OnboardingFlow] Generating style profile from quiz + swipes...');

      // Get uploaded photo from localStorage
      const photoUrl = localStorage.getItem('ff_onboarding_photo_url');
      const photoAnalysis = localStorage.getItem('ff_onboarding_photo_analysis');

      if (photoUrl) {
        console.log('[OnboardingFlow] Photo uploaded during onboarding:', photoUrl);
      }

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

        // Enhance color profile with photo analysis if available
        if (photoAnalysis) {
          try {
            const analysis = JSON.parse(photoAnalysis);
            colorProfile = {
              ...colorProfile,
              photoAnalysis: analysis,
              undertone: analysis.undertone || colorProfile.undertone,
              seasonalType: analysis.seasonal_type || colorProfile.seasonalType
            };
            console.log('[OnboardingFlow] Enhanced color profile with photo analysis');
          } catch (e) {
            console.warn('[OnboardingFlow] Failed to parse photo analysis:', e);
          }
        }

        console.log('[OnboardingFlow] ✅ Style profile generated:', {
          archetype: profileResult.archetype,
          secondaryArchetype: profileResult.secondaryArchetype,
          temperature: colorProfile.temperature,
          chroma: colorProfile.chroma,
          contrast: colorProfile.contrast,
          paletteName: colorProfile.paletteName,
          confidence: profileResult.confidence,
          dataSource: profileResult.dataSource
        });
      } catch (profileError) {
        console.error('[OnboardingFlow] Failed to generate style profile, using fallback:', profileError);
        // Fallback to old logic
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
        } catch (authError) {
          console.warn('⚠️ [OnboardingFlow] Could not get user, continuing with local save only:', authError);
        }
      } else if (userId && client?.auth) {
        try {
          const { data } = await client.auth.getUser();
          user = data?.user || null;
        } catch (authError) {
          console.warn('⚠️ [OnboardingFlow] Could not get user object:', authError);
        }
      } else if (!client) {
        console.warn('⚠️ [OnboardingFlow] Supabase client not available, using local storage only');
      }

      if (client && userId) {
        if (answers.gender) {
          try {
            await client
              .from('profiles')
              .update({ gender: answers.gender })
              .eq('id', userId);
            console.log('✅ [OnboardingFlow] Gender updated in profiles');
          } catch (genderError) {
            console.warn('⚠️ [OnboardingFlow] Could not update gender in profiles:', genderError);
          }
        }

        // Create result object with generated profile
        // Convert archetype to Dutch format for database
        const { archetypeToDutch } = await import('@/config/archetypeMapping');
        const dutchArchetype = archetypeToDutch(archetype);

        const updatedResult = {
          color: colorProfile,
          archetype: dutchArchetype
        };

        const savePromise = saveToSupabase(client, user, sessionId, updatedResult);

        toast.promise(
          savePromise,
          {
            loading: 'Je profiel wordt opgeslagen...',
            success: 'Profiel succesvol opgeslagen!',
            error: 'Let op: je resultaten zijn lokaal opgeslagen maar nog niet gesynchroniseerd. We proberen het later automatisch opnieuw.',
          }
        );

        syncSuccess = await savePromise;

        if (syncSuccess && answers.visualPreferencesCompleted && answers.calibrationCompleted) {
          try {
            // STEP 1: Compute visual embedding from swipe data
            console.log('[OnboardingFlow] Computing visual embedding from swipes...');
            const embedding = await VisualPreferenceService.computeVisualEmbedding(userId, sessionId);
            console.log('✅ [OnboardingFlow] Visual embedding computed:', embedding);

            // STEP 2: Save embedding to style_profiles
            if (embedding && Object.keys(embedding).length > 0) {
              const { error: updateError } = await client
                .from('style_profiles')
                .update({
                  visual_preference_embedding: embedding,
                  visual_preference_completed_at: new Date().toISOString()
                })
                .eq(userId ? 'user_id' : 'session_id', userId || sessionId);

              if (updateError) {
                console.error('⚠️ [OnboardingFlow] Failed to save embedding:', updateError);
              } else {
                console.log('✅ [OnboardingFlow] Embedding saved to style_profiles');
              }
            } else {
              console.warn('⚠️ [OnboardingFlow] Empty embedding computed, skipping save');
            }

            // STEP 3: Lock embedding for finalization
            await EmbeddingService.lockEmbedding(userId, sessionId);
            console.log('✅ [OnboardingFlow] Embedding locked successfully!');
          } catch (lockError) {
            console.error('⚠️ [OnboardingFlow] Failed to compute/save/lock embedding:', lockError);
          }
        }
      }

      localStorage.setItem('ff_sync_status', syncSuccess ? 'synced' : 'pending');

      setRevealData({
        archetype: archetype || 'Balanced Minimalist',
        archetypeDescription: 'Jouw stijl combineert eenvoud met elegantie. Je waardeert kwaliteit boven kwantiteit.',
        colorProfile: colorProfile
      });

      console.log('[OnboardingFlow] Setting phase to reveal...');
      setPhase('reveal');
      setIsSubmitting(false);
    } catch (error) {
      console.error('❌ [OnboardingFlow] Error in handleSubmit:', error);

      // Even on error, try to show results with fallback data
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

      console.log('[OnboardingFlow] Setting phase to reveal (fallback)...');
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
                className="text-xs sm:text-sm text-gray-600"
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
    );
  }

  if (phase === 'calibration') {
    return (
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
              <span className="text-xs sm:text-sm text-gray-600">{Math.round(progress)}% compleet</span>
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
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <Helmet>
          <title>Start je Style Report – FitFi</title>
          <meta name="description" content="Beantwoord enkele vragen en zie welke stijl bij je past." />
        </Helmet>

      {/* Progress Bar with Milestones - Responsive */}
      <div className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="ff-container py-3 sm:py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium">Stap {currentStep + 1} van {quizSteps.length}</span>
            <span className="text-xs sm:text-sm text-gray-600">{Math.round(progress)}% compleet</span>
          </div>

          {/* Clean progress bar */}
          <div className="relative h-2 sm:h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />

          </div>

        </div>
      </div>

      {/* Question Content - Responsive padding */}
      <div className="ff-container py-8 sm:py-12 md:py-20">
        <div className="max-w-3xl mx-auto">

          {/* Email Capture Prompt - Show at step 3 */}
          {showEmailCapture && currentStep === 3 && (
            <EmailCapturePrompt
              onDismiss={() => setShowEmailCapture(false)}
              onEmailSaved={(email) => {
                setEmailCaptured(true);
                setShowEmailCapture(false);
              }}
            />
          )}

          {/* Circular Progress Indicator - Premium */}
          <div className="flex justify-center mb-12">
            <CircularProgressIndicator
              currentStep={currentStep + 1}
              totalSteps={quizSteps.length}
              stepLabels={quizSteps.map(s => s.title.split(' ').slice(0, 2).join(' '))}
            />
          </div>

          {/* Question Header - Responsive typography */}
          <AnimatedQuestionTransition
            questionKey={currentStep}
            direction="forward"
          >
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[var(--ff-color-primary-50)] rounded-full text-xs sm:text-sm font-semibold text-[var(--ff-color-primary-600)] mb-4 sm:mb-6">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Vraag {currentStep + 1}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4">
                {step.title}
              </h1>
              {step.description && (
                <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                  {step.description}
                </p>
              )}
            </div>
          </AnimatedQuestionTransition>

          {/* Answer Options - 52px+ touch targets */}
          <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
            {/* Checkbox (Multiple Select) - Mobile-first touch targets */}
            {(step.type === 'checkbox' || step.type === 'multiselect') && step.options && (
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                {step.options.map((option) => {
                  const isSelected = (answers[step.field as keyof QuizAnswers] as string[] || []).includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleMultiSelect(step.field, option.value)}
                      className={`text-left p-4 sm:p-6 min-h-[52px] rounded-xl sm:rounded-[var(--radius-2xl)] border-2 transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'border-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-50)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--ff-color-primary-300)]'
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1 ${
                          isSelected
                            ? 'border-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-600)]'
                            : 'border-[var(--color-border)]'
                        }`}>
                          {isSelected && <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">{option.label}</div>
                          {option.description && (
                            <div className="text-xs sm:text-sm text-gray-600">{option.description}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Radio (Single Select) - Mobile-first touch targets */}
            {(step.type === 'radio' || step.type === 'select') && step.options && (
              <div className="space-y-2.5 sm:space-y-3">
                {step.options.map((option) => {
                  const isSelected = answers[step.field as keyof QuizAnswers] === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(step.field, option.value)}
                      className={`w-full text-left p-4 sm:p-6 min-h-[52px] rounded-xl sm:rounded-[var(--radius-2xl)] border-2 transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'border-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-50)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--ff-color-primary-300)]'
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1 ${
                          isSelected
                            ? 'border-[var(--ff-color-primary-600)]'
                            : 'border-[var(--color-border)]'
                        }`}>
                          {isSelected && <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[var(--ff-color-primary-600)]" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">{option.label}</div>
                          {option.description && (
                            <div className="text-xs sm:text-sm text-gray-600">{option.description}</div>
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
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8">
                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-[var(--ff-color-primary-600)] mb-2">
                    €{answers[step.field as keyof QuizAnswers] || step.min || 50}
                  </div>
                  <div className="text-sm text-gray-600">Per kledingstuk</div>
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
                <div className="flex justify-between mt-4 text-sm text-gray-600">
                  <span>€{step.min || 0}</span>
                  <span>€{step.max || 100}+</span>
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
                      <option value="">Selecteer maat</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
                <p className="text-sm text-gray-600 italic">
                  Je kunt deze stap overslaan als je wilt.
                </p>
              </div>
            )}

            {/* Photo Upload */}
            {step.type === 'photo' && (
              <PhotoUpload
                value={answers.photoUrl as string}
                onChange={(url) => handleAnswer('photoUrl', url)}
                onAnalysisComplete={(analysis) => {
                  console.log("AI Color Analysis:", analysis);
                  handleAnswer('colorAnalysis', analysis);
                }}
              />
            )}
          </div>

          {/* Nova Inline Reaction */}
          {showNovaReaction && lastAnsweredField && answers[lastAnsweredField as keyof QuizAnswers] && (
            <NovaInlineReaction
              field={lastAnsweredField}
              value={answers[lastAnsweredField as keyof QuizAnswers]}
              allAnswers={answers}
              onComplete={() => setShowNovaReaction(false)}
            />
          )}

          {/* Navigation Buttons - 52px+ touch targets */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-6 py-4 min-h-[52px] bg-white border-2 border-[var(--color-border)] rounded-xl sm:rounded-[var(--radius-xl)] font-semibold text-base sm:text-base hover:bg-[var(--color-surface)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Vorige</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-6 py-4 min-h-[52px] bg-[var(--ff-color-primary-600)] text-white rounded-xl sm:rounded-[var(--radius-xl)] font-semibold text-base sm:text-base hover:bg-[var(--ff-color-primary-700)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isSubmitting ? (
                <span>Verwerken...</span>
              ) : currentStep === totalSteps - 1 ? (
                <>
                  <span>Afronden</span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              ) : (
                <>
                  <span>Volgende</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          {step.required && (
            <p className="text-center text-sm text-gray-600 mt-6">
              * Deze vraag is verplicht
            </p>
          )}
        </div>
      </div>

    </main>

      {/* Phase Transition */}
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
