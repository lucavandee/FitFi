import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Info, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useOnboarding } from '../../context/OnboardingContext';
import { motion } from 'framer-motion';
import ImageWithFallback from '../../components/ui/ImageWithFallback';

interface ArchetypeOption {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

const ArchetypeStep: React.FC = () => {
  const { data, updateData, completeStep, goToNextStep, goToPreviousStep } = useOnboarding();
  
  const [selectedArchetypes, setSelectedArchetypes] = useState<string[]>(
    data.archetypes || []
  );
  
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  // Track when the component is mounted
  useEffect(() => {
    // Track step view in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_step_view', {
        event_category: 'questionnaire',
        event_label: 'archetype',
        step_name: 'archetype'
      });
    }
  }, []);
  
  const archetypeOptions: ArchetypeOption[] = [
    {
      id: 'modern_minimalist',
      name: 'Modern Minimalist',
      description: 'Strakke lijnen, neutrale kleuren en tijdloze stukken',
      imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    },
    {
      id: 'casual_chic',
      name: 'Casual Chic',
      description: 'Moeiteloze elegantie met een relaxte twist',
      imageUrl: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    },
    {
      id: 'business_casual',
      name: 'Business Casual',
      description: 'Professioneel maar comfortabel voor kantoor',
      imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    },
    {
      id: 'streetstyle',
      name: 'Streetstyle',
      description: 'Authentieke streetwear met attitude',
      imageUrl: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    },
    {
      id: 'classic_elegant',
      name: 'Klassiek Elegant',
      description: 'Tijdloze elegantie en verfijnde details',
      imageUrl: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    },
    {
      id: 'urban_sporty',
      name: 'Urban Sporty',
      description: 'Sportieve elementen met een stadse twist',
      imageUrl: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    }
  ];
  
  // Map style IDs to archetypes
  const styleToArchetype: Record<string, string> = {
    'modern_minimalist': 'urban',
    'casual_chic': 'casual_chic',
    'business_casual': 'klassiek',
    'streetstyle': 'streetstyle',
    'classic_elegant': 'klassiek',
    'urban_sporty': 'urban'
  };
  
  const toggleArchetype = (id: string) => {
    setSelectedArchetypes(prev => {
      // If already selected, remove it
      if (prev.includes(id)) {
        return prev.filter(a => a !== id);
      }
      
      // If not selected and we already have 2, show error
      if (prev.length >= 2) {
        setError('Je kunt maximaal 2 stijlen selecteren');
        return prev;
      }
      
      // Otherwise, add it
      setError(null);
      return [...prev, id];
    });
    
    // Track archetype selection
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'archetype_selection', {
        event_category: 'questionnaire',
        event_label: id,
        archetype: id
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedArchetypes.length === 0) {
      setError('Selecteer minimaal 1 stijl');
      return;
    }
    
    // Map selected styles to archetypes
    const archetypes = selectedArchetypes.map(style => styleToArchetype[style]);
    
    // Update onboarding data
    updateData({
      archetypes
    });
    
    // Mark step as completed
    completeStep('archetype');
    
    // Go to next step
    goToNextStep();
  };
  
  return (
    <div className="min-h-screen bg-[#FAF8F6]">
      <div className="container-slim py-16">
        <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Stap 2 van 3</span>
              <span>66%</span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#bfae9f] rounded-full transition-all duration-300"
                style={{ width: '66%' }}
              ></div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">
                Wat past het beste bij jouw stijl?
              </h1>
              <p className="text-gray-600">
                Kies maximaal twee stijlen die jou het meest aanspreken
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {archetypeOptions.map((option) => (
                    <div key={option.id} className="relative">
                      <button
                        type="button"
                        onClick={() => toggleArchetype(option.id)}
                        className={`
                          w-full p-4 rounded-xl border text-left transition-all
                          ${selectedArchetypes.includes(option.id)
                            ? 'border-[#bfae9f] bg-[#bfae9f]/5'
                            : 'border-gray-200 hover:border-[#bfae9f]/50 hover:bg-[#bfae9f]/5'}
                        `}
                      >
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-3 md:space-y-0 md:space-x-4">
                          <div className="w-full md:w-24 h-24 overflow-hidden rounded-lg shadow-md">
                            <ImageWithFallback
                              src={option.imageUrl}
                              alt={option.name}
                              className="w-full h-full object-cover"
                              componentName="ArchetypeStep"
                            />
                          </div>
                          <div className="flex-1 text-center md:text-left">
                            <h3 className="font-medium text-gray-900 text-lg mb-1">{option.name}</h3>
                            <p className="text-gray-600 text-sm">{option.description}</p>
                          </div>
                          <div className="absolute top-4 right-4">
                            <div className={`
                              w-6 h-6 rounded-full flex items-center justify-center
                              ${selectedArchetypes.includes(option.id)
                                ? 'bg-[#bfae9f] text-white'
                                : 'bg-gray-100 border border-gray-200'}
                            `}>
                              {selectedArchetypes.includes(option.id) && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setShowTooltip(showTooltip === option.id ? null : option.id)}
                        className="absolute bottom-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Meer informatie"
                      >
                        <Info size={16} />
                      </button>
                      
                      {showTooltip === option.id && (
                        <div className="absolute bottom-12 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-10 w-64">
                          <p className="text-gray-700 text-sm">
                            {option.id === 'modern_minimalist' && 'Modern Minimalist combineert strakke lijnen met neutrale kleuren. Denk aan tijdloze stukken die veelzijdig te combineren zijn en een clean uitstraling hebben.'}
                            {option.id === 'casual_chic' && 'Casual Chic balanceert comfort met elegantie. Denk aan premium basics met subtiele details die moeiteloos stijlvol zijn voor dagelijks gebruik.'}
                            {option.id === 'business_casual' && 'Business Casual is professioneel maar comfortabel. Denk aan nette broeken of rokken gecombineerd met casual tops, perfect voor kantoor of zakelijke afspraken.'}
                            {option.id === 'streetstyle' && 'Streetstyle is geïnspireerd door urban cultuur. Denk aan opvallende sneakers, oversized items en statement pieces die je persoonlijkheid laten zien.'}
                            {option.id === 'classic_elegant' && 'Klassiek Elegant draait om tijdloze stukken met verfijnde details. Denk aan hoogwaardige materialen en silhouetten die nooit uit de mode raken.'}
                            {option.id === 'urban_sporty' && 'Urban Sporty combineert sportieve elementen met stadse stijl. Denk aan functionele items met een moderne twist, perfect voor een actieve levensstijl.'}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={goToPreviousStep}
                    icon={<ArrowLeft size={18} />}
                    iconPosition="left"
                    className="flex-1 text-gray-700 border border-gray-200 hover:bg-gray-50"
                  >
                    Terug
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<ArrowRight size={18} />}
                    iconPosition="right"
                    className="flex-1 bg-[#bfae9f] hover:bg-[#a89a8c]"
                    disabled={selectedArchetypes.length === 0}
                  >
                    Volgende
                  </Button>
                </div>
              </form>

              {/* Privacy indicator */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-center space-x-2">
                <ShieldCheck size={18} className="text-[#bfae9f]" />
                <span className="text-sm text-gray-600">Je gegevens zijn veilig en versleuteld</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ArchetypeStep;