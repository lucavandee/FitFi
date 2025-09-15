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
import { trackOutfitExplain } from '@/hooks/useABTesting';
import { useEffect, useRef } from 'react';

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

  const explainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackOutfitExplain(outfit.id);
        }
      },
      { threshold: 0.5 }
    );

    if (explainRef.current) {
      observer.observe(explainRef.current);
    }

    return () => observer.disconnect();
  }, [outfit.id]);

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
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-[#89CFF0] focus-within:ring-offset-2"
      data-kind="outfit-card"
    >
    <article aria-labelledby={titleId} aria-describedby={descId}>
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
  )
}
  )
}