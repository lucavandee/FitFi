import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../context/UserContext";
import { Card, CardContent } from "../components/ui/card";
import { Loader } from "../components/Loader";
import ImageWithFallback from "../components/ui/ImageWithFallback";
import Button from "../components/ui/Button";
import { ShoppingBag } from "lucide-react";
import { Product, UserProfile, Outfit, generateRecommendations } from "../engine";

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
        console.log('Generating recommendations for user:', user.name);
        
        // Use the recommendation engine to generate outfits
        const generatedOutfits = generateRecommendations(user);
        
        // Set outfits
        setOutfits(generatedOutfits);
        
        // Extract all products from outfits for the product grid
        const allProducts = generatedOutfits.flatMap(outfit => outfit.products);
        
        // Remove duplicates by ID
        const uniqueProducts = allProducts.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        );
        
        setMatchedProducts(uniqueProducts);
        
      } catch (err) {
        console.error('Error generating recommendations:', err);
        setError('Er is een fout opgetreden bij het genereren van aanbevelingen.');
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
        item_name: product.name
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
      
      {/* User profile summary */}
      <div className="bg-white/5 p-4 rounded-lg mb-6">
        <p className="text-white/80">
          Hallo {user.name || 'daar'}! Deze aanbevelingen zijn gebaseerd op jouw {user.gender === 'male' ? 'mannelijke' : 'vrouwelijke'} stijlvoorkeuren.
        </p>
      </div>
      
      {/* Outfits section */}
      {outfits.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Complete outfits voor jou</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outfits.map((outfit) => (
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
                  <div className="absolute bottom-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {outfit.matchPercentage}% Match
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1">{outfit.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{outfit.description}</p>
                  
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Individual products */}
      <h2 className="text-xl font-bold mb-4">Individuele items voor jou</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matchedProducts.map((product, index) => (
          <Card 
            key={`${product.id}-${index}`} 
            className="overflow-hidden cursor-pointer hover:border-orange-500/50 transition-colors"
            onClick={() => handleProductClick(product)}
          >
            <div className="h-60 bg-gray-800">
              <ImageWithFallback
                src={product.imageUrl || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover"
                componentName="ProductCard"
              />
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
        ))}
      </div>
    </div>
  );
};

export default EnhancedResultsPage;