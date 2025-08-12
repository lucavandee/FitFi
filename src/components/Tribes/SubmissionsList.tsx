import React from "react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import type { TribeChallengeSubmission } from "@/services/data/types";
import { ExternalLink, Trophy, Star, Crown, Clock, User } from 'lucide-react';

interface SubmissionsListProps {
  subs: TribeChallengeSubmission[] | null;
  loading?: boolean;
  className?: string;
}

export const SubmissionsList: React.FC<SubmissionsListProps> = ({ 
  subs, 
  loading = false,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!subs?.length) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Submissions ({subs.length})
        </h3>
        
        <div className="text-sm text-gray-600">
          Gesorteerd op score
        </div>
      </div>
      
      {subs.map((submission, index) => (
        <article 
          key={submission.id} 
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow animate-fade-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {/* Submission Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {/* User Avatar */}
              <div className="w-10 h-10 rounded-full bg-[#89CFF0] flex items-center justify-center text-white font-medium">
                {submission.userName?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              {/* User Info */}
              <div>
                <h4 className="font-medium text-gray-900">
                  {submission.userName || `User ${submission.userId.slice(-4)}`}
                </h4>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock size={12} />
                  <time dateTime={submission.createdAt}>
                    {new Date(submission.createdAt).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                </div>
              </div>
            </div>
            
            {/* Score & Winner Badge */}
            <div className="flex items-center space-x-2">
              {submission.score && (
                <span className="px-3 py-1 bg-[#89CFF0]/10 text-[#89CFF0] rounded-full text-sm font-medium">
                  {submission.score}/100
                </span>
              )}
              
              {submission.isWinner && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Crown size={14} />
                  <span>Winnaar</span>
                </span>
              )}
            </div>
          </div>

          {/* Submission Content */}
          {submission.content && (
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {submission.content}
              </p>
            </div>
          )}

          {/* Submission Image */}
          {submission.imageUrl && (
            <div className="mb-4 rounded-2xl overflow-hidden">
              <ImageWithFallback
                src={submission.imageUrl}
                alt="Submission afbeelding"
                className="w-full h-auto max-h-96 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Submission Link */}
          {submission.linkUrl && (
            <div className="mb-4">
              <a
                href={submission.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors"
              >
                <ExternalLink size={16} />
                <span>Bekijk externe link</span>
              </a>
            </div>
          )}

          {/* Submission Type Badge */}
          {submission.submissionType && (
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                Type: {submission.submissionType}
              </span>
            </div>
          )}
        </article>
      ))}
    </div>
  );
};