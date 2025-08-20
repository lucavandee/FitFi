import React from 'react';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { track } from '@/utils/analytics';
import { useSavedOutfit } from '@/hooks/useSavedOutfit';

export type StyleProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  image: string;
  url: string;
};

export type StyleOutfit = {
  id: string;
  name: string;
  description: string;
  matchScore: number;
  products: StyleProduct[];
  image: string;
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export default function StyleCard({
  outfit,
  onShopClick,
}: {
  outfit: StyleOutfit;
  onShopClick?: (product: StyleProduct, outfit: StyleOutfit) => void;
}) {
  const score = clamp(outfit.matchScore);
  const main = outfit.products?.[0];
  const { saved, toggle: toggleSave, busy: saveBusy } = useSavedOutfit(outfit);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="aspect-square relative">
        <ImageWithFallback
          src={outfit.image}
          alt={outfit.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-slate-700">
          {score}% match
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-semibold text-lg text-slate-900 mb-2">{outfit.name}</h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{outfit.description}</p>
        
        <div className="flex items-center justify-between">
          {main && (
            <button
              onClick={() => onShopClick?.(main, outfit)}
              className="rounded-2xl px-4 py-3 font-semibold text-white bg-slate-900 hover:bg-slate-800 transition"
            >
              Shop nu
            </button>
          )}
          <button
            onClick={() => {
              track('style_preview_save_click', { outfitId: outfit.id, saved: !saved });
              toggleSave();
            }}
            disabled={saveBusy}
            className={`rounded-2xl px-4 py-3 font-semibold transition ${
              saved 
                ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
            } ${saveBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Bewaar outfit"
            title={saved ? "Verwijder uit favorieten" : "Bewaar outfit"}
          >
            {saveBusy ? '...' : saved ? '♥' : '♡'}
          </button>
        </div>
      </div>
    </div>
  );
}