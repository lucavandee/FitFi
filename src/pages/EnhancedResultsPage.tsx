import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Calendar, Star, ShoppingBag, Heart, RefreshCw, CheckCircle, Info, AlertTriangle, MessageSquare, ArrowRight, Loader } from "lucide-react";

// Contexts
import { useUser } from "../context/UserContext";
import { useGamification } from "../context/GamificationContext";
import { useOnboarding } from "../context/OnboardingContext";

// Componenten
import OutfitCard from "../components/ui/OutfitCard";
import SkeletonPlaceholder from "../components/ui/SkeletonPlaceholder";
import Button from "../components/ui/Button";
import ErrorBoundary from "../components/ErrorBoundary";
import DebugOverlay from "../components/DebugOverlay";

// Utilities
import { env } from "../utils/env";
import { getSafeUser } from "../utils/userUtils";
import { normalizeProduct, getProductSeasonText } from "../utils/product";
import { generateMockOutfits, generateMockProducts } from "../utils/mockDataUtils";

// Engine
import { Product, UserProfile, Outfit } from "../engine";
import { getCurrentSeason, getDutchSeasonName } from "../engine/helpers";

// Services
import { getOutfits, getRecommendedProducts, getDataSource } from "../services/DataRouter";

// Motion
import { motion } from "framer-motion";

const EnhancedResultsPage = () => {
  // Component for showing loading state when no results are found
  const ResultsLoader: React.FC<{ message?: string }> = ({ 
    message = "We genereren je persoonlijke outfits. Dit kan even duren..." 
  }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 border-4 border-[#89CFF0] border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-white/80 text-center max-w-md">{message}</p>
    </div>
  );

  const location = useLocation();
  const navigate = useNavigate();
  const { user: contextUser } = useUser();
  const { viewRecommendation } = useGamification();
  const { data: onboardingData } = useOnboarding();
  
  // Check for valid onboarding data on mount
  useEffect(() => {
    if (!onboardingData || Object.keys(onboardingData).length === 0) {
      console.warn('[🚨 Redirect] Geen geldige onboarding data → terug naar onboarding');
      navigate('/onboarding');
    }
  }, [onboardingData, navigate]);
  
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [outfitsLoading, setOutfitsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSeason, setCurrentSeason] = useState<string>("");
  const [shownOutfitIds, setShownOutfitIds] = useState<string[]>([]);
  const [regenerationCount, setRegenerationCount] = useState<number>(0);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<'supabase' | 'bolt' | 'zalando' | 'local'>(getDataSource());
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'fallback'>('idle');
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  
  // Maximum number of regenerations per session
  const MAX_REGENERATIONS = 5;

  // Combine context, localStorage as source for user info
  const user = useMemo(() => {
    console.log('[🔍 EnhancedResultsPage] Building user from context and localStorage');
    console.log('[🔍 EnhancedResultsPage] contextUser:', contextUser);
    
    const localStorageUser = localStorage.getItem("fitfi-user") 
      ? JSON.parse(localStorage.getItem("fitfi-user") || "null") 
      : null;
    
    console.log('[🔍 EnhancedResultsPage] localStorageUser:', localStorageUser);
    
    // Use context user, then localStorage user, then fallback
    const finalUser = getSafeUser(contextUser || localStorageUser);
    console.log('[🔍 EnhancedResultsPage] finalUser:', finalUser);
    
    return finalUser;
  }, [contextUser]);
  
  // Apply onboarding data to user if available
  const enhancedUser = useMemo(() => {
    console.log('[🔍 EnhancedResultsPage] Building enhancedUser');
    console.log('[🔍 EnhancedResultsPage] onboardingData:', onboardingData);
    
    // Safety check for onboardingData
    if (!onboardingData || typeof onboardingData !== 'object' || Object.keys(onboardingData).length === 0) {
      console.log('[🔍 EnhancedResultsPage] No onboarding data, using base user');
      return user;
    }
    
    // Create enhanced user with onboarding data
    const enhanced = {
      ...user,
      gender: onboardingData.gender === 'man' ? 'male' as const : 'female' as const,
      name: onboardingData.name || user.name,
      stylePreferences: {
        casual: Array.isArray(onboardingData.archetypes) && onboardingData.archetypes.includes('casual_chic') ? 5 : 3,
        formal: Array.isArray(onboardingData.archetypes) && onboardingData.archetypes.includes('klassiek') ? 5 : 3,
        sporty: Array.isArray(onboardingData.archetypes) && onboardingData.archetypes.includes('streetstyle') ? 5 : 3,
        vintage: Array.isArray(onboardingData.archetypes) && onboardingData.archetypes.includes('retro') ? 5 : 3,
        minimalist: Array.isArray(onboardingData.archetypes) && onboardingData.archetypes.includes('urban') ? 5 : 3,
      }
    };
    
    console.log('[🔍 EnhancedResultsPage] enhancedUser built:', enhanced);
    return enhanced;
  }, [user, onboardingData]);

  // Load recommendations using the DataRouter
  const loadRecommendations = useCallback(async () => {
    // Prevent concurrent fetching
    if (isFetching) {
      console.log('[🔒 EnhancedResultsPage] Already fetching, skipping duplicate request');
      return;
    }
    
    // Safety check for enhancedUser
    if (!enhancedUser || !enhancedUser.id) {
      console.error('[❌ EnhancedResultsPage] Invalid enhancedUser, cannot load recommendations');
      setError('Gebruikersgegevens ontbreken. Probeer opnieuw.');
      setLoading(false);
      setProductsLoading(false);
      setOutfitsLoading(false);
      setIsFetching(false);
      return;
    }
    
    console.log('[🔍 EnhancedResultsPage] Starting loadRecommendations');
    console.log('[🔍 EnhancedResultsPage] enhancedUser at start:', enhancedUser);
    
    setIsFetching(true);
    setFetchStatus('loading');
    setLoading(true);
    setProductsLoading(true);
    setOutfitsLoading(true);
    setError(null);
    
    // Update debug info
    setDebugInfo({
      enhancedUser: {
        id: enhancedUser?.id || 'unknown',
        name: enhancedUser?.name || 'unknown',
        gender: enhancedUser?.gender || 'unknown',
        stylePreferences: enhancedUser?.stylePreferences || {}
      },
      onboardingData,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Get current season
      const season = (onboardingData && onboardingData.season) ? mapSeasonToEnglish(onboardingData.season) : getCurrentSeason();
      console.log('[🔍 EnhancedResultsPage] Using season:', season);
      setCurrentSeason(season);
      
      // Get outfits using the DataRouter with onboarding preferences
      const options = {
        count: 3,
        preferredSeasons: [season as any],
        preferredOccasions: (onboardingData && Array.isArray(onboardingData.occasions)) ? onboardingData.occasions : undefined,
        variationLevel: 'high' as const
      };
      
      console.log('[🔍 EnhancedResultsPage] Calling getOutfits with options:', options);
      
      let generatedOutfits: Outfit[] = [];
      try {
        generatedOutfits = await getOutfits(enhancedUser, options);
      } catch (outfitError) {
        console.error('[❌ EnhancedResultsPage] Error getting outfits:', outfitError);
        generatedOutfits = [];
      }
      
      console.log('[🧠 getOutfits result]', generatedOutfits);
      
      // Check if outfits were generated, use fallback if empty
      if (!Array.isArray(generatedOutfits) || generatedOutfits.length === 0) {
        console.warn('[⚠️ EnhancedResultsPage] No outfits generated, using fallback mock outfits');
        setError('Geen outfits gevonden. We tonen voorbeelddata.');
        setFetchStatus('fallback');
        const fallbackOutfits = generateMockOutfits(3);
        console.log('[🔍 EnhancedResultsPage] Using fallback outfits:', fallbackOutfits);
        setOutfits(fallbackOutfits);
      } else {
        console.log('[🔍 EnhancedResultsPage] Setting generated outfits:', generatedOutfits);
        setOutfits(generatedOutfits);
        setFetchStatus('success');
      }
      setOutfitsLoading(false);
      
      // Track shown outfit IDs
      const outfitsToTrack = (Array.isArray(generatedOutfits) && generatedOutfits.length > 0) ? generatedOutfits : generateMockOutfits(3);
      const outfitIds = outfitsToTrack.map(outfit => outfit?.id).filter(Boolean);
      setShownOutfitIds(outfitIds);
      
      console.log('[🔍 EnhancedResultsPage] Calling getRecommendedProducts');
      // Get recommended individual products
      let recommendedProducts: Product[] = [];
      try {
        recommendedProducts = await getRecommendedProducts(enhancedUser, 9, season as any);
      } catch (productError) {
        console.error('[❌ EnhancedResultsPage] Error getting products:', productError);
        recommendedProducts = [];
      }
      
      console.log('[🧠 getRecommendedProducts result]', recommendedProducts);
      
      // Check if products were found, use fallback if empty
      if (!Array.isArray(recommendedProducts) || recommendedProducts.length === 0) {
        console.warn('[⚠️ EnhancedResultsPage] No products found, using fallback mock products');
        setFetchStatus('fallback');
        const fallbackProducts = generateMockProducts(undefined, 9);
        console.log('[🔍 EnhancedResultsPage] Using fallback products:', fallbackProducts);
        setMatchedProducts(fallbackProducts);
      } else {
        console.log('[🔍 EnhancedResultsPage] Setting recommended products:', recommendedProducts);
        setMatchedProducts(recommendedProducts);
      }
      setProductsLoading(false);
      
      // Get the data source being used
      setDataSource(getDataSource());
      
      console.log('[🔍 EnhancedResultsPage] Final state - outfits:', (Array.isArray(generatedOutfits) ? generatedOutfits.length : 0), 'products:', (Array.isArray(recommendedProducts) ? recommendedProducts.length : 0));
      
      // Track page view with outfit data
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'view_recommendations', {
          event_category: 'engagement',
          event_label: 'results_page',
          outfits_count: Array.isArray(generatedOutfits) ? generatedOutfits.length : 0,
          products_count: Array.isArray(recommendedProducts) ? recommendedProducts.length : 0,
          data_source: getDataSource(),
          archetypes: (onboardingData && Array.isArray(onboardingData.archetypes)) ? onboardingData.archetypes.join(',') : 'none',
          season: season,
          occasions: (onboardingData && Array.isArray(onboardingData.occasions)) ? onboardingData.occasions.join(',') : 'none'
        });
      }
      
      // Record recommendation view for gamification
      try {
        viewRecommendation();
      } catch (gamificationError) {
        console.warn('[⚠️ EnhancedResultsPage] Gamification error:', gamificationError);
      }
      
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError('Er is een fout opgetreden. We tonen voorbeelddata.');
      setFetchStatus('error');
      
      // Use fallback data when there's an error
      console.warn('[⚠️ EnhancedResultsPage] Using fallback data due to error');
      const fallbackOutfits = generateMockOutfits(3);
      const fallbackProducts = generateMockProducts(undefined, 9);
      console.log('[🔍 EnhancedResultsPage] Error fallback - outfits:', fallbackOutfits, 'products:', fallbackProducts);
      
      setOutfits(fallbackOutfits);
      setMatchedProducts(fallbackProducts);
      
      setProductsLoading(false);
      setOutfitsLoading(false);
      setDataSource(getDataSource());
    } finally {
      console.log('[🔍 EnhancedResultsPage] loadRecommendations completed');
      setIsFetching(false);
      setLoading(false);
    }
  }, [enhancedUser, onboardingData, viewRecommendation, isFetching]);

  // Generate recommendations on component mount - only once
  useEffect(() => {
    if (!hasInitialized && enhancedUser?.id && !isFetching) {
      console.log('[🔍 EnhancedResultsPage] Initial load triggered');
      setHasInitialized(true);
      loadRecommendations();
    }
  }, [hasInitialized, enhancedUser?.id, isFetching, loadRecommendations]);

  // Handle product click
  const handleProductClick = (product: Product) => {
    // Safety check for product
    if (!product || !product.id) {
      console.warn('[⚠️ EnhancedResultsPage] Invalid product clicked:', product);
      return;
    }
    
    // Track click in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'product_click', {
        event_category: 'ecommerce',
        event_label: product.id,
        item_id: product.id,
        item_name: product.name || 'Unknown',
        item_brand: product.brand || 'Unknown',
        item_category: product.type || product.category,
        price: product.price || 0,
        currency: 'EUR'
      });
    }
    
    // Open product page or affiliate link
    window.open(product.affiliateUrl || '#', '_blank', 'noopener,noreferrer');
  };

  // Handle outfit click
  const handleOutfitClick = (outfit: Outfit) => {
    // Safety check for outfit
    if (!outfit || !outfit.id) {
      console.warn('[⚠️ EnhancedResultsPage] Invalid outfit clicked:', outfit);
      return;
    }
    
    // Track click in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'outfit_click', {
        event_category: 'ecommerce',
        event_label: outfit.id,
        outfit_id: outfit.id,
        outfit_name: outfit.title || 'Unknown',
        outfit_archetype: outfit.archetype || 'Unknown',
        outfit_occasion: outfit.occasion || 'Unknown'
      });
    }
  };
  
  // Handle regenerate outfit
  const handleRegenerateOutfit = async (outfitIndex: number) => {
    if (regenerationCount >= MAX_REGENERATIONS) {
      alert(`Je hebt het maximale aantal regeneraties (${MAX_REGENERATIONS}) voor deze sessie bereikt.`);
      return;
    }
    
    // Safety check for outfit index
    if (!Array.isArray(outfits) || outfitIndex < 0 || outfitIndex >= outfits.length) {
      console.error('[❌ EnhancedResultsPage] Invalid outfit index:', outfitIndex);
      return;
    }
    
    setIsRegenerating(true);
    
    try {
      // Get the current outfit's archetype and occasion
      const currentOutfit = outfits[outfitIndex];
      if (!currentOutfit) {
        throw new Error('Outfit not found');
      }
      
      const { archetype, secondaryArchetype, mixFactor, occasion } = currentOutfit;
      
      // Get current season
      const season = onboardingData?.season ? mapSeasonToEnglish(onboardingData.season) : getCurrentSeason();
      
      // Generate a new outfit with the same parameters but excluding shown IDs
      const generatedOutfits = await getOutfits(enhancedUser, {
        excludeIds: shownOutfitIds,
        count: 1,
        preferredOccasions: [occasion],
        preferredSeasons: [season as any],
        variationLevel: 'high', // Use high variation for regeneration
        enforceCompletion: true,
        minCompleteness: 90, // Higher completeness for regenerated outfits
      });
      
      if (generatedOutfits.length === 0) {
        throw new Error('Geen nieuwe outfits beschikbaar. Probeer andere stijlvoorkeuren.');
      }
      
      // Get the new outfit
      const newOutfit = generatedOutfits[0];
      
      // Update shown outfit IDs
      setShownOutfitIds(prev => [...prev, newOutfit.id]);
      
      // Replace the outfit at the specified index
      setOutfits(prev => {
        const updated = [...prev];
        updated[outfitIndex] = newOutfit;
        return updated;
      });
      
      // Increment regeneration count
      setRegenerationCount(prev => prev + 1);
      
      // Update data source
      setDataSource(getDataSource());
      
      // Track regeneration in analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'outfit_regenerate', {
          event_category: 'engagement',
          event_label: `${archetype}_${occasion}`,
          value: regenerationCount + 1
        });
      }
      
    } catch (err) {
      console.error('Error regenerating outfit:', err);
      alert('Er is een fout opgetreden bij het genereren van een nieuwe outfit. Probeer het later opnieuw.');
    } finally {
      setIsRegenerating(false);
    }
  };
  
  // Record feedback
  const handleFeedback = (rating: number) => {
    setFeedbackGiven(true);
    
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'feedback_rating', {
        event_category: 'engagement',
        event_label: 'recommendation_feedback',
        value: rating
      });
    }
  };
  
  // Helper function to map Dutch season to English
  const mapSeasonToEnglish = (dutchSeason: string): string => {
    const seasonMap: Record<string, string> = {
      'lente': 'spring',
      'zomer': 'summer',
      'herfst': 'autumn',
      'winter': 'winter'
    };
    
    return seasonMap[dutchSeason] || 'autumn';
  };
  
  // Empty state component for when no results are found
  const EmptyResultsState: React.FC = () => (
    <div className="text-center py-12">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 max-w-md mx-auto">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-orange-500" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          Geen aanbevelingen gevonden
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We konden geen outfits of producten vinden die bij jouw profiel passen. Dit kan een tijdelijk probleem zijn.
        </p>
        <div className="space-y-3">
          <Button
            variant="primary"
            onClick={() => {
              setHasInitialized(false);
              loadRecommendations();
            }}
            icon={<RefreshCw size={16} />}
            iconPosition="left"
            disabled={isFetching}
          >
            {isFetching ? 'Laden...' : 'Probeer opnieuw'}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding')}
            className="w-full"
          >
            Nieuwe stijlscan
          </Button>
        </div>
      </div>
    </div>
  );

  // Central debug overlay component
  const DebugOverlay: React.FC = () => (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-black/90 text-green-400 text-xs p-4 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <strong>🔧 Debug Panel</strong>
          <span className={`px-2 py-1 rounded text-xs ${
            fetchStatus === 'success' ? 'bg-green-500/20 text-green-400' :
            fetchStatus === 'error' ? 'bg-red-500/20 text-red-400' :
            fetchStatus === 'fallback' ? 'bg-yellow-500/20 text-yellow-400' :
            fetchStatus === 'loading' ? 'bg-blue-500/20 text-blue-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {fetchStatus}
          </span>
        </div>
        <div className="space-y-1 text-xs">
          <div>👤 User: {enhancedUser.id.slice(0, 8)}...</div>
          <div>📊 Outfits: {outfits.length}</div>
          <div>🛍️ Products: {matchedProducts.length}</div>
          <div>🔗 Source: {dataSource}</div>
          <div>🧪 Mock: {env.USE_MOCK_DATA ? '✅' : '❌'}</div>
          <div>🔄 Fetching: {isFetching ? '✅' : '❌'}</div>
          <div>🎯 Initialized: {hasInitialized ? '✅' : '❌'}</div>
          {error && <div className="text-red-400">❌ {error}</div>}
        </div>
      </div>
    </div>
  );

  // Loading state with skeleton placeholders
  if (loading && productsLoading && outfitsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B] py-12">
        <div className="container-slim">
          <div className="max-w-5xl mx-auto px-4">
            {/* Enhanced loading indicator */}
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-[#FF8600] border-t-transparent rounded-full animate-spin mb-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader className="text-[#0ea5e9] animate-pulse" size={24} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Je aanbevelingen worden geladen...
              </h2>
              <p className="text-white/70 text-center max-w-md mb-6">
                Onze AI analyseert je voorkeuren en stelt de perfecte outfits voor je samen.
              </p>
              
              {/* Progress steps */}
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#FF8600] rounded-full mr-2 animate-pulse"></div>
                  <span>Stijlprofiel analyseren...</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-white/30 rounded-full mr-2"></div>
                  <span>Outfits samenstellen...</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-white/30 rounded-full mr-2"></div>
                  <span>Producten selecteren...</span>
                </div>
              </div>
            </div>
            
            {/* Skeleton placeholders for layout */}
            <div className="opacity-30">
              {/* Header skeleton */}
              <div className="mb-8">
                <SkeletonPlaceholder height="h-8" width="w-3/4" className="mb-4" />
                <SkeletonPlaceholder height="h-4" width="w-full" />
              </div>
            
              {/* Season info skeleton */}
              <div className="mb-8">
                <SkeletonPlaceholder height="h-16" rounded="rounded-lg" />
              </div>
            
              {/* Outfits skeleton */}
              <div className="mb-12">
                <SkeletonPlaceholder height="h-6" width="w-1/3" className="mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((_, i) => (
                    <div key={`skeleton-outfit-${i}`} className="glass-card overflow-hidden">
                      <SkeletonPlaceholder height="h-64" rounded="rounded-t-xl rounded-b-none" />
                      <div className="p-6 space-y-4">
                        <SkeletonPlaceholder height="h-6" width="w-3/4" />
                        <SkeletonPlaceholder height="h-4" width="w-full" />
                        <SkeletonPlaceholder height="h-4" width="w-5/6" />
                        <SkeletonPlaceholder height="h-10" width="w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !loading && !isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B] py-12">
        <div className="container-slim">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="glass-card p-8">
              <div className="w-16 h-16 mx-auto mb-6 text-red-500 flex items-center justify-center">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Oeps! Er is iets misgegaan
              </h2>
              <p className="text-white/80 mb-6">
                {error}
              </p>
              <div className="space-y-3">
                <Button 
                  variant="primary"
                  onClick={() => {
                    setHasInitialized(false);
                    setError(null);
                    loadRecommendations();
                  }}
                  icon={<RefreshCw size={18} />}
                  iconPosition="left"
                  disabled={isFetching}
                >
                  {isFetching ? 'Laden...' : 'Probeer opnieuw'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/onboarding')}
                  className="w-full text-white border border-white/30 hover:bg-white/10"
                >
                  Nieuwe stijlscan
                </Button>
              </div>
            </div>
          </div>
          <DebugOverlay />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B] py-12">
        <div className="container-slim">
          <div className="max-w-5xl mx-auto px-4">
            {/* Show empty state if no content is available */}
            {!loading && !productsLoading && !outfitsLoading && outfits.length === 0 && matchedProducts.length === 0 && (
              <EmptyResultsState />
            )}
      
            {/* Only show content if we have data or are loading */}
            {(loading || productsLoading || outfitsLoading || outfits.length > 0 || matchedProducts.length > 0) && (
              <>
                {/* Header with user greeting */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
                  <h1 className="text-3xl font-bold text-white mb-3">
                    Jouw persoonlijke stijlaanbevelingen
                  </h1>
                  <p className="text-xl text-white/80">
                    Hallo {enhancedUser?.name || 'daar'}! Deze outfits zijn speciaal voor jou samengesteld.
                  </p>
                </motion.div>
              </>
            )}
      
            {/* Season info card */}
            {(outfits.length > 0 || matchedProducts.length > 0 || loading) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-8"
              >
                <div className="glass-card p-6 shadow-lg">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className="w-12 h-12 rounded-full bg-[#89CFF0]/20 flex items-center justify-center mr-4">
                        <Calendar size={24} className="text-[#89CFF0]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {getDutchSeasonName(currentSeason as any)}seizoen
                        </h3>
                        <p className="text-white/70">
                          Outfits perfect voor het huidige seizoen
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-full shadow-md">
                      <span className="text-sm font-medium text-white flex items-center">
                        <Star size={16} className="mr-2 text-[#FF8600]" />
                        {Array.isArray(onboardingData?.archetypes) && onboardingData.archetypes[0] === 'casual_chic' ? 'Casual Chic' : 
                         Array.isArray(onboardingData?.archetypes) && onboardingData.archetypes[0] === 'klassiek' ? 'Klassiek' : 
                         Array.isArray(onboardingData?.archetypes) && onboardingData.archetypes[0] === 'streetstyle' ? 'Streetstyle' : 
                         Array.isArray(onboardingData?.archetypes) && onboardingData.archetypes[0] === 'urban' ? 'Urban' : 
                         Array.isArray(onboardingData?.archetypes) && onboardingData.archetypes[0] === 'retro' ? 'Retro' : 'Jouw Stijl'}
                      </span>
                    </div>
                  </div>
                </div>
              <DebugOverlay />
            )}
      
            {/* Data source info */}
            {(outfits.length > 0 || matchedProducts.length > 0 || loading) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8"
              >
                {dataSource === 'supabase' && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 shadow-md">
                    <div className="flex items-start">
                      <CheckCircle size={20} className="text-green-400 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-white mb-1">Supabase data geladen</h3>
                        <p className="text-white/70 text-sm">
                          We gebruiken Supabase als databron voor je aanbevelingen.
                          Deze producten zijn geselecteerd op basis van jouw stijlvoorkeuren.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
          
                {dataSource === 'bolt' && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 shadow-md">
                    <div className="flex items-start">
                      <Info size={20} className="text-purple-400 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-white mb-1">Bolt API data geladen</h3>
                        <p className="text-white/70 text-sm">
                          We gebruiken de Bolt API als databron voor je aanbevelingen.
                          Deze producten zijn geselecteerd op basis van jouw stijlvoorkeuren.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
          
                {dataSource === 'zalando' && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 shadow-md">
                    <div className="flex items-start">
                      <Info size={20} className="text-blue-400 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-white mb-1">Zalando producten geladen</h3>
                        <p className="text-white/70 text-sm">
                          We gebruiken momenteel Zalando producten voor je aanbevelingen. 
                          Deze producten zijn geselecteerd op basis van jouw stijlvoorkeuren.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
          
                {dataSource === 'local' && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 shadow-md">
                    <div className="flex items-start">
                      <AlertTriangle size={20} className="text-orange-400 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-white mb-1">Lokale fallback actief</h3>
                        <p className="text-white/70 text-sm">
                          We gebruiken momenteel lokale data voor je aanbevelingen. 
                          Verbinding met externe productbronnen is niet beschikbaar.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

      {/* Outfits section */}
        {(outfits.length > 0 || outfitsLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Complete outfits voor jou</h2>
      
            {outfitsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((_, i) => (
                  <div key={`skeleton-outfit-${i}`} className="glass-card overflow-hidden">
                    <SkeletonPlaceholder height="h-64" rounded="rounded-t-xl rounded-b-none" />
                    <div className="p-6 space-y-4">
                      <SkeletonPlaceholder height="h-6" width="w-3/4" />
                      <SkeletonPlaceholder height="h-4" width="w-full" />
                      <SkeletonPlaceholder height="h-4" width="w-5/6" />
                      <SkeletonPlaceholder height="h-10" width="w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : outfits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[400px]">
                {outfits.map((outfit, index) => {
                  try {
                    return (
                      <motion.div key={outfit.id || `fallback-${index}`}>
                        <OutfitCard
                          outfit={outfit}
                          onNewLook={() => handleRegenerateOutfit(index)}
                          isGenerating={isRegenerating}
                          user={enhancedUser}
                        />
                      </motion.div>
                    );
                  } catch (error) {
                    console.error(`[❌ EnhancedResultsPage] Error rendering outfit ${index}:`, error);
                    return null;
                  }
                })}
              </div>
            ) : (
              <ResultsLoader message="We genereren je persoonlijke outfits. Dit kan even duren..." />
            )}
          </motion.div>
        )}

        {/* Individual products section */}
        {(matchedProducts.length > 0 || productsLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Individuele items voor jou</h2>
      
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((_, i) => (
                  <div key={`skeleton-product-${i}`} className="glass-card overflow-hidden">
                    <SkeletonPlaceholder height="h-48" rounded="rounded-t-xl rounded-b-none" />
                    <div className="p-4 space-y-3">
                      <SkeletonPlaceholder height="h-5" width="w-3/4" />
                      <SkeletonPlaceholder height="h-4" width="w-full" />
                      <div className="flex justify-between items-center pt-2">
                        <SkeletonPlaceholder height="h-5" width="w-1/4" />
                        <SkeletonPlaceholder height="h-8" width="w-1/4" rounded="rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : matchedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {matchedProducts.map((product, index) => {
                  try {
                    if (!product || !product.id) {
                      console.warn(`[⚠️ EnhancedResultsPage] Invalid product at index ${index}:`, product);
                      return null;
                    }
              
                    const normalizedProduct = normalizeProduct(product);
                    return (
                      <motion.div
                        key={normalizedProduct.id || `product-${index}`}
                        // ... motion props
                        className="glass-card overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
                        onClick={() => handleProductClick(product)}
                      >
                        {/* ... product card content ... */}
                      </motion.div>
                    );
                  } catch (error) {
                    console.error(`[❌ EnhancedResultsPage] Error rendering product ${index}:`, error);
                    return null;
                  }
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/70">
                  Geen individuele items gevonden. Probeer andere stijlvoorkeuren.
                </p>
              </div>
            )}
          </motion.div>
        )}

            {/* Feedback section */}
        {!feedbackGiven && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-16 text-center"
          >
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Wat vind je van deze aanbevelingen?</h3>
              <p className="text-white/70 mb-6">Je feedback helpt ons om betere aanbevelingen te doen in de toekomst.</p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={() => handleFeedback(5)} icon={<Heart size={18} />} iconPosition="left" className="text-white border border-white/30 hover:bg-white/10">Geweldig!</Button>
                <Button variant="outline" onClick={() => handleFeedback(3)} className="text-white border border-white/30 hover:bg-white/10">Oké</Button>
                <Button variant="outline" onClick={() => handleFeedback(1)} className="text-white border border-white/30 hover:bg-white/10">Niet mijn stijl</Button>
              </div>
            </div>
          </motion.div>
        )}
        
            {/* Mock data warning */}
            {env.USE_MOCK_DATA && (outfits.length > 0 || matchedProducts.length > 0) && (
          <div className="mt-12 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle size={16} className="mr-2" />
              <strong>⚠️ Mock Mode Actief:</strong> Deze outfits en producten zijn gegenereerd op basis van testdata. Resultaten zijn niet representatief voor echte data.
            </div>
          </div>
        )}              </div> {/* Dit sluit de 'max-w-5xl' div */}
        </div> {/* Dit sluit de 'container-slim' div */}
    
        {/* Sticky CTA footer */}
        {(outfits.length > 0 || matchedProducts.length > 0) && (
            <div className="fixed bottom-0 left-0 right-0 bg-[#0D1B2A]/90 backdrop-blur-md border-t border-white/10 py-4 z-50">
              <div className="container-slim">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center">
                    <MessageSquare size={20} className="text-[#89CFF0] mr-2" />
                    <span className="text-white font-medium">Niet tevreden met de resultaten?</span>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/feedback')}
                      className="text-white border border-white/30 hover:bg-white/10"
                    >
                      Geef feedback
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => navigate('/onboarding')}
                      icon={<ArrowRight size={18} />}
                      iconPosition="right"
                    >
                      Nieuwe stijlscan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
        )}
    
        {/* ✅ Central Debug Overlay */}
        {(env.DEBUG_MODE || env.USE_MOCK_DATA) && <DebugOverlay />}
      </div>
    </ErrorBoundary>
  );
};
    
export default EnhancedResultsPage;