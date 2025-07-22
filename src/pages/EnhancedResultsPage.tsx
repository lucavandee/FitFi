import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const [isFetching, setIsFetching] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<string[]>([]);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    { id: 'analyze', label: 'Stijlprofiel analyseren', completed: false },
    { id: 'generate', label: 'Outfits samenstellen', completed: false },
    { id: 'products', label: 'Producten laden', completed: false },
    { id: 'personalize', label: 'Personaliseren', completed: false }
  ]);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Refs
  const carouselRef = useRef<HTMLDivElement>(null);
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;

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
  // Get season and occasion context
  const getSeason = () => {
    const season = enhancedUser.season;
    const seasonMap: Record<string, string> = {
      'lente': 'Lenteselectie',
      'zomer': 'Zomerselectie', 
      'herfst': 'Herfstselectie',
      'winter': 'Winterselectie'
    };
    return seasonMap[season] || 'Seizoenselectie';
  };

  const getOccasion = () => {
    return enhancedUser.occasion;
  };

  // Analytics tracking
  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: 'Results Page',
        page_location: window.location.href
      });
    }
  }, []);

  // Profile analysis
  const analyzePsychographicProfile = useCallback((answers: Record<string, any>): PsychographicProfile => {
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
  }, []);

  // Loading step management
  const completeLoadingStep = useCallback((stepId: string) => {
    setLoadingSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
    
    const completedCount = loadingSteps.filter(s => s.completed || s.id === stepId).length;
    setLoadingProgress((completedCount / loadingSteps.length) * 100);
  }, [loadingSteps]);

  // Load recommendations
  const loadRecommendations = useCallback(async () => {
    if (isFetching || hasInitialized) {
      if (env.DEBUG_MODE) {
        console.log('[EnhancedResultsPage] Skipping loadRecommendations - already fetching or initialized');
      }
      return;
    }

    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    retryCount.current += 1;

    if (env.DEBUG_MODE) {
      console.log('[EnhancedResultsPage] Starting loadRecommendations, attempt:', retryCount.current);
    }

    try {
      // Step 1: Analyze profile
      completeLoadingStep('analyze');
      const profile = analyzePsychographicProfile(quizAnswers);
      setPsychographicProfile(profile);
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Generate outfits
      completeLoadingStep('generate');
      const outfitsData = await getOutfits(safeUser, { count: 3 });
      
      if (env.DEBUG_MODE) {
        console.log('[EnhancedResultsPage] Loaded outfits:', outfitsData?.length || 0);
      }

      if (outfitsData && outfitsData.length > 0) {
        setOutfits(outfitsData);
      } else {
        throw new Error('Geen outfits gevonden');
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 3: Load products
      completeLoadingStep('products');
      const productsData = await getRecommendedProducts(safeUser, 6);
      
      if (env.DEBUG_MODE) {
        console.log('[EnhancedResultsPage] Loaded products:', productsData?.length || 0);
      }

      if (productsData && productsData.length > 0) {
        setProducts(productsData);
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 4: Personalize
      completeLoadingStep('personalize');
      
      // Track successful load
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'recommendations_loaded', {
          event_category: 'engagement',
          event_label: 'success',
          outfits_count: outfitsData?.length || 0,
          products_count: productsData?.length || 0
        });
      }

      // Mark as initialized
      setHasInitialized(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error('[EnhancedResultsPage] Error loading recommendations:', error);
      
      if (retryCount.current < MAX_RETRIES) {
        if (env.DEBUG_MODE) {
          console.log(`[EnhancedResultsPage] Retrying... (${retryCount.current}/${MAX_RETRIES})`);
        }
        
        // Reset and retry
        setHasInitialized(false);
        setTimeout(() => loadRecommendations(), 1000);
        return;
      }
      
      setError(error instanceof Error ? error.message : 'Er ging iets mis bij het laden van je aanbevelingen');
      
      // Track error
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'recommendations_error', {
          event_category: 'error',
          event_label: error instanceof Error ? error.message : 'unknown_error'
        });
      }
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [isFetching, hasInitialized, quizAnswers, safeUser, analyzePsychographicProfile, completeLoadingStep]);

  // Initialize on mount
  useEffect(() => {
    const { season, occasion } = enhancedUser;
    if (season && occasion && !hasInitialized && !isFetching) {
      console.log('[EnhancedResultsPage] Initializing with season:', season, 'occasion:', occasion);
      loadRecommendations();
      viewRecommendation();
    }
  }, [hasInitialized, isFetching, enhancedUser.season, enhancedUser.occasion, loadRecommendations, viewRecommendation]);

  // Fallback redirect if missing data after timeout
  useEffect(() => {
    if (!hasInitialized && !isFetching) {
      const { season, occasion } = enhancedUser;
      if (!season || !occasion) {
        console.warn('[EnhancedResultsPage] Missing season or occasion data, redirecting to quiz');
        const timer = setTimeout(() => {
          navigate('/onboarding');
        }, 2000); // Give 2 seconds for data to load
        
        return () => clearTimeout(timer);
      }
    }
  }, [hasInitialized, isFetching, enhancedUser, navigate]);

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

  // Retry functionality
  const handleRetry = () => {
    setError(null);
    setHasInitialized(false);
    retryCount.current = 0;
    setLoadingSteps(prev => prev.map(step => ({ ...step, completed: false })));
    setLoadingProgress(0);
    loadRecommendations();
  };

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
  if (isLoading && !error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4 py-16">
          {/* Progress bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-blue-500"
                initial={{ width: '0%' }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Loading content */}
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
            
            <div className="space-y-4">
              {loadingSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className={`flex items-center justify-center space-x-3 ${
                    step.completed ? 'text-green-600' : 'text-gray-500'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                >
                  {step.completed ? (
                    <CheckCircle size={20} />
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Clock size={20} />
                    </motion.div>
                  )}
                  <span>{step.label}</span>
                  {step.completed && <span className="text-green-600">✓</span>}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isLoading && !isFetching) {
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
                  onClick={handleRetry}
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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Hallo {safeUser.name?.split(' ')[0] || 'Stijlzoeker'}! 👋
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
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
        <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 transition-colors">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{psychographicProfile.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                      Jij bent {psychographicProfile.title}
                    </h2>
                    <h3 className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                      {psychographicProfile.description}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
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
      <div className="bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Jouw top 3 outfits
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {getSeason()} • {getOccasion()}
              </p>
            </div>

            {outfits.length > 0 ? (
              <>
                {/* Desktop Grid */}
                <div className="hidden md:grid md:grid-cols-3 gap-8">
                  {outfits.map((outfit, index) => (
                    <OutfitCard
                      key={outfit.id}
                      outfit={outfit}
                      user={safeUser}
                    />
                  ))}
                </div>

                {/* Mobile Carousel */}
                <div className="md:hidden">
                  <div className="relative">
                    <div 
                      ref={carouselRef}
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
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 max-w-md mx-auto">
                  <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Geen outfits gevonden
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    We konden geen outfits vinden die bij jouw stijlprofiel passen.
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleRetry}
                    icon={<RefreshCw size={16} />}
                    iconPosition="left"
                  >
                    Probeer opnieuw
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white dark:bg-gray-800 transition-colors">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Aanbevolen producten
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Individuele items die perfect bij jouw stijl passen
              </p>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
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
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {product.brand}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          €{product.price.toFixed(2)}
                        </span>
                        <button className="text-orange-500 hover:text-orange-600">
                          <ShoppingBag size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Geen producten beschikbaar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Footer CTAs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50 transition-colors">
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

      {/* Dev Data Panel */}
      {env.DEBUG_MODE && (
        <DevDataPanel onRefresh={handleRetry} />
      )}
    </div>
  );
};

export default EnhancedResultsPage;