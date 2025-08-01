import React from 'react';
import { Crown } from 'lucide-react';

interface FoundersBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const FoundersBadge: React.FC<FoundersBadgeProps> = ({ 
  className = '', 
  size = 'md',
  animated = true
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  const BadgeContent = () => (
    <div 
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-foundersGradientFrom to-foundersGradientTo flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${className}`}
      title="FitFi Founding Member"
      aria-label="FitFi Founding Member badge"
    >
      <Crown 
        size={iconSizes[size]} 
        className="text-white drop-shadow-sm" 
      />
    </div>
  );

  if (!animated) {
    return <BadgeContent />;
  }

  return (
    <div className="animate-scale-in hover:scale-110 active:scale-95 transition-transform duration-300">
      <BadgeContent />
    </div>
  );
};

export default FoundersBadge;