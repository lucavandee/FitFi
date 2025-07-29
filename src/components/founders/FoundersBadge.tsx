import React from 'react';
import { Crown } from 'lucide-react';
import { motion } from 'framer-motion';

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
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-foundersGradientFrom to-foundersGradientTo flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
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
    <motion.div
      initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      whileHover={{ 
        scale: 1.1, 
        rotate: 5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        duration: 0.6, 
        ease: "easeOut",
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    >
      <BadgeContent />
    </motion.div>
  );
};

export default FoundersBadge;