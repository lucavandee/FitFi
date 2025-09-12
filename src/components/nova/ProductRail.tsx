import React from "react";
import { ExternalLink, ShoppingBag } from "lucide-react";
import ImageWithFallback from "@/components/media/ImageWithFallback";
import { track } from "@/utils/telemetry";
import { cn } from "@/utils/cn";
import type { Product } from "@/types/product";

interface ProductRailProps {
  items: Product[];
  loading?: boolean;
}

function generateShopUrl(product: Product): string {
  if (!product.url) return "#";
  const encoded = typeof window !== "undefined"
    ? btoa(product.url)
    : Buffer.from(product.url).toString("base64");
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

export default function ProductRail({ items, loading }: ProductRailProps) {
  if (loading) {
    return (
      <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar">
        {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    );
  }

  if (!items?.length) return null;

  return (
    <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar">
      {items.map((p) => (
        <a
          key={p.id}
          href={generateShopUrl(p)}
          className="flex-shrink-0 w-48 bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow transition"
          onClick={() => track("rail:click", { id: p.id, retailer: p.retailer })}
        >
          <ImageWithFallback
            src={p.imageUrl || (p as any).image}
            alt={p.title || p.name}
            ratio="portrait"
          />
          <div className="p-2">
            <div className="text-sm font-medium line-clamp-2">{p.title || p.name}</div>
            <div className="mt-1 flex items-center justify-between">
              <div className="text-[13px] text-gray-600">
                {p.brand || p.retailer}
              </div>
              <div className="text-[13px] font-semibold">
                €{(p as any).price?.current ?? p.price}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[12px] text-[#2B6AF3]">
              <ShoppingBag size={14} />
              <span>Shop nu</span>
              <ExternalLink size={14} className="ml-auto opacity-70" />
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}