import React from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageWithFallback from './ImageWithFallback';

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
      name: "Emma van der Berg",
      points: 8750,
      level: 'master',
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2"
    },
    {
      id: '2',
      name: "Lars Janssen",
      points: 7200,
      level: 'master',
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2"
    },
    {
      id: '3',
      name: "Sophie Bakker",
      points: 6890,
      level: 'master',
      avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2"
    },
    {
      id: '4',
      name: "Jij", // Current user
      points: 1250,
      level: 'pro',
      isCurrentUser: true
    },
    {
      id: '5',
      name: "Mike de Vries",
      points: 980,
      level: 'beginner',
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2"
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
        return <span className="text-white/50 font-bold">#{position}</span>;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'master':
        return 'text-purple-400';
      case 'pro':
        return 'text-[#FF8600]';
      default:
        return 'text-green-400';
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
    <motion.div 
      className="bg-white dark:bg-midnight-800 rounded-xl shadow-md overflow-hidden transition-colors"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="p-6 border-b border-lightGrey-200 dark:border-midnight-600">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-turquoise-100 dark:bg-turquoise-900/20">
            <TrendingUp className="text-turquoise-600 dark:text-turquoise-400" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-textPrimary-light dark:text-textPrimary-dark">
              Ranglijst
            </h3>
            <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
              Top stijlliefhebbers deze week
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-3">
          {leaderboardData.map((entry, index) => (
            <motion.div 
              key={entry.id}
              className={`
                flex items-center space-x-4 p-3 rounded-lg transition-all
                ${entry.isCurrentUser 
                  ? 'bg-turquoise-50 dark:bg-turquoise-900/10 border border-turquoise-200 dark:border-turquoise-800' 
                  : 'bg-lightGrey-50 dark:bg-midnight-700 hover:bg-lightGrey-100 dark:hover:bg-midnight-600'}
              `}
              whileHover={{ scale: 1.02 }}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8">
                {getRankIcon(index + 1)}
              </div>
              
              {/* Avatar */}
              <div className="relative">
                {entry.avatar ? (
                  <ImageWithFallback 
                    src={entry.avatar} 
                    alt={entry.name}
                    className="w-10 h-10 rounded-full object-cover"
                    componentName="LeaderboardCard_Avatar"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-turquoise-300 to-turquoise-500 flex items-center justify-center text-textPrimary-dark font-bold">
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
                      ? 'text-turquoise-600 dark:text-turquoise-400' 
                      : 'text-textPrimary-light dark:text-textPrimary-dark'
                  }`}>
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span className="ml-1 text-xs bg-turquoise-100 dark:bg-turquoise-900/20 text-turquoise-600 dark:text-turquoise-400 px-1 rounded">
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
                <p className="font-bold text-textPrimary-light dark:text-textPrimary-dark">
                  {entry.points.toLocaleString()}
                </p>
                <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                  punten
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-lightGrey-200 dark:border-midnight-600 text-center">
          <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark mb-2">
            🏆 Wedijver met andere stijlliefhebbers
          </p>
          <button className="text-sm text-turquoise-500 hover:text-turquoise-600 font-medium transition-colors">
            Bekijk Volledige Ranglijst
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LeaderboardCard;