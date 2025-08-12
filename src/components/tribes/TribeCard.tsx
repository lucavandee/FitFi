import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Star, TrendingUp, Crown } from 'lucide-react';
import type { Tribe } from '@/services/data/types';
import ImageWithFallback from '../ui/ImageWithFallback';
import Button from '../ui/Button';

interface TribeCardProps {
  tribe: Tribe;
  onClick?: (id: string) => void;
  showJoinButton?: boolean;
  onJoin?: (tribeId: string) => void;
  className?: string;
}

export const TribeCard: React.FC<TribeCardProps> = ({ 
  tribe, 
  onClick, 
  showJoinButton = false,
  onJoin,
  className = '' 
}) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick(tribe.id);
    }
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onJoin) {
      onJoin(tribe.id);
    }
  };

  const getActivityColor = (level?: string) => {
    switch (level) {
      case 'very_high': return 'text-green-600 bg-green-50';
      case 'high': return 'text-blue-600 bg-blue-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActivityLabel = (level?: string) => {
    switch (level) {
      case 'very_high': return 'Zeer actief';
      case 'high': return 'Actief';
      case 'medium': return 'Gemiddeld';
      case 'low': return 'Rustig';
      default: return 'Nieuw';
    }
  };

  return (
    <article
      className={`group bg-white rounded-3xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 hover:transform hover:scale-105 border border-gray-100 ${className}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Bekijk ${tribe.name} tribe`}
    >
      {/* Cover Image */}
      <div className="relative aspect-video overflow-hidden">
        <ImageWithFallback
          src={tribe.cover_img || tribe.image || 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=2'}
          alt={`${tribe.name} tribe cover`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          componentName="TribeCard"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Featured Badge */}
        {tribe.featured && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-[#89CFF0] to-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
            <Star size={12} className="inline mr-1" />
            Featured
          </div>
        )}

        {/* Member Count Overlay */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
          <Users size={14} className="inline mr-1" />
          {tribe.member_count?.toLocaleString() || 0}
        </div>

        {/* User Role Badge */}
        {tribe.user_role === 'owner' && (
          <div className="absolute bottom-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Crown size={12} />
            <span>Owner</span>
          </div>
        )}

        {tribe.is_member && tribe.user_role !== 'owner' && (
          <div className="absolute bottom-4 left-4 bg-[#89CFF0] text-white px-3 py-1 rounded-full text-xs font-medium">
            ✓ Member
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-medium text-[#0D1B2A] mb-2 group-hover:text-[#89CFF0] transition-colors">
              {tribe.name}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
              {tribe.description}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Users size={14} />
              <span>{tribe.member_count?.toLocaleString() || 0} members</span>
            </div>
            
            {tribe.activity_level && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(tribe.activity_level)}`}>
                <TrendingUp size={12} />
                <span>{getActivityLabel(tribe.activity_level)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {tribe.tags && tribe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tribe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
            {tribe.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                +{tribe.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button
            as={Link}
            to={`/tribes/${tribe.slug}`}
            variant="primary"
            size="sm"
            className="flex-1 bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] justify-center"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            Bekijk tribe
          </Button>
          
          {showJoinButton && !tribe.is_member && (
            <Button
              onClick={handleJoinClick}
              variant="outline"
              size="sm"
              className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
            >
              Join
            </Button>
          )}
        </div>

        {/* Created Date */}
        {tribe.created_at && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Opgericht op {new Date(tribe.created_at).toLocaleDateString('nl-NL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>
    </article>
  );
};

export default TribeCard;