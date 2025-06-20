import React from 'react';
import { ShoppingBag, ExternalLink, Clock } from 'lucide-react';
import Button from './Button';
import LazyProductImage from './LazyProductImage';

const RecommendationCard = ({ item, className = '' }) => {
  const handleProductClick = () => {
    // Track product click
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'product_click', {
        event_category: 'ecommerce',
        event_label: `${item.retailer}_${item.productId}`,
        item_id: item.productId,
        item_name: item.name,
        item_brand: item.brand,
        item_category: item.category,
        price: item.price,
        currency: 'EUR'
      });
    }
    
    // Open product page
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  const getRetailerColor = (retailer) => {
    const colors = {
      'Zalando': 'bg-orange-500',
      'Wehkamp': 'bg-blue-600',
      'H&M NL': 'bg-red-500',
      'ASOS NL': 'bg-black',
      'Bol.com': 'bg-blue-500',
      'About You NL': 'bg-purple-600'
    };
    return colors[retailer] || 'bg-gray-600';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${className}`}>
      {/* Product Image with Dynamic Loading */}
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
        <LazyProductImage
          retailer={item.retailer}
          productId={item.productId}
          alt={item.name}
          className="h-48 w-full object-cover rounded-lg"
        />
        
        {/* Retailer badge */}
        <div className={`absolute top-3 right-3 ${getRetailerColor(item.retailer)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
          {item.retailer}
        </div>
        
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleProductClick}
            icon={<ExternalLink size={14} />}
            iconPosition="right"
            className="bg-white/90 text-gray-900 hover:bg-white"
          >
            Snel Bekijken
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {item.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {item.category} • {item.brand}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            €{item.price.toFixed(2)}
          </p>
          {item.originalPrice && item.originalPrice > item.price && (
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                €{item.originalPrice.toFixed(2)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 font-bold">
                -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
              </p>
            </div>
          )}
        </div>

        {/* Urgency indicator */}
        {item.urgencyMessage && (
          <div className="inline-flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full space-x-1 text-xs">
            <Clock className="h-3 w-3" />
            <span>{item.urgencyMessage}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2">
          <Button
            variant="primary"
            fullWidth
            onClick={handleProductClick}
            icon={<ShoppingBag size={16} />}
            iconPosition="left"
            className="animate-pulse hover:animate-none"
          >
            Koop bij {item.retailer}
          </Button>
          
          <button
            onClick={handleProductClick}
            className="block w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-center"
          >
            Bekijk productdetails →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;