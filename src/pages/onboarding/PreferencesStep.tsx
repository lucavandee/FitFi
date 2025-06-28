import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useOnboarding } from '../../context/OnboardingContext';
import { motion } from 'framer-motion';

const PreferencesStep: React.FC = () => {
  const { data, updateData, completeStep, goToNextStep, goToPreviousStep } = useOnboarding();
  
  const [preferences, setPreferences] = useState<Record<string, boolean>>(
    data.preferences || {
      tops: true,
      bottoms: true,
      outerwear: true,
      shoes: true,
      accessories: true
    }
  );
  
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Track when the component is mounted
  useEffect(() => {
    // Track step view in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_step_view', {
        event_category: 'questionnaire',
        event_label: 'preferences',
        step_name: 'preferences'
      });
    }
  }, []);
  
  const preferenceOptions = [
    {
      id: 'tops',
      name: 'Tops',
      icon: '👕',
      description: 'T-shirts, blouses, overhemden, truien'
    },
    {
      id: 'bottoms',
      name: 'Bottoms',
      icon: '👖',
      description: 'Broeken, jeans, rokken, shorts'
    },
    {
      id: 'outerwear',
      name: 'Jassen',
      icon: '🧥',
      description: 'Jassen, blazers, vesten'
    },
    {
      id: 'shoes',
      name: 'Schoenen',
      icon: '👟',
      description: 'Sneakers, laarzen, pumps, sandalen'
    },
    {
      id: 'accessories',
      name: 'Accessoires',
      icon: '👜',
      description: 'Tassen, sieraden, riemen, hoeden'
    }
  ];
  
  const togglePreference = (id: string) => {
    setPreferences(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    
    // Track preference toggle
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'preference_toggle', {
        event_category: 'questionnaire',
        event_label: id,
        preference: id,
        value: !preferences[id]
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update onboarding data
    updateData({
      preferences
    });
    
    // Mark step as completed
    completeStep('preferences');
    
    // Submit the onboarding data
    goToNextStep();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B]">
      <div className="container-slim py-16">
        <div className="max-w-md mx-auto">
          {/* Progress indicator */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>Extra stap</span>
              <span>Optioneel</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: '100%' }}
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
                Welke producttypes wil je zien?
              </h1>
              <p className="text-white/80">
                Pas je voorkeuren aan of ga direct door naar je resultaten
              </p>
            </div>

            <div className="glass-card overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4 mb-6">
                  {preferenceOptions.map((option) => (
                    <div key={option.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={option.id}
                        checked={preferences[option.id] || false}
                        onChange={() => togglePreference(option.id)}
                        className="sr-only peer"
                      />
                      <label
                        htmlFor={option.id}
                        className="flex items-center justify-between w-full p-4 rounded-xl border cursor-pointer transition-all
                          peer-checked:border-[#FF8600] peer-checked:bg-white/10
                          border-white/30 hover:border-white/50 hover:bg-white/5"
                      >
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">{option.icon}</div>
                          <div>
                            <div className="font-medium text-white">{option.name}</div>
                            <div className="text-sm text-white/70">{option.description}</div>
                          </div>
                        </div>
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center
                          ${preferences[option.id]
                            ? 'bg-[#FF8600] text-white'
                            : 'bg-white/20 border border-white/30'}
                        `}>
                          {preferences[option.id] && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      </label>
                    </div>
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
                        Door te weten welke producttypes je interessant vindt, kunnen we onze aanbevelingen filteren om alleen relevante items te tonen. Dit is een optionele stap - je kunt ook direct doorgaan naar je resultaten.
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
                    Resultaten bekijken
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

export default PreferencesStep;