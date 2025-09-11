// src/components/nova/ProductRail.tsx
import React from "react";
import type { Product } from "@/types/product";
import { track } from "@/utils/telemetry";
import { cn } from "@/utils/cn";

type Props = {
  items: Product[];
  loading?: boolean;
};

function toRedirectUrl(p: Product) {
  // We leiden via serverless redirect voor attributie.
  const encoded = typeof window !== 'undefined' ? btoa(p.url) : '';
  return `/shop/${encodeURIComponent(p.retailer)}/${encodeURIComponent(p.id)}?u=${encodeURIComponent(encoded)}`;
}

function Price({ price, currency }: { price: Product['price']; currency: string }) {
  return (
    <div className="mt-1 text-[13px]">
      {price.original && price.original > price.current ? (
        <div className="flex items-center gap-2">
          <span className="line-through opacity-60">{price.original.toFixed(2)} {currency}</span>
          <span className="font-semibold">{price.current.toFixed(2)} {currency}</span>
        </div>
      ) : (
        <span className="font-semibold">{price.current.toFixed(2)} {currency}</span>
      )}
    </div>
  );
}

export default function ProductRail({ items, loading }: Props) {
  if (loading) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-black/10 p-2">
            <div className="aspect-[4/5] rounded-xl bg-gray-200 animate-pulse" />
            <div className="mt-2 h-3 w-3/4 rounded bg-gray-200 animate-pulse" />
            <div className="mt-1 h-3 w-1/2 rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="mb-2 text-xs font-medium text-[#0D1B2A]">Aanbevolen items</div>
      <div className="grid grid-cols-2 gap-3">
        {items.slice(0, 4).map((p) => (
          <a
            key={`${p.retailer}:${p.id}`}
            href={toRedirectUrl(p)}
            onClick={() => track('nova:rail-click', { retailer: p.retailer, id: p.id })}
            className={cn(
              "rounded-2xl border border-black/10 p-2 hover:shadow-sm transition",
              p.availability === 'out_of_stock' && "opacity-60 pointer-events-none"
            )}
            rel="nofollow sponsored"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.title}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="mt-2 line-clamp-2 text-[13px] font-medium text-[#0D1B2A]">{p.title}</div>
            <div className="text-[11px] text-gray-500">{p.retailer}</div>
            <Price price={p.price} currency={p.currency || 'EUR'} />
            {p.reason ? <div className="mt-1 text-[11px] text-gray-600">{p.reason}</div> : null}
          </a>
        ))}
      </div>
    </div>
  );
}