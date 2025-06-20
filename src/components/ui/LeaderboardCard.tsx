import React from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  level: string;
  avatar?: string;
  isCurrentUser?: boolean;
}

const LeaderboardCard: React.FC = () => {
  // Mock leaderboard data - in a real app, this would come from an API
  const leaderboardData: LeaderboardEntry[] = [
    {
      id: '1',
      name: 'Emma van der Berg',
      points: 8750,
      level: 'master',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    {
      id: '2',
      name: 'Lars Janssen',
      points: 7200,
      level: 'master',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    {
      id: '3',
      name: 'Sophie Bakker',
      points: 6890,
      level: 'master',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    {
      id: '4',
      name: 'Jij', // Current user
      points: 1250,
      level: 'pro',
      isCurrentUser: true
    },
    {
      id: '5',
      name: 'Mike de Vries',
      points: 980,
      level: 'beginner',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    }
  ];

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="text-yellow-500" size={20} />;
      case 2:
        return <Medal className="text-gray-400" size={20} />;
      case 3:
        return <Award className="text-amber-600" size={20} />;
      default:
        return <span className="text-gray-500 font-bold">#{position}</span>;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'master':
        return 'text-purple-600 dark:text-purple-400';
      case 'pro':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-green-600 dark:text-green-400';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'master':
        return '👑';
      case 'pro':
        return '⭐';
      default:
        return '🌱';
    }
  };

  const getLevelName = (level: string) => {
    switch (level) {
      case 'master':
        return 'Meester';
      case 'pro':
        return 'Pro';
      default:
        return 'Beginner';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
            <TrendingUp className="text-purple-600 dark:text-purple-400" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Ranglijst
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Top stijlliefhebbers deze week
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-3">
          {leaderboardData.map((entry, index) => (
            <div 
              key={entry.id}
              className={`
                flex items-center space-x-4 p-3 rounded-lg transition-all hover:scale-[1.02]
                ${entry.isCurrentUser 
                  ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' 
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}
              `}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8">
                {getRankIcon(index + 1)}
              </div>
              
              {/* Avatar */}
              <div className="relative">
                {entry.avatar ? (
                  <img 
                    src={entry.avatar} 
                    alt={entry.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                    {entry.name.charAt(0)}
                  </div>
                )}
                
                {/* Level badge */}
                <div className="absolute -bottom-1 -right-1 text-sm">
                  {getLevelIcon(entry.level)}
                </div>
              </div>
              
              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className={`font-medium truncate ${
                    entry.isCurrentUser 
                      ? 'text-orange-700 dark:text-orange-300' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span className="ml-1 text-xs bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-1 rounded">
                        JIJ
                      </span>
                    )}
                  </p>
                </div>
                <p className={`text-xs capitalize ${getLevelColor(entry.level)}`}>
                  {getLevelName(entry.level)} niveau
                </p>
              </div>
              
              {/* Points */}
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">
                  {entry.points.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  punten
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-6 pt-4 border-t dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            🏆 Wedijver met andere stijlliefhebbers
          </p>
          <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors">
            Bekijk Volledige Ranglijst
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardCard;