import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Camera, Sparkles, User } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useOnboardingReducer } from '../../hooks/useOnboardingReducer';
import SwipeQuestion from '../quiz/SwipeQuestion';
import { swipeQuestions } from '../../data/swipeQuestions';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import LoadingFallback from '../ui/LoadingFallback';
import { trackEvent } from '../../utils/analytics';
import toast from 'react-hot-toast';

interface EnhancedOnboardingFlowProps {
  onComplete?: (profile: any, outfits: any[]) => void;
  className?: string;
}

const EnhancedOnboardingFlow: React.FC<EnhancedOnboardingFlowProps> = ({
  onComplete,
  className = ''
}) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { state, setAnswer, setBodyProfile, nextStep, prevStep, complete } = useOnboardingReducer();
  
  const [isAnalyzingBody, setIsAnalyzingBody] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = swipeQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= swipeQuestions.length - 1;

  useEffect(() => {
    // Track onboarding start
    trackEvent('enhanced_onboarding_start', 'engagement', 'onboarding_2.0', 1, {
      user_id: user?.id,
      total_questions: swipeQuestions.length
    });
  }, [user?.id]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    setIsAnalyzingBody(true);

    try {
      // Upload photo to Supabase storage
      const fileName = `${user?.id}_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-photos')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-photos')
        .getPublicUrl(fileName);

      // Generate body profile using Edge Function
      const { data: bodyProfileData, error: profileError } = await supabase.functions
        .invoke('generate-body-profile', {
          body: {
            image_url: urlData.publicUrl,
            gender: user?.gender || 'female'
          }
        });

      if (profileError) {
        throw profileError;
      }

      setBodyProfile(bodyProfileData.body_profile);
      toast.success('Lichaamsprofiel succesvol geanalyseerd!');

      // Track body analysis
      trackEvent('body_analysis_complete', 'ai_interaction', 'body_scan', 1, {
        user_id: user?.id,
        confidence: bodyProfileData.body_profile?.confidence_score,
        shape_type: bodyProfileData.body_profile?.shape_type
      });

    } catch (error) {
      console.error('Body analysis error:', error);
      toast.error('Foto-analyse mislukt. Je kunt doorgaan zonder foto.');
    } finally {
      setIsAnalyzingBody(false);
    }
  };

  const handleSwipeAnswer = (selectedIds: string[]) => {
    if (!currentQuestion) return;

    setAnswer(currentQuestion.id, selectedIds);
    
    // Track answer
    trackEvent('swipe_question_answered', 'engagement', currentQuestion.id, selectedIds.length, {
      question_category: currentQuestion.category,
      selected_options: selectedIds,
      user_id: user?.id
    });

    if (isLastQuestion) {
      handleComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      nextStep();
    }
  };

  const handleComplete = async () => {
    try {
      complete();
      
      // Generate final profile and recommendations
      const finalProfile = {
        userId: user?.id,
        answers: state.answers,
        bodyProfile: state.bodyProfile,
        confidence: 0.9,
        styleArchetype: determineArchetypeFromAnswers(state.answers),
        completedAt: new Date().toISOString()
      };

      // Track completion
      trackEvent('enhanced_onboarding_complete', 'conversion', 'onboarding_2.0', 1, {
        user_id: user?.id,
        total_answers: Object.keys(state.answers).length,
        has_body_profile: !!state.bodyProfile,
        confidence: finalProfile.confidence
      });

      if (onComplete) {
        onComplete(finalProfile, []);
      } else {
        navigate('/results', { state: { profile: finalProfile } });
      }

    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast.error('Er ging iets mis bij het voltooien van de onboarding');
    }
  };

  const determineArchetypeFromAnswers = (answers: Record<string, any>): string => {
    // Simple archetype determination based on style preferences
    const stylePrefs = answers.style_inspiration_1 || [];
    
    if (stylePrefs.includes('minimalist')) return 'urban';
    if (stylePrefs.includes('classic')) return 'klassiek';
    if (stylePrefs.includes('bohemian')) return 'retro';
    if (stylePrefs.includes('streetwear')) return 'streetstyle';
    if (stylePrefs.includes('romantic')) return 'casual_chic';
    
    return 'casual_chic'; // Default
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Inloggen vereist</h2>
          <p className="text-gray-600 mb-6">Je moet ingelogd zijn om de enhanced onboarding te starten.</p>
          <Button 
            onClick={() => navigate('/inloggen')}
            variant="primary"
            fullWidth
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
          >
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0] ${className}`}>
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/onboarding')}
            className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Terug naar onboarding
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#89CFF0] rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
              Enhanced Stijlanalyse
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Swipe door stijlen en laat Nova je perfecte look ontdekken
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-[#89CFF0] to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${state.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">
              {Math.round(state.progress)}% voltooid
            </p>
          </div>
        </div>

        {/* Photo Upload Section */}
        {currentQuestionIndex === 0 && !state.bodyProfile && (
          <div className="bg-white rounded-3xl shadow-sm p-8 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6 text-[#89CFF0]" />
              </div>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Optioneel: Upload een foto voor body-shape analyse
              </h3>
              
              <p className="text-gray-600 mb-6">
                Nova kan je lichaamsbouw analyseren voor nog betere pasvorm-aanbevelingen
              </p>

              {isAnalyzingBody ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 border-4 border-[#89CFF0] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-600">AI analyseert je foto...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] px-6 py-3 rounded-2xl font-medium transition-colors inline-flex items-center space-x-2">
                      <Camera size={20} />
                      <span>Upload Foto</span>
                    </div>
                  </label>
                  
                  <button
                    onClick={() => setCurrentQuestionIndex(1)}
                    className="block mx-auto text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Overslaan en doorgaan
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Swipe Questions */}
        {currentQuestion && (
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <SwipeQuestion
              question={currentQuestion.question}
              description={currentQuestion.description}
              options={currentQuestion.options}
              onAnswer={handleSwipeAnswer}
              multiSelect={currentQuestion.multiSelect}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(prev => prev - 1);
                prevStep();
              } else {
                navigate('/onboarding');
              }
            }}
            icon={<ArrowLeft size={16} />}
            iconPosition="left"
            className="text-gray-600 hover:bg-gray-50"
          >
            Vorige
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Vraag {currentQuestionIndex + 1} van {swipeQuestions.length}
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => {
              if (isLastQuestion) {
                handleComplete();
              } else {
                setCurrentQuestionIndex(prev => prev + 1);
                nextStep();
              }
            }}
            icon={<ArrowRight size={16} />}
            iconPosition="right"
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
          >
            {isLastQuestion ? 'Voltooien' : 'Volgende'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOnboardingFlow;