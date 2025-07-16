import React from 'react';

interface SkeletonPlaceholderProps {
  width?: string;
  height?: string;
  rounded?: string;
  className?: string;
}

/**
 * A reusable skeleton placeholder component for loading states
 * 
 * @param width - CSS width class (e.g., 'w-full', 'w-24')
 * @param height - CSS height class (e.g., 'h-4', 'h-12')
 * @param rounded - CSS border radius class (e.g., 'rounded-md', 'rounded-full')
 * @param className - Additional CSS classes
 */
const SkeletonPlaceholder: React.FC<SkeletonPlaceholderProps> = ({
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-md',
  className = ''
}) => {
  return (
    <div 
      className={`bg-white/5 dark:bg-gray-700 animate-pulse ${width} ${height} ${rounded} ${className}`} 
      aria-hidden="true"
    />
  );
};

export default SkeletonPlaceholder;