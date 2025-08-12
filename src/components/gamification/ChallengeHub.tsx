import React, { useState, useEffect } from 'react';
import { Trophy, Target, Clock, Users, Star, Filter, Plus } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import { useUser } from '../../context/UserContext';
import { track } from '../../utils/analytics';
import Button from '../ui/Button';
import LoadingFallback from '../ui/LoadingFallback';

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

interface ChallengeHubProps {
  className?: string;
}

const ChallengeHub: React.FC<ChallengeHubProps> = ({ className = '' }) => {
  const { user } = useUser();
  const { completeChallenge, isLoading } = useGamification();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'special'>('all');
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, [user?.id]);

  const loadChallenges = async () => {
    setIsLoadingChallenges(true);
    
    try {
      // Mock challenges for demonstration
      const mockChallenges: Challenge[] = [
        {
          id: 'daily_outfit_view',
          title: 'Bekijk 3 outfit aanbevelingen',
          description: 'Ontdek nieuwe stijlinspiratie door verschillende outfits te bekijken',
          type: 'daily',
          points: 20,
          icon: '👀',
          difficulty: 'easy',
          completed: false,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          progress: 1,
          maxProgress: 3
        },
        {
          id: 'weekly_style_share',
          title: 'Deel je favoriete outfit',
          description: 'Inspireer anderen door je stijl te delen op social media',
          type: 'weekly',
          points: 75,
          icon: '📱',
          difficulty: 'medium',
          completed: false,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'special_quiz_master',
          title: 'Quiz Perfectionist',
          description: 'Voltooi de stijlquiz met 100% nauwkeurigheid',
          type: 'special',
          points: 150,
          icon: '🎯',
          difficulty: 'hard',
          completed: true
        }
      ];
      
      setChallenges(mockChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setIsLoadingChallenges(false);
    }
  };

  const handleChallengeComplete = async (challengeId: string) => {
    try {
      await completeChallenge(challengeId);
      
      // Update local state
      setChallenges(prev => 
        prev.map(challenge => 
          challenge.id === challengeId 
            ? { ...challenge, completed: true }
            : challenge
        )
      );
      
      // Track challenge completion
      track('challenge_completed', {
        event_category: 'gamification',
        event_label: challengeId,
        value: challenges.find(c => c.id === challengeId)?.points || 0
      });
      
    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };

  const filteredChallenges = challenges.filter(challenge => 
    filter === 'all' || challenge.type === filter
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'text-blue-600 bg-blue-50';
      case 'weekly': return 'text-purple-600 bg-purple-50';
      case 'special': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading || isLoadingChallenges) {
    return <LoadingFallback message="Challenges laden..." />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Challenge Hub</h2>
          <p className="text-gray-600">Verdien punten door challenges te voltooien</p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          icon={<Plus size={16} />}
          iconPosition="left"
          className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
        >
          Suggereer Challenge
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'all', label: 'Alle', icon: <Target className="w-4 h-4" /> },
          { id: 'daily', label: 'Dagelijks', icon: <Clock className="w-4 h-4" /> },
          { id: 'weekly', label: 'Wekelijks', icon: <Trophy className="w-4 h-4" /> },
          { id: 'special', label: 'Speciaal', icon: <Star className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-all duration-200 ${
              filter === tab.id
                ? 'bg-white text-[#89CFF0] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredChallenges.map((challenge, index) => (
          <div
            key={challenge.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Challenge Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{challenge.icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900">{challenge.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(challenge.type)}`}>
                      {challenge.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
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
              onClick={() => handleChallengeComplete(challenge.id)}
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
        ))}
      </div>

      {/* Empty State */}
      {filteredChallenges.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Geen {filter === 'all' ? '' : filter} challenges beschikbaar
          </h3>
          <p className="text-gray-600 mb-6">
            Kom later terug voor nieuwe uitdagingen!
          </p>
          <Button
            variant="outline"
            onClick={() => setFilter('all')}
            className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
          >
            Bekijk alle challenges
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChallengeHub;