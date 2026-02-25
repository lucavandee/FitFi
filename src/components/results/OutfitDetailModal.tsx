import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart } from "lucide-react";
import type { ColorProfile } from "@/lib/quiz/types";

interface OutfitDetailModalProps {
  outfit: any | null;
  onClose: () => void;
  onToggleFav: (id: string) => void;
  favs: string[];
  allOutfits: any[];
  archetypeName: string;
  activeColorProfile: ColorProfile;
  colorProfile: ColorProfile | null;
}

export function OutfitDetailModal({
  outfit,
  onClose,
  onToggleFav,
  favs,
  allOutfits,
  archetypeName,
  activeColorProfile,
  colorProfile,
}: OutfitDetailModalProps) {
  if (!outfit) return null;

  const id = 'id' in outfit ? String(outfit.id) : `seed-${allOutfits.indexOf(outfit)}`;
  const isFav = favs.includes(id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="outfit-detail-title"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--color-surface)] rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 id="outfit-detail-title" className="text-3xl font-bold mb-2">
                {'name' in outfit ? outfit.name : 'Outfit Details'}
              </h3>
              <p className="text-[var(--color-muted)]">
                Perfect voor {archetypeName.toLowerCase()} stijl
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--ff-color-neutral-100)] transition-colors"
              aria-label="Sluit modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {outfit && 'image' in outfit && outfit.image && (
            <div className="mb-6 rounded-2xl overflow-hidden">
              <img
                src={outfit.image}
                alt={'name' in outfit ? outfit.name : 'Outfit'}
                className="w-full h-auto"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg mb-2">Waarom dit outfit?</h4>
              <p className="text-[var(--color-text)]">
                Dit outfit is speciaal voor jou samengesteld op basis van je stijlvoorkeuren en kleurprofiel.
                De combinatie past perfect bij {archetypeName.toLowerCase()} en benadrukt jouw unieke style DNA.
              </p>
            </div>

            {colorProfile && (
              <div>
                <h4 className="font-semibold text-lg mb-2">Kleuradvies</h4>
                <p className="text-[var(--color-text)]">
                  Gebaseerd op jouw kleurprofiel "{activeColorProfile.paletteName}" hebben we kleuren gekozen die goed bij jouw huidskleur en ondertoon passen.
                </p>
              </div>
            )}

            {'products' in outfit && outfit.products && outfit.products.length > 0 && (
              <div>
                <h4 className="font-semibold text-lg mb-3">Producten in dit outfit</h4>
                <div className="space-y-2">
                  {outfit.products.map((product: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-[var(--color-bg)] rounded-lg">
                      <div className="w-16 h-16 bg-[var(--ff-color-neutral-200)] rounded-lg overflow-hidden flex-shrink-0">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {product.name || `Product ${idx + 1}`}
                        </p>
                        {product.brand && (
                          <p className="text-xs text-[var(--color-muted)]">{product.brand}</p>
                        )}
                      </div>
                      {product.price && (
                        <div className="text-right">
                          <p className="font-semibold">€{product.price}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => onToggleFav(id)}
              className="flex-1 px-6 py-3 bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] rounded-xl font-semibold hover:bg-[var(--ff-color-primary-200)] transition-colors flex items-center justify-center gap-2"
              aria-label={isFav ? "Verwijder uit favorieten" : "Bewaar outfit in favorieten"}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
              {isFav ? 'Verwijderd' : 'Bewaar outfit'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[var(--ff-color-neutral-100)] text-[var(--color-text)] rounded-xl font-semibold hover:bg-[var(--ff-color-neutral-200)] transition-colors"
            >
              Sluiten
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
