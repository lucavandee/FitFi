import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Info } from 'lucide-react';
import Button from './ui/Button';
import OutfitCard from './ui/OutfitCard';
import { Outfit } from '../engine';
import { generateOutfitExplanation } from '../engine/explainOutfit';
import { getOutfits, getBoltProducts } from '../services/DataRouter';
import { UserProfile } from '../context/UserContext';
import outfitGenerator from '../services/outfitGenerator';
import { BoltProduct } from '../types/BoltProduct';

interface StylePreviewProps {
  archetype: string;
  season?: string;
  userName?: string;
}

const StylePreviewSection: React.FC<StylePreviewProps> = ({
  archetype,
  season,
  userName
}) => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Touch handling for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    const fetchOutfits = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Create a mock user with the specified archetype
        const mockUser: UserProfile = {
          id: 'preview-user',
          name: userName || 'Stijlzoeker',
          email: 'preview@fitfi.ai',
          gender: 'female',
          stylePreferences: {
            casual: archetype === 'casual_chic' ? 5 : 3,
            formal: archetype === 'klassiek' ? 5 : 3,
            sporty: archetype === 'streetstyle' ? 5 : 3,
            vintage: archetype === 'retro' ? 5 : 3,
            minimalist: archetype === 'urban' ? 5 : 3,
          },
          isPremium: false,
          savedRecommendations: []
        };
        
        // Try to get BoltProducts first
        const boltProducts = await getBoltProducts();
        
        if (boltProducts && boltProducts.length > 0) {
          console.log(`[StylePreviewSection] Using ${boltProducts.length} BoltProducts to generate outfits`);
          
          // Generate outfits from BoltProducts
          const generatedOutfits = outfitGenerator.generateOutfitsFromBoltProducts(
            boltProducts,
            archetype,
            mockUser.gender === 'male' ? 'male' : 'female',
            3
          );
          
          if (generatedOutfits && generatedOutfits.length > 0) {
            setOutfits(generatedOutfits);
            
            // Track style preview view in analytics
            if (typeof window.gtag === 'function') {
              window.gtag('event', 'style_preview_view', {
                event_category: 'engagement',
                event_label: archetype,
                archetype: archetype,
                season: season || 'current',
                outfits_count: generatedOutfits.length,
                source: 'bolt'
              });
            }
            
            setLoading(false);
            return;
          }
        }
        
        // If BoltProducts failed, use DataRouter
        const fetchedOutfits = await getOutfits(mockUser, {
          count: 3,
          preferredSeasons: season ? [season as any] : undefined,
          variationLevel: 'high'
        });
        
        // Track style preview view in analytics
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'style_preview_view', {
            event_category: 'engagement',
            event_label: archetype,
            archetype: archetype,
            season: season || 'current',
            outfits_count: fetchedOutfits.length
          });
        }
        
        setOutfits(fetchedOutfits);
      } catch (err) {
        console.error('Error fetching preview outfits:', err);
        setError('Er is een fout opgetreden bij het laden van de outfits.');
        
        // Use fallback outfits
        setOutfits(getFallbackOutfits(archetype));
      } finally {
        setLoading(false);
      }
    };
    
    fetchOutfits();
  }, [archetype, season, userName]);
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      
      // Track swipe in analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'style_preview_swipe', {
          event_category: 'engagement',
          event_label: 'previous',
          direction: 'left',
          archetype: archetype
        });
      }
    }
  };
  
  const handleNext = () => {
    if (currentIndex < outfits.length - 1) {
      setCurrentIndex(currentIndex + 1);
      
      // Track swipe in analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'style_preview_swipe', {
          event_category: 'engagement',
          event_label: 'next',
          direction: 'right',
          archetype: archetype
        });
      }
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentIndex < outfits.length - 1) {
      handleNext();
    } else if (isRightSwipe && currentIndex > 0) {
      handlePrevious();
    }
  };
  
  const handleStartQuiz = () => {
    // Track CTA click in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'style_preview_cta_click', {
        event_category: 'conversion',
        event_label: 'start_quiz',
        archetype: archetype
      });
    }
    
    // Navigate to quiz
    navigate('/onboarding');
  };
  
  // Get fallback outfits if API fails
  const getFallbackOutfits = (archetype: string): Outfit[] => {
    const fallbackOutfits: Outfit[] = [];
    
    // Create 3 fallback outfits
    for (let i = 0; i < 3; i++) {
      fallbackOutfits.push({
        id: `fallback-${archetype}-${i}`,
        title: `${getArchetypeName(archetype)} Look ${i + 1}`,
        description: `Een ${getArchetypeName(archetype).toLowerCase()} outfit voor dagelijks gebruik.`,
        archetype: archetype,
        occasion: i === 0 ? 'Casual' : i === 1 ? 'Werk' : 'Weekend',
        products: [],
        imageUrl: `https://images.pexels.com/photos/${2905238 + i}/pexels-photo-${2905238 + i}.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2`,
        tags: [archetype, 'preview', 'fallback'],
        matchPercentage: 85 + i * 5,
        explanation: `Deze ${getArchetypeName(archetype).toLowerCase()} outfit past perfect bij jouw stijlvoorkeuren en is ideaal voor dagelijks gebruik.`,
        season: season as any || 'autumn',
        completeness: 90
      });
    }
    
    return fallbackOutfits;
  };
  
  // Helper function to get a readable archetype name
  const getArchetypeName = (archetypeId: string): string => {
    const archetypeNames: Record<string, string> = {
      'klassiek': 'Klassiek',
      'casual_chic': 'Casual Chic',
      'urban': 'Urban',
      'streetstyle': 'Streetstyle',
      'retro': 'Retro',
      'luxury': 'Luxury'
    };
    
    return archetypeNames[archetypeId] || archetypeId;
  };

  return (
    <section className="py-12 bg-gradient-to-b from-[#0D1B2A] to-[#1B263B]">
      <div className="container-slim">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {getArchetypeName(archetype)} Stijl Inspiratie
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Ontdek outfits die perfect passen bij jouw {getArchetypeName(archetype).toLowerCase()} stijlvoorkeuren
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="w-12 h-12 border-4 border-[#FF8600] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="glass-card p-8 text-center">
            <p className="text-white/80 mb-4">{error}</p>
            <Button 
              variant="primary"
              onClick={() => window.location.reload()}
            >
              Probeer opnieuw
            </Button>
          </div>
        ) : outfits.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-white/80 mb-4">Geen outfits gevonden voor deze stijl.</p>
            <Button 
              variant="primary"
              onClick={handleStartQuiz}
            >
              Doe de stijlquiz
            </Button>
          </div>
        ) : (
          <>
            {/* Carousel */}
            <div className="relative mb-8">
              {/* Navigation buttons */}
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#0D1B2A]/80 text-white rounded-full p-3 shadow-lg ${
                  currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0D1B2A] transition-colors'
                }`}
                aria-label="Vorige outfit"
              >
                <ArrowLeft size={24} />
              </button>
              
              <button
                onClick={handleNext}
                disabled={currentIndex === outfits.length - 1}
                className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#0D1B2A]/80 text-white rounded-full p-3 shadow-lg ${
                  currentIndex === outfits.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0D1B2A] transition-colors'
                }`}
                aria-label="Volgende outfit"
              >
                <ArrowRight size={24} />
              </button>
              
              {/* Carousel container */}
              <div 
                ref={carouselRef}
                className="overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {outfits.map((outfit, index) => (
                    <div key={outfit.id} className="w-full flex-shrink-0 px-4">
                      <div className="max-w-lg mx-auto">
                        <OutfitCard 
                          outfit={outfit}
                          user={{ 
                            id: 'preview-user',
                            name: userName || 'Stijlzoeker',
                            email: 'preview@fitfi.ai',
                            gender: 'female',
                            stylePreferences: {
                              casual: 3,
                              formal: 3,
                              sporty: 3,
                              vintage: 3,
                              minimalist: 3
                            },
                            isPremium: false,
                            savedRecommendations: []
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Dots indicator */}
              <div className="flex justify-center mt-4 space-x-2">
                {outfits.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`
                      w-3 h-3 rounded-full transition-all duration-300
                      ${index === currentIndex 
                        ? 'bg-[#FF8600] scale-110' 
                        : 'bg-white/30 hover:bg-white/50'}
                    `}
                    aria-label={`Ga naar outfit ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            
            {/* CTA Section */}
            <div className="bg-[#0ea5e9]/10 rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-3">
                Wil jij je eigen stijl ontdekken?
              </h3>
              <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                Doe de stijlquiz en krijg persoonlijke outfits die perfect bij jou passen.
              </p>
              <Button 
                variant="primary"
                size="lg"
                onClick={handleStartQuiz}
                icon={<ArrowRight size={20} />}
                iconPosition="right"
              >
                Doe de stijlquiz
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default StylePreviewSection;