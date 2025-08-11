import React from 'react';
import { Heart, ThumbsUp, ThumbsDown } from 'lucide-react';
import OutfitReasons from './OutfitReasons';
import ImageWithFallback from '../ui/ImageWithFallback';
import Button from '../ui/Button';

interface OutfitCardProps {
  outfit: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    matchPercentage?: number;
    currentSeasonLabel?: string;
    dominantColorName?: string;
  };
  onSave: (outfit: any) => void;
  onMoreLikeThis: (outfit: any) => void;
  onNotMyStyle: (outfit: any) => void;
}

export default function OutfitCard({ outfit, onSave, onMoreLikeThis, onNotMyStyle }: OutfitCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-[3/4] overflow-hidden rounded-xl mb-3">
        <ImageWithFallback 
          src={outfit.imageUrl} 
          alt={outfit.title} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
          componentName="OutfitCard"
        />
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-medium text-[#0D1B2A] leading-tight">{outfit.title}</h3>
          <p className="mt-1 text-sm text-gray-600 leading-relaxed">{outfit.description}</p>
        </div>
        
        <OutfitReasons 
          match={outfit.matchPercentage || 78} 
          season={outfit.currentSeasonLabel || 'Dit seizoen'} 
          color={outfit.dominantColorName} 
        />
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSave(outfit)}
            icon={<Heart size={14} />}
            iconPosition="left"
            className="flex-1 border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white text-xs"
          >
            Bewaar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMoreLikeThis(outfit)}
            icon={<ThumbsUp size={14} />}
            iconPosition="left"
            className="flex-1 border-green-300 text-green-600 hover:bg-green-50 text-xs"
          >
            Meer zoals dit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNotMyStyle(outfit)}
            icon={<ThumbsDown size={14} />}
            iconPosition="left"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 text-xs"
          >
            Niet mijn stijl
          </Button>
        </div>
      </div>
    </article>
  );
}