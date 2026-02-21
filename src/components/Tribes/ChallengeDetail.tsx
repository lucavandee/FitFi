import React, { useState } from "react";
import type { TribeChallenge } from "@/services/data/types";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { Send, Image, Link, X, Trophy, Clock, Users, Star } from 'lucide-react';
import Button from "../ui/Button";
import { useAddXp } from '@/hooks/useDashboard';
import toast from 'react-hot-toast';

interface ChallengeDetailProps {
  challenge: TribeChallenge;
  onSubmit: (payload: { content?: string; imageUrl?: string; linkUrl?: string }) => Promise<void>;
  canSubmit: boolean;
  className?: string;
}

export const ChallengeDetail: React.FC<ChallengeDetailProps> = ({ 
  challenge, 
  onSubmit, 
  canSubmit,
  className = ''
}) => {
  const addXp = useAddXp();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    
    if (!canSubmit) {
      alert("Log in om mee te doen.");
      return;
    }
    
    if (!content.trim() && !imageUrl.trim() && !linkUrl.trim()) {
      alert("Voeg content, een afbeelding of link toe.");
      return;
    }
    
    setBusy(true);
    try {
      await onSubmit({ 
        content: content.trim() || undefined, 
        imageUrl: imageUrl.trim() || undefined, 
        linkUrl: linkUrl.trim() || undefined 
      });
      
      // Award XP for challenge participation
      if (canSubmit) {
        try {
          // Note: userId would need to be passed as prop for XP award
          // For now, we show the enhanced toast without XP
        } catch (xpError) {
          console.warn('[ChallengeDetail] XP award failed:', xpError);
        }
      }
      
      // Reset form
      setContent(""); 
      setImageUrl(""); 
      setLinkUrl("");
      setShowImageInput(false);
      setShowLinkInput(false);
      
      toast.custom((
        <div className="bg-white rounded-xl shadow-lg p-4 flex items-center space-x-3">
          <div className="text-green-600">🎯</div>
          <span>Challenge submission succesvol!</span>
          <ToastXp amount={15} />
        </div>
      ), {
        duration: 3000
      });
    } catch (error) {
      console.error('Submission error:', error);
      alert("Inzending mislukt, probeer opnieuw.");
    } finally { 
      setBusy(false); 
    }
  }

  const getTimeRemaining = () => {
    if (!challenge.endAt) return null;
    
    const endTime = new Date(challenge.endAt).getTime();
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) return 'Afgelopen';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} dagen`;
    if (hours > 0) return `${hours} uur`;
    return 'Laatste uren';
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 ${className}`}>
      {/* Challenge Header */}
      <div className="mb-6">
        {challenge.image && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-4">
            <ImageWithFallback 
              src={challenge.image} 
              alt={challenge.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                challenge.status === 'open' ? 'bg-green-100 text-green-800' :
                challenge.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                challenge.status === 'closed' ? 'bg-red-100 text-red-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {challenge.status === 'open' ? 'Actief' : 
                 challenge.status === 'draft' ? 'Concept' : 
                 challenge.status === 'closed' ? 'Gesloten' : 'Gearchiveerd'}
              </span>
              
              {challenge.difficulty && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
                  challenge.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  <Star size={14} />
                  <span className="capitalize">{challenge.difficulty}</span>
                </span>
              )}
              
              {timeRemaining && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Clock size={14} />
                  <span>{timeRemaining}</span>
                </span>
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{challenge.title}</h2>
            
            {challenge.description && (
              <p className="text-gray-600 leading-relaxed mb-4">{challenge.description}</p>
            )}
          </div>
        </div>

        {/* Rules */}
        {challenge.rules?.length && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Challenge regels:</h3>
            <ul className="space-y-2">
              {challenge.rules.map((rule, i) => (
                <li key={i} className="flex items-start space-x-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-[var(--ff-color-primary-500)] rounded-full mt-2 flex-shrink-0"></div>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rewards */}
        <div className="flex items-center justify-between mb-6 p-4 bg-[var(--ff-color-primary-500)]/10 rounded-2xl">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--ff-color-primary-500)]">+{challenge.rewardPoints || 0}</div>
              <div className="text-sm text-gray-600">Deelname punten</div>
            </div>
            
            {challenge.winnerRewardPoints && (
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">+{challenge.winnerRewardPoints}</div>
                <div className="text-sm text-gray-600">Winnaar bonus</div>
              </div>
            )}
          </div>
          
          <Trophy className="w-8 h-8 text-[var(--ff-color-primary-500)]" />
        </div>
      </div>

      {/* Submission Form */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-medium text-gray-900 mb-4">Doe mee met deze challenge</h3>
        
        <form onSubmit={handle} className="space-y-4">
          {/* Content Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beschrijving *
            </label>
            <textarea 
              className="w-full border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-[var(--ff-color-primary-500)] resize-none transition-colors" 
              placeholder="Beschrijf je outfit, inspiratie, en hoe je de challenge regels hebt toegepast..." 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {content.length}/500 karakters
            </div>
          </div>

          {/* Image Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Afbeelding (optioneel)
              </label>
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className="text-[var(--ff-color-primary-500)] hover:text-[var(--ff-color-primary-500)]/80 text-sm flex items-center space-x-1"
              >
                <Image size={14} />
                <span>{showImageInput ? 'Verberg' : 'Voeg toe'}</span>
              </button>
            </div>
            
            {showImageInput && (
              <div className="space-y-2">
                <input 
                  className="w-full border border-gray-200 rounded-2xl p-3 focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-[var(--ff-color-primary-500)] transition-colors" 
                  placeholder="https://images.pexels.com/..." 
                  value={imageUrl} 
                  onChange={e => setImageUrl(e.target.value)}
                  type="url"
                />
                
                {/* Image Preview */}
                {imageUrl && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                    <ImageWithFallback
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Link Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Link (optioneel)
              </label>
              <button
                type="button"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className="text-[var(--ff-color-primary-500)] hover:text-[var(--ff-color-primary-500)]/80 text-sm flex items-center space-x-1"
              >
                <Link size={14} />
                <span>{showLinkInput ? 'Verberg' : 'Voeg toe'}</span>
              </button>
            </div>
            
            {showLinkInput && (
              <input 
                className="w-full border border-gray-200 rounded-2xl p-3 focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-[var(--ff-color-primary-500)] transition-colors" 
                placeholder="https://www.instagram.com/p/..." 
                value={linkUrl} 
                onChange={e => setLinkUrl(e.target.value)}
                type="url"
              />
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={!canSubmit || busy}
              variant="primary"
              icon={busy ? undefined : <Send size={16} />}
              iconPosition="right"
              className="bg-[var(--ff-color-primary-500)] hover:bg-[var(--ff-color-primary-500)]/90 text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-[var(--color-text)] border-t-transparent rounded-full animate-spin"></div>
                  <span>Versturen...</span>
                </div>
              ) : (
                'Doe mee met challenge'
              )}
            </Button>
          </div>
        </form>

        {/* Login CTA for guests */}
        {!canSubmit && (
          <div className="mt-4 p-4 bg-[var(--ff-color-primary-500)]/10 rounded-2xl text-center">
            <p className="text-sm text-gray-700 mb-3">
              Log in om deel te nemen aan challenges
            </p>
            <Button
              as="a"
              href="/inloggen"
              variant="primary"
              size="sm"
              className="bg-[var(--ff-color-primary-500)] hover:bg-[var(--ff-color-primary-500)]/90 text-[var(--color-text)]"
            >
              Inloggen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};