import React, { useState, useEffect } from 'react';
import { ShoppingBag, ExternalLink, Clock, Info } from 'lucide-react';
import Button from './Button';
import ImageWithFallback from './ImageWithFallback';
import { generateOutfitExplanation } from '../../engine/explainOutfit';

const RecommendationCard = ({ item, className = '', user }) => {
  const [showExplanationTooltip, setShowExplanationTooltip] = useState(false);
  const [explanation, setExplanation] = useState(item.explanation || '');
  
  useEffect(() => {
    // If explanation is not provided, generate a simple one
    if (!item.explanation && item.archetype) {
      try {
        // Create a simplified outfit object for the explanation generator
        const simpleOutfit = {
          id: item.id || 'recommendation',
          title: item.name,
          description: item.description || `${item.name} van ${item.brand}`,
          archetype: item.archetype || 'casual_chic',
          occasion: item.occasion || 'Casual',
          products: [
            {
              id: item.id,
              name: item.name,
              brand: item.brand,
              price: item.price,
              category: item.category
            }
          ],
          tags: item.tags || ['casual'],
          matchPercentage: item.matchPercentage || 85,
          season: item.season?.[0] || 'autumn'
        };
        
        const generatedExplanation = generateOutfitExplanation(
          simpleOutfit,
          simpleOutfit.archetype,
          simpleOutfit.occasion,
          user?.name?.split(' ')?.[0]
        );
        
        // Simplify the explanation for a single product
        const simplifiedExplanation = generatedExplanation
          .replace(/Deze outfit/g, 'Dit item')
          .replace(/combinatie/g, 'keuze')
          .replace(/producten/g, 'product');
        
        setExplanation(simplifiedExplanation);
        
        // Log the generated explanation
        console.log(`Generated explanation for product ${item.id}:`, simplifiedExplanation);
        
        // Track explanation generation in analytics
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'product_explanation_generated', {
            event_category: 'engagement',
            event_label: item.id,
            product_id: item.id,
            product_name: item.name
          });
        }
      } catch (error) {
        console.error('Error generating explanation:', error);
        setExplanation('Past bij jouw stijlvoorkeuren');
      }
    } else {
      setExplanation(item.explanation || 'Past bij jouw stijlvoorkeuren');
    }
  }, [item, user]);
  
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
  
  const handleExplanationClick = (e) => {
    e.stopPropagation();
    setShowExplanationTooltip(!showExplanationTooltip);
    
    // Track explanation click in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'product_explanation_click', {
        event_category: 'engagement',
        event_label: item.id,
        product_id: item.id,
        product_name: item.name
      });
    }
  };

  return (
    <div className={`glass-card p-6 space-y-4 hover:border-orange-500/50 transition-all duration-300 ${className}`}>
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
        
        {/* Explanation with info icon */}
        <div className="p-2 bg-white/5 rounded-lg border border-white/10 relative">
          <div className="flex items-start">
            <p className="text-white/80 text-xs italic flex-1 pr-6">
              {explanation || 'Past bij jouw stijlvoorkeuren'}
            </p>
            <button 
              onClick={handleExplanationClick}
              className="absolute top-2 right-2 text-white/50 hover:text-white/80 transition-colors"
              aria-label="Meer informatie"
            >
              <Info size={14} />
            </button>
          </div>
          
          {/* Explanation tooltip */}
          {showExplanationTooltip && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-white/70 text-xs">
                Deze uitleg is gegenereerd door onze AI op basis van jouw stijlvoorkeuren
                en de kenmerken van dit product.
              </p>
            </div>
          )}
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