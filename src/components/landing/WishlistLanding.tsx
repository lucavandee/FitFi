import React from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';

interface WishlistItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  inStock: boolean;
}

interface WishlistLandingProps {
  className?: string;
}

const WishlistLanding: React.FC<WishlistLandingProps> = ({ className = '' }) => {
  const wishlistItems: WishlistItem[] = [
    {
      id: 'wish-1',
      name: 'Cashmere Sweater',
      brand: 'Everlane',
      price: 128,
      originalPrice: 160,
      imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      inStock: true
    },
    {
      id: 'wish-2',
      name: 'Wide Leg Trousers',
      brand: 'Ganni',
      price: 195,
      imageUrl: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      inStock: true
    },
    {
      id: 'wish-3',
      name: 'Leather Loafers',
      brand: 'The Row',
      price: 890,
      imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      inStock: false
    },
    {
      id: 'wish-4',
      name: 'Silk Scarf',
      brand: 'Hermès',
      price: 425,
      imageUrl: 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      inStock: true
    }
  ];

  return (
    <section className={`bg-white rounded-3xl p-8 shadow-sm ${className}`} aria-labelledby="wishlist-heading">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 id="wishlist-heading" className="text-2xl font-light text-gray-900">
              Wishlist
            </h2>
            <p className="text-gray-600">{wishlistItems.length} items opgeslagen</p>
          </div>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {wishlistItems.map((item) => (
          <div key={item.id} className="group relative">
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-3 relative">
              <ImageWithFallback
                src={item.imageUrl}
                alt={`${item.name} van ${item.brand}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                componentName="WishlistLanding"
              />
              
              {/* Stock Status */}
              {!item.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Uitverkocht</span>
                </div>
              )}
              
              {/* Sale Badge */}
              {item.originalPrice && item.originalPrice > item.price && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  Sale
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="font-medium text-gray-900 text-sm leading-tight">
                {item.name}
              </h3>
              <p className="text-gray-600 text-xs">{item.brand}</p>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">€{item.price}</span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="text-gray-500 text-xs line-through">€{item.originalPrice}</span>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 text-xs border-[#bfae9f] text-[#bfae9f] hover:bg-[#bfae9f] hover:text-white"
                disabled={!item.inStock}
              >
                {item.inStock ? 'Direct shoppen' : 'Niet beschikbaar'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Button
          variant="ghost"
          icon={<ArrowRight size={16} />}
          iconPosition="right"
          className="text-[#bfae9f] hover:bg-[#bfae9f]/10"
        >
          Alles bekijken
        </Button>
      </div>
    </section>
  );
};

export default WishlistLanding;