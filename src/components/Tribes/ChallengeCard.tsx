import React from "react";
import type { TribeChallenge } from "@/services/data/types";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { Calendar, Clock, Trophy, Star, Target, Zap, Crown } from 'lucide-react';

interface ChallengeCardProps {
  c: TribeChallenge;
  onOpen?: (id: string) => void;
  className?: string;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ c, onOpen, className = '' }) => {
  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return <Target className="w-3 h-3 text-green-600" />;
      case 'medium':
        return <Star className="w-3 h-3 text-yellow-600" />;
      case 'hard':
        return <Zap className="w-3 h-3 text-orange-600" />;
      default:
        return <Trophy className="w-3 h-3 text-[#89CFF0]" />;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-[#89CFF0]/10 text-[#89CFF0] border-[#89CFF0]/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'archived':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeRemaining = () => {
    if (!c.endAt) return null;
    
    const endTime = new Date(c.endAt).getTime();
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
    <div 
      className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer hover:transform hover:scale-105 overflow-hidden border border-gray-100 ${className}`}
      onClick={() => onOpen?.(c.id)}
    >
      {/* Challenge Image */}
      {c.image && (
        <div className="aspect-video overflow-hidden">
          <ImageWithFallback 
            src={c.image} 
            alt={c.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
          />
        </div>
      )}
      
      <div className="p-6">
        {/* Status & Difficulty Tags */}
        <div className="flex items-center space-x-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(c.status)}`}>
            {c.status === 'open' ? 'Actief' : 
             c.status === 'draft' ? 'Concept' : 
             c.status === 'closed' ? 'Gesloten' : 'Gearchiveerd'}
          </span>
          
          {c.difficulty && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getDifficultyColor(c.difficulty)}`}>
              {getDifficultyIcon(c.difficulty)}
              <span className="capitalize">{c.difficulty}</span>
            </span>
          )}
          
          {timeRemaining && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center space-x-1">
              <Clock size={12} />
              <span>{timeRemaining}</span>
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
          {c.title}
        </h3>
        
        {c.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
            {c.description}
          </p>
        )}

        {/* Rewards */}
        <div className="flex items-center justify-between mb-4 p-3 bg-[#89CFF0]/10 rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-[#89CFF0]">+{c.rewardPoints || 0}</div>
              <div className="text-xs text-gray-600">Deelname</div>
            </div>
            
            {c.winnerRewardPoints && (
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">+{c.winnerRewardPoints}</div>
                <div className="text-xs text-gray-600">Winnaar</div>
              </div>
            )}
          </div>
          
          <Trophy className="w-6 h-6 text-[#89CFF0]" />
        </div>

        {/* Tags */}
        {c.tags && c.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {c.tags.slice(0, 3).map(tag => (
              <span 
                key={tag} 
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
            {c.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{c.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Dates */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar size={12} />
              <span>
                {c.startAt ? new Date(c.startAt).toLocaleDateString('nl-NL') : '–'} → {' '}
                {c.endAt ? new Date(c.endAt).toLocaleDateString('nl-NL') : '–'}
              </span>
            </div>
            
            {c.createdAt && (
              <span>
                Aangemaakt: {new Date(c.createdAt).toLocaleDateString('nl-NL')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};