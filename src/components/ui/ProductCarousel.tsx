import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Heart, ShoppingBag, ExternalLink, Clock, Zap, Award, TrendingUp } from 'lucide-react';
import { DutchProduct, trackAffiliateClick } from '../../data/dutchProducts';
import Button from './Button';

interface ProductCarouselProps {
  products: DutchProduct[];
  title: string;
  category: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ products, title, category }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Auto-play functionality (disabled by default for better UX)
  useEffect(() => {
    if (!isAutoPlaying || products.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === products.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, products.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
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

  const handleAffiliateClick = (product: DutchProduct) => {
    trackAffiliateClick(product, 'product_carousel');
    window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  const getRetailerColor = (retailer: string): string => {
    const colors = {
      'Zalando': 'bg-orange-500',
      'Wehkamp': 'bg-blue-600',
      'H&M NL': 'bg-red-500',
      'ASOS NL': 'bg-black',
      'Bol.com': 'bg-blue-500',
      'De Bijenkorf': 'bg-purple-600'
    };
    return colors[retailer] || 'bg-gray-600';
  };

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400">Geen producten beschikbaar in deze categorie.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {products.length} producten beschikbaar • Speciaal voor jouw stijl geselecteerd
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-orange-500" size={16} />
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {category}
            </span>
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
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 group">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        
                        {/* Discount badge */}
                        {product.originalPrice && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold animate-pulse">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% SALE
                          </div>
                        )}
                        
                        {/* Limited edition badge */}
                        {product.limitedEdition && (
                          <div className="absolute top-3 right-3 bg-purple-600 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center">
                            <Award size={12} className="mr-1" />
                            LIMITED
                          </div>
                        )}
                        
                        {/* Quick actions */}
                        <div className="absolute bottom-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="bg-white/90 dark:bg-gray-800/90 p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors">
                            <Heart size={16} className="text-gray-600 dark:text-gray-300" />
                          </button>
                        </div>
                        
                        {/* Stock indicator */}
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-semibold">Uitverkocht</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="lg:w-2/3 flex flex-col justify-between">
                      <div>
                        {/* Brand and Name */}
                        <div className="mb-3">
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            {product.brand}
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                            {product.name}
                          </h4>
                        </div>

                        {/* Psychological Trigger */}
                        <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                          <p className="text-sm text-orange-700 dark:text-orange-300 font-medium flex items-center">
                            <Zap size={14} className="mr-2" />
                            {product.psychologicalTrigger}
                          </p>
                        </div>

                        {/* Personalized Message */}
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-700 dark:text-blue-300 italic">
                            💫 {product.personalizedMessage}
                          </p>
                        </div>

                        {/* Rating and Popularity */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={`${i < Math.floor(product.rating) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300 dark:text-gray-600'}`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                              {product.rating} ({product.reviewCount} reviews)
                            </span>
                          </div>
                          {product.popularityIndicator && (
                            <div className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                              🔥 {product.popularityIndicator}
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                          {product.description}
                        </p>

                        {/* Features badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.freeShipping && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-xs font-medium">
                              ✅ Gratis verzending
                            </span>
                          )}
                          {product.fastDelivery && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
                              ⚡ 24u levering
                            </span>
                          )}
                          {product.limitedEdition && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-xs font-medium">
                              💎 Limited Edition
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.tags.slice(0, 3).map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Colors and Sizes */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kleuren:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.colors.slice(0, 3).map((color, index) => (
                                <span key={index} className="text-xs text-gray-500 dark:text-gray-400">
                                  {color}{index < product.colors.length - 1 && index < 2 ? ', ' : ''}
                                </span>
                              ))}
                              {product.colors.length > 3 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  +{product.colors.length - 3} meer
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Maten:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.sizes.slice(0, 4).map((size, index) => (
                                <span key={index} className="text-xs text-gray-500 dark:text-gray-400">
                                  {size}{index < product.sizes.length - 1 && index < 3 ? ', ' : ''}
                                </span>
                              ))}
                              {product.sizes.length > 4 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  +{product.sizes.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Urgency Message */}
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium flex items-center">
                          <Clock size={14} className="mr-2" />
                          ⏰ {product.urgencyMessage}
                        </p>
                      </div>

                      {/* Price and CTA */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            €{product.price.toFixed(2)}
                          </span>
                          {product.originalPrice && (
                            <div className="flex flex-col">
                              <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                                €{product.originalPrice.toFixed(2)}
                              </span>
                              <span className="text-xs text-green-600 dark:text-green-400 font-bold">
                                Bespaar €{(product.originalPrice - product.price).toFixed(2)}!
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Retailer badge */}
                          <div className={`${getRetailerColor(product.retailer)} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                            {product.retailer}
                          </div>

                          {/* Buy button */}
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => handleAffiliateClick(product)}
                            disabled={!product.inStock}
                            icon={<ExternalLink size={16} />}
                            iconPosition="right"
                            className="whitespace-nowrap animate-pulse hover:animate-none"
                          >
                            {product.inStock ? 'Koop Nu' : 'Uitverkocht'}
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
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-gray-600 dark:text-gray-300 z-10"
              aria-label="Vorig product"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-gray-600 dark:text-gray-300 z-10"
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
                    ? 'bg-orange-500 scale-110' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-orange-300 dark:hover:bg-orange-700'}
                `}
                aria-label={`Ga naar product ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with category link */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 transition-colors">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            💝 Bekijk alle {category.toLowerCase()} bij onze partners - speciaal voor jou geselecteerd
          </span>
          <Button variant="outline" size="sm">
            Meer {category}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;