import React from 'react';
import { Clock, CheckCircle, Gift } from 'lucide-react';
import Button from './Button';
import { useGamification } from '../../context/GamificationContext';

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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Clock className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Dagelijkse Uitdagingen
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {completedCount}/{totalChallenges} voltooid vandaag
              </p>
            </div>
          </div>
          
          {isSeasonalEventActive() && (
            <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-bold flex items-center">
              <Gift size={12} className="mr-1" />
              {multiplier}x Punten!
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Dagelijkse Voortgang</span>
            <span>{Math.round((completedCount / totalChallenges) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalChallenges) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {availableChallenges.length > 0 ? (
          <div className="space-y-4">
            {availableChallenges.slice(0, 3).map((challenge) => (
              <div 
                key={challenge.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{challenge.icon}</div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {challenge.label}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      +{Math.round(challenge.points * multiplier)} punten
                      {multiplier > 1 && (
                        <span className="text-purple-600 dark:text-purple-400 font-bold ml-1">
                          ({multiplier}x bonus!)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleCompleteChallenge(challenge.id)}
                  className="whitespace-nowrap"
                >
                  Start Uitdaging
                </Button>
              </div>
            ))}
            
            {availableChallenges.length > 3 && (
              <div className="text-center pt-2">
                <Button variant="outline" size="sm">
                  Bekijk Alle Uitdagingen ({availableChallenges.length})
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Alle Uitdagingen Voltooid! 🎉
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Goed gedaan! Kom morgen terug voor nieuwe uitdagingen.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-3 rounded-lg">
              <p className="font-medium">Dagelijkse Bonus Verdiend!</p>
              <p className="text-sm">+{Math.round(50 * multiplier)} voltooiingsbonus punten</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallengeCard;