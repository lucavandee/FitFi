import React, { useState, useEffect } from 'react';

interface FullPageSpinnerProps {
  label?: string;
  delayMs?: number;
  className?: string;
}

const FullPageSpinner: React.FC<FullPageSpinnerProps> = ({ 
  label = 'Laden...', 
  delayMs = 0,
  className = '' 
}) => {
  const [show, setShow] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs > 0) {
      const timer = setTimeout(() => setShow(true), delayMs);
      return () => clearTimeout(timer);
    }
  }, [delayMs]);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 bg-[#0D1B2A]/90 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#89CFF0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white font-medium">{label}</p>
      </div>
    </div>
  );
};

export default FullPageSpinner;