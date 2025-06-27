import React from 'react';
import { ShoppingBag, Star, Tag } from 'lucide-react';
import Button from './ui/Button';
import ImageWithFallback from './ui/ImageWithFallback';
import { BoltProduct } from '../types/BoltProduct';

interface BoltProductCardProps {
  product: BoltProduct;
  onProductClick: (product: BoltProduct) => void;
  className?: string;
}

const BoltProductCard: React.FC<BoltProductCardProps> = ({ 
  product, 
  onProductClick,
  className = '' 
}) => {
  const handleClick = () => {
    onProductClick(product);
  };

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

  return (
    <div 
      className={`glass-card overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div className="relative h-60">
        <ImageWithFallback 
          src={product.imageUrl} 
          alt={product.title}
          className="w-full h-full object-cover"
          componentName="BoltProductCard"
        />
        <div className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white px-2 py-1 rounded-full text-xs font-medium">
          {product.season === 'all_season' ? 'Alle seizoenen' : product.season}
        </div>
        <div className="absolute bottom-2 left-2 bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white px-2 py-1 rounded-full text-xs font-medium">
          {product.type}
        </div>
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
        
        {/* Material */}
        <div className="mb-3 text-xs bg-white/10 p-2 rounded-lg">
          <p className="text-white/80">
            Materiaal: {product.material}
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
              onProductClick(product);
            }}
          >
            Bekijk
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BoltProductCard;