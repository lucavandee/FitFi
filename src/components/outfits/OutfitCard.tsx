import { useState } from "react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/media/SmartImage";

export interface OutfitCardProps {
  outfit: Outfit;
  onSave?: (outfitId: string) => void;
  onView?: (outfitId: string) => void;
  className?: string;
  showActions?: boolean;
}

function OutfitCard({ 
  outfit, 
  onSave, 
  onView, 
  className,
  showActions = true 
}: OutfitCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!outfit.id || isLoading) return;
    
    setIsLoading(true);
    try {
      await onSave?.(outfit.id);
      setIsSaved(true);
    } catch (error) {
      console.error('Failed to save outfit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = () => {
    if (outfit.id) {
      onView?.(outfit.id);
    }
  };

  return (
    <div className={clsx(
      "bg-white rounded-2xl shadow-sm border border-surface overflow-hidden",
      "hover:shadow-md transition-shadow duration-200",
      className
    )}>
      {/* Outfit Image */}
      <div className="aspect-[4/5] relative">
        <SmartImage
          src={outfit.image || '/api/placeholder/400/500'}
          alt={outfit.title || 'Outfit'}
          aspect="4/5"
          className="w-full h-full"
        />
        
        {/* Match Percentage Badge */}
        {outfit.matchPercentage && (
          <div className="absolute top-3 right-3 bg-accent text-white px-2 py-1 rounded-full text-sm font-medium">
            {outfit.matchPercentage}% match
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading font-semibold text-lg text-midnight mb-2">
          {outfit.title || outfit.name || 'Untitled Outfit'}
        </h3>
        
        {outfit.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {outfit.description}
          </p>
        )}

        {/* Tags */}
        {outfit.tags && outfit.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {outfit.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-surface text-midnight text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={handleView}
              className="flex-1"
            >
              Bekijk outfit
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isLoading || isSaved}
              className="px-3"
            >
              {isSaved ? '✓' : '♡'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OutfitCard;