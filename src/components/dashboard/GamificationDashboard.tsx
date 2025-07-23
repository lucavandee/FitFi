import React from 'react';
import { Award, Star, Gift, TrendingUp, Users } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import DailyChallengeCard from '../ui/DailyChallengeCard';
import AchievementCard from '../ui/AchievementCard';
import LeaderboardCard from '../ui/LeaderboardCard';
import ReferralWidget from '../ui/ReferralWidget';

const GamificationDashboard: React.FC = () => {
  const { 
    points, 
    level, 
    badges, 
    streak, 
    availableChallenges,
    completeChallenge,
    earnedBadges
  } = useGamification();

  // Mock data for demonstration
  const mockChallenges = [
    {
      id: 'daily-1',
      title: 'Bekijk 3 outfits',
      description: 'Bekijk minstens 3 outfit aanbevelingen vandaag',
      points: 20,
      completed: false,
      icon: '👀'
    },
    {
      id: 'daily-2',
      title: 'Deel je look',
      description: 'Deel een outfit op social media',
      points: 30,
      completed: false,
      icon: '📱'
    }
  ];

  const mockAchievements = [
    {
      id: 'first-quiz',
      title: 'Eerste Quiz',
      description: 'Voltooi je eerste stijlquiz',
      icon: '⭐',
      rarity: 'common' as const,
      unlockedAt: '2024-12-15'
    },
    {
      id: 'style-explorer',
      title: 'Style Explorer',
      description: 'Bekijk 50 verschillende outfits',
      icon: '🧭',
      rarity: 'rare' as const,
      progress: { current: 23, total: 50 }
    }
  ];

  const mockLeaderboard = [
    { id: '1', name: 'Emma S.', points: 1250, level: 'Pro', rank: 1 },
    { id: '2', name: 'Thomas J.', points: 980, level: 'Pro', rank: 2 },
    { id: '3', name: 'Sophie B.', points: 875, level: 'Beginner', rank: 3 },
    { id: 'current', name: 'Jij', points: points, level: level, rank: 5 }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg text-center">
          <Star className="w-8 h-8 text-secondary mx-auto mb-2" />
          <p className="text-2xl font-bold text-secondary">{points}</p>
          <p className="text-sm text-gray-600">Totaal Punten</p>
        </div>
        
        <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg text-center">
          <Award className="w-8 h-8 text-secondary mx-auto mb-2" />
          <p className="text-2xl font-bold text-secondary">{badges?.length || 0}</p>
          <p className="text-sm text-gray-600">Badges</p>
        </div>
        
        <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg text-center">
          <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2" />
          <p className="text-2xl font-bold text-secondary">{streak}</p>
          <p className="text-sm text-gray-600">Dag Streak</p>
        </div>
        
        <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg text-center">
          <Users className="w-8 h-8 text-secondary mx-auto mb-2" />
          <p className="text-2xl font-bold text-secondary">#{5}</p>
          <p className="text-sm text-gray-600">Ranking</p>
        </div>
      </div>

      {/* Daily Challenges */}
      <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-secondary mb-6">Dagelijkse Challenges</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockChallenges.map((challenge) => (
            <DailyChallengeCard
              key={challenge.id}
              challenge={challenge}
              onComplete={completeChallenge}
            />
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-secondary mb-6">Achievements</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              isUnlocked={!!achievement.unlockedAt}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <LeaderboardCard
          entries={mockLeaderboard}
          currentUserId="current"
          title="Top Style Experts"
        />

        {/* Referral Widget */}
        <ReferralWidget
          referralCode="FITFI2024"
          referralCount={2}
          referralReward={5}
        />
      </div>
    </div>
  );
};

export default GamificationDashboard;