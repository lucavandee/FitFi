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
    <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-secondary/20">
              <Clock className="text-secondary" size={20} />
            </div>
            <div>
              <h3 className="text-heading">
                Dagelijkse Uitdagingen
              </h3>
              <p className="text-body">
                {completedCount}/{totalChallenges} voltooid vandaag
              </p>
            </div>
          </div>
          
          {isSeasonalEventActive() && (
            <div className="bg-secondary/20 text-secondary px-4 py-2 rounded-full text-sm font-bold flex items-center">
              <Gift size={12} className="mr-1" />
              {multiplier}x Punten!
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-base text-body mb-2">
            <span>Dagelijkse Voortgang</span>
            <span>{Math.round((completedCount / totalChallenges) * 100)}%</span>
          </div>
          <div className="progress-bar-track">
            <div 
              className="progress-bar-fill"
              style={{ width: `${(completedCount / totalChallenges) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        {availableChallenges.length > 0 ? (
          <div className="space-y-8">
            {availableChallenges.slice(0, 3).map((challenge) => (
              <motion.div 
                key={challenge.id}
                className="flex items-center justify-between p-8 bg-white rounded hover:bg-gray-50 transition-colors focus-ring"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{challenge.icon}</div>
                  <div>
                    <h4 className="text-xl font-semibold text-text-dark mb-2">
                      {challenge.label}
                    </h4>
                    <p className="text-base text-body">
                      +{Math.round(challenge.points * multiplier)} punten
                      {multiplier > 1 && (
                        <span className="text-secondary font-bold ml-1">
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
                  className="btn-ghost"
                >
                  Bekijk Alle Uitdagingen ({availableChallenges.length})
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-text-dark mb-6" size={48} />
            <h4 className="text-2xl font-semibold text-text-dark mb-4">
              Alle Uitdagingen Voltooid! 🎉
            </h4>
            <p className="text-base text-body mb-4">
              Goed gedaan! Kom morgen terug voor nieuwe uitdagingen.
            </p>
            <div className="bg-secondary/10 border border-secondary rounded p-8">
              <p className="font-medium text-text-dark">Dagelijkse Bonus Verdiend!</p>
              <p className="text-base text-body">+{Math.round(50 * multiplier)} voltooiingsbonus punten</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DailyChallengeCard;