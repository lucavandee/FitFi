import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ArrowLeft, CircleCheck as CheckCircle, Sparkles } from "lucide-react";
import { quizSteps } from "@/data/quizSteps";

type QuizAnswers = {
  stylePreferences?: string[];
  baseColors?: string;
  bodyType?: string;
  occasions?: string[];
  budgetRange?: number;
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      localStorage.setItem('ff_quiz_answers', JSON.stringify(answers));
      localStorage.setItem('ff_quiz_completed', Date.now().toString());

      setTimeout(() => {
        navigate('/results');
      }, 500);
    } catch (error) {
      console.error('Error saving quiz:', error);
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
