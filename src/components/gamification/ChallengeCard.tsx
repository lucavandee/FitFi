import React, { useState } from 'react';
import { CheckCircle, Clock, Star, Zap, Target, Crown } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import Button from '../ui/Button';
import { trackEvent } from '../../utils/analytics';

interface Challenge {
  id: string;
  type: 'daily' | 'weekly' | 'special';
  label: string;
  points: number;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  description?: string;
  progress?: number;
  maxProgress?: number;
  timeLeft?: string;
  completed?: boolean;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete?: (challengeId: string) => void;
  className?: string;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onComplete,
  className = ''
}) => {
  const { completeChallenge, completeWeeklyChallenge, awardPoints } = useGamification();
  const [isCompleting, setIsCompleting] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'hard':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'legendary':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Target className="w-3 h-3" />;
      case 'medium':
        return <Star className="w-3 h-3" />;
      case 'hard':
        return <Zap className="w-3 h-3" />;
      case 'legendary':
        return <Crown className="w-3 h-3" />;
      default:
        return <Target className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'weekly':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'special':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleComplete = async () => {
    if (challenge.completed || isCompleting) return;

    setIsCompleting(true);
    
    try {
      // Track challenge attempt
      trackEvent('challenge_attempted', 'gamification', challenge.id, 1, {
        challenge_type: challenge.type,
        difficulty: challenge.difficulty,
        points_reward: challenge.points
      });

      if (challenge.type === 'weekly') {
        await completeWeeklyChallenge(challenge.id);
      } else {
        await completeChallenge(challenge.id);
      }
      
      if (onComplete) {
        onComplete(challenge.id);
      }
    } catch (error) {
      console.error('Challenge completion error:', error);
      toast.error('Challenge kon niet worden voltooid');
    } finally {
      setIsCompleting(false);
    }
  };

  const progressPercentage = challenge.maxProgress 
    ? Math.round(((challenge.progress || 0) / challenge.maxProgress) * 100)
    : 0;

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-md hover:transform hover:-translate-y-1 animate-fade-in ${
        challenge.completed ? 'opacity-75' : ''
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{challenge.icon}</div>
          <div>
            <h3 className="font-medium text-gray-900">{challenge.label}</h3>
            {challenge.description && (
              <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
            )}
          </div>
        </div>
        
        {challenge.completed && (
          <div className="flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex items-center space-x-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(challenge.type)}`}>
          {challenge.type === 'daily' ? 'Dagelijks' : challenge.type === 'weekly' ? 'Wekelijks' : 'Speciaal'}
        </span>
        
        <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getDifficultyColor(challenge.difficulty)}`}>
          {getDifficultyIcon(challenge.difficulty)}
          <span className="capitalize">{challenge.difficulty}</span>
        </span>
        
        <span className="px-2 py-1 bg-[#89CFF0]/10 text-[#89CFF0] rounded-full text-xs font-medium">
          +{challenge.points} punten
        </span>
      </div>

      {/* Progress Bar (if applicable) */}
      {challenge.maxProgress && challenge.maxProgress > 1 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Voortgang</span>
            <span className="font-medium text-gray-900">
              {challenge.progress || 0}/{challenge.maxProgress}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#89CFF0] to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Time Left */}
      {challenge.timeLeft && !challenge.completed && (
        <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{challenge.timeLeft}</span>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-4">
        {challenge.completed ? (
          <div className="flex items-center justify-center space-x-2 py-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Voltooid!</span>
          </div>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={isCompleting}
            variant="primary"
            size="sm"
            fullWidth
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
          >
            {isCompleting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-[#0D1B2A] border-t-transparent rounded-full animate-spin"></div>
                <span>Voltooien...</span>
              </div>
            ) : (
              `Verdien ${challenge.points} punten`
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;