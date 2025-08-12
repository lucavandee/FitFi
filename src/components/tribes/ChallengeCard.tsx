import React, { useState } from 'react';
import { Calendar, Clock, Trophy, Users, Star, Target, Zap, Crown, ExternalLink } from 'lucide-react';
import type { TribeChallenge, TribeChallengeSubmission } from '@/services/data/types';
import { useChallengeSubmissions } from '@/hooks/useTribeChallenges';
import { useUser } from '@/context/UserContext';
import ImageWithFallback from '../ui/ImageWithFallback';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface ChallengeCardProps {
  challenge: TribeChallenge;
  showSubmissions?: boolean;
  onParticipate?: (challengeId: string) => void;
  className?: string;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  showSubmissions = true,
  onParticipate,
  className = ''
}) => {
  const { user } = useUser();
  const { 
    submissions, 
    loading: submissionsLoading, 
    submitEntry 
  } = useChallengeSubmissions(challenge.id, {
    limit: showSubmissions ? 5 : 0
  });
  
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    content: '',
    imageUrl: '',
    linkUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return <Target className="w-4 h-4 text-green-600" />;
      case 'medium':
        return <Star className="w-4 h-4 text-yellow-600" />;
      case 'hard':
        return <Zap className="w-4 h-4 text-orange-600" />;
      default:
        return <Trophy className="w-4 h-4 text-[#89CFF0]" />;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-[#89CFF0]/10 text-[#89CFF0] border-[#89CFF0]/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'archived':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeRemaining = () => {
    if (!challenge.endAt) return null;
    
    const endTime = new Date(challenge.endAt).getTime();
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) return 'Afgelopen';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} dagen`;
    if (hours > 0) return `${hours} uur`;
    return 'Laatste uren';
  };

  const userHasSubmitted = submissions?.some(s => s.userId === user?.id) || false;
  const userSubmission = submissions?.find(s => s.userId === user?.id);
  const timeRemaining = getTimeRemaining();
  const canParticipate = challenge.status === 'open' && !userHasSubmitted && user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !submissionData.content.trim()) {
      toast.error('Vul alle verplichte velden in');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submission = await submitEntry({
        tribeId: challenge.tribeId,
        challengeId: challenge.id,
        userId: user.id,
        userName: user.name || 'Anonymous',
        content: submissionData.content.trim(),
        imageUrl: submissionData.imageUrl.trim() || undefined,
        linkUrl: submissionData.linkUrl.trim() || undefined,
        submissionType: submissionData.imageUrl && submissionData.linkUrl ? 'combo' : 
                       submissionData.imageUrl ? 'image' : 
                       submissionData.linkUrl ? 'link' : 'text'
      });

      if (submission) {
        toast.success('Challenge submission succesvol! 🎉');
        setShowSubmissionForm(false);
        setSubmissionData({ content: '', imageUrl: '', linkUrl: '' });
        
        if (onParticipate) {
          onParticipate(challenge.id);
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Submission mislukt. Probeer opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* Challenge Image */}
      {challenge.image && (
        <div className="aspect-video overflow-hidden">
          <ImageWithFallback
            src={challenge.image}
            alt={challenge.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            componentName="ChallengeCard"
          />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(challenge.status)}`}>
                {challenge.status === 'open' ? 'Actief' : 
                 challenge.status === 'draft' ? 'Concept' : 
                 challenge.status === 'closed' ? 'Gesloten' : 'Gearchiveerd'}
              </span>
              
              {challenge.difficulty && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getDifficultyColor(challenge.difficulty)}`}>
                  {getDifficultyIcon(challenge.difficulty)}
                  <span className="capitalize">{challenge.difficulty}</span>
                </span>
              )}
              
              {timeRemaining && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{timeRemaining}</span>
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {challenge.title}
            </h3>
            
            {challenge.description && (
              <p className="text-gray-600 leading-relaxed mb-4">
                {challenge.description}
              </p>
            )}
          </div>
        </div>

        {/* Rules */}
        {challenge.rules && challenge.rules.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Challenge regels:</h4>
            <ul className="space-y-1">
              {challenge.rules.map((rule, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-[#89CFF0] rounded-full mt-2 flex-shrink-0"></div>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rewards */}
        <div className="flex items-center justify-between mb-4 p-3 bg-[#89CFF0]/10 rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-[#89CFF0]">+{challenge.rewardPoints || 0}</div>
              <div className="text-xs text-gray-600">Deelname</div>
            </div>
            
            {challenge.winnerRewardPoints && (
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">+{challenge.winnerRewardPoints}</div>
                <div className="text-xs text-gray-600">Winnaar</div>
              </div>
            )}
          </div>
          
          <Trophy className="w-6 h-6 text-[#89CFF0]" />
        </div>

        {/* Participation Status */}
        {user && (
          <div className="mb-4">
            {userHasSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Je hebt deelgenomen!</span>
                </div>
                {userSubmission?.score && (
                  <div className="text-sm text-green-700">
                    Score: {userSubmission.score}/100
                    {userSubmission.isWinner && (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        🏆 Winnaar!
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : canParticipate ? (
              <Button
                onClick={() => setShowSubmissionForm(true)}
                variant="primary"
                fullWidth
                className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                icon={<Target size={16} />}
                iconPosition="left"
              >
                Doe mee met challenge
              </Button>
            ) : challenge.status !== 'open' ? (
              <div className="text-center py-3 text-gray-500">
                Challenge is {challenge.status === 'closed' ? 'gesloten' : 'niet actief'}
              </div>
            ) : (
              <div className="text-center py-3">
                <Button
                  as="a"
                  href="/inloggen"
                  variant="outline"
                  className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
                >
                  Inloggen om deel te nemen
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Submission Form */}
        {showSubmissionForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">Jouw submission</h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschrijving *
                </label>
                <textarea
                  value={submissionData.content}
                  onChange={(e) => setSubmissionData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Vertel over je outfit, inspiratie, en hoe je de challenge regels hebt toegepast..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] resize-none"
                  rows={4}
                  maxLength={500}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {submissionData.content.length}/500 karakters
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Afbeelding URL (optioneel)
                </label>
                <input
                  type="url"
                  value={submissionData.imageUrl}
                  onChange={(e) => setSubmissionData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://images.pexels.com/..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link (optioneel)
                </label>
                <input
                  type="url"
                  value={submissionData.linkUrl}
                  onChange={(e) => setSubmissionData(prev => ({ ...prev, linkUrl: e.target.value }))}
                  placeholder="https://www.instagram.com/p/..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0]"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || !submissionData.content.trim()}
                  className="flex-1 bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                >
                  {isSubmitting ? 'Versturen...' : 'Verstuur Submission'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSubmissionForm(false)}
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Annuleren
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Submissions */}
        {showSubmissions && submissions && submissions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Submissions ({submissions.length})</span>
              </h4>
            </div>
            
            <div className="space-y-3">
              {submissions.slice(0, 3).map((submission, index) => (
                <div
                  key={submission.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#89CFF0] flex items-center justify-center text-white font-medium text-sm">
                        {submission.userName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-900">
                          {submission.userName || `User ${submission.userId.slice(-4)}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(submission.createdAt).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {submission.score && (
                        <span className="px-2 py-1 bg-[#89CFF0]/10 text-[#89CFF0] rounded-full text-xs font-medium">
                          {submission.score}/100
                        </span>
                      )}
                      
                      {submission.isWinner && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center space-x-1">
                          <Crown size={12} />
                          <span>Winnaar</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {submission.content}
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    {submission.imageUrl && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <ImageWithFallback
                          src={submission.imageUrl}
                          alt="Submission afbeelding"
                          className="w-full h-full object-cover"
                          componentName="ChallengeCard"
                        />
                      </div>
                    )}
                    
                    {submission.linkUrl && (
                      <a
                        href={submission.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-[#89CFF0] hover:text-[#89CFF0]/80 text-sm"
                      >
                        <ExternalLink size={14} />
                        <span>Bekijk link</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
              
              {submissions.length > 3 && (
                <div className="text-center py-2">
                  <span className="text-sm text-gray-500">
                    +{submissions.length - 3} meer submissions
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {challenge.tags && challenge.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {challenge.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;