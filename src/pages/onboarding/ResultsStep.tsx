import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Heart, ShoppingBag, Star } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useOnboarding } from '../../context/OnboardingContext';
import { motion } from 'framer-motion';
import { useNavigationService } from '../../services/NavigationService';
import ImageWithFallback from '../../components/ui/ImageWithFallback';

const ResultsStep: React.FC = () => {
  const { data, submitOnboarding, isSubmitting, goToPreviousStep } = useOnboarding();
  const navigationService = useNavigationService();
  const [isLoading, setIsLoading] = useState(true);
  
  // Track when the component is mounted
  useEffect(() => {
    // Track step view in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_step_view', {
        event_category: 'questionnaire',
        event_label: 'results',
        step_name: 'results'
      });
    }
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get primary archetype
  const primaryArchetype = data.archetypes?.[0] || 'casual_chic';
  
  // Get archetype display name
  const getArchetypeName = (archetype: string): string => {
    const archetypeNames: Record<string, string> = {
      'urban': 'Modern Minimalist',
      'casual_chic': 'Casual Chic',
      'klassiek': 'Klassiek Elegant',
      'streetstyle': 'Streetstyle',
      'retro': 'Retro'
    };
    
    return archetypeNames[archetype] || 'Casual Chic';
  };
  
  // Get archetype percentage
  const getArchetypePercentage = (archetype: string, index: number): number => {
    if (index === 0) return 80;
    if (index === 1) return 20;
    return 0;
  };
  
  // Get archetype color
  const getArchetypeColor = (archetype: string): string => {
    const archetypeColors: Record<string, string> = {
      'urban': '#bfae9f',
      'casual_chic': '#0ea5e9',
      'klassiek': '#8b5cf6',
      'streetstyle': '#f97316',
      'retro': '#ec4899'
    };
    
    return archetypeColors[archetype] || '#bfae9f';
  };
  
  // Get archetype description
  const getArchetypeDescription = (archetype: string): string => {
    const archetypeDescriptions: Record<string, string> = {
      'urban': 'Je houdt van strakke lijnen, neutrale kleuren en tijdloze stukken die veelzijdig te combineren zijn.',
      'casual_chic': 'Je combineert comfort met stijl, met een voorkeur voor moeiteloze elegantie en veelzijdige items.',
      'klassiek': 'Je waardeert tijdloze elegantie, hoogwaardige materialen en verfijnde details in je kleding.',
      'streetstyle': 'Je hebt een expressieve stijl met invloeden uit urban cultuur, gedurfde combinaties en statement pieces.',
      'retro': 'Je houdt van vintage-geïnspireerde stukken met een moderne twist, unieke items en nostalgische elementen.'
    };
    
    return archetypeDescriptions[archetype] || 'Je hebt een veelzijdige stijl die verschillende elementen combineert.';
  };
  
  // Mock outfits based on archetype
  const getOutfits = (archetype: string) => {
    const outfits = [
      {
        id: 'outfit-1',
        title: 'Casual Chic Look',
        description: 'Een moeiteloze combinatie van comfort en stijl, perfect voor dagelijks gebruik.',
        imageUrl: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
        matchPercentage: 92,
        tags: ['casual', 'comfortable', 'everyday', 'minimal']
      },
      {
        id: 'outfit-2',
        title: 'Business Casual',
        description: 'Professioneel maar comfortabel, perfect voor kantoor of zakelijke afspraken.',
        imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
        matchPercentage: 88,
        tags: ['business', 'professional', 'smart', 'elegant']
      }
    ];
    
    return outfits;
  };
  
  // Mock individual items
  const getItems = () => {
    return [
      {
        id: 'item-1',
        name: 'Oversized Cotton Shirt',
        brand: 'COS',
        price: 59.95,
        imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2'
      },
      {
        id: 'item-2',
        name: 'High Waist Mom Jeans',
        brand: 'Levi\'s',
        price: 99.95,
        imageUrl: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2'
      },
      {
        id: 'item-3',
        name: 'White Sneakers',
        brand: 'Adidas',
        price: 89.95,
        imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2'
      }
    ];
  };
  
  // Get outfits and items
  const outfits = getOutfits(primaryArchetype);
  const items = getItems();
  
  // Handle submit
  const handleSubmit = async () => {
    console.log('[ResultsStep] Submit clicked, calling submitOnboarding');
    try {
      await submitOnboarding();
    } catch (error) {
      console.error('[ResultsStep] Error submitting onboarding:', error);
      // Use navigation service for fallback
      await navigationService.navigateToEnhancedResults(data, {
        loadingMessage: 'Proberen opnieuw...',
        fallbackRoute: '/onboarding',
        onError: () => {
          // Last resort
          window.location.href = '/results';
        }
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-turquoise border-t-transparent rounded animate-spin mx-auto mb-6"></div>
          <h2 className="text-h2 font-bold text-text-primary mb-3 font-display">
            Je stijlprofiel wordt gemaakt...
          </h2>
          <p className="text-text-secondary">
            Onze AI analyseert je voorkeuren
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-light-grey">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-text-secondary mb-2">
              <span>Stap 3 van 3</span>
              <span>100%</span>
            </div>
            <div className="h-1.5 bg-light-grey/50 rounded overflow-hidden">
              <div
                className="h-full bg-turquoise rounded transition-all duration-300"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-h1 font-bold text-textPrimary mb-3 font-display">
                Jouw persoonlijke stijlprofiel
              </h1>
              <p className="text-text-secondary">
                Op basis van je voorkeuren hebben we een uniek stijlprofiel voor je gemaakt
              </p>
            </div>

            {/* Style Profile */}
            <div className="bg-white rounded shadow-sm border border-light-grey overflow-hidden mb-10">
              <div className="p-8">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 mb-8 md:mb-0 flex justify-center">
                    <div className="relative w-64 h-64">
                      {/* Circular chart */}
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Background circle */}
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#E6E6E6" strokeWidth="10" />
                        
                        {/* Primary archetype segment - 80% */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke={getArchetypeColor(data.archetypes?.[0] || 'urban')} 
                          strokeWidth="10" 
                          strokeDasharray="282.6, 353.25" 
                          strokeDashoffset="0" 
                          transform="rotate(-90 50 50)" 
                        />
                        
                        {/* Secondary archetype segment - 20% */}
                        {data.archetypes?.[1] && (
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="45" 
                            fill="none" 
                            stroke={getArchetypeColor(data.archetypes[1])} 
                            strokeWidth="10" 
                            strokeDasharray="70.65, 353.25" 
                            strokeDashoffset="-282.6" 
                            transform="rotate(-90 50 50)" 
                          />
                        )}
                        
                        {/* Center text */}
                        <text x="50" y="45" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">
                          Jouw Stijlprofiel
                        </text>
                        <text x="50" y="60" textAnchor="middle" fontSize="10" fill="#666">
                          {getArchetypeName(data.archetypes?.[0] || 'urban')}
                        </text>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="md:w-1/2">
                    <h3 className="font-bold text-text-primary text-xl mb-6">
                      Jouw stijlmix
                    </h3>
                    
                    <div className="space-y-6">
                      {data.archetypes?.map((archetype, index) => (
                        <div key={archetype}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-text-primary">{getArchetypeName(archetype)}</span>
                            <span className="text-text-secondary">{getArchetypePercentage(archetype, index)}%</span>
                          </div>
                          <div className="w-full bg-light-grey/50 rounded h-1.5">
                            <div 
                              className="h-1.5 rounded" 
                              style={{ 
                                width: `${getArchetypePercentage(archetype, index)}%`,
                                backgroundColor: getArchetypeColor(archetype)
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 p-6 bg-turquoise/10 rounded text-sm text-textSecondary">
                      <p>
                        <strong>{getArchetypeName(data.archetypes?.[0] || 'urban')}:</strong> {getArchetypeDescription(data.archetypes?.[0] || 'urban')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Outfit Recommendations */}
            <div className="bg-white rounded shadow-sm border border-light-grey overflow-hidden mb-10">
              <div className="p-8">
                <h3 className="font-bold text-text-primary text-xl mb-8">
                  Outfits voor jou
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {outfits.map((outfit) => (
                    <div key={outfit.id} className="bg-light-grey rounded overflow-hidden shadow-sm border border-light-grey">
                      <div className="relative">
                        <ImageWithFallback 
                          src={outfit.imageUrl} 
                          alt={outfit.title}
                          className="w-full h-64 object-cover"
                          componentName="ResultsStep"
                        />
                        <div className="absolute top-4 left-4 bg-white/90 text-turquoise px-4 py-2 rounded text-sm font-bold flex items-center">
                          <Star size={14} className="mr-1" />
                          {outfit.matchPercentage}% Match
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="font-bold text-text-primary mb-2">{outfit.title}</h4>
                        <p className="text-text-secondary text-sm mb-4">
                          {outfit.description}
                        </p>
                        
                        <div className="flex space-x-2 mb-6">
                          {outfit.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-light-grey text-text-secondary rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<ShoppingBag size={16} />}
                            iconPosition="left"
                            className="flex-1"
                          >
                            Bekijk outfit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Heart size={16} />}
                            iconPosition="left"
                            className="w-10 h-10 p-0 flex items-center justify-center border border-light-grey hover:bg-light-grey"
                            aria-label="Opslaan"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Individual Items */}
            <div className="bg-white rounded shadow-sm border border-light-grey overflow-hidden mb-10">
              <div className="p-8">
                <h3 className="font-bold text-text-primary text-xl mb-8">
                  Individuele items voor jou
                </h3>
                
                <div className="grid grid-cols-3 gap-6">
                  {items.map((item) => (
                    <div key={item.id} className="bg-light-grey rounded overflow-hidden border border-light-grey">
                      <div className="aspect-square">
                        <ImageWithFallback 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                          componentName="ResultsStep"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-text-primary text-sm truncate">{item.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm text-text-secondary">€{item.price.toFixed(2)}</p>
                          <button className="text-turquoise hover:text-turquoise-dark">
                            <ShoppingBag size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="ghost"
                onClick={goToPreviousStep}
                icon={<ArrowLeft size={18} />}
                iconPosition="left"
                className="flex-1 text-text-secondary border border-light-grey hover:bg-light-grey"
              >
                Terug
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Even geduld...' : 'Ontdek al je aanbevelingen'}
              </Button>
            </div>

            {/* Privacy indicator */}
            <div className="mt-8 bg-light-grey rounded p-6 flex items-center justify-center space-x-2">
              <ShieldCheck size={18} className="text-turquoise" />
              <span className="text-sm text-text-secondary">Je gegevens zijn veilig en versleuteld</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResultsStep;