import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { Card, CardContent } from "../components/ui/card";
import { Loader } from "../components/Loader"; 
import ImageWithFallback from "../components/ui/ImageWithFallback";
import Button from "../components/ui/Button";
import { normalizeProduct, getProductSeasonText } from "../utils/product";
import { ShoppingBag, Star, Calendar, Tag, Users, RefreshCw, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { Product, UserProfile, Outfit } from "../engine";
import { getCurrentSeason, getDutchSeasonName } from "../engine/helpers";
import { getOutfits, getRecommendedProducts, getDataSource, getBoltProducts } from "../services/DataRouter";
import DevDataPanel from "../components/DevDataPanel";
import { BoltProduct } from "../types/BoltProduct";
import { USE_SUPABASE } from "../config/app-config";
import ProductList from "../components/products/ProductList";
import ProductPreviewList from "../components/products/ProductPreviewList";
import OutfitCard from "../components/ui/OutfitCard";
import ResultsLoader from "../components/ui/ResultsLoader";
import { useGamification } from "../context/GamificationContext";
import { useOnboarding } from "../context/OnboardingContext"; 
import { getSafeUser } from "../utils/userUtils";
import { normalizeProduct, getProductSeasonText } from "../utils/product";
import SkeletonPlaceholder from "../components/ui/SkeletonPlaceholder";

const EnhancedResultsPage: React.FC = () => {
  const location = useLocation();
  const { user: contextUser } = useUser() || {};
  const { viewRecommendation } = useGamification();
  const { data: onboardingData } = useOnboarding();
  
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [boltProducts, setBoltProducts] = useState<BoltProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSeason, setCurrentSeason] = useState<string>("");
  const [shownOutfitIds, setShownOutfitIds] = useState<string[]>([]);
  const [regenerationCount, setRegenerationCount] = useState<number>(0);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [outfitCompleteness, setOutfitCompleteness] = useState<Record<string, number>>({});
  const [dataSource, setDataSource] = useState<'supabase' | 'bolt' | 'zalando' | 'local'>(getDataSource());
  const [showAllBoltProducts, setShowAllBoltProducts] = useState(false);
  
  // Add loading states for UI elements
  const [productsLoading, setProductsLoading] = useState(true);
  const [outfitsLoading, setOutfitsLoading] = useState(true);
  
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
      console.log("Actief seizoen:", season);
      
      if (!USE_SUPABASE) {
        // Load BoltProducts from JSON file when Supabase is disabled
        const loadedBoltProducts = await getBoltProducts();
        if (loadedBoltProducts && loadedBoltProducts.length > 0) {
          setBoltProducts(loadedBoltProducts);
          console.log(`Loaded ${loadedBoltProducts.length} BoltProducts from JSON file`);
        } else {
          console.warn('No BoltProducts found in JSON file');
        }
      }
      
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
      
      // Track completeness
      const completeness: Record<string, number> = {};
      generatedOutfits.forEach(outfit => {
        if (outfit.completeness) {
          completeness[outfit.id] = outfit.completeness;
        }
      });
      setOutfitCompleteness(completeness);
      
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
  const handleProductClick = (product: Product | BoltProduct) => {
    // Track click in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'product_click', {
        event_category: 'ecommerce',
        event_label: product.id,
        item_id: product.id,
        item_name: product.name || product.title,
        item_brand: product.brand,
        item_category: product.type || product.category,
        price: product.price,
        currency: 'EUR'
      });
    }
    
    // Open product page or affiliate link
    window.open(product.affiliateUrl || '#', '_blank', 'noopener,noreferrer');
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
      
      console.log(`Regenerating outfit with archetype: ${archetype}, occasion: ${occasion}`);
      console.log(`Excluding previously shown outfits: ${shownOutfitIds.join(', ')}`);
      
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
      
      // Update completeness tracking
      if (newOutfit.completeness) {
        setOutfitCompleteness(prev => ({
          ...prev,
          [newOutfit.id]: newOutfit.completeness
        }));
      }
      
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

  // Only show full page loader during initial load
  if (loading && productsLoading && outfitsLoading) return <ResultsLoader />;

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center">
        <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20 mb-4">
          <h2 className="text-xl font-bold text-white mb-2">Oeps! Er is iets misgegaan</h2>
          <p className="text-white/80">{error}</p>
        </div>
        <Button 
          onClick={() => window.location.reload()}
          variant="primary"
        >
          Probeer opnieuw
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Jouw persoonlijke aanbevelingen</h1>
      
      {/* User profile and season summary */}
      <div className="bg-white/5 p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <p className="text-white/80 mb-2 md:mb-0">
            Hallo {enhancedUser.name || 'daar'}! Deze aanbevelingen zijn gebaseerd op jouw {enhancedUser.gender === 'male' ? 'mannelijke' : 'vrouwelijke'} stijlvoorkeuren.
          </p>
          <div className="flex items-center bg-white/10 px-3 py-1 rounded-full">
            <Calendar size={16} className="mr-2 text-orange-500" />
            <span className="text-sm font-medium">Seizoen: {getDutchSeasonName(currentSeason as any)}</span>
          </div>
        </div>
      </div>
      
      {/* Data source info banner */}
      {dataSource === 'supabase' && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <CheckCircle size={20} className="text-green-400 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-white mb-1">📦 Supabase data geladen</h3>
              <p className="text-white/70 text-sm">
                We gebruiken Supabase als databron voor je aanbevelingen.
                Deze producten zijn geselecteerd op basis van jouw stijlvoorkeuren.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {dataSource === 'bolt' && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info size={20} className="text-purple-400 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-white mb-1">⚡ Bolt API data geladen</h3>
              <p className="text-white/70 text-sm">
                We gebruiken de Bolt API als databron voor je aanbevelingen.
                Deze producten zijn geselecteerd op basis van jouw stijlvoorkeuren.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {dataSource === 'zalando' && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info size={20} className="text-blue-400 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-white mb-1">🛍️ Zalando producten geladen</h3>
              <p className="text-white/70 text-sm">
                We gebruiken momenteel Zalando producten voor je aanbevelingen. 
                Deze producten zijn geselecteerd op basis van jouw stijlvoorkeuren.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {dataSource === 'local' && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle size={20} className="text-orange-400 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-white mb-1">🧪 Lokale fallback actief</h3>
              <p className="text-white/70 text-sm">
                We gebruiken momenteel lokale data voor je aanbevelingen. 
                Verbinding met externe productbronnen is niet beschikbaar.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* BoltProducts section - only shown when Supabase is disabled */}
      {!USE_SUPABASE && boltProducts.length > 0 && (
        <>
          {/* Preview list for compact view */}
          {!showAllBoltProducts && (
            <div className="mb-8">
              <ProductPreviewList 
                products={boltProducts}
                title="Op basis van jouw stijl-DNA hebben we deze items geselecteerd"
                subtitle="Bekijk alle items die passen bij jouw persoonlijke stijl"
                archetypeFilter={onboardingData?.archetypes?.[0] || "casual_chic"}
                minMatchScore={0.5}
                maxItems={3}
                onProductClick={handleProductClick}
                onViewMore={() => setShowAllBoltProducts(true)}
              />
            </div>
          )}
          
          {/* Full product list when expanded */}
          {showAllBoltProducts && (
            <div className="mb-8">
              <ProductList 
                products={boltProducts}
                title="Op basis van jouw stijl-DNA hebben we deze items geselecteerd"
                subtitle="Items die perfect passen bij jouw persoonlijke stijl"
                archetypeFilter={onboardingData?.archetypes?.[0] || "casual_chic"}
                minMatchScore={0.5}
                onProductClick={handleProductClick}
              />
              
              {boltProducts.length > 3 && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowAllBoltProducts(false)}
                    className="text-white border border-white/30 hover:bg-white/10"
                  >
                    Toon minder
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Outfits section */}
      {outfits.length > 0 && (
        <div className="mb-8 min-h-[200px]">
          <h2 className="text-xl font-bold mb-4">Complete outfits voor jou</h2>
          {outfitsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, index) => (
                <div key={`skeleton-outfit-${index}`} className="glass-card animate-pulse h-[500px]">
                  <div className="h-64 bg-white/5"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-white/5 rounded w-3/4"></div>
                    <div className="h-4 bg-white/5 rounded w-full"></div>
                    <div className="h-4 bg-white/5 rounded w-5/6"></div>
                    <div className="h-10 bg-white/5 rounded w-full mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outfits.map((outfit, index) => (
                <OutfitCard 
                  key={outfit.id}
                  outfit={outfit}
                  onNewLook={() => handleRegenerateOutfit(index)}
                  isGenerating={isRegenerating}
                  user={enhancedUser}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Individual products */}
      <h2 className="text-xl font-bold mb-4">Individuele items voor jou</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[300px]">
        {productsLoading ? (
          // Skeleton loading state for products
          <React.Fragment>
            {Array(9).fill(0).map((_, index) => (
              <Card 
                key={`skeleton-product-${index}`} 
                className="overflow-hidden"
              >
                <div className="h-60 bg-[#1B263B] relative">
                  <SkeletonPlaceholder height="h-full" width="w-full" rounded="rounded-none" />
                </div>
                <CardContent className="p-4 space-y-3">
                  <SkeletonPlaceholder height="h-5" width="w-3/4" />
                  <SkeletonPlaceholder height="h-4" width="w-full" />
                  <div className="flex justify-between items-center pt-2">
                    <SkeletonPlaceholder height="h-5" width="w-1/4" />
                    <SkeletonPlaceholder height="h-8" width="w-1/4" rounded="rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </React.Fragment>
        ) : matchedProducts.length > 0 ? (
          matchedProducts.map((product, index) => (
            <Card 
              key={`${product.id}-${index}`} 
              className="overflow-hidden cursor-pointer hover:border-orange-500/50 transition-colors"
              onClick={() => handleProductClick(product)}
            >
              <div className="h-60 bg-gray-800 relative">
                <ImageWithFallback
                  src={product.imageUrl || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  componentName="ProductCard"
                />
                  {getProductSeasonText(product, s => getDutchSeasonName(s as any))}
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold mb-1">{product.name}</h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold">€{product.price?.toFixed(2) || '0.00'}</span>
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
              </CardContent>
            </Card>
          ))
        ) : !USE_SUPABASE && boltProducts.length === 0 ? (
          <div className="col-span-3 text-center py-8">
            <p className="text-white/70">Geen BoltProducts gevonden. Zorg ervoor dat het boltProducts.json bestand correct is ingesteld.</p>
            <Button 
              variant="primary"
              className="mt-4"
              onClick={() => getBoltProducts().then(products => setBoltProducts(products))}
            >
              Probeer opnieuw
            </Button>
          </div>
        ) : (
          <div className="col-span-3 text-center py-8">
            <p className="text-white/70">Geen producten gevonden die bij jouw stijl passen.</p>
            <Button 
              variant="primary" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Probeer opnieuw
            </Button>
          </div>
        )}
      </div>
      
      {/* Data source info */}
      <div className="mt-8 p-4 bg-white/5 rounded-lg">
        <div className="flex items-start">
          <Info size={20} className="text-orange-500 mr-3 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-white mb-1">
              Databron: {dataSource === 'supabase' ? '📦 Supabase' : dataSource === 'bolt' ? '⚡ Bolt API' : dataSource === 'zalando' ? '🛍️ Zalando' : '🧪 Lokaal'}
            </h3>
            <p className="text-white/70 text-sm">
              {dataSource === 'supabase' 
                ? 'We gebruiken Supabase als databron voor je aanbevelingen.'
                : dataSource === 'bolt'
                  ? 'We gebruiken de Bolt API als databron voor je aanbevelingen.'
                  : dataSource === 'zalando'
                    ? 'We gebruiken Zalando producten als fallback voor je aanbevelingen.'
                    : 'We gebruiken lokale data als fallback voor je aanbevelingen.'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Regeneration info */}
      <div className="mt-4 p-4 bg-white/5 rounded-lg">
        <div className="flex items-start">
          <Info size={20} className="text-orange-500 mr-3 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-white mb-1">Over outfit regeneratie</h3>
            <p className="text-white/70 text-sm">
              Je kunt per sessie maximaal {MAX_REGENERATIONS} keer een nieuwe look genereren. 
              Elke nieuwe look is uniek en gebaseerd op jouw stijlvoorkeuren.
              {regenerationCount > 0 && ` Je hebt ${regenerationCount} van de ${MAX_REGENERATIONS} regeneraties gebruikt.`}
            </p>
          </div>
        </div>
      </div>
      
      {/* Dev Data Panel - only visible in development mode */}
      <DevDataPanel onRefresh={loadRecommendations} />
    </div>
  );
};

export default EnhancedResultsPage;