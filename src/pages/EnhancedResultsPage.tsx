import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { 
  Heart, 
  Share2, 
  ShoppingBag, 
  Sparkles, 
  Bookmark,
  BookmarkCheck,
  Star,
  Clock,
  Zap,
  Award,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  RotateCw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { useGamification } from '../context/GamificationContext';
import { DUTCH_ARCHETYPES, mapAnswersToArchetype, getArchetypeById } from '../config/profile-mapping.js';
import curatedProducts from '../config/curated-products.json';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import { getOutfits, getRecommendedProducts } from '../services/DataRouter';
import { getSafeUser } from '../utils/userUtils';
import { env } from '../utils/env';
import toast from 'react-hot-toast';
import { generateSmartDefaults } from '../utils/smartDefaults';
import { quickRetry, smartRetry, progressiveRetry, analyzeMissingData } from '../utils/quickRetry';
import DevDataPanel from '../components/DevDataPanel';
import OutfitCard from '../components/ui/OutfitCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Outfit {
  id: string;
  title: string;
  description: string;
  matchPercentage: number;
  imageUrl: string;
  items: {
    id: string;
    name: string;
    brand: string;
    price: number;
    imageUrl: string;
    url: string;
    retailer: string;
    category: string;
  }[];
  tags: string[];
  occasions: string[];
  explanation: string;
  archetype?: string;
  secondaryArchetype?: string;
  mixFactor?: number;
  season?: string;
  weather?: string;
  structure?: string[];
  categoryRatio?: Record<string, number>;
  completeness?: number;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  url: string;
  retailer: string;
  category: string;
  rating?: number;
  inStock?: boolean;
}

interface PsychographicProfile {
  type: string;
  title: string;
  description: string;
  characteristics: string[];
  styleKeywords: string[];
  motivationalMessage: string;
  icon: string;
}

interface LoadingStep {
  id: string;
  label: string;
  completed: boolean;
}

const EnhancedResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, saveRecommendation } = useUser();
  const { viewRecommendation, saveOutfit } = useGamification();
  
  // State management
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [psychographicProfile, setPsychographicProfile] = useState<PsychographicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<string[]>([]);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);

  // Get data from location state
  const quizAnswers = location.state?.answers || location.state?.onboardingData || {};
  const safeUser = getSafeUser(user);
  
  // Enhanced user data with season and occasion
  const enhancedUser = {
    ...safeUser,
    season: quizAnswers.season || 'herfst',
    occasion: Array.isArray(quizAnswers.occasion) ? quizAnswers.occasion[0] : (quizAnswers.occasion || 'Casual'),
    occasions: Array.isArray(quizAnswers.occasion) ? quizAnswers.occasion : [quizAnswers.occasion || 'Casual']
  };
  
  // Single initialization effect - no dependencies to prevent loops
  useEffect(() => {
    const initializeResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Analytics tracking
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'page_view', {
            page_title: 'Enhanced Results Page',
            page_location: window.location.href
          });
        }
        
        // Analyze profile
        const profile = analyzePsychographicProfile(quizAnswers);
        setPsychographicProfile(profile);
        
        // Load outfits
        const outfitData = await getOutfits(safeUser, { count: 3 });
        setOutfits(outfitData || []);
        
        // Load products
        const productData = await getRecommendedProducts(safeUser, 6);
        setProducts(productData || []);
        
        // Complete gamification action
        viewRecommendation();
        
      } catch (err) {
        console.error('[EnhancedResultsPage] Initialization error:', err);
        setError('Er ging iets mis bij het laden van je aanbevelingen');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeResults();
  }, []); // Empty deps - only run once on mount

  const analyzePsychographicProfile = (answers: Record<string, any>): PsychographicProfile => {
    if (!answers || Object.keys(answers).length === 0) {
      return {
        type: 'casual_chic',
        title: 'Casual Chic Explorer',
        description: 'Je hebt een evenwichtige benadering van mode.',
        characteristics: ['Veelzijdig', 'Open-minded', 'Praktisch'],
        styleKeywords: ['versatile', 'timeless', 'adaptable'],
        motivationalMessage: 'Jouw openheid voor verschillende stijlen maakt je uniek.',
        icon: '🌟'
      };
    }

    const archetypeId = mapAnswersToArchetype(answers);
    const archetype = getArchetypeById(archetypeId);
    const gender = answers.gender;

    return {
      type: archetypeId,
      title: archetype.displayName,
      description: archetype.description,
      characteristics: archetype.keywords,
      styleKeywords: archetype.keywords,
      motivationalMessage: `${gender === 'male' ? 'Voor de moderne man' : 'Voor de zelfverzekerde vrouw'} hebben we outfits geselecteerd die jouw ${archetype.displayName.toLowerCase()} smaak weerspiegelen.`,
      icon: archetype.icon
    };
  };

  // Carousel navigation
  const nextOutfit = () => {
    setCurrentOutfitIndex(prev => (prev + 1) % outfits.length);
  };

  const prevOutfit = () => {
    setCurrentOutfitIndex(prev => (prev - 1 + outfits.length) % outfits.length);
  };

  // Save outfit functionality
  const handleSaveOutfit = async (outfitId: string) => {
    try {
      await saveRecommendation(outfitId);
      setSavedOutfits(prev => [...prev, outfitId]);
      toast.success('Outfit opgeslagen!');
      
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'outfit_saved', {
          event_category: 'engagement',
          event_label: outfitId
        });
      }
    } catch (error) {
      console.error('Error saving outfit:', error);
      toast.error('Kon outfit niet opslaan');
    }
  };

  // Memoized outfit cards to prevent unnecessary re-renders
  const memoizedOutfitCards = useMemo(() => {
    if (!outfits.length) return null;
    
    return outfits.map((outfit, index) => (
      <OutfitCard
        key={outfit.id}
        outfit={outfit}
        user={safeUser}
      />
    ));
  }, [outfits, safeUser]);

  // Sticky footer actions
  const handleSaveFavorites = () => {
    if (outfits.length > 0) {
      outfits.forEach(outfit => handleSaveOutfit(outfit.id));
    }
  };

  const handleRetakeQuiz = () => {
    navigate('/onboarding');
  };

  const handleShopTop3 = () => {
    if (outfits.length > 0 && outfits[0].items.length > 0) {
      window.open(outfits[0].items[0].url, '_blank', 'noopener,noreferrer');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-6 relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              AI aan het werk
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Je persoonlijke aanbevelingen worden samengesteld...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Er ging iets mis
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={() => window.location.reload()}
                  icon={<RotateCw size={16} />}
                  iconPosition="left"
                  fullWidth
                >
                  Probeer opnieuw
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/onboarding')}
                  fullWidth
                >
                  Terug naar quiz
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <div className="bg-white dark:bg-midnight-800 border-b border-lightGrey-200 dark:border-midnight-600 transition-colors">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold text-textPrimary-light dark:text-textPrimary-dark mb-2">
                  Hallo {safeUser.name?.split(' ')[0] || 'Stijlzoeker'}! 👋
                </h1>
                <p className="text-lg text-textSecondary-light dark:text-textSecondary-dark">
                  Dit is jouw persoonlijke stijlcoach in actie – swipe meer om 'm slimmer te maken.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/onboarding')}
                icon={<ArrowLeft size={16} />}
                iconPosition="left"
                className="self-start md:self-center"
              >
                Terug naar de quiz
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Introduction */}
      {psychographicProfile && (
        <div className="bg-gradient-to-r from-turquoise-50 to-lightGrey-50 dark:from-midnight-800 dark:to-midnight-700 transition-colors">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 dark:bg-midnight-800/80 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{psychographicProfile.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-textPrimary-light dark:text-textPrimary-dark mb-3">
                      Jij bent {psychographicProfile.title}
                    </h2>
                    <h3 className="text-lg text-textSecondary-light dark:text-textSecondary-dark mb-4">
                      {psychographicProfile.description}
                    </h3>
                    <p className="text-textSecondary-light dark:text-textSecondary-dark">
                      {psychographicProfile.motivationalMessage}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outfits Section */}
      <div className="bg-lightGrey-50 dark:bg-midnight-900 transition-colors">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-textPrimary-light dark:text-textPrimary-dark mb-2">
                Jouw top 3 outfits
              </h2>
              <div className="space-y-1">
                <p className="text-textSecondary-light dark:text-textSecondary-dark">
                  {enhancedUser.season} • {enhancedUser.occasion}
                </p>
              </div>
            </div>

            {outfits.length > 0 ? (
              <>
                {/* Desktop Grid */}
                <div className="hidden md:grid md:grid-cols-3 gap-8">
                  {memoizedOutfitCards}
                </div>

                {/* Mobile Carousel */}
                <div className="md:hidden">
                  <div className="relative">
                    <div 
                      className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                      style={{ scrollBehavior: 'smooth' }}
                    >
                      {outfits.map((outfit, index) => (
                        <div key={outfit.id} className="flex-none w-full px-4 snap-center">
                          <OutfitCard outfit={outfit} user={safeUser} />
                        </div>
                      ))}
                    </div>

                    {/* Navigation buttons */}
                    <button
                      onClick={prevOutfit}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg"
                      disabled={currentOutfitIndex === 0}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextOutfit}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg"
                      disabled={currentOutfitIndex === outfits.length - 1}
                    >
                      <ChevronRight size={20} />
                    </button>

                    {/* Dots indicator */}
                    <div className="flex justify-center mt-4 space-x-2">
                      {outfits.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentOutfitIndex ? 'bg-orange-500' : 'bg-gray-300'
                          }`}
                          onClick={() => setCurrentOutfitIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white dark:bg-midnight-800 rounded-xl shadow-md p-8 max-w-md mx-auto">
                  <AlertCircle className="w-16 h-16 text-turquoise-500 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-textPrimary-light dark:text-textPrimary-dark mb-3">
                    Geen outfits gevonden
                  </h3>
                  <p className="text-textSecondary-light dark:text-textSecondary-dark mb-6">
                    We konden geen outfits vinden die bij jouw stijlprofiel passen.
                  </p>
                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      onClick={() => window.location.reload()}
                      icon={<RotateCw size={16} />}
                      iconPosition="left"
                      fullWidth
                    >
                      Probeer opnieuw
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white dark:bg-midnight-800 transition-colors">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-textPrimary-light dark:text-textPrimary-dark mb-2">
                Aanbevolen producten
              </h2>
              <p className="text-textSecondary-light dark:text-textSecondary-dark">
                Individuele items die perfect bij jouw stijl passen
              </p>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    className="bg-lightGrey-50 dark:bg-midnight-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => window.open(product.url, '_blank', 'noopener,noreferrer')}
                  >
                    <div className="aspect-square">
                      <ImageWithFallback
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        componentName="EnhancedResultsPage_Product"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-textPrimary-light dark:text-textPrimary-dark text-sm truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark mb-2">
                        {product.brand}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-textPrimary-light dark:text-textPrimary-dark text-sm">
                          €{product.price.toFixed(2)}
                        </span>
                        <button className="text-turquoise-500 hover:text-turquoise-600">
                          <ShoppingBag size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-textSecondary-light dark:text-textSecondary-dark">
                  Geen producten beschikbaar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Footer CTAs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-midnight-800 border-t border-lightGrey-200 dark:border-midnight-600 p-4 z-50 transition-colors">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto">
            <Button
              variant="outline"
              onClick={handleSaveFavorites}
              icon={<Heart size={16} />}
              iconPosition="left"
              className="flex-1"
              disabled={outfits.length === 0}
            >
              Sla favoriete outfits op
            </Button>
            <Button
              variant="outline"
              onClick={handleRetakeQuiz}
              icon={<RefreshCw size={16} />}
              iconPosition="left"
              className="flex-1"
            >
              Bekijk de quiz opnieuw
            </Button>
            <Button
              variant="primary"
              onClick={handleShopTop3}
              icon={<ShoppingBag size={16} />}
              iconPosition="left"
              className="flex-1"
              disabled={outfits.length === 0}
            >
              Shop jouw top 3
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom padding for sticky footer */}
      <div className="h-20" />
    </div>
  );
};

export default EnhancedResultsPage;