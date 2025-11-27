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
import { VisualPreferenceStep } from "@/components/quiz/VisualPreferenceStep";
import { CalibrationStep } from "@/components/quiz/CalibrationStep";
import { EmailCapturePrompt } from "@/components/quiz/EmailCapturePrompt";
import { EmbeddingService } from "@/services/visualPreferences/embeddingService";
import { CircularProgressIndicator } from "@/components/quiz/CircularProgressIndicator";
import { AnimatedQuestionTransition } from "@/components/quiz/AnimatedQuestionTransition";
import { QuizMilestoneToast } from "@/components/quiz/QuizMilestoneToast";
import { useQuizGamification } from "@/hooks/useQuizGamification";
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
  visualPreferencesCompleted?: boolean;
  calibrationCompleted?: boolean;
};

type QuizPhase = 'questions' | 'swipes' | 'calibration';

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

  const {
    showMilestone,
    showCuriosity,
    dismissMilestone,
    dismissCuriosity
  } = useQuizGamification(currentStep, phase);

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
    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(prev => prev + 1);

      if (currentStep === 2 && !emailCaptured && !showEmailCapture) {
        setShowEmailCapture(true);
      }
    } else if (phase === 'questions') {
      setPhase('swipes');
    } else if (phase === 'swipes') {
      setPhase('calibration');
    } else {
      handleSubmit();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwipesComplete = () => {
    setAnswers(prev => ({ ...prev, visualPreferencesCompleted: true }));
    setPhase('calibration');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCalibrationComplete = () => {
    setAnswers(prev => ({ ...prev, calibrationCompleted: true }));
    handleSubmit();
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

      // ✅ GENERATE COMPLETE STYLE PROFILE FROM QUIZ + SWIPES
      console.log('[OnboardingFlow] Generating style profile from quiz + swipes...');
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
        const updatedResult = {
          color: colorProfile,
          archetype: archetype
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
            await EmbeddingService.lockEmbedding(userId, sessionId);
            console.log('✅ [OnboardingFlow] Embedding locked successfully!');
          } catch (lockError) {
            console.error('⚠️ [OnboardingFlow] Failed to lock embedding:', lockError);
          }
        }
      }

      localStorage.setItem('ff_sync_status', syncSuccess ? 'synced' : 'pending');

      setTimeout(() => {
        navigate('/results');
      }, 500);
    } catch (error) {
      console.error('❌ [OnboardingFlow] Error in handleSubmit:', error);
      toast.error('Er ging iets mis. Je resultaten zijn wel lokaal opgeslagen.');
      localStorage.setItem('ff_sync_status', 'pending');
      setIsSubmitting(false);
    }
  };

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
          <div className="ff-container py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Visuele Voorkeuren</span>
              <motion.span
                key={progress}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm text-gray-600"
              >
                {Math.round(progress)}% compleet
              </motion.span>
            </div>
            <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
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
          sessionId={sessionId}
          onComplete={handleSwipesComplete}
          onBack={handleBack}
          userGender={answers.gender as 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'}
        />
      </motion.main>
    );
  }

  if (phase === 'calibration') {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <Helmet>
          <title>Verfijn Je Profiel – FitFi</title>
          <meta name="description" content="Rate outfits om je aanbevelingen te perfectioneren" />
        </Helmet>

        <div className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <div className="ff-container py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Outfit Calibratie</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}% compleet</span>
            </div>
            <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
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
      {showMilestone && (
        <QuizMilestoneToast
          show={true}
          type={showMilestone.reward.type}
          message={showMilestone.reward.message}
          subMessage={showMilestone.reward.subMessage}
          onComplete={dismissMilestone}
        />
      )}

      {showCuriosity && !showMilestone && (
        <QuizMilestoneToast
          show={true}
          type={showCuriosity.type === 'tease' ? 'insight' : showCuriosity.type === 'progress' ? 'preview' : 'unlock'}
          message={showCuriosity.message}
          onComplete={dismissCuriosity}
        />
      )}

      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <Helmet>
          <title>Start je Style Report – FitFi</title>
          <meta name="description" content="Beantwoord enkele vragen en zie welke stijl bij je past." />
        </Helmet>

      {/* Progress Bar with Milestones */}
      <div className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="ff-container py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Stap {currentStep + 1} van {quizSteps.length}</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% compleet</span>
          </div>

          {/* Progress bar with milestone markers */}
          <div className="relative h-2 bg-[var(--color-bg)] rounded-full overflow-visible mb-3">
            <div
              className="h-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />

            {/* Milestone markers */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2">
              <div className={`w-3 h-3 rounded-full border-2 border-white transition-colors ${progress >= 25 ? 'bg-[var(--ff-color-primary-600)]' : 'bg-gray-300'}`} />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
              <div className={`w-3 h-3 rounded-full border-2 border-white transition-colors ${progress >= 50 ? 'bg-[var(--ff-color-primary-600)]' : 'bg-gray-300'}`} />
            </div>
            <div className="absolute top-1/2 left-3/4 -translate-y-1/2 -translate-x-1/2">
              <div className={`w-3 h-3 rounded-full border-2 border-white transition-colors ${progress >= 75 ? 'bg-[var(--ff-color-primary-600)]' : 'bg-gray-300'}`} />
            </div>
          </div>

          {/* Motivational messaging */}
          {progress < 30 && (
            <p className="text-xs text-center text-gray-600">Nog ongeveer 90 seconden...</p>
          )}
          {progress >= 30 && progress < 50 && (
            <p className="text-xs text-center text-gray-600">Je doet het geweldig! Nog {quizSteps.length - currentStep} vragen.</p>
          )}
          {progress >= 50 && progress < 70 && (
            <p className="text-xs text-center font-semibold text-[var(--ff-color-primary-600)]">🎉 Halverwege! Je resultaten komen eraan.</p>
          )}
          {progress >= 70 && progress < 100 && (
            <p className="text-xs text-center font-semibold text-[var(--ff-color-primary-600)]">⚡ Bijna klaar — laatste vragen!</p>
          )}
        </div>
      </div>

      {/* Question Content */}
      <div className="ff-container py-12 md:py-20">
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

          {/* Question Header */}
          <AnimatedQuestionTransition
            questionKey={currentStep}
            direction="forward"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-50)] rounded-full text-sm font-semibold text-[var(--ff-color-primary-600)] mb-6">
                <Sparkles className="w-4 h-4" />
                Vraag {currentStep + 1}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {step.title}
              </h1>
              {step.description && (
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {step.description}
                </p>
              )}
            </div>
          </AnimatedQuestionTransition>

          {/* Answer Options */}
          <div className="space-y-4 mb-12">
            {/* Checkbox (Multiple Select) */}
            {(step.type === 'checkbox' || step.type === 'multiselect') && step.options && (
              <div className="grid gap-4 md:grid-cols-2">
                {step.options.map((option) => {
                  const isSelected = (answers[step.field as keyof QuizAnswers] as string[] || []).includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleMultiSelect(step.field, option.value)}
                      className={`text-left p-6 rounded-[var(--radius-2xl)] border-2 transition-all ${
                        isSelected
                          ? 'border-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-50)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--ff-color-primary-300)]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                          isSelected
                            ? 'border-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-600)]'
                            : 'border-[var(--color-border)]'
                        }`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{option.label}</div>
                          {option.description && (
                            <div className="text-sm text-gray-600">{option.description}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Radio (Single Select) */}
            {(step.type === 'radio' || step.type === 'select') && step.options && (
              <div className="space-y-3">
                {step.options.map((option) => {
                  const isSelected = answers[step.field as keyof QuizAnswers] === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(step.field, option.value)}
                      className={`w-full text-left p-6 rounded-[var(--radius-2xl)] border-2 transition-all ${
                        isSelected
                          ? 'border-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-50)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--ff-color-primary-300)]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                          isSelected
                            ? 'border-[var(--ff-color-primary-600)]'
                            : 'border-[var(--color-border)]'
                        }`}>
                          {isSelected && <div className="w-3 h-3 rounded-full bg-[var(--ff-color-primary-600)]" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{option.label}</div>
                          {option.description && (
                            <div className="text-sm text-gray-600">{option.description}</div>
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

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--color-surface)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
              Vorige
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                'Verwerken...'
              ) : currentStep === totalSteps - 1 ? (
                <>
                  Afronden
                  <Sparkles className="w-5 h-5" />
                </>
              ) : (
                <>
                  Volgende
                  <ArrowRight className="w-5 h-5" />
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
    </>
  );
}
