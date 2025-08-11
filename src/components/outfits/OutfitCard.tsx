import React, { useState } from 'react';
import { Heart, ThumbsUp, ThumbsDown } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { getSafeImageUrl } from '@/utils/images';
import { isSaved } from '../../services/engagement';

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
  onSave?: () => void;
  onDislike?: () => void;
  onMoreLikeThis?: () => void;
}

const OutfitCard: React.FC<OutfitCardProps> = React.memo(({ 
  outfit, 
  onSave,
  onDislike,
  onMoreLikeThis
}) => {
  const titleId = `title-${outfit.id}`;
  const descId = `desc-${outfit.id}`;
  const [saved, setSaved] = useState<boolean>(isSaved(outfit.id));
  const [isProcessing, setIsProcessing] = useState<{
    save: boolean;
    like: boolean;
    dislike: boolean;
  }>({
    save: false,
    like: false,
    dislike: false
  });

  const handleSave = () => {
    if (isProcessing.save) return;
    
    setIsProcessing(prev => ({ ...prev, save: true }));
    
    // Toggle saved state optimistically
    setSaved(prev => !prev);
    
    onSave?.();
    
    // Re-enable button after 200ms
    setTimeout(() => {
      setIsProcessing(prev => ({ ...prev, save: false }));
    }, 200);
  };

  const handleMoreLikeThis = () => {
    if (isProcessing.like) return;
    
    setIsProcessing(prev => ({ ...prev, like: true }));
    
    onMoreLikeThis?.();
    
    // Re-enable button after 200ms
    setTimeout(() => {
      setIsProcessing(prev => ({ ...prev, like: false }));
    }, 200);
  };

  const handleDislike = () => {
    if (isProcessing.dislike) return;
    
    setIsProcessing(prev => ({ ...prev, dislike: true }));
    
    onDislike?.();
    
    // Re-enable button after 200ms
    setTimeout(() => {
      setIsProcessing(prev => ({ ...prev, dislike: false }));
    }, 200);
  };

  return (
    <article 
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-[#89CFF0] focus-within:ring-offset-2"
      role="article"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div className="w-full h-72 mb-3">
        <ImageWithFallback
          src={getSafeImageUrl(outfit?.imageUrl)}
          alt={outfit?.title || 'Outfit'}
          containerClassName="w-full h-72 hover:scale-105 transition-transform duration-300"
          className="w-full h-72"
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
        
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
          <span 
            className="rounded-full border border-gray-200 px-2 py-0.5 bg-white"
            role="status"
            aria-label={`Match percentage: ${Math.round(outfit.matchPercentage || 75)} procent`}
          >
            Match {Math.round(outfit.matchPercentage || 75)}%
          </span>
          {outfit.currentSeasonLabel && (
            <span 
              className="rounded-full border border-gray-200 px-2 py-0.5 bg-white"
              role="status"
              aria-label={`Seizoen: ${outfit.currentSeasonLabel}`}
            >
              {outfit.currentSeasonLabel}
            </span>
          )}
          {outfit.dominantColorName && (
            <span 
              className="rounded-full border border-gray-200 px-2 py-0.5 bg-white"
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
            aria-pressed={saved}
            aria-busy={isProcessing.save}
            title={saved ? "Verwijder uit opgeslagen" : "Bewaar deze look"}
            onClick={handleSave} 
            disabled={isProcessing.save}
            className={`btn-secondary flex-1 px-3 py-2 border rounded-xl text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              saved 
                ? 'border-[#89CFF0] bg-[#89CFF0] text-white focus:ring-[#89CFF0]' 
                : 'border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white focus:ring-[#89CFF0]'
            } ${isProcessing.save ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart className={`w-3 h-3 inline mr-1 ${saved ? 'fill-current' : ''} ${isProcessing.save ? 'animate-pulse' : ''}`} />
            Bewaar
          </button>
          
          <button 
            aria-label="Meer zoals dit"
            aria-busy={isProcessing.like}
            title="Voeg vergelijkbare outfits toe aan je feed"
            onClick={handleMoreLikeThis} 
            disabled={isProcessing.like}
            className={`btn-secondary flex-1 px-3 py-2 border border-green-300 text-green-600 hover:bg-green-50 rounded-xl text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
              isProcessing.like ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ThumbsUp className={`w-3 h-3 inline mr-1 ${isProcessing.like ? 'animate-pulse' : ''}`} />
            Meer zoals dit
          </button>
          
          <button 
            aria-label="Niet mijn stijl"
            aria-busy={isProcessing.dislike}
            title="Verberg dit type outfit uit je feed"
            onClick={handleDislike} 
            disabled={isProcessing.dislike}
            className={`btn-ghost text-muted-foreground flex-1 px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
              isProcessing.dislike ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ThumbsDown className={`w-3 h-3 inline mr-1 ${isProcessing.dislike ? 'animate-pulse' : ''}`} />
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