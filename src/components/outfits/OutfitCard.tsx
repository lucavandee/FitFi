import React, { useState } from 'react';
import { Heart, ThumbsUp, ThumbsDown, MessageCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import RequireAuth from '@/components/auth/RequireAuth';
import { isSaved } from '../../services/engagement';
import { NovaTools } from '@/ai/nova/agent';
import { track } from '@/utils/analytics';

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
  onExplain?: (explanation: string) => void;
}

export default function OutfitCard({ 
  outfit, 
  onSave,
  onDislike,
  onMoreLikeThis,
  onExplain
}: OutfitCardProps) {
  const titleId = `title-${outfit.id}`;
  const descId = `desc-${outfit.id}`;
  const [saved, setSaved] = useState<boolean>(isSaved(outfit.id));
  const [loaded, setLoaded] = React.useState(false);
  const [explanation, setExplanation] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isProcessing, setIsProcessing] = useState<{
    save: boolean;
    like: boolean;
    dislike: boolean;
    explain: boolean;
  }>({
    save: false,
    like: false,
    dislike: false,
    explain: false
  });

  const handleSave = () => {
    if (isProcessing.save) return;
    
    setIsProcessing(prev => ({ ...prev, save: true }));
    
    // Toggle saved state optimistically
    setSaved(prev => !prev);
    
    // Track save action
    track('add_to_favorites', { 
      outfit_id: outfit.id,
      outfit_title: outfit.title,
      outfit_archetype: outfit.archetype,
      action: saved ? 'remove' : 'add'
    });
    
    onSave?.();
    
    // Re-enable button after 200ms
    setTimeout(() => {
      setIsProcessing(prev => ({ ...prev, save: false }));
    }, 200);
  };

  const handleMoreLikeThis = () => {
    if (isProcessing.like) return;
    
    setIsProcessing(prev => ({ ...prev, like: true }));
    
    // Track similar request
    track('request_similar', { 
      outfit_id: outfit.id,
      outfit_title: outfit.title,
      outfit_archetype: outfit.archetype
    });
    
    onMoreLikeThis?.();
    
    // Re-enable button after 200ms
    setTimeout(() => {
      setIsProcessing(prev => ({ ...prev, like: false }));
    }, 200);
  };

  const handleDislike = () => {
    if (isProcessing.dislike) return;
    
    setIsProcessing(prev => ({ ...prev, dislike: true }));
    
    // Track dislike feedback
    track('feedback_dislike', { 
      outfit_id: outfit.id,
      outfit_title: outfit.title,
      outfit_archetype: outfit.archetype
    });
    
    onDislike?.();
    
    // Re-enable button after 200ms
    setTimeout(() => {
      setIsProcessing(prev => ({ ...prev, dislike: false }));
    }, 200);
  };

  const handleExplain = async () => {
    if (isProcessing.explain) return;
    
    setIsProcessing(prev => ({ ...prev, explain: true }));
    
    try {
      // Track explain request
      track('request_explanation', { 
        outfit_id: outfit.id,
        outfit_title: outfit.title,
        outfit_archetype: outfit.archetype
      });
      
      const result = await NovaTools.explain_outfit(
        { profile: null, history: [] }, 
        { outfit }
      );
      
      const explanationText = result.payload;
      setExplanation(explanationText);
      setShowExplanation(true);
      
      if (onExplain) {
        onExplain(explanationText);
      }
      
      // Track successful explanation
      track('explanation_generated', { 
        outfit_id: outfit.id,
        explanation_length: explanationText.length
      });
      
      toast.success('Nova heeft deze outfit uitgelegd!');
    } catch (error) {
      console.error('Error explaining outfit:', error);
      
      // Track explanation failure
      track('explanation_failed', { 
        outfit_id: outfit.id,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast.error('Kon uitleg niet genereren');
    } finally {
      setTimeout(() => {
        setIsProcessing(prev => ({ ...prev, explain: false }));
      }, 200);
    }
  };

  return (
    <article 
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-[#89CFF0] focus-within:ring-offset-2"
      role="article"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div className="relative rounded-xl overflow-hidden mb-3">
        <div className="relative overflow-hidden rounded-2xl bg-neutral-100 aspect-[4/5]">
          <ImageWithFallback 
            src={outfit.imageUrl} 
            fallbackSrc="/images/outfit-fallback.jpg" 
            alt={outfit.title || 'Outfit'} 
            className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            componentName="OutfitCard"
          />
        </div>
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
        
        {/* Explanation */}
        {showExplanation && explanation && (
          <div className="mt-3 p-3 bg-[#89CFF0]/10 rounded-xl border border-[#89CFF0]/20">
            <div className="flex items-start space-x-2 mb-2">
              <MessageCircle className="w-4 h-4 text-[#89CFF0] flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-[#89CFF0]">Nova's uitleg:</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
            <button
              onClick={() => setShowExplanation(false)}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Verberg uitleg
            </button>
          </div>
        )}
        
        <div className="mt-3 grid grid-cols-2 gap-2">
          <RequireAuth cta="Inloggen om te bewaren">
            <button 
              aria-label={saved ? "Verwijder uit opgeslagen" : "Bewaar look"}
              aria-pressed={saved}
              aria-busy={isProcessing.save}
              title={saved ? "Verwijder uit opgeslagen" : "Bewaar deze look"}
              onClick={handleSave} 
              disabled={isProcessing.save}
              className={`btn-secondary px-3 py-2 border rounded-xl text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                saved 
                  ? 'border-[#89CFF0] bg-[#89CFF0] text-white focus:ring-[#89CFF0]' 
                  : 'border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white focus:ring-[#89CFF0]'
              } ${isProcessing.save ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className={`w-3 h-3 inline mr-1 ${saved ? 'fill-current' : ''} ${isProcessing.save ? 'animate-pulse' : ''}`} />
              Bewaar
            </button>
          </RequireAuth>
          
          <RequireAuth cta="Inloggen voor meer looks">
            <button 
              aria-label="Meer zoals dit"
              aria-busy={isProcessing.like}
              title="Voeg vergelijkbare outfits toe aan je feed"
              onClick={handleMoreLikeThis} 
              disabled={isProcessing.like}
              className={`btn-secondary px-3 py-2 border border-green-300 text-green-600 hover:bg-green-50 rounded-xl text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                isProcessing.like ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ThumbsUp className={`w-3 h-3 inline mr-1 ${isProcessing.like ? 'animate-pulse' : ''}`} />
              Meer zoals dit
            </button>
          </RequireAuth>
          
          <RequireAuth cta="Inloggen voor feedback">
            <button 
              aria-label="Niet mijn stijl"
              aria-busy={isProcessing.dislike}
              title="Verberg dit type outfit uit je feed"
              onClick={handleDislike} 
              disabled={isProcessing.dislike}
              className={`btn-ghost text-muted-foreground px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                isProcessing.dislike ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ThumbsDown className={`w-3 h-3 inline mr-1 ${isProcessing.dislike ? 'animate-pulse' : ''}`} />
              Niet mijn stijl
            </button>
          </RequireAuth>
          
          <RequireAuth cta="Inloggen voor uitleg">
            <button 
              aria-label="Laat Nova dit outfit uitleggen"
              aria-busy={isProcessing.explain}
              title="Krijg Nova's uitleg waarom dit outfit bij je past"
              onClick={handleExplain} 
              disabled={isProcessing.explain}
              className={`btn-secondary px-3 py-2 border border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0]/10 rounded-xl text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#89CFF0] focus:ring-offset-2 ${
                isProcessing.explain ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <MessageCircle className={`w-3 h-3 inline mr-1 ${isProcessing.explain ? 'animate-pulse' : ''}`} />
              {showExplanation ? 'Verberg uitleg' : 'Leg uit'}
            </button>
          </RequireAuth>
        </div>
      </div>
    </article>
  );
}