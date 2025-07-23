import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useOnboarding } from '../../context/OnboardingContext';
import { motion } from 'framer-motion';

import { useNavigate } from 'react-router-dom';

const OccasionStep: React.FC = () => {
  const { data, updateData, completeStep, goToNextStep, goToPreviousStep } = useOnboarding();
  const navigate = useNavigate();
  
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(
    data.occasions || []
  );
  
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Track when the component is mounted
  useEffect(() => {
    // Track step view in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_step_view', {
        event_category: 'questionnaire',
        event_label: 'occasion',
        step_name: 'occasion'
      });
    }
  }, []);
  
  const occasionOptions = [
    {
      id: 'werk',
      name: 'Werk',
      icon: '💼',
      description: 'Professionele outfits voor op kantoor'
    },
    {
      id: 'casual',
      name: 'Casual',
      icon: '☕',
      description: 'Ontspannen outfits voor dagelijks gebruik'
    },
    {
      id: 'date',
      name: 'Date',
      icon: '💕',
      description: 'Stijlvolle outfits voor romantische gelegenheden'
    },
    {
      id: 'feest',
      name: 'Feest',
      icon: '🎉',
      description: 'Opvallende outfits voor speciale gelegenheden'
    },
    {
      id: 'sport',
      name: 'Sport',
      icon: '🏃‍♀️',
      description: 'Functionele outfits voor actieve momenten'
    },
    {
      id: 'vakantie',
      name: 'Vakantie',
      icon: '✈️',
      description: 'Veelzijdige outfits voor op reis'
    }
  ];
  
  const toggleOccasion = (id: string) => {
    setSelectedOccasions(prev => {
      // If already selected, remove it
      if (prev.includes(id)) {
        return prev.filter(o => o !== id);
      }
      
      // Otherwise, add it
      return [...prev, id];
    });
    
    // Clear error if any
    if (error) {
      setError(null);
    }
    
    // Track occasion selection
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'occasion_selection', {
        event_category: 'questionnaire',
        event_label: id,
        occasion: id
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedOccasions.length === 0) {
      setError('Selecteer minimaal 1 gelegenheid');
      return;
    }
    
    console.log('[FIX] OccasionStep: Final step completed, preparing data for results');
    
    // Prepare complete onboarding data
    const completeData = {
      ...data,
      occasions: selectedOccasions
    };
    
    console.log('[FIX] Complete onboarding data:', completeData);
    
    // Update data without persistence to prevent loops
    updateData({
      occasions: selectedOccasions,
      _skipSave: true
    });
    
    // Mark step as completed
    completeStep('occasion');
    
    // Direct navigation to results with complete data
    console.log('[FIX] Navigating directly to results page');
    navigate('/results', { 
      state: { 
        onboardingData: completeData,
        answers: completeData // Provide both formats for compatibility
      },
      replace: true // Replace history to prevent back button issues
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B]">
      <div className="container-slim py-16">
        <div className="max-w-md mx-auto">
          {/* Progress indicator */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>Stap 4 van 4</span>
              <span>100%</span>
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
                Waar wil je deze outfits dragen?
              </h1>
              <p className="text-white/80">
                Selecteer alle gelegenheden waarvoor je outfits zoekt
              </p>
            </div>

            <div className="glass-card overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {occasionOptions.map((occasion) => (
                    <button
                      key={occasion.id}
                      type="button"
                      onClick={() => toggleOccasion(occasion.id)}
                      className={`
                        p-4 rounded-xl border text-center transition-all
                        ${selectedOccasions.includes(occasion.id)
                          ? 'border-[#FF8600] bg-white/10'
                          : 'border-white/30 hover:border-white/50 hover:bg-white/5'}
                      `}
                    >
                      <div className="text-3xl mb-2">{occasion.icon}</div>
                      <div className="font-medium text-white">{occasion.name}</div>
                      <div className="text-xs text-white/70">{occasion.description}</div>
                    </button>
                  ))}
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                
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
                        Verschillende gelegenheden vragen om verschillende outfits. Door te weten waar je de kleding wilt dragen, kunnen we outfits samenstellen die perfect passen bij die specifieke situaties.
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

export default OccasionStep;