import React from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

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
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-[#FF8600]/20">
            <TrendingUp className="text-[#FF8600]" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Ranglijst
            </h3>
            <p className="text-sm text-white/70">
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
                  ? 'bg-[#FF8600]/10 border border-[#FF8600]/20' 
                  : 'bg-white/5 hover:bg-white/10'}
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
                  <img 
                    src={entry.avatar} 
                    alt={entry.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => { 
                      e.currentTarget.onerror = null; 
                      e.currentTarget.src = '/placeholder.png'; 
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF8600]/30 to-[#0ea5e9]/30 flex items-center justify-center text-white font-bold">
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
                      ? 'text-[#FF8600]' 
                      : 'text-white'
                  }`}>
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span className="ml-1 text-xs bg-[#FF8600]/20 text-[#FF8600] px-1 rounded">
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
                <p className="font-bold text-white">
                  {entry.points.toLocaleString()}
                </p>
                <p className="text-xs text-white/60">
                  punten
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-white/60 mb-2">
            🏆 Wedijver met andere stijlliefhebbers
          </p>
          <button className="text-sm text-[#0ea5e9] hover:text-blue-400 font-medium transition-colors">
            Bekijk Volledige Ranglijst
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LeaderboardCard;