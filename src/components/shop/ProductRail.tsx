// src/components/shop/ProductRail.tsx
import React from "react";
import { RailProduct } from "@/services/shop/types";
import { cn } from "@/utils/cn";

type Props = {
  items: RailProduct[];
  onClickItem?: (p: RailProduct) => void;
};

export default function ProductRail({ items, onClickItem }: Props) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section aria-label="Aanbevolen items" className="mt-3">
      <h4 className="mb-2 text-sm font-medium text-[var(--color-text)]">Aanbevolen items</h4>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.slice(0, 4).map((p) => (
          <li key={p.id} className="group">
            <a
              href={`/.netlify/functions/shop-redirect?u=${encodeURIComponent(p.url)}&pid=${encodeURIComponent(p.id)}&m=${encodeURIComponent(p.retailer)}`}
              target="_blank"
              rel="nofollow sponsored"
              onClick={() => onClickItem?.(p)}
              className={cn(
                "block rounded-2xl overflow-hidden border border-black/10 bg-white shadow-sm",
                "transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]/30"
              )}
            >
              <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                />
              </div>
              <div className="p-3">
                <div className="line-clamp-2 text-sm text-[var(--color-text)]">{p.title}</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm font-semibold">
                    €{p.price.current.toFixed(2)}
                  </span>
                  {p.price.original && p.price.original > p.price.current ? (
                    <span className="text-xs text-gray-500 line-through">
                      €{p.price.original.toFixed(2)}
                    </span>
                  ) : null}
                </div>
                {p.reason ? (
                  <div className="mt-1 text-[11px] text-gray-500 line-clamp-2">{p.reason}</div>
                ) : null}
                {p.badges && p.badges.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.badges.slice(0, 2).map((b) => (
                      <span
                        key={b}
                        className="rounded-full border border-black/10 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}