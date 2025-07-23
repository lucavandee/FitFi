import React from 'react';

interface ChevronRightProps {
  size?: number;
  className?: string;
}

const ChevronRight: React.FC<ChevronRightProps> = ({ size = 24, className = '' }) => {
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
      <polyline points="9,18 15,12 9,6" />
    </svg>
  );
};

export default ChevronRight;