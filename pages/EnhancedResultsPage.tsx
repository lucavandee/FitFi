import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../context/UserContext";
import { Card, CardContent } from "../components/ui/card";
import { Loader } from "../components/Loader";
import ImageWithFallback from "../components/ui/ImageWithFallback";
import Button from "../components/ui/Button";
import { ShoppingBag, Star, Calendar, Tag, Users, RefreshCw, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { Product, UserProfile, Outfit, generateRecommendations, getRecommendedProducts } from "../engine";
import { getCurrentSeason, getDutchSeasonName, getProductCategory } from "../engine/helpers";
import { fetchProductsFromSupabase } from "../lib/supabaseService";
import { getZalandoProducts } from "../data/zalandoProductsAdapter";

// Fallback user if there's no context or localStorage-user
const fallbackUser: UserProfile = {
  id: "fallback",
  name: "Stijlzoeker",
  email: "anoniem@fitfi.ai",
  gender: "female", // Default to female instead of neutral
  stylePreferences: {
    casual: 3,
    formal: 3,
    sporty: 3,
    vintage: 3,
    minimalist: 3,
  },
  isPremium: false,
  savedRecommendations: [],
};

const EnhancedResultsPage = () => {
  const { user: contextUser } = useUser() || {};
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSeason, setCurrentSeason] = useState<string>("");
  const [shownOutfitIds, setShownOutfitIds] = useState<string[]>([]);
  const [regenerationCount, setRegenerationCount] = useState<number>(0);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [outfitCompleteness, setOutfitCompleteness] = useState<Record<string, number>>({});
  const [dataSource, setDataSource] = useState<'supabase' | 'zalando' | 'local'>('local');
  
  // Maximum number of regenerations per session
  const MAX_REGENERATIONS = 5;

  // Combine context, localStorage or fallback as source for user info
  const user = useMemo(() => {
    const localStorageUser = localStorage.getItem("fitfi-user") 
      ? JSON.parse(localStorage.getItem("fitfi-user") || "null") 
      : null;
    
    // Use context user, then localStorage user, then fallback
    return contextUser || localStorageUser || fallbackUser;
  }, [contextUser]);

  // Generate recommendations using the recommendation engine
  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get current season
        const season = getCurrentSeason();
        setCurrentSeason(season);
        console.log("Actief seizoen:", season);
        
        // Try to fetch products from Supabase
        const supabaseProducts = await fetchProductsFromSupabase();
        
        // Check if we got products from Supabase
        if (supabaseProducts && supabaseProducts.length > 0) {
          console.log("Supabase products loaded:", supabaseProducts.length);
          setDataSource('supabase');
          
          // Use the recommendation engine with Supabase products
          const generatedOutfits = await generateRecommendations(user);
          
          // Set outfits
          setOutfits(generatedOutfits);
          
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
          const recommendedProducts = await getRecommendedProducts(user, 9, season);
          setMatchedProducts(recommendedProducts);
        } else {
          // Try to load Zalando products
          const zalandoProducts = await getZalandoProducts();
          
          if (zalandoProducts && zalandoProducts.length > 0) {
            console.log('[FitFi] Zalando fallback actief – producten geladen:', zalandoProducts.length);
            setDataSource('zalando');
            
            // Use the recommendation engine with Zalando products
            const generatedOutfits = await generateRecommendations(user, { useZalandoProducts: true });
            
            // Set outfits
            setOutfits(generatedOutfits);
            
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
            const recommendedProducts = await getRecommendedProducts(user, 9, season, true);
            setMatchedProducts(recommendedProducts);
          } else {
            // Fallback to local data
            console.log('Supabase uitgeschakeld – lokale fallback actief');
            setDataSource('local');
            
            // Use the recommendation engine to generate outfits
            const generatedOutfits = await generateRecommendations(user, { useZalandoProducts: false });
            
            // Track shown outfit IDs
            const outfitIds = generatedOutfits.map(outfit => outfit.id);
            setShownOutfitIds(outfitIds);
            
            // Set outfits
            setOutfits(generatedOutfits);
            
            // Track completeness
            const completeness: Record<string, number> = {};
            generatedOutfits.forEach(outfit => {
              if (outfit.completeness) {
                completeness[outfit.id] = outfit.completeness;
              }
            });
            setOutfitCompleteness(completeness);
            
            // Get recommended individual products
            const recommendedProducts = await getRecommendedProducts(user, 9, season, false);
            setMatchedProducts(recommendedProducts);
          }
        }
      } catch (err) {
        console.error('Error generating recommendations:', err);
        setError('Er is een fout opgetreden bij het genereren van aanbevelingen.');
        setDataSource('local');
      } finally {
        setLoading(false);
      }
    };
    
    loadRecommendations();
  }, [user]);

  // Handle product click
  const handleProductClick = (product: Product) => {
    // Track click in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'product_click', {
        event_category: 'ecommerce',
        event_label: product.id,
        item_id: product.id,
        item_name: product.name,
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
      const season = getCurrentSeason();
      
      // Generate a new outfit with the same parameters but excluding shown IDs
      const generatedOutfits = await generateRecommendations(user, {
        excludeIds: shownOutfitIds,
        count: 1,
        preferredOccasions: [occasion],
        variationLevel: 'high', // Use high variation for regeneration
        enforceCompletion: true,
        minCompleteness: 90, // Higher completeness for regenerated outfits
        useZalandoProducts: dataSource === 'zalando'
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

  if (loading) return <Loader />;

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
            Hallo {user.name || 'daar'}! Deze aanbevelingen zijn gebaseerd op jouw {user.gender === 'male' ? 'mannelijke' : 'vrouwelijke'} stijlvoorkeuren.
            {dataSource !== 'supabase' && (
              <span className="ml-2 text-orange-400">
                ({dataSource === 'zalando' ? 'Zalando' : 'Lokale'} fallback actief)
              </span>
            )}
          </p>
          <div className="flex items-center bg-white/10 px-3 py-1 rounded-full">
            <Calendar size={16} className="mr-2 text-orange-500" />
            <span className="text-sm font-medium">Seizoen: {getDutchSeasonName(currentSeason as any)}</span>
          </div>
        </div>
      </div>
      
      {/* Data source info banner */}
      {dataSource === 'zalando' && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
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
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-6">
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
      
      {/* Outfits section */}
      {outfits.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Complete outfits voor jou</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outfits.map((outfit, index) => (
              <Card 
                key={outfit.id} 
                className="overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer"
                onClick={() => handleOutfitClick(outfit)}
              >
                <div className="relative h-60">
                  <ImageWithFallback
                    src={outfit.imageUrl || outfit.products[0]?.imageUrl || '/placeholder.png'}
                    alt={outfit.title}
                    className="w-full h-full object-cover"
                    componentName="OutfitCard"
                  />
                  <div className="absolute bottom-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                    <Star size={12} className="mr-1" />
                    {outfit.matchPercentage}% Match
                  </div>
                  {outfit.season && (
                    <div className="absolute top-2 left-2 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white px-2 py-1 rounded-full text-xs font-medium">
                      {getDutchSeasonName(outfit.season as any)}
                    </div>
                  )}
                  
                  {/* Show archetype mix if applicable */}
                  {outfit.secondaryArchetype && outfit.mixFactor && outfit.mixFactor > 0.1 && (
                    <div className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Users size={12} className="mr-1" />
                      Hybride stijl
                    </div>
                  )}
                  
                  {/* Completeness indicator */}
                  {outfit.completeness && (
                    <div className="absolute bottom-2 left-2 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <CheckCircle size={12} className="mr-1" />
                      {outfit.completeness}% Compleet
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1">{outfit.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{outfit.description}</p>
                  
                  {/* Explanation */}
                  <div className="mb-3 text-xs bg-white/10 p-2 rounded-lg">
                    <p className="text-white/80 italic">
                      {outfit.explanation}
                    </p>
                  </div>
                  
                  {/* Archetype info */}
                  {outfit.secondaryArchetype && outfit.mixFactor && outfit.mixFactor > 0.1 ? (
                    <div className="mb-3 text-xs bg-white/10 p-2 rounded-lg">
                      <span className="text-white/70">
                        {Math.round((1 - outfit.mixFactor) * 100)}% {getArchetypeName(outfit.archetype)} + {Math.round(outfit.mixFactor * 100)}% {getArchetypeName(outfit.secondaryArchetype)}
                      </span>
                    </div>
                  ) : (
                    <div className="mb-3 text-xs bg-white/10 p-2 rounded-lg">
                      <span className="text-white/70">
                        100% {getArchetypeName(outfit.archetype)}
                      </span>
                    </div>
                  )}
                  
                  {/* Structure info */}
                  {outfit.structure && outfit.structure.length > 0 && (
                    <div className="mb-3 text-xs bg-white/10 p-2 rounded-lg">
                      <span className="text-white/70">
                        Outfit structuur: {outfit.structure.map(cat => cat.toLowerCase()).join(' + ')}
                      </span>
                    </div>
                  )}
                  
                  {/* Season and weather info */}
                  {outfit.season && (
                    <div className="mb-3 text-xs bg-white/10 p-2 rounded-lg">
                      <span className="text-white/70">
                        Seizoen: {getDutchSeasonName(outfit.season as any)}
                        {outfit.weather && ` • Weer: ${outfit.weather}`}
                      </span>
                    </div>
                  )}
                  
                  {/* Product categories */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {outfit.products.map((product, index) => (
                      <span key={index} className="text-xs bg-white/10 px-2 py-0.5 rounded-full flex items-center">
                        <Tag size={10} className="mr-1" />
                        {product.type || product.category}
                      </span>
                    ))}
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {outfit.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                    {outfit.tags.length > 3 && (
                      <span className="text-xs text-white/60">
                        +{outfit.tags.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {outfit.products.length} items • €{outfit.products.reduce((sum, p) => sum + (p.price || 0), 0).toFixed(2)}
                    </span>
                    <div className="flex space-x-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        icon={<RefreshCw size={14} />}
                        iconPosition="left"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegenerateOutfit(index);
                        }}
                        disabled={isRegenerating || regenerationCount >= MAX_REGENERATIONS}
                        className="text-xs"
                      >
                        {isRegenerating ? 'Laden...' : 'Nieuwe look'}
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm"
                        icon={<ShoppingBag size={14} />}
                        iconPosition="left"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open first product or do something else
                          if (outfit.products[0]) {
                            handleProductClick(outfit.products[0]);
                          }
                        }}
                      >
                        Shop Look
                      </Button>
                    </div>
                  </div>
                  
                  {/* Regeneration limit warning */}
                  {regenerationCount >= MAX_REGENERATIONS && (
                    <div className="mt-2 text-xs text-orange-400">
                      Je hebt het maximale aantal regeneraties bereikt.
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Individual products */}
      <h2 className="text-xl font-bold mb-4">Individuele items voor jou</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matchedProducts.length > 0 ? (
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
                {product.season && product.season.length > 0 && (
                  <div className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white px-2 py-1 rounded-full text-xs font-medium">
                    {product.season.map(s => getDutchSeasonName(s as any)).join(', ')}
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white px-2 py-1 rounded-full text-xs font-medium">
                  {product.type || product.category}
                </div>
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
          <div>
            <h3 className="font-medium text-white mb-1">Databron: {dataSource === 'supabase' ? 'Supabase' : dataSource === 'zalando' ? 'Zalando' : 'Lokaal'}</h3>
            <p className="text-white/70 text-sm">
              {dataSource === 'supabase' 
                ? 'We gebruiken Supabase als databron voor je aanbevelingen.'
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
          <div>
            <h3 className="font-medium text-white mb-1">Over outfit regeneratie</h3>
            <p className="text-white/70 text-sm">
              Je kunt per sessie maximaal {MAX_REGENERATIONS} keer een nieuwe look genereren. 
              Elke nieuwe look is uniek en gebaseerd op jouw stijlvoorkeuren.
              {regenerationCount > 0 && ` Je hebt ${regenerationCount} van de ${MAX_REGENERATIONS} regeneraties gebruikt.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get a readable archetype name
function getArchetypeName(archetypeId: string): string {
  const archetypeNames: Record<string, string> = {
    'klassiek': 'Klassiek',
    'casual_chic': 'Casual Chic',
    'urban': 'Urban',
    'streetstyle': 'Streetstyle',
    'retro': 'Retro',
    'luxury': 'Luxury'
  };
  
  return archetypeNames[archetypeId] || archetypeId;
}

export default EnhancedResultsPage;