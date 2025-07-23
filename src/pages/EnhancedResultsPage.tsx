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
import { generateSmartDefaults } from '../utils/smartDefaults';
import { quickRetry, smartRetry, progressiveRetry, analyzeMissingData } from '../utils/quickRetry';
import DevDataPanel from '../components/DevDataPanel';
import OutfitCard from '../components/ui/OutfitCard';
import { motion, AnimatePresence } from 'framer-motion';

// Debug logging utility
const debugLog = (message: string, data?: any) => {
  if (env.DEBUG_MODE || import.meta.env.DEV) {
    console.log(`[🔍 EnhancedResultsPage] ${message}`, data || '');
  }
};
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
  
  // Debug log component initialization
  debugLog('Component initialized with location state:', location.state);
  debugLog('User data:', user);
  
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
  const [isQuickRetrying, setIsQuickRetrying] = useState(false);
  const [partialDataShown, setPartialDataShown] = useState(false);
  const [smartDefaults, setSmartDefaults] = useState<any>(null);

  // Refs
  const carouselRef = useRef<HTMLDivElement>(null);
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;

  // Get data from location state
  const quizAnswers = location.state?.answers || location.state?.onboardingData || {};
  const safeUser = getSafeUser(user);
  
  debugLog('Quiz answers extracted:', quizAnswers);
  debugLog('Safe user data:', safeUser);
  
  // Initialize smart defaults
  useEffect(() => {
    debugLog('Initializing smart defaults...');
    const defaults = generateSmartDefaults();
    setSmartDefaults(defaults);
    
    debugLog('Smart defaults generated:', defaults);
  }, []);

  // Enhanced user data with season and occasion
  const enhancedUser = {
    ...safeUser,
    season: quizAnswers.season || smartDefaults?.season || 'herfst',
    occasion: Array.isArray(quizAnswers.occasion) ? quizAnswers.occasion[0] : (quizAnswers.occasion || smartDefaults?.occasions?.[0] || 'Casual'),
    occasions: Array.isArray(quizAnswers.occasion) ? quizAnswers.occasion : [quizAnswers.occasion || smartDefaults?.occasions?.[0] || 'Casual']
  };
  // Get season and occasion context
  debugLog('Enhanced user data prepared:', enhancedUser);
  
  const getSeason = () => {
    const season = enhancedUser.season;
    const seasonMap: Record<string, string> = {
      'lente': 'Lenteselectie',
      'zomer': 'Zomerselectie', 
      'herfst': 'Herfstselectie',
      'winter': 'Winterselectie'
    };
    const seasonName = seasonMap[season] || 'Seizoenselectie';
    
    // Add smart context if available
    if (smartDefaults?.confidence && smartDefaults.confidence > 0.8) {
      return `${seasonName} (automatisch gedetecteerd)`;
    }
    
    return seasonName;
  };

  const getOccasion = () => {
    return enhancedUser.occasion;
  };

  // Analytics tracking
  useEffect(() => {
    debugLog('Setting up analytics tracking...');
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
      debugLog('Skipping loadRecommendations - already fetching or initialized');
      return;
    }

    debugLog('Starting loadRecommendations, attempt:', retryCount.current);
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    retryCount.current += 1;


    try {
      debugLog('Step 1: Analyzing profile...');
      // Step 1: Analyze profile
      completeLoadingStep('analyze');
      const profile = analyzePsychographicProfile(quizAnswers);
      setPsychographicProfile(profile);
      debugLog('Profile analysis completed:', profile);
      
      await new Promise(resolve => setTimeout(resolve, 500));

      debugLog('Step 2: Generating outfits with progressive retry...');
      // Step 2: Generate outfits
      completeLoadingStep('generate');
      
      debugLog('Starting progressive retry for outfits and products...');
      // Use progressive retry for better UX
      const progressiveResult = await progressiveRetry(
        safeUser,
        // Show partial data immediately
        (partialOutfits, partialProducts) => {
          debugLog('Received partial data - outfits:', partialOutfits.length, 'products:', partialProducts.length);
          if (partialOutfits.length > 0) {
            setOutfits(partialOutfits);
            setPartialDataShown(true);
            debugLog('Partial outfits displayed:', partialOutfits.length);
          }
          
          if (partialProducts.length > 0) {
            setProducts(partialProducts);
            debugLog('Partial products displayed:', partialProducts.length);
          }
        },
        // Complete data loaded
        (finalOutfits, finalProducts) => {
          debugLog('Received final data - outfits:', finalOutfits.length, 'products:', finalProducts.length);
          setOutfits(finalOutfits);
          setProducts(finalProducts);
          setPartialDataShown(false);
          debugLog('Final data loaded and displayed');
        }
      );
      
      debugLog('Progressive retry completed with result:', progressiveResult);

      if (progressiveResult.outfits && progressiveResult.outfits.length > 0) {
        debugLog('Setting outfits from progressive result:', progressiveResult.outfits.length);
        setOutfits(progressiveResult.outfits);
      } else {
        debugLog('ERROR: No outfits found in progressive result');
        throw new Error('Geen outfits gevonden');
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      debugLog('Step 3: Loading products...');
      // Step 3: Load products
      completeLoadingStep('products');
      
      if (progressiveResult.products && progressiveResult.products.length > 0) {
        debugLog('Setting products from progressive result:', progressiveResult.products.length);
        setProducts(progressiveResult.products);
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      debugLog('Step 4: Personalizing...');
      // Step 4: Personalize
      completeLoadingStep('personalize');
      
      debugLog('Tracking successful load in analytics...');
      // Track successful load
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'recommendations_loaded', {
          event_category: 'engagement',
          event_label: 'success',
          outfits_count: progressiveResult.outfits?.length || 0,
          products_count: progressiveResult.products?.length || 0,
          used_smart_defaults: !!smartDefaults,
          smart_defaults_confidence: smartDefaults?.confidence || 0
        });
      }

      // Mark as initialized
      debugLog('Marking as initialized');
      setHasInitialized(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      debugLog('loadRecommendations completed successfully');

    } catch (error) {
      debugLog('ERROR in loadRecommendations:', error);
      console.error('[ERROR] EnhancedResultsPage loadRecommendations failed:', error);
      
      if (retryCount.current < MAX_RETRIES) {
        debugLog(`Retrying loadRecommendations (${retryCount.current}/${MAX_RETRIES})`);
        
        // Reset and retry
        setHasInitialized(false);
        setTimeout(() => loadRecommendations(), 1000);
        return;
      }
      
      debugLog('Max retries reached, setting error state');
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
      debugLog('loadRecommendations finally block executed');
    }
  }, [isFetching, hasInitialized, quizAnswers, safeUser, analyzePsychographicProfile, completeLoadingStep]);

  // Initialize on mount
  useEffect(() => {
    debugLog('Initialization check:', {
      season: enhancedUser.season,
      occasion: enhancedUser.occasion,
      hasInitialized,
      isFetching
    });
    
    if (enhancedUser.season && enhancedUser.occasion && !hasInitialized && !isFetching) {
      debugLog('Starting initialization - all conditions met');
      setHasInitialized(true);
      loadRecommendations();
      viewRecommendation();
    }
  }, [enhancedUser.season, enhancedUser.occasion, hasInitialized, isFetching, loadRecommendations, viewRecommendation]);
  
  // Fallback redirect if missing data after timeout
  useEffect(() => {
    if (!hasInitialized && !isFetching) {
      const { season, occasion } = enhancedUser;
      if (!season || !occasion) {
        debugLog('WARNING: Missing season or occasion data, will redirect to quiz');
        const timer = setTimeout(() => {
          debugLog('Redirecting to onboarding due to missing data');
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
      debugLog('Saving outfit:', outfitId);
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
      debugLog('ERROR saving outfit:', error);
      console.error('Error saving outfit:', error);
      toast.error('Kon outfit niet opslaan');
    }
  };

  // Retry functionality
  const handleRetry = () => {
    debugLog('Handling retry - resetting state');
    setError(null);
    setHasInitialized(false);
    retryCount.current = 0;
    setLoadingSteps(prev => prev.map(step => ({ ...step, completed: false })));
    setLoadingProgress(0);
    setPartialDataShown(false);
    loadRecommendations();
  };
  
  // Quick retry for missing data only
  const handleQuickRetry = async () => {
    if (isQuickRetrying) return;
    
    debugLog('Starting quick retry for missing data');
    setIsQuickRetrying(true);
    setError(null);
    
    try {
      const missing = analyzeMissingData(outfits, products, psychographicProfile);
      
      debugLog('Missing data analysis:', missing);
    } catch (error) {
      console.error('[ERROR] EnhancedResultsPage missing data analysis failed:', error);
      setError('Failed to analyze missing data');
    }
      
      const result = await smartRetry(safeUser, {
        outfits,
        products,
        profile: psychographicProfile
      });
      
      debugLog('Smart retry result:', result);
      
      if (result.success) {
        debugLog('Quick retry successful, updating state');
        toast.success('Ontbrekende data succesvol geladen!');
        
        // Track successful quick retry
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'quick_retry_success', {
            event_category: 'error_recovery',
            event_label: 'missing_data_recovered',
            duration_ms: result.duration,
            attempts: result.attempts
          });
        }
      } else {
        throw new Error(result.errors.join(', ') || 'Quick retry failed');
      }
    } catch (error) {
      debugLog('ERROR in quick retry:', error);
      console.error('[EnhancedResultsPage] Quick retry failed:', error);
      toast.error('Quick retry mislukt. Probeer volledige herlaad.');
      
      // Track failed quick retry
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'quick_retry_failed', {
          event_category: 'error_recovery',
          event_label: 'quick_retry_error'
        });
      }
    } finally {
      setIsQuickRetrying(false);
      debugLog('Quick retry finally block executed');
    }
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
                  onClick={handleQuickRetry}
                  icon={<Zap size={16} />}
                  iconPosition="left"
                  fullWidth
                  disabled={isQuickRetrying}
                >
                  {isQuickRetrying ? 'Quick retry...' : 'Quick retry (alleen ontbrekende data)'}
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
                  {getSeason()} • {getOccasion()}
                </p>
                {smartDefaults && smartDefaults.confidence > 0.7 && (
                  <p className="text-sm text-turquoise-600 dark:text-turquoise-400">
                    💡 {smartDefaults.reasoning}
                  </p>
                )}
                {partialDataShown && (
                  <p className="text-sm text-turquoise-500">
                    ⚡ Meer outfits worden geladen...
                  </p>
                )}
              </div>
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
                      onClick={handleQuickRetry}
                      icon={<Zap size={16} />}
                      iconPosition="left"
                      fullWidth
                      disabled={isQuickRetrying}
                    >
                      {isQuickRetrying ? 'Quick retry...' : 'Quick retry'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRetry}
                      icon={<RefreshCw size={16} />}
                      iconPosition="left"
                      fullWidth
                    >
                      Volledige herlaad
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
              {partialDataShown && products.length > 0 && (
                <p className="text-sm text-turquoise-500 mt-1">
                  ⚡ Meer producten worden geladen...
                </p>
              )}
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
                <Button
                  variant="outline"
                  onClick={handleQuickRetry}
                  icon={<Zap size={16} />}
                  iconPosition="left"
                  className="mt-4"
                  disabled={isQuickRetrying}
                >
                  {isQuickRetrying ? 'Laden...' : 'Probeer producten te laden'}
                </Button>
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

      {/* Dev Data Panel */}
      {env.DEBUG_MODE && (
        <DevDataPanel onRefresh={handleRetry} />
      )}
    </div>
  );
};

export default EnhancedResultsPage;