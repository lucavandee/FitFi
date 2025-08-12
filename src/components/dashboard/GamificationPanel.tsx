import React, { useState } from 'react';
import { Trophy, Flame, Star, Gift } from 'lucide-react';
import Button from '../ui/Button';
import { track } from '@/utils/analytics';
import toast from 'react-hot-toast';

interface GamificationPanelProps {
  level?: number;
  xp?: number;
  streak?: number;
  onClaimDaily?: () => void;
  loading?: boolean;
  className?: string;
}

const GamificationPanel: React.FC<GamificationPanelProps> = ({
  level = 1,
  xp = 0,
  streak = 0,
  onClaimDaily,
  loading = false,
  className = ''
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  const nextLevelXP = Math.max(100, Math.ceil((level + 1) * 100));
  const currentLevelXP = level > 1 ? Math.ceil(level * 100) : 0;
  const progressXP = xp - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.min(100, Math.round((progressXP / neededXP) * 100));

  const handleClaimDaily = async () => {
    if (!onClaimDaily) return;
    
    // Show confetti animation
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
    
    // Track claim action
    track('daily_xp_claim', {
      current_xp: xp,
      current_level: level,
      streak: streak,
      source: 'gamification_panel'
    });
    
    onClaimDaily();
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-3xl shadow-sm p-6 animate-pulse ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        </div>
        <div className="space-y-3">
          <div className="h-2 bg-gray-200 rounded-full"></div>
          <div className="h-10 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white rounded-3xl shadow-sm p-6 hover:shadow-md transition-all ${className}`}>
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#89CFF0] rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Trophy className="w-5 h-5 text-[#89CFF0]" />
            <span className="text-sm font-medium text-gray-600">Jouw Level</span>
          </div>
          <div className="text-2xl font-bold text-[#0D1B2A]">Level {level}</div>
          <div className="text-sm text-gray-500">{xp.toLocaleString()} XP</div>
        </div>
        
        {/* Circular Progress */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#levelGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={`${283 - (283 * progressPercentage) / 100}`}
              className="transition-all duration-1000 ease-out"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#89CFF0" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-[#89CFF0]">
              {progressPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Voortgang naar Level {level + 1}</span>
          <span className="font-medium text-[#0D1B2A]">
            {(neededXP - progressXP).toLocaleString()} XP te gaan
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#89CFF0] to-blue-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            streak > 0 ? 'bg-orange-100' : 'bg-gray-100'
          }`}>
            <Flame className={`w-4 h-4 ${
              streak > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-400'
            }`} />
          </div>
          <div>
            <div className="font-medium text-[#0D1B2A]">{streak} dagen streak</div>
            <div className="text-xs text-gray-500">
              {streak > 0 ? 'Keep it up!' : 'Start je streak vandaag'}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-orange-500">🔥</div>
        </div>
      </div>

      {/* Claim Daily XP */}
      <Button
        onClick={handleClaimDaily}
        variant="primary"
        size="lg"
        fullWidth
        icon={<Gift size={18} />}
        iconPosition="left"
        className="bg-gradient-to-r from-[#89CFF0] to-blue-500 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
      >
        Claim Daily XP (+10)
      </Button>
    </div>
  );
};

export default GamificationPanel;