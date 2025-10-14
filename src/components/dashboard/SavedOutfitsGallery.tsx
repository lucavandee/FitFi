import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { savedOutfitsService } from '@/services/outfits/savedOutfitsService';
import type { SavedOutfit } from '@/services/outfits/savedOutfitsService';
import SmartImage from '@/components/media/SmartImage';
import Button from '@/components/ui/Button';
import ProductDetailModal from '@/components/outfits/ProductDetailModal';

interface SavedOutfitsGalleryProps {
  userId: string;
}

export default function SavedOutfitsGallery({ userId }: SavedOutfitsGalleryProps) {
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    loadSavedOutfits();
  }, [userId]);

  const loadSavedOutfits = async () => {
    setIsLoading(true);
    try {
      const outfits = await savedOutfitsService.getSavedOutfits(userId);
      setSavedOutfits(outfits);
    } catch (error) {
      console.error('[SavedOutfitsGallery] Error loading:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsave = async (outfitId: string) => {
    const result = await savedOutfitsService.unsaveOutfit(userId, outfitId);
    if (result.success) {
      setSavedOutfits(prev => prev.filter(o => o.outfit_id !== outfitId));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ff-color-primary-600)]"></div>
      </div>
    );
  }

  if (savedOutfits.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-[var(--color-text)]/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nog geen opgeslagen outfits</h3>
        <p className="text-[var(--color-text)]/70 mb-6">
          Begin met het opslaan van je favoriete looks om ze hier terug te vinden
        </p>
        <Button as={NavLink} to="/resultaten" variant="primary">
          Bekijk outfits
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          Mijn opgeslagen looks
          <span className="ml-2 text-sm font-normal text-[var(--color-text)]/60">
            ({savedOutfits.length})
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedOutfits.map((saved) => {
          const outfit = saved.outfit_json;
          const images = outfit.products?.map(p => p.imageUrl).slice(0, 4) || [];

          while (images.length < 4) {
            images.push('/images/outfit-fallback.jpg');
          }

          return (
            <article
              key={saved.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="grid grid-cols-2 gap-1 p-1">
                {images.map((img, idx) => (
                  <div key={idx} className="aspect-square relative">
                    <SmartImage
                      src={img}
                      alt=""
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">
                  {outfit.name || 'Outfit'}
                </h3>
                <p className="text-sm text-[var(--color-text)]/70 mb-4 line-clamp-2">
                  {outfit.description || outfit.explanation || ''}
                </p>

                <div className="space-y-2">
                  {outfit.products && outfit.products.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {outfit.products.slice(0, 2).map((product: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedProduct(product)}
                          className="flex items-center gap-1 px-2 py-1.5 bg-[var(--color-bg)] hover:bg-[var(--ff-color-primary-50)] border border-[var(--color-border)] rounded text-xs transition-all"
                        >
                          <ShoppingBag className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{product.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <Button
                    onClick={() => handleUnsave(saved.outfit_id)}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    <Heart className="w-4 h-4 mr-2" fill="currentColor" />
                    Verwijder uit favorieten
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
