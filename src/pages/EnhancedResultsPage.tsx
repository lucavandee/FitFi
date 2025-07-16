import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useGamification } from "../context/GamificationContext";
import { useOnboarding } from "../context/OnboardingContext";
import { motion, AnimatePresence } from "framer-motion";
import OutfitCard from "../components/ui/OutfitCard";
import SkeletonPlaceholder from "../components/ui/SkeletonPlaceholder";
import Button from "../components/ui/Button";
import { getSafeUser } from "../utils/userUtils";
import { normalizeProduct, getProductSeasonText } from "../utils/product";
import { Product, UserProfile, Outfit } from "../engine";
import { getCurrentSeason, getDutchSeasonName } from "../engine/helpers";
import { getOutfits, getRecommendedProducts, getDataSource } from "../services/DataRouter";
import { 
  Calendar, 
  Star, 
  ShoppingBag, 
  Heart, 
  RefreshCw, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

const EnhancedResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: contextUser } = useUser();
  const { viewRecommendation } = useGamification();
  const { data: onboardingData } = useOnboarding();
  
  // State management
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
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);
  
  // Maximum number of regenerations per session
  const MAX_REGENERATIONS = 5;

  // Combine context, localStorage as source for user info
  const user = useMemo(() => {
    const localStorageUser = localStorage.getItem("fitfi-user") 
      ? JSON.parse(localStorage.getItem("fitfi-user") || "null") 
      : null;
    
    // Use context user, then localStorage user, then fallback
    return getSafeUser(contextUser || localStorageUser);
  }, [contextUser]);
  
  // Apply onboarding data to user if available
  const enhancedUser = useMemo(() => {
    if (!onboardingData || Object.keys(onboardingData).length === 0) {
      return user;
    }
    
    // Create enhanced user with onboarding data
    return {
      ...user,
      gender: onboardingData.gender === 'man' ? 'male' : 'female',
      name: onboardingData.name || user.name,
      stylePreferences: {
        casual: onboardingData.archetypes?.includes('casual_chic') ? 5 : 3,
        formal: onboardingData.archetypes?.includes('klassiek') ? 5 : 3,
        sporty: onboardingData.archetypes?.includes('streetstyle') ? 5 : 3,
        vintage: onboardingData.archetypes?.includes('retro') ? 5 : 3,
        minimalist: onboardingData.archetypes?.includes('urban') ? 5 : 3,
      }
    };
  }, [user, onboardingData]);

  // Load recommendations using the DataRouter
  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setProductsLoading(true);
    setOutfitsLoading(true);
    setError(null);
    
    try {
      // Get current season
      const season = onboardingData?.season ? mapSeasonToEnglish(onboardingData.season) : getCurrentSeason();
      setCurrentSeason(season);
      
      // Get outfits using the DataRouter with onboarding preferences
      const options = {
        count: 3,
        preferredSeasons: [season as any],
        preferredOccasions: onboardingData?.occasions || undefined,
        variationLevel: 'high' as const
      };
      
      const generatedOutfits = await getOutfits(enhancedUser, options);
      
      // Set outfits
      setOutfits(generatedOutfits);
      setOutfitsLoading(false);
      
      // Track shown outfit IDs
      const outfitIds = generatedOutfits.map(outfit => outfit.id);
      setShownOutfitIds(outfitIds);
      
      // Get recommended individual products
      const recommendedProducts = await getRecommendedProducts(enhancedUser, 9, season as any);
      setMatchedProducts(recommendedProducts);
      setProductsLoading(false);
      
      // Get the data source being used
      setDataSource(getDataSource());
      
      // Track page view with outfit data
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'view_recommendations', {
          event_category: 'engagement',
          event_label: 'results_page',
          outfits_count: generatedOutfits.length,
          products_count: recommendedProducts.length,
          data_source: getDataSource(),
          archetypes: onboardingData?.archetypes?.join(',') || 'none',
          season: season,
          occasions: onboardingData?.occasions?.join(',') || 'none'
        });
      }
      
      // Record recommendation view for gamification
      viewRecommendation();
      
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError('Er is een fout opgetreden bij het genereren van aanbevelingen.');
      setProductsLoading(false);
      setOutfitsLoading(false);
      setDataSource(getDataSource());
    } finally {
      setLoading(false);
    }
  }, [enhancedUser, onboardingData, viewRecommendation]);

  // Generate recommendations on component mount
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // Handle product click
  const handleProductClick = (product: Product) => {
    // Normalize product data for safety
    const normalizedProduct = normalizeProduct(product);
    
    // Track click in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'product_click', {
        event_category: 'ecommerce',
        event_label: normalizedProduct.id,
        item_id: normalizedProduct.id,
        item_name: normalizedProduct.name,
        item_brand: normalizedProduct.brand,
        item_category: normalizedProduct.type || normalizedProduct.category,
        price: normalizedProduct.price,
        currency: 'EUR'
      });
    }
    
    // Open product page or affiliate link
    window.open(normalizedProduct.affiliateUrl || '#', '_blank', 'noopener,noreferrer');
  };

  // Handle outfit click
  const handleOutfitClick = (outfit: Outfit) => {
    // Track click in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'outfit_click', {
        event_category: 'ecommerce',
        event_label: outfit.id,
        outfit_id: outfit.id,
        outfit_name: outfit.title,
        outfit_archetype: outfit.archetype,
        outfit_occasion: outfit.occasion
      });
    }
  };
  
  // Handle regenerate outfit
  const handleRegenerateOutfit = async (outfitIndex: number) => {
    if (regenerationCount >= MAX_REGENERATIONS) {
      alert(`Je hebt het maximale aantal regeneraties (${MAX_REGENERATIONS}) voor deze sessie bereikt.`);
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
  
  // Handle feedback submission
  const handleFeedbackSubmit = (rating: number) => {
    setFeedbackRating(rating);
    setFeedbackGiven(true);
    
    // Track feedback in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'feedback_rating', {
        event_category: 'engagement',
        event_label: 'recommendation_feedback',
        value: rating
      });
    }
  };
  
  // Start a new style scan
  const handleNewScan = () => {
    navigate('/onboarding');
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

  // Loading state with skeleton placeholders
  if (loading && productsLoading && outfitsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B] py-12">
        <div className="container-slim">
          <div className="max-w-5xl mx-auto px-4">
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
            
            {/* Products skeleton */}
            <div>
              <SkeletonPlaceholder height="h-6" width="w-1/3" className="mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
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
              <Button 
                variant="primary"
                onClick={() => loadRecommendations()}
                icon={<RefreshCw size={18} />}
                iconPosition="left"
              >
                Probeer opnieuw
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B] py-12 pb-24">
      <div className="container-slim">
        <div className="max-w-5xl mx-auto px-4">
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
              Hallo {enhancedUser.name || 'daar'}! Deze outfits zijn speciaal voor jou samengesteld.
            </p>
          </motion.div>
          
          {/* Season info card */}
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
                    {onboardingData?.archetypes?.[0] === 'casual_chic' ? 'Casual Chic' : 
                     onboardingData?.archetypes?.[0] === 'klassiek' ? 'Klassiek' : 
                     onboardingData?.archetypes?.[0] === 'streetstyle' ? 'Streetstyle' : 
                     onboardingData?.archetypes?.[0] === 'urban' ? 'Urban' : 
                     onboardingData?.archetypes?.[0] === 'retro' ? 'Retro' : 'Jouw Stijl'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Data source info */}
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
          
          {/* Outfits section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Complete outfits voor jou</h2>
            
            {outfitsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[500px]">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {outfits.map((outfit, index) => (
                  <OutfitCard 
                    key={outfit.id}
                    outfit={outfit}
                    onNewLook={() => handleRegenerateOutfit(index)}
                    isGenerating={isRegenerating}
                    user={enhancedUser}
                    onClick={() => handleOutfitClick(outfit)}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 text-center">
                <AlertTriangle size={32} className="text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">
                  Geen outfits gevonden
                </h3>
                <p className="text-white/70 mb-6">
                  We konden geen outfits vinden die bij jouw stijlvoorkeuren passen. Probeer het opnieuw met andere voorkeuren.
                </p>
                <Button 
                  variant="primary"
                  onClick={handleNewScan}
                >
                  Nieuwe stijlscan starten
                </Button>
              </div>
            )}
          </motion.div>
          
          {/* Individual products */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Individuele items voor jou</h2>
            
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[300px]">
                {Array(6).fill(0).map((_, index) => (
                  <div key={`skeleton-product-${index}`} className="glass-card overflow-hidden">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {matchedProducts.map((product, index) => {
                  const normalizedProduct = normalizeProduct(product);
                  return (
                    <motion.div 
                      key={`${normalizedProduct.id}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="glass-card overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="relative h-48 bg-gray-800">
                        {normalizedProduct.imageUrl ? (
                          <img 
                            src={normalizedProduct.imageUrl} 
                            alt={normalizedProduct.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-700">
                            <ShoppingBag size={32} className="text-gray-500" />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs shadow-sm">
                          {getProductSeasonText(normalizedProduct)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-white mb-1 line-clamp-1">{normalizedProduct.name}</h3>
                        <p className="text-sm text-white/70 mb-3 line-clamp-2">
                          {normalizedProduct.description || `${normalizedProduct.brand || 'Merk'} - ${normalizedProduct.type || 'Item'}`}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">€{normalizedProduct.price?.toFixed(2) || '0.00'}</span>
                          <Button 
                            variant="primary" 
                            size="sm"
                            icon={<ShoppingBag size={14} />}
                            iconPosition="left"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product);
                            }}
                          >
                            Bekijk
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-8 text-center">
                <AlertTriangle size={32} className="text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">
                  Geen producten gevonden
                </h3>
                <p className="text-white/70 mb-6">
                  We konden geen producten vinden die bij jouw stijlvoorkeuren passen. Probeer het opnieuw met andere voorkeuren.
                </p>
                <Button 
                  variant="primary"
                  onClick={handleNewScan}
                >
                  Nieuwe stijlscan starten
                </Button>
              </div>
            )}
          </motion.div>
          
          {/* Feedback section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-8"
          >
            <div className="glass-card p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-4">
                Wat vind je van deze aanbevelingen?
              </h3>
              
              {feedbackGiven ? (
                <div className="flex flex-col items-center">
                  <CheckCircle size={32} className="text-green-500 mb-3" />
                  <p className="text-white/80">
                    Bedankt voor je feedback! We gebruiken deze om onze aanbevelingen te verbeteren.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-white/80 mb-4">
                    Jouw mening helpt ons om betere aanbevelingen te maken.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => handleFeedbackSubmit(1)}
                      icon={<ThumbsDown size={18} />}
                      iconPosition="left"
                      className="text-white border border-white/30 hover:bg-white/10"
                    >
                      Niet mijn stijl
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleFeedbackSubmit(5)}
                      icon={<ThumbsUp size={18} />}
                      iconPosition="left"
                    >
                      Perfect voor mij!
                    </Button>
                  </div>
                  <button 
                    className="text-sm text-white/60 hover:text-white/80 transition-colors mt-4"
                    onClick={() => setShowFeedbackForm(true)}
                  >
                    Gedetailleerde feedback geven
                  </button>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Feedback form modal */}
          <AnimatePresence>
            {showFeedbackForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                onClick={() => setShowFeedbackForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="glass-card p-6 max-w-md w-full"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold text-white mb-4">
                    Geef gedetailleerde feedback
                  </h3>
                  <textarea
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white mb-4 focus:outline-none focus:ring-2 focus:ring-[#89CFF0] focus:border-transparent"
                    rows={4}
                    placeholder="Vertel ons wat je van de aanbevelingen vindt en hoe we kunnen verbeteren..."
                  ></textarea>
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="ghost"
                      onClick={() => setShowFeedbackForm(false)}
                      className="text-white border border-white/30 hover:bg-white/10"
                    >
                      Annuleren
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setFeedbackGiven(true);
                        setShowFeedbackForm(false);
                      }}
                    >
                      Versturen
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Sticky CTA footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0D1B2A]/90 backdrop-blur-md border-t border-white/10 py-4 z-40">
        <div className="container-slim">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-white/80 text-sm hidden md:block">
                {feedbackGiven ? (
                  <span className="flex items-center">
                    <CheckCircle size={16} className="text-green-500 mr-2" />
                    Bedankt voor je feedback!
                  </span>
                ) : (
                  <span>Wat vind je van deze aanbevelingen?</span>
                )}
              </div>
              <div className="flex space-x-3 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  onClick={() => setShowFeedbackForm(true)}
                  icon={<MessageSquare size={18} />}
                  iconPosition="left"
                  className="text-white border border-white/30 hover:bg-white/10 flex-1 sm:flex-none"
                >
                  Feedback geven
                </Button>
                <Button
                  variant="primary"
                  onClick={handleNewScan}
                  icon={<ArrowRight size={18} />}
                  iconPosition="right"
                  className="flex-1 sm:flex-none"
                >
                  Nieuwe stijlscan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedResultsPage;