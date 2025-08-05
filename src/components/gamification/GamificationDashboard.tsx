import React, { useState } from 'react';
import { Trophy, Star, Target, Users, TrendingUp, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGamification } from '../../context/GamificationContext';
import LevelProgress from './LevelProgress';
import Leaderboard from './Leaderboard';
import ChallengeHub from './ChallengeHub';
import Button from '../ui/Button';
import { trackEvent } from '../../utils/analytics';

interface GamificationDashboardProps {
  className?: string;
}

const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ className = '' }) => {
  const { 
    points, 
    currentLevelInfo, 
    earnedBadges, 
    streak,
    leaderboardRank,
    weeklyPoints,
    monthlyPoints
  } = useGamification();
  
  const [activeView, setActiveView] = useState<'overview' | 'challenges' | 'leaderboard'>('overview');

  const handleViewChange = (view: 'overview' | 'challenges' | 'leaderboard') => {
    setActiveView(view);
    
    trackEvent('gamification_view_changed', 'engagement', view, 1, {
      previous_view: activeView,
      user_level: currentLevelInfo?.id,
      user_points: points
    });
  };

  const stats = [
    {
      label: 'Totale Punten',
      value: points.toLocaleString(),
      icon: <Star className="w-5 h-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Huidige Level',
      value: currentLevelInfo?.name || 'Beginner',
      icon: <Trophy className="w-5 h-5" />,
      color: 'text-[#89CFF0]',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Leaderboard Rank',
      value: `#${leaderboardRank}`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Streak',
      value: `${streak} dagen`,
      icon: <Target className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Navigation */}
      <div className="bg-white rounded-2xl p-1 shadow-sm">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overzicht', icon: <Star className="w-4 h-4" /> },
            { id: 'challenges', label: 'Challenges', icon: <Target className="w-4 h-4" /> },
            { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleViewChange(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                activeView === tab.id
                  ? 'bg-[#89CFF0] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center mb-3`}>
                    <div className={stat.color}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            <Leaderboard type="all_time" limit={10} />

            {/* Level Progress */}
            <LevelProgress showPerks={true} />

            {/* Recent Badges */}
            {earnedBadges.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Gift className="w-5 h-5 text-[#89CFF0]" />
                  <h3 className="text-lg font-bold text-gray-900">Jouw Badges</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {earnedBadges.slice(0, 8).map((badge, index) => (
                    <div
                      key={badge.id}
                      className="text-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors animate-scale-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="text-2xl mb-2">{badge.icon}</div>
                      <div className="text-sm font-medium text-gray-900">{badge.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{badge.description}</div>
                    </div>
                  ))}
                </div>
                
                {earnedBadges.length > 8 && (
                  <div className="text-center mt-4">
                    <span className="text-sm text-gray-600">
                      +{earnedBadges.length - 8} meer badges
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-[#89CFF0]/10 to-blue-50 rounded-2xl p-6">
                <h4 className="font-medium text-gray-900 mb-4">Deze Week</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Punten verdiend:</span>
                    <span className="font-bold text-[#89CFF0]">{weeklyPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Challenges voltooid:</span>
                    <span className="font-bold text-gray-900">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Streak:</span>
                    <span className="font-bold text-orange-600">{streak} dagen</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6">
                <h4 className="font-medium text-gray-900 mb-4">Deze Maand</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Punten verdiend:</span>
                    <span className="font-bold text-purple-600">{monthlyPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rank verbetering:</span>
                    <span className="font-bold text-green-600">+5 posities</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nieuwe badges:</span>
                    <span className="font-bold text-gray-900">{earnedBadges.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'challenges' && (
          <ChallengeHub />
        )}

        {activeView === 'leaderboard' && (
          <div className="space-y-6">
            {/* Leaderboard Tabs */}
            <div className="grid grid-cols-3 gap-4">
              <Leaderboard type="all_time" limit={10} />
            </div>
            
            {/* Additional Leaderboards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Leaderboard type="weekly" limit={5} />
              <Leaderboard type="monthly" limit={5} />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GamificationDashboard;