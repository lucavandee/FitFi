import React, { useState, useRef, useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  showArrow?: boolean;
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
  maxWidth?: string;
}

const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  placement = 'top',
  className = '',
  triggerClassName = '',
  contentClassName = '',
  showArrow = true,
  closeOnClickOutside = true,
  showCloseButton = true,
  maxWidth = 'max-w-sm'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current && contentRef.current) {
      calculatePosition();
    }
  }, [isOpen, placement]);

  useEffect(() => {
    if (closeOnClickOutside) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current &&
          contentRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          !contentRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, closeOnClickOutside]);

  const calculatePosition = () => {
    if (!triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top - contentRect.height - 8;
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.left - contentRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.right + 8;
        break;
    }

    // Adjust for viewport boundaries
    if (left < 8) left = 8;
    if (left + contentRect.width > viewport.width - 8) {
      left = viewport.width - contentRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + contentRect.height > viewport.height - 8) {
      top = viewport.height - contentRect.height - 8;
    }

    setPosition({ top, left });
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-3 h-3 bg-white border transform rotate-45';
    
    switch (placement) {
      case 'top':
        return `${baseClasses} -bottom-1.5 left-1/2 -translate-x-1/2 border-t-0 border-l-0`;
      case 'bottom':
        return `${baseClasses} -top-1.5 left-1/2 -translate-x-1/2 border-b-0 border-r-0`;
      case 'left':
        return `${baseClasses} -right-1.5 top-1/2 -translate-y-1/2 border-t-0 border-r-0`;
      case 'right':
        return `${baseClasses} -left-1.5 top-1/2 -translate-y-1/2 border-b-0 border-l-0`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer ${triggerClassName}`}
      >
        {trigger}
      </div>

      {/* Popover Content */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          
          {/* Content */}
          <div
            ref={contentRef}
            className={`fixed z-50 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 ${maxWidth} animate-fade-in ${contentClassName}`}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`
            }}
          >
            {/* Arrow */}
            {showArrow && (
              <div className={getArrowClasses()} />
            )}
            
            {/* Close button */}
            {showCloseButton && (
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="Sluit uitleg"
              >
                <X size={12} className="text-gray-600" />
              </button>
            )}
            
            {/* Content */}
            <div className={showCloseButton ? "pr-8" : ""}>
              {content}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Popover;