import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, RotateCw, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { useGamification } from '../context/GamificationContext';
import { DUTCH_ARCHETYPES, mapAnswersToArchetype, getArchetypeById } from '../config/profile-mapping.js';
import curatedProducts from '../config/curated-products.json';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import supabase from "../lib/supabase";
import ImageWithFallback from '../components/ui/ImageWithFallback';


// Types
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

// Data
const dailyStyleTips: DailyStyleTip[] = [
  { id: '1', tip: 'Draag nooit meer dan 3 kleuren tegelijk voor een gebalanceerde look.', category: 'Color Theory' },
  { id: '2', tip: 'Investeer in kwaliteitsschoenen - ze maken of breken je outfit.', category: 'Investment Pieces' },
  { id: '3', tip: 'De regel van derden: verdeel je outfit in 60% basis, 30% accent, 10% statement.', category: 'Proportions' },
];

// Helpers
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
    }
  };
  const occasion = occasionType in (explanations[archetypeId] || {}) ? occasionType : 'casual';
  const archetypeExplanations = explanations[archetypeId] || explanations.casual_chic;
  const occasionExplanations = archetypeExplanations[occasion] || archetypeExplanations.casual;
  return occasionExplanations[Math.floor(Math.random() * occasionExplanations.length)];
};

const generateOutfits = (archetypeId: string, products: any[], variationLevel: 'low' | 'medium' | 'high' = 'low'): Outfit[] => {
  if (!products || products.length < 4) {
    return [{
      id: `fallback_outfit_${Date.now()}`,
      title: "Stijlvolle Casual Look",
      description: "Een veelzijdige outfit die perfect past bij jouw stijlvoorkeuren.",
      matchPercentage: 85,
      imageUrl: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2",
      items: [],
      tags: ["casual", "veelzijdig", "stijlvol"],
      occasions: ["casual", "dagelijks"],
      explanation: "Deze outfit is samengesteld op basis van jouw stijlvoorkeuren. De combinatie van items creëert een gebalanceerde look die zowel stijlvol als comfortabel is."
    }];
  }
  const archetype = DUTCH_ARCHETYPES[archetypeId];
  if (!archetype) {
    return [{
      id: `fallback_outfit_${Date.now()}`,
      title: "Stijlvolle Casual Look",
      description: "Een veelzijdige outfit die perfect past bij jouw stijlvoorkeuren.",
      matchPercentage: 85,
      imageUrl: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2",
      items: [],
      tags: ["casual", "veelzijdig", "stijlvol"],
      occasions: ["casual", "dagelijks"],
      explanation: "Deze outfit is samengesteld op basis van jouw stijlvoorkeuren. De combinatie van items creëert een gebalanceerde look die zowel stijlvol als comfortabel is."
    }];
  }
  const productsByCategory: Record<string, any[]> = {};
  products.forEach(product => {
    if (!productsByCategory[product.category]) {
      productsByCategory[product.category] = [];
    }
    productsByCategory[product.category].push(product);
  });
  const occasions = ['werk', 'casual', 'formeel'];
  const outfits: Outfit[] = [];
  occasions.forEach((occasion, index) => {
    const outfitItems = [];
    const usedCategories = new Set();
    const majorCategories = ['Tops', 'Broeken', 'Jassen', 'Schoenen', 'Accessoires'];
    for (const category of majorCategories) {
      if (productsByCategory[category] && productsByCategory[category].length > 0) {
        let randomIndex = 0;
        if (variationLevel === 'high') {
          randomIndex = Math.floor(Math.random() * productsByCategory[category].length);
          if (randomIndex < 2 && productsByCategory[category].length > 3) {
            randomIndex = 2 + Math.floor(Math.random() * (productsByCategory[category].length - 2));
          }
        } else if (variationLevel === 'medium') {
          randomIndex = productsByCategory[category].length > 1 ?
            1 + Math.floor(Math.random() * (productsByCategory[category].length - 1)) : 0;
        } else {
          randomIndex = Math.floor(Math.random() * productsByCategory[category].length);
        }
        outfitItems.push(productsByCategory[category][randomIndex]);
        usedCategories.add(category);
      }
    }
    if (outfitItems.length < 3) {
      Object.entries(productsByCategory).forEach(([category, categoryProducts]) => {
        if (!usedCategories.has(category) && categoryProducts.length > 0 && outfitItems.length < 4) {
          const randomIndex = Math.floor(Math.random() * categoryProducts.length);
          outfitItems.push(categoryProducts[randomIndex]);
          usedCategories.add(category);
        }
      });
    }
    while (outfitItems.length < 3 && products.length > 0) {
      const randomIndex = Math.floor(Math.random() * products.length);
      outfitItems.push(products[randomIndex]);
    }
    let matchPercentageBase = 85;
    if (variationLevel === 'high') matchPercentageBase = 80;
    else if (variationLevel === 'medium') matchPercentageBase = 83;
    const matchPercentage = Math.floor(Math.random() * 14) + matchPercentageBase;
    const tags = [];
    if (archetype) {
      const keywords = [...archetype.keywords];
      const numTags = Math.min(5, keywords.length);
      for (let j = 0; j < numTags; j++) {
        if (keywords.length > 0) {
          const randomIndex = Math.floor(Math.random() * keywords.length);
          tags.push(keywords.splice(randomIndex, 1)[0]);
        }
      }
    }
    const outfitOccasions = [];
    if (archetype) {
      const archetypeOccasions = [...archetype.occasions];
      const numOccasions = Math.min(3, archetypeOccasions.length);
      for (let j = 0; j < numOccasions; j++) {
        if (archetypeOccasions.length > 0) {
          const randomIndex = Math.floor(Math.random() * archetypeOccasions.length);
          outfitOccasions.push(archetypeOccasions.splice(randomIndex, 1)[0]);
        }
      }
    }
    const explanation = generateExplanation(archetypeId, occasion);
    outfits.push({
      id: `outfit_${archetypeId}_${index}_${Date.now()}`,
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

// ProfileIntroduction component
const ProfileIntroduction: React.FC<{ profile: PsychographicProfile; userName?: string }> = ({ profile, userName }) => (
  <motion.div className="py-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
    <div className="container-slim">
      <div className="glass-card p-8">
        <div className="flex items-start space-x-6">
          <div className="text-4xl">{profile.icon}</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-3">{userName ? `${userName}, jij bent` : 'Jij bent'} {profile.title}</h2>
            <h3 className="text-lg text-white/90 mb-4">{profile.description}</h3>
            <p className="text-white/80">{profile.motivationalMessage}</p>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const DailyStyleTip: React.FC = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    setCurrentTipIndex(dayOfYear % dailyStyleTips.length);
  }, []);
  const currentTip = dailyStyleTips[currentTipIndex];
  return (
    <motion.div className="py-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
      <div className="container-slim">
        <div className="glass-card p-6 border border-[#0ea5e9]/20">
          <div className="flex items-start space-x-4">
            <div className="text-[#0ea5e9] text-2xl">💡</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">Dagelijkse stijltip</h3>
              <p className="text-white/90 mb-2">{currentTip.tip}</p>
              <span className="inline-block bg-[#0ea5e9]/20 text-[#0ea5e9] px-2 py-1 rounded-full text-xs font-medium">{currentTip.category}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Empty state component for when no outfits are found
const EmptyState: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <motion.div className="py-12" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
    <div className="container-slim">
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="text-orange-500" size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">
          Geen outfits gevonden
        </h3>
        <p className="text-white/80 mb-6">
          We konden geen outfits vinden die bij jouw stijlprofiel passen. Dit kan een tijdelijk probleem zijn.
        </p>
        {onRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            icon={<RotateCw size={16} />}
            iconPosition="left"
          >
            Probeer opnieuw
          </Button>
        )}
      </div>
    </div>
  </motion.div>
);

const EnhancedResultsOutfitCard: React.FC<{ outfit: Outfit; onNewLook: () => void; isGenerating: boolean }> = ({
  outfit, onNewLook, isGenerating
}) => {
  const [showItems, setShowItems] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const handleProductClick = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');
  
  return (
    <motion.div className="glass-card overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="relative">
        <div className="aspect-[3/4] overflow-hidden bg-[#1B263B]">
          <ImageWithFallback
            src={outfit.imageUrl}
            alt={outfit.title}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={(originalSrc) => {
              console.warn(`Outfit image failed to load: ${originalSrc}`);
              setImageError(true);
              setImageLoaded(true);
            }}
            componentName="EnhancedResultsOutfitCard"
          />
          <div className="absolute top-4 left-4 bg-[#0D1B2A]/90 text-[#FF8600] px-3 py-1 rounded-full text-sm font-bold">
            {outfit.matchPercentage}% Match
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">{outfit.title}</h3>
          <p className="text-white/80 text-sm">{outfit.description}</p>
        </div>
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-white/90 text-sm italic">{outfit.explanation}</p>
        </div>
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={onNewLook}
            disabled={isGenerating}
            icon={isGenerating ? <RotateCw className="animate-spin" size={16} /> : <RotateCw size={16} />}
            iconPosition="left"
            fullWidth
          >
            {isGenerating ? 'Nieuwe look genereren...' : 'Toon een nieuwe look'}
          </Button>
        </div>
        <button
          onClick={() => setShowItems(!showItems)}
          className="w-full flex items-center justify-between text-sm font-medium text-white/80 hover:text-[#FF8600] transition-colors mb-4"
        >
          <span>Bekijk alle items ({outfit.items.length})</span>
          <svg className={`w-5 h-5 transition-transform ${showItems ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showItems && (
          <div className="space-y-3 mb-6 animate-fade-in">
            {outfit.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => handleProductClick(item.url)}
              >
                <ImageWithFallback
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg"
                  onError={(originalSrc) => {
                    console.warn(`Outfit item image failed to load: ${originalSrc}`);
                  }}
                  componentName={`EnhancedResultsOutfitCard_Item_${index}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-white/60">
                        {item.brand} • {item.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        €{item.price.toFixed(2)}
                      </p>
                      <div className="text-xs text-white/60">
                        {item.retailer}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-white">
              €{outfit.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
            </span>
            <span className="text-sm text-white/60 ml-2">complete look</span>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate('/dashboard')}>Shop Look</Button>
        </div>
      </div>
    </motion.div>
  );
};

const EnhancedResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { viewRecommendation } = useGamification();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [psychographicProfile, setPsychographicProfile] = useState<PsychographicProfile | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [curatedItems, setCuratedItems] = useState<any[]>([]);
  const [generatingNewLook, setGeneratingNewLook] = useState<Record<string, boolean>>({});
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [showRegenerationFeedback, setShowRegenerationFeedback] = useState(false);

  const quizAnswers = location.state?.answers || {};

  // API call
  const fetchStyleRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setError("Het laden duurde te lang. Probeer het opnieuw.");
      console.error("Recommendation fetch timeout after 10 seconds");
    }, 10000);

    try {
      // Analyze profiel
      const profile = analyzePsychographicProfile(quizAnswers);
      setPsychographicProfile(profile);
      
      console.log("Profile type:", profile.type);
      
      // Supabase products
      let products = [];
      try {
        const { data, error: sbError } = await supabase
          .from('products')
          .select('*')
          .ilike('archetype', `%${profile.type}%`);
          
        if (sbError) {
          console.error("Supabase error:", sbError);
          throw sbError;
        }
        
        products = data || [];
        console.log("Supabase products found:", products.length);
        
        // Map any image_url to imageUrl for consistency
        products = products.map(p => ({
          ...p,
          imageUrl: p.imageUrl || p.image_url || '/placeholder.png'
        }));
      } catch (err) { 
        console.error("Error fetching from Supabase:", err);
      }
      
      // If no products from Supabase, use curated products as fallback
      if (!products.length) {
        console.log("No Supabase products found, using curated products fallback");
        const curatedProfile = curatedProducts.profiles.find(p => p.id === profile.type);
        products = (curatedProfile && curatedProfile.items) || [];
        
        // Ensure all products have imageUrl
        products = products.map(p => ({
          ...p,
          imageUrl: p.imageUrl || '/placeholder.png'
        }));
        
        console.log("Curated products found:", products.length);
      }
      
      setCuratedItems(products);
      
      // Generate outfits from products
      if (products.length > 0) {
        const generatedOutfits = generateOutfits(profile.type, products);
        console.log("Generated outfits:", generatedOutfits.length);
        setOutfits(generatedOutfits);
      } else {
        console.warn("No products available to generate outfits");
        // Use fallback outfits
        setOutfits(generateOutfits('casual_chic', [], 'low'));
      }
      
      viewRecommendation();
      clearTimeout(timeoutId);
    } catch (err: any) {
      console.error('Error in fetchStyleRecommendations:', err);
      setError(err?.message || "Onbekende fout");
      toast.error('Er ging iets mis bij het laden van je aanbevelingen. Probeer opnieuw.');
      
      // Use fallback outfits even on error
      setOutfits(generateOutfits('casual_chic', [], 'low'));
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, [quizAnswers, viewRecommendation]);

  useEffect(() => { fetchStyleRecommendations(); }, [fetchStyleRecommendations]);

  const handleGenerateNewLook = async (outfitId: string, index: number) => {
    if (!psychographicProfile) return;
    setGeneratingNewLook(prev => ({ ...prev, [outfitId]: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const newOutfit = generateOutfits(psychographicProfile.type, curatedItems, 'high')[0];
      if (!newOutfit) throw new Error('Failed to generate new outfit');
      setOutfits(prev => {
        const copy = [...prev];
        copy[index] = { ...newOutfit, id: `${outfitId}_alt_${Date.now()}` };
        return copy;
      });
      setRegenerationCount(prev => prev + 1);
      if (regenerationCount >= 1 && !showRegenerationFeedback) setShowRegenerationFeedback(true);
      toast.success('Nieuwe look gegenereerd!');
    } catch (err) {
      console.error("Error generating new look:", err);
      toast.error('Kon geen nieuwe look genereren. Probeer het later opnieuw.');
    } finally {
      setGeneratingNewLook(prev => ({ ...prev, [outfitId]: false }));
    }
  };

  const userName = user?.name?.split(' ')[0] || '';

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF8600] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Jouw stijladvies wordt gegenereerd...
          </h2>
          <p className="text-white/80">
            Onze AI analyseert je voorkeuren en stelt je persoonlijke stijlprofiel samen
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (error && outfits.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B] flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 text-red-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Er is iets misgegaan
          </h2>
          <p className="text-white/80 mb-6">
            We konden je stijladvies niet laden. Dit kan komen door een tijdelijk probleem. Probeer het opnieuw of ga terug naar de homepage.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="primary"
              onClick={fetchStyleRecommendations}
              icon={<RotateCw size={16} />}
              iconPosition="left"
            >
              Probeer opnieuw
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white border border-white/30 hover:bg-white/10"
            >
              Terug naar home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B]">
      {psychographicProfile && (
        <ProfileIntroduction profile={psychographicProfile} userName={userName} />
      )}
      {outfits.length > 0 ? (
        <div className="py-8">
          <div className="container-slim">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Jouw persoonlijke outfit suggesties
            </h2>
            <div className="space-y-12">
              {outfits.map((outfit, index) => (
                <EnhancedResultsOutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  onNewLook={() => handleGenerateNewLook(outfit.id, index)}
                  isGenerating={!!generatingNewLook[outfit.id]}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState onRetry={fetchStyleRecommendations} />
      )}
      <DailyStyleTip />
      {curatedItems.length > 0 && (
        <div className="py-8" id="products-section">
          <div className="container-slim">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              Curated voor jouw {psychographicProfile?.title} stijl
            </h2>
            <p className="text-white/80 text-center mb-8">
              Handpicked items die perfect passen bij jouw persoonlijkheid
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {curatedItems.slice(0, 6).map(item => (
                <div
                  key={item.id}
                  className="glass-card overflow-hidden hover:border-[#FF8600]/50 transition-all duration-300 cursor-pointer"
                  onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                >
                  <div className="relative">
                    <ImageWithFallback
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                      onError={(originalSrc) => {
                        console.warn(`Curated item image failed to load: ${originalSrc}`);
                      }}
                      componentName={`CuratedItem_${item.id}`}
                    />
                    <div className="absolute top-3 right-3 bg-[#0D1B2A]/90 px-2 py-1 rounded-full text-xs font-medium text-white/90">
                      {item.retailer}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-white mb-1">{item.name}</h3>
                    <p className="text-sm text-white/60 mb-2">{item.brand} • {item.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">€{item.price.toFixed(2)}</span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(item.url, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        Bekijk
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="py-8">
        <div className="container-slim">
          <motion.div className="glass-card p-6 border border-[#0ea5e9]/20" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <div className="flex items-start">
              <div className="text-[#0ea5e9] mr-4 flex-shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Jouw privacy is onze prioriteit
                </h3>
                <p className="text-white/90 mb-2">
                  Je foto is direct na analyse verwijderd en wordt nooit opgeslagen of gedeeld.
                </p>
                <p className="text-white/90">
                  Al je gegevens zijn end-to-end versleuteld en worden alleen gebruikt om je persoonlijke stijladvies te verbeteren.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      {user && !user.isPremium && (
        <div className="py-8">
          <div className="container-slim">
            <motion.div className="glass-card p-6 border border-[#FF8600]/20" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-2/3 mb-6 md:mb-0">
                  <h3 className="text-xl font-bold text-white mb-2">Upgrade naar Premium</h3>
                  <p className="text-white/90 mb-4">
                    Krijg toegang tot onbeperkte outfit aanbevelingen, seizoensgebonden updates en persoonlijke styling tips.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="text-[#FF8600] mr-2 flex-shrink-0" size={16} />
                      <span className="text-white/90">Onbeperkte outfit aanbevelingen</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="text-[#FF8600] mr-2 flex-shrink-0" size={16} />
                      <span className="text-white/90">Seizoensgebonden garderobe updates</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="text-[#FF8600] mr-2 flex-shrink-0" size={16} />
                      <span className="text-white/90">Gedetailleerd stijladvies</span>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/3 md:pl-6">
                  <Button as="a" href="/prijzen" variant="primary" fullWidth>
                    Upgrade naar Premium
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      <div className="py-10 container-slim text-center">
        <div className="space-y-4">
          <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>Ga naar Dashboard</Button>
          <div>
            <button onClick={() => navigate('/quiz/1')} className="text-[#FF8600] hover:text-orange-400 transition-colors text-sm font-medium">
              Quiz opnieuw doen
            </button>
          </div>
        </div>
      </div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0D1B2A] border-t border-white/10 p-4 z-50">
        <Button
          variant="primary"
          fullWidth
          onClick={() => {
            const productsSection = document.getElementById('products-section');
            if (productsSection) {
              productsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
              navigate('/dashboard');
            }
          }}
        >
          {curatedItems.length > 0 ? 'Bekijk producten' : 'Ga naar Dashboard'}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedResultsPage;