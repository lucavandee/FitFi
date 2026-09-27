import React from "react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import type { TribeChallengeSubmission } from "@/services/data/types";
import { Trophy, Clock } from 'lucide-react';

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
      
      {subs.map((submission, index) => {
        const userId = submission.userId ?? submission.user_id;
        const createdAt = submission.createdAt ?? submission.created_at;

        return (
          <article
            key={submission.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Submission Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#A85740] flex items-center justify-center text-white font-medium">
                  U
                </div>

                {/* User Info */}
                <div>
                  <h4 className="font-medium text-gray-900">
                    {userId ? `User ${userId.slice(-4)}` : 'Onbekende gebruiker'}
                  </h4>
                  {createdAt && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock size={12} />
                      <time dateTime={createdAt}>
                        {new Date(createdAt).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </time>
                    </div>
                  )}
                </div>
              </div>

              {/* Score */}
              {submission.score !== undefined && submission.score !== null && (
                <span className="px-3 py-1 bg-[#A85740]/10 text-[#A85740] rounded-full text-sm font-medium">
                  {submission.score}/100
                </span>
              )}
            </div>

            {/* Submission Image */}
            {submission.image && (
              <div className="mb-4 rounded-2xl overflow-hidden">
                <ImageWithFallback
                  src={submission.image}
                  alt="Submission afbeelding"
                  className="w-full h-auto max-h-96 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};