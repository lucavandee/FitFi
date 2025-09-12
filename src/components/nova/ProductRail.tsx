import React from "react";
import { ExternalLink, ShoppingBag } from "lucide-react";
import ImageWithFallback from "@/components/media/ImageWithFallback";
import { track } from "@/utils/telemetry";
import type { Product } from "@/types/product";

interface ProductRailProps {
  items: Product[];
  loading?: boolean;
}

function generateShopUrl(product: Product): string {
  if (!product.url) return "#";
  const raw = product.url;
  const encoded =
    typeof window !== "undefined" ? btoa(raw) : Buffer.from(raw).toString("base64");
  const merchant = product.retailer || "shop";
  return `/shop/${merchant}/${product.id}?u=${encoded}`;
}

function ProductSkeleton() {
  return (
    <div className="flex-shrink-0 w-48 bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-gray-100" />
      <div className="p-2">
        <div className="h-4 bg-gray-100 rounded w-32 mb-1" />
        <div className="h-3 bg-gray-100 rounded w-24" />
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const title = product.title || (product as any).name || "Product";
  const brand = product.brand || product.retailer || "";
  const price =
    (product as any).price?.current ??
    (product as any).price ??
    (product as any).price_eur ??
    "";

  return (
    <a
      href={generateShopUrl(product)}
      className="flex-shrink-0 w-48 bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow transition"
      onClick={() => track("rail:click", { id: product.id, retailer: product.retailer })}
    >
      <ImageWithFallback src={product.imageUrl || (product as any).image} alt={title} ratio="portrait" />
      <div className="p-2">
        <div className="text-sm font-medium line-clamp-2">{title}</div>
        <div className="mt-1 flex items-center justify-between">
          <div className="text-[13px] text-gray-600">{brand}</div>
          <div className="text-[13px] font-semibold">{price ? `€${price}` : ""}</div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[12px] text-[#2B6AF3]">
          <ShoppingBag size={14} />
          <span>Shop nu</span>
          <ExternalLink size={14} className="ml-auto opacity-70" />
        </div>
      </div>
    </a>
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
        <ShoppingBag size={16} className="text-[#2B6AF3]" />
        <span className="text-sm font-medium text-[#0D1B2A]">
          Shoppable look ({items.length} items)
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {items.slice(0, 8).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}