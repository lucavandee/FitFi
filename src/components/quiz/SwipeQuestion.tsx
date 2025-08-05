import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, X } from 'lucide-react';

interface SwipeOption {
  id: string;
  label: string;
  imageUrl: string;
  description?: string;
}

interface SwipeQuestionProps {
  question: string;
  description?: string;
  options: SwipeOption[];
  onAnswer: (selectedIds: string[]) => void;
  multiSelect?: boolean;
  className?: string;
}

const SwipeQuestion: React.FC<SwipeQuestionProps> = ({
  question,
  description,
  options,
  onAnswer,
  multiSelect = false,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const currentOption = options[currentIndex];

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const offset = currentX - startX.current;
    setDragOffset(offset);
    
    // Visual feedback for swipe direction
    if (Math.abs(offset) > 50) {
      setSwipeDirection(offset > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Determine if swipe was significant enough
    if (Math.abs(dragOffset) > 100) {
      if (dragOffset > 0) {
        handleLike();
      } else {
        handleDislike();
      }
    }
    
    // Reset
    setDragOffset(0);
    setSwipeDirection(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const offset = e.clientX - startX.current;
    setDragOffset(offset);
    
    if (Math.abs(offset) > 50) {
      setSwipeDirection(offset > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (Math.abs(dragOffset) > 100) {
      if (dragOffset > 0) {
        handleLike();
      } else {
        handleDislike();
      }
    }
    
    setDragOffset(0);
    setSwipeDirection(null);
  };

  const handleLike = () => {
    if (!currentOption) return;
    
    const newSelected = multiSelect 
      ? [...selectedIds, currentOption.id]
      : [currentOption.id];
    
    setSelectedIds(newSelected);
    nextCard();
    
    // Auto-submit if not multi-select
    if (!multiSelect) {
      setTimeout(() => onAnswer(newSelected), 500);
    }
  };

  const handleDislike = () => {
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < options.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (multiSelect && selectedIds.length > 0) {
      onAnswer(selectedIds);
    } else if (multiSelect) {
      // No selections made, restart
      setCurrentIndex(0);
    }
  };

  const handleSubmit = () => {
    if (selectedIds.length > 0) {
      onAnswer(selectedIds);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleDislike();
      } else if (e.key === 'ArrowRight') {
        handleLike();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  if (!currentOption) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <h3 className="text-xl font-medium text-gray-900 mb-4">{question}</h3>
        {multiSelect && selectedIds.length > 0 ? (
          <div className="space-y-4">
            <p className="text-gray-600">Je hebt {selectedIds.length} stijlen geselecteerd</p>
            <button
              onClick={handleSubmit}
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] px-6 py-3 rounded-2xl font-medium transition-colors"
            >
              Doorgaan met selectie
            </button>
          </div>
        ) : (
          <p className="text-gray-600">Alle opties bekeken</p>
        )}
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      {/* Question Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-medium text-gray-900 mb-2">{question}</h3>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
        <div className="flex justify-center space-x-2 mt-4">
          {options.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-[#89CFF0]' : 
                index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Swipe Card */}
      <div className="relative h-96 mb-6">
        <div
          ref={cardRef}
          className={`absolute inset-0 bg-white rounded-3xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing transition-transform duration-300 ${
            isDragging ? 'scale-105' : ''
          }`}
          style={{
            transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)`,
            opacity: Math.max(0.7, 1 - Math.abs(dragOffset) / 300)
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Swipe Indicators */}
          {swipeDirection && (
            <div className={`absolute inset-0 flex items-center justify-center z-10 ${
              swipeDirection === 'right' ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                swipeDirection === 'right' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {swipeDirection === 'right' ? (
                  <Heart className="w-10 h-10 text-white" />
                ) : (
                  <X className="w-10 h-10 text-white" />
                )}
              </div>
            </div>
          )}

          {/* Image */}
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={currentOption.imageUrl}
              alt={currentOption.label}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <h4 className="text-xl font-medium text-gray-900 mb-2">
              {currentOption.label}
            </h4>
            {currentOption.description && (
              <p className="text-gray-600 text-sm">
                {currentOption.description}
              </p>
            )}
          </div>
        </div>

        {/* Next card preview */}
        {currentIndex < options.length - 1 && (
          <div className="absolute inset-0 bg-white rounded-3xl shadow-md overflow-hidden -z-10 scale-95 opacity-50">
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={options[currentIndex + 1].imageUrl}
                alt={options[currentIndex + 1].label}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleDislike}
          className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
          aria-label="Niet mijn stijl"
        >
          <X size={24} />
        </button>
        
        <button
          onClick={handleLike}
          className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
          aria-label="Vind ik leuk"
        >
          <Heart size={24} />
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">
          Swipe rechts voor ❤️ • Swipe links voor ✕ • Of gebruik de knoppen
        </p>
      </div>

      {/* Multi-select progress */}
      {multiSelect && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            {selectedIds.length} stijlen geselecteerd
          </p>
          {selectedIds.length > 0 && (
            <button
              onClick={handleSubmit}
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] px-6 py-2 rounded-full font-medium transition-colors"
            >
              Doorgaan ({selectedIds.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SwipeQuestion;