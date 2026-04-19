import React from "react";
import { ExternalLink, ShoppingBag } from "lucide-react";
import ImageWithFallback from "@/components/media/ImageWithFallback";
import type { Product } from "@/types/product";
import { resolveProductUrl, openProductLink } from "@/utils/affiliate";
import toast from "react-hot-toast";

interface ProductRailProps {
  items: Product[];
  loading?: boolean;
}

function ProductSkeleton() {
  return (
    <div className="flex-shrink-0 w-48 bg-[#FFFFFF] rounded-xl border border-[#E5E5E5] overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-[#FAF5F2]" />
      <div className="p-2">
        <div className="h-4 bg-[#FAF5F2] rounded w-32 mb-1" />
        <div className="h-3 bg-[#FAF5F2] rounded w-24" />
      </div>
    </div>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const title = product.title || (product as any).name || "Product";
  const brand = product.brand || product.retailer || "";
  const rawPrice =
    (product as any).price?.current ??
    (product as any).price ??
    (product as any).price_eur ??
    null;
  const price = typeof rawPrice === "number" ? rawPrice : parseFloat(String(rawPrice ?? "")) || null;
  const hasUrl = !!resolveProductUrl(product as any);

  const handleClick = async () => {
    if (!hasUrl) return;
    const opened = await openProductLink({
      product: {
        id: product.id,
        name: title,
        retailer: brand || undefined,
        price: price || undefined,
        ...(product as any),
      },
      slot: index + 1,
      source: "nova_product_rail",
    });
    if (opened) {
      toast.success(`${title} opent in nieuw tabblad`, { duration: 2000 });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!hasUrl}
      className={`flex-shrink-0 w-48 bg-[#FFFFFF] rounded-xl border border-[#E5E5E5] overflow-hidden text-left transition-all ${
        hasUrl ? "cursor-pointer hover:shadow-sm hover:-translate-y-0.5" : "opacity-60 cursor-default"
      }`}
    >
      <ImageWithFallback src={(product as any).image_url || product.imageUrl || (product as any).image} alt={title} ratio="portrait" />
      <div className="p-2">
        <div className="text-sm font-medium text-[#1A1A1A] line-clamp-2">{title}</div>
        <div className="mt-1 flex items-center justify-between">
          <div className="text-[13px] text-[#8A8A8A]">{brand}</div>
          {price != null && price > 0 && (
            <div className="text-[13px] font-semibold text-[#A8513A]">
              €{price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)}
            </div>
          )}
        </div>
        {hasUrl && (
          <div className="mt-2 flex items-center gap-2 text-[12px] text-[#C2654A]">
            <ShoppingBag size={14} />
            <span>Shop nu</span>
            <ExternalLink size={14} className="ml-auto opacity-70" />
          </div>
        )}
      </div>
    </button>
  );
}

export default function ProductRail({ items, loading }: ProductRailProps) {
  if (loading) {
    return (
      <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (!items?.length) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingBag size={16} className="text-[#C2654A]" />
        <span className="text-sm font-medium text-[#1A1A1A]">
          Shoppable look ({items.length} items)
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {items.slice(0, 8).map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}