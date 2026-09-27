import React from "react";
import type { TribeChallenge } from "@/services/data/types";
import { Calendar, Clock, Trophy } from 'lucide-react';

interface ChallengeCardProps {
  c: TribeChallenge;
  onOpen?: (id: string) => void;
  className?: string;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ c, onOpen, className = '' }) => {
  const getStatusColor = (status?: string) => {
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
    if (!c.ends_at) return null;

    const endTime = new Date(c.ends_at).getTime();
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
      <div className="p-6">
        {/* Status Tags */}
        <div className="flex items-center space-x-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(c.status)}`}>
            {c.status === 'open' ? 'Actief' :
             c.status === 'draft' ? 'Concept' :
             c.status === 'closed' ? 'Gesloten' : 'Gearchiveerd'}
          </span>

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

        {/* Dates */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Calendar size={12} />
            <span>
              {c.starts_at ? new Date(c.starts_at).toLocaleDateString('nl-NL') : '–'} → {' '}
              {c.ends_at ? new Date(c.ends_at).toLocaleDateString('nl-NL') : '–'}
            </span>
          </div>

          <Trophy className="w-5 h-5 text-[#A85740]" />
        </div>
      </div>
    </div>
  );
};