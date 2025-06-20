import React, { useState } from 'react';
import { 
  ExternalLink, 
  Star, 
  Clock, 
  Zap, 
  Award, 
  TrendingUp,
  ShoppingBag,
  Heart
} from 'lucide-react';
import Button from './Button';
import { CrossSellProduct, trackCrossSellClick } from '../../data/crossSellProducts';

interface CrossSellCardProps {
  product: CrossSellProduct;
  onCategoryClick?: (category: string) => void;
  className?: string;
}

const CrossSellCard: React.FC<CrossSellCardProps> = ({ 
  product, 
  onCategoryClick,
  className = '' 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleProductClick = () => {
    trackCrossSellClick(product, 'cross_sell_card');
    window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCategoryClick) {
      onCategoryClick(product.category);
    }
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

  const getCategoryIcon = (category: string): string => {
    const icons = {
      'Schoenen': '👟',
      'Horloges': '⌚',
      'Sjaals': '🧣',
      'Riemen': '👔',
      'Tassen': '👜',
      'Sieraden': '💍'
    };
    return icons[category] || '✨';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer group ${className}`}>
      {/* Product Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-700" onClick={handleProductClick}>
        {!imageLoaded && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
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
        
        {/* Category badge */}
        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center">
          <span className="mr-1">{getCategoryIcon(product.category)}</span>
          {product.category}
        </div>
        
        {/* Quick actions */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-white/90 dark:bg-gray-800/90 p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors">
            <Heart size={14} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Brand and Name */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {product.brand}
          </div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
            {product.name}
          </h4>
        </div>

        {/* Psychological Trigger */}
        <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-3 border-orange-500">
          <p className="text-xs text-orange-700 dark:text-orange-300 font-medium flex items-center">
            <Zap size={12} className="mr-1" />
            {product.psychologicalTrigger}
          </p>
        </div>

        {/* Personalized Message */}
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300 italic">
            💫 {product.personalizedMessage}
          </p>
        </div>

        {/* Popularity Indicator */}
        {product.popularityIndicator && (
          <div className="mb-3 text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full flex items-center justify-center">
            <TrendingUp size={12} className="mr-1" />
            🔥 {product.popularityIndicator}
          </div>
        )}

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 leading-relaxed line-clamp-2">
          {product.description}
        </p>

        {/* Features badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.freeShipping && (
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-xs font-medium">
              ✅ Gratis verzending
            </span>
          )}
          {product.fastDelivery && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
              ⚡ 24u levering
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags.slice(0, 2).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs"
            >
              #{tag}
            </span>
          ))}
          {product.tags.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md text-xs">
              +{product.tags.length - 2}
            </span>
          )}
        </div>

        {/* Urgency Message */}
        <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-700 dark:text-red-300 font-medium flex items-center">
            <Clock size={12} className="mr-1" />
            ⏰ {product.urgencyMessage}
          </p>
        </div>

        {/* Price and CTA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                €{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    €{product.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-400 font-bold">
                    Bespaar €{(product.originalPrice - product.price).toFixed(2)}!
                  </span>
                </div>
              )}
            </div>

            {/* Retailer badge */}
            <div className={`${getRetailerColor(product.retailer)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
              {product.retailer}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleProductClick}
              icon={<ShoppingBag size={14} />}
              iconPosition="left"
              className="flex-1 text-xs animate-pulse hover:animate-none"
            >
              Koop Nu
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCategoryClick}
              icon={<ExternalLink size={14} />}
              iconPosition="right"
              className="text-xs whitespace-nowrap"
            >
              Bekijk meer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossSellCard;