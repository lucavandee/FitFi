import React from "react";

export type ShopLink = {
  label: string;
  href: string;
};

export type Outfit = {
  id: string;
  title: string;
  imageUrl?: string;
  items?: { name: string; note?: string }[];
  shop?: ShopLink;
};

type Props = {
  outfit: Outfit;
};

const OutfitCard: React.FC<Props> = ({ outfit }) => {
  const { title, imageUrl, items = [], shop } = outfit;

  return (
    <article className="card overflow-hidden h-full flex flex-col">
      {/* Visual */}
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            width={960}
            height={960}
            decoding="async"
            loading="lazy"
            className="block w-full h-auto aspect-square object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="w-full aspect-square"
            style={{
              borderRadius: "calc(var(--radius-lg))",
              background:
                "linear-gradient(135deg, var(--ff-color-primary-600), var(--ff-color-primary-900))",
              boxShadow: "var(--shadow-soft)",
            }}
          />
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-base font-semibold mb-2">{title}</h3>

        {items.length > 0 && (
          <ul className="text-sm text-[var(--color-text-subtle)] space-y-1 mb-4">
            {items.map((it, i) => (
              <li key={`${it.name}-${i}`}>
                <span className="font-medium text-[var(--color-text)]">{it.name}</span>
                {it.note ? <span> — {it.note}</span> : null}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto">
          {shop ? (
            <a
              href={shop.href}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="btn btn-ghost"
              aria-label={`Shop: ${shop.label}`}
            >
              {shop.label}
            </a>
          ) : (
            <div className="chip">Shoplink volgt</div>
          )}
        </div>
      </div>
    </article>
  );
};

export default OutfitCard;