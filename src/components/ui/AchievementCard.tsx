import React from 'react';
import { Award, Lock } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import gamificationConfig from '../../config/gamification.json';
import { motion } from 'framer-motion';

const AchievementCard: React.FC = () => {
  const { earnedBadges, badges: earnedBadgeIds } = useGamification();

  const allBadges = gamificationConfig.badges;
  const lockedBadges = allBadges.filter(badge => !earnedBadgeIds.includes(badge.id));

  return (
    <motion.div 
      className="bg-white dark:bg-midnight-800 rounded-xl shadow-md overflow-hidden transition-colors"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6 border-b border-lightGrey-200 dark:border-midnight-600">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-turquoise-100 dark:bg-turquoise-900/20">
            <Award className="text-turquoise-600 dark:text-turquoise-400" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-textPrimary-light dark:text-textPrimary-dark">
              Mijn Prestaties
            </h3>
            <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
              {earnedBadges.length}/{allBadges.length} badges verdiend
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-textSecondary-light dark:text-textSecondary-dark mb-1">
            <span>Prestatie Voortgang</span>
            <span>{Math.round((earnedBadges.length / allBadges.length) * 100)}%</span>
          </div>
          <div className="w-full bg-lightGrey-200 dark:bg-midnight-700 rounded-full h-1.5">
            <div 
              className="bg-turquoise-500 h-1.5 rounded-full transition-all duration-300"
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
              <h4 className="font-semibold text-textPrimary-light dark:text-textPrimary-dark mb-3 flex items-center">
                <span className="text-turquoise-500 mr-2">✅</span>
                Verdiende Badges ({earnedBadges.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {earnedBadges.map((badge) => (
                  <motion.div 
                    key={badge.id}
                    className="bg-gradient-to-br from-turquoise-50 to-turquoise-100 dark:from-turquoise-900/10 dark:to-turquoise-800/10 p-3 rounded-lg border border-lightGrey-200 dark:border-midnight-600 text-center hover:border-turquoise-300 dark:hover:border-turquoise-600 transition-all"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div className="font-medium text-textPrimary-light dark:text-textPrimary-dark text-sm">
                      {badge.label}
                    </div>
                    <div className="text-xs text-textSecondary-light dark:text-textSecondary-dark mt-1">
                      {badge.description}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Locked badges preview */}
            {lockedBadges.length > 0 && (
              <div>
                <h4 className="font-semibold text-textPrimary-light dark:text-textPrimary-dark mb-3 flex items-center">
                  <Lock className="text-textSecondary-light dark:text-textSecondary-dark mr-2" size={16} />
                  Binnenkort Beschikbaar ({lockedBadges.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {lockedBadges.slice(0, 6).map((badge) => (
                    <div 
                      key={badge.id}
                      className="bg-lightGrey-50 dark:bg-midnight-700 p-3 rounded-lg text-center opacity-60 hover:opacity-80 transition-opacity"
                    >
                      <div className="text-2xl mb-1 grayscale">{badge.icon}</div>
                      <div className="font-medium text-textSecondary-light dark:text-textSecondary-dark text-sm">
                        {badge.label}
                      </div>
                      <div className="text-xs text-textSecondary-light dark:text-textSecondary-dark mt-1">
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
            <Award className="mx-auto text-textSecondary-light dark:text-textSecondary-dark mb-3" size={48} />
            <h4 className="text-lg font-semibold text-textPrimary-light dark:text-textPrimary-dark mb-2">
              Begin Je Reis! 🚀
            </h4>
            <p className="text-textSecondary-light dark:text-textSecondary-dark mb-4">
              Voltooi acties om je eerste badge te verdienen.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {allBadges.slice(0, 4).map((badge) => (
                <div 
                  key={badge.id}
                  className="bg-lightGrey-50 dark:bg-midnight-700 p-3 rounded-lg text-center opacity-60"
                >
                  <div className="text-xl mb-1 grayscale">{badge.icon}</div>
                  <div className="font-medium text-textSecondary-light dark:text-textSecondary-dark text-xs">
                    {badge.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AchievementCard;