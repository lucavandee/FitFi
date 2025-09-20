import React from "react";
import Button from "@/components/ui/Button";

type ShopLink = { label: string; href: string };
type Outfit = {
  id: string;
  title: string;
  imageUrl?: string;
  items?: { name: string; note?: string }[];
  shop?: ShopLink;
};

const OutfitCardPro: React.FC<{ outfit: Outfit }> = ({ outfit }) => {
  return (
    <article className="card-pro rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden focus-within:shadow-[var(--shadow-ring)]">
      {/* beeld */}
      {outfit.imageUrl ? (
        <figure className="relative">
          <img
            src={outfit.imageUrl}
            alt={outfit.title}
            className="w-full h-60 object-cover"
            loading="lazy"
            decoding="async"
          />
        </figure>
      ) : (
        <div className="h-60 w-full bg-[var(--overlay-accent-08a)]" aria-hidden />
      )}

      {/* content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">{outfit.title}</h3>
        {outfit.items && (
          <ul className="mt-3 space-y-1 text-[var(--color-text)]">
            {outfit.items.map((it, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                <span className="text-sm">
                  {it.name}
                  {it.note ? (
                    <span className="text-[var(--color-muted)]"> — {it.note}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          {outfit.shop ? (
            <a href={outfit.shop.href} className="btn btn-secondary">
              {outfit.shop.label}
            </a>
          ) : (
            <Button variant="secondary" onClick={() => {}}>
              Shop vergelijkbare items
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export default OutfitCardPro;