import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Sparkles, 
  Star,
  ExternalLink
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { DUTCH_ARCHETYPES, mapAnswersToArchetype, getArchetypeById } from '../config/profile-mapping.js';
import curatedProducts from '../config/curated-products.json';

interface ProfileVariant {
  title: string;
  subtitle: string;
  imageHero: string;
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
  sizes: string[];
  inStock: boolean;
}

const profileVariants: Record<string, ProfileVariant[]> = {
  klassiek: [
    {
      title: "Jouw Klassieke Stijl is Tijdloos",
      subtitle: "Elegantie en verfijning - jij weet wat echte klasse is.",
      imageHero: "https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Verfijnde Elegantie Gedefinieerd",
      subtitle: "Jouw klassieke benadering zorgt ervoor dat je altijd stijlvol bent, ongeacht de trends.",
      imageHero: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Tijdloze Sophistication",
      subtitle: "Kwaliteit boven kwantiteit, elegantie boven trends - jouw garderobe straalt klasse uit.",
      imageHero: "https://images.pexels.com/photos/1049317/pexels-photo-1049317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Klassieke Perfectie",
      subtitle: "Jouw stijl opent deuren en maakt indruk - elegantie is jouw tweede natuur.",
      imageHero: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Eeuwige Elegantie",
      subtitle: "Jij investeert in stukken die generaties meegaan - echte stijl vervaagt nooit.",
      imageHero: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ],
  casual_chic: [
    {
      title: "Moeiteloos Chic - Dat Ben Jij",
      subtitle: "Relaxed maar altijd stijlvol - jij maakt van comfort een kunst.",
      imageHero: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Casual Perfectie Gedefinieerd",
      subtitle: "Jouw effortless elegantie is wat iedereen wil bereiken maar weinigen beheersen.",
      imageHero: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Relaxed Elegantie",
      subtitle: "Comfort en stijl gaan hand in hand - jij bewijst dat je niet hoeft te kiezen.",
      imageHero: "https://images.pexels.com/photos/4066293/pexels-photo-4066293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Effortless Style Icon",
      subtitle: "Jouw natuurlijke gevoel voor stijl maakt elke dag tot een fashion statement.",
      imageHero: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Moderne Elegantie",
      subtitle: "Jij begrijpt dat echte stijl niet hoeft te schreeuwen - subtiliteit is jouw kracht.",
      imageHero: "https://images.pexels.com/photos/6764034/pexels-photo-6764034.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ],
  urban: [
    {
      title: "Urban Warrior - Dat Ben Jij",
      subtitle: "Stoer, functioneel en altijd ready voor de stad - jouw stijl heeft attitude.",
      imageHero: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "City Life Champion",
      subtitle: "Jouw urban look combineert functionaliteit met stijl - perfect voor het moderne stadsleven.",
      imageHero: "https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Stoere Stadsstijl",
      subtitle: "Praktisch maar nooit saai - jij maakt van functionaliteit een fashion statement.",
      imageHero: "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Urban Explorer",
      subtitle: "De stad is jouw speeltuin en jouw stijl is er klaar voor - tough maar verfijnd.",
      imageHero: "https://images.pexels.com/photos/2529157/pexels-photo-2529157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Metropolitan Style",
      subtitle: "Jouw look is net zo dynamisch als de stad waarin je leeft - altijd in beweging.",
      imageHero: "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ],
  streetstyle: [
    {
      title: "Streetstyle Koning/Koningin",
      subtitle: "Authentiek, gedurfd en altijd op de hoogte - jouw stijl zet trends.",
      imageHero: "https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Urban Trendsetter",
      subtitle: "Jij volgt geen trends, jij creëert ze - streetwear is jouw canvas.",
      imageHero: "https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Authentieke Street Vibes",
      subtitle: "Jouw stijl komt van de straat en spreekt tot de ziel - echt en ongepolijst.",
      imageHero: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Creative Expression Master",
      subtitle: "Mode is jouw vorm van kunst - elke outfit vertelt een verhaal.",
      imageHero: "https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Street Culture Icon",
      subtitle: "Jij begrijpt dat streetstyle meer is dan kleding - het is een lifestyle.",
      imageHero: "https://images.pexels.com/photos/6764034/pexels-photo-6764034.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ],
  retro: [
    {
      title: "Vintage Soul met Moderne Twist",
      subtitle: "Jouw retro stijl brengt het beste van vroeger naar vandaag - nostalgie die inspireert.",
      imageHero: "https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Retro Revival Champion",
      subtitle: "Jij weet dat goede stijl cyclisch is - wat oud is, wordt weer nieuw.",
      imageHero: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Vintage Visionary",
      subtitle: "Jouw liefde voor retro mode toont dat echte stijl tijdloos is.",
      imageHero: "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Nostalgische Trendsetter",
      subtitle: "Jij maakt van vintage een statement - het verleden is jouw inspiratie.",
      imageHero: "https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Retro Perfectionist",
      subtitle: "Jouw oog voor vintage details maakt elke outfit tot een tijdreis.",
      imageHero: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ],
  luxury: [
    {
      title: "Luxury Connoisseur",
      subtitle: "Jij begrijpt dat echte luxe in de details zit - kwaliteit is jouw standaard.",
      imageHero: "https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Premium Style Authority",
      subtitle: "Jouw smaak voor het fijnste toont dat je weet wat echte waarde betekent.",
      imageHero: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Exclusieve Elegantie",
      subtitle: "Jij investeert in stukken die een leven lang meegaan - luxe is jouw lifestyle.",
      imageHero: "https://images.pexels.com/photos/1049317/pexels-photo-1049317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Sophisticated Luxury",
      subtitle: "Jouw verfijnde smaak straalt uit in elk detail - subtiele luxe is jouw kenmerk.",
      imageHero: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      title: "Premium Perfectionist",
      subtitle: "Jij weet dat echte luxe niet opschept maar spreekt door kwaliteit en vakmanschap.",
      imageHero: "https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ]
};

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const answers = location.state?.answers || {};
  const [selectedVariant, setSelectedVariant] = useState<ProfileVariant | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [archetypeInfo, setArchetypeInfo] = useState<any>(null);

  useEffect(() => {
    // Determine archetype based on answers
    const archetypeId = mapAnswersToArchetype(answers);
    const archetype = getArchetypeById(archetypeId);
    setArchetypeInfo(archetype);
    
    // Get variants for this archetype
    const variants = profileVariants[archetypeId] || profileVariants.casual_chic;
    
    // Select random variant
    const randomVariant = variants[Math.floor(Math.random() * variants.length)];
    setSelectedVariant(randomVariant);
    
    // Get curated products for this archetype
    const profile = curatedProducts.profiles.find(p => p.id === archetypeId);
    if (profile && profile.items) {
      setRecommendedProducts(profile.items.slice(0, 6)); // Show max 6 products
    }
  }, [answers]);

  const handleProductClick = (product: Product) => {
    // Track product click
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'product_click', {
        event_category: 'ecommerce',
        event_label: `${product.retailer}_${product.id}`,
        item_id: product.id,
        item_name: product.name,
        item_brand: product.brand,
        item_category: product.category,
        price: product.price,
        currency: 'EUR'
      });
    }
    
    // Open product page
    window.open(product.url, '_blank', 'noopener,noreferrer');
  };

  if (!selectedVariant || !archetypeInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Jouw stijladvies wordt gegenereerd...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <div className="py-10 max-w-screen-md mx-auto px-4">
        <div className="text-center mb-8">
          {/* Archetype Badge */}
          <div className="inline-flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="text-lg">{archetypeInfo.icon}</span>
            <span>{archetypeInfo.displayName}</span>
            <span className="text-lg">{archetypeInfo.emoji}</span>
          </div>
          
          <div className="relative mb-6">
            <img 
              src={selectedVariant.imageHero} 
              alt="Your Style" 
              className="w-full h-96 object-cover rounded-xl shadow-lg"
            />
            <div className="absolute top-4 right-4 bg-orange-500/90 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
              <Sparkles size={16} className="mr-1" />
              Perfect Match
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {selectedVariant.title}
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            {selectedVariant.subtitle}
          </p>
          
          <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 mb-6">
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {archetypeInfo.description}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button 
          onClick={() => {
            // Calculate total price
            const totalPrice = recommendedProducts.reduce((sum, product) => sum + product.price, 0);
            
            // Track complete look click
            if (typeof window.gtag === 'function') {
              window.gtag('event', 'complete_look_click', {
                event_category: 'ecommerce',
                event_label: archetypeInfo.id,
                value: totalPrice,
                currency: 'EUR'
              });
            }
            
            // For now, just scroll to products
            document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg my-6 font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
        >
          <ShoppingBag size={20} />
          <span>Shop Complete Look</span>
        </button>
      </div>

      {/* Products Grid */}
      <div id="products-section" className="py-10 max-w-screen-md mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Curated voor jouw {archetypeInfo.displayName} stijl
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          Handpicked items die perfect passen bij jouw persoonlijkheid
        </p>
        
        {recommendedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedProducts.map(product => (
              <div 
                key={product.id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <div className="relative">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                    {product.retailer}
                  </div>
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">Uitverkocht</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {product.brand} • {product.category}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      €{product.price.toFixed(2)}
                    </span>
                    <div className="flex items-center text-yellow-400">
                      <Star size={14} className="fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">4.8</span>
                    </div>
                  </div>
                  
                  {/* Sizes */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Beschikbare maten:</div>
                    <div className="flex flex-wrap gap-1">
                      {product.sizes.slice(0, 4).map((size, index) => (
                        <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                          {size}
                        </span>
                      ))}
                      {product.sizes.length > 4 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{product.sizes.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                      Bekijk details →
                    </span>
                    <ExternalLink size={14} className="text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Geen producten beschikbaar voor dit archetype.
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="py-10 max-w-screen-md mx-auto px-4 text-center">
        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto"
          >
            Ga naar Dashboard
          </Button>
          
          <div>
            <button
              onClick={() => navigate('/quiz/1')}
              className="text-orange-500 hover:text-orange-600 transition-colors text-sm font-medium"
            >
              Quiz opnieuw doen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;