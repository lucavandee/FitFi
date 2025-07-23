import React from 'react';
import { Heart, Share2, ShoppingBag, Star } from 'lucide-react';
import Button from './Button';

interface OutfitCardProps {
  outfit: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    matchPercentage: number;
    tags: string[];
    items?: Array<{
      name: string;
      brand: string;
      price: number;
    }>;
  };
  onSave?: (outfitId: string) => void;
  onShare?: (outfitId: string) => void;
  className?: string;
}

const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  onSave,
  onShare,
  className = ''
}) => {
  const handleSave = () => {
    if (onSave) {
      onSave(outfit.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(outfit.id);
    }
  };

  return (
    <div className={`bg-accent text-text-dark rounded-2xl shadow-lg overflow-hidden ${className}`}>
      <div className="relative aspect-[3/4]">
        <img 
          src={outfit.imageUrl} 
          alt={outfit.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 bg-secondary text-primary px-3 py-1 rounded-full text-sm font-bold flex items-center">
          <Star size={12} className="mr-1" />
          {outfit.matchPercentage}% Match
        </div>
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            onClick={handleSave}
            className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart size={16} className="text-gray-700" />
          </button>
          <button
            onClick={handleShare}
            className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <Share2 size={16} className="text-gray-700" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{outfit.title}</h3>
        <p className="text-gray-600 mb-4">{outfit.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {outfit.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
        
        {outfit.items && (
          <div className="space-y-2 mb-4">
            {outfit.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span>{item.name} - {item.brand}</span>
                <span className="font-semibold">€{item.price}</span>
              </div>
            ))}
          </div>
        )}
        
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          icon={<ShoppingBag size={16} />}
          iconPosition="left"
        >
          Shop deze look
        </Button>
      </div>
    </div>
  );
};

export default OutfitCard;