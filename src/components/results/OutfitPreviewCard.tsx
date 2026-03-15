import React from "react";
import { ArrowRight } from "lucide-react";
import { LazyImage } from "@/components/ui/LazyImage";

interface OutfitPreviewProduct {
  id: string;
  name: string;
  brand?: string;
  imageUrl: string;
  productUrl?: string;
  affiliateUrl?: string;
}

interface OutfitPreviewPiece {
  type: string;
  label: string;
  color: string;
}

export interface OutfitPreviewCardProps {
  id: string;
  title: string;
  description: string;
  products: OutfitPreviewProduct[];
  pieces?: OutfitPreviewPiece[];
  onShopClick?: () => void;
}

/* Colour fallback for seed outfits that lack product images */
const PIECE_TYPE_COLORS: Record<string, string> = {
  top: "#D4A98C",
  bottom: "#8B7B6B",
  shoes: "#6B5B4B",
  accessory: "#C2654A",
};

function PieceColorGrid({ pieces }: { pieces: OutfitPreviewPiece[] }) {
  const items = pieces.slice(0, 4);
  const cols = items.length <= 1 ? 1 : 2;

  return (
    <div
      className={`grid h-full w-full ${cols === 2 ? "grid-cols-2" : "grid-cols-1"}`}
    >
      {items.map((piece, i) => (
        <div
          key={i}
          className="flex items-center justify-center"
          style={{
            backgroundColor: piece.color || PIECE_TYPE_COLORS[piece.type] || "#F5F0EB",
          }}
        >
          <span className="text-white/70 text-xs font-medium uppercase tracking-wider">
            {piece.label}
          </span>
        </div>
      ))}
      {/* Fill empty slots for a 2x2 grid */}
      {cols === 2 &&
        items.length < 4 &&
        Array.from({ length: 4 - items.length }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-[#F5F0EB]" />
        ))}
    </div>
  );
}

function ProductImageGrid({ products }: { products: OutfitPreviewProduct[] }) {
  const items = products.filter((p) => p.imageUrl).slice(0, 4);
  const count = items.length;

  if (count === 0) return null;

  if (count === 1) {
    return (
      <div className="h-full w-full">
        <LazyImage
          src={items[0].imageUrl}
          alt={items[0].name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`grid h-full w-full ${count <= 2 ? "grid-cols-2" : "grid-cols-2 grid-rows-2"}`}
    >
      {items.map((product) => (
        <div key={product.id} className="overflow-hidden">
          <LazyImage
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      {count === 3 && <div className="bg-[#F5F0EB]" />}
    </div>
  );
}

function EmptyFallback() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-[#F5F0EB] to-[#E8DDD4] flex items-center justify-center">
      <span className="text-[#C2654A]/30 text-5xl font-serif italic select-none">
        F
      </span>
    </div>
  );
}

export function OutfitPreviewCard({
  title,
  description,
  products,
  pieces,
  onShopClick,
}: OutfitPreviewCardProps) {
  const hasProductImages = products.some((p) => p.imageUrl);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E5E5] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:border-[#C2654A] transition-all duration-300 flex flex-col group">
      {/* Image area — ~65% of card height */}
      <div className="aspect-[3/4] overflow-hidden bg-[#F5F0EB]">
        {hasProductImages ? (
          <ProductImageGrid products={products} />
        ) : pieces && pieces.length > 0 ? (
          <PieceColorGrid pieces={pieces} />
        ) : (
          <EmptyFallback />
        )}
      </div>

      {/* Text area */}
      <div className="p-5 flex flex-col gap-1.5 flex-1">
        <h3
          className="text-lg text-[#1A1A1A] leading-snug"
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontStyle: "italic",
          }}
        >
          {title}
        </h3>

        {description && (
          <p className="text-sm text-[#8A8A8A] line-clamp-1">{description}</p>
        )}

        {onShopClick && (
          <button
            onClick={onShopClick}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#C2654A] hover:text-[#A8513A] transition-colors duration-200 self-start"
          >
            Shop deze look
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
