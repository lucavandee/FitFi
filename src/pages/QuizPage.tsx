import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useQuizAnswers } from '../hooks/useQuizAnswers';
import { QuizAnswers, QuizProgress } from '../types/quiz';
import { quizSteps } from '../data/quizSteps';
import Button from '../components/ui/Button';
import LoadingFallback from '../components/ui/LoadingFallback';
import { useABTesting } from '../hooks/useABTesting';
import { useAchievements } from '../hooks/useAchievements';
import AchievementNotification from '../components/quiz/AchievementNotification';
import SocialShareModal from '../components/quiz/SocialShareModal';
import StylePreview from '../components/quiz/StylePreview';
import ProgressMotivation from '../components/quiz/ProgressMotivation';
import CompletionCelebration from '../components/quiz/CompletionCelebration';
import toast from 'react-hot-toast';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: userLoading } = useUser();
  const { submitQuizAnswers, isQuizCompleted, isLoading: quizLoading } = useQuizAnswers();
  const { checkAndAwardAchievements } = useAchievements();
  
  // A/B Testing for celebration animations
  const { variant: celebrationVariant, trackConversion } = useABTesting({
    testName: 'quiz_celebration',
    variants: [{ name: 'control', weight: 50 }, { name: 'variant_a', weight: 50 }]
  });
  
  const [progress, setProgress] = useState<QuizProgress>({
    currentStep: 1,
    totalSteps: quizSteps.length,
    isComplete: false,
    answers: {}
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [startTime] = useState(Date.now());
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const [showAchievement, setShowAchievement] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [progress.currentStep]);

  // Redirect if already completed
  useEffect(() => {
    if (!quizLoading && isQuizCompleted()) {
      navigate('/results');
    }
  }, [quizLoading, isQuizCompleted, navigate]);

  if (userLoading || quizLoading) {
    return <LoadingFallback fullScreen message="Quiz laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Inloggen vereist</h2>
          <p className="text-gray-600 mb-6">Je moet ingelogd zijn om de quiz te doen.</p>
          <Button as={Link} to="/inloggen" variant="primary" fullWidth>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  const currentStepData = quizSteps[progress.currentStep - 1];
  
  // Guard against undefined currentStepData
  if (!currentStepData) {
    return <LoadingFallback fullScreen message="Quiz data laden..." />;
  }
  
  const progressPercentage = (progress.currentStep / progress.totalSteps) * 100;

  const validateCurrentStep = (): boolean => {
    const field = currentStepData.field;
    const value = progress.answers[field];
    
    if (currentStepData.required) {
      if (!value || 
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'string' && value.trim() === '') ||
          (typeof value === 'number' && value <= 0)) {
        setErrors({ [field]: 'Dit veld is verplicht' });
        return false;
      }
    }
    
    setErrors({});
    return true;
  };

  const handleAnswerChange = (field: keyof QuizAnswers, value: any) => {
    setProgress(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [field]: value
      }
    }));
    
    // Clear error when user provides input
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Show preview after answering
    if (!showPreview) {
      setTimeout(() => setShowPreview(true), 300);
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (progress.currentStep < progress.totalSteps) {
      // Fix: voorkom 'undefined' bij laatste index of ontbrekende vraag
      const nextStep = progress.currentStep + 1;
      if (nextStep > quizSteps.length) {
        console.warn('Invalid question index → redirect to results');
        navigate('/results');
        return;
      }
      
      setProgress(prev => ({
        ...prev,
        currentStep: nextStep
      }));
      
      // Reset preview for next question
      setShowPreview(false);
    }
  };

  const handlePrevious = () => {
    if (progress.currentStep > 1) {
      setProgress(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }));
    }
    
    // Show preview immediately when going back
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    // Extra guard: check if we have valid quiz data
    if (!quizSteps || quizSteps.length === 0) {
      toast.error('Quiz data niet beschikbaar. Probeer de pagina te vernieuwen.');
      return;
    }

    // Validate all required fields
    const missingFields: string[] = [];
    quizSteps.forEach(step => {
      if (step.required) {
        const value = progress.answers[step.field];
        if (!value || 
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'string' && value.trim() === '') ||
            (typeof value === 'number' && value <= 0)) {
          missingFields.push(step.title);
        }
      }
    });

    if (missingFields.length > 0) {
      toast.error(`Vul alle vereiste velden in: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await submitQuizAnswers(progress.answers as QuizAnswers);
      
      if (success) {
        // Calculate completion time for achievements
        const completionTime = Date.now() - startTime;
        
        // Check for achievements
        const earnedAchievements = await checkAndAwardAchievements(
          progress.answers,
          { completionTime, celebrationVariant }
        );
        
        if (earnedAchievements.length > 0) {
          setNewAchievements(earnedAchievements);
        }
        
        // Show celebration before redirect
        setShowCelebration(true);
        
        // Track quiz completion
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'quiz_complete', {
            event_category: 'onboarding',
            event_label: 'style_quiz',
            user_id: user.id
          });
        }
        
        // Track A/B test conversion
        trackConversion({ completionTime, achievementsEarned: earnedAchievements.length });
        
      } else {
        toast.error('Er ging iets mis bij het opslaan van je antwoorden. Probeer het opnieuw.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      toast.error('Er ging iets mis. Probeer het opnieuw.');
      setIsSubmitting(false);
    }
  };
  
  const handleCelebrationComplete = () => {
    // Show achievements first if any
    if (newAchievements.length > 0) {
      setShowAchievement(true);
    } else {
      toast.success('Quiz voltooid! Je resultaten worden geladen...');
      navigate('/results');
    }
  };

  const handleAchievementClose = () => {
    setShowAchievement(false);
    
    // Show next achievement or navigate to results
    if (newAchievements.length > 1) {
      // For now, just show the first one
      toast.success('Quiz voltooid! Je resultaten worden geladen...');
      navigate('/results');
    } else {
      toast.success('Quiz voltooid! Je resultaten worden geladen...');
      navigate('/results');
    }
  };

  const handleAchievementShare = () => {
    setShowSocialShare(true);
  };

  const handleSocialShare = (platform: string) => {
    // Track social sharing
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'social_share', {
        event_category: 'engagement',
        event_label: `achievement_${platform}`,
        achievement_id: newAchievements[0]?.id
      });
    }
    
    setShowSocialShare(false);
    handleAchievementClose();
  };

  const renderQuestionInput = () => {
    const field = currentStepData.field;
    const value = progress.answers[field];

    switch (currentStepData.type) {
      case 'checkbox':
        return (
          <fieldset className="space-y-3">
            <legend className="sr-only">{currentStepData.title}</legend>
            {currentStepData.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-start space-x-3 p-4 border border-gray-200 rounded-xl hover:border-[#89CFF0] transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleAnswerChange(field, newValues);
                  }}
                  className="mt-1 h-4 w-4 text-[#89CFF0] focus:ring-[#89CFF0] border-gray-300 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  )}
                </div>
              </label>
            ))}
          </fieldset>
        );

      case 'radio':
        return (
          <fieldset className="space-y-3">
            <legend className="sr-only">{currentStepData.title}</legend>
            {currentStepData.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-start space-x-3 p-4 border border-gray-200 rounded-xl hover:border-[#89CFF0] transition-colors cursor-pointer"
              >
                <input
                  type="radio"
                  name={field}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleAnswerChange(field, e.target.value)}
                  className="mt-1 h-4 w-4 text-[#89CFF0] focus:ring-[#89CFF0] border-gray-300"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  )}
                </div>
              </label>
            ))}
          </fieldset>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleAnswerChange(field, e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
            aria-label={currentStepData.title}
          >
            <option value="">Selecteer een optie...</option>
            {currentStepData.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <fieldset className="space-y-3">
            <legend className="sr-only">{currentStepData.title}</legend>
            {currentStepData.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-start space-x-3 p-4 border border-gray-200 rounded-xl hover:border-[#89CFF0] transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleAnswerChange(field, newValues);
                  }}
                  className="mt-1 h-4 w-4 text-[#89CFF0] focus:ring-[#89CFF0] border-gray-300 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  )}
                </div>
              </label>
            ))}
          </fieldset>
        );

      case 'slider':
        const sliderValue = typeof value === 'number' ? value : currentStepData.min || 0;
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#89CFF0] mb-2">
                €{sliderValue}
              </div>
              <div className="text-sm text-gray-600">per kledingstuk</div>
            </div>
            <div className="px-4">
              <input
                type="range"
                min={currentStepData.min}
                max={currentStepData.max}
                step={currentStepData.step}
                value={sliderValue}
                onChange={(e) => handleAnswerChange(field, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #89CFF0 0%, #89CFF0 ${((sliderValue - (currentStepData.min || 0)) / ((currentStepData.max || 100) - (currentStepData.min || 0))) * 100}%, #E5E7EB ${((sliderValue - (currentStepData.min || 0)) / ((currentStepData.max || 100) - (currentStepData.min || 0))) * 100}%, #E5E7EB 100%)`
                }}
                aria-label={`Budget range: €${sliderValue}`}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>€{currentStepData.min}</span>
                <span>€{currentStepData.max}+</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isLastStep = progress.currentStep === progress.totalSteps;
  const canProceed = !errors[currentStepData.field];
  
  // Show celebration overlay
  if (showCelebration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0] flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <CompletionCelebration 
            onComplete={handleCelebrationComplete}
            variant={celebrationVariant}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0] py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/onboarding" 
            className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Terug naar onboarding
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">
              Stijlquiz
            </h1>
            <p className="text-gray-600">
              Beantwoord enkele vragen voor gepersonaliseerd stijladvies
            </p>
            
            {/* Progress Motivation */}
            <ProgressMotivation 
              currentStep={progress.currentStep}
              totalSteps={progress.totalSteps}
              className="mt-4"
            />
          </div>
        </div>

        {/* Quiz Card */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200">
            <div 
              className="h-full bg-[#89CFF0] transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Quiz voortgang: ${Math.round(progressPercentage)}%`}
            />
          </div>

          <div className="p-8">
            {/* Step Info */}
            <div className="text-center mb-8">
              <div className="text-sm text-gray-500 mb-2">
                Vraag {progress.currentStep} van {progress.totalSteps}
              </div>
              <h2 className="text-2xl font-medium text-gray-900 mb-3">
                {currentStepData.title}
              </h2>
              <p className="text-gray-600">
                {currentStepData.description}
              </p>
            </div>

            {/* Question Input */}
            <div className="mb-8">
              {renderQuestionInput()}
              
              {/* Error Message */}
              {errors[currentStepData.field] && (
                <div 
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-700 text-sm">{errors[currentStepData.field]}</p>
                </div>
              )}
            </div>

            {/* Style Preview - Show after answering */}
            {showPreview && Object.keys(progress.answers).length > 0 && (
              <div className="mb-8 animate-fade-in">
                <StylePreview 
                  answers={progress.answers}
                  currentStep={progress.currentStep}
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={progress.currentStep === 1}
                icon={<ArrowLeft size={16} />}
                iconPosition="left"
                className="text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Vorige
              </Button>

              {isLastStep ? (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!canProceed || isSubmitting}
                  icon={isSubmitting ? undefined : <CheckCircle size={16} />}
                  iconPosition="right"
                  className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-[#0D1B2A] border-t-transparent rounded-full animate-spin mr-2"></div>
                      Versturen...
                    </div>
                  ) : (
                    'Verstuur Quiz'
                  )}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!canProceed}
                  icon={<ArrowRight size={16} />}
                  iconPosition="right"
                  className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Volgende
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quiz Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Je antwoorden worden veilig opgeslagen en alleen gebruikt voor jouw persoonlijke stijladvies
          </p>
        </div>

        {/* Achievement Notification */}
        {showAchievement && newAchievements.length > 0 && (
          <AchievementNotification
            achievement={newAchievements[0]}
            onClose={handleAchievementClose}
            onShare={handleAchievementShare}
          />
        )}

        {/* Social Share Modal */}
        {showSocialShare && newAchievements.length > 0 && (
          <SocialShareModal
            shareData={{
              achievement: newAchievements[0],
              userProfile: {
                name: user?.name || 'FitFi User',
                styleType: 'Modern Minimalist', // Would be dynamic based on answers
                matchPercentage: 87 // Would be calculated based on answers
              },
              shareText: `Ik heb zojuist mijn stijlprofiel ontdekt met FitFi! 🎨 Achievement unlocked: ${newAchievements[0].title}`,
              shareUrl: 'https://fitfi.app?ref=achievement'
            }}
            onClose={() => setShowSocialShare(false)}
            onShare={handleSocialShare}
          />
        )}
      </div>
    </div>
  );
};

export default QuizPage;