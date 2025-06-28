import React from 'react';
import { Info } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

interface OptionCardProps {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
  imageUrl?: string;
  isSelected: boolean;
  onClick: () => void;
  onInfoClick?: () => void;
  className?: string;
}

const OptionCard: React.FC<OptionCardProps> = ({
  id,
  name,
  description,
  icon,
  imageUrl,
  isSelected,
  onClick,
  onInfoClick,
  className = ''
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full p-4 rounded-xl border text-left transition-all
        ${isSelected
          ? 'border-[#FF8600] bg-white/10'
          : 'border-white/30 hover:border-white/50 hover:bg-white/5'}
        ${className}
      `}
    >
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="text-2xl">{icon}</div>
        )}
        
        {imageUrl && (
          <div className="w-16 h-16 overflow-hidden rounded-lg">
            <ImageWithFallback
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
              componentName="OptionCard"
            />
          </div>
        )}
        
        <div className="flex-1">
          <div className="font-medium text-white">{name}</div>
          {description && (
            <div className="text-sm text-white/70">{description}</div>
          )}
        </div>
        
        <div className={`
          w-6 h-6 rounded-full flex items-center justify-center
          ${isSelected
            ? 'bg-[#FF8600] text-white'
            : 'bg-white/20 border border-white/30'}
        `}>
          {isSelected && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>
      
      {onInfoClick && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInfoClick();
          }}
          className="absolute bottom-4 right-4 text-white/50 hover:text-white/80 transition-colors"
          aria-label="Meer informatie"
        >
          <Info size={16} />
        </button>
      )}
    </button>
  );
};

export default OptionCard;