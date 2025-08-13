import React from 'react';
import { ExternalLink, Heart } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import SmartImage from '@/components/media/SmartImage';
import Button from './ui/Button';
import { track } from '../utils/analytics';

interface ProductCardProps {
  id: string;
  brand: string;
  title: string;
  price: number;
  imageUrl: string;
  deeplink: string;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  brand,
  title,
  price,
  imageUrl,
  deeplink,
  className = ''
}) => {
  const { saveOutfit } = useGamification();

  const handleSave = async () => {
    // Track save action
    track('add_to_favorites', { 
      product_id: id,
      product_title: title,
      product_brand: brand,
      product_price: price
    });
    
    await saveOutfit();
  };

  const handleClick = () => {
    // Track product click
    track('product_click', {
      product_id: id,
      product_title: title,
      product_brand: brand,
      product_price: price,
      event_category: 'ecommerce',
      value: price
    });
    
    // Open affiliate link
    window.open(deeplink || '#', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* Product Image */}
      <div className="aspect-[3/4] overflow-hidden">
        <SmartImage
          src={imageUrl}
          alt={`${title} van ${brand}`}
          id={id}
          kind="product"
          aspect="3/4"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={handleClick}
        />
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1">
            {title}
          </h3>
          <p className="text-gray-600 text-xs">{brand}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">
            €{price.toFixed(2)}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              icon={<Heart size={14} />}
              className="text-gray-500 hover:text-red-500 p-1"
              aria-label="Bewaar product"
            >
              <></>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleClick}
              icon={<ExternalLink size={14} />}
              iconPosition="right"
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] text-xs px-3 py-1"
            >
              Bekijk
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;