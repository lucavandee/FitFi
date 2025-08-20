import React from 'react';
import { Trophy, Calendar, ExternalLink, Image as ImageIcon } from 'lucide-react';
import type { ChallengeSubmission } from '../../services/data/types';
import ImageWithFallback from '../ui/ImageWithFallback';
import LoadingFallback from '../ui/LoadingFallback';

interface SubmissionsListProps {
  subs: ChallengeSubmission[] | null;
  loading: boolean;
}

export const SubmissionsList: React.FC<SubmissionsListProps> = ({ subs, loading }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Submissions</h3>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!subs || subs.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nog geen submissions
        </h3>
        <p className="text-gray-600">
          Wees de eerste om deel te nemen aan deze challenge!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Submissions ({subs.length})
        </h3>
        <div className="text-sm text-gray-500">
          Gesorteerd op nieuwste eerst
        </div>
      </div>

      <div className="grid gap-4">
        {subs.map((submission) => (
          <div
            key={submission.id}
            className={`bg-white rounded-xl p-4 border transition-all ${
              submission.isWinner
                ? 'border-yellow-300 bg-yellow-50 shadow-md'
                : 'border-gray-200 hover:shadow-sm'
            }`}
          >
            {/* Submission Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#89CFF0] rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {submission.userName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {submission.userName || 'Anonieme gebruiker'}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(submission.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {submission.isWinner && (
                  <div className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    <Trophy className="w-3 h-3 mr-1" />
                    Winner
                  </div>
                )}
                {submission.score !== undefined && (
                  <div className="text-sm font-medium text-gray-900">
                    Score: {submission.score}
                  </div>
                )}
              </div>
            </div>

            {/* Submission Content */}
            <div className="space-y-3">
              {/* Text Content */}
              {submission.content && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-700 leading-relaxed">
                    {submission.content}
                  </p>
                </div>
              )}

              {/* Image Content */}
              {submission.imageUrl && (
                <div className="relative">
                  <ImageWithFallback
                    src={submission.imageUrl}
                    alt="Submission afbeelding"
                    className="w-full max-w-md rounded-lg object-cover"
                    fallbackSrc="https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg"
                  />
                  <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* Link Content */}
              {submission.linkUrl && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <a
                    href={submission.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm truncate"
                  >
                    {submission.linkUrl}
                  </a>
                </div>
              )}

              {/* Submission Type Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  submission.submissionType === 'text' ? 'bg-gray-100 text-gray-700' :
                  submission.submissionType === 'image' ? 'bg-purple-100 text-purple-700' :
                  submission.submissionType === 'link' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {submission.submissionType === 'text' ? 'Tekst' :
                   submission.submissionType === 'image' ? 'Afbeelding' :
                   submission.submissionType === 'link' ? 'Link' :
                   'Combo'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};