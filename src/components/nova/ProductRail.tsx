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
  
  // Encode target URL as base64 for shop-redirect
  const encoded = Buffer.from(product.url).toString("base64");
  return `/shop/${product.retailer}/${product.id}?u=${encoded}`;
}

function ProductSkeleton() {
  return (
    <div className="flex-shrink-0 w-48 bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const handleClick = () => {
    track("nova:product-click", {
      productId: product.id,
      retailer: product.retailer,
      price: product.price?.current,
    });
  };

  return (
    <a
      href={generateShopUrl(product)}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      onClick={handleClick}
      className={cn(
        "flex-shrink-0 w-48 bg-white rounded-xl border border-gray-100",
        "hover:border-[#2B6AF3]/30 hover:shadow-md transition-all duration-200",
        "overflow-hidden group"
      )}
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.badges?.[0] && (
          <div className="absolute top-2 left-2 bg-[#2B6AF3] text-white text-xs px-2 py-1 rounded-full">
            {product.badges[0]}
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink size={16} className="text-white drop-shadow-md" />
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-sm text-[#0D1B2A] line-clamp-2 mb-1">
          {product.title}
        </h3>
        
        {product.reason && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {product.reason}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {product.price?.original && product.price.original > product.price.current && (
              <span className="text-xs text-gray-400 line-through">
                €{product.price.original}
              </span>
            )}
            <span className="font-semibold text-sm text-[#0D1B2A]">
              €{product.price?.current}
            </span>
          </div>
          <ShoppingBag size={14} className="text-gray-400" />
        </div>
      </div>
    </a>
  );
}

export default function ProductRail({ items, loading }: ProductRailProps) {
  if (loading) {
    return (
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag size={16} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-600">Producten laden...</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!items?.length) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingBag size={16} className="text-[#2B6AF3]" />
        <span className="text-sm font-medium text-[#0D1B2A]">
          Shoppable look ({items.length} items)
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}