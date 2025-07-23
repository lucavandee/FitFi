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
    <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-full bg-secondary/20">
            <Award className="text-secondary" size={20} />
          </div>
          <div>
            <h3 className="text-heading">
              Mijn Prestaties
            </h3>
            <p className="text-body mb-4">
              {earnedBadges.length}/{allBadges.length} badges verdiend
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-base text-body mb-2">
            <span>Prestatie Voortgang</span>
            <span>{Math.round((earnedBadges.length / allBadges.length) * 100)}%</span>
          </div>
          <div className="progress-bar-track">
            <div 
              className="progress-bar-fill"
              style={{ width: `${(earnedBadges.length / allBadges.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        {earnedBadges.length > 0 ? (
          <div className="space-y-8">
            {/* Earned badges */}
            <div>
              <h4 className="text-xl font-semibold text-text-dark mb-4 flex items-center">
                <span className="text-secondary mr-2">✅</span>
                Verdiende Badges ({earnedBadges.length})
              </h4>
              <div className="grid-layout">
                {earnedBadges.map((badge) => (
                  <motion.div 
                    key={badge.id}
                    className="bg-secondary/10 p-8 rounded border border-gray-200 text-center hover:border-secondary transition-all focus-ring"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <div className="font-medium text-text-dark text-sm">
                      {badge.label}
                    </div>
                    <div className="text-base text-body mt-1">
                      {badge.description}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Locked badges preview */}
            {lockedBadges.length > 0 && (
              <div>
                <h4 className="text-xl font-semibold text-text-dark mb-4 flex items-center">
                  <Lock className="text-body mr-2" size={16} />
                  Binnenkort Beschikbaar ({lockedBadges.length})
                </h4>
                <div className="grid-layout">
                  {lockedBadges.slice(0, 6).map((badge) => (
                    <div 
                      key={badge.id}
                      className="bg-gray-100 p-6 rounded text-center opacity-60 hover:opacity-80 transition-opacity focus-ring"
                    >
                      <div className="text-3xl mb-2 grayscale">{badge.icon}</div>
                      <div className="font-medium text-body text-sm">
                        {badge.label}
                      </div>
                      <div className="text-base text-body mt-1">
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
            <Award className="mx-auto text-text-dark mb-6" size={48} />
            <h4 className="text-2xl font-semibold text-text-dark mb-4">
              Begin Je Reis! 🚀
            </h4>
            <p className="text-base text-body mb-4">
              Voltooi acties om je eerste badge te verdienen.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {allBadges.slice(0, 4).map((badge) => (
                <div 
                  key={badge.id}
                  className="bg-gray-100 p-6 rounded text-center opacity-60"
                >
                  <div className="text-2xl mb-2 grayscale">{badge.icon}</div>
                  <div className="font-medium text-body text-xs">
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