import React from 'react';
import { Calendar, Trophy, Users, Clock } from 'lucide-react';
import type { TribeChallenge } from '../../services/data/types';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';

interface ChallengeCardProps {
  c: TribeChallenge;
  onOpen: (challengeId: string) => void;
  className?: string;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ c, onOpen, className = '' }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isActive = c.status === 'open';
  const isExpired = c.endDate && new Date(c.endDate) < new Date();

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md ${className}`}>
      {/* Challenge Image */}
      {c.imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <ImageWithFallback
            src={c.imageUrl}
            alt={c.title}
            className="w-full h-full object-cover"
            fallbackSrc="https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg"
          />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {c.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
              {c.description}
            </p>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
            {c.status === 'open' ? 'Actief' : 
             c.status === 'closed' ? 'Gesloten' :
             c.status === 'draft' ? 'Concept' : 'Gearchiveerd'}
          </span>
        </div>

        {/* Challenge Details */}
        <div className="space-y-2 mb-4">
          {c.startDate && (
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Start: {formatDate(c.startDate)}</span>
            </div>
          )}
          
          {c.endDate && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              <span>Einde: {formatDate(c.endDate)}</span>
              {isExpired && <span className="ml-2 text-red-600">(Verlopen)</span>}
            </div>
          )}

          {c.maxParticipants && (
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-2" />
              <span>Max {c.maxParticipants} deelnemers</span>
            </div>
          )}

          {c.xpReward && (
            <div className="flex items-center text-sm text-gray-500">
              <Trophy className="w-4 h-4 mr-2" />
              <span>{c.xpReward} XP beloning</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onOpen(c.id)}
          variant={isActive ? "primary" : "outline"}
          size="sm"
          className={`w-full ${
            isActive 
              ? 'bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          disabled={!isActive}
        >
          {isActive ? 'Bekijk Challenge' : 
           isExpired ? 'Challenge Verlopen' : 
           'Challenge Gesloten'}
        </Button>
      </div>
    </div>
  );
};