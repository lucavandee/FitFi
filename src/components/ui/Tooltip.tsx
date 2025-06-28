import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface TooltipProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Tooltip: React.FC<TooltipProps> = ({ children, onClose }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div
        ref={tooltipRef}
        role="tooltip"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm mx-4 animate-scale-in transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Waarom deze vraag?
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Sluit uitleg"
          >
            <X size={18} />
          </button>
        </div>
        <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Tooltip;