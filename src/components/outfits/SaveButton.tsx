import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { savedOutfitsService } from '@/services/outfits/savedOutfitsService';
import type { Outfit } from '@/engine/types';
import toast from 'react-hot-toast';

interface SaveButtonProps {
  outfit: Outfit;
  userId?: string;
  className?: string;
}

export default function SaveButton({ outfit, userId, className = '' }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      checkSavedStatus();
    }
  }, [userId, outfit.id]);

  const checkSavedStatus = async () => {
    if (!userId) return;
    const saved = await savedOutfitsService.isOutfitSaved(userId, outfit.id);
    setIsSaved(saved);
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast.error('Log in om outfits op te slaan');
      return;
    }

    setIsLoading(true);

    try {
      if (isSaved) {
        const result = await savedOutfitsService.unsaveOutfit(userId, outfit.id);
        if (result.success) {
          setIsSaved(false);
          toast.success('Outfit verwijderd uit favorieten');
        } else {
          toast.error('Kon outfit niet verwijderen');
        }
      } else {
        const result = await savedOutfitsService.saveOutfit(userId, outfit);
        if (result.success) {
          setIsSaved(true);
          toast.success('Outfit opgeslagen!');
        } else {
          toast.error('Kon outfit niet opslaan');
        }
      }
    } catch (error) {
      toast.error('Er ging iets mis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      disabled={isLoading || !userId}
      className={`
        inline-flex items-center justify-center
        w-10 h-10
        rounded-xl
        transition-all duration-200
        ${isSaved
          ? 'bg-[#FAF5F2] text-[#A8513A]'
          : 'bg-[#FFFFFF] text-[#1A1A1A]/60 hover:text-[#A8513A] hover:bg-[#FAF5F2]'
        }
        border border-[#E5E5E5]
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-[#D4856E]
        ${className}
      `}
      aria-label={isSaved ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
    >
      <Heart
        className={`w-5 h-5 transition-transform ${isLoading ? 'animate-pulse' : ''}`}
        fill={isSaved ? 'currentColor' : 'none'}
      />
    </button>
  );
}
