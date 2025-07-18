import React from 'react';
import { env } from '../../utils/env';

interface LoadingFallbackProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

/**
 * A reusable loading component with customizable size and message
 */
const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = 'Laden...',
  size = 'md',
  fullScreen = false,
  className = ''
}) => {
  const spinnerSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };
  
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };
  
  const content = (
    <div className="flex flex-col items-center justify-center" aria-hidden="true">
      <div className={`${spinnerSizes[size]} border-4 border-[#FF8600] border-t-transparent rounded-full animate-spin mb-4`} aria-hidden="true"></div>
      <p className={`${textSizes[size]} text-white/80 font-medium`}>{message}</p>
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className={`fixed inset-0 bg-[#0D1B2A]/90 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
        {content}
      </div>
    );
  }
  
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      {content}
    </div>
  );
};

export default LoadingFallback;