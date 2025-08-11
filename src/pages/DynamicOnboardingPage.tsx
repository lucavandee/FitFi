import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, User, Palette, Calendar, MapPin } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { useUser } from '../context/UserContext';
import { navigationService } from '../services/NavigationService';
import Button from '../components/ui/Button';
import LoadingFallback from '../components/ui/LoadingFallback';
import { saveOnboardingProgress, loadOnboardingProgress } from '../utils/progressPersistence';

const DynamicOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: userLoading } = useUser();
  const { data, updateAnswers } = useOnboarding();
  const [currentStep, setCurrentStep] = useState<'gender_name' | 'archetype' | 'season' | 'occasion' | 'preferences' | 'complete'>('gender_name');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = loadOnboardingProgress();
    if (savedProgress && savedProgress.currentStep) {
      setCurrentStep(savedProgress.currentStep as any);
      updateAnswers(savedProgress.data);
    }
  }, []);

  // Save progress when data changes
  useEffect(() => {
    if (Object.keys(data).length > 1) { // Only save if we have meaningful data
      const completedSteps = getCompletedSteps();
      saveOnboardingProgress(currentStep, completedSteps, data);
    }
  }, [data, currentStep]);

  const getCompletedSteps = (): string[] => {
    const steps: string[] = [];
    if (data.gender && data.name) steps.push('gender_name');
    if (data.archetypes && data.archetypes.length > 0) steps.push('archetype');
    if (data.season) steps.push('season');
    if (data.occasions && data.occasions.length > 0) steps.push('occasion');
    if (data.preferences) steps.push('preferences');
    return steps;
  };

  const handleNext = () => {
    const stepOrder = ['gender_name', 'archetype', 'season', 'occasion', 'preferences', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1] as any);
    }
  };

  const handlePrevious = () => {
    const stepOrder = ['gender_name', 'archetype', 'season', 'occasion', 'preferences'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1] as any);
    }
  };

  const handleComplete = async () => {
    if (!user?.id) return;

    setIsSubmitting(true);
    
    try {
      // Track completion
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'dynamic_onboarding_complete', {
          event_category: 'onboarding',
          event_label: 'dynamic_flow',
          user_id: user.id
        });
      }

      // Navigate to enhanced results
      await navigationService.navigateToEnhancedResults(data, {
        loadingMessage: 'Enhanced aanbevelingen genereren...',
        delay: 500
      });
    } catch (error) {
      console.error('Dynamic onboarding completion error:', error);
      // Fallback navigation
      navigate('/results', { state: { onboardingData: data } });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userLoading) {
    return <LoadingFallback fullScreen message="Dynamic onboarding laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Inloggen vereist</h2>
          <p className="text-gray-600 mb-6">Je moet ingelogd zijn voor dynamic onboarding.</p>
          <Button as="a" href="/inloggen" variant="primary" fullWidth>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'gender_name':
        return (
          <div className="text-center">
            <User className="w-16 h-16 text-[#89CFF0] mx-auto mb-6" />
            <h2 className="text-3xl font-light text-gray-900 mb-4">Vertel ons over jezelf</h2>
            <div className="space-y-4 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Je naam"
                value={data.name || ''}
                onChange={(e) => updateAnswers({ name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0]"
              />
              <div className="grid grid-cols-2 gap-3">
                {['man', 'vrouw'].map((gender) => (
                  <button
                    key={gender}
                    onClick={() => updateAnswers({ gender: gender as any })}
                    className={`p-4 border rounded-2xl transition-colors ${
                      data.gender === gender
                        ? 'border-[#89CFF0] bg-[#89CFF0]/10 text-[#89CFF0]'
                        : 'border-gray-200 hover:border-[#89CFF0]'
                    }`}
                  >
                    {gender === 'man' ? '👨' : '👩'} {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'archetype':
        return (
          <div className="text-center">
            <Palette className="w-16 h-16 text-[#89CFF0] mx-auto mb-6" />
            <h2 className="text-3xl font-light text-gray-900 mb-4">Kies je stijlarchetypen</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {['klassiek', 'casual_chic', 'urban', 'streetstyle', 'retro', 'luxury'].map((archetype) => (
                <button
                  key={archetype}
                  onClick={() => {
                    const current = data.archetypes || [];
                    const updated = current.includes(archetype)
                      ? current.filter(a => a !== archetype)
                      : [...current, archetype];
                    updateAnswers({ archetypes: updated });
                  }}
                  className={`p-4 border rounded-2xl transition-colors ${
                    data.archetypes?.includes(archetype)
                      ? 'border-[#89CFF0] bg-[#89CFF0]/10 text-[#89CFF0]'
                      : 'border-gray-200 hover:border-[#89CFF0]'
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {archetype === 'klassiek' ? '👔' : 
                     archetype === 'casual_chic' ? '👗' : 
                     archetype === 'urban' ? '🏙️' : 
                     archetype === 'streetstyle' ? '🎨' : 
                     archetype === 'retro' ? '📻' : '💎'}
                  </div>
                  <div className="text-sm font-medium">{archetype.replace('_', ' ')}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'season':
        return (
          <div className="text-center">
            <Calendar className="w-16 h-16 text-[#89CFF0] mx-auto mb-6" />
            <h2 className="text-3xl font-light text-gray-900 mb-4">Wat is je favoriete seizoen?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { id: 'lente', label: 'Lente', emoji: '🌸' },
                { id: 'zomer', label: 'Zomer', emoji: '☀️' },
                { id: 'herfst', label: 'Herfst', emoji: '🍂' },
                { id: 'winter', label: 'Winter', emoji: '❄️' }
              ].map((season) => (
                <button
                  key={season.id}
                  onClick={() => updateAnswers({ season: season.id as any })}
                  className={`p-6 border rounded-2xl transition-colors ${
                    data.season === season.id
                      ? 'border-[#89CFF0] bg-[#89CFF0]/10 text-[#89CFF0]'
                      : 'border-gray-200 hover:border-[#89CFF0]'
                  }`}
                >
                  <div className="text-3xl mb-2">{season.emoji}</div>
                  <div className="font-medium">{season.label}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'occasion':
        return (
          <div className="text-center">
            <MapPin className="w-16 h-16 text-[#89CFF0] mx-auto mb-6" />
            <h2 className="text-3xl font-light text-gray-900 mb-4">Voor welke gelegenheden?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {['Werk', 'Casual', 'Formeel', 'Uitgaan', 'Sport', 'Reizen'].map((occasion) => (
                <button
                  key={occasion}
                  onClick={() => {
                    const current = data.occasions || [];
                    const updated = current.includes(occasion)
                      ? current.filter(o => o !== occasion)
                      : [...current, occasion];
                    updateAnswers({ occasions: updated });
                  }}
                  className={`p-4 border rounded-2xl transition-colors ${
                    data.occasions?.includes(occasion)
                      ? 'border-[#89CFF0] bg-[#89CFF0]/10 text-[#89CFF0]'
                      : 'border-gray-200 hover:border-[#89CFF0]'
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {occasion === 'Werk' ? '💼' : 
                     occasion === 'Casual' ? '👕' : 
                     occasion === 'Formeel' ? '🤵' : 
                     occasion === 'Uitgaan' ? '🌃' : 
                     occasion === 'Sport' ? '🏃' : '✈️'}
                  </div>
                  <div className="font-medium">{occasion}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="text-center">
            <Sparkles className="w-16 h-16 text-[#89CFF0] mx-auto mb-6" />
            <h2 className="text-3xl font-light text-gray-900 mb-4">Laatste voorkeuren</h2>
            <div className="space-y-4 max-w-md mx-auto">
              {[
                { key: 'tops', label: 'Tops & Shirts', emoji: '👕' },
                { key: 'bottoms', label: 'Broeken & Rokken', emoji: '👖' },
                { key: 'outerwear', label: 'Jassen & Vesten', emoji: '🧥' },
                { key: 'shoes', label: 'Schoenen', emoji: '👟' },
                { key: 'accessories', label: 'Accessoires', emoji: '👜' }
              ].map((pref) => (
                <label key={pref.key} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-2xl hover:border-[#89CFF0] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.preferences?.[pref.key as keyof typeof data.preferences] || false}
                    onChange={(e) => updateAnswers({
                      preferences: {
                        ...data.preferences,
                        [pref.key]: e.target.checked
                      }
                    })}
                    className="w-5 h-5 text-[#89CFF0] focus:ring-[#89CFF0] border-gray-300 rounded"
                  />
                  <span className="text-2xl">{pref.emoji}</span>
                  <span className="font-medium text-gray-900">{pref.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-[#89CFF0] rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-light text-gray-900 mb-4">Profiel compleet!</h2>
            <p className="text-xl text-gray-600 mb-8">
              Je dynamic onboarding is voltooid. We gaan nu je enhanced aanbevelingen genereren.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'gender_name':
        return data.gender && data.name && data.name.trim().length > 0;
      case 'archetype':
        return data.archetypes && data.archetypes.length > 0;
      case 'season':
        return data.season;
      case 'occasion':
        return data.occasions && data.occasions.length > 0;
      case 'preferences':
        return data.preferences && Object.values(data.preferences).some(Boolean);
      default:
        return true;
    }
  };

  const getStepNumber = () => {
    const steps = ['gender_name', 'archetype', 'season', 'occasion', 'preferences'];
    return steps.indexOf(currentStep) + 1;
  };

  const totalSteps = 5;
  const progressPercentage = (getStepNumber() / totalSteps) * 100;

  if (userLoading) {
    return <LoadingFallback fullScreen message="Dynamic onboarding laden..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0]">
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Stap {getStepNumber()} van {totalSteps}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#89CFF0] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-8">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 'gender_name'}
            className="text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Vorige
          </Button>

          {currentStep === 'complete' ? (
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={isSubmitting}
              icon={<ArrowRight size={16} />}
              iconPosition="right"
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
            >
              {isSubmitting ? 'Genereren...' : 'Genereer Enhanced Aanbevelingen'}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={currentStep === 'preferences' ? () => setCurrentStep('complete') : handleNext}
              disabled={!canProceed()}
              icon={<ArrowRight size={16} />}
              iconPosition="right"
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] disabled:opacity-50"
            >
              {currentStep === 'preferences' ? 'Voltooien' : 'Volgende'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicOnboardingPage;