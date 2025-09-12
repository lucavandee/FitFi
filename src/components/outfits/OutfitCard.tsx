import React, { useState } from 'react';
import { Heart, ThumbsUp, ThumbsDown, MessageCircle, X, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import SmartImage from '@/components/media/SmartImage';
import RequireAuth from '@/components/auth/RequireAuth';
import { isSaved } from '../../services/engagement';
import { generateOutfitExplanation, generateNovaExplanation } from '@/engine/explainOutfit';
import { track } from '@/utils/telemetry';
import { useUser } from '@/context/UserContext';
import { useSaveOutfit } from '@/hooks/useSaveOutfit';
import { buildAffiliateUrl, detectPartner } from '@/utils/deeplinks';

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
  const { user } = useUser();
  const saveOutfit = useSaveOutfit(user?.id);
  const titleId = `title-${outfit.id}`;
  const descId = `desc-${outfit.id}`;
  const [saved, setSaved] = useState<boolean>(isSaved(outfit.id));
  const [loaded, setLoaded] = React.useState(false);
  const [explanation, setExplanation] = useState<string>('');
  const [showExplanationModal, setShowExplanationModal] = useState(false);
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
    if (isProcessing.save || saveOutfit.isPending) return;
    
    if (!user?.id) {
      track('save_click_unauth', { outfit_id: outfit.id });
      window.location.href = '/inloggen?returnTo=/feed';
      return;
    }
    
    // Use optimistic save hook with fallback to local storage
    try {
      saveOutfit.mutate({ 
        outfit: outfit as any, 
        userId: user.id, 
        idempotencyKey: `${user.id}:${outfit.id}` 
      });
    } catch (error) {
      // Fallback to local storage
      const newSavedState = toggleSave(outfit.id);
      setSaved(newSavedState);
      toast.success(newSavedState ? 'Outfit bewaard!' : 'Outfit verwijderd uit favorieten');
    }
    
    // Track save action
    track('add_to_favorites', { 
      outfit_id: outfit.id,
      outfit_title: outfit.title,
      outfit_archetype: outfit.archetype,
      action: 'add'
    });
    
    // Update local state optimistically
    setSaved(true);
    
    if (onSave) {
      onSave();
    }
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
      
      // Generate explanation using explainOutfit module
      const explanationText = generateOutfitExplanation(
        {
          id: outfit.id,
          title: outfit.title,
          description: outfit.description,
          archetype: outfit.archetype || 'casual_chic',
          occasion: 'Casual',
          products: [],
          imageUrl: outfit.imageUrl,
          tags: outfit.tags || [],
          matchPercentage: outfit.matchPercentage || 75,
          explanation: ''
        },
        outfit.archetype || 'casual_chic',
        'Casual'
      );
      
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
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
      data-kind="outfit-card"
    >
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-[#89CFF0] focus-within:ring-offset-2"
      role="article"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div className="relative rounded-xl overflow-hidden mb-3">
        <div className="relative overflow-hidden rounded-2xl bg-neutral-100 aspect-[4/5]">
          <SmartImage
            src={outfit.imageUrl}
            alt={outfit.title || 'Outfit'}
            id={outfit.id}
            kind="outfit"
            aspect="4/5"
            containerClassName="w-full h-full"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            imgClassName="hover:scale-105 transition-transform duration-300"
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
        
        {/* Match Score with Explanation Link */}
        <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
          <span 
            className="rounded-full border border-gray-200 px-2 py-0.5 bg-white"
            role="status"
            aria-label={`Match percentage: ${Math.round(outfit.matchPercentage || 75)} procent`}
          >
            Match {Math.round(outfit.matchPercentage || 75)}%
          </span>
          
          <RequireAuth cta="Inloggen voor uitleg">
            <button
              onClick={() => setShowExplanationModal(true)}
              className="flex items-center space-x-1 text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors"
              aria-label="Waarom deze match?"
            >
              <HelpCircle size={14} />
              <span className="text-xs">Waarom deze match?</span>
            </button>
          </RequireAuth>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
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
        
        {/* Explanation Modal */}
        {showExplanationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowExplanationModal(false)}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Waarom deze match?</h3>
                <button
                  onClick={() => setShowExplanationModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-[#89CFF0]/10 rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-[#89CFF0]" />
                    <span className="text-sm font-medium text-[#89CFF0]">Nova's analyse:</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {generateNovaExplanation(
                      {
                        id: outfit.id,
                        title: outfit.title,
                        description: outfit.description,
                        archetype: outfit.archetype || 'casual_chic',
                        occasion: 'Casual',
                        products: [],
                        imageUrl: outfit.imageUrl,
                        tags: outfit.tags || [],
                        matchPercentage: outfit.matchPercentage || 75,
                        explanation: ''
                      },
                      user ? {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        stylePreferences: {
                          casual: 3,
                          formal: 3,
                          sporty: 3,
                          vintage: 3,
                          minimalist: 3
                        }
                      } : undefined
                    )}
                  </p>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={() => setShowExplanationModal(false)}
                    className="px-6 py-2 bg-[#89CFF0] text-white rounded-2xl hover:bg-[#89CFF0]/90 transition-colors"
                  >
                    Begrepen!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-3 grid grid-cols-2 gap-2">
          <RequireAuth cta="Inloggen om te bewaren">
            <button 
              aria-label="Bewaar look"
              aria-busy={saveOutfit.isPending}
              title="Bewaar deze look"
              onClick={handleSave} 
              disabled={saveOutfit.isPending}
              className={`btn-secondary px-3 py-2 border rounded-xl text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                saveOutfit.isSuccess || saved
                  ? 'border-[#89CFF0] bg-[#89CFF0] text-white focus:ring-[#89CFF0]' 
                  : 'border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white focus:ring-[#89CFF0]'
              } ${saveOutfit.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className={`w-3 h-3 inline mr-1 ${saveOutfit.isSuccess || saved ? 'fill-current' : ''} ${saveOutfit.isPending ? 'animate-pulse' : ''}`} />
              {saveOutfit.isSuccess ? 'Bewaard ✓' : saveOutfit.isPending ? 'Bewaren…' : 'Bewaar'}
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
      
      <div className="explain">
        Waarom dit werkt: de zachte taupe top kleurt warm bij je huidtint; de rechte pantalon verlengt je silhouet en houdt het minimal-chic.
      </div>
    </article>
  );
}