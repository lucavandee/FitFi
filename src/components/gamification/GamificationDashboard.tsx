import React from 'react';
import { Trophy, Star, Target, Users, Award, Zap, Crown, TrendingUp } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { useUser } from '@/context/UserContext';
import LoadingFallback from '@/components/ui/LoadingFallback';

interface LevelProgressProps {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ 
  currentLevel, 
  currentXP, 
  nextLevelXP, 
  totalXP 
}) => {
  const progressPercentage = Math.min(100, (currentXP / nextLevelXP) * 100);
  
  return (
    <div className="bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-3xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Level {currentLevel}</h2>
          <p className="text-blue-100">Style Master</p>
        </div>
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <Crown className="w-8 h-8" />
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>{currentXP.toLocaleString('nl-NL')} XP</span>
          <span>{nextLevelXP.toLocaleString('nl-NL')} XP</span>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      <div className="text-sm text-blue-100">
        Totaal verdiend: {totalXP.toLocaleString('nl-NL')} XP
      </div>
    </div>
  );
};

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  unlocked_at?: string;
  progress?: number;
  target?: number;
}

interface AchievementCardProps {
  achievement: Achievement;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const isUnlocked = !!achievement.unlocked_at;
  const progress = achievement.progress || 0;
  const target = achievement.target || 1;
  const progressPercentage = Math.min(100, (progress / target) * 100);
  
  return (
    <div className={`p-4 rounded-2xl border transition-all duration-200 ${
      isUnlocked 
        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isUnlocked ? 'bg-yellow-100' : 'bg-gray-200'
        }`}>
          {isUnlocked ? (
            <Award className="w-5 h-5 text-yellow-600" />
          ) : (
            <Target className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div className={`text-xs px-2 py-1 rounded-full ${
          isUnlocked ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-600'
        }`}>
          +{achievement.xp_reward} XP
        </div>
      </div>
      
      <h4 className={`font-medium mb-1 ${
        isUnlocked ? 'text-gray-900' : 'text-gray-600'
      }`}>
        {achievement.name}
      </h4>
      
      <p className={`text-sm mb-3 ${
        isUnlocked ? 'text-gray-700' : 'text-gray-500'
      }`}>
        {achievement.description}
      </p>
      
      {!isUnlocked && target > 1 && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{progress}/{target}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#89CFF0] rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}
      
      {isUnlocked && (
        <div className="text-xs text-yellow-700 font-medium">
          Behaald op {new Date(achievement.unlocked_at!).toLocaleDateString('nl-NL')}
        </div>
      )}
    </div>
  );
};

interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_xp: number;
  level: number;
  rank: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, currentUserId }) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Award className="w-5 h-5 text-gray-400" />;
      case 3: return <Star className="w-5 h-5 text-orange-500" />;
      default: return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-gray-900">Leaderboard</h3>
        <TrendingUp className="w-5 h-5 text-[#89CFF0]" />
      </div>
      
      <div className="space-y-3">
        {entries.map((entry) => {
          const isCurrentUser = entry.user_id === currentUserId;
          
          return (
            <div 
              key={entry.user_id}
              className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-200 ${
                isCurrentUser 
                  ? 'bg-gradient-to-r from-[#89CFF0]/10 to-blue-50 border border-[#89CFF0]/20' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                
                <div>
                  <div className={`font-medium ${
                    isCurrentUser ? 'text-[#0D1B2A]' : 'text-gray-900'
                  }`}>
                    {entry.username}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs bg-[#89CFF0] text-white px-2 py-1 rounded-full">
                        Jij
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Level {entry.level}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {entry.total_xp.toLocaleString('nl-NL')}
                </div>
                <div className="text-xs text-gray-500">XP</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GamificationDashboard: React.FC = () => {
  const { user } = useUser();
  const { 
    userStats, 
    achievements, 
    leaderboard, 
    isLoading, 
    error 
  } = useGamification();

  if (isLoading) {
    return <LoadingFallback message="Dashboard laden..." />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Kon gamification data niet laden
        </h3>
        <p className="text-gray-600 mb-4">
          Er ging iets mis bij het ophalen van je levels en achievements.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#89CFF0] text-white px-6 py-2 rounded-full hover:bg-[#89CFF0]/90 transition-colors"
        >
          Probeer opnieuw
        </button>
      </div>
    );
  }

  // Mock data fallback
  const mockUserStats = {
    level: 3,
    total_xp: 1250,
    current_level_xp: 250,
    next_level_xp: 500,
    achievements_unlocked: 5,
    challenges_completed: 8,
    outfits_created: 12,
    streak_days: 7
  };

  const mockAchievements: Achievement[] = [
    {
      id: '1',
      name: 'Eerste Outfit',
      description: 'Maak je eerste outfit met Nova',
      icon: 'star',
      xp_reward: 100,
      unlocked_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Quiz Master',
      description: 'Voltooi de stijlquiz',
      icon: 'target',
      xp_reward: 150,
      unlocked_at: '2024-01-16T14:30:00Z'
    },
    {
      id: '3',
      name: 'Streak Starter',
      description: 'Log 7 dagen achter elkaar in',
      icon: 'zap',
      xp_reward: 200,
      progress: 7,
      target: 7,
      unlocked_at: '2024-01-22T09:15:00Z'
    },
    {
      id: '4',
      name: 'Social Butterfly',
      description: 'Deel 3 outfits op social media',
      icon: 'users',
      xp_reward: 250,
      progress: 1,
      target: 3
    },
    {
      id: '5',
      name: 'Style Explorer',
      description: 'Probeer 5 verschillende stijlen',
      icon: 'compass',
      xp_reward: 300,
      progress: 2,
      target: 5
    }
  ];

  const mockLeaderboard: LeaderboardEntry[] = [
    { user_id: '1', username: 'StyleQueen', total_xp: 2850, level: 5, rank: 1 },
    { user_id: '2', username: 'FashionGuru', total_xp: 2340, level: 4, rank: 2 },
    { user_id: user?.id || '3', username: user?.email?.split('@')[0] || 'Jij', total_xp: 1250, level: 3, rank: 3 },
    { user_id: '4', username: 'TrendSetter', total_xp: 980, level: 2, rank: 4 },
    { user_id: '5', username: 'StyleNinja', total_xp: 750, level: 2, rank: 5 }
  ];

  const stats = userStats || mockUserStats;
  const achievementsList = achievements || mockAchievements;
  const leaderboardData = leaderboard || mockLeaderboard;

  const unlockedAchievements = achievementsList.filter(a => a.unlocked_at);
  const lockedAchievements = achievementsList.filter(a => !a.unlocked_at);

  return (
    <div className="space-y-8">
      {/* Level Progress */}
      <LevelProgress
        currentLevel={stats.level}
        currentXP={stats.current_level_xp}
        nextLevelXP={stats.next_level_xp}
        totalXP={stats.total_xp}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.achievements_unlocked}</div>
          <div className="text-sm text-gray-600">Achievements</div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.challenges_completed}</div>
          <div className="text-sm text-gray-600">Challenges</div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.outfits_created}</div>
          <div className="text-sm text-gray-600">Outfits</div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.streak_days}</div>
          <div className="text-sm text-gray-600">Dag streak</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Achievements */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-gray-900">Achievements</h3>
              <div className="text-sm text-gray-500">
                {unlockedAchievements.length}/{achievementsList.length} behaald
              </div>
            </div>
            
            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                  Behaald
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {unlockedAchievements.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-gray-400" />
                  In progress
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lockedAchievements.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-1">
          <Leaderboard entries={leaderboardData} currentUserId={user?.id} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <h3 className="text-xl font-medium text-gray-900 mb-4">Verdien meer XP</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 rounded-2xl border border-gray-200 hover:border-[#89CFF0] hover:bg-[#89CFF0]/5 transition-all duration-200 text-left group">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#89CFF0] group-hover:text-white transition-colors">
              <Star className="w-5 h-5 text-blue-600 group-hover:text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Maak een outfit</h4>
            <p className="text-sm text-gray-600">+50 XP per outfit</p>
          </button>
          
          <button className="p-4 rounded-2xl border border-gray-200 hover:border-[#89CFF0] hover:bg-[#89CFF0]/5 transition-all duration-200 text-left group">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#89CFF0] group-hover:text-white transition-colors">
              <Users className="w-5 h-5 text-green-600 group-hover:text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Join een tribe</h4>
            <p className="text-sm text-gray-600">+100 XP bij deelname</p>
          </button>
          
          <button className="p-4 rounded-2xl border border-gray-200 hover:border-[#89CFF0] hover:bg-[#89CFF0]/5 transition-all duration-200 text-left group">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#89CFF0] group-hover:text-white transition-colors">
              <Target className="w-5 h-5 text-purple-600 group-hover:text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Doe een challenge</h4>
            <p className="text-sm text-gray-600">+200 XP per challenge</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamificationDashboard;