import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Settings, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import { useOnboarding } from '../../context/OnboardingContext';

const PreferencesStep: React.FC = () => {
  const navigate = useNavigate();
  const { data, updateAnswers } = useOnboarding();
  const [preferences, setPreferences] = useState(data.preferences || {
    tops: true,
    bottoms: true,
    outerwear: true,
    shoes: true,
    accessories: true
  });

  const totalSteps = 5;
  const currentStep = 5;

  const preferenceOptions = [
    {
      id: 'tops',
      name: 'Tops & Shirts',
      description: 'T-shirts, blouses, truien, etc.',
      icon: '👕'
    },
    {
      id: 'bottoms',
      name: 'Broeken & Rokken',
      description: 'Jeans, broeken, rokken, shorts',
      icon: '👖'
    },
    {
      id: 'outerwear',
      name: 'Jassen & Vesten',
      description: 'Jassen, blazers, cardigans',
      icon: '🧥'
    },
    {
      id: 'shoes',
      name: 'Schoenen',
      description: 'Sneakers, pumps, laarzen',
      icon: '👠'
    },
    {
      id: 'accessories',
      name: 'Accessoires',
      description: 'Tassen, sieraden, riemen',
      icon: '👜'
    }
  ];

  const handlePreferenceToggle = (preferenceId: string) => {
    setPreferences(prev => ({
      ...prev,
      [preferenceId]: !prev[preferenceId]
    }));
  };

  const handleNext = () => {
    // Update context
    updateAnswers({
      preferences
    });
    
    // Track completion
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'onboarding_complete', {
        event_category: 'onboarding',
        event_label: 'preferences',
        step: currentStep,
        preferences: Object.entries(preferences)
          .filter(([_, enabled]) => enabled)
          .map(([key, _]) => key)
          .join(',')
      });
    }
    
    // Navigate to results
    navigate('/results', {
      state: {
        onboardingData: {
          ...data,
          preferences
        }
      }
    });
  };

  const handleBack = () => {
    navigate('/onboarding/occasion');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-dark">
      <div className="container-slim py-16">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-body mb-2">
              <span>Stap {currentStep} van {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-primary-light rounded-full h-2">
              <div
                className="bg-secondary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <Settings className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-secondary mb-2">
              Laatste stap!
            </h1>
            <p className="text-body">
              Voor welke kledingcategorieën wil je aanbevelingen ontvangen?
            </p>
          </motion.div>

          <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
            <div className="space-y-4 mb-6">
              {preferenceOptions.map((option) => {
                const isEnabled = preferences[option.id];
                
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handlePreferenceToggle(option.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isEnabled
                        ? 'border-secondary bg-secondary/10'
                        : 'border-gray-300 hover:border-secondary hover:bg-secondary/5'
                    }`}
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 0 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div>
                          <h3 className="font-semibold">{option.name}</h3>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </div>
                      
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isEnabled 
                          ? 'bg-secondary border-secondary' 
                          : 'border-gray-300'
                      }`}>
                        {isEnabled && (
                          <span className="text-primary text-sm font-bold">✓</span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Info */}
            <div className="text-center mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                💡 Je kunt deze voorkeuren later altijd aanpassen in je dashboard
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                onClick={handleBack}
                icon={<ArrowLeft size={16} />}
                iconPosition="left"
                className="flex-1"
              >
                Terug
              </Button>
              
              <Button
                variant="primary"
                onClick={handleNext}
                icon={<ArrowRight size={16} />}
                iconPosition="right"
                className="flex-1"
              >
                Mijn stijl ontdekken!
              </Button>
            </div>

            {/* Privacy indicator */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-center space-x-2">
              <ShieldCheck size={18} className="text-secondary" />
              <span className="text-sm text-gray-600">Je voorkeuren worden veilig opgeslagen</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesStep;