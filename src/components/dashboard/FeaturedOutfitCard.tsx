import React from 'react';
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import SmartImage from '@/components/media/SmartImage';
import Button from '../ui/Button';
import { track } from '@/utils/analytics';

interface FeaturedOutfitCardProps {
  outfit?: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    matchPercentage: number;
    archetype?: string;
    tags?: string[];
  };
  loading?: boolean;
  className?: string;
}

const FeaturedOutfitCard: React.FC<FeaturedOutfitCardProps> = ({
  outfit,
  loading = false,
  className = ''
}) => {
  const handleViewMore = () => {
    track('featured_outfit_view_more', {
      outfit_id: outfit?.id,
      outfit_title: outfit?.title,
      match_percentage: outfit?.matchPercentage,
      source: 'dashboard'
    });
  };

  const handleOutfitClick = () => {
    track('featured_outfit_click', {
      outfit_id: outfit?.id,
      outfit_title: outfit?.title,
      match_percentage: outfit?.matchPercentage,
      source: 'dashboard'
    });
  };

  // Loading skeleton
  if (loading || !outfit) {
    return (
      <div className={`bg-white rounded-3xl shadow-sm p-6 animate-pulse ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-[3/4] bg-gray-200 rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-10 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Uitgelichte Outfit</h3>
          <p className="text-gray-600 text-sm">Perfect voor jouw stijl</p>
        </div>
      </div>

      {/* Outfit Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image */}
        <div 
          className="cursor-pointer group"
          onClick={handleOutfitClick}
        >
          <SmartImage
            src={outfit.imageUrl}
            alt={outfit.title}
            id={outfit.id}
            kind="outfit"
            aspect="3/4"
            containerClassName="rounded-2xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
            imgClassName="group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-900">
                {outfit.matchPercentage}% Match
              </span>
            </div>

            <h4 className="text-xl font-medium text-gray-900 mb-3 leading-tight">
              {outfit.title}
            </h4>

            <p className="text-gray-600 leading-relaxed mb-4">
              {outfit.description}
            </p>

            {/* Tags */}
            {outfit.tags && outfit.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {outfit.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#89CFF0]/10 text-[#89CFF0] rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <Button
            as={Link}
            to="/outfits"
            onClick={handleViewMore}
            variant="primary"
            size="lg"
            fullWidth
            icon={<ArrowRight size={20} />}
            iconPosition="right"
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] shadow-sm hover:shadow-md transition-all"
          >
            Bekijk meer outfits
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedOutfitCard;