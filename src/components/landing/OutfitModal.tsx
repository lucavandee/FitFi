import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OutfitProduct {
  name: string;
  image: string;
  category: string;
}

interface OutfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  completeImage: string;
  products: OutfitProduct[];
}

export function OutfitModal({ isOpen, onClose, title, completeImage, products }: OutfitModalProps) {
  // Keyboard ESC to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[var(--color-surface)] rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-[var(--color-bg)] hover:bg-[var(--ff-color-neutral-200)] transition-colors flex items-center justify-center"
                  aria-label="Sluit modal"
                >
                  <X className="w-5 h-5 text-[var(--color-text)]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 lg:p-10">
                {/* Complete Look */}
                <div className="mb-8 sm:mb-10">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 text-[var(--color-text)]">Complete look</h3>
                  <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg">
                    <img
                      src={completeImage}
                      alt="Complete outfit flatlay"
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Individual Products */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-[var(--color-text)]">
                    Dit outfit bestaat uit
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                    {products.map((product, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group bg-[var(--color-bg)] rounded-xl sm:rounded-2xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] transition-all shadow-sm hover:shadow-lg"
                      >
                        <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3 sm:p-4">
                          <div className="text-[10px] sm:text-xs uppercase tracking-wider text-[var(--color-muted)] font-bold mb-1">
                            {product.category}
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-[var(--color-text)] line-clamp-2">
                            {product.name}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 sm:mt-10 p-5 sm:p-6 bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] rounded-xl sm:rounded-2xl">
                  <p className="text-xs sm:text-sm text-[var(--color-muted)] text-center leading-relaxed max-w-2xl mx-auto">
                    <span className="font-semibold text-[var(--color-text)]">Let op:</span> Dit is een voorbeeld. Jouw persoonlijke Style Report bevat outfits op basis van <span className="font-semibold text-[var(--color-text)]">jouw voorkeuren en stijl</span>.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
