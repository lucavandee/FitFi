import React from 'react';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  level: string;
  avatar?: string;
  rank: number;
}

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  title?: string;
  className?: string;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  entries,
  currentUserId,
  title = 'Leaderboard',
  className = ''
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="text-yellow-500" size={20} />;
      case 2: return <Medal className="text-gray-400" size={20} />;
      case 3: return <Award className="text-orange-500" size={20} />;
      default: return <span className="text-gray-600 font-bold">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-50 border-yellow-200';
      case 2: return 'bg-gray-50 border-gray-200';
      case 3: return 'bg-orange-50 border-orange-200';
      default: return 'bg-white border-gray-200';
    }
  };

  return (
    <div className={`bg-accent text-text-dark p-6 rounded-2xl shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <Trophy className="text-secondary mr-2" size={24} />
          {title}
        </h2>
      </div>
      
      <div className="space-y-3">
        {entries.map((entry) => {
          const isCurrentUser = entry.id === currentUserId;
          
          return (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isCurrentUser 
                  ? 'bg-secondary/10 border-secondary' 
                  : getRankBg(entry.rank)
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                
                <div className="flex items-center space-x-3">
                  {entry.avatar ? (
                    <img 
                      src={entry.avatar} 
                      alt={entry.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {entry.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <p className={`font-medium ${isCurrentUser ? 'text-secondary' : ''}`}>
                      {entry.name} {isCurrentUser && '(jij)'}
                    </p>
                    <p className="text-xs text-gray-600">Level {entry.level}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-secondary">{entry.points.toLocaleString()}</p>
                <p className="text-xs text-gray-600">punten</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {entries.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="text-gray-300 mx-auto mb-4" size={48} />
          <p className="text-gray-500">Nog geen leaderboard data beschikbaar</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardCard;