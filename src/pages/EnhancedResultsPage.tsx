import React, { useState, useEffect, useCallback } from 'react';
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
  AlertTriangle,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Send,
  CheckCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import OutfitCard from '../components/ui/OutfitCard';
import { useUser } from '../context/UserContext';
import { useGamification } from '../context/GamificationContext';
import { DUTCH_ARCHETYPES, mapAnswersToArchetype, getArchetypeById } from '../config/profile-mapping.js';
import curatedProducts from '../config/curated-products.json';

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

interface DailyStyleTip {
  id: string;
  tip: string;
  category: string;
}

const dailyStyleTips: DailyStyleTip[] = [
  {
    id: '1',
    tip: 'Draag nooit meer dan 3 kleuren tegelijk voor een gebalanceerde look.',
    category: 'Color Theory'
  },
  {
    id: '2',
    tip: 'Investeer in kwaliteitsschoenen - ze maken of breken je outfit.',
    category: 'Investment Pieces'
  },
  {
    id: '3',
    tip: 'De regel van derden: verdeel je outfit in 60% basis, 30% accent, 10% statement.',
    category: 'Proportions'
  },
  {
    id: '4',
    tip: 'Accessoires kunnen een simpele outfit instant upgraden naar chic.',
    category: 'Styling'
  },
  {
    id: '5',
    tip: 'Zorg dat je kleding goed past - tailoring is de sleutel tot elegantie.',
    category: 'Fit & Tailoring'
  }
];

// Generate explanations based on archetype and style
const generateExplanation = (archetypeId: string, occasionType: string): string => {
  const explanations: Record<string, Record<string, string[]>> = {
    klassiek: {
      werk: [
        "Deze outfit past perfect bij jouw klassieke stijl en is ideaal voor een professionele werkomgeving. De tijdloze snit en neutrale kleuren stralen verfijning uit.",
        "Voor jouw klassieke smaak hebben we deze werkoutfit samengesteld met hoogwaardige materialen en een elegante uitstraling die respect afdwingt."
      ],
      casual: [
        "Deze casual look behoudt de elegantie van jouw klassieke stijl, maar is ontspannen genoeg voor alledaagse activiteiten.",
        "Voor jouw klassieke voorkeur hebben we deze casual outfit samengesteld die comfort combineert met tijdloze elegantie."
      ],
      formeel: [
        "Deze formele outfit weerspiegelt jouw klassieke stijl met verfijnde details en een perfecte pasvorm voor speciale gelegenheden.",
        "Voor jouw klassieke smaak hebben we deze formele look gecreëerd die tijdloze elegantie uitstraalt en indruk maakt."
      ]
    },
    casual_chic: {
      werk: [
        "Deze outfit combineert de ontspannen elegantie van jouw casual chic stijl met professionele elementen, perfect voor een moderne werkomgeving.",
        "Voor jouw casual chic voorkeur hebben we deze werkoutfit samengesteld die moeiteloze elegantie uitstraalt zonder te formeel te zijn."
      ],
      casual: [
        "Deze look belichaamt jouw casual chic stijl met een perfecte balans tussen comfort en verfijning voor dagelijks gebruik.",
        "Voor jouw casual chic smaak hebben we deze ontspannen maar stijlvolle outfit samengesteld die veelzijdigheid biedt."
      ],
      formeel: [
        "Deze formele outfit behoudt de ontspannen elegantie van jouw casual chic stijl, maar is verfijnd genoeg voor speciale gelegenheden.",
        "Voor jouw casual chic voorkeur hebben we deze formele look gecreëerd die sophisticated is zonder stijf te zijn."
      ]
    },
    urban: {
      werk: [
        "Deze outfit brengt jouw urban stijl naar een professionele setting met functionele elementen en een moderne uitstraling.",
        "Voor jouw urban voorkeur hebben we deze werkoutfit samengesteld die praktisch en stijlvol is voor het stadsleven."
      ],
      casual: [
        "Deze casual look weerspiegelt jouw urban stijl met functionele details en een coole uitstraling voor het dagelijks leven in de stad.",
        "Voor jouw urban smaak hebben we deze praktische maar stijlvolle outfit samengesteld die perfect is voor het stadsleven."
      ],
      formeel: [
        "Deze formele outfit brengt een urban twist naar een geklede setting, perfect voor jouw stijl bij speciale gelegenheden.",
        "Voor jouw urban voorkeur hebben we deze formele look gecreëerd die modern en onderscheidend is zonder conventionele regels te breken."
      ]
    },
    streetstyle: {
      werk: [
        "Deze outfit vertaalt jouw streetstyle naar een professionele context met behoud van authenticiteit en attitude.",
        "Voor jouw streetstyle voorkeur hebben we deze werkoutfit samengesteld die expressief is maar toch geschikt voor een werkomgeving."
      ],
      casual: [
        "Deze casual look is een pure expressie van jouw streetstyle met gedurfde elementen en een authentieke uitstraling.",
        "Voor jouw streetstyle smaak hebben we deze outfit samengesteld die trendy is en jouw persoonlijkheid laat zien."
      ],
      formeel: [
        "Deze formele outfit brengt een verrassende streetstyle twist naar een geklede setting, perfect voor jouw unieke stijl.",
        "Voor jouw streetstyle voorkeur hebben we deze formele look gecreëerd die de regels breekt maar toch gepast is voor speciale gelegenheden."
      ]
    },
    retro: {
      werk: [
        "Deze outfit brengt jouw retro stijl naar een professionele setting met vintage-geïnspireerde elementen die toch modern aanvoelen.",
        "Voor jouw retro voorkeur hebben we deze werkoutfit samengesteld met een nostalgische uitstraling die toch professioneel is."
      ],
      casual: [
        "Deze casual look viert jouw retro stijl met vintage elementen en een nostalgische uitstraling voor dagelijks gebruik.",
        "Voor jouw retro smaak hebben we deze ontspannen outfit samengesteld die een eerbetoon is aan het verleden met een moderne twist."
      ],
      formeel: [
        "Deze formele outfit brengt jouw retro stijl naar speciale gelegenheden met vintage-geïnspireerde elegantie.",
        "Voor jouw retro voorkeur hebben we deze formele look gecreëerd die tijdperken overbrugt met een nostalgische maar toch hedendaagse uitstraling."
      ]
    },
    luxury: {
      werk: [
        "Deze outfit weerspiegelt jouw luxe stijl met hoogwaardige materialen en verfijnde details, perfect voor een exclusieve werkomgeving.",
        "Voor jouw luxe voorkeur hebben we deze werkoutfit samengesteld met premium kwaliteit en subtiele maar onmiskenbare elegantie."
      ],
      casual: [
        "Deze casual look behoudt de exclusiviteit van jouw luxe stijl met hoogwaardige materialen en een ontspannen maar verfijnde uitstraling.",
        "Voor jouw luxe smaak hebben we deze casual outfit samengesteld die comfort combineert met onberispelijke kwaliteit."
      ],
      formeel: [
        "Deze formele outfit is een toonbeeld van jouw luxe stijl met exquise materialen en onberispelijke afwerking voor speciale gelegenheden.",
        "Voor jouw luxe voorkeur hebben we deze formele look gecreëerd die uitzonderlijke kwaliteit en tijdloze elegantie uitstraalt."
      ]
    }
  };

  // Default to casual if occasion not found
  const occasion = occasionType in (explanations[archetypeId] || {}) ? occasionType : 'casual';
  
  // Get explanations for this archetype and occasion
  const archetypeExplanations = explanations[archetypeId] || explanations.casual_chic;
  const occasionExplanations = archetypeExplanations[occasion] || archetypeExplanations.casual;
  
  // Return random explanation from the available options
  return occasionExplanations[Math.floor(Math.random() * occasionExplanations.length)];
};

// Generate outfits based on archetype and products
const generateOutfits = (archetypeId: string, products: any[]): Outfit[] => {
  if (!products || products.length < 4) {
    return [];
  }

  const archetype = DUTCH_ARCHETYPES[archetypeId];
  if (!archetype) {
    return [];
  }

  // Group products by category
  const productsByCategory: Record<string, any[]> = {};
  products.forEach(product => {
    if (!productsByCategory[product.category]) {
      productsByCategory[product.category] = [];
    }
    productsByCategory[product.category].push(product);
  });

  // Create 3 outfits with different occasions
  const occasions = ['werk', 'casual', 'formeel'];
  const outfits: Outfit[] = [];

  occasions.forEach((occasion, index) => {
    // Select one item from each available category
    const outfitItems = [];
    const usedCategories = new Set();
    
    // First pass: try to get one item from each major category
    const majorCategories = ['Tops', 'Broeken', 'Jassen', 'Schoenen', 'Accessoires'];
    
    for (const category of majorCategories) {
      if (productsByCategory[category] && productsByCategory[category].length > 0) {
        // Get a random item from this category
        const randomIndex = Math.floor(Math.random() * productsByCategory[category].length);
        outfitItems.push(productsByCategory[category][randomIndex]);
        usedCategories.add(category);
      }
    }
    
    // Second pass: fill in with any remaining categories if needed
    if (outfitItems.length < 3) {
      Object.entries(productsByCategory).forEach(([category, categoryProducts]) => {
        if (!usedCategories.has(category) && categoryProducts.length > 0 && outfitItems.length < 4) {
          const randomIndex = Math.floor(Math.random() * categoryProducts.length);
          outfitItems.push(categoryProducts[randomIndex]);
          usedCategories.add(category);
        }
      });
    }
    
    // If we still don't have enough items, just add random products
    while (outfitItems.length < 3 && products.length > 0) {
      const randomIndex = Math.floor(Math.random() * products.length);
      outfitItems.push(products[randomIndex]);
    }

    // Generate random match percentage between 85-98%
    const matchPercentage = Math.floor(Math.random() * 14) + 85;
    
    // Generate random tags based on archetype
    const tags = [];
    if (archetype) {
      // Add 3-5 random keywords from the archetype
      const keywords = [...archetype.keywords];
      const numTags = Math.min(5, keywords.length);
      for (let j = 0; j < numTags; j++) {
        if (keywords.length > 0) {
          const randomIndex = Math.floor(Math.random() * keywords.length);
          tags.push(keywords.splice(randomIndex, 1)[0]);
        }
      }
    }
    
    // Generate random occasions based on archetype
    const outfitOccasions = [];
    if (archetype) {
      // Add 2-3 random occasions from the archetype
      const archetypeOccasions = [...archetype.occasions];
      const numOccasions = Math.min(3, archetypeOccasions.length);
      for (let j = 0; j < numOccasions; j++) {
        if (archetypeOccasions.length > 0) {
          const randomIndex = Math.floor(Math.random() * archetypeOccasions.length);
          outfitOccasions.push(archetypeOccasions.splice(randomIndex, 1)[0]);
        }
      }
    }
    
    // Generate explanation based on archetype and occasion
    const explanation = generateExplanation(archetypeId, occasion);
    
    // Create the outfit
    outfits.push({
      id: `outfit_${archetypeId}_${index}`,
      title: `${archetype.displayName} ${occasion === 'werk' ? 'Werk' : occasion === 'formeel' ? 'Formele' : 'Casual'} Look`,
      description: `Een perfecte ${archetype.displayName.toLowerCase()} outfit voor ${occasion === 'werk' ? 'op kantoor' : occasion === 'formeel' ? 'speciale gelegenheden' : 'casual dagen'}.`,
      matchPercentage,
      imageUrl: outfitItems[0]?.imageUrl || 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2',
      items: outfitItems.map(item => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        imageUrl: item.imageUrl,
        url: item.url,
        retailer: item.retailer,
        category: item.category
      })),
      tags,
      occasions: outfitOccasions,
      explanation
    });
  });
  
  return outfits;
};

const analyzePsychographicProfile = (answers: Record<string, any>): PsychographicProfile => {
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
    motivationalMessage: `${gender === 'man' ? 'Voor de moderne man' : gender === 'vrouw' ? 'Voor de zelfverzekerde vrouw' : 'Voor jou'} hebben we outfits geselecteerd die jouw ${archetype.displayName.toLowerCase()} smaak weerspiegelen.`,
    icon: archetype.icon
  };
};

const ProfileIntroduction: React.FC<{ profile: PsychographicProfile; userName?: string }> = ({ 
  profile, 
  userName 
}) => {
  return (
    <div className="py-8">
      <div className="max-w-screen-md mx-auto px-4">
        <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 animate-fade-in transition-colors">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">{profile.icon}</div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                {userName ? `${userName}, jij bent` : 'Jij bent'} {profile.title}
              </h2>
              
              <h3 className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                {profile.description}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400">
                {profile.motivationalMessage}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DailyStyleTipSection: React.FC = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    setCurrentTipIndex(dayOfYear % dailyStyleTips.length);
  }, []);

  const currentTip = dailyStyleTips[currentTipIndex];

  return (
    <div className="py-8">
      <div className="max-w-screen-md mx-auto px-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800 transition-colors">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
              <Sparkles className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                💡 Daily Style Tip
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {currentTip.tip}
              </p>
              <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-medium">
                {currentTip.category}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EnhancedResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, saveRecommendation } = useUser();
  const { viewRecommendation, saveOutfit } = useGamification();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [psychographicProfile, setPsychographicProfile] = useState<PsychographicProfile | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [curatedItems, setCuratedItems] = useState<any[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<string[]>([]);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const quizAnswers = location.state?.answers || {};

  // Simulate API call to get style recommendations
  const fetchStyleRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Analyze profile
      const profile = analyzePsychographicProfile(quizAnswers);
      setPsychographicProfile(profile);
      
      // Get curated products for this archetype
      const curatedProfile = curatedProducts.profiles.find(p => p.id === profile.type);
      if (curatedProfile && curatedProfile.items) {
        const products = curatedProfile.items;
        setCuratedItems(products);
        
        // Generate outfit combinations
        const generatedOutfits = generateOutfits(profile.type, products);
        setOutfits(generatedOutfits);
      } else {
        throw new Error('No products found for this style profile');
      }
      
      // Track view
      viewRecommendation();
      
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [quizAnswers, viewRecommendation]);

  useEffect(() => {
    fetchStyleRecommendations();
  }, [fetchStyleRecommendations]);

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

  const handleLikeOutfit = (outfitId: string) => {
    // Track like event
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'like_outfit', {
        event_category: 'engagement',
        event_label: outfitId
      });
    }
  };

  const handleDislikeOutfit = (outfitId: string) => {
    // Track dislike event
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'dislike_outfit', {
        event_category: 'engagement',
        event_label: outfitId
      });
    }
  };

  const handleShopOutfit = (outfitId: string) => {
    const outfit = outfits.find(o => o.id === outfitId);
    if (!outfit) return;
    
    // Calculate total price
    const totalPrice = outfit.items.reduce((sum, item) => sum + item.price, 0);
    
    // Track shop click
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'shop_outfit', {
        event_category: 'conversion',
        event_label: outfitId,
        value: totalPrice
      });
    }
    
    // For now, just scroll to items
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProductClick = (item: any) => {
    // Track product click
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'product_click', {
        event_category: 'ecommerce',
        event_label: `${item.retailer}_${item.id}`,
        item_id: item.id,
        item_name: item.name,
        item_brand: item.brand,
        item_category: item.category,
        price: item.price,
        currency: 'EUR'
      });
    }
    
    // Open product page
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track feedback submission
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'feedback_submit', {
        event_category: 'engagement',
        event_label: 'results_feedback'
      });
    }
    
    setFeedbackGiven(true);
    setShowFeedbackForm(false);
    setFeedbackText('');
    
    // Show success message or toast notification
    alert('Bedankt voor je feedback!');
  };

  const userName = user?.name?.split(' ')[0] || '';

  // Loading state
  if (isLoading) {
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Oeps, er is iets misgegaan
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We konden je stijladvies niet laden. Dit kan komen door een tijdelijk probleem. Probeer het opnieuw of ga terug naar de homepage.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="primary"
              onClick={fetchStyleRecommendations}
              icon={<RefreshCw size={16} />}
              iconPosition="left"
            >
              Probeer opnieuw
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
            >
              Terug naar home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Profile Introduction */}
      {psychographicProfile && (
        <ProfileIntroduction 
          profile={psychographicProfile} 
          userName={userName}
        />
      )}

      {/* Outfits Carousel */}
      {outfits.length > 0 && (
        <div className="py-8">
          <div className="max-w-screen-md mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Jouw persoonlijke outfit suggesties
            </h2>
            
            <div className="space-y-8">
              {outfits.map(outfit => (
                <OutfitCard
                  key={outfit.id}
                  id={outfit.id}
                  title={outfit.title}
                  description={outfit.description}
                  matchPercentage={outfit.matchPercentage}
                  imageUrl={outfit.imageUrl}
                  items={outfit.items}
                  tags={outfit.tags}
                  occasions={outfit.occasions}
                  explanation={outfit.explanation}
                  isSaved={savedOutfits.includes(outfit.id)}
                  onSave={handleSaveOutfit}
                  onLike={handleLikeOutfit}
                  onDislike={handleDislikeOutfit}
                  onShopClick={handleShopOutfit}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Daily Style Tip Section */}
      <DailyStyleTipSection />

      {/* Curated Products Section */}
      {curatedItems.length > 0 && (
        <div id="products-section" className="py-8">
          <div className="max-w-screen-md mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              Curated voor jouw {psychographicProfile?.title} stijl
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
              Handpicked items die perfect passen bij jouw persoonlijkheid
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {curatedItems.slice(0, 6).map(item => (
                <div 
                  key={item.id} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  onClick={() => handleProductClick(item)}
                >
                  <div className="relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                      {item.retailer}
                    </div>
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">Uitverkocht</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {item.brand} • {item.category}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        €{item.price.toFixed(2)}
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
                        {item.sizes.slice(0, 4).map((size: string, index: number) => (
                          <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                            {size}
                          </span>
                        ))}
                        {item.sizes.length > 4 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{item.sizes.length - 4}
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
                        handleProductClick(item);
                      }}
                      icon={<ShoppingBag size={14} />}
                      iconPosition="left"
                    >
                      Koop bij {item.retailer}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Privacy Reassurance */}
      <div className="py-8">
        <div className="max-w-screen-md mx-auto px-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4 flex-shrink-0">
                <ShieldCheck className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Jouw privacy is onze prioriteit
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  🔒 Je foto is direct na analyse verwijderd en wordt nooit opgeslagen of gedeeld.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Al je gegevens zijn end-to-end versleuteld en worden alleen gebruikt om je persoonlijke stijladvies te verbeteren.
                </p>
                <a href="/juridisch" className="text-blue-600 dark:text-blue-400 font-medium mt-2 inline-block hover:underline">
                  Meer over onze privacygarantie →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Upsell Banner */}
      {user && !user.isPremium && (
        <div className="py-8">
          <div className="max-w-screen-md mx-auto px-4">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 rounded-xl text-white p-6">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-2/3 mb-6 md:mb-0">
                  <h3 className="text-xl font-bold mb-2">Upgrade naar Premium</h3>
                  <p className="text-white/90 mb-4">
                    Krijg toegang tot onbeperkte outfit aanbevelingen, seizoensgebonden updates en persoonlijke styling tips.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="text-white mr-2 flex-shrink-0" size={16} />
                      <span>Onbeperkte outfit aanbevelingen</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="text-white mr-2 flex-shrink-0" size={16} />
                      <span>Seizoensgebonden garderobe updates</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="text-white mr-2 flex-shrink-0" size={16} />
                      <span>Gedetailleerd stijladvies</span>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/3 md:pl-6">
                  <Button 
                    as="a"
                    href="/prijzen" 
                    variant="secondary"
                    className="bg-white text-orange-600 hover:bg-gray-100 w-full"
                  >
                    Upgrade naar Premium
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      <div className="py-8">
        <div className="max-w-screen-md mx-auto px-4 text-center">
          {!feedbackGiven && !showFeedbackForm ? (
            <div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Hoe vond je deze stijlaanbevelingen?
              </p>
              <Button
                variant="outline"
                onClick={() => setShowFeedbackForm(true)}
                icon={<Send size={16} />}
                iconPosition="left"
              >
                Stuur feedback
              </Button>
            </div>
          ) : showFeedbackForm ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Deel je gedachten over je stijladvies
              </h3>
              <form onSubmit={handleFeedbackSubmit}>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Wat vond je van je stijlaanbevelingen? Hoe kunnen we ze verbeteren?"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors mb-4"
                  rows={4}
                  required
                ></textarea>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowFeedbackForm(false)}
                  >
                    Annuleren
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={!feedbackText.trim()}
                  >
                    Verstuur feedback
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-green-600 dark:text-green-400 font-medium">
              ✅ Bedankt voor je feedback!
            </div>
          )}
        </div>
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

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 z-50">
        <Button
          variant="primary"
          fullWidth
          onClick={() => {
            // Scroll to products section
            document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          icon={<ShoppingBag size={18} />}
          iconPosition="left"
          className="animate-pulse hover:animate-none"
        >
          Shop Complete Look
        </Button>
      </div>
    </div>
  );
};

export default EnhancedResultsPage;