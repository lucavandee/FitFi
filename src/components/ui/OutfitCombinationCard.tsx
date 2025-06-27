import React, { useState } from 'react';
import { 
  ExternalLink, 
  Star, 
  Clock, 
  Zap, 
  Award, 
  TrendingUp,
  ShoppingBag,
  Heart,
  ChevronRight
} from 'lucide-react';
import Button from './Button';
import ImageWithFallback from './ImageWithFallback';

interface OutfitItem {
  category: 'top' | 'bottom' | 'accessoire' | 'schoenen';
  productId: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  retailer: string;
  affiliateLink: string;
}

interface OutfitCombination {
  id: string;
  name: string;
  description: string;
  style: string;
  occasion: string[];
  mockupImageUrl: string;
  items: OutfitItem[];
  totalPrice: number;
  matchPercentage: number;
  tags: string[];
  seasonality: 'lente' | 'zomer' | 'herfst' | 'winter' | 'alle_seizoenen';
  psychologicalTrigger: string;
  urgencyMessage: string;
  personalizedMessage: string;
  popularityIndicator?: string;
  exclusiveOffer?: string;
}

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

  const handleCompleteOutfitClick = () => {
    // Track click and open affiliate link
    window.open(outfit.items[0]?.affiliateLink || '#', '_blank', 'noopener,noreferrer');
  };

  const handleItemClick = (item: OutfitItem) => {
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
    }
  };

  return (
    <div className={`glass-card overflow-hidden transition-all duration-300 hover:border-[#FF8600]/50 cursor-pointer group ${className}`}>
      {/* Header with outfit image */}
      <div className="relative">
        <div className="aspect-[4/5] overflow-hidden bg-[#1B263B]">
          <ImageWithFallback 
            src={outfit.mockupImageUrl} 
            alt={outfit.name}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
            componentName="OutfitCombinationCard"
          />
          
          {/* Match percentage badge */}
          <div className="absolute top-4 left-4 bg-[#0D1B2A]/90 text-[#FF8600] px-3 py-1 rounded-full text-sm font-bold flex items-center">
            <Star size={14} className="mr-1" />
            {outfit.matchPercentage}% Match
          </div>
          
          {/* Popularity indicator */}
          {outfit.popularityIndicator && (
            <div className="absolute top-4 right-4 bg-[#0ea5e9]/90 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
              <TrendingUp size={12} className="mr-1" />
              HOT
            </div>
          )}
          
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
          <h3 className="text-xl font-bold text-white mb-2">
            {outfit.name}
          </h3>
          <p className="text-white/80 text-sm leading-relaxed">
            {outfit.description}
          </p>
        </div>

        {/* Psychological Trigger */}
        <div className="mb-4 p-3 bg-[#FF8600]/10 rounded-lg border-l-2 border-[#FF8600]">
          <p className="text-sm text-white/90 font-medium flex items-center">
            <Zap size={14} className="mr-2 text-[#FF8600]" />
            {outfit.psychologicalTrigger}
          </p>
        </div>

        {/* Personalized Message */}
        <div className="mb-4 p-3 bg-[#0ea5e9]/10 rounded-lg border border-[#0ea5e9]/20">
          <p className="text-sm text-white/90 italic">
            💫 {outfit.personalizedMessage}
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

        {/* Urgency Message */}
        <div className="mb-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
          <p className="text-sm text-white/90 font-medium flex items-center">
            <Clock size={14} className="mr-2 text-red-400" />
            ⏰ {outfit.urgencyMessage}
          </p>
        </div>

        {/* Price and main CTA */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-white">
              €{outfit.totalPrice.toFixed(2)}
            </span>
            <span className="text-sm text-white/60 ml-2">
              complete look
            </span>
          </div>
          
          <Button
            variant="primary"
            size="md"
            onClick={handleCompleteOutfitClick}
            icon={<ShoppingBag size={16} />}
            iconPosition="left"
          >
            Shop Look
          </Button>
        </div>

        {/* Expandable items section */}
        <div className="border-t border-white/10 pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-sm font-medium text-white/80 hover:text-[#FF8600] transition-colors"
          >
            <span>Bekijk alle items ({outfit.items.length})</span>
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
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                  onClick={() => handleItemClick(item)}
                >
                  <ImageWithFallback 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-md group-hover:scale-105 transition-transform"
                    componentName={`OutfitCombinationCard_Item_${index}`}
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

export default OutfitCombinationCard;