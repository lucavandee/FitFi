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
      id: 'smart_casual',
      name: 'Smart Casual',
      description: 'Verfijnde casual stijl met een elegante twist',
      imageUrl: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    },
    {
      id: 'streetstyle',
      name: 'Streetstyle',
      description: 'Stoere, urban look geïnspireerd door straatcultuur',
      imageUrl: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Strakke, tijdloze stijl met focus op eenvoud',
      imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Professionele, formele stijl voor zakelijke omgevingen',
      imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    },
    {
      id: 'boho',
      name: 'Boho',
      description: 'Vrije, artistieke stijl met natuurlijke elementen',
      imageUrl: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    },
    {
      id: 'techwear',
      name: 'Techwear',
      description: 'Functionele, futuristische stijl met technische details',
      imageUrl: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    },
    {
      id: 'y2k',
      name: 'Y2K',
      description: 'Nostalgische stijl geïnspireerd door de vroege 2000s',
      imageUrl: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    },
    {
      id: 'vintage',
      name: 'Vintage',
      description: 'Tijdloze stijl geïnspireerd door het verleden',
      imageUrl: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    }
  ];
  
  // Map style IDs to archetypes
  const styleToArchetype: Record<string, string> = {
    'smart_casual': 'casual_chic',
    'streetstyle': 'streetstyle',
    'minimal': 'urban',
    'business': 'klassiek',
    'boho': 'retro',
    'techwear': 'urban',
    'y2k': 'retro',
    'vintage': 'retro'
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
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B]">
      <div className="container-slim py-16">
        <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>Stap 2 van 4</span>
              <span>50%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: '50%' }}
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
                Wat past het beste bij jouw stijl?
              </h1>
              <p className="text-white/80">
                Kies maximaal twee stijlen die jou het meest aanspreken
              </p>
            </div>

            <div className="glass-card overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {archetypeOptions.map((option) => (
                    <div key={option.id} className="relative">
                      <button
                        type="button"
                        onClick={() => toggleArchetype(option.id)}
                        className={`
                          w-full p-4 rounded-xl border text-left transition-all
                          ${selectedArchetypes.includes(option.id)
                            ? 'border-[#FF8600] bg-white/10'
                            : 'border-white/30 hover:border-white/50 hover:bg-white/5'}
                        `}
                      >
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-3 md:space-y-0 md:space-x-4">
                          <div className="w-full md:w-24 h-24 overflow-hidden rounded-lg">
                            <ImageWithFallback
                              src={option.imageUrl}
                              alt={option.name}
                              className="w-full h-full object-cover"
                              componentName="ArchetypeStep"
                            />
                          </div>
                          <div className="flex-1 text-center md:text-left">
                            <h3 className="font-medium text-white text-lg mb-1">{option.name}</h3>
                            <p className="text-white/70 text-sm">{option.description}</p>
                          </div>
                          <div className="absolute top-4 right-4">
                            <div className={`
                              w-6 h-6 rounded-full flex items-center justify-center
                              ${selectedArchetypes.includes(option.id)
                                ? 'bg-[#FF8600] text-white'
                                : 'bg-white/20 border border-white/30'}
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
                        className="absolute bottom-4 right-4 text-white/50 hover:text-white/80 transition-colors"
                        aria-label="Meer informatie"
                      >
                        <Info size={16} />
                      </button>
                      
                      {showTooltip === option.id && (
                        <div className="absolute bottom-12 right-4 bg-[#0D1B2A] border border-white/20 rounded-lg p-3 shadow-lg z-10 w-64">
                          <p className="text-white/90 text-sm">
                            {option.id === 'smart_casual' && 'Smart Casual combineert comfort met elegantie. Denk aan een nette jeans met een overhemd of een casual blazer met sneakers.'}
                            {option.id === 'streetstyle' && 'Streetstyle is geïnspireerd door urban cultuur met opvallende sneakers, oversized items en statement pieces.'}
                            {option.id === 'minimal' && 'Minimal draait om eenvoud en tijdloosheid. Strakke lijnen, neutrale kleuren en hoogwaardige basics vormen de basis.'}
                            {option.id === 'business' && 'Business stijl is formeel en professioneel. Pakken, blazers, nette broeken en jurken in klassieke kleuren domineren.'}
                            {option.id === 'boho' && 'Boho is vrij en artistiek met natuurlijke materialen, losse silhouetten, prints en handgemaakte details.'}
                            {option.id === 'techwear' && 'Techwear combineert functionaliteit met futuristische esthetiek. Technische materialen, zakken en aanpasbare details staan centraal.'}
                            {option.id === 'y2k' && 'Y2K is een nostalgische stijl uit de vroege 2000s met felle kleuren, glitter, laagjes en opvallende accessoires.'}
                            {option.id === 'vintage' && 'Vintage put inspiratie uit verschillende tijdperken met authentieke of retro-geïnspireerde items die tijdloos zijn.'}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
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
                    disabled={selectedArchetypes.length === 0}
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

export default ArchetypeStep;