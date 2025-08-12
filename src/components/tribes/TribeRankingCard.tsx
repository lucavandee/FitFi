import React from 'react';
import { Trophy, TrendingUp, Users, Star, Crown, Medal, Calendar } from 'lucide-react';
import type { TribeRanking, Tribe } from '@/services/data/types';
import ImageWithFallback from '../ui/ImageWithFallback';

interface TribeRankingCardProps {
  tribe?: Tribe;
  ranking?: TribeRanking;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const TribeRankingCard: React.FC<TribeRankingCardProps> = ({
  tribe,
  ranking,
  showDetails = true,
  compact = false,
  className = ''
}) => {
  const getRankIcon = (rank?: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-500" />;
      default:
        return <Trophy className="w-6 h-6 text-[#89CFF0]" />;
    }
  };

  const getRankStyling = (rank?: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 shadow-lg';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 shadow-md';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 shadow-md';
      default:
        return 'bg-white border border-gray-200 hover:shadow-md';
    }
  };

  const getPointsDisplay = (points: number) => {
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}k`;
    }
    return points.toLocaleString();
  };

  const getRankBadge = (rank?: number) => {
    if (!rank) return null;
    
    if (rank <= 3) {
      return (
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
          rank === 1 ? 'bg-yellow-100 text-yellow-800' :
          rank === 2 ? 'bg-gray-100 text-gray-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {getRankIcon(rank)}
          <span>#{rank}</span>
        </div>
      );
    }
    
    return (
      <div className="px-3 py-1 bg-[#89CFF0]/10 text-[#89CFF0] rounded-full text-xs font-medium">
        #{rank}
      </div>
    );
  };

  if (!ranking && !tribe) {
    return null;
  }

  if (compact) {
    return (
      <div className={`rounded-xl p-3 transition-all ${getRankStyling(ranking?.rank)} ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getRankIcon(ranking?.rank)}
            </div>
            
            <div>
              <div className="font-medium text-gray-900 text-sm">
                {tribe?.name || `Tribe ${ranking?.tribeId.slice(-6)}`}
              </div>
              <div className="text-xs text-gray-600">
                {tribe?.member_count || 0} members
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-[#89CFF0]">
              {getPointsDisplay(ranking?.points || 0)}
            </div>
            <div className="text-xs text-gray-500">punten</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-6 transition-all hover:transform hover:scale-105 ${getRankStyling(ranking?.rank)} ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Rank Icon */}
          <div className="flex-shrink-0">
            {getRankIcon(ranking?.rank)}
          </div>
          
          {/* Tribe Info */}
          <div className="flex items-center space-x-3">
            {tribe?.cover_img && (
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <ImageWithFallback
                  src={tribe.cover_img}
                  alt={tribe.name}
                  className="w-full h-full object-cover"
                  componentName="TribeRankingCard"
                />
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-gray-900">
                {tribe?.name || `Tribe ${ranking?.tribeId.slice(-6)}`}
              </h4>
              
              {showDetails && tribe && (
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users size={12} />
                    <span>{tribe.member_count} members</span>
                  </div>
                  
                  {ranking?.rank && ranking.rank <= 3 && (
                    <div className="flex items-center space-x-1">
                      <Star size={12} />
                      <span>Top {ranking.rank}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Rank Badge */}
        {getRankBadge(ranking?.rank)}
      </div>

      {/* Points Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-[#89CFF0]" />
          <span className="text-sm text-gray-600">Tribe Score</span>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-[#89CFF0]">
            {getPointsDisplay(ranking?.points || 0)}
          </div>
          <div className="text-xs text-gray-500">punten</div>
        </div>
      </div>

      {/* Last Updated */}
      {ranking?.updatedAt && showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Calendar size={12} />
            <span>
              Laatst bijgewerkt: {new Date(ranking.updatedAt).toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      )}

      {/* Tribe Description */}
      {tribe?.description && showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 leading-relaxed">
            {tribe.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default TribeRankingCard;