import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';

interface OutfitItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface OutfitOfTheDayProps {
  className?: string;
}

const OutfitOfTheDay: React.FC<OutfitOfTheDayProps> = ({ className = '' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const outfitItems: OutfitItem[] = [
    {
      id: 'item-1',
      name: 'Oversized Blazer',
      brand: 'COS',
      price: 189,
      imageUrl: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      category: 'Blazers'
    },
    {
      id: 'item-2',
      name: 'Slim Fit Trousers',
      brand: 'Arket',
      price: 89,
      imageUrl: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      category: 'Broeken'
    },
    {
      id: 'item-3',
      name: 'Minimalist Sneakers',
      brand: 'Veja',
      price: 120,
      imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      category: 'Schoenen'
    },
    {
      id: 'item-4',
      name: 'Structured Bag',
      brand: 'Mansur Gavriel',
      price: 295,
      imageUrl: 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      category: 'Tassen'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % outfitItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + outfitItems.length) % outfitItems.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touchStartX = e.touches[0].clientX;
    
    const handleTouchEnd = (endEvent: TouchEvent) => {
      const touchEndX = endEvent.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <section className={`bg-white rounded-3xl p-8 shadow-sm ${className}`} aria-labelledby="outfit-heading">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 id="outfit-heading" className="text-2xl font-light text-gray-900 mb-1">
            Nova's Outfit van de Dag
          </h2>
          <p className="text-gray-600">Speciaal voor jou samengesteld</p>
        </div>
        
        {/* Navigation Controls */}
        <div className="hidden md:flex items-center space-x-2">
          <button
            onClick={prevSlide}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Vorige outfit item"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <button
            onClick={nextSlide}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Volgende outfit item"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Swipeable Carousel */}
      <div 
        className="relative overflow-hidden rounded-2xl"
        onTouchStart={handleTouchStart}
      >
        <div 
          ref={sliderRef}
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {outfitItems.map((item) => (
            <div key={item.id} className="w-full flex-shrink-0 relative">
              <div className="aspect-[4/5] relative">
                <ImageWithFallback
                  src={item.imageUrl}
                  alt={`${item.name} van ${item.brand}`}
                  className="w-full h-full object-cover"
                  componentName="OutfitOfTheDay"
                />
                
                {/* Hover/Tap Overlay */}
                <div 
                  className={`absolute inset-0 bg-black/40 flex items-end p-6 transition-opacity duration-300 ${
                    hoveredItem === item.id ? 'opacity-100' : 'opacity-0 md:opacity-0 hover:opacity-100'
                  }`}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onTouchStart={() => setHoveredItem(item.id)}
                >
                  <div className="text-white">
                    <h3 className="font-medium text-lg mb-1">{item.name}</h3>
                    <p className="text-white/80 text-sm mb-1">{item.brand}</p>
                    <p className="text-white font-medium">€{item.price}</p>
                  </div>
                </div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-xs font-medium text-gray-900">{item.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center space-x-2 mt-6">
        {outfitItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? 'bg-[#bfae9f]' : 'bg-gray-300'
            }`}
            aria-label={`Ga naar outfit item ${index + 1}`}
          />
        ))}
      </div>

      {/* CTA Button */}
      <div className="mt-6 text-center">
        <Button
          variant="primary"
          size="lg"
          icon={<ShoppingBag size={20} />}
          iconPosition="left"
          className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white"
        >
          Shop nu
        </Button>
      </div>
    </section>
  );
};

export default OutfitOfTheDay;