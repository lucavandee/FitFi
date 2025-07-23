import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { data, updateAnswers } = useOnboarding();
  
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
    
    // Update answers
    updateAnswers({
      archetypes
    });
    
    // Navigate to next step
    navigate('/onboarding/season');
  };
  
  return (
    <div className="min-h-screen bg-primary">
      <div className="section-wrapper space-y-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
          <div>
            <div className="flex justify-between text-sm text-body mb-2">
              <span>Stap 2 van 3</span>
              <span>66%</span>
            </div>
            <div className="w-full bg-primary-light rounded-full h-2">
              <div
                className="bg-secondary h-2 rounded-full transition-all"
                style={{ width: '66%' }}
              ></div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-secondary mb-6">
                Wat past het beste bij jouw stijl?
              </h1>
              <p className="text-base leading-relaxed text-body">
                Kies maximaal twee stijlen die jou het meest aanspreken
              </p>
            </div>

            <div className="card overflow-hidden">
              <form onSubmit={handleSubmit}>
                <div className="grid-layout mb-6">
                  {archetypeOptions.map((option) => (
                    <div key={option.id} className="relative">
                      <button
                        type="button"
                        onClick={() => toggleArchetype(option.id)}
                        className={`
                          w-full p-4 rounded-2xl border text-left transition-all focus:outline-none focus:ring-2 focus:ring-secondary
                          ${selectedArchetypes.includes(option.id)
                            ? 'border-secondary bg-secondary/10'
                            : 'border-primary-light hover:border-secondary hover:bg-secondary/5'}
                        `}
                      >
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-3 md:space-y-0 md:space-x-4">
                          <div className="w-full md:w-20 h-20 overflow-hidden rounded-2xl shadow-md">
                            <ImageWithFallback
                              src={option.imageUrl}
                              alt={option.name}
                              className="w-full h-full object-cover"
                              componentName="ArchetypeStep"
                            />
                          </div>
                          <div className="flex-1 text-center md:text-left">
                            <h3 className="font-semibold text-text-dark text-lg mb-2">{option.name}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{option.description}</p>
                          </div>
                          <div className="absolute top-4 right-4">
                            <div className={`
                              w-6 h-6 rounded-full flex items-center justify-center
                              ${selectedArchetypes.includes(option.id)
                                ? 'bg-secondary text-white'
                                : 'bg-white border border-gray-300'}
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
                        className="absolute bottom-4 right-4 text-gray-500 hover:text-text-dark transition-colors focus:outline-none focus:ring-2 focus:ring-secondary rounded-full p-1"
                        aria-label="Meer informatie"
                      >
                        <Info size={16} />
                      </button>
                      
                      {showTooltip === option.id && (
                        <div className="absolute bottom-12 right-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-lg z-10 w-64">
                          <p className="text-gray-600 text-sm">
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
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/onboarding/gender-name')}
                    icon={<ArrowLeft size={18} />}
                    iconPosition="left"
                    className="flex-1 bg-primary text-secondary border border-secondary py-3 px-6 rounded-full font-medium hover:bg-primary-light hover:text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                  >
                    Terug
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<ArrowRight size={18} />}
                    iconPosition="right"
                    className="flex-1 bg-secondary text-primary py-4 px-8 rounded-full font-medium text-lg shadow-lg hover:bg-secondary/90 focus:outline-none focus:ring-4 focus:ring-secondary/50 transition-all"
                    disabled={selectedArchetypes.length === 0}
                  >
                    Volgende
                  </Button>
                </div>
              </form>

              {/* Privacy indicator */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-center space-x-2">
                <ShieldCheck size={18} className="text-secondary" />
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