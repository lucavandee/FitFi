import React from "react";
import { useTribeRanking } from "@/hooks/useTribeChallenges";
import { Trophy, Crown, Medal, TrendingUp, Users, Star } from 'lucide-react';
import LoadingFallback from "../ui/LoadingFallback";

interface RankingBoardProps {
  className?: string;
  limit?: number;
  showDetails?: boolean;
}

export const RankingBoard: React.FC<RankingBoardProps> = ({ 
  className = '',
  limit = 10,
  showDetails = true
}) => {
  const { data, loading, error } = useTribeRanking();

  if (loading) {
    return <LoadingFallback message="Ranking laden..." />;
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Ranking kon niet geladen worden
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-[#89CFF0] hover:text-[#89CFF0]/80 font-medium"
        >
          Probeer opnieuw
        </button>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nog geen ranking
        </h3>
        <p className="text-gray-600">
          Tribes moeten eerst punten verdienen om in de ranking te verschijnen.
        </p>
      </div>
    );
  }

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

  const displayData = limit ? data.slice(0, limit) : data;

  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Tribe Ranking</h3>
            <p className="text-gray-600 text-sm">Top presterende tribes</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Users size={16} />
          <span>{data.length} tribes</span>
        </div>
      </div>

      {/* Ranking List */}
      <div className="space-y-3">
        {displayData.map((ranking, index) => (
          <div
            key={ranking.tribeId}
            className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 animate-fade-in ${getRankStyling(ranking.rank)}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center space-x-4">
              {/* Rank Icon */}
              <div className="flex-shrink-0">
                {getRankIcon(ranking.rank)}
              </div>
              
              {/* Tribe Info */}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {ranking.tribeId.replace('tribe-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  
                  {ranking.rank && ranking.rank <= 3 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                      Top {ranking.rank}
                    </span>
                  )}
                </div>
                
                {showDetails && (
                  <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                    <div className="flex items-center space-x-1">
                      <TrendingUp size={12} />
                      <span>Actief</span>
                    </div>
                    
                    {ranking.updatedAt && (
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>
                          {new Date(ranking.updatedAt).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Points Display */}
            <div className="text-right">
              <div className="text-xl font-bold text-[#89CFF0]">
                {getPointsDisplay(ranking.points)}
              </div>
              <div className="text-sm text-gray-600">punten</div>
            </div>
          </div>
        ))}
      </div>

      {/* Ranking Stats */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{data.length}</div>
              <div className="text-sm text-gray-600">Actieve tribes</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {Math.max(...data.map(r => r.points)).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Hoogste score</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {Math.round(data.reduce((sum, r) => sum + r.points, 0) / data.length).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Gemiddelde</div>
            </div>
          </div>
        </div>
      )}

      {/* Show More Button */}
      {limit && data.length > limit && (
        <div className="text-center mt-6">
          <button className="text-[#89CFF0] hover:text-[#89CFF0]/80 font-medium text-sm">
            Bekijk alle {data.length} tribes →
          </button>
        </div>
      )}
    </div>
  );
};