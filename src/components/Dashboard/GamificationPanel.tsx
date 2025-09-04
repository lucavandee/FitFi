import { useGamification } from "@/context/GamificationContext";
import { Trophy, Star, Target, Zap } from "lucide-react";

export default function GamificationPanel() {
  const { userStats, currentLevel, nextLevel, badges } = useGamification();

  if (!userStats) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const progressToNext = nextLevel 
    ? ((userStats.xp - currentLevel.min_xp) / (nextLevel.min_xp - currentLevel.min_xp)) * 100
    : 100;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Jouw Voortgang</h3>
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium text-gray-600">Level {currentLevel.id}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">XP Progress</span>
            <span className="font-medium">{userStats.xp} / {nextLevel?.min_xp || userStats.xp}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressToNext, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2">
              <Star className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-semibold text-gray-900">{userStats.posts}</div>
            <div className="text-xs text-gray-500">Posts</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-2">
              <Target className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-lg font-semibold text-gray-900">{userStats.wins}</div>
            <div className="text-xs text-gray-500">Wins</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mx-auto mb-2">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg font-semibold text-gray-900">{badges.length}</div>
            <div className="text-xs text-gray-500">Badges</div>
          </div>
        </div>
      </div>
    </div>
  );
}