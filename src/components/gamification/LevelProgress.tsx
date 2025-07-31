import React from 'react';
import { Star, Crown, TrendingUp, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGamification } from '../../context/GamificationContext';

interface LevelProgressProps {
  showPerks?: boolean;
  compact?: boolean;
  className?: string;
}

const LevelProgress: React.FC<LevelProgressProps> = ({
  showPerks = true,
  compact = false,
  className = ''
}) => {
  const { 
    points, 
    currentLevelInfo, 
    nextLevelInfo, 
    progressToNextLevel,
    getCurrentLevelPerks 
  } = useGamification();

  if (!currentLevelInfo) return null;

  const currentPerks = getCurrentLevelPerks();
  const nextLevelPerks = nextLevelInfo?.perks || [];

  if (compact) {
    return (
      <div className={`bg-white rounded-2xl p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{currentLevelInfo.icon}</span>
            <div>
              <div className="font-medium text-gray-900">{currentLevelInfo.name}</div>
              <div className="text-sm text-gray-600">{points.toLocaleString()} punten</div>
            </div>
          </div>
          {nextLevelInfo && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Volgende level</div>
              <div className="text-xs text-gray-500">
                {(nextLevelInfo.minPoints - points).toLocaleString()} punten te gaan
              </div>
            </div>
          )}
        </div>
        
        {nextLevelInfo && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className="h-2 rounded-full bg-gradient-to-r from-[#89CFF0] to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextLevel}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: currentLevelInfo.color + '20' }}
          >
            {currentLevelInfo.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{currentLevelInfo.name}</h3>
            <p className="text-gray-600">Level {currentLevelInfo.rank}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{points.toLocaleString()}</div>
          <div className="text-sm text-gray-600">punten</div>
        </div>
      </div>

      {/* Progress to Next Level */}
      {nextLevelInfo ? (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Voortgang naar {nextLevelInfo.name}</span>
            <span className="font-medium text-gray-900">{progressToNextLevel}%</span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div 
                className="h-3 rounded-full bg-gradient-to-r from-[#89CFF0] to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextLevel}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            
            {/* Next level icon */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-sm border-2 border-white shadow-sm"
              style={{ 
                left: `${progressToNextLevel}%`,
                backgroundColor: nextLevelInfo.color 
              }}
            >
              {nextLevelInfo.icon}
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{currentLevelInfo.minPoints.toLocaleString()}</span>
            <span>{(nextLevelInfo.minPoints - points).toLocaleString()} punten te gaan</span>
            <span>{nextLevelInfo.minPoints.toLocaleString()}</span>
          </div>
        </div>
      ) : (
        <div className="mb-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 px-4 py-2 rounded-full">
            <Crown className="w-4 h-4" />
            <span className="font-medium">Maximum level bereikt!</span>
          </div>
        </div>
      )}

      {/* Current Level Perks */}
      {showPerks && currentPerks.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Gift className="w-4 h-4 mr-2 text-[#89CFF0]" />
            Jouw huidige voordelen:
          </h4>
          <div className="space-y-2">
            {currentPerks.map((perk, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-[#89CFF0] rounded-full"></div>
                <span className="text-gray-700">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Level Preview */}
      {showPerks && nextLevelInfo && nextLevelPerks.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-gray-600" />
            Unlock bij {nextLevelInfo.name}:
          </h4>
          <div className="space-y-2">
            {nextLevelPerks.slice(0, 3).map((perk, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">{perk}</span>
              </div>
            ))}
            {nextLevelPerks.length > 3 && (
              <div className="text-xs text-gray-500">
                +{nextLevelPerks.length - 3} meer voordelen...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelProgress;