import React from 'react';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';

interface ProductCardProps {
  id: string;
  brand: string;
  title: string;
  price: number;
  imageUrl: string;
  deeplink: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  brand,
  title,
  price,
  imageUrl,
  deeplink
}) => {
  const { user } = useUser();

  const handleClick = async () => {
    try {
      // Track clickout in Supabase
      if (user?.id) {
        await supabase
          .from('clickouts')
          .insert({
            user_id: user.id,
            product_id: id,
            ts: new Date().toISOString()
          });
      }

      // GTM datalayer push
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'clickout',
          product_id: id,
          brand: brand,
          price: price
        });
      }

      // Open affiliate link with UTM tracking
      const trackedUrl = `${deeplink}?utm_source=fitfi&utm_medium=quiz`;
      window.open(trackedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking clickout:', error);
      // Still open the link even if tracking fails
      const trackedUrl = `${deeplink}?utm_source=fitfi&utm_medium=quiz`;
      window.open(trackedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden"
      onClick={handleClick}
    >
      <div className="aspect-[3/4] overflow-hidden">
        <img 
          src={imageUrl} 
          alt={`${brand} ${title}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      
      <div className="p-4 space-y-2">
        <div className="text-sm text-[#89CFF0] font-medium">{brand}</div>
        <h3 className="font-medium text-[#0D1B2A] text-sm leading-tight line-clamp-2">
          {title}
        </h3>
        <div className="text-lg font-bold text-[#0D1B2A]">
          €{price.toFixed(2)}
        </div>
      </div>
      
      {/* Hover ring effect */}
      <div className="absolute inset-0 ring-2 ring-transparent group-hover:ring-[#89CFF0]/30 rounded-2xl transition-all pointer-events-none" />
    </div>
  );
};

export default ProductCard;