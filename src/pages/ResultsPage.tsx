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
  CheckCircle,
  AlertCircle,
  RotateCw
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { useGamification } from '../context/GamificationContext';
import { DUTCH_ARCHETYPES, mapAnswersToArchetype, getArchetypeById } from '../config/profile-mapping.js';
import curatedProducts from '../config/curated-products.json';
import ImageWithFallback from '../components/ui/ImageWithFallback';

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
    motivationalMessage: `${gender === 'male' ? 'Voor de moderne man' : 'Voor de zelfverzekerde vrouw'} hebben we outfits geselecteerd die jouw ${archetype.displayName.toLowerCase()} smaak weerspiegelen.`,
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

// Empty state component for when no products are found
const EmptyState: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  return (
    <div className="py-12 text-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 max-w-md mx-auto">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="text-orange-500" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          Geen producten gevonden
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We konden geen producten vinden die bij jouw stijlprofiel passen. Dit kan een tijdelijk probleem zijn.
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Profile Introduction */}
      {psychographicProfile && (
        <ProfileIntroduction 
          profile={psychographicProfile} 
          userName={userName}
        />
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

      {/* Pro Upsell Banner */}
      {user && !user.isPremium && (
        <div className="py-8">
          <div className="max-w-screen-md mx-auto px-4">
            <div className="bg-blue-600 text-white p-6 rounded-xl text-center">
              <h3 className="text-lg font-bold mb-2">Upgrade naar Premium</h3>
              <p className="mb-4">Krijg toegang tot exclusieve items en onbeperkte aanbevelingen</p>
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Start gratis proef
              </Button>
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
    </div>
  );
};

export default ResultsPage;