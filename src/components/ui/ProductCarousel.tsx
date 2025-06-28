import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Heart, ShoppingBag, ExternalLink, Clock, Zap, Award, TrendingUp } from 'lucide-react';
import Button from './Button';
import ImageWithFallback from './ImageWithFallback';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  retailer: string;
  url: string;
  category: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
}

interface ProductCarouselProps {
  products: Product[];
  title: string;
  category: string;
  onProductClick?: (productId: string) => void;
  className?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ 
  products, 
  title, 
  category,
  onProductClick,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? products.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex === products.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product.id);
    } else {
      window.open(product.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (products.length === 0) {
    return (
      <div className="glass-card p-6 transition-colors">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <p className="text-white/70">Geen producten beschikbaar in deze categorie.</p>
      </div>
    );
  }

  return (
    <div className={`glass-card overflow-hidden transition-colors ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-white/70 mt-1">
              {products.length} producten beschikbaar • Speciaal voor jouw stijl geselecteerd
            </p>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div 
          ref={carouselRef}
          className="overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {products.map((product) => (
              <div key={product.id} className="w-full flex-shrink-0">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Product Image */}
                    <div className="lg:w-1/3">
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#1B263B] group">
                        <ImageWithFallback 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          componentName="ProductCarousel"
                        />
                        
                        {/* Discount badge */}
                        {product.originalPrice && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold animate-pulse">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% SALE
                          </div>
                        )}
                        
                        {/* Quick actions */}
                        <div className="absolute bottom-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="bg-white/90 dark:bg-[#0D1B2A]/90 p-2 rounded-full hover:bg-white dark:hover:bg-[#0D1B2A] transition-colors">
                            <Heart size={16} className="text-[#FF8600]" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="lg:w-2/3 flex flex-col justify-between">
                      <div>
                        {/* Brand and Name */}
                        <div className="mb-3">
                          <div className="text-sm text-white/70 mb-1">
                            {product.brand}
                          </div>
                          <h4 className="text-xl font-bold text-white">
                            {product.name}
                          </h4>
                        </div>

                        {/* Description */}
                        {product.description && (
                          <p className="text-white/80 mb-4 leading-relaxed">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Price and CTA */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-white">
                            €{product.price.toFixed(2)}
                          </span>
                          {product.originalPrice && (
                            <div className="flex flex-col">
                              <span className="text-sm text-white/60 line-through">
                                €{product.originalPrice.toFixed(2)}
                              </span>
                              <span className="text-xs text-[#FF8600] font-bold">
                                Bespaar €{(product.originalPrice - product.price).toFixed(2)}!
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Retailer badge */}
                          <div className="bg-[#0D1B2A]/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                            {product.retailer}
                          </div>

                          {/* Buy button */}
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => handleProductClick(product)}
                            icon={<ChevronRight size={16} />}
                            iconPosition="right"
                          >
                            Bekijk
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows - only show if more than 1 product */}
        {products.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#0D1B2A]/90 text-white rounded-full p-3 shadow-lg hover:bg-[#0D1B2A] transition-all hover:scale-105 z-10"
              aria-label="Vorig product"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#0D1B2A]/90 text-white rounded-full p-3 shadow-lg hover:bg-[#0D1B2A] transition-all hover:scale-105 z-10"
              aria-label="Volgend product"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dots indicator - only show if more than 1 product */}
        {products.length > 1 && (
          <div className="flex justify-center pb-6 space-x-2">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`
                  w-3 h-3 rounded-full transition-all duration-300
                  ${index === currentIndex 
                    ? 'bg-[#FF8600] scale-110' 
                    : 'bg-white/30 hover:bg-white/50'}
                `}
                aria-label={`Ga naar product ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with category link */}
      <div className="px-6 py-4 bg-white/5 border-t border-white/10 transition-colors">
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/70">
            Bekijk alle {category.toLowerCase()} bij onze partners
          </span>
          <Button variant="ghost" size="sm" className="text-white border border-white/20 hover:bg-white/10">
            Meer {category}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;