import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Share2, Sparkles, ExternalLink, ShoppingBag } from "lucide-react";
import { StyleDNAMatchBadge } from "../outfits/StyleDNAMatchBadge";
import toast from "react-hot-toast";
import { NavLink } from "react-router-dom";

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

                    {/* Products List - Shoppable */}
                    <div className="flex-1 overflow-y-auto mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-[var(--color-text)]">
                          Items in deze outfit
                        </h3>
                        <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          Klik om te shoppen
                        </span>
                      </div>
                      <div className="space-y-3">
                        {outfit.products.map((product, i) => {
                          const shopUrl = product.affiliate_url || product.product_url || product.url;
                          const hasShopUrl = !!shopUrl;

                          return (
                            <motion.div
                              key={i}
                              whileHover={hasShopUrl ? { scale: 1.02, x: 4 } : {}}
                              className={`
                                flex items-center gap-3 p-3 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] transition-all
                                ${hasShopUrl ? "hover:border-[var(--ff-color-primary-400)] hover:shadow-md cursor-pointer" : ""}
                              `}
                              onClick={() => {
                                if (hasShopUrl) {
                                  window.open(shopUrl, "_blank", "noopener,noreferrer");
                                  toast.success("Product opent in nieuw tabblad", {
                                    icon: "🛍️",
                                    duration: 2000,
                                  });
                                }
                              }}
                            >
                              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)] flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl font-bold">{i + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-[var(--color-text)] truncate">
                                  {product.name || product.category || "Product"}
                                </h4>
                                <p className="text-sm text-[var(--color-text-muted)] truncate">
                                  {product.brand || "Fashion Brand"}
                                  {product.price && (
                                    <span className="ml-2 font-semibold text-[var(--ff-color-primary-700)]">
                                      €{typeof product.price === "number" ? product.price.toFixed(2) : product.price}
                                    </span>
                                  )}
                                </p>
                              </div>
                              {hasShopUrl && (
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--ff-color-primary-600)] text-white flex items-center justify-center hover:bg-[var(--ff-color-primary-700)] transition-colors"
                                >
                                  <ShoppingBag className="w-5 h-5" />
                                </motion.div>
                              )}
                              {!hasShopUrl && (
                                <div className="flex-shrink-0 px-3 py-1.5 bg-gray-100 text-gray-500 text-xs rounded-lg">
                                  Binnenkort
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Helper Text */}
                    <div className="text-xs text-[var(--color-text-muted)] text-center mb-3 flex items-center justify-center gap-2">
                      <Heart className="w-3 h-3" />
                      Opgeslagen outfits vind je terug in je Dashboard
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onSave?.();
                          if (!isSaved) {
                            toast.success(
                              (t) => (
                                <div className="flex items-center gap-3">
                                  <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                                  <div>
                                    <p className="font-semibold">Outfit opgeslagen!</p>
                                    <NavLink
                                      to="/dashboard"
                                      onClick={() => toast.dismiss(t.id)}
                                      className="text-sm text-[var(--ff-color-primary-600)] hover:underline"
                                    >
                                      Bekijk in Dashboard →
                                    </NavLink>
                                  </div>
                                </div>
                              ),
                              {
                                duration: 5000,
                                style: {
                                  background: "var(--color-surface)",
                                  color: "var(--color-text)",
                                  border: "1px solid var(--color-border)",
                                },
                              }
                            );
                          }
                        }}
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
                        {isSaved ? "Opgeslagen" : "Bewaar outfit"}
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
