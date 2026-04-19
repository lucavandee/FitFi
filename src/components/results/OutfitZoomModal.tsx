import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Share2, Sparkles, ShoppingBag, CircleAlert as AlertCircle } from "lucide-react";
import { StyleDNAMatchBadge } from "../outfits/StyleDNAMatchBadge";
import toast from "react-hot-toast";
import { NavLink } from "react-router-dom";
import { openProductLink, resolveProductUrl } from "@/utils/affiliate";

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
                className="relative w-full max-w-6xl bg-[#FFFFFF] rounded-2xl shadow-2xl overflow-hidden"
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
                    <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-[#FAF5F2] to-[#FAF5F2] border-2 border-[#E5E5E5] overflow-hidden">
                      {/* Product Grid */}
                      <div className="absolute inset-0 p-4 flex items-center justify-center">
                        <div className="w-full h-full flex flex-col gap-2">
                          {outfit.products.slice(0, 4).map((product, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm flex items-center justify-center"
                            >
                              <span className="text-sm text-[#8A8A8A] font-medium">
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
                      <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                        {outfit.name || `Outfit #${outfit.id.substring(0, 8)}`}
                      </h2>

                      {/* Style Tags */}
                      {outfit.style_tags && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {outfit.style_tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-[#FAF5F2] text-[#A8513A] rounded-full text-sm font-semibold"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-[#8A8A8A]">
                        {outfit.products.length} items · {matchScore}% match met jouw stijl
                      </p>
                    </div>

                    {/* Explanation */}
                    {outfit.explanation && (
                      <div className="mb-6 p-4 bg-[#FAF5F2] border border-[#F4E8E3] rounded-xl">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-[#C2654A] flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-semibold text-[#5A2010] mb-1">
                              Waarom deze combinatie?
                            </h3>
                            <p className="text-sm text-[#8A3D28] leading-relaxed">
                              {outfit.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Products List - Shoppable */}
                    <div className="flex-1 overflow-y-auto mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-[#1A1A1A]">
                          Items in deze outfit
                        </h3>
                        <span className="text-xs text-[#8A8A8A] flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          Klik om te shoppen
                        </span>
                      </div>
                      <div className="space-y-3">
                        {outfit.products.map((product, i) => {
                          const hasShopUrl = !!resolveProductUrl(product);

                          return (
                            <motion.div
                              key={i}
                              whileHover={hasShopUrl ? { scale: 1.02, x: 4 } : {}}
                              className={`
                                flex items-center gap-3 p-3 bg-[#FAFAF8] rounded-lg border border-[#E5E5E5] transition-all
                                ${hasShopUrl ? "hover:border-[#D4856E] hover:shadow-md cursor-pointer" : ""}
                              `}
                              onClick={async () => {
                                if (!hasShopUrl) return;
                                const opened = await openProductLink({
                                  product: { id: product.id || `p-${i}`, name: product.name, retailer: product.brand, price: product.price, ...product },
                                  outfitId: outfit.id,
                                  slot: i + 1,
                                  source: "outfit_zoom_modal",
                                });
                                if (opened) {
                                  toast.success("Product opent in nieuw tabblad", { duration: 2000 });
                                }
                              }}
                            >
                              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#FAF5F2] to-[#FAF5F2] flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl font-bold text-[#D4856E]">{i + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-[#1A1A1A] truncate">
                                  {product.name || product.category || "Product"}
                                </h4>
                                <p className="text-sm text-[#8A8A8A] truncate">
                                  {product.brand || product.retailer || ""}
                                  {product.price && (
                                    <span className="ml-2 font-semibold text-[#A8513A]">
                                      €{typeof product.price === "number" ? product.price.toFixed(2) : product.price}
                                    </span>
                                  )}
                                </p>
                              </div>
                              {hasShopUrl ? (
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#C2654A] text-white flex items-center justify-center hover:bg-[#A8513A] transition-colors"
                                >
                                  <ShoppingBag className="w-5 h-5" />
                                </motion.div>
                              ) : (
                                <div className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-[#FAFAF8] text-[#8A8A8A] border border-[#E5E5E5] text-xs rounded-lg">
                                  <AlertCircle className="w-3 h-3" />
                                  Binnenkort
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Helper Text */}
                    <div className="text-xs text-[#8A8A8A] text-center mb-3 flex items-center justify-center gap-2">
                      <Heart className="w-3 h-3" />
                      Opgeslagen outfits vind je terug in je Dashboard
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-[#E5E5E5]">
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
                                      className="text-sm text-[#C2654A] hover:underline"
                                    >
                                      Bekijk in Dashboard →
                                    </NavLink>
                                  </div>
                                </div>
                              ),
                              {
                                duration: 5000,
                                style: {
                                  background: "#FFFFFF",
                                  color: "#1A1A1A",
                                  border: "1px solid #E5E5E5",
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
                              : "bg-[#A8513A] text-white hover:bg-[#C2654A]"
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
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#FFFFFF] border-2 border-[#E5E5E5] text-[#1A1A1A] rounded-xl font-semibold hover:border-[#D4856E] transition-all"
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
