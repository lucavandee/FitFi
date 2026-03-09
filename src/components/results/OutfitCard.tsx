import React, { useState } from "react";
import SmartImage from "@/components/ui/SmartImage";
import { useInView } from "@/hooks/useInView";
import SaveButton from "@/components/outfits/SaveButton";
import ProductDetailModal from "@/components/outfits/ProductDetailModal";
import { ShoppingBag } from "lucide-react";
import type { Outfit } from "@/engine/types";
import { track } from "@/utils/telemetry";

interface OutfitCardProps {
  title: string;
  description: string[];
  images: string[];
  shopLink?: string;
  className?: string;
  outfit?: Outfit;
  userId?: string;
  rationaleTag?: string;
  budgetMax?: number;
}

const OutfitCard: React.FC<OutfitCardProps> = ({
  title,
  description,
  images,
  shopLink,
  className = "",
  outfit,
  userId,
  rationaleTag,
  budgetMax,
}) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const gridImages = [...images];
  while (gridImages.length < 4) {
    gridImages.push("/images/fallbacks/default.jpg");
  }

  const overBudgetProducts = budgetMax && outfit?.products
    ? outfit.products.filter(p => p.price !== undefined && p.price > budgetMax * 1.1)
    : [];
  const isOverBudget = overBudgetProducts.length > 0;

  const handleProductClick = (product: any) => {
    track('product_click', { product_id: product?.id });
    setSelectedProduct(product);
  };

  return (
    <article
      ref={ref}
      className={`group rounded-2xl bg-[var(--color-surface)] overflow-hidden transition-all duration-300 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
      style={{ boxShadow: '0 1px 3px rgba(30,35,51,0.06), 0 4px 16px rgba(30,35,51,0.06)' }}
    >
      {/* Image grid */}
      <div className="grid grid-cols-2 gap-0.5 bg-[var(--color-bg)]">
        <div className="relative col-span-1 row-span-1 aspect-[3/4]">
          <SmartImage
            className="w-full h-full object-cover"
            src={gridImages[0]}
            alt={title}
            loading="lazy"
            decoding="async"
          />
          {/* Match score */}
          {outfit?.matchScore && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-[var(--ff-color-success-600)] text-white leading-none">
                {Math.round(outfit.matchScore)}%
              </span>
            </div>
          )}
        </div>
        <div className="grid grid-rows-3 gap-0.5">
          {[gridImages[1], gridImages[2], gridImages[3]].map((src, i) => (
            <div key={i} className="relative overflow-hidden">
              <SmartImage
                className="w-full h-full object-cover aspect-square"
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-bold text-[var(--color-text)] leading-snug flex-1 line-clamp-2">
            {title}
          </h3>
          {outfit && (
            <SaveButton outfit={outfit} userId={userId} className="flex-shrink-0 -mt-0.5" />
          )}
        </div>

        {isOverBudget && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--ff-color-warning-600)] text-white mb-2">
            Boven budget
          </span>
        )}

        {rationaleTag && (
          <p className="text-xs text-[var(--color-muted)] mb-2.5 leading-snug">
            {rationaleTag}
          </p>
        )}

        {/* Description bullets */}
        {description.length > 0 && (
          <ul className="space-y-1 mb-3">
            {description.slice(0, 2).map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-xs text-[var(--color-muted)]">
                <span className="w-1 h-1 rounded-full bg-[var(--ff-color-primary-400)] mt-1.5 flex-shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        )}

        {/* Products */}
        {outfit?.products && outfit.products.length > 0 ? (
          <div className="grid grid-cols-2 gap-1.5">
            {outfit.products.slice(0, 4).map((product, idx) => (
              <button
                key={idx}
                onClick={() => handleProductClick(product)}
                className="flex items-center gap-1.5 px-2.5 py-2 bg-[var(--color-bg)] hover:bg-[var(--ff-color-primary-50)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] rounded-xl transition-all text-left"
              >
                <ShoppingBag className="w-3 h-3 text-[var(--color-muted)] flex-shrink-0" />
                <span className="text-xs text-[var(--color-text)] truncate leading-tight">{product.name}</span>
              </button>
            ))}
          </div>
        ) : shopLink ? (
          <a
            href={shopLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-700)] transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Shop vergelijkbare items
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] cursor-default select-none">
            <ShoppingBag className="w-3.5 h-3.5 opacity-40" aria-hidden="true" />
            Nog geen shoplinks beschikbaar
          </span>
        )}
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </article>
  );
};

export default OutfitCard;
