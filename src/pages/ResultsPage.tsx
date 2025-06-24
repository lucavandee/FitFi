import React, { useState, useEffect } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { useGamification } from '../context/GamificationContext';
import { DUTCH_ARCHETYPES, mapAnswersToArchetype, getArchetypeById } from '../config/profile-mapping.js';
import curatedProducts from '../config/curated-products.json';

interface Outfit {
  id: string;
  title: string;
  description: string;
  matchPercentage: number;
  imageUrlHero: string;
  imageUrlMale?: string;
  imageUrlFemale?: string;
  imageUrlNeutral?: string;
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
  psychologicalTrigger: string;
  urgencyMessage: string;
  personalizedMessage: string;
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
      <div className="max-w-screen-md mx-auto">
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
      <div className="max-w-screen-md mx-auto">
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

const StarRating: React.FC<{ onRate: (rating: number) => void }> = ({ onRate }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const handleRate = (value: number) => {
    setRating(value);
    onRate(value);
  };

  return (
    <div className="flex justify-center space-x-1 mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-colors"
        >
          <Star
            size={24}
            className={`${
              star <= (hover || rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, saveRecommendation } = useUser();
  const { viewRecommendation, saveOutfit } = useGamification();
  const [psychographicProfile, setPsychographicProfile] = useState<PsychographicProfile | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showCollapsiblePanel, setShowCollapsiblePanel] = useState(false);
  const [curatedItems, setCuratedItems] = useState<any[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<string[]>([]);

  const quizAnswers = location.state?.answers || {};

  useEffect(() => {
    const profile = analyzePsychographicProfile(quizAnswers);
    setPsychographicProfile(profile);
    
    // Get curated products for this archetype
    const curatedProfile = curatedProducts.profiles.find(p => p.id === profile.type);
    if (curatedProfile && curatedProfile.items) {
      setCuratedItems(curatedProfile.items.slice(0, 6)); // Show max 6 products
    }

    viewRecommendation();
  }, [quizAnswers]);

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

  const recordFeedback = (rating: number) => {
    setFeedbackGiven(true);
    
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'feedback_rating', {
        event_category: 'engagement',
        event_label: 'recommendation_feedback',
        value: rating
      });
    }
  };

  const userName = user?.name;

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Profile Introduction */}
      {psychographicProfile && (
        <ProfileIntroduction 
          profile={psychographicProfile} 
          userName={userName}
        />
      )}

      {/* Style Tips Section - NEW */}
      {psychographicProfile && (
        <div className="py-8">
          <div className="max-w-screen-md mx-auto px-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mr-4">
                    <Sparkles className="text-purple-500" size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Stijltips voor jouw {psychographicProfile.title} look
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getStyleTips(psychographicProfile.type).map((tip, index) => (
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
          </div>
        </div>
      )}

      {/* Curated Products Section */}
      {curatedItems.length > 0 && (
        <div className="py-8">
          <div className="max-w-screen-md mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              Curated voor jouw {psychographicProfile?.title} stijl
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
              Handpicked items die perfect passen bij jouw persoonlijkheid
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {curatedItems.map(item => (
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

      {/* Daily Style Tip Section */}
      <DailyStyleTipSection />

      {/* Privacy Reassurance - NEW */}
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
        <div className="max-w-screen-md mx-auto text-center px-4">
          <p className="mt-8 text-center">Hoe vond je deze aanbevelingen?</p>
          {!feedbackGiven ? (
            <StarRating onRate={recordFeedback} />
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

      {/* Mobile Sticky CTA - NEW */}
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

export default ResultsPage;