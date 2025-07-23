import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import { useOnboarding } from '../../context/OnboardingContext';

const OccasionStep: React.FC = () => {
  const navigate = useNavigate();
  const { data, updateAnswers } = useOnboarding();
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(data.occasions || []);
  const [errors, setErrors] = useState<{ occasions?: string }>({});

  const totalSteps = 5;
  const currentStep = 4;

  const occasions = [
    {
      id: 'werk',
      name: 'Werk',
      description: 'Professionele outfits voor kantoor',
      icon: '💼',
      examples: ['Vergaderingen', 'Presentaties', 'Kantoor']
    },
    {
      id: 'casual',
      name: 'Casual',
      description: 'Comfortabele dagelijkse kleding',
      icon: '☕',
      examples: ['Boodschappen', 'Thuis werken', 'Ontspannen']
    },
    {
      id: 'uitgaan',
      name: 'Uitgaan',
      description: 'Stijlvolle looks voor sociale events',
      icon: '🎉',
      examples: ['Restaurants', 'Feestjes', 'Dates']
    },
    {
      id: 'sport',
      name: 'Sport & Actief',
      description: 'Functionele kleding voor beweging',
      icon: '🏃‍♀️',
      examples: ['Gym', 'Wandelen', 'Yoga']
    },
    {
      id: 'formeel',
      name: 'Formeel',
      description: 'Elegante kleding voor speciale gelegenheden',
      icon: '🎭',
      examples: ['Bruiloften', 'Gala', 'Theater']
    },
    {
      id: 'reizen',
      name: 'Reizen',
      description: 'Comfortabele en praktische reiskleding',
      icon: '✈️',
      examples: ['Vliegtuig', 'Sightseeing', 'Vakantie']
    }
  ];

  const handleOccasionToggle = (occasionId: string) => {
    setSelectedOccasions(prev => {
      if (prev.includes(occasionId)) {
        return prev.filter(id => id !== occasionId);
      } else {
        return [...prev, occasionId];
      }
    });
    
    // Clear errors when user makes selection
    if (errors.occasions) {
      setErrors({});
    }
  };

  const handleNext = () => {
    // Validate selection
    if (selectedOccasions.length === 0) {
      setErrors({ occasions: 'Selecteer minimaal één gelegenheid' });
      return;
    }
    
    // Clear errors
    setErrors({});
    
    // Update context
    updateAnswers({
      occasions: selectedOccasions
    });
    
    // Track progress
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'onboarding_step_complete', {
        event_category: 'onboarding',
        event_label: 'occasion',
        step: currentStep,
        selected_occasions: selectedOccasions.join(','),
        occasion_count: selectedOccasions.length
      });
    }
    
    // Navigate to results
    navigate('/results', {
      state: {
        onboardingData: {
          ...data,
          occasions: selectedOccasions
        }
      }
    });
  };

  const handleBack = () => {
    navigate('/onboarding/season');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-dark">
      <div className="container-slim py-16">
        <div className="max-w-4xl mx-auto">
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
            <MapPin className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-secondary mb-2">
              Voor welke gelegenheden?
            </h1>
            <p className="text-body">
              Selecteer alle situaties waarvoor je stijladvies wilt ontvangen
            </p>
          </motion.div>

          <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {occasions.map((occasion) => {
                const isSelected = selectedOccasions.includes(occasion.id);
                
                return (
                  <motion.button
                    key={occasion.id}
                    onClick={() => handleOccasionToggle(occasion.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-secondary bg-secondary/10'
                        : 'border-gray-300 hover:border-secondary hover:bg-secondary/5'
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{occasion.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{occasion.name}</h3>
                          {isSelected && (
                            <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                              <span className="text-primary text-xs font-bold">✓</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{occasion.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {occasion.examples.map((example, index) => (
                            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Selection info */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                {selectedOccasions.length === 0 && 'Selecteer de gelegenheden waarvoor je outfits zoekt'}
                {selectedOccasions.length === 1 && '1 gelegenheid geselecteerd'}
                {selectedOccasions.length > 1 && `${selectedOccasions.length} gelegenheden geselecteerd`}
              </p>
            </div>

            {errors.occasions && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errors.occasions}</p>
              </div>
            )}

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
                disabled={selectedOccasions.length === 0}
              >
                Resultaten bekijken
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

export default OccasionStep;