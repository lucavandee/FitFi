import React, { useState, useEffect, useRef, Suspense } from 'react';
import { MessageCircle, X } from 'lucide-react';
import AppPortal from '../layout/AppPortal';
import { lazyComponent } from '../../utils/lazy';

// Hardened lazy loading with proper error handling
const NovaChatLazy = lazyComponent(() => import('./NovaChat'), 'default');

interface NovaBubbleProps {
  className?: string;
}

interface BubblePosition {
  x: number;
  y: number;
}

const NovaBubble: React.FC<NovaBubbleProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<BubblePosition>({ x: 24, y: 24 }); // Default: bottom-6 right-6
  const [isDragging, setIsDragging] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Check if desktop for dragging functionality
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Load saved position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('nova-bubble-position');
    if (savedPosition && isDesktop) {
      try {
        const parsed = JSON.parse(savedPosition);
        setPosition(parsed);
      } catch (error) {
        console.warn('Failed to parse saved bubble position');
      }
    }
  }, [isDesktop]);

  // Save position to localStorage
  const savePosition = (newPosition: BubblePosition) => {
    if (isDesktop) {
      localStorage.setItem('nova-bubble-position', JSON.stringify(newPosition));
    }
  };

  // Auto-open for first-time visitors
  useEffect(() => {
    if (!localStorage.getItem('nova-seen')) {
      setTimeout(() => {
        setIsOpen(true);
        setUnreadCount(1);
      }, 3000);
    }
  }, []);

  // Mark as seen when opened
  useEffect(() => {
    if (isOpen && !localStorage.getItem('nova-seen')) {
      localStorage.setItem('nova-seen', 'true');
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Dragging functionality for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDesktop) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (rect) {
      dragStartRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isDesktop || !dragStartRef.current) return;
    
    e.preventDefault();
    
    const newX = window.innerWidth - (e.clientX - dragStartRef.current.x) - 56; // 56px = bubble width
    const newY = window.innerHeight - (e.clientY - dragStartRef.current.y) - 56; // 56px = bubble height
    
    // Constrain to viewport
    const constrainedX = Math.max(24, Math.min(newX, window.innerWidth - 80));
    const constrainedY = Math.max(24, Math.min(newY, window.innerHeight - 80));
    
    setPosition({ x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    if (!isDragging || !isDesktop) return;
    
    setIsDragging(false);
    dragStartRef.current = null;
    savePosition(position);
  };

  // Global mouse events for dragging
  useEffect(() => {
    if (isDragging && isDesktop) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, isDesktop]);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (isDragging) return; // Don't toggle if dragging
    setIsOpen(!isOpen);
    setUnreadCount(0);
  };

  const bubbleStyle = isDesktop ? {
    right: `${position.x}px`,
    bottom: `${position.y}px`,
    cursor: isDragging ? 'grabbing' : 'grab'
  } : {};

  return (
    <AppPortal target="#nova-root">
      {/* Nova Chat Bubble */}
      <button
        ref={bubbleRef}
        id="nova-ai-chat-toggle"
        onClick={handleToggle}
        onMouseDown={handleMouseDown}
        className={`fixed z-[9999] w-14 h-14 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'scale-110' : 'hover:scale-110'
        } ${isDragging ? 'scale-110 shadow-2xl' : ''} ${
          isDesktop ? '' : 'bottom-6 right-6'
        } ${className}`}
        style={bubbleStyle}
        aria-label="Chat met Nova"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-7 w-7 text-white transition-transform" />
        ) : (
          <MessageCircle className="h-7 w-7 text-white transition-transform" />
        )}
        
        {/* Unread indicator */}
        {unreadCount > 0 && !isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-xs font-bold">{unreadCount}</span>
          </div>
        )}
        
        {/* Dragging indicator */}
        {isDragging && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Sleep om te verplaatsen
          </div>
        )}
      </button>

      {/* Nova Chat Window */}
      {isOpen && (
        <div 
          className={`fixed z-[9998] w-80 h-96 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col animate-scale-in ${
            isDesktop ? '' : 'bottom-24 right-6'
          }`}
          style={isDesktop ? {
            right: `${position.x}px`,
            bottom: `${position.y + 70}px` // Position above bubble
          } : {}}
        >
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#89CFF0] border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            <NovaChatLazy 
              onClose={() => setIsOpen(false)}
              context="general"
              className="h-full"
            />
          </Suspense>
        </div>
      )}
    </AppPortal>
  );
};

export default NovaBubble;