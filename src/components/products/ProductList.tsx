import React from 'react';
import { ShoppingBag, Tag, Star } from 'lucide-react';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';
import { BoltProduct } from '../../types/BoltProduct';

interface ProductListProps {
  products: BoltProduct[];
  title?: string;
  subtitle?: string;
  archetypeFilter?: string;
  minMatchScore?: number;
  onProductClick?: (product: BoltProduct) => void;
  className?: string;
}

/**
 * A component that displays a list of BoltProducts
 * Filters products based on archetype match score
 */
const ProductList: React.FC<ProductListProps> = ({
  products,
  title = "Producten voor jou",
  subtitle = "Geïnspireerd door jouw stijl",
  archetypeFilter = "casual_chic", // Default to casual_chic
  minMatchScore = 0.5,
  onProductClick,
  className = ""
}) => {
  // Filter products by archetype match score
  const filteredProducts = products.filter(product => {
    const matchScore = product.archetypeMatch[archetypeFilter] || 0;
    return matchScore >= minMatchScore;
  });

  // Helper function to get a readable archetype name
  const getArchetypeName = (archetypeId: string): string => {
    const archetypeNames: Record<string, string> = {
      'klassiek': 'Klassiek',
      'casual_chic': 'Casual Chic',
      'urban': 'Urban',
      'streetstyle': 'Streetstyle',
      'retro': 'Retro',
      'luxury': 'Luxury'
    };
    
    return archetypeNames[archetypeId] || archetypeId;
  };

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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-white/70">{subtitle}</p>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="glass-card overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer"
              onClick={() => handleProductClick(product)}
              style={{ 
                borderLeft: `3px solid ${product.dominantColorHex}` 
              }}
            >
              <div className="relative h-60">
                <ImageWithFallback 
                  src={product.imageUrl} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                  componentName="ProductList"
                />
                <div className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white px-2 py-1 rounded-full text-xs font-medium">
                  {product.season === 'all_season' ? 'Alle seizoenen' : product.season}
                </div>
                <div className="absolute bottom-2 left-2 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white px-2 py-1 rounded-full text-xs font-medium">
                  {product.type}
                </div>
                
                {/* Match score badge */}
                {product.archetypeMatch[archetypeFilter] && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                    <Star size={12} className="mr-1" />
                    {Math.round(product.archetypeMatch[archetypeFilter] * 100)}% Match
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-white mb-1">{product.title}</h3>
                <p className="text-sm text-white/70 mb-3">{product.brand}</p>
                
                {/* Style Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.styleTags.map((tag, index) => (
                    <span key={index} className="text-xs bg-white/10 px-2 py-0.5 rounded-full flex items-center">
                      <Tag size={10} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Archetype Match */}
                <div className="mb-3 text-xs bg-white/10 p-2 rounded-lg">
                  <p className="text-white/80">
                    Archetype match: 
                    {Object.entries(product.archetypeMatch).map(([archetype, score], index) => (
                      <span key={archetype} className="ml-1">
                        {getArchetypeName(archetype)} ({Math.round(score * 100)}%)
                        {index < Object.entries(product.archetypeMatch).length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </p>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-white">
                    €{product.price.toFixed(2)}
                  </span>
                  <Button 
                    variant="primary" 
                    size="sm"
                    icon={<ShoppingBag size={14} />}
                    iconPosition="left"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product);
                    }}
                  >
                    Bekijk
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-8 text-center">
          <p className="text-white/70 mb-4">
            Geen producten gevonden die voldoen aan de criteria.
          </p>
          <Button 
            variant="primary"
            onClick={() => window.location.reload()}
          >
            Vernieuwen
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductList;