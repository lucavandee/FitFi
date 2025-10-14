import React, { useState } from "react";
import SmartImage from "@/components/media/SmartImage";
import { useInView } from "@/hooks/useInView";
import SaveButton from "@/components/outfits/SaveButton";
import ProductDetailModal from "@/components/outfits/ProductDetailModal";
import { ShoppingBag, ExternalLink, Sparkles } from "lucide-react";
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
}

const OutfitCard: React.FC<OutfitCardProps> = ({
  title,
  description,
  images,
  shopLink = "#shop",
  className = "",
  outfit,
  userId
}) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Ensure we have 4 images for the 2x2 grid
  const gridImages = [...images];
  while (gridImages.length < 4) {
    gridImages.push("/images/outfit-fallback.jpg");
  }

  return (
    <article 
      ref={ref} 
      className={`res-card ${inView ? 'in' : ''} ${className}`}
    >
      <div className="res-img-grid">
        <div style={{ position: 'relative' }}>
          <SmartImage
            className="res-img"
            src={gridImages[0]}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <span className="res-overlay" aria-hidden="true"></span>

          {/* Match score badge */}
          {outfit && outfit.matchScore && (
            <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10 }}>
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-full text-xs font-semibold shadow-lg">
                <Sparkles className="w-3 h-3" />
                <span>{Math.round(outfit.matchScore)}% match</span>
              </div>
            </div>
          )}

          {outfit && (
            <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
              <SaveButton outfit={outfit} userId={userId} />
            </div>
          )}
        </div>
        <SmartImage 
          className="res-img" 
          src={gridImages[1]} 
          alt="" 
          loading="lazy"
          decoding="async"
        />
        <SmartImage 
          className="res-img" 
          src={gridImages[2]} 
          alt="" 
          loading="lazy"
          decoding="async"
        />
        <SmartImage 
          className="res-img" 
          src={gridImages[3]} 
          alt="" 
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="res-card-footer">
        <h3>{title}</h3>
        <ul className="res-bullets">
          {description.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        {outfit?.products && outfit.products.length > 0 ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {outfit.products.slice(0, 4).map((product, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedProduct(product)}
                  className="
                    flex items-center gap-2 px-3 py-2
                    bg-[var(--color-bg)] hover:bg-[var(--ff-color-primary-50)]
                    border border-[var(--color-border)]
                    rounded-lg transition-all
                    text-sm text-left
                  "
                >
                  <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{product.name}</span>
                </button>
              ))}
            </div>
            {outfit.products.length > 4 && (
              <p className="text-xs text-[var(--color-text)]/60 text-center">
                +{outfit.products.length - 4} meer items
              </p>
            )}
          </div>
        ) : (
          <a className="res-shoplink" href={shopLink}>
            Shop vergelijkbare items
          </a>
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