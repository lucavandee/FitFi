import React from 'react';
import { useOutfits } from '../hooks/useOutfits';
import { OutfitItem } from '../types/outfit';
import LoadingFallback from './ui/LoadingFallback';

interface OutfitGridProps {
  styleKey: string;
  className?: string;
}

const OutfitGrid: React.FC<OutfitGridProps> = ({ styleKey, className = '' }) => {
  const { data, isLoading, error } = useOutfits(styleKey);

  if (isLoading) {
    return <LoadingFallback message="Outfits laden..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Fout bij laden van outfits: {error.message}</p>
      </div>
    );
  }

  if (!data?.items || data.items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Geen outfits gevonden voor deze stijl.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {data.items.map((item: OutfitItem) => (
        <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="aspect-[3/4] overflow-hidden">
            <img 
              src={item.image} 
              alt={item.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
            <p className="text-lg font-bold text-[#89CFF0] mb-3">€{item.price}</p>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
            
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#89CFF0] text-[#0D1B2A] text-center py-2 rounded-lg font-medium hover:bg-[#89CFF0]/90 transition-colors"
            >
              Bekijk Product
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OutfitGrid;