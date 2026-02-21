import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Star, TrendingUp } from 'lucide-react';
import { track } from '../../utils/analytics';

interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  level: string;
  rank: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  type?: 'all_time' | 'weekly' | 'monthly';
  limit?: number;
  showCurrentUser?: boolean;
  className?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  type = 'all_time',
  limit = 10,
  showCurrentUser = true,
  className = ''
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [type, limit]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    
    try {
      // Mock leaderboard data for demonstration
      const mockEntries: LeaderboardEntry[] = [
        { id: '1', name: 'Emma S.', points: 2450, level: 'Style Icon', rank: 1 },
        { id: '2', name: 'Marco K.', points: 2180, level: 'Trendsetter', rank: 2 },
        { id: '3', name: 'Lisa M.', points: 1920, level: 'Enthusiast', rank: 3 },
        { id: '4', name: 'Sophie G.', points: 1650, level: 'Explorer', rank: 4 },
        { id: '5', name: 'Jasper M.', points: 1380, level: 'Explorer', rank: 5 },
        { id: '6', name: 'Nina V.', points: 1120, level: 'Beginner', rank: 6 },
        { id: '7', name: 'Thomas J.', points: 980, level: 'Beginner', rank: 7 },
        { id: '8', name: 'Isabella R.', points: 850, level: 'Beginner', rank: 8 },
        { id: '9', name: 'Luna K.', points: 720, level: 'Beginner', rank: 9 },
        { id: '10', name: 'David P.', points: 650, level: 'Beginner', rank: 10 }
      ];
      
      // Simulate current user at rank 42
      setCurrentUserRank(42);
      
      setEntries(mockEntries.slice(0, limit));
      
      // Track leaderboard view
      track('leaderboard_viewed', {
        event_category: 'gamification',
        event_label: type,
        leaderboard_type: type,
        entries_shown: limit
      });
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3: return <Star className="w-5 h-5 text-orange-500" />;
      default: return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300';
      case 2: return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
      case 3: return 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300';
      default: return 'bg-white border-gray-200';
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'weekly': return 'Deze Week';
      case 'monthly': return 'Deze Maand';
      default: return 'All Time';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Trophy className="w-5 h-5 text-[var(--ff-color-primary-500)] mr-2" />
          Leaderboard - {getTypeTitle()}
        </h3>
        
        <div className="text-sm text-gray-600">
          Top {entries.length}
        </div>
      </div>

      {/* Leaderboard Entries */}
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className={`flex items-center space-x-4 p-3 rounded-xl border transition-all hover:shadow-sm ${getRankColor(entry.rank)} ${
              entry.isCurrentUser ? 'ring-2 ring-[var(--ff-color-primary-500)]' : ''
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Rank */}
            <div className="w-8 h-8 flex items-center justify-center">
              {getRankIcon(entry.rank)}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {entry.name}
                {entry.isCurrentUser && (
                  <span className="ml-2 text-xs bg-[var(--ff-color-primary-500)] text-white px-2 py-1 rounded-full">
                    Jij
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">{entry.level}</div>
            </div>

            {/* Points */}
            <div className="text-right">
              <div className="font-bold text-gray-900">{entry.points.toLocaleString()}</div>
              <div className="text-xs text-gray-500">punten</div>
            </div>
          </div>
        ))}
      </div>

      {/* Current User Position (if not in top) */}
      {showCurrentUser && currentUserRank && currentUserRank > limit && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4 p-3 rounded-xl bg-[var(--ff-color-primary-500)]/10 border border-[var(--ff-color-primary-500)]/20">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-sm font-bold text-[var(--ff-color-primary-500)]">#{currentUserRank}</span>
            </div>
            
            <div className="flex-1">
              <div className="font-medium text-gray-900">Jouw positie</div>
              <div className="text-sm text-gray-600">Blijf challenges doen om hoger te komen!</div>
            </div>
            
            <TrendingUp className="w-5 h-5 text-[var(--ff-color-primary-500)]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;