import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = 'top',
  delay = 300,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollX = window.pageXOffset;
        const scrollY = window.pageYOffset;

        let x = rect.left + scrollX + rect.width / 2;
        let y = rect.top + scrollY;

        switch (placement) {
          case 'top':
            y -= 10;
            break;
          case 'bottom':
            y += rect.height + 10;
            break;
          case 'left':
            x = rect.left + scrollX - 10;
            y += rect.height / 2;
            break;
          case 'right':
            x = rect.right + scrollX + 10;
            y += rect.height / 2;
            break;
        }

        setPosition({ x, y });
        setIsVisible(true);
      }
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
    const baseClasses = 'absolute z-tooltip bg-midnight-900 text-white text-sm px-3 py-2 rounded-xl shadow-xl pointer-events-none transition-opacity duration-fast';
    const placementClasses = {
      top: 'transform -translate-x-1/2 -translate-y-full',
      bottom: 'transform -translate-x-1/2',
      left: 'transform -translate-x-full -translate-y-1/2',
      right: 'transform -translate-y-1/2'
    };

    return `${baseClasses} ${placementClasses[placement]} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={className}
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div
          className={getTooltipClasses()}
          style={{
            left: position.x,
            top: position.y
          }}
          role="tooltip"
        >
          {content}
          
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-midnight-900 transform rotate-45 ${
              placement === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' :
              placement === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' :
              placement === 'left' ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2' :
              'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2'
            }`}
          />
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;