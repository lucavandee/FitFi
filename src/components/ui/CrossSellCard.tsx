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
import ImageWithFallback from './ImageWithFallback';

interface CrossSellProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  retailer: string;
  affiliateLink: string;
  category: string;
  description: string;
  tags: string[];
  psychologicalTrigger: string;
  urgencyMessage: string;
  personalizedMessage: string;
  popularityIndicator?: string;
  limitedEdition?: boolean;
  freeShipping?: boolean;
  fastDelivery?: boolean;
}

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
  const handleProductClick = () => {
    window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCategoryClick) {
      onCategoryClick(product.category);
    }
  };

  return (
    <div className={`glass-card overflow-hidden transition-all duration-300 hover:border-[#FF8600]/50 cursor-pointer group ${className}`}>
      {/* Product Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#1B263B]" onClick={handleProductClick}>
        <ImageWithFallback 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
          componentName="CrossSellCard"
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
        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
          {product.category}
        </div>
        
        {/* Quick actions */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-white/90 dark:bg-[#0D1B2A]/90 p-2 rounded-full hover:bg-white dark:hover:bg-[#0D1B2A] transition-colors">
            <Heart size={14} className="text-[#FF8600]" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Brand and Name */}
        <div className="mb-3">
          <div className="text-xs text-white/70 mb-1">
            {product.brand}
          </div>
          <h4 className="text-lg font-bold text-white leading-tight">
            {product.name}
          </h4>
        </div>

        {/* Psychological Trigger */}
        <div className="mb-3 p-2 bg-[#FF8600]/10 rounded-lg border-l-2 border-[#FF8600]">
          <p className="text-xs text-white/90 font-medium flex items-center">
            <Zap size={12} className="mr-1 text-[#FF8600]" />
            {product.psychologicalTrigger}
          </p>
        </div>

        {/* Personalized Message */}
        <div className="mb-3 p-2 bg-[#0ea5e9]/10 rounded-lg border border-[#0ea5e9]/20">
          <p className="text-xs text-white/90 italic">
            💫 {product.personalizedMessage}
          </p>
        </div>

        {/* Popularity Indicator */}
        {product.popularityIndicator && (
          <div className="mb-3 text-xs text-[#0ea5e9] font-medium bg-[#0ea5e9]/10 px-2 py-1 rounded-full flex items-center justify-center">
            <TrendingUp size={12} className="mr-1" />
            🔥 {product.popularityIndicator}
          </div>
        )}

        {/* Urgency Message */}
        <div className="mb-4 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
          <p className="text-xs text-white/90 font-medium flex items-center">
            <Clock size={12} className="mr-1 text-red-400" />
            ⏰ {product.urgencyMessage}
          </p>
        </div>

        {/* Price and CTA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-white">
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

            {/* Retailer badge */}
            <div className="bg-[#0D1B2A]/90 text-white px-2 py-1 rounded-full text-xs font-medium">
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
              className="flex-1 text-xs"
            >
              Koop Nu
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCategoryClick}
              icon={<ExternalLink size={14} />}
              iconPosition="right"
              className="text-xs whitespace-nowrap text-white border border-white/20 hover:bg-white/10"
            >
              Meer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossSellCard;