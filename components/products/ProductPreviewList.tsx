import React from 'react';
import { ShoppingBag, Tag, Star } from 'lucide-react';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';
import { BoltProduct } from '../../types/BoltProduct';

interface ProductPreviewListProps {
  products: BoltProduct[];
  title?: string;
  subtitle?: string;
  archetypeFilter?: string;
  minMatchScore?: number;
  maxItems?: number;
  onProductClick?: (product: BoltProduct) => void;
  onViewMore?: () => void;
  className?: string;
}

/**
 * A compact preview list of BoltProducts
 * Shows a limited number of products with an option to view more
 */
const ProductPreviewList: React.FC<ProductPreviewListProps> = ({
  products,
  title = "Producten voor jou",
  subtitle = "Geïnspireerd door jouw stijl",
  archetypeFilter = "casual_chic",
  minMatchScore = 0.5,
  maxItems = 3,
  onProductClick,
  onViewMore,
  className = ""
}) => {
  // Filter products by archetype match score
  const filteredProducts = products.filter(product => {
    const matchScore = product.archetypeMatch[archetypeFilter] || 0;
    return matchScore >= minMatchScore;
  });

  // Limit the number of products shown
  const displayProducts = filteredProducts.slice(0, maxItems);

  // Handle product click
  const handleProductClick = (product: BoltProduct) => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      // Default behavior: open affiliate link in new tab
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-sm text-white/70">{subtitle}</p>
        </div>
        
        {filteredProducts.length > maxItems && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewMore}
            className="text-white border border-white/30 hover:bg-white/10"
          >
            Bekijk meer
          </Button>
        )}
      </div>

      {displayProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayProducts.map((product) => (
            <div 
              key={product.id} 
              className="glass-card overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer"
              onClick={() => handleProductClick(product)}
              style={{ 
                borderLeft: `3px solid ${product.dominantColorHex}` 
              }}
            >
              <div className="relative h-48">
                <ImageWithFallback 
                  src={product.imageUrl} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                  componentName="ProductPreviewList"
                />
                
                {/* Match score badge */}
                {product.archetypeMatch[archetypeFilter] && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                    <Star size={12} className="mr-1" />
                    {Math.round(product.archetypeMatch[archetypeFilter] * 100)}%
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <h3 className="font-bold text-white text-sm mb-1 truncate">{product.title}</h3>
                <p className="text-xs text-white/70 mb-2">{product.brand}</p>
                
                {/* Style Tags - limited to 2 */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {product.styleTags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">
                    €{product.price.toFixed(2)}
                  </span>
                  <Button 
                    variant="primary" 
                    size="sm"
                    icon={<ShoppingBag size={12} />}
                    iconPosition="left"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product);
                    }}
                    className="text-xs py-1 px-2"
                  >
                    Bekijk
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-4 text-center">
          <p className="text-white/70">
            Geen producten gevonden die voldoen aan de criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductPreviewList;