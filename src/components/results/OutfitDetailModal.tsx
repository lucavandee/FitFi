import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Heart, X, ShoppingBag } from "lucide-react";
import type { ColorProfile } from "@/lib/quiz/types";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import { openProductLink, resolveProductUrl } from "@/utils/affiliate";
import toast from "react-hot-toast";

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

  if (!outfit) return null;

  const id = outfit?.id != null ? String(outfit.id) : `seed-${allOutfits.indexOf(outfit)}`;
  const isFav = favs.includes(id);
  const outfitName = outfit?.name || outfit?.title || "Outfit";
  const products: any[] = Array.isArray(outfit?.products) ? outfit.products : [];
  const heroImage = getOutfitHeroImage(outfit);

  const totalPrice = products.reduce((sum: number, p: any) => {
    const price = typeof p?.price === "number" ? p.price : parseFloat(String(p?.price ?? "")) || 0;
    return sum + price;
  }, 0);

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="outfit-modal-title"
      >
        <motion.div
          key="panel"
          ref={panelRef}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full sm:max-w-lg bg-[var(--color-surface)] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: "92dvh" }}
        >
          {/* Drag handle — mobile only */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-9 h-1 rounded-full bg-[var(--color-border)]" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 sm:pt-5">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--color-muted)] mb-0.5">
                {archetypeName}
              </p>
              <h2
                id="outfit-modal-title"
                className="text-lg font-bold text-[var(--color-text)] leading-snug"
              >
                {outfitName}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Sluit"
              data-modal-close
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[var(--ff-color-primary-50)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] flex-shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4 space-y-4">

            {/* Hero image */}
            {heroImage && (
              <div
                className="rounded-xl overflow-hidden bg-[var(--ff-color-primary-50)]"
                style={{ aspectRatio: "4/3" }}
              >
                <img
                  src={heroImage}
                  alt={outfitName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const parent = (e.currentTarget as HTMLImageElement).closest("div") as HTMLDivElement | null;
                    if (parent) parent.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Color advice */}
            {colorProfile && (
              <div className="rounded-xl bg-[var(--ff-color-primary-25)] border border-[var(--ff-color-primary-100)] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ff-color-primary-500)] mb-1">
                  Kleuradvies
                </p>
                <p className="text-sm text-[var(--color-text)] leading-relaxed">
                  Kleuren afgestemd op jouw kleurprofiel{" "}
                  <span className="font-semibold text-[var(--ff-color-primary-700)]">
                    {colorProfile.paletteName || colorProfile.season || ""}
                  </span>
                  .
                </p>
              </div>
            )}

            {/* Product list */}
            {products.length === 0 && (
              <div className="rounded-xl border border-[var(--color-border)] px-4 py-5 bg-[var(--ff-color-primary-25)] text-center">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-[var(--ff-color-primary-300)]" aria-hidden="true" />
                <p className="text-sm font-semibold text-[var(--color-text)] mb-1">Productlinks worden binnenkort geladen</p>
                <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                  Dit is een voorbeeld outfit op basis van jouw stijlprofiel. Maak een account aan voor directe shoplinks naar Nederlandse webshops.
                </p>
              </div>
            )}
            {products.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-sm font-bold text-[var(--color-text)]">
                    Producten in dit outfit
                  </p>
                  {totalPrice > 0 && (
                    <p className="text-sm font-semibold text-[var(--ff-color-primary-700)]">
                      €{totalPrice % 1 === 0 ? totalPrice.toFixed(0) : totalPrice.toFixed(2)} totaal
                    </p>
                  )}
                </div>

                <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                  {products.map((product: any, idx: number) => {
                    const img = getProductImage(product);
                    const url = resolveProductUrl(product);
                    const name = product?.name || `Product ${idx + 1}`;
                    const brand = product?.brand || product?.retailer || null;
                    const rawPrice = typeof product?.price === "number"
                      ? product.price
                      : parseFloat(String(product?.price ?? "")) || null;

                    return (
                      <li
                        key={idx}
                        className={`bg-[var(--color-surface)] ${url ? "cursor-pointer hover:bg-[var(--ff-color-primary-50)] transition-colors" : ""}`}
                        onClick={async () => {
                          if (!url) return;
                          const opened = await openProductLink({
                            product: { id: product?.id || `p-${idx}`, name, retailer: brand || undefined, price: rawPrice || undefined, ...product },
                            outfitId: id,
                            slot: idx + 1,
                            source: "outfit_detail_modal",
                          });
                          if (opened) toast.success(`${name} opent in nieuw tabblad`, { duration: 2000 });
                        }}
                      >
                        <div className="flex items-center gap-3 px-3 py-3">

                          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--ff-color-primary-50)] flex items-center justify-center">
                            {img ? (
                              <img
                                src={img}
                                alt={name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  const el = e.currentTarget as HTMLImageElement;
                                  el.style.display = "none";
                                  const fallback = el.nextElementSibling as HTMLElement | null;
                                  if (fallback) fallback.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <span
                              className="text-sm font-bold text-[var(--ff-color-primary-300)]"
                              style={{ display: img ? "none" : "flex" }}
                            >
                              {idx + 1}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            {brand && (
                              <p className="text-[10px] text-[var(--color-muted)] truncate leading-tight mb-0.5">
                                {brand}
                              </p>
                            )}
                            <p className="text-sm font-semibold text-[var(--color-text)] truncate leading-tight">
                              {name}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {rawPrice != null && rawPrice > 0 && (
                              <span className="text-sm font-bold text-[var(--ff-color-primary-700)]">
                                €{rawPrice % 1 === 0 ? rawPrice.toFixed(0) : rawPrice.toFixed(2)}
                              </span>
                            )}
                            {url ? (
                              <div
                                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center text-[var(--ff-color-primary-600)] hover:bg-[var(--ff-color-primary-200)] transition-colors"
                                aria-label={`Shop ${name}`}
                              >
                                <ShoppingBag className="w-4 h-4" />
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Sticky footer — altijd zichtbaar */}
          <div
            className="flex-shrink-0 px-5 pt-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]"
            style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
          >
            <div className="flex gap-3">
              <button
                onClick={() => onToggleFav(id)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.97]"
                style={{
                  background: isFav
                    ? "var(--ff-color-primary-700)"
                    : "var(--ff-color-primary-100)",
                  color: isFav ? "#fff" : "var(--ff-color-primary-700)",
                }}
                aria-label={isFav ? "Verwijder uit favorieten" : "Bewaar outfit"}
              >
                <Heart
                  className="w-4 h-4"
                  fill={isFav ? "currentColor" : "none"}
                  strokeWidth={isFav ? 0 : 2}
                />
                {isFav ? "Opgeslagen" : "Bewaar outfit"}
              </button>

              <button
                onClick={onClose}
                className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-[var(--ff-color-primary-50)] text-[var(--color-muted)] hover:bg-[var(--ff-color-primary-100)] hover:text-[var(--color-text)] transition-colors"
              >
                Sluiten
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
