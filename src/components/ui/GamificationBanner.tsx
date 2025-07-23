import React from 'react';
import { Star, Gift, TrendingUp, Award } from 'lucide-react';
import Button from './Button';

interface GamificationBannerProps {
  points: number;
  level: string;
  nextLevelPoints: number;
  currentLevelPoints: number;
  onViewDashboard?: () => void;
  className?: string;
}

const GamificationBanner: React.FC<GamificationBannerProps> = ({
  points,
  level,
  nextLevelPoints,
  currentLevelPoints,
  onViewDashboard,
  className = ''
}) => {
  const progress = ((points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
  const pointsToNext = nextLevelPoints - points;

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return <Star className="text-green-500" size={20} />;
      case 'pro': return <Award className="text-blue-500" size={20} />;
      case 'master': return <Gift className="text-purple-500" size={20} />;
      default: return <TrendingUp className="text-secondary" size={20} />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'from-green-500/20 to-green-600/20';
      case 'pro': return 'from-blue-500/20 to-blue-600/20';
      case 'master': return 'from-purple-500/20 to-purple-600/20';
      default: return 'from-secondary/20 to-secondary/30';
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getLevelColor(level)} p-6 rounded-2xl shadow-lg border border-white/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
            {getLevelIcon(level)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-dark">Level {level}</h3>
            <p className="text-sm text-gray-600">{points.toLocaleString()} punten</p>
          </div>
        </div>
        
        {onViewDashboard && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onViewDashboard}
          >
            Dashboard
          </Button>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Voortgang naar volgend level</span>
          <span className="font-medium text-text-dark">{pointsToNext} punten te gaan</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2">
          <div 
            className="bg-secondary h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          🎯 Voltooi dagelijkse challenges voor extra punten
        </span>
        <div className="flex items-center space-x-1 text-secondary">
          <Gift size={14} />
          <span className="font-medium">+10-50 punten</span>
        </div>
      </div>
    </div>
  );
};

export default GamificationBanner;