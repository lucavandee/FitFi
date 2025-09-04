import { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, X } from 'lucide-react';

interface StyleOption {
  id: string;
  name: string;
  image: string;
  description: string;
}

interface NovaStyleSwipeProps {
  styles: StyleOption[];
  onSwipe: (styleId: string, liked: boolean) => void;
  onComplete: (likedStyles: string[]) => void;
}

export default function NovaStyleSwipe({ styles, onSwipe, onComplete }: NovaStyleSwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedStyles, setLikedStyles] = useState<string[]>([]);

  const currentStyle = styles[currentIndex];

  const handleSwipe = (liked: boolean) => {
    if (!currentStyle) return;

    onSwipe(currentStyle.id, liked);
    
    if (liked) {
      setLikedStyles(prev => [/* placeholder removed */prev, currentStyle.id]);
    }

    if (currentIndex < styles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(liked ? [/* placeholder removed */likedStyles, currentStyle.id] : likedStyles);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < styles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (!currentStyle) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Geen stijlen beschikbaar</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="relative h-96">
          <img
            src={currentStyle.image}
            alt={currentStyle.name}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-2 bg-white/80 rounded-full shadow-md disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="bg-white/80 px-3 py-1 rounded-full">
              <span className="text-sm font-medium">
                {currentIndex + 1} / {styles.length}
              </span>
            </div>
            
            <button
              onClick={handleNext}
              disabled={currentIndex === styles.length - 1}
              className="p-2 bg-white/80 rounded-full shadow-md disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {currentStyle.name}
          </h3>
          <p className="text-gray-600 mb-6">
            {currentStyle.description}
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={() => handleSwipe(false)}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
              <span>Niet mijn stijl</span>
            </button>
            
            <button
              onClick={() => handleSwipe(true)}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span>Love it!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}