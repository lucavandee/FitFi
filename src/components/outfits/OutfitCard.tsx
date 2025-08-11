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
        
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full border border-gray-200 px-2 py-0.5 text-sm bg-white">
            Match {Math.round(outfit.matchPercentage || 75)}%
          </span>
          {outfit.currentSeasonLabel && (
            <span className="rounded-full border border-gray-200 px-2 py-0.5 text-sm bg-white">
              {outfit.currentSeasonLabel}
            </span>
          )}
          {outfit.dominantColorName && (
            <span className="rounded-full border border-gray-200 px-2 py-0.5 text-sm bg-white">
              {outfit.dominantColorName}
            </span>
          )}
        </div>
        
        <div className="mt-3 flex gap-2">
          <button 
            aria-label="Bewaar look" 
            onClick={() => onSave(outfit)} 
            className="flex-1 px-3 py-2 border border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white rounded-xl text-xs font-medium transition-colors"
          >
            Bewaar
          </button>
          <button 
            aria-label="Meer zoals dit" 
            onClick={() => onMoreLikeThis(outfit)} 
            className="flex-1 px-3 py-2 border border-green-300 text-green-600 hover:bg-green-50 rounded-xl text-xs font-medium transition-colors"
          >
            Meer zoals dit
          </button>
          <button 
            aria-label="Niet mijn stijl" 
            onClick={() => onNotMyStyle(outfit)} 
            className="flex-1 px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-xs font-medium transition-colors"
          >
            Niet mijn stijl
          </button>
        </div>
      </div>
    </article>
  );
}