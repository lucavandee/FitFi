import React, { useState, useEffect } from 'react';
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
  ChevronUp,
  Info
} from 'lucide-react';
import Button from './Button';
import ImageWithFallback from './ImageWithFallback';
import { generateOutfitExplanation } from '../../engine/explainOutfit';
import { UserProfile } from '../../context/UserContext';
import { getSafeUser } from '../../utils/userUtils';

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
  archetype?: string;
  secondaryArchetype?: string;
  mixFactor?: number;
  season?: string;
  weather?: string;
  structure?: string[];
  categoryRatio?: Record<string, number>;
  completeness?: number;
}

interface OutfitCardProps {
  outfit: Outfit;
  onNewLook?: () => void;
  isGenerating?: boolean;
  user?: UserProfile;
}

const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit, onNewLook, isGenerating, user
}) => {
  // Early return if outfit is invalid
  if (!outfit || !outfit.id) {
    console.warn('[⚠️ OutfitCard] Invalid outfit provided:', outfit);
    return null;
  }
  
  const [showItems, setShowItems] = useState(false);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);
  const [showExplanationTooltip, setShowExplanationTooltip] = useState(false);
  
  // Get safe user
  const safeUser = getSafeUser(user);
  
  // Generate explanation if not provided
  const [explanation, setExplanation] = useState<string>(outfit.explanation || '');
  
  useEffect(() => {
    try {
    // If explanation is not provided, generate one
    if (!outfit.explanation && outfit.archetype) {
        const generatedExplanation = generateOutfitExplanation(
          outfit,
          outfit.archetype,
          outfit.occasions && outfit.occasions.length > 0 ? outfit.occasions[0] : 'Casual',
          safeUser.name?.split(' ')?.[0]
        );
        
        setExplanation(generatedExplanation);
        
        // Log the generated explanation
        if (import.meta.env.DEV) {
          console.log(`Generated explanation for outfit ${outfit.id}:`, generatedExplanation);
        }
        
        // Track explanation generation in analytics
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'explanation_generated', {
            event_category: 'engagement',
            event_label: outfit.id,
            outfit_id: outfit.id,
            outfit_title: outfit.title,
            outfit_archetype: outfit.archetype
          });
        }
    } else {
      setExplanation(outfit.explanation || 'Past bij jouw stijlvoorkeuren');
    }
    } catch (error) {
      console.error('[❌ OutfitCard] Error generating explanation:', error);
      setExplanation('Past bij jouw stijlvoorkeuren');
    }
  }, [outfit, safeUser]);
  
  const handleProductClick = (url: string) => {
    try {
      if (!url || url === '#') {
        console.warn('[⚠️ OutfitCard] Invalid product URL:', url);
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('[❌ OutfitCard] Error opening product URL:', error);
    }
  };
  
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
  
  const handleExplanationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowExplanationTooltip(!showExplanationTooltip);
    
    // Track explanation click in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'explanation_click', {
        event_category: 'engagement',
        event_label: outfit.id,
        outfit_id: outfit.id,
        outfit_title: outfit.title
      });
    }
  };

  // Ensure items array exists and has a length property
  const items = outfit.items || [];
  const tags = outfit.tags || [];
  const occasions = outfit.occasions || [];

  return (
    <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg space-y-6 overflow-hidden">
      {/* Header with outfit image */}
      <div className="relative">
        <div className="aspect-[4/5] overflow-hidden bg-gray-100">
          <ImageWithFallback 
            src={outfit.imageUrl} 
            alt={outfit.title}
            className="w-full h-full object-cover"
            componentName="OutfitCard"
            fallbackSrc="/placeholder.png"
          />
          <div className="absolute top-4 left-4 bg-secondary/90 text-primary px-3 py-1 rounded-full text-sm font-bold flex items-center">
            <Star size={14} className="mr-1" />
            {outfit.matchPercentage}% Match
          </div>
          
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button 
              className="p-2 rounded-full bg-primary/90 text-secondary hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
              aria-label="Opslaan in favorieten"
            >
              <Bookmark size={16} />
            </button>
            <button 
              className="p-2 rounded-full bg-primary/90 text-secondary hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
              aria-label="Delen"
            >
              <Share2 size={16} />
            </button>
          </div>

          {/* Occasions indicator */}
          <div className="absolute bottom-4 left-4 bg-primary/70 text-secondary px-2 py-1 rounded-md text-xs">
            {occasions.length > 0 ? occasions.slice(0, 2).join(', ') : 'Alle gelegenheden'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Title and description */}
        <div>
          <h3 className="text-3xl font-semibold text-secondary mb-2">
            {outfit.title}
          </h3>
          <p className="text-base leading-relaxed text-text-dark">
            {outfit.description}
          </p>
        </div>

        {/* Explanation with info icon */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 relative">
          <div className="flex items-start">
            <p className="text-text-dark text-base italic flex-1 pr-6">
              {explanation || 'Past bij jouw stijlvoorkeuren'}
            </p>
            <button 
              onClick={handleExplanationClick}
              className="absolute top-4 right-4 text-gray-500 hover:text-text-dark transition-colors focus:outline-none focus:ring-2 focus:ring-secondary rounded-full p-1"
              aria-label="Meer informatie"
            >
              <Info size={16} />
            </button>
          </div>
          
          {/* Explanation tooltip */}
          {showExplanationTooltip && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-500 text-xs">
                Deze uitleg is gegenereerd door onze AI op basis van jouw stijlvoorkeuren, 
                de geselecteerde items, en de gelegenheid waarvoor deze outfit is samengesteld.
              </p>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              +{tags.length - 3} meer
            </span>
          )}
        </div>

        {/* Feedback buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-secondary ${
              feedback === 'liked'
                ? 'bg-secondary/20 text-secondary'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-text-dark'
            }`}
            aria-label="Like outfit"
          >
            <ThumbsUp size={16} />
            <span>Like</span>
          </button>
          <button
            onClick={handleDislike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-secondary ${
              feedback === 'disliked'
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-text-dark'
            }`}
            aria-label="Dislike outfit"
          >
            <ThumbsDown size={16} />
            <span>Dislike</span>
          </button>
        </div>

        {/* Price and main CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-bold text-text-dark">
              €{items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
            </span>
            <span className="text-base text-gray-600 ml-2">
              complete look
            </span>
          </div>
          
          <Button
            variant="primary"
            size="md"
            icon={<ShoppingBag size={16} />}
            iconPosition="left"
            className="bg-secondary text-primary py-3 px-6 rounded-full font-medium shadow-lg hover:bg-secondary/90 focus:outline-none focus:ring-4 focus:ring-secondary/50 transition-all"
          >
            Shop Look
          </Button>
        </div>

        {/* Expandable items section */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setShowItems(!showItems)}
            className="w-full flex items-center justify-between text-base font-medium text-gray-600 hover:text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-secondary rounded-2xl p-2"
          >
            <span>Bekijk alle items ({items.length})</span>
            {showItems ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          {showItems && (
            <div className="mt-4 space-y-4 animate-fade-in">
              {items.map((item, index) => {
                try {
                  if (!item || !item.id) {
                    console.warn(`[⚠️ OutfitCard] Invalid item at index ${index}:`, item);
                    return null;
                  }
                  
                  return (
                    <div 
                      key={item.id || `item-${index}`}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer group focus:outline-none focus:ring-2 focus:ring-secondary"
                      onClick={() => handleProductClick(item.url || '#')}
                    >
                      <ImageWithFallback 
                        src={item.imageUrl || '/placeholder.png'} 
                        alt={item.name || 'Product image'}
                        className="w-16 h-16 object-cover rounded-2xl"
                        componentName={`OutfitCard_Item_${index}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-text-dark truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.brand} • {item.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-medium text-text-dark">
                          €{typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.retailer || 'Unknown Store'}
                        </p>
                      </div>
                      <ExternalLink size={16} className="text-gray-600 group-hover:text-secondary transition-colors" />
                    </div>
                  );
                } catch (error) {
                  console.error(`[❌ OutfitCard] Error rendering item ${index}:`, error);
                  return null;
                }
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutfitCard;