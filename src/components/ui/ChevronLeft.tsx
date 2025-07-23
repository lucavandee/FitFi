import React from 'react';

interface ChevronLeftProps {
  size?: number;
  className?: string;
}

const ChevronLeft: React.FC<ChevronLeftProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="15,18 9,12 15,6" />
    </svg>
  );
};

export default ChevronLeft;