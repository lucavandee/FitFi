import React, { useState } from 'react';
import { 
  Heart, 
  Share2, 
  ShoppingBag, 
  Star, 
  ExternalLink, 
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Button from './Button';

interface OutfitItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  url: string;
  retailer: string;
  category: string;
}

interface OutfitProps {
  id: string;
  title: string;
  description: string;
  matchPercentage: number;
  imageUrl: string;
  items: OutfitItem[];
  tags: string[];
  occasions: string[];
  explanation: string;
  isSaved?: boolean;
  onSave?: (id: string) => void;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
  onShopClick?: (id: string) => void;
  className?: string;
}

const OutfitCard: React.FC<OutfitProps> = ({
  id,
  title,
  description,
  matchPercentage,
  imageUrl,
  items,
  tags,
  occasions,
  explanation,
  isSaved = false,
  onSave,
  onLike,
  onDislike,
  onShopClick,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      onSave(id);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (feedback !== 'liked') {
      setFeedback('liked');
      if (onLike) {
        onLike(id);
      }
    }
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (feedback !== 'disliked') {
      setFeedback('disliked');
      if (onDislike) {
        onDislike(id);
      }
    }
  };

  const handleShopClick = () => {
    if (onShopClick) {
      onShopClick(id);
    }
  };

  const handleItemClick = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `FitFi Outfit: ${title}`,
          text: description,
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
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
      {/* Header with outfit image and match percentage */}
      <div className="relative">
        <div className="aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-700">
          {!imageLoaded && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img 
            src={imageUrl} 
            alt={title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Match percentage badge */}
          <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
            <Star size={14} className="mr-1 fill-current" />
            {matchPercentage}% Match
          </div>
          
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

          {/* Occasions indicator */}
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
            {occasions.length > 0 ? occasions.slice(0, 2).join(', ') : 'Alle gelegenheden'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and description */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Explanation */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300 italic">
            {explanation}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs"
            >
              #{tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md text-xs">
              +{tags.length - 3} meer
            </span>
          )}
        </div>

        {/* Feedback buttons */}
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              feedback === 'liked'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-label="Like outfit"
          >
            <ThumbsUp size={16} />
            <span>Like</span>
          </button>
          <button
            onClick={handleDislike}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              feedback === 'disliked'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-label="Dislike outfit"
          >
            <ThumbsDown size={16} />
            <span>Dislike</span>
          </button>
        </div>

        {/* Price and main CTA */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              €{totalPrice.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              complete look
            </span>
          </div>
          
          <Button
            variant="primary"
            size="md"
            onClick={handleShopClick}
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
            onClick={() => setShowItems(!showItems)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
          >
            <span>Bekijk alle items ({items.length}) 👀</span>
            {showItems ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          {showItems && (
            <div className="mt-4 space-y-3 animate-fade-in">
              {items.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer group"
                  onClick={(e) => handleItemClick(item.url, e)}
                >
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-md group-hover:scale-105 transition-transform"
                    loading="lazy"
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
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.retailer}
                        </div>
                      </div>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutfitCard;