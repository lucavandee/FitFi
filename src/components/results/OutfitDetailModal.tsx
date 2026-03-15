import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, ShoppingBag, ExternalLink } from "lucide-react";
import type { ColorProfile } from "@/lib/quiz/types";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import { openProductLink, resolveProductUrl } from "@/utils/affiliate";
import toast from "react-hot-toast";
import track from "@/utils/telemetry";
import { getArchetypeDisplayNL } from "@/utils/displayNames";

interface OutfitDetailModalProps {
  outfit: any | null;
  onClose: () => void;
  onToggleFav: (id: string) => void;
  favs: string[];
  allOutfits: any[];
  archetypeName: string;
  activeColorProfile: ColorProfile | null;
  colorProfile: ColorProfile | null;
}

function getProductImage(product: any): string | null {
  return product?.imageUrl || product?.image_url || product?.image || null;
}

function getOutfitHeroImage(outfit: any): string | null {
  if (outfit?.image) return outfit.image;
  if (outfit?.imageUrl) return outfit.imageUrl;
  if (Array.isArray(outfit?.products)) {
    for (const p of outfit.products) {
      const img = getProductImage(p);
      if (img) return img;
    }
  }
  return null;
}

function HeroImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div className="px-6">
      <div className="rounded-2xl overflow-hidden bg-[#F5F0EB]">
        <img
          src={src}
          alt={alt}
          className="w-full aspect-[4/3] object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </div>
    </div>
  );
}

function ProductThumb({ src, alt, index }: { src: string | null; alt: string; index: number }) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;
  return (
    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#F5F0EB] flex items-center justify-center">
      {!showFallback && (
        <img
          src={src!}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
      {showFallback && (
        <span className="text-sm font-bold text-[#C2654A]/40">
          {index + 1}
        </span>
      )}
    </div>
  );
}

export function OutfitDetailModal({
  outfit,
  onClose,
  onToggleFav,
  favs,
  allOutfits,
  archetypeName,
  colorProfile,
}: OutfitDetailModalProps) {
  const isOpen = outfit !== null;
  const panelRef = useFocusTrap(isOpen) as React.RefObject<HTMLDivElement>;
  useBodyScrollLock(isOpen);

  const shoppedRef = React.useRef(false);

  const id = outfit?.id != null ? String(outfit.id) : `seed-${allOutfits.indexOf(outfit)}`;
  const outfitName = outfit?.name || outfit?.title || "Outfit";
  const products: any[] = Array.isArray(outfit?.products) ? outfit.products : [];
  const shoppableProducts = products.filter((p: any) => resolveProductUrl(p));

  React.useEffect(() => {
    if (!isOpen || !outfit) return;
    shoppedRef.current = false;
    const outfitId = outfit?.id != null ? String(outfit.id) : `seed-${allOutfits.indexOf(outfit)}`;
    track("outfit_modal_open", {
      outfit_id: outfitId,
      outfit_title: outfit?.name || outfit?.title || "Outfit",
      archetype: archetypeName,
      match_score: (outfit as any).matchScore ?? (outfit as any).match ?? null,
      shoppable_product_count: products.filter((p: any) => resolveProductUrl(p)).length,
      total_product_count: products.length,
    });
  }, [isOpen, id]);

  const handleClose = React.useCallback(() => {
    if (!shoppedRef.current && isOpen) {
      track("modal_close_without_shop", {
        outfit_id: id,
        outfit_title: outfitName,
        archetype: archetypeName,
        shoppable_product_count: shoppableProducts.length,
      });
    }
    onClose();
  }, [isOpen, id, outfitName, archetypeName, shoppableProducts.length, onClose]);

  if (!outfit) return null;

  const isFav = favs.includes(id);
  const heroImage = getOutfitHeroImage(outfit);

  const totalPrice = products.reduce((sum: number, p: any) => {
    const price = typeof p?.price === "number" ? p.price : parseFloat(String(p?.price ?? "")) || 0;
    return sum + price;
  }, 0);

  const hasShoppable = shoppableProducts.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="outfit-modal-title"
      >
        <motion.div
          key="panel"
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[480px] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-[0_32px_80px_rgba(0,0,0,0.15)]"
          style={{ maxHeight: "90dvh" }}
        >
          {/* Drag handle — mobile only */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-9 h-1 rounded-full bg-[#E5E5E5]" />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            aria-label="Sluit"
            data-modal-close
            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-[#F5F0EB] hover:bg-[#E5E5E5] flex items-center justify-center transition-colors duration-200"
          >
            <X className="w-5 h-5 text-[#4A4A4A]" />
          </button>

          {/* Header */}
          <div className="px-6 pt-7 pb-5">
            <p className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#8A8A8A] mb-2">
              {getArchetypeDisplayNL(archetypeName)}
            </p>
            <h2
              id="outfit-modal-title"
              className="text-2xl font-bold text-[#1A1A1A]"
            >
              {outfitName}
            </h2>
          </div>

          {/* Scrollable body */}
          <div
            className="relative flex-1 overflow-y-auto"
            style={{ scrollBehavior: 'smooth', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
          >

            {heroImage && (
              <HeroImage src={heroImage} alt={outfitName} />
            )}

            {/* Color advice */}
            {colorProfile && (
              <div className="mx-6 mt-6 mb-7 bg-[#F5F0EB] border border-[#E5E5E5] rounded-xl p-5">
                <p className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#C2654A] mb-1.5">
                  Kleuradvies
                </p>
                <p className="text-sm text-[#4A4A4A] leading-[1.5]">
                  {(() => {
                    const profileLabel = colorProfile.paletteName || colorProfile.season;
                    return profileLabel ? (
                      <>
                        Kleuren afgestemd op jouw kleurprofiel{" "}
                        <span className="font-semibold text-[#1A1A1A]">
                          {profileLabel}
                        </span>
                        .
                      </>
                    ) : (
                      "Kleuren afgestemd op jouw persoonlijke kleurprofiel."
                    );
                  })()}
                </p>
              </div>
            )}

            {/* Product list — empty state */}
            {products.length === 0 && (
              <div className="mx-6 mb-6 rounded-xl border border-[#E5E5E5] px-4 py-5 bg-[#F5F0EB] text-center">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-[#C2654A]/40" aria-hidden="true" />
                <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Productlinks worden binnenkort geladen</p>
                <p className="text-xs text-[#8A8A8A] leading-relaxed">
                  Dit is een voorbeeld outfit op basis van jouw stijlprofiel. Maak een account aan voor directe shoplinks naar Nederlandse webshops.
                </p>
              </div>
            )}

            {/* Product list */}
            {products.length > 0 && (
              <div>
                <div className="px-6 flex items-center justify-between mb-5 pb-1 border-b border-[#E5E5E5]">
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    Producten in dit outfit
                  </p>
                  {totalPrice > 0 && (
                    <p className="text-sm font-bold text-[#1A1A1A]">
                      €{totalPrice % 1 === 0 ? totalPrice.toFixed(0) : totalPrice.toFixed(2)} totaal
                    </p>
                  )}
                </div>

                <div>
                  {products.map((product: any, idx: number) => {
                    const img = getProductImage(product);
                    const url = resolveProductUrl(product);
                    const name = product?.name || `Product ${idx + 1}`;
                    const brand = product?.brand || product?.retailer || null;
                    const rawPrice = typeof product?.price === "number"
                      ? product.price
                      : parseFloat(String(product?.price ?? "")) || null;

                    return (
                      <div
                        key={idx}
                        className={`px-6 py-4 flex items-center gap-4 border-b border-[#E5E5E5]/50 last:border-none transition-colors duration-150 ${url ? "cursor-pointer hover:bg-[#FAFAF8]" : ""}`}
                        onClick={async () => {
                          if (!url) return;
                          shoppedRef.current = true;
                          track("product_shop_click", {
                            outfit_id: id,
                            outfit_title: outfitName,
                            archetype: archetypeName,
                            product_name: name,
                            product_brand: brand ?? null,
                            product_price: rawPrice ?? null,
                            product_slot: idx + 1,
                            source: "modal",
                          });
                          const opened = await openProductLink({
                            product: { id: product?.id || `p-${idx}`, name, retailer: brand || undefined, price: rawPrice || undefined, ...product },
                            outfitId: id,
                            slot: idx + 1,
                            source: "outfit_detail_modal",
                          });
                          if (opened) toast.success(`${name} opent in nieuw tabblad`, { duration: 2000 });
                        }}
                      >
                        <ProductThumb src={img} alt={name} index={idx} />

                        <div className="flex-1 min-w-0">
                          {brand && (
                            <p className="text-[11px] font-medium text-[#8A8A8A] mb-0.5 truncate">
                              {brand}
                            </p>
                          )}
                          <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                            {name}
                          </p>
                          {product?.itemReason && (
                            <p className="text-[11px] text-[#C2654A] mt-0.5 line-clamp-1">
                              {product.itemReason}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {rawPrice != null && rawPrice > 0 && (
                            <span className="text-sm font-bold text-[#1A1A1A] mr-2">
                              €{rawPrice % 1 === 0 ? rawPrice.toFixed(0) : rawPrice.toFixed(2)}
                            </span>
                          )}
                          {url ? (
                            <div
                              className="w-9 h-9 rounded-full bg-[#F5F0EB] hover:bg-[#F4E8E3] flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                              aria-label={`Shop ${name}`}
                            >
                              <ExternalLink className="w-4 h-4 text-[#C2654A]" />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom spacing */}
            <div className="h-4" />

            {/* Scroll fade indicator */}
            <div className="bg-gradient-to-t from-white via-white/80 to-transparent h-20 sticky bottom-0 pointer-events-none" />
          </div>

          {/* Sticky footer */}
          <div
            className="sticky bottom-0 bg-white border-t border-[#E5E5E5] px-6 pt-4 pb-5 flex items-center gap-3"
            style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
          >
            {hasShoppable ? (
              <button
                onClick={async () => {
                  shoppedRef.current = true;
                  track("shop_all_click", {
                    outfit_id: id,
                    outfit_title: outfitName,
                    archetype: archetypeName,
                    shoppable_product_count: shoppableProducts.length,
                    source: "modal_footer",
                  });
                  for (let i = 0; i < shoppableProducts.length; i++) {
                    const p = shoppableProducts[i];
                    const name = p?.name || `Product ${i + 1}`;
                    setTimeout(async () => {
                      await openProductLink({
                        product: { id: p?.id || `p-${i}`, name, retailer: p?.brand || p?.retailer || undefined, price: p?.price || undefined, ...p },
                        outfitId: id,
                        slot: i + 1,
                        source: "outfit_detail_modal_shop_all",
                      });
                    }, i * 400);
                  }
                  toast.success(`${shoppableProducts.length} items openen...`, { duration: 2500 });
                }}
                className="flex-1 bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-4 rounded-full text-center inline-flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(194,101,74,0.25)]"
                aria-label={`Shop ${shoppableProducts.length} items`}
              >
                <ShoppingBag className="w-4 h-4" />
                Bekijk alle items
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                  {shoppableProducts.length}
                </span>
              </button>
            ) : (
              <button
                onClick={() => onToggleFav(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                  isFav
                    ? "bg-[#C2654A] text-white hover:bg-[#A8513A]"
                    : "bg-[#F4E8E3] text-[#C2654A] hover:bg-[#F5F0EB]"
                }`}
                aria-label={isFav ? "Verwijder uit favorieten" : "Bewaar outfit"}
              >
                <Heart className="w-4 h-4" fill={isFav ? "currentColor" : "none"} strokeWidth={isFav ? 0 : 2} />
                {isFav ? "Opgeslagen" : "Bewaar outfit"}
              </button>
            )}

            {hasShoppable && (
              <button
                onClick={() => onToggleFav(id)}
                className={`w-14 h-14 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  isFav
                    ? "border-[#C2654A] bg-[#F4E8E3]"
                    : "border-[#E5E5E5] hover:border-[#C2654A] hover:bg-[#F4E8E3]"
                }`}
                aria-label={isFav ? "Verwijder uit favorieten" : "Bewaar outfit"}
              >
                <Heart className={`w-5 h-5 ${isFav ? "fill-[#C2654A] text-[#C2654A]" : "text-[#8A8A8A]"}`} strokeWidth={isFav ? 0 : 2} />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
