import React from 'react';
import { Clock, CheckCircle, Gift } from 'lucide-react';
import Button from './Button';
import { useGamification } from '../../context/GamificationContext';
import { motion } from 'framer-motion';

const DailyChallengeCard: React.FC = () => {
  const { 
    availableChallenges, 
    dailyChallengeStatus, 
    completeChallenge,
    getSeasonalMultiplier,
    isSeasonalEventActive
  } = useGamification();

  const completedCount = Object.values(dailyChallengeStatus).filter(Boolean).length;
  const totalChallenges = Object.keys(dailyChallengeStatus).length;
  const multiplier = getSeasonalMultiplier();

  const handleCompleteChallenge = async (challengeId: string) => {
    await completeChallenge(challengeId);
    
    // Track challenge completion
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'challenge_complete', {
        event_category: 'gamification',
        event_label: challengeId,
        value: 1
      });
    }
  };

  return (
    <motion.div 
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-[#0ea5e9]/20">
              <Clock className="text-[#0ea5e9]" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Dagelijkse Uitdagingen
              </h3>
              <p className="text-sm text-white/70">
                {completedCount}/{totalChallenges} voltooid vandaag
              </p>
            </div>
          </div>
          
          {isSeasonalEventActive() && (
            <div className="bg-[#FF8600]/20 text-[#FF8600] px-3 py-1 rounded-full text-xs font-bold flex items-center">
              <Gift size={12} className="mr-1" />
              {multiplier}x Punten!
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-white/70 mb-1">
            <span>Dagelijkse Voortgang</span>
            <span>{Math.round((completedCount / totalChallenges) * 100)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div 
              className="bg-[#0ea5e9] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalChallenges) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {availableChallenges.length > 0 ? (
          <div className="space-y-4">
            {availableChallenges.slice(0, 3).map((challenge) => (
              <motion.div 
                key={challenge.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{challenge.icon}</div>
                  <div>
                    <h4 className="font-medium text-white">
                      {challenge.label}
                    </h4>
                    <p className="text-sm text-white/70">
                      +{Math.round(challenge.points * multiplier)} punten
                      {multiplier > 1 && (
                        <span className="text-[#FF8600] font-bold ml-1">
                          ({multiplier}x bonus!)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCompleteChallenge(challenge.id)}
                >
                  Start
                </Button>
              </motion.div>
            ))}
            
            {availableChallenges.length > 3 && (
              <div className="text-center pt-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  className="text-white border border-white/20 hover:bg-white/10"
                >
                  Bekijk Alle Uitdagingen ({availableChallenges.length})
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-[#0ea5e9] mb-3" size={48} />
            <h4 className="text-lg font-semibold text-white mb-2">
              Alle Uitdagingen Voltooid! 🎉
            </h4>
            <p className="text-white/70 mb-4">
              Goed gedaan! Kom morgen terug voor nieuwe uitdagingen.
            </p>
            <div className="bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 rounded-lg p-3">
              <p className="font-medium text-white">Dagelijkse Bonus Verdiend!</p>
              <p className="text-sm text-white/70">+{Math.round(50 * multiplier)} voltooiingsbonus punten</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DailyChallengeCard;