import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ArrowLeft, CircleCheck as CheckCircle, Sparkles } from "lucide-react";
import { quizSteps } from "@/data/quizSteps";
import { supabase } from "@/lib/supabaseClient";
import { computeResult } from "@/lib/quiz/logic";
import { LS_KEYS } from "@/lib/quiz/types";
import PhotoUpload from "@/components/quiz/PhotoUpload";
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
};

export default function OnboardingFlowPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = quizSteps.length;
  const step = quizSteps[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

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
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
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
      const result = computeResult(answers as any);

      localStorage.setItem(LS_KEYS.QUIZ_ANSWERS, JSON.stringify(answers));
      localStorage.setItem(LS_KEYS.COLOR_PROFILE, JSON.stringify(result.color));
      localStorage.setItem(LS_KEYS.ARCHETYPE, JSON.stringify(result.archetype));
      localStorage.setItem(LS_KEYS.RESULTS_TS, Date.now().toString());
      localStorage.setItem(LS_KEYS.QUIZ_COMPLETED, "1");

      const client = supabase();
      let syncSuccess = false;

      if (client) {
        const sessionId = localStorage.getItem('ff_session_id') || crypto.randomUUID();
        localStorage.setItem('ff_session_id', sessionId);

        const { data: { user } } = await client.auth.getUser();

        const savePromise = saveToSupabase(client, user, sessionId, result);

        toast.promise(
          savePromise,
          {
            loading: 'Je profiel wordt opgeslagen...',
            success: 'Profiel succesvol opgeslagen!',
            error: 'Let op: je resultaten zijn lokaal opgeslagen maar nog niet gesynchroniseerd. We proberen het later automatisch opnieuw.',
          }
        );

        syncSuccess = await savePromise;
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

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Start je Style Report – FitFi</title>
        <meta name="description" content="Beantwoord enkele vragen en ontdek welke stijl perfect bij je past." />
      </Helmet>

      {/* Progress Bar */}
      <div className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="ff-container py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Stap {currentStep + 1} van {totalSteps}</span>
            <span className="text-sm text-[var(--color-text-muted)]">{Math.round(progress)}% compleet</span>
          </div>
          <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="ff-container py-12 md:py-20">
        <div className="max-w-3xl mx-auto">

          {/* Question Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-50)] rounded-full text-sm font-semibold text-[var(--ff-color-primary-600)] mb-6">
              <Sparkles className="w-4 h-4" />
              Vraag {currentStep + 1}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {step.title}
            </h1>
            {step.description && (
              <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                {step.description}
              </p>
            )}
          </div>

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
                            <div className="text-sm text-[var(--color-text-muted)]">{option.description}</div>
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
                            <div className="text-sm text-[var(--color-text-muted)]">{option.description}</div>
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
                  <div className="text-sm text-[var(--color-text-muted)]">Per kledingstuk</div>
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
                <div className="flex justify-between mt-4 text-sm text-[var(--color-text-muted)]">
                  <span>€{step.min || 0}</span>
                  <span>€{step.max || 100}+</span>
                </div>
              </div>
            )}

            {/* Sizes */}
            {step.type === 'sizes' && step.sizeFields && (
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 space-y-6">
                {step.sizeFields.map((field) => (
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
                <p className="text-sm text-[var(--color-text-muted)] italic">
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
            <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
              * Deze vraag is verplicht
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
