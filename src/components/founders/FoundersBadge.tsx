import React from 'react';
import { Crown } from 'lucide-react';

interface FoundersBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const FoundersBadge: React.FC<FoundersBadgeProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-brandPurple to-purple-400 flex items-center justify-center shadow-lg ${className}`}
      title="FitFi Founding Member"
      aria-label="FitFi Founding Member badge"
    >
      <Crown 
        size={iconSizes[size]} 
        className="text-white" 
      />
    </div>
  );
};

export default FoundersBadge;