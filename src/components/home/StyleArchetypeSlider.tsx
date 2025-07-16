import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import ImageWithFallback from '../ui/ImageWithFallback';

interface StyleArchetype {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  gender: 'male' | 'female' | 'neutral';
}

const StyleArchetypeSlider: React.FC = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const styleArchetypes: StyleArchetype[] = [
    {
      id: 'modern-minimalist',
      name: 'Modern Minimalist',
      description: 'Strakke lijnen, neutrale kleuren en tijdloze stukken',
      imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
      gender: 'female'
    },
    {
      id: 'casual-chic',
      name: 'Casual Chic',
      description: 'Moeiteloze elegantie met een relaxte twist',
      imageUrl: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
      gender: 'female'
    },
    {
      id: 'business-casual',
      name: 'Business Casual',
      description: 'Professioneel maar comfortabel voor kantoor',
      imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
      gender: 'male'
    },
    {
      id: 'streetstyle',
      name: 'Streetstyle',
      description: 'Authentieke streetwear met attitude',
      imageUrl: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
      gender: 'male'
    },
    {
      id: 'classic-elegant',
      name: 'Klassiek Elegant',
      description: 'Tijdloze elegantie en verfijnde details',
      imageUrl: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
      gender: 'female'
    },
    {
      id: 'urban-sporty',
      name: 'Urban Sporty',
      description: 'Sportieve elementen met een stadse twist',
      imageUrl: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
      gender: 'male'
    },
    {
      id: 'bohemian',
      name: 'Bohemian',
      description: 'Vrije, artistieke stijl met natuurlijke elementen',
      imageUrl: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
      gender: 'female'
    },
    {
      id: 'scandinavian',
      name: 'Scandinavisch',
      description: 'Clean, functioneel en minimalistisch',
      imageUrl: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
      gender: 'male'
    },
    {
      id: 'retro',
      name: 'Retro',
      description: 'Vintage vibes met een moderne twist',
      imageUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
      gender: 'female'
    },
    {
      id: 'luxury',
      name: 'Luxury',
      description: 'Exclusieve stukken van topkwaliteit',
      imageUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
      gender: 'male'
    }
  ];

  const handlePrev = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.offsetWidth / 3;
      sliderRef.current.scrollLeft -= cardWidth;
      setActiveIndex(Math.max(activeIndex - 1, 0));
    }
  };

  const handleNext = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.offsetWidth / 3;
      sliderRef.current.scrollLeft += cardWidth;
      setActiveIndex(Math.min(activeIndex + 1, styleArchetypes.length - 1));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // Scroll speed multiplier
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleStyleClick = (id: string) => {
    // Navigate to style quiz with preselected style
    navigate(`/onboarding?style=${id}`);
  };

  // Update active index based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (sliderRef.current) {
        const scrollPosition = sliderRef.current.scrollLeft;
        const cardWidth = sliderRef.current.offsetWidth / 3;
        const newIndex = Math.round(scrollPosition / cardWidth);
        setActiveIndex(Math.min(Math.max(newIndex, 0), styleArchetypes.length - 1));
      }
    };

    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (slider) {
        slider.removeEventListener('scroll', handleScroll);
      }
    };
  }, [styleArchetypes.length]);

  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ontdek jouw stijlarchetype
        </h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Swipe door verschillende stijlen en ontdek welke het beste bij jou past
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="hidden md:block">
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
          disabled={activeIndex === 0}
        >
          <ChevronLeft size={24} className={activeIndex === 0 ? "text-gray-300" : "text-gray-700"} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
          disabled={activeIndex === styleArchetypes.length - 3}
        >
          <ChevronRight size={24} className={activeIndex === styleArchetypes.length - 3 ? "text-gray-300" : "text-gray-700"} />
        </button>
      </div>

      {/* Slider */}
      <div
        ref={sliderRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {styleArchetypes.map((style, index) => (
          <div
            key={style.id}
            className="flex-none w-full sm:w-1/2 md:w-1/3 px-4 snap-center"
          >
            <div className="bg-white rounded-2xl shadow-md overflow-hidden h-full transition-transform hover:shadow-lg">
              <div className="relative aspect-[3/4]">
                <ImageWithFallback
                  src={style.imageUrl}
                  alt={style.name}
                  className="w-full h-full object-cover"
                  componentName="StyleArchetypeSlider"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-xl font-bold text-white">{style.name}</h3>
                  <p className="text-white/80 text-sm">{style.description}</p>
                </div>
                
                {/* Gender indicator */}
                <div className="absolute top-4 right-4 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-sm">
                    {style.gender === 'male' ? '👨' : style.gender === 'female' ? '👩' : '👤'}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleStyleClick(style.id)}
                  className="bg-[#bfae9f] hover:bg-[#a89a8c]"
                >
                  Bekijk deze stijl
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {styleArchetypes.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === activeIndex ? 'bg-[#bfae9f]' : 'bg-gray-300'
            }`}
            onClick={() => {
              if (sliderRef.current) {
                const cardWidth = sliderRef.current.offsetWidth / 3;
                sliderRef.current.scrollLeft = index * cardWidth;
                setActiveIndex(index);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default StyleArchetypeSlider;