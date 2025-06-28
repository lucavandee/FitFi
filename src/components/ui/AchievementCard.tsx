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
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-[#FF8600]/20">
            <Award className="text-[#FF8600]" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Mijn Prestaties
            </h3>
            <p className="text-sm text-white/70">
              {earnedBadges.length}/{allBadges.length} badges verdiend
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-white/70 mb-1">
            <span>Prestatie Voortgang</span>
            <span>{Math.round((earnedBadges.length / allBadges.length) * 100)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div 
              className="bg-[#FF8600] h-1.5 rounded-full transition-all duration-300"
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
              <h4 className="font-semibold text-white mb-3 flex items-center">
                <span className="text-[#FF8600] mr-2">✅</span>
                Verdiende Badges ({earnedBadges.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {earnedBadges.map((badge) => (
                  <motion.div 
                    key={badge.id}
                    className="bg-gradient-to-br from-[#FF8600]/10 to-[#0ea5e9]/10 p-3 rounded-lg border border-white/10 text-center hover:border-[#FF8600]/30 transition-all"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div className="font-medium text-white text-sm">
                      {badge.label}
                    </div>
                    <div className="text-xs text-white/70 mt-1">
                      {badge.description}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Locked badges preview */}
            {lockedBadges.length > 0 && (
              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <Lock className="text-white/50 mr-2" size={16} />
                  Binnenkort Beschikbaar ({lockedBadges.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {lockedBadges.slice(0, 6).map((badge) => (
                    <div 
                      key={badge.id}
                      className="bg-white/5 p-3 rounded-lg text-center opacity-60 hover:opacity-80 transition-opacity"
                    >
                      <div className="text-2xl mb-1 grayscale">{badge.icon}</div>
                      <div className="font-medium text-white/60 text-sm">
                        {badge.label}
                      </div>
                      <div className="text-xs text-white/40 mt-1">
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
            <Award className="mx-auto text-white/30 mb-3" size={48} />
            <h4 className="text-lg font-semibold text-white mb-2">
              Begin Je Reis! 🚀
            </h4>
            <p className="text-white/70 mb-4">
              Voltooi acties om je eerste badge te verdienen.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {allBadges.slice(0, 4).map((badge) => (
                <div 
                  key={badge.id}
                  className="bg-white/5 p-3 rounded-lg text-center opacity-60"
                >
                  <div className="text-xl mb-1 grayscale">{badge.icon}</div>
                  <div className="font-medium text-white/60 text-xs">
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