import React, { useState } from 'react';
import { 
  Heart, 
  Share2, 
  ShoppingBag, 
  Star, 
  ExternalLink, 
  ChevronRight,
  Eye,
  Bookmark,
  BookmarkCheck,
  Clock,
  Zap,
  Award,
  TrendingUp
} from 'lucide-react';
import Button from './Button';
import { OutfitCombination, trackCompleteOutfitClick, generateCompleteOutfitAffiliateLink } from '../../data/outfitCombinations';

interface OutfitCombinationCardProps {
  outfit: OutfitCombination;
  onSave?: (outfitId: string) => void;
  isSaved?: boolean;
  className?: string;
}

const OutfitCombinationCard: React.FC<OutfitCombinationCardProps> = ({ 
  outfit, 
  onSave, 
  isSaved = false,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleCompleteOutfitClick = () => {
    trackCompleteOutfitClick(outfit, 'outfit_card');
    const affiliateLink = generateCompleteOutfitAffiliateLink(outfit);
    window.open(affiliateLink, '_blank', 'noopener,noreferrer');
  };

  const handleItemClick = (item: any) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'individual_item_click', {
        event_category: 'ecommerce',
        event_label: `${item.retailer}_${item.productId}`,
        item_id: item.productId,
        item_name: item.name,
        item_brand: item.brand,
        item_category: item.category,
        price: item.price,
        currency: 'EUR'
      });
    }
    
    window.open(item.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  const handleSave = () => {
    if (onSave) {
      onSave(outfit.id);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `FitFi Outfit: ${outfit.name}`,
          text: outfit.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }

    if (typeof window.trackOutfitShare === 'function') {
      window.trackOutfitShare(outfit.id, 'native_share');
    }
  };

  const getRetailerColor = (retailer: string): string => {
    const colors = {
      'Zalando': 'bg-orange-500',
      'Wehkamp': 'bg-blue-600',
      'H&M NL': 'bg-red-500',
      'ASOS NL': 'bg-black',
      'Bol.com': 'bg-blue-500',
      'De Bijenkorf': 'bg-purple-600'
    };
    return colors[retailer] || 'bg-gray-600';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${className}`}>
      {/* Header with outfit image and match percentage */}
      <div className="relative">
        <div className="aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-700">
          {!imageLoaded && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img 
            src={outfit.mockupImageUrl} 
            alt={outfit.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Match percentage badge */}
          <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center animate-pulse">
            <Star size={14} className="mr-1 fill-current" />
            {outfit.matchPercentage}% Match
          </div>
          
          {/* Popularity indicator */}
          {outfit.popularityIndicator && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
              <TrendingUp size={12} className="mr-1" />
              HOT
            </div>
          )}
          
          {/* Quick actions */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button 
              onClick={handleSave}
              className={`p-2 rounded-full transition-all ${
                isSaved 
                  ? 'bg-orange-100 text-orange-500 dark:bg-orange-900/30' 
                  : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
              }`}
              aria-label={isSaved ? 'Opgeslagen in favorieten' : 'Opslaan in favorieten'}
            >
              {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
            <button 
              onClick={handleShare}
              className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
              aria-label="Deel outfit"
            >
              <Share2 size={16} />
            </button>
          </div>

          {/* Seasonality indicator */}
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
            {outfit.seasonality === 'alle_seizoenen' ? '🌟 Alle seizoenen' : `🍂 ${outfit.seasonality.charAt(0).toUpperCase() + outfit.seasonality.slice(1)}`}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and description */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {outfit.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {outfit.description}
          </p>
        </div>

        {/* Psychological Trigger */}
        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
          <p className="text-sm text-orange-700 dark:text-orange-300 font-medium flex items-center">
            <Zap size={14} className="mr-2" />
            {outfit.psychologicalTrigger}
          </p>
        </div>

        {/* Personalized Message */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300 italic">
            💫 {outfit.personalizedMessage}
          </p>
        </div>

        {/* Popularity and Exclusive Offer */}
        <div className="flex items-center justify-between mb-4">
          {outfit.popularityIndicator && (
            <div className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full flex items-center">
              🔥 {outfit.popularityIndicator}
            </div>
          )}
          {outfit.exclusiveOffer && (
            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full flex items-center">
              <Award size={12} className="mr-1" />
              {outfit.exclusiveOffer}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {outfit.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs"
            >
              #{tag}
            </span>
          ))}
          {outfit.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md text-xs">
              +{outfit.tags.length - 3} meer
            </span>
          )}
        </div>

        {/* Urgency Message */}
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium flex items-center">
            <Clock size={14} className="mr-2" />
            ⏰ {outfit.urgencyMessage}
          </p>
        </div>

        {/* Price and main CTA */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              €{outfit.totalPrice.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              complete look
            </span>
          </div>
          
          <Button
            variant="primary"
            size="md"
            onClick={handleCompleteOutfitClick}
            icon={<ShoppingBag size={16} />}
            iconPosition="left"
            className="whitespace-nowrap animate-pulse hover:animate-none"
          >
            Shop Complete Look
          </Button>
        </div>

        {/* Expandable items section */}
        <div className="border-t dark:border-gray-700 pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
          >
            <span>Bekijk alle items ({outfit.items.length}) 👀</span>
            <ChevronRight 
              size={16} 
              className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>

          {isExpanded && (
            <div className="mt-4 space-y-3 animate-fade-in">
              {outfit.items.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer group"
                  onClick={() => handleItemClick(item)}
                >
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-md group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.brand} • {item.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          €{item.price.toFixed(2)}
                        </p>
                        <div className={`${getRetailerColor(item.retailer)} text-white px-2 py-0.5 rounded text-xs`}>
                          {item.retailer}
                        </div>
                      </div>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                </div>
              ))}
              
              {/* Individual items summary */}
              <div className="flex justify-between items-center pt-2 border-t dark:border-gray-600 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  💡 Of koop items apart:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  €{outfit.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Occasions */}
        <div className="mt-4 pt-4 border-t dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>✨ Perfect voor:</span>
            <div className="flex space-x-1">
              {outfit.occasion.slice(0, 3).map((occ, index) => (
                <span key={index} className="capitalize">
                  {occ}{index < Math.min(outfit.occasion.length - 1, 2) ? ', ' : ''}
                </span>
              ))}
              {outfit.occasion.length > 3 && (
                <span>+{outfit.occasion.length - 3}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitCombinationCard;