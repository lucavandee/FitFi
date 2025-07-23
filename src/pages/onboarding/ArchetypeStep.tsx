import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Palette, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import { useOnboarding } from '../../context/OnboardingContext';

const ArchetypeStep: React.FC = () => {
  const navigate = useNavigate();
  const { data, updateAnswers } = useOnboarding();
  const [selectedArchetypes, setSelectedArchetypes] = useState<string[]>(data.archetypes || []);
  const [errors, setErrors] = useState<{ archetypes?: string }>({});

  const totalSteps = 5;
  const currentStep = 2;

  const archetypes = [
    {
      id: 'klassiek',
      name: 'Klassiek',
      description: 'Tijdloze elegantie en verfijnde stukken',
      image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      tags: ['elegant', 'tijdloos', 'verfijnd']
    },
    {
      id: 'casual_chic',
      name: 'Casual Chic',
      description: 'Moeiteloos elegant met een relaxte twist',
      image: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      tags: ['relaxed', 'comfortabel', 'veelzijdig']
    },
    {
      id: 'urban',
      name: 'Urban',
      description: 'Stoere stadslook met functionele details',
      image: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      tags: ['functioneel', 'praktisch', 'modern']
    },
    {
      id: 'streetstyle',
      name: 'Streetstyle',
      description: 'Authentieke streetwear met attitude',
      image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      tags: ['trendy', 'gedurfd', 'expressief']
    },
    {
      id: 'retro',
      name: 'Retro',
      description: 'Vintage vibes met moderne twist',
      image: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      tags: ['vintage', 'nostalgisch', 'uniek']
    },
    {
      id: 'luxury',
      name: 'Luxury',
      description: 'Exclusieve stukken van topkwaliteit',
      image: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      tags: ['premium', 'exclusief', 'kwaliteit']
    }
  ];

  const handleArchetypeToggle = (archetypeId: string) => {
    setSelectedArchetypes(prev => {
      if (prev.includes(archetypeId)) {
        return prev.filter(id => id !== archetypeId);
      } else {
        // Allow maximum 2 archetypes
        if (prev.length >= 2) {
          return [prev[1], archetypeId]; // Replace first with new selection
        }
        return [...prev, archetypeId];
      }
    });
    
    // Clear errors when user makes selection
    if (errors.archetypes) {
      setErrors({});
    }
  };

  const handleNext = () => {
    // Validate selection
    if (selectedArchetypes.length === 0) {
      setErrors({ archetypes: 'Selecteer minimaal één stijl die bij je past' });
      return;
    }
    
    // Clear errors
    setErrors({});
    
    // Update context
    updateAnswers({
      archetypes: selectedArchetypes
    });
    
    // Track progress
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'onboarding_step_complete', {
        event_category: 'onboarding',
        event_label: 'archetype',
        step: currentStep,
        selected_archetypes: selectedArchetypes.join(','),
        archetype_count: selectedArchetypes.length
      });
    }
    
    // Navigate to next step
    navigate('/onboarding/season');
  };

  const handleBack = () => {
    navigate('/onboarding/gender-name');
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
            <Palette className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-secondary mb-2">
              Welke stijl spreekt je aan?
            </h1>
            <p className="text-body">
              Kies maximaal 2 stijlen die het beste bij jouw persoonlijkheid passen
            </p>
          </motion.div>

          <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {archetypes.map((archetype) => {
                const isSelected = selectedArchetypes.includes(archetype.id);
                
                return (
                  <motion.button
                    key={archetype.id}
                    onClick={() => handleArchetypeToggle(archetype.id)}
                    className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-secondary ring-2 ring-secondary/20'
                        : 'border-gray-300 hover:border-secondary'
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <div className="aspect-[3/4] relative">
                      <img 
                        src={archetype.image} 
                        alt={archetype.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                          <span className="text-primary text-sm font-bold">✓</span>
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-lg font-bold mb-1">{archetype.name}</h3>
                        <p className="text-sm opacity-90 mb-2">{archetype.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {archetype.tags.map((tag, index) => (
                            <span key={index} className="text-xs bg-white/20 px-2 py-1 rounded-full">
                              {tag}
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
                {selectedArchetypes.length === 0 && 'Selecteer 1-2 stijlen die bij je passen'}
                {selectedArchetypes.length === 1 && 'Je kunt nog 1 stijl selecteren (optioneel)'}
                {selectedArchetypes.length === 2 && 'Perfect! Je hebt 2 stijlen geselecteerd'}
              </p>
            </div>

            {errors.archetypes && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errors.archetypes}</p>
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
                disabled={selectedArchetypes.length === 0}
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

export default ArchetypeStep;