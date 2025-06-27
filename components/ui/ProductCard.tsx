import React, { useState } from 'react';
import { ShoppingBag, Star } from 'lucide-react';
import Button from './Button';
import ImageWithFallback from './ImageWithFallback';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    retailer: string;
    url: string;
    category: string;
    rating?: number;
    reviewCount?: number;
  };
  className?: string;
  onProductClick?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  className = '',
  onProductClick
}) => {
  const handleClick = () => {
    if (onProductClick) {
      onProductClick(product.id);
    } else {
      // Track product click in analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'product_click', {
          event_category: 'ecommerce',
          event_label: `${product.retailer}_${product.id}`,
          item_id: product.id,
          item_name: product.name,
          item_brand: product.brand,
          item_category: product.category,
          price: product.price,
          currency: 'EUR'
        });
      }
      
      window.open(product.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className={`glass-card overflow-hidden hover:border-[#FF8600]/50 transition-all duration-300 cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div className="relative">
        <div className="aspect-[3/4] bg-[#1B263B]">
          <ImageWithFallback 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
            componentName="ProductCard"
          />
        </div>
        <div className="absolute top-3 right-3 bg-[#0D1B2A]/90 px-2 py-1 rounded-full text-xs font-medium text-white/90">
          {product.retailer}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-white mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-white/60 mb-2">
          {product.brand} • {product.category}
        </p>
        
        {product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-white/20'}
                />
              ))}
            </div>
            {product.reviewCount && (
              <span className="text-xs text-white/60 ml-1">
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-white">
            €{product.price.toFixed(2)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="text-right">
              <p className="text-sm text-white/60 line-through">
                €{product.originalPrice.toFixed(2)}
              </p>
              <p className="text-xs text-[#FF8600] font-bold">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </p>
            </div>
          )}
        </div>
        
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            window.open(product.url, '_blank', 'noopener,noreferrer');
          }}
          icon={<ShoppingBag size={14} />}
          iconPosition="left"
        >
          Bekijk
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;