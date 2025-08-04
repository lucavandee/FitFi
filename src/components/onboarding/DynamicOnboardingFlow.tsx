import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, Brain, Zap, Target } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { DynamicOnboardingEngine } from '../../services/DynamicOnboardingEngine';
import { DynamicQuestion, OutfitPreview, RealtimeProfile } from '../../types/dynamicOnboarding';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';
import LoadingFallback from '../ui/LoadingFallback';
import { trackEvent } from '../../utils/analytics';
import toast from 'react-hot-toast';

interface DynamicOnboardingFlowProps {
  onComplete?: (profile: RealtimeProfile, outfits: OutfitPreview[]) => void;
  className?: string;
}

const DynamicOnboardingFlow: React.FC<DynamicOnboardingFlowProps> = ({
  onComplete,
  className = ''
}) => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Core state
  const [engine] = useState(() => new DynamicOnboardingEngine(user?.id));
  const [currentQuestion, setCurrentQuestion] = useState<DynamicQuestion | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [profile, setProfile] = useState<RealtimeProfile | null>(null);
  const [outfitPreviews, setOutfitPreviews] = useState<OutfitPreview[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [showAIFeedback, setShowAIFeedback] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  // Initialize onboarding
  useEffect(() => {
    initializeOnboarding();
  }, []);

  const initializeOnboarding = async () => {
    try {
      setIsLoading(true);
      const firstQuestion = await engine.getNextQuestion({});
      setCurrentQuestion(firstQuestion);
      setProgress(10); // Start with some progress
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      toast.error('Er ging iets mis bij het laden van de onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = useCallback(async (optionId: string) => {
    if (!currentQuestion || isProcessing) return;

    setIsProcessing(true);
    setSelectedAnswer(optionId);

    try {
      // Process answer with AI
      const result = await engine.processAnswer(
        currentQuestion.id, 
        optionId, 
        answers
      );

      // Update state
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
      setProfile(result.profile);
      setOutfitPreviews(result.outfitPreviews);
      
      // Show AI feedback
      if (result.outfitPreviews.length > 0) {
        setShowAIFeedback(true);
        
        // Track AI feedback shown
        trackEvent('ai_feedback_shown', 'ai_interaction', 'onboarding', result.outfitPreviews.length, {
          question_id: currentQuestion.id,
          confidence: result.profile.confidence
        });
      }

      // Update progress
      const newProgress = Math.min(20 + (Object.keys(answers).length * 20), 90);
      setProgress(newProgress);

      // Get next question or complete
      if (result.nextQuestion) {
        setTimeout(() => {
          setCurrentQuestion(result.nextQuestion);
          setSelectedAnswer(null);
          setShowAIFeedback(false);
          setIsProcessing(false);
        }, 2000); // Show AI feedback for 2 seconds
      } else {
        // No more questions - complete onboarding
        setTimeout(async () => {
          await completeOnboarding();
        }, 2000);
      }

    } catch (error) {
      console.error('Error processing answer:', error);
      toast.error('Er ging iets mis bij het verwerken van je antwoord');
      setIsProcessing(false);
    }
  }, [currentQuestion, answers, isProcessing, engine]);

  const completeOnboarding = async () => {
    if (isCompleting) return; // Prevent double completion
    
    try {
      setIsCompleting(true);
      setProgress(100);
      
      const result = await engine.completeOnboarding(answers);
      
      // Track completion
      trackEvent('dynamic_onboarding_complete', 'conversion', 'onboarding', 1, {
        total_steps: result.analytics.currentStep,
        confidence: result.profile.confidence,
        archetype: result.profile.styleArchetype,
        ai_accuracy: result.analytics.aiRecommendationAccuracy
      });

      // Call completion callback or navigate
      if (onComplete) {
        onComplete(result.profile, result.finalOutfits);
      } else {
        navigate('/results', { 
          state: { 
            profile: result.profile, 
            outfits: result.finalOutfits,
            analytics: result.analytics
          } 
        });
      }

    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Er ging iets mis bij het voltooien van de onboarding');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleBack = () => {
    // Track back navigation
    trackEvent('onboarding_back_clicked', 'engagement', currentQuestion?.id || 'unknown', 1);
    
    // Simple back logic - in a real implementation, this would be more sophisticated
    if (Object.keys(answers).length > 0) {
      const lastQuestionId = Object.keys(answers).pop();
      if (lastQuestionId) {
        const newAnswers = { ...answers };
        delete newAnswers[lastQuestionId];
        setAnswers(newAnswers);
        // Would need to regenerate question based on new state
      }
    } else {
      navigate('/onboarding');
    }
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    const isMultiSelect = currentQuestion.type === 'occasion_priority';

    return (
      <div className="space-y-4">
        {currentQuestion && currentQuestion.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleAnswerSelect(option.id)}
            disabled={isProcessing}
            className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
              selectedAnswer === option.id
                ? 'border-[#89CFF0] bg-[#89CFF0]/10 shadow-lg'
                : 'border-gray-200 hover:border-[#89CFF0]/50 hover:bg-gray-50'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
          >
            <div className="flex items-start space-x-4">
              {/* Visual Preview */}
              {option.visualPreview && (
                <div className="flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={option.visualPreview}
                    alt={option.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    componentName="DynamicOnboarding"
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="font-medium text-[#0D1B2A] mb-2 group-hover:text-[#89CFF0] transition-colors">
                  {option.label}
                </h3>
                {option.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {option.description}
                  </p>
                )}
                
                {/* Confidence boost indicator */}
                {option.confidenceBoost && option.confidenceBoost > 0 && (
                  <div className="mt-2 flex items-center space-x-1 text-xs text-[#89CFF0]">
                    <Zap size={12} />
                    <span>Confidence boost: +{Math.round(option.confidenceBoost * 100)}%</span>
                  </div>
                )}
              </div>
              
              {/* Selection indicator */}
              {selectedAnswer === option.id && (
                <div className="flex-shrink-0 w-6 h-6 bg-[#89CFF0] rounded-full flex items-center justify-center animate-scale-in">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderAIFeedback = () => {
    if (!showAIFeedback || !profile) return null;

    return (
      <div className="bg-gradient-to-br from-[#89CFF0]/10 to-purple-50 rounded-2xl p-6 mb-6 animate-fade-in">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-[#89CFF0] rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-[#0D1B2A]">Nova analyseert...</h3>
            <p className="text-sm text-gray-600">
              {Math.round(profile.confidence * 100)}% zeker van jouw stijlprofiel
            </p>
          </div>
        </div>

        {/* Real-time outfit previews */}
        {outfitPreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {outfitPreviews.slice(0, 3).map((outfit, index) => (
              <div
                key={outfit.id}
                className="relative aspect-[3/4] rounded-lg overflow-hidden group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ImageWithFallback
                  src={outfit.imageUrl}
                  alt={outfit.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  componentName="DynamicOnboarding"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-medium">{outfit.title}</p>
                    <p className="text-white/80 text-xs">{outfit.matchPercentage}% match</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Style insights */}
        <div className="mt-4 p-4 bg-white/50 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-[#89CFF0]" />
            <span className="text-sm font-medium text-[#0D1B2A]">Jouw stijlprofiel:</span>
          </div>
          <p className="text-sm text-gray-700">
            <strong>{profile.styleArchetype}</strong> - 
            {profile.personalityTraits.confidence > 0.7 ? ' Zelfverzekerd' : ' Ontdekkend'} en 
            {profile.personalityTraits.creativity > 0.7 ? ' Creatief' : ' Klassiek'}
          </p>
        </div>
      </div>
    );
  };

  // Helper to check if no more questions
  const noMoreQuestions = !currentQuestion;

  if (isLoading) {
    return <LoadingFallback fullScreen message="Dynamische onboarding laden..." />;
  }

  // Auto-complete when no more questions and we have answers
  if (noMoreQuestions && Object.keys(answers).length > 0 && !isCompleting) {
    completeOnboarding();
    return (
      <LoadingFallback
        fullScreen
        message="Even geduld… we berekenen jouw outfits"
      />
    );
  }

  // Show completion loading
  if (isCompleting) {
    return (
      <LoadingFallback
        fullScreen
        message="Even geduld… we berekenen jouw outfits"
      />
    );
  }

  if (!currentQuestion && Object.keys(answers).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Onboarding niet beschikbaar
          </h2>
          <p className="text-gray-600 mb-6">
            Er ging iets mis bij het laden van de dynamische onboarding.
          </p>
          <Button 
            onClick={() => navigate('/quiz')}
            variant="primary"
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
          >
            Probeer standaard quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0] ${className}`}>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={handleBack}
            className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Terug
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-[#89CFF0] rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-light text-gray-900">
                Dynamische Stijlontdekking
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Nova past zich realtime aan jouw antwoorden en gedrag aan voor de meest nauwkeurige stijladvies
            </p>
            
            {/* Dynamic progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-[#89CFF0] to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">
              {progress < 100 ? `${Math.round(progress)}% voltooid` : 'Analyse compleet!'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Question Section */}
          <div className="space-y-6">
              {currentQuestion && (
                <div
                  key={currentQuestion.id}
                  className="bg-white rounded-3xl shadow-sm p-8 animate-fade-in"
                >
                  {/* Question header */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-[#89CFF0]/20 rounded-full flex items-center justify-center">
                        <span className="text-[#89CFF0] text-sm font-bold">
                          {Object.keys(answers).length + 1}
                        </span>
                      </div>
                      <span className="text-sm text-[#89CFF0] font-medium">
                        {currentQuestion.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl font-medium text-[#0D1B2A] mb-3">
                      {currentQuestion.title}
                    </h2>
                    
                    <p className="text-gray-600">
                      {currentQuestion.description}
                    </p>
                  </div>

                  {/* Question input */}
                  {renderQuestionInput()}
                </div>
              )}
          </div>

          {/* AI Feedback Section */}
          <div className="space-y-6">
            {/* Profile preview */}
            {profile && (
              <div
                className="bg-white rounded-3xl shadow-sm p-6 animate-fade-in"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-medium text-[#0D1B2A]">Jouw Stijlprofiel</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stijl Archetype:</span>
                    <span className="font-medium text-[#0D1B2A] capitalize">
                      {profile.styleArchetype.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Confidence:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#89CFF0] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${profile.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-[#89CFF0]">
                        {Math.round(profile.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Personality traits */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-2">Persoonlijkheidskenmerken:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(profile.personalityTraits)
                        .filter(([_, value]) => value > 0.6)
                        .map(([trait, value]) => (
                          <span 
                            key={trait}
                            className="px-2 py-1 bg-[#89CFF0]/10 text-[#89CFF0] rounded-full text-xs font-medium"
                          >
                            {trait} ({Math.round(value * 100)}%)
                          </span>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Feedback */}
              {renderAIFeedback()}

            {/* Processing indicator */}
            {isProcessing && (
              <div
                className="bg-white rounded-2xl p-6 text-center animate-fade-in"
              >
                <div className="w-12 h-12 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 border-2 border-[#89CFF0] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600">Nova analyseert jouw antwoord...</p>
              </div>
            )}
          </div>
        </div>

        {/* Analytics debug (development only) */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
            <details>
              <summary className="cursor-pointer font-medium">Debug Analytics</summary>
              <pre className="mt-2 overflow-auto">
                {JSON.stringify(engine.getAnalytics(), null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicOnboardingFlow;