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
import ImageWithFallback from './ImageWithFallback';

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

interface OutfitCardProps {
  outfit: Outfit;
  onNewLook: () => void;
  isGenerating: boolean;
}

const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit, onNewLook, isGenerating
}) => {
  const [showItems, setShowItems] = useState(false);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);
  
  const handleProductClick = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');
  
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (feedback !== 'liked') {
      setFeedback('liked');
      
      // Track in analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'outfit_like', {
          event_category: 'engagement',
          event_label: outfit.id,
          outfit_id: outfit.id,
          outfit_title: outfit.title
        });
      }
    }
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (feedback !== 'disliked') {
      setFeedback('disliked');
      
      // Track in analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'outfit_dislike', {
          event_category: 'engagement',
          event_label: outfit.id,
          outfit_id: outfit.id,
          outfit_title: outfit.title
        });
      }
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Header with outfit image */}
      <div className="relative">
        <div className="aspect-[4/5] overflow-hidden bg-[#1B263B]">
          <ImageWithFallback 
            src={outfit.imageUrl} 
            alt={outfit.title}
            className="w-full h-full object-cover"
            componentName="OutfitCard"
          />
          <div className="absolute top-4 left-4 bg-[#0D1B2A]/90 text-[#FF8600] px-3 py-1 rounded-full text-sm font-bold flex items-center">
            <Star size={14} className="mr-1" />
            {outfit.matchPercentage}% Match
          </div>
          
          {/* Quick actions */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button 
              className="p-2 rounded-full bg-[#0D1B2A]/90 text-white/80 hover:bg-[#0D1B2A] hover:text-white transition-colors"
              aria-label="Opslaan in favorieten"
            >
              <Bookmark size={16} />
            </button>
            <button 
              className="p-2 rounded-full bg-[#0D1B2A]/90 text-white/80 hover:bg-[#0D1B2A] hover:text-white transition-colors"
              aria-label="Deel outfit"
            >
              <Share2 size={16} />
            </button>
          </div>

          {/* Occasions indicator */}
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
            {outfit.occasions.length > 0 ? outfit.occasions.slice(0, 2).join(', ') : 'Alle gelegenheden'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and description */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">
            {outfit.title}
          </h3>
          <p className="text-white/80 text-sm leading-relaxed">
            {outfit.description}
          </p>
        </div>

        {/* Explanation */}
        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/90 text-sm italic">
            {outfit.explanation}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {outfit.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-white/5 text-white/80 rounded-md text-xs"
            >
              #{tag}
            </span>
          ))}
          {outfit.tags.length > 3 && (
            <span className="px-2 py-1 bg-white/5 text-white/60 rounded-md text-xs">
              +{outfit.tags.length - 3} meer
            </span>
          )}
        </div>

        {/* Feedback buttons */}
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              feedback === 'liked'
                ? 'bg-[#0ea5e9]/20 text-[#0ea5e9]'
                : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
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
                ? 'bg-red-500/20 text-red-400'
                : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
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
            <span className="text-2xl font-bold text-white">
              €{outfit.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
            </span>
            <span className="text-sm text-white/60 ml-2">
              complete look
            </span>
          </div>
          
          <Button
            variant="primary"
            size="md"
            icon={<ShoppingBag size={16} />}
            iconPosition="left"
          >
            Shop Look
          </Button>
        </div>

        {/* Expandable items section */}
        <div className="border-t border-white/10 pt-4">
          <button
            onClick={() => setShowItems(!showItems)}
            className="w-full flex items-center justify-between text-sm font-medium text-white/80 hover:text-[#FF8600] transition-colors"
          >
            <span>Bekijk alle items ({outfit.items.length})</span>
            {showItems ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          {showItems && (
            <div className="mt-4 space-y-3 animate-fade-in">
              {outfit.items.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                  onClick={() => handleProductClick(item.url)}
                >
                  <ImageWithFallback 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-md group-hover:scale-105 transition-transform"
                    componentName={`OutfitCard_Item_${index}`}
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
                  <ExternalLink size={14} className="text-white/40 group-hover:text-[#FF8600] transition-colors" />
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