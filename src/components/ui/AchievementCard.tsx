import React from 'react';
import { Award, Lock } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import gamificationConfig from '../../config/gamification.json';

const AchievementCard: React.FC = () => {
  const { earnedBadges, badges: earnedBadgeIds } = useGamification();

  const allBadges = gamificationConfig.badges;
  const lockedBadges = allBadges.filter(badge => !earnedBadgeIds.includes(badge.id));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
            <Award className="text-yellow-600 dark:text-yellow-400" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Mijn Prestaties
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {earnedBadges.length}/{allBadges.length} badges verdiend
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Prestatie Voortgang</span>
            <span>{Math.round((earnedBadges.length / allBadges.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(earnedBadges.length / allBadges.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {earnedBadges.length > 0 ? (
          <div className="space-y-6">
            {/* Earned badges */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                Verdiende Badges ({earnedBadges.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {earnedBadges.map((badge) => (
                  <div 
                    key={badge.id}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 text-center hover:scale-105 transition-transform"
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {badge.label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {badge.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Locked badges preview */}
            {lockedBadges.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Lock className="text-gray-400 mr-2" size={16} />
                  Binnenkort Beschikbaar ({lockedBadges.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {lockedBadges.slice(0, 6).map((badge) => (
                    <div 
                      key={badge.id}
                      className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center opacity-60 hover:opacity-80 transition-opacity"
                    >
                      <div className="text-2xl mb-1 grayscale">{badge.icon}</div>
                      <div className="font-medium text-gray-600 dark:text-gray-400 text-sm">
                        {badge.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {badge.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="mx-auto text-gray-400 mb-3" size={48} />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Begin Je Reis! 🚀
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Voltooi acties om je eerste badge te verdienen.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {allBadges.slice(0, 4).map((badge) => (
                <div 
                  key={badge.id}
                  className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center opacity-60"
                >
                  <div className="text-xl mb-1 grayscale">{badge.icon}</div>
                  <div className="font-medium text-gray-600 dark:text-gray-400 text-xs">
                    {badge.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementCard;