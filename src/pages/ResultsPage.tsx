import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Sparkles, 
  Star,
  ExternalLink,
  Heart,
  Share2,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  Download,
  Zap,
  Award,
  TrendingUp
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

interface OutfitCombination {
  id: string;
  name: string;
  description: string;
  matchPercentage: number;
  items: Product[];
  totalPrice: number;
  tags: string[];
  occasion: string[];
  psychologicalTrigger: string;
  urgencyMessage: string;
  personalizedMessage: string;
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

// Generate mock outfits based on archetype
const generateOutfits = (archetypeId: string, products: Product[]): OutfitCombination[] => {
  const outfits: OutfitCombination[] = [];
  
  // Create 2-3 outfits from the products
  const numOutfits = Math.min(3, Math.floor(products.length / 2));
  
  for (let i = 0; i < numOutfits; i++) {
    // Select 2-4 products for this outfit
    const numProducts = Math.min(4, products.length - i * 2);
    const outfitProducts = products.slice(i * 2, i * 2 + numProducts);
    
    // Calculate total price
    const totalPrice = outfitProducts.reduce((sum, product) => sum + product.price, 0);
    
    // Generate random match percentage between 85-98%
    const matchPercentage = Math.floor(Math.random() * 14) + 85;
    
    // Generate random tags based on archetype
    const tags = [];
    const archetype = DUTCH_ARCHETYPES[archetypeId];
    if (archetype) {
      // Add 3-5 random keywords from the archetype
      const keywords = [...archetype.keywords];
      const numTags = Math.min(5, keywords.length);
      for (let j = 0; j < numTags; j++) {
        const randomIndex = Math.floor(Math.random() * keywords.length);
        tags.push(keywords.splice(randomIndex, 1)[0]);
      }
    }
    
    // Generate random occasions based on archetype
    const occasions = [];
    if (archetype) {
      // Add 2-3 random occasions from the archetype
      const archetypeOccasions = [...archetype.occasions];
      const numOccasions = Math.min(3, archetypeOccasions.length);
      for (let j = 0; j < numOccasions; j++) {
        const randomIndex = Math.floor(Math.random() * archetypeOccasions.length);
        occasions.push(archetypeOccasions.splice(randomIndex, 1)[0]);
      }
    }
    
    // Create the outfit
    outfits.push({
      id: `outfit_${archetypeId}_${i}`,
      name: `${archetype?.displayName || 'Stijlvolle'} Look ${i + 1}`,
      description: `Een perfecte ${archetype?.displayName.toLowerCase() || 'stijlvolle'} outfit voor ${occasions.join(', ') || 'elke gelegenheid'}.`,
      matchPercentage,
      items: outfitProducts,
      totalPrice,
      tags,
      occasion: occasions,
      psychologicalTrigger: `Deze outfit is speciaal samengesteld voor jouw ${archetype?.displayName.toLowerCase() || 'unieke'} stijl en past perfect bij jouw persoonlijkheid.`,
      urgencyMessage: "Beperkte beschikbaarheid - deze items zijn populair en kunnen snel uitverkocht raken!",
      personalizedMessage: `Jij hebt een natuurlijk gevoel voor ${archetype?.displayName.toLowerCase() || 'stijlvolle'} mode. Deze combinatie zal je zelfvertrouwen en uitstraling versterken.`
    });
  }
  
  return outfits;
};

// Style tips based on archetype
const getStyleTips = (archetypeId: string): string[] => {
  const tips: Record<string, string[]> = {
    klassiek: [
      "Investeer in tijdloze stukken van hoge kwaliteit die jaren meegaan.",
      "Kies voor een neutrale kleurenpalet met navy, beige, wit en zwart als basis.",
      "Let op de pasvorm - goed passende kleding is essentieel voor een klassieke look.",
      "Accessoires houden het subtiel en elegant, zoals parels of een mooi horloge."
    ],
    casual_chic: [
      "Mix casual items zoals jeans met meer verfijnde stukken zoals een blazer.",
      "Kies voor comfortabele maar stijlvolle basics in natuurlijke materialen.",
      "Accessoires kunnen je look upgraden - denk aan een statement tas of mooie sjaal.",
      "Laagjes zijn je vriend voor een moeiteloze casual chic look."
    ],
    urban: [
      "Functionele items met een stijlvolle twist zijn perfect voor jouw urban look.",
      "Experimenteer met texturen en technische materialen voor een moderne uitstraling.",
      "Sneakers zijn een must-have voor jouw stijl - investeer in een paar kwaliteitsmodellen.",
      "Denk aan praktische accessoires zoals een crossbody tas of rugzak."
    ],
    streetstyle: [
      "Durf te experimenteren met opvallende kleuren en prints.",
      "Mix high-end met streetwear merken voor een authentieke look.",
      "Oversized silhouetten en laagjes werken goed voor jouw stijl.",
      "Statement sneakers of boots kunnen je hele outfit maken."
    ],
    retro: [
      "Combineer vintage stukken met moderne basics voor een hedendaagse look.",
      "Zoek naar kwaliteitsvolle vintage items die de tand des tijds doorstaan.",
      "Experimenteer met verschillende decennia voor een unieke stijl.",
      "Accessoires uit verschillende tijdperken kunnen je outfit compleet maken."
    ],
    luxury: [
      "Investeer in hoogwaardige materialen zoals kasjmier, zijde en fijn leer.",
      "Let op de details - perfecte afwerking en subtiele logo's zijn kenmerkend voor luxe.",
      "Kies voor een verfijnde kleurenpalet met af en toe een statement stuk.",
      "Kwaliteit boven kwantiteit - enkele perfecte stukken zijn beter dan veel middelmatige items."
    ]
  };
  
  return tips[archetypeId] || tips.casual_chic;
};

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, saveRecommendation } = useUser();
  
  const answers = location.state?.answers || {};
  const [selectedVariant, setSelectedVariant] = useState<ProfileVariant | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [outfitCombinations, setOutfitCombinations] = useState<OutfitCombination[]>([]);
  const [archetypeInfo, setArchetypeInfo] = useState<any>(null);
  const [styleTips, setStyleTips] = useState<string[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<string[]>([]);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    // Determine archetype based on answers
    const archetypeId = mapAnswersToArchetype(answers);
    const archetype = getArchetypeById(archetypeId);
    setArchetypeInfo(archetype);
    
    // Get style tips
    setStyleTips(getStyleTips(archetypeId));
    
    // Get variants for this archetype
    const variants = profileVariants[archetypeId] || profileVariants.casual_chic;
    
    // Select random variant
    const randomVariant = variants[Math.floor(Math.random() * variants.length)];
    setSelectedVariant(randomVariant);
    
    // Get curated products for this archetype
    const profile = curatedProducts.profiles.find(p => p.id === archetypeId);
    if (profile && profile.items) {
      const products = profile.items.map(item => ({
        ...item,
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        imageUrl: item.imageUrl,
        url: item.url,
        retailer: item.retailer,
        category: item.category,
        sizes: item.sizes,
        inStock: item.inStock
      }));
      
      setRecommendedProducts(products);
      
      // Generate outfit combinations
      const outfits = generateOutfits(archetypeId, products);
      setOutfitCombinations(outfits);
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

  const handleOutfitClick = (outfit: OutfitCombination) => {
    // Calculate total price
    const totalPrice = outfit.items.reduce((sum, product) => sum + product.price, 0);
    
    // Track complete look click
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'complete_look_click', {
        event_category: 'ecommerce',
        event_label: outfit.id,
        value: totalPrice,
        currency: 'EUR'
      });
    }
    
    // For now, just scroll to products
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveOutfit = (outfitId: string) => {
    if (savedOutfits.includes(outfitId)) {
      setSavedOutfits(savedOutfits.filter(id => id !== outfitId));
    } else {
      setSavedOutfits([...savedOutfits, outfitId]);
      
      // Save to user profile if logged in
      if (user) {
        saveRecommendation(outfitId);
      }
      
      // Track save event
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'save_outfit', {
          event_category: 'engagement',
          event_label: outfitId
        });
      }
    }
  };

  const handleShare = async () => {
    setShowShareOptions(!showShareOptions);
    
    // Track share intent
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'share_intent', {
        event_category: 'engagement',
        event_label: 'results_page'
      });
    }
  };

  const handleShareOption = async (platform: string) => {
    setShowShareOptions(false);
    
    const shareText = `Ik heb mijn perfecte stijl ontdekt met FitFi! ${selectedVariant?.title} - Check het uit op FitFi.nl`;
    
    if (navigator.share && platform === 'native') {
      try {
        await navigator.share({
          title: 'Mijn FitFi Stijlresultaten',
          text: shareText,
          url: window.location.href
        });
        
        // Track successful share
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'share_complete', {
            event_category: 'engagement',
            event_label: 'native_share'
          });
        }
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Implement platform-specific sharing
      let shareUrl = '';
      
      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + window.location.href)}`;
          break;
        case 'email':
          shareUrl = `mailto:?subject=${encodeURIComponent('Mijn FitFi Stijlresultaten')}&body=${encodeURIComponent(shareText + '\n\n' + window.location.href)}`;
          break;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank');
        
        // Track platform-specific share
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'share_complete', {
            event_category: 'engagement',
            event_label: platform
          });
        }
      }
    }
  };

  const handleDownload = () => {
    setShowDownloadOptions(!showDownloadOptions);
    
    // Track download intent
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'download_intent', {
        event_category: 'engagement',
        event_label: 'results_page'
      });
    }
  };

  const handleDownloadOption = (format: string) => {
    setShowDownloadOptions(false);
    setIsGeneratingPDF(true);
    
    // Simulate PDF generation
    setTimeout(() => {
      setIsGeneratingPDF(false);
      
      // Track download complete
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'download_complete', {
          event_category: 'engagement',
          event_label: format
        });
      }
      
      // Show success message or trigger download
      alert(`Je stijlrapport is gedownload in ${format.toUpperCase()} formaat!`);
    }, 2000);
  };

  const userName = user?.name?.split(' ')[0] || '';

  if (!selectedVariant || !archetypeInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Jouw stijladvies wordt gegenereerd...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Onze AI analyseert je voorkeuren en stelt je persoonlijke stijlprofiel samen
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <div className="py-10 max-w-screen-lg mx-auto px-4">
        <div className="text-center mb-8">
          {/* Success Message */}
          <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CheckCircle size={16} />
            <span>Stijlanalyse voltooid</span>
          </div>
          
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
            
            {/* Action buttons */}
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <div className="relative">
                <button 
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  aria-label="Deel resultaten"
                >
                  <Share2 size={20} />
                </button>
                
                {showShareOptions && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 min-w-[150px] animate-fade-in">
                    <div className="flex flex-col space-y-2">
                      <button 
                        onClick={() => handleShareOption('native')}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      >
                        <Share2 size={16} className="mr-2" />
                        Delen
                      </button>
                      <button 
                        onClick={() => handleShareOption('facebook')}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      >
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                        </svg>
                        Facebook
                      </button>
                      <button 
                        onClick={() => handleShareOption('twitter')}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      >
                        <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                        Twitter
                      </button>
                      <button 
                        onClick={() => handleShareOption('whatsapp')}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      >
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                      </button>
                      <button 
                        onClick={() => handleShareOption('email')}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      >
                        <Mail size={16} className="mr-2" />
                        E-mail
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button 
                  onClick={handleDownload}
                  className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  aria-label="Download resultaten"
                >
                  <Download size={20} />
                </button>
                
                {showDownloadOptions && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 min-w-[150px] animate-fade-in">
                    <div className="flex flex-col space-y-2">
                      <button 
                        onClick={() => handleDownloadOption('pdf')}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        disabled={isGeneratingPDF}
                      >
                        {isGeneratingPDF ? (
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.819 14.427c.064.267.077.679-.021.948-.128.351-.381.528-.754.528h-.637v-2.12h.496c.474 0 .803.173.916.644zm3.091-8.65c2.047.479 4.805.281 6.09-1.179-1.494 1.998-5.23 5.708-7.432 7.909 1.594 1.406 2.219 3.48 2.919 5.224-1.251-.114-2.244-.226-3.498-.226-1.425 0-2.589.112-3.911.226.7-1.744 1.324-3.818 2.919-5.224-2.202-2.201-5.938-5.911-7.432-7.909 1.285 1.46 4.043 1.658 6.09 1.179 0 0 .396-3.632.397-3.632.49.628 1.185 1.631 1.731 2.248.542-.617 1.239-1.62 1.73-2.248l.397 3.632zm-9.91 1.023c-1.639.233-3.368.06-4.899-.749 1.616 2.032 3.589 4.159 5.552 6.311-.288.3-.534.828-.534 1.306 0 1.196.027 1.83 1.054 2.318-.063.193-.171.364-.306.475-.842.691-2.661.841-3.615.932.196.396.348.773.524 1.158 1.268-.238 2.46-.401 3.656-.311.22.016.451.055.673.121.209.061.412.145.633.199.273.068.558.101.812.22.125.058.262.142.35.262.112.154.102.361.112.543.017.292.022.185.023.463h-13.504c-.166 0-.302.138-.302.306 0 .167.136.304.302.304h13.504c.001.2.005.147.006.299 0 .121.015.245-.021.362-.058.186-.201.335-.407.382-.29.067-.595.069-.891.069h-12.191c-.166 0-.302.138-.302.306 0 .167.136.304.302.304h12.191c.358 0 .716.002 1.054-.105.67-.212.967-.779.967-1.469 0-.448-.012-.968-.198-1.39.294-.22.521-.489.669-.78.3-.59.369-1.359.022-1.941.116-.095.254-.145.328-.271.131-.224.081-.54.04-.784-.046-.272-.084-.448-.183-.673.183.024.356.09.53.147.65.214 1.325.376 2.002.484.17.027.342.048.511.105.406.14.435.518.439.9.002.123.003.24.003.362 0 .166.136.304.302.304.165 0 .301-.138.301-.304 0-.105-.002-.211-.003-.316.001-.303.013-.611-.092-.894-.11-.3-.326-.58-.614-.727-.474-.242-1.1-.291-1.609-.379.16-.385.312-.762.524-1.158-.954-.091-2.773-.241-3.615-.932-.135-.111-.243-.282-.306-.475 1.027-.488 1.054-1.122 1.054-2.318 0-.478-.246-1.006-.534-1.306 1.963-2.152 3.936-4.279 5.552-6.311-1.531.809-3.26.982-4.899.749l.198-1.816c-1.106 1.31-2.608 2.521-4.071 2.521-1.463 0-2.965-1.211-4.071-2.521l.198 1.816z" />
                          </svg>
                        )}
                        PDF Rapport
                      </button>
                      <button 
                        onClick={() => handleDownloadOption('jpg')}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      >
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z" />
                        </svg>
                        Afbeelding
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {userName ? `${userName}, ${selectedVariant.title.toLowerCase()}` : selectedVariant.title}
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6 max-w-3xl mx-auto">
            {selectedVariant.subtitle}
          </p>
          
          <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 mb-6 max-w-3xl mx-auto">
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {archetypeInfo.description}
            </p>
          </div>
        </div>

        {/* Style Tips Section - NEW */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mr-4">
                <Sparkles className="text-purple-500" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Stijltips voor jouw {archetypeInfo.displayName} look
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {styleTips.map((tip, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3 mt-0.5">
                    <span className="text-purple-500 text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Outfit Combinations - NEW */}
        {outfitCombinations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Complete outfits voor jou
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {outfitCombinations.map((outfit) => (
                <div 
                  key={outfit.id} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {outfit.name}
                      </h3>
                      <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <Star size={14} className="mr-1 fill-current" />
                        {outfit.matchPercentage}% Match
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {outfit.description}
                    </p>
                    
                    {/* Outfit items */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {outfit.items.map((item, index) => (
                        <div 
                          key={index}
                          className="relative group cursor-pointer"
                          onClick={() => handleProductClick(item)}
                        >
                          <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded text-xs font-medium">
                              €{item.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Psychological triggers */}
                    <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                        {outfit.psychologicalTrigger}
                      </p>
                    </div>
                    
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300 italic">
                        {outfit.personalizedMessage}
                      </p>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {outfit.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Price and actions */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          €{outfit.totalPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          complete look
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveOutfit(outfit.id)}
                          className={`p-2 rounded-full transition-colors ${
                            savedOutfits.includes(outfit.id)
                              ? 'bg-orange-100 text-orange-500 dark:bg-orange-900/30'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          aria-label={savedOutfits.includes(outfit.id) ? 'Verwijder uit favorieten' : 'Opslaan in favorieten'}
                        >
                          {savedOutfits.includes(outfit.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                        </button>
                        
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOutfitClick(outfit)}
                          icon={<ShoppingBag size={16} />}
                          iconPosition="left"
                        >
                          Shop Look
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
      <div id="products-section" className="py-10 max-w-screen-lg mx-auto px-4">
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
                  
                  {/* Quick actions */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white/90 dark:bg-gray-800/90 p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors">
                      <Heart size={14} className="text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
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
                  
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product);
                    }}
                    icon={<ShoppingBag size={14} />}
                    iconPosition="left"
                  >
                    Koop bij {product.retailer}
                  </Button>
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

      {/* Premium Upsell - NEW */}
      {!user?.isPremium && (
        <div className="py-10 max-w-screen-lg mx-auto px-4">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-8 md:flex items-center">
              <div className="md:w-2/3 mb-6 md:mb-0">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Upgrade naar Premium voor meer stijladvies
                </h2>
                <div className="space-y-3 text-white/90">
                  <div className="flex items-start">
                    <CheckCircle className="text-white mr-3 mt-0.5 flex-shrink-0" size={18} />
                    <p>Onbeperkte outfit aanbevelingen op basis van jouw stijlprofiel</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="text-white mr-3 mt-0.5 flex-shrink-0" size={18} />
                    <p>Seizoensgebonden updates om je garderobe actueel te houden</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="text-white mr-3 mt-0.5 flex-shrink-0" size={18} />
                    <p>Gedetailleerd stijladvies van onze AI-stylisten</p>
                  </div>
                </div>
              </div>
              <div className="md:w-1/3 md:pl-8">
                <Button 
                  as="a"
                  href="/prijzen" 
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="bg-white text-orange-600 hover:bg-gray-100"
                >
                  Upgrade naar Premium
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="py-10 max-w-screen-lg mx-auto px-4 text-center">
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