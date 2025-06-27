import React from 'react';
import { ShoppingBag, ExternalLink, Clock } from 'lucide-react';
import Button from './Button';
import ImageWithFallback from './ImageWithFallback';

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

  return (
    <div className={`glass-card p-6 space-y-4 hover:border-[#FF8600]/50 transition-all duration-300 ${className}`}>
      {/* Product Image with Dynamic Loading */}
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#1B263B]">
        <ImageWithFallback
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover"
          componentName="RecommendationCard"
        />
        
        {/* Retailer badge */}
        <div className="absolute top-3 right-3 bg-[#0D1B2A]/90 px-2 py-1 rounded-full text-xs font-medium text-white/90">
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
            className="bg-[#0D1B2A]/90 text-white hover:bg-[#0D1B2A]"
          >
            Bekijken
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-medium text-white line-clamp-2">
            {item.name}
          </h3>
          <p className="text-sm text-white/60">
            {item.category} • {item.brand}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-white">
            €{item.price.toFixed(2)}
          </p>
          {item.originalPrice && item.originalPrice > item.price && (
            <div className="text-right">
              <p className="text-sm text-white/60 line-through">
                €{item.originalPrice.toFixed(2)}
              </p>
              <p className="text-xs text-[#FF8600] font-bold">
                -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
              </p>
            </div>
          )}
        </div>

        {/* Urgency indicator */}
        {item.urgencyMessage && (
          <div className="inline-flex items-center bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full space-x-1 text-xs">
            <Clock className="h-3 w-3" />
            <span>{item.urgencyMessage}</span>
          </div>
        )}

        {/* Action buttons */}
        <Button
          variant="primary"
          fullWidth
          onClick={handleProductClick}
          icon={<ShoppingBag size={16} />}
          iconPosition="left"
        >
          Koop bij {item.retailer}
        </Button>
      </div>
    </div>
  );
};

export default RecommendationCard;