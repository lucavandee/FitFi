import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-5 h-5 border-2',
  md: 'w-10 h-10 border-[3px]',
  lg: 'w-12 h-12 border-4',
};

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => (
  <div
    className={`${sizes[size]} border-[#E5E5E5] border-t-[#C2654A] rounded-full animate-spin ${className}`}
    aria-hidden="true"
  />
);

export default Spinner;
