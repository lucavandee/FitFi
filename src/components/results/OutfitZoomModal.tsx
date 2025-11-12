import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Share2, Sparkles, ExternalLink, ShoppingBag } from "lucide-react";
import { StyleDNAMatchBadge } from "../outfits/StyleDNAMatchBadge";

interface OutfitZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfit: {
    id: string;
    name?: string;
    products: any[];
    match_score?: number;
    style_tags?: string[];
    color_harmony?: string[];
    explanation?: string;
  } | null;
  onSave?: () => void;
  onShare?: () => void;
  onExplain?: () => void;
  isSaved?: boolean;
}

export function OutfitZoomModal({
  isOpen,
  onClose,
  outfit,
  onSave,
  onShare,
  onExplain,
  isSaved = false,
}: OutfitZoomModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!outfit) return null;

  const matchScore = outfit.match_score || Math.floor(75 + Math.random() * 20);

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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-6xl bg-[var(--color-surface)] rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="grid md:grid-cols-2 gap-6 p-6">
                  {/* Left: Outfit Visual */}
                  <div className="relative">
                    <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] border-2 border-[var(--color-border)] overflow-hidden">
                      {/* Product Grid */}
                      <div className="absolute inset-0 p-4 flex items-center justify-center">
                        <div className="w-full h-full flex flex-col gap-2">
                          {outfit.products.slice(0, 4).map((product, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm flex items-center justify-center"
                            >
                              <span className="text-sm text-[var(--color-text-muted)] font-medium">
                                {product.category || "Product"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Match Badge */}
                      <div className="absolute top-4 left-4">
                        <StyleDNAMatchBadge score={matchScore} size="lg" />
                      </div>

                      {/* Color Dots */}
                      {outfit.color_harmony && (
                        <div className="absolute bottom-4 left-4 flex gap-2">
                          {outfit.color_harmony.map((color, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Details & Actions */}
                  <div className="flex flex-col">
                    {/* Header */}
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-[var(--color-text)] mb-2">
                        {outfit.name || `Outfit #${outfit.id.substring(0, 8)}`}
                      </h2>

                      {/* Style Tags */}
                      {outfit.style_tags && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {outfit.style_tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] rounded-full text-sm font-semibold"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-[var(--color-text-muted)]">
                        {outfit.products.length} items · {matchScore}% match met jouw stijl
                      </p>
                    </div>

                    {/* Explanation */}
                    {outfit.explanation && (
                      <div className="mb-6 p-4 bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] rounded-xl">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)] flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-semibold text-[var(--ff-color-primary-900)] mb-1">
                              Waarom deze combinatie?
                            </h3>
                            <p className="text-sm text-[var(--ff-color-primary-800)] leading-relaxed">
                              {outfit.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Products List */}
                    <div className="flex-1 overflow-y-auto mb-6">
                      <h3 className="font-semibold text-[var(--color-text)] mb-3">
                        Items in deze outfit
                      </h3>
                      <div className="space-y-3">
                        {outfit.products.map((product, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] transition-colors"
                          >
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)] flex items-center justify-center">
                              <span className="text-2xl">{i + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-[var(--color-text)]">
                                {product.name || product.category || "Product"}
                              </h4>
                              <p className="text-sm text-[var(--color-text-muted)]">
                                {product.brand || "Fashion Brand"}
                              </p>
                            </div>
                            <button className="p-2 text-[var(--ff-color-primary-600)] hover:bg-[var(--ff-color-primary-50)] rounded-lg transition-colors">
                              <ExternalLink className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onSave}
                        className={`
                          flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-md
                          ${
                            isSaved
                              ? "bg-pink-500 text-white hover:bg-pink-600"
                              : "bg-[var(--ff-color-primary-700)] text-white hover:bg-[var(--ff-color-primary-600)]"
                          }
                        `}
                      >
                        <Heart className={`w-5 h-5 ${isSaved ? "fill-white" : ""}`} />
                        {isSaved ? "Opgeslagen" : "Opslaan"}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onShare}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-semibold hover:border-[var(--ff-color-primary-300)] transition-all"
                      >
                        <Share2 className="w-5 h-5" />
                        Delen
                      </motion.button>

                      {onExplain && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={onExplain}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all shadow-md"
                        >
                          <Sparkles className="w-5 h-5" />
                          Vraag Nova
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
