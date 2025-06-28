import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useOnboarding } from '../../context/OnboardingContext';
import { motion } from 'framer-motion';
import { getCurrentSeason } from '../../engine/helpers';

const SeasonStep: React.FC = () => {
  const { data, updateData, completeStep, goToNextStep, goToPreviousStep } = useOnboarding();
  
  const [selectedSeason, setSelectedSeason] = useState<string>(
    data.season || getCurrentSeason()
  );
  
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Track when the component is mounted
  useEffect(() => {
    // Track step view in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_step_view', {
        event_category: 'questionnaire',
        event_label: 'season',
        step_name: 'season'
      });
    }
  }, []);
  
  const seasonOptions = [
    {
      id: 'lente',
      name: 'Lente',
      icon: '🌱',
      description: 'Maart - Mei'
    },
    {
      id: 'zomer',
      name: 'Zomer',
      icon: '☀️',
      description: 'Juni - Augustus'
    },
    {
      id: 'herfst',
      name: 'Herfst',
      icon: '🍂',
      description: 'September - November'
    },
    {
      id: 'winter',
      name: 'Winter',
      icon: '❄️',
      description: 'December - Februari'
    }
  ];
  
  const handleSeasonSelect = (season: string) => {
    setSelectedSeason(season);
    
    // Track season selection
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'season_selection', {
        event_category: 'questionnaire',
        event_label: season,
        season: season
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update onboarding data
    updateData({
      season: selectedSeason as any
    });
    
    // Mark step as completed
    completeStep('season');
    
    // Go to next step
    goToNextStep();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B]">
      <div className="container-slim py-16">
        <div className="max-w-md mx-auto">
          {/* Progress indicator */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>Stap 3 van 4</span>
              <span>75%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: '75%' }}
              ></div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Voor welk seizoen zoek je outfits?
              </h1>
              <p className="text-white/80">
                We passen onze aanbevelingen aan op het seizoen
              </p>
            </div>

            <div className="glass-card overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {seasonOptions.map((season) => (
                    <button
                      key={season.id}
                      type="button"
                      onClick={() => handleSeasonSelect(season.id)}
                      className={`
                        p-4 rounded-xl border text-center transition-all
                        ${selectedSeason === season.id
                          ? 'border-[#FF8600] bg-white/10'
                          : 'border-white/30 hover:border-white/50 hover:bg-white/5'}
                      `}
                    >
                      <div className="text-3xl mb-2">{season.icon}</div>
                      <div className="font-medium text-white">{season.name}</div>
                      <div className="text-sm text-white/70">{season.description}</div>
                    </button>
                  ))}
                </div>
                
                <div className="relative mb-6">
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setShowTooltip(!showTooltip)}
                      className="flex items-center text-white/70 hover:text-white/90 transition-colors text-sm"
                    >
                      <Info size={16} className="mr-1" />
                      Waarom vragen we dit?
                    </button>
                  </div>
                  
                  {showTooltip && (
                    <div className="mt-3 p-3 bg-white/10 rounded-lg">
                      <p className="text-white/80 text-sm">
                        Het seizoen bepaalt welke kledingstukken we aanbevelen. In de winter tonen we warmere items zoals jassen en truien, terwijl we in de zomer lichtere kleding laten zien zoals T-shirts en shorts.
                      </p>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={goToPreviousStep}
                    icon={<ArrowLeft size={18} />}
                    iconPosition="left"
                    className="flex-1 text-white border border-white/30 hover:bg-white/10"
                  >
                    Terug
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<ArrowRight size={18} />}
                    iconPosition="right"
                    className="flex-1"
                  >
                    Volgende
                  </Button>
                </div>
              </form>

              {/* Privacy indicator */}
              <div className="px-6 py-4 bg-white/5 flex items-center justify-center space-x-2">
                <ShieldCheck size={18} className="text-[#FF8600]" />
                <span className="text-sm text-white/80">Je gegevens zijn veilig en versleuteld</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SeasonStep;