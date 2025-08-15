import React from 'react';
import { Trophy, Clock, Star, Target } from 'lucide-react';
import { track } from '../../utils/analytics';
import Button from '../ui/Button';
import { useAddXp } from '@/hooks/useDashboard';
import { useUser } from '@/context/UserContext';
import toast from 'react-hot-toast';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  points: number;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  deadline?: string;
  progress?: number;
  maxProgress?: number;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete: (challengeId: string) => void;
  className?: string;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onComplete,
  className = ''
}) => {
  const { user } = useUser();
  const addXp = useAddXp();
  
  const handleComplete = () => {
    // Track challenge attempt
    track('challenge_attempted', {
      event_category: 'gamification',
      event_label: challenge.id,
      challenge_type: challenge.type,
      challenge_difficulty: challenge.difficulty,
      challenge_points: challenge.points
    });
    
    // Award XP and complete challenge
    handleChallengeCompletion();
  };
  
  const handleChallengeCompletion = async () => {
    if (!user?.id) return;
    
    try {
      // Award XP for challenge completion
      await addXp.mutateAsync({ 
        userId: user.id, 
        amount: challenge.points || 25, 
        reason: 'challenge_complete' 
      });
      
      // Call original completion handler
      onComplete(challenge.id);
      
      toast.custom((
        <div className="bg-white rounded-xl shadow-lg p-4 flex items-center space-x-3">
          <div className="text-yellow-600">🏆</div>
          <span>Challenge voltooid!</span>
          <ToastXp amount={challenge.points || 25} />
        </div>
      ), {
        duration: 4000
      });
    } catch (error) {
      console.error('Challenge completion XP award failed:', error);
      // Still complete the challenge even if XP fails
      onComplete(challenge.id);
      toast.success('Challenge voltooid!');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'weekly': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'special': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${className}`}>
      {/* Challenge Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{challenge.icon}</div>
          <div>
            <h3 className="font-medium text-gray-900 leading-tight">{challenge.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(challenge.type)}`}>
                {challenge.type}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-[#89CFF0]">+{challenge.points}</div>
          <div className="text-xs text-gray-500">punten</div>
        </div>
      </div>

      {/* Challenge Description */}
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        {challenge.description}
      </p>

      {/* Progress Bar (if applicable) */}
      {challenge.progress !== undefined && challenge.maxProgress && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Voortgang</span>
            <span className="font-medium">{challenge.progress}/{challenge.maxProgress}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#89CFF0] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Deadline */}
      {challenge.deadline && !challenge.completed && (
        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
          <Clock size={12} />
          <span>
            Eindigt: {new Date(challenge.deadline).toLocaleDateString('nl-NL', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      )}

      {/* Action Button */}
      <Button
        variant={challenge.completed ? 'outline' : 'primary'}
        size="sm"
        fullWidth
        disabled={challenge.completed}
        onClick={handleComplete}
        className={challenge.completed 
          ? 'border-green-300 text-green-600 bg-green-50' 
          : 'bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]'
        }
        icon={challenge.completed ? <Star size={16} className="fill-current" /> : <Target size={16} />}
        iconPosition="left"
      >
        {challenge.completed ? 'Voltooid!' : 'Start Challenge'}
      </Button>
    </div>
  );
};

export default ChallengeCard;