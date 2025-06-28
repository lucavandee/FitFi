import React from 'react';

const SkeletonImage = ({ className = '' }) => {
  return (
    <div className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}>
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default SkeletonImage;