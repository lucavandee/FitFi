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
      className="bg-white dark:bg-midnight-800 rounded-xl shadow-md overflow-hidden transition-colors"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="p-6 border-b border-lightGrey-200 dark:border-midnight-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-turquoise-100 dark:bg-turquoise-900/20">
              <Clock className="text-turquoise-600 dark:text-turquoise-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-textPrimary-light dark:text-textPrimary-dark">
                Dagelijkse Uitdagingen
              </h3>
              <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
                {completedCount}/{totalChallenges} voltooid vandaag
              </p>
            </div>
          </div>
          
          {isSeasonalEventActive() && (
            <div className="bg-turquoise-100 dark:bg-turquoise-900/20 text-turquoise-600 dark:text-turquoise-400 px-3 py-1 rounded-full text-xs font-bold flex items-center">
              <Gift size={12} className="mr-1" />
              {multiplier}x Punten!
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-textSecondary-light dark:text-textSecondary-dark mb-1">
            <span>Dagelijkse Voortgang</span>
            <span>{Math.round((completedCount / totalChallenges) * 100)}%</span>
          </div>
          <div className="w-full bg-lightGrey-200 dark:bg-midnight-700 rounded-full h-1.5">
            <div 
              className="bg-turquoise-500 h-1.5 rounded-full transition-all duration-300"
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
                className="flex items-center justify-between p-4 bg-lightGrey-50 dark:bg-midnight-700 rounded-xl hover:bg-lightGrey-100 dark:hover:bg-midnight-600 transition-colors"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{challenge.icon}</div>
                  <div>
                    <h4 className="font-medium text-textPrimary-light dark:text-textPrimary-dark">
                      {challenge.label}
                    </h4>
                    <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
                      +{Math.round(challenge.points * multiplier)} punten
                      {multiplier > 1 && (
                        <span className="text-turquoise-500 font-bold ml-1">
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
            <CheckCircle className="mx-auto text-turquoise-500 mb-3" size={48} />
            <h4 className="text-lg font-semibold text-textPrimary-light dark:text-textPrimary-dark mb-2">
              Alle Uitdagingen Voltooid! 🎉
            </h4>
            <p className="text-textSecondary-light dark:text-textSecondary-dark mb-4">
              Goed gedaan! Kom morgen terug voor nieuwe uitdagingen.
            </p>
            <div className="bg-turquoise-50 dark:bg-turquoise-900/10 border border-turquoise-200 dark:border-turquoise-800 rounded-lg p-3">
              <p className="font-medium text-textPrimary-light dark:text-textPrimary-dark">Dagelijkse Bonus Verdiend!</p>
              <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark">+{Math.round(50 * multiplier)} voltooiingsbonus punten</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DailyChallengeCard;