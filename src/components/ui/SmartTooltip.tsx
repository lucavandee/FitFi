import React, { useState, useRef, useEffect } from 'react';

interface SmartTooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  className?: string;
}

const SmartTooltip: React.FC<SmartTooltipProps> = ({
  content,
  children,
  position = 'auto',
  delay = 500,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const calculatePosition = () => {
    if (position !== 'auto' || !triggerRef.current || !tooltipRef.current) {
      return position;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Check available space in each direction
    const spaceTop = triggerRect.top;
    const spaceBottom = viewport.height - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = viewport.width - triggerRect.right;

    // Determine best position based on available space
    if (spaceTop >= tooltipRect.height && spaceTop >= spaceBottom) {
      return 'top';
    } else if (spaceBottom >= tooltipRect.height) {
      return 'bottom';
    } else if (spaceRight >= tooltipRect.width && spaceRight >= spaceLeft) {
      return 'right';
    } else {
      return 'left';
    }
  };

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      setActualPosition(calculatePosition());
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTooltipClasses = () => {
    const baseClasses = `
      absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700 
      rounded-md shadow-lg transition-all duration-200 pointer-events-none
      ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    `;

    const positionClasses = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    };

    return `${baseClasses} ${positionClasses[actualPosition as keyof typeof positionClasses]} ${className}`;
  };

  const getArrowClasses = () => {
    const arrowClasses = {
      top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900 dark:border-t-gray-700',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900 dark:border-b-gray-700',
      left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900 dark:border-l-gray-700',
      right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900 dark:border-r-gray-700'
    };

    return `absolute w-0 h-0 border-4 ${arrowClasses[actualPosition as keyof typeof arrowClasses]}`;
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      <div
        ref={tooltipRef}
        className={getTooltipClasses()}
        role="tooltip"
      >
        {content}
        <div className={getArrowClasses()} />
      </div>
    </div>
  );
};

export default SmartTooltip;