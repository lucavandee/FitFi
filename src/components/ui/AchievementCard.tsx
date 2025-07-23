import React from 'react';
import { Award, Star, Crown } from 'lucide-react';

interface AchievementCardProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon?: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
    unlockedAt?: string;
    progress?: {
      current: number;
      total: number;
    };
  };
  isUnlocked?: boolean;
  className?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isUnlocked = false,
  className = ''
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown size={16} />;
      case 'epic': return <Star size={16} />;
      default: return <Award size={16} />;
    }
  };

  return (
    <div className={`bg-accent text-text-dark p-6 rounded-2xl shadow-lg ${
      isUnlocked ? '' : 'opacity-60'
    } ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isUnlocked 
              ? getRarityColor(achievement.rarity || 'common')
              : 'bg-gray-100 text-gray-400'
          }`}>
            {isUnlocked ? (
              achievement.icon ? (
                <span className="text-xl">{achievement.icon}</span>
              ) : (
                getRarityIcon(achievement.rarity || 'common')
              )
            ) : (
              <Award size={20} />
            )}
          </div>
          <div>
            <h3 className="font-semibold">{achievement.title}</h3>
            <p className="text-sm text-gray-600">{achievement.description}</p>
          </div>
        </div>
        
        {achievement.rarity && isUnlocked && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
            {achievement.rarity}
          </div>
        )}
      </div>
      
      {achievement.progress && !isUnlocked && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Voortgang</span>
            <span>{achievement.progress.current}/{achievement.progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-secondary h-2 rounded-full transition-all"
              style={{ width: `${(achievement.progress.current / achievement.progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {isUnlocked && achievement.unlockedAt && (
        <div className="text-xs text-gray-500">
          Behaald op {new Date(achievement.unlockedAt).toLocaleDateString('nl-NL')}
        </div>
      )}
    </div>
  );
};

export default AchievementCard;