import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../context/UserContext";
import { Card, CardContent } from "../components/ui/card";
import { Loader } from "../components/Loader";
import dutchProducts from "../data/dutchProducts"; 
import ImageWithFallback from "../components/ui/ImageWithFallback";
import Button from "../components/ui/Button";
import { ShoppingBag } from "lucide-react";

// Toggle to enable/disable Supabase
const USE_SUPABASE = false;

// Fallback user if there's no context or localStorage-user
const fallbackUser = {
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

// Product type definition
interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  type?: string;
  styleTags?: string[];
  description?: string;
  price?: number;
  brand?: string;
  affiliateUrl?: string;
  matchScore?: number;
}

// Outfit type definition
interface Outfit {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  products: Product[];
  matchPercentage: number;
}

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

  // Calculate match score based on stylePreferences
  const calculateScore = (product: Product) => {
    if (!product.styleTags || !user?.stylePreferences) return 0;

    return product.styleTags.reduce((score, tag) => {
      const preference = user.stylePreferences[tag as keyof typeof user.stylePreferences] || 0;
      return score + preference;
    }, 0);
  };

  // Generate outfits from products
  const generateOutfits = (products: Product[]): Outfit[] => {
    if (products.length < 3) return [];
    
    // Group products by type
    const productsByType: Record<string, Product[]> = {};
    products.forEach(product => {
      const type = product.type || 'Other';
      if (!productsByType[type]) {
        productsByType[type] = [];
      }
      productsByType[type].push(product);
    });
    
    // Generate 3 outfits with different combinations
    const outfits: Outfit[] = [];
    
    // Try to create outfits with different product types
    for (let i = 0; i < 3; i++) {
      const outfitProducts: Product[] = [];
      
      // Try to get one product of each type
      Object.keys(productsByType).forEach(type => {
        if (productsByType[type].length > 0) {
          // Get a product we haven't used yet if possible
          const availableProducts = productsByType[type].filter(
            p => !outfits.some(o => o.products.some(op => op.id === p.id))
          );
          
          if (availableProducts.length > 0) {
            outfitProducts.push(availableProducts[0]);
          } else if (productsByType[type].length > 0) {
            // Reuse a product if necessary
            outfitProducts.push(productsByType[type][0]);
          }
        }
      });
      
      if (outfitProducts.length >= 2) {
        // Calculate average match score for the outfit
        const avgMatchScore = outfitProducts.reduce(
          (sum, p) => sum + (p.matchScore || 0), 
          0
        ) / outfitProducts.length;
        
        outfits.push({
          id: `outfit-${i + 1}`,
          title: `Outfit ${i + 1}`,
          description: `Een perfecte combinatie voor jouw ${user.gender === 'male' ? 'mannelijke' : 'vrouwelijke'} stijl.`,
          imageUrl: outfitProducts[0]?.imageUrl || '/placeholder.png',
          products: outfitProducts,
          matchPercentage: Math.round(avgMatchScore * 20) // Convert to percentage
        });
      }
    }
    
    console.log('Generated outfits:', outfits.length);
    return outfits;
  };

  // Fetch products and generate recommendations
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Determine user's style profile
        const userStyle = determineUserStyle(user);
        console.log('Profile type:', userStyle);
        
        let products: Product[] = [];
        
        if (USE_SUPABASE) {
          // This section is disabled but kept for future reactivation
          console.log('Supabase is disabled – using fallback data');
          
          // Simulate Supabase products (would be replaced with actual Supabase call)
          const supabaseProducts: Product[] = [];
          console.log('Supabase products found:', supabaseProducts.length);
          
          if (supabaseProducts.length > 0) {
            products = supabaseProducts;
          } else {
            console.log('No Supabase products found, using curated products fallback');
            products = getCuratedProductsByStyle(userStyle);
          }
        } else {
          // Use local data directly
          console.log('Supabase uitgeschakeld – fallback actief');
          products = getCuratedProductsByStyle(userStyle);
        }
        
        // Calculate match scores and sort products
        const productsWithScores = products.map(product => ({
          ...product,
          matchScore: calculateScore(product)
        })).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        
        console.log('Curated products found:', productsWithScores.length);
        
        // Ensure we have at least 6 products by duplicating if necessary
        let finalProducts = [...productsWithScores];
        while (finalProducts.length < 6 && productsWithScores.length > 0) {
          finalProducts = [...finalProducts, ...productsWithScores.slice(0, Math.min(6 - finalProducts.length, productsWithScores.length))];
        }
        
        setMatchedProducts(finalProducts);
        
        // Generate outfits from products
        const generatedOutfits = generateOutfits(finalProducts);
        console.log('Generated outfits:', generatedOutfits.length);
        setOutfits(generatedOutfits);
        
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Er is een fout opgetreden bij het laden van de producten.');
        
        // Use fallback products in case of error
        const fallbackProducts = getCuratedProductsByStyle('casual_chic');
        setMatchedProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [user]);

  // Determine user style based on preferences
  const determineUserStyle = (user: any): string => {
    if (!user || !user.stylePreferences) return 'casual_chic';
    
    const prefs = user.stylePreferences;
    
    // Find the highest preference
    const highestPref = Object.entries(prefs).reduce(
      (highest, [key, value]) => (value > highest.value ? { key, value } : highest),
      { key: '', value: 0 }
    );
    
    // Map preference to style
    const styleMap: Record<string, string> = {
      casual: 'casual_chic',
      formal: 'klassiek',
      sporty: 'urban',
      vintage: 'retro',
      minimalist: 'luxury'
    };
    
    return styleMap[highestPref.key] || 'casual_chic';
  };

  // Get curated products by style
  const getCuratedProductsByStyle = (style: string): Product[] => {
    // Convert Dutch products to our Product interface
    return dutchProducts.map(product => ({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl || '/placeholder.png',
      type: product.type,
      styleTags: product.styleTags,
      description: `Prachtige ${product.type?.toLowerCase() || 'item'} in ${product.styleTags?.join(', ') || 'veelzijdige'} stijl.`,
      price: Math.floor(Math.random() * 100) + 20, // Random price between 20-120
      brand: product.brand || 'FitFi Collection',
      affiliateUrl: product.affiliateUrl || '#'
    }));
  };

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
              <Card key={outfit.id} className="overflow-hidden">
                <div className="relative h-60">
                  <ImageWithFallback
                    src={outfit.imageUrl}
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
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {outfit.products.length} items • €{outfit.products.reduce((sum, p) => sum + (p.price || 0), 0).toFixed(2)}
                    </span>
                    <Button 
                      variant="primary" 
                      size="sm"
                      icon={<ShoppingBag size={14} />}
                      iconPosition="left"
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