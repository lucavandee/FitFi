import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Star, Users, TrendingUp, Medal } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useGamification } from '../../context/GamificationContext';
import { supabase } from '../../lib/supabase';
import { trackEvent } from '../../utils/analytics';
import LoadingFallback from '../ui/LoadingFallback';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  points: number;
  level: string;
  rank: number;
  avatar_url?: string;
  weekly_points: number;
  monthly_points: number;
  is_current_user?: boolean;
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
  const { user } = useUser();
  const { currentLevelInfo } = useGamification();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [type, user?.id]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    
    try {
      // Get leaderboard data from Supabase
      const { data, error } = await supabase
        .rpc('get_leaderboard', { 
          leaderboard_type: type,
          limit_count: limit 
        });

      if (error) {
        console.error('[Leaderboard] RPC error:', error);
        // Use mock data as fallback
        setLeaderboard(generateMockLeaderboard());
        return;
      }

      const leaderboardData = data || generateMockLeaderboard();
      
      // Mark current user
      const processedData = leaderboardData.map((entry: any, index: number) => ({
        ...entry,
        rank: index + 1,
        is_current_user: entry.user_id === user?.id
      }));

      setLeaderboard(processedData);

      // Find current user entry
      if (showCurrentUser && user?.id) {
        const userEntry = processedData.find((entry: LeaderboardEntry) => entry.is_current_user);
        if (userEntry) {
          setCurrentUserEntry(userEntry);
        } else {
          // Get user's position if not in top list
          try {
            const { data: userRank, error: rankError } = await supabase
              .rpc('get_user_leaderboard_rank', { 
                user_uuid: user.id,
                leaderboard_type: type 
              });
            
            if (rankError) {
              console.error('[Leaderboard] User rank error:', rankError);
            } else if (userRank) {
              setCurrentUserEntry({
                user_id: user.id,
                username: user.name || 'You',
                points: userRank.points || 0,
                level: userRank.level || 'beginner',
                rank: userRank.rank || 999,
                weekly_points: userRank.weekly_points || 0,
                monthly_points: userRank.monthly_points || 0,
                is_current_user: true
              });
            }
          } catch (rankError) {
            console.error('[Leaderboard] User rank query failed:', rankError);
          }
        }
      }

      // Track leaderboard view
      trackEvent('leaderboard_viewed', 'engagement', type, 1, {
        user_id: user?.id,
        leaderboard_type: type,
        user_rank: currentUserEntry?.rank
      });

    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard(generateMockLeaderboard());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockLeaderboard = (): LeaderboardEntry[] => {
    const mockUsers = [
      { name: 'StyleMaster', level: 'master', points: 8500 },
      { name: 'FashionGuru', level: 'guru', points: 7200 },
      { name: 'TrendSetter', level: 'icon', points: 6800 },
      { name: 'StyleIcon', level: 'influencer', points: 5400 },
      { name: 'ChicExpert', level: 'trendsetter', points: 4200 },
      { name: 'ModeLover', level: 'enthusiast', points: 3100 },
      { name: 'StyleSeeker', level: 'explorer', points: 2400 },
      { name: 'FashionFan', level: 'explorer', points: 1800 },
      { name: 'StyleBeginner', level: 'beginner', points: 900 },
      { name: 'NewUser', level: 'beginner', points: 450 }
    ];

    return mockUsers.map((mockUser, index) => ({
      user_id: `mock_${index}`,
      username: mockUser.name,
      points: mockUser.points,
      level: mockUser.level,
      rank: index + 1,
      weekly_points: Math.floor(mockUser.points * 0.1),
      monthly_points: Math.floor(mockUser.points * 0.3),
      is_current_user: false
    }));
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankStyling = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-gradient-to-r from-[#89CFF0]/20 to-blue-50 border-2 border-[#89CFF0]/30';
    }
    
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200';
      default:
        return 'bg-white border border-gray-100 hover:bg-gray-50';
    }
  };

  const getPointsDisplay = (entry: LeaderboardEntry) => {
    switch (type) {
      case 'weekly':
        return entry.weekly_points;
      case 'monthly':
        return entry.monthly_points;
      default:
        return entry.points;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'weekly':
        return 'Deze Week';
      case 'monthly':
        return 'Deze Maand';
      default:
        return 'All Time';
    }
  };

  if (isLoading) {
    return <LoadingFallback message="Leaderboard laden..." />;
  }

  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
            <p className="text-gray-600 text-sm">{getTypeLabel()}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{leaderboard.length} spelers</span>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.user_id}
            className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 animate-fade-in ${getRankStyling(entry.rank, entry.is_current_user || false)}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center space-x-4">
              {/* Rank */}
              <div className="flex-shrink-0">
                {getRankIcon(entry.rank)}
              </div>
              
              {/* Avatar */}
              <div className="flex-shrink-0">
                {entry.avatar_url ? (
                  <img
                    src={entry.avatar_url}
                    alt={entry.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#89CFF0] to-blue-500 flex items-center justify-center text-white font-medium">
                    {entry.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`font-medium ${entry.is_current_user ? 'text-[#89CFF0]' : 'text-gray-900'}`}>
                    {entry.is_current_user ? 'Jij' : entry.username}
                  </span>
                  {entry.rank <= 3 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                      Top {entry.rank}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="capitalize">{entry.level.replace('_', ' ')}</span>
                  {entry.is_current_user && (
                    <span className="text-[#89CFF0]">• Dat ben jij!</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Points */}
            <div className="text-right">
              <div className={`text-lg font-bold ${entry.is_current_user ? 'text-[#89CFF0]' : 'text-gray-900'}`}>
                {getPointsDisplay(entry).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">punten</div>
            </div>
          </div>
        ))}
      </div>

      {/* Current User Position (if not in top list) */}
      {showCurrentUser && currentUserEntry && !currentUserEntry.is_current_user && currentUserEntry.rank > limit && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600 mb-3">Jouw positie</div>
          <div className={`flex items-center justify-between p-4 rounded-xl ${getRankStyling(currentUserEntry.rank, true)}`}>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-[#89CFF0]">
                  #{currentUserEntry.rank}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#89CFF0] to-blue-500 flex items-center justify-center text-white font-medium">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-medium text-[#89CFF0]">Jij</span>
                <div className="text-sm text-gray-600 capitalize">{currentUserEntry.level.replace('_', ' ')}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-[#89CFF0]">
                {getPointsDisplay(currentUserEntry).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">punten</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{leaderboard.length}</div>
            <div className="text-xs text-gray-600">Actieve spelers</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {Math.max(...leaderboard.map(e => getPointsDisplay(e))).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Hoogste score</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {Math.round(leaderboard.reduce((sum, e) => sum + getPointsDisplay(e), 0) / leaderboard.length).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Gemiddelde</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;