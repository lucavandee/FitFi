import React from 'react';
import { CheckCircle, Clock, Gift } from 'lucide-react';
import Button from './Button';

interface DailyChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    points: number;
    completed: boolean;
    icon?: string;
  };
  onComplete?: (challengeId: string) => void;
  className?: string;
}

const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  challenge,
  onComplete,
  className = ''
}) => {
  const handleComplete = () => {
    if (onComplete && !challenge.completed) {
      onComplete(challenge.id);
    }
  };

  return (
    <div className={`bg-accent text-text-dark p-6 rounded-2xl shadow-lg ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            challenge.completed 
              ? 'bg-green-100 text-green-600' 
              : 'bg-secondary/20 text-secondary'
          }`}>
            {challenge.completed ? (
              <CheckCircle size={20} />
            ) : (
              <span className="text-lg">{challenge.icon || '🎯'}</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{challenge.title}</h3>
            <p className="text-sm text-gray-600">{challenge.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 text-secondary">
          <Gift size={16} />
          <span className="font-bold">{challenge.points}</span>
        </div>
      </div>
      
      {challenge.completed ? (
        <div className="flex items-center justify-center py-2 bg-green-50 rounded-lg">
          <CheckCircle size={16} className="text-green-600 mr-2" />
          <span className="text-green-700 font-medium">Voltooid!</span>
        </div>
      ) : (
        <Button
          variant="primary"
          size="sm"
          onClick={handleComplete}
          icon={<Clock size={16} />}
          iconPosition="left"
          className="w-full"
        >
          Voltooien
        </Button>
      )}
    </div>
  );
};

export default DailyChallengeCard;