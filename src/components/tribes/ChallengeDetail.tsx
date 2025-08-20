import React, { useState } from 'react';
import { Calendar, Trophy, Users, Clock, Image, Link as LinkIcon, Type } from 'lucide-react';
import type { TribeChallenge } from '../../services/data/types';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';

interface ChallengeDetailProps {
  challenge: TribeChallenge;
  onSubmit: (payload: { content?: string; imageUrl?: string; linkUrl?: string }) => Promise<void>;
  canSubmit: boolean;
}

export const ChallengeDetail: React.FC<ChallengeDetailProps> = ({ 
  challenge, 
  onSubmit, 
  canSubmit 
}) => {
  const [submissionType, setSubmissionType] = useState<'text' | 'image' | 'link' | 'combo'>('text');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isActive = challenge.status === 'open';
  const isExpired = challenge.endDate && new Date(challenge.endDate) < new Date();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit || !isActive || isExpired) return;
    
    // Validate based on submission type
    const hasContent = content.trim().length > 0;
    const hasImage = imageUrl.trim().length > 0;
    const hasLink = linkUrl.trim().length > 0;
    
    if (submissionType === 'text' && !hasContent) return;
    if (submissionType === 'image' && !hasImage) return;
    if (submissionType === 'link' && !hasLink) return;
    if (submissionType === 'combo' && (!hasContent || !hasImage)) return;

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        content: hasContent ? content : undefined,
        imageUrl: hasImage ? imageUrl : undefined,
        linkUrl: hasLink ? linkUrl : undefined,
      });
      
      // Reset form
      setContent('');
      setImageUrl('');
      setLinkUrl('');
      setSubmissionType('text');
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Challenge Header */}
      {challenge.imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <ImageWithFallback
            src={challenge.imageUrl}
            alt={challenge.title}
            className="w-full h-full object-cover"
            fallbackSrc="https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg"
          />
        </div>
      )}

      <div className="p-6">
        {/* Title and Status */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{challenge.title}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            challenge.status === 'open' ? 'bg-green-100 text-green-800' :
            challenge.status === 'closed' ? 'bg-red-100 text-red-800' :
            challenge.status === 'draft' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {challenge.status === 'open' ? 'Actief' : 
             challenge.status === 'closed' ? 'Gesloten' :
             challenge.status === 'draft' ? 'Concept' : 'Gearchiveerd'}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-6 leading-relaxed">
          {challenge.description}
        </p>

        {/* Challenge Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          {challenge.startDate && (
            <div className="text-center">
              <Calendar className="w-5 h-5 text-[#89CFF0] mx-auto mb-1" />
              <div className="text-xs text-gray-500">Start</div>
              <div className="text-sm font-medium text-gray-900">
                {formatDate(challenge.startDate)}
              </div>
            </div>
          )}
          
          {challenge.endDate && (
            <div className="text-center">
              <Clock className="w-5 h-5 text-[#89CFF0] mx-auto mb-1" />
              <div className="text-xs text-gray-500">Einde</div>
              <div className="text-sm font-medium text-gray-900">
                {formatDate(challenge.endDate)}
              </div>
            </div>
          )}

          {challenge.maxParticipants && (
            <div className="text-center">
              <Users className="w-5 h-5 text-[#89CFF0] mx-auto mb-1" />
              <div className="text-xs text-gray-500">Max deelnemers</div>
              <div className="text-sm font-medium text-gray-900">
                {challenge.maxParticipants}
              </div>
            </div>
          )}

          {challenge.xpReward && (
            <div className="text-center">
              <Trophy className="w-5 h-5 text-[#89CFF0] mx-auto mb-1" />
              <div className="text-xs text-gray-500">XP Beloning</div>
              <div className="text-sm font-medium text-gray-900">
                {challenge.xpReward} XP
              </div>
            </div>
          )}
        </div>

        {/* Submission Form */}
        {canSubmit && isActive && !isExpired && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Jouw Submission
              </h3>

              {/* Submission Type Selector */}
              <div className="flex space-x-2 mb-4">
                <button
                  type="button"
                  onClick={() => setSubmissionType('text')}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    submissionType === 'text'
                      ? 'bg-[#89CFF0] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Type className="w-4 h-4 mr-2" />
                  Tekst
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionType('image')}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    submissionType === 'image'
                      ? 'bg-[#89CFF0] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Afbeelding
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionType('link')}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    submissionType === 'link'
                      ? 'bg-[#89CFF0] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionType('combo')}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    submissionType === 'combo'
                      ? 'bg-[#89CFF0] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Combo
                </button>
              </div>

              {/* Content Input */}
              {(submissionType === 'text' || submissionType === 'combo') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beschrijving
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Beschrijf je submission..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-transparent resize-none"
                    rows={4}
                    required={submissionType === 'text' || submissionType === 'combo'}
                  />
                </div>
              )}

              {/* Image URL Input */}
              {(submissionType === 'image' || submissionType === 'combo') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Afbeelding URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-transparent"
                    required={submissionType === 'image' || submissionType === 'combo'}
                  />
                  {imageUrl && (
                    <div className="mt-2">
                      <ImageWithFallback
                        src={imageUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg"
                        fallbackSrc="https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Link URL Input */}
              {(submissionType === 'link' || submissionType === 'combo') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link URL
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-transparent"
                    required={submissionType === 'link'}
                  />
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                disabled={isSubmitting || !canSubmit}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Versturen...' : 'Verstuur Submission'}
              </Button>
            </div>
          </form>
        )}

        {/* Non-active states */}
        {(!canSubmit || !isActive || isExpired) && (
          <div className="border-t border-gray-200 pt-6">
            <div className="text-center py-4">
              {!canSubmit ? (
                <p className="text-gray-600">Log in om deel te nemen aan deze challenge</p>
              ) : !isActive ? (
                <p className="text-gray-600">Deze challenge is niet actief</p>
              ) : isExpired ? (
                <p className="text-gray-600">Deze challenge is verlopen</p>
              ) : null}
            </div>
          </div>
        )}

        {/* View Details Button */}
        <div className="mt-4">
          <Button
            onClick={() => onOpen(challenge.id)}
            variant="outline"
            size="sm"
            className="w-full border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
          >
            Bekijk Details & Submissions
          </Button>
        </div>
      </div>
    </div>
  );
};