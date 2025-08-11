import React, { useState } from 'react';
import { Heart, ThumbsUp, ThumbsDown } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageWithFallback from '../ui/ImageWithFallback';
import { toggleSave, isSaved, dislike, getSimilarOutfits } from '../../services/engagement';

interface OutfitCardProps {
  outfit: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    matchPercentage?: number;
    currentSeasonLabel?: string;
    dominantColorName?: string;
    archetype?: string;
    tags?: string[];
  };
  allOutfits?: any[];
  onInsertSimilar?: (items: any[]) => void;
  onDismiss?: (id: string) => void;
}

const OutfitCard: React.FC<OutfitCardProps> = React.memo(({ 
  outfit, 
  allOutfits = [], 
  onInsertSimilar, 
  onDismiss 
}) => {
  const titleId = `title-${outfit.id}`;
  const descId = `desc-${outfit.id}`;
  const [saved, setSaved] = useState<boolean>(isSaved(outfit.id));

  const handleSave = () => {
    const nowSaved = toggleSave(outfit.id);
    setSaved(nowSaved);
    toast.dismiss();
    toast.success(nowSaved ? 'Opgeslagen ✓' : 'Verwijderd uit opgeslagen');
    
    // Track save action
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'outfit_save', {
        event_category: 'engagement',
        event_label: outfit.archetype,
        outfit_id: outfit.id
      });
    }
  };

  const handleMoreLikeThis = () => {
    const similarItems = getSimilarOutfits(allOutfits, outfit, 3);
    if (!similarItems.length) {
      toast('Geen vergelijkbare outfits gevonden');
      return;
    }
    
    onInsertSimilar?.(similarItems);
    toast.success('Meer zoals dit toegevoegd aan je feed');
    
    // Track positive feedback
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'outfit_like', {
        event_category: 'feedback',
        event_label: outfit.archetype,
        outfit_id: outfit.id
      });
    }
  };

  const handleDislike = () => {
    dislike(outfit.id);
    toast.dismiss();
    toast('We tonen je hier minder van 👌');
    onDismiss?.(outfit.id);
    
    // Track negative feedback
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'outfit_dislike', {
        event_category: 'feedback',
        event_label: outfit.archetype,
        outfit_id: outfit.id
      });
    }
  };

  return (
    <article 
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-[#89CFF0] focus-within:ring-offset-2"
      role="article"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div className="aspect-[3/4] overflow-hidden rounded-xl mb-3">
        <ImageWithFallback 
          src={outfit.imageUrl}
          alt={outfit.title}
          category="outfit"
          className="w-full h-full object-cover"
          componentName="OutfitCard"
        />
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 
            id={titleId}
            className="text-lg font-medium text-[#0D1B2A] leading-tight"
          >
            {outfit.title}
          </h3>
          <p 
            id={descId}
            className="mt-1 text-sm text-gray-600 leading-relaxed"
          >
            {outfit.description}
          </p>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-2">
          <span 
            className="rounded-full border border-gray-200 px-2 py-0.5 text-sm bg-white"
            role="status"
            aria-label={`Match percentage: ${Math.round(outfit.matchPercentage || 75)} procent`}
          >
            Match {Math.round(outfit.matchPercentage || 75)}%
          </span>
          {outfit.currentSeasonLabel && (
            <span 
              className="rounded-full border border-gray-200 px-2 py-0.5 text-sm bg-white"
              role="status"
              aria-label={`Seizoen: ${outfit.currentSeasonLabel}`}
            >
              {outfit.currentSeasonLabel}
            </span>
          )}
          {outfit.dominantColorName && (
            <span 
              className="rounded-full border border-gray-200 px-2 py-0.5 text-sm bg-white"
              role="status"
              aria-label={`Dominante kleur: ${outfit.dominantColorName}`}
            >
              {outfit.dominantColorName}
            </span>
          )}
        </div>
        
        <div className="mt-3 flex gap-2">
          <button 
            aria-label={saved ? "Verwijder uit opgeslagen" : "Bewaar look"} 
            onClick={handleSave} 
            className={`flex-1 px-3 py-2 border rounded-xl text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              saved 
                ? 'border-[#89CFF0] bg-[#89CFF0] text-white focus:ring-[#89CFF0]' 
                : 'border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white focus:ring-[#89CFF0]'
            }`}
          >
            <Heart className={`w-3 h-3 inline mr-1 ${saved ? 'fill-current' : ''}`} />
            {saved ? 'Opgeslagen' : 'Bewaar'}
          </button>
          
          <button 
            aria-label="Meer zoals dit" 
            onClick={handleMoreLikeThis} 
            className="flex-1 px-3 py-2 border border-green-300 text-green-600 hover:bg-green-50 rounded-xl text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <ThumbsUp className="w-3 h-3 inline mr-1" />
            Meer zoals dit
          </button>
          
          <button 
            aria-label="Niet mijn stijl" 
            onClick={handleDislike} 
            className="flex-1 px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <ThumbsDown className="w-3 h-3 inline mr-1" />
            Niet mijn stijl
          </button>
        </div>
      </div>
    </article>
  );
});

OutfitCard.displayName = 'OutfitCard';

export { OutfitCard };
export default OutfitCard;