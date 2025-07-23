import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import { useOnboarding } from '../../context/OnboardingContext';

const SeasonStep: React.FC = () => {
  const navigate = useNavigate();
  const { data, updateAnswers } = useOnboarding();
  const [selectedSeason, setSelectedSeason] = useState<'lente' | 'zomer' | 'herfst' | 'winter'>(data.season || 'herfst');
  const [errors, setErrors] = useState<{ season?: string }>({});

  const totalSteps = 5;
  const currentStep = 3;

  const seasons = [
    {
      id: 'lente',
      name: 'Lente',
      description: 'Frisse kleuren en lichte lagen',
      icon: '🌱',
      colors: ['Pastelkleuren', 'Lichtgroen', 'Zachtroze'],
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2'
    },
    {
      id: 'zomer',
      name: 'Zomer',
      description: 'Lichte stoffen en heldere tinten',
      icon: '☀️',
      colors: ['Wit', 'Hemelsblauw', 'Koraalrood'],
      image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2'
    },
    {
      id: 'herfst',
      name: 'Herfst',
      description: 'Warme tinten en comfortabele lagen',
      icon: '🍂',
      colors: ['Bordeaux', 'Mosterdgeel', 'Donkergroen'],
      image: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2'
    },
    {
      id: 'winter',
      name: 'Winter',
      description: 'Diepe kleuren en warme materialen',
      icon: '❄️',
      colors: ['Marineblauw', 'Dieppaars', 'Smaragdgroen'],
      image: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2'
    }
  ];

  const handleNext = () => {
    // Validate selection
    if (!selectedSeason) {
      setErrors({ season: 'Selecteer een seizoen dat bij je past' });
      return;
    }
    
    // Clear errors
    setErrors({});
    
    // Update context
    updateAnswers({
      season: selectedSeason
    });
    
    // Track progress
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'onboarding_step_complete', {
        event_category: 'onboarding',
        event_label: 'season',
        step: currentStep,
        selected_season: selectedSeason
      });
    }
    
    // Navigate to next step
    navigate('/onboarding/occasion');
  };

  const handleBack = () => {
    navigate('/onboarding/archetype');
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
            <Calendar className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-secondary mb-2">
              Welk seizoen past bij jou?
            </h1>
            <p className="text-body">
              Kies het seizoen waarvan je de kleuren en stijl het mooist vindt
            </p>
          </motion.div>

          <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {seasons.map((season) => {
                const isSelected = selectedSeason === season.id;
                
                return (
                  <motion.button
                    key={season.id}
                    onClick={() => setSelectedSeason(season.id as any)}
                    className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-secondary ring-2 ring-secondary/20'
                        : 'border-gray-300 hover:border-secondary'
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <div className="aspect-[4/3] relative">
                      <img 
                        src={season.image} 
                        alt={season.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                          <span className="text-primary text-lg font-bold">✓</span>
                        </div>
                      )}
                      
                      {/* Season icon */}
                      <div className="absolute top-3 left-3 text-3xl">
                        {season.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-xl font-bold mb-1">{season.name}</h3>
                        <p className="text-sm opacity-90 mb-3">{season.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {season.colors.map((color, index) => (
                            <span key={index} className="text-xs bg-white/20 px-2 py-1 rounded-full">
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {errors.season && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errors.season}</p>
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
              >
                Volgende
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

export default SeasonStep;