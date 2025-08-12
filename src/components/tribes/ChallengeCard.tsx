import React, { useState } from 'react';
import { Calendar, Clock, Trophy, Users, Image, ExternalLink, Award } from 'lucide-react';
import type { TribeChallenge } from '@/services/data/types';
import { useChallengeSubmissions } from '@/hooks/useTribeChallenges';
import { useUser } from '@/context/UserContext';
import ImageWithFallback from '../ui/ImageWithFallback';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface ChallengeCardProps {
  challenge: TribeChallenge;
  onSubmit?: (challengeId: string) => void;
  className?: string;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onSubmit,
  className = ''
}) => {
  const { user } = useUser();
  const { submissions, submitChallenge, loading: submissionsLoading } = useChallengeSubmissions(
    challenge.id, 
    user?.id
  );
  
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    content: '',
    imageUrl: '',
    linkUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userSubmission = submissions?.find(s => s.userId === user?.id);
  const hasSubmitted = !!userSubmission;
  const isOpen = challenge.status === 'open';
  const isExpired = challenge.endAt ? new Date(challenge.endAt) < new Date() : false;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeRemaining = () => {
    if (!challenge.endAt) return null;
    
    const now = new Date();
    const end = new Date(challenge.endAt);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Verlopen';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} dagen`;
    if (hours > 0) return `${hours} uur`;
    return 'Bijna verlopen';
  };

  const handleSubmit = async () => {
    if (!user?.id || !submissionData.content.trim()) {
      toast.error('Vul alle vereiste velden in');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitChallenge({
        tribeId: challenge.tribeId,
        challengeId: challenge.id,
        userId: user.id,
        userName: user.name || 'Anonymous',
        content: submissionData.content.trim(),
        imageUrl: submissionData.imageUrl.trim() || undefined,
        linkUrl: submissionData.linkUrl.trim() || undefined
      });
      
      toast.success('Challenge inzending verstuurd! 🎉');
      setShowSubmissionForm(false);
      setSubmissionData({ content: '', imageUrl: '', linkUrl: '' });
      
      if (onSubmit) {
        onSubmit(challenge.id);
      }
    } catch (error) {
      console.error('Error submitting challenge:', error);
      toast.error('Kon inzending niet versturen');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Challenge Image */}
      {challenge.image && (
        <div className="aspect-video overflow-hidden">
          <ImageWithFallback
            src={challenge.image}
            alt={challenge.title}
            className="w-full h-full object-cover"
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
                 challenge.status === 'closed' ? 'Gesloten' :
                 challenge.status === 'draft' ? 'Concept' : 'Gearchiveerd'}
              </span>
              
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
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {challenge.description}
              </p>
            )}
          </div>
        </div>

        {/* Rules */}
        {challenge.rules && challenge.rules.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Regels:</h4>
            <ul className="space-y-1">
              {challenge.rules.map((rule, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                  <span className="text-[#89CFF0] mt-1">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rewards */}
        <div className="flex items-center space-x-4 mb-4 text-sm">
          <div className="flex items-center space-x-1 text-[#89CFF0]">
            <Trophy size={14} />
            <span>+{challenge.rewardPoints || 0} punten</span>
          </div>
          
          {challenge.winnerRewardPoints && (
            <div className="flex items-center space-x-1 text-yellow-600">
              <Award size={14} />
              <span>+{challenge.winnerRewardPoints} winnaar</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1 text-gray-500">
            <Users size={14} />
            <span>{submissions?.length || 0} inzendingen</span>
          </div>
        </div>

        {/* Tags */}
        {challenge.tags && challenge.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {challenge.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* User Submission Status */}
        {hasSubmitted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {userSubmission?.isWinner ? 'Winnaar! 🏆' : 'Inzending verstuurd'}
              </span>
            </div>
            <p className="text-sm text-green-700">
              {userSubmission?.content}
            </p>
            {userSubmission?.score && (
              <div className="mt-2 text-xs text-green-600">
                Score: {userSubmission.score}/100
              </div>
            )}
          </div>
        ) : (
          /* Submission Form */
          isOpen && !isExpired && user && (
            <div className="space-y-4">
              {!showSubmissionForm ? (
                <Button
                  onClick={() => setShowSubmissionForm(true)}
                  variant="primary"
                  fullWidth
                  className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                >
                  Doe mee met challenge
                </Button>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Beschrijving *
                    </label>
                    <textarea
                      value={submissionData.content}
                      onChange={(e) => setSubmissionData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Vertel over je outfit en waarom het past bij de challenge..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] resize-none"
                      rows={3}
                      maxLength={500}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Outfit foto (optioneel)
                    </label>
                    <input
                      type="url"
                      value={submissionData.imageUrl}
                      onChange={(e) => setSubmissionData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/outfit.jpg"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0]"
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
                      placeholder="https://instagram.com/p/..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0]"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={!submissionData.content.trim() || isSubmitting}
                      variant="primary"
                      className="flex-1 bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                    >
                      {isSubmitting ? 'Versturen...' : 'Verstuur inzending'}
                    </Button>
                    
                    <Button
                      onClick={() => setShowSubmissionForm(false)}
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Annuleer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* Login CTA for guests */}
        {!user && isOpen && !isExpired && (
          <div className="bg-[#89CFF0]/10 rounded-2xl p-4 text-center">
            <p className="text-sm text-gray-700 mb-3">
              Log in om mee te doen met deze challenge
            </p>
            <Button
              as="a"
              href="/inloggen"
              variant="primary"
              size="sm"
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
            >
              Inloggen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;