import React from "react";

type Outfit = {
  id?: string | number;
  title?: string;
  imageUrl?: string;
  brand?: string;
  price?: string | number;
  currency?: string;
  matchPercentage?: number | null;
  href?: string;
  tags?: string[];
};

type Props = {
  outfit: Outfit;
  onSave?: (outfit: Outfit) => void;
  onClick?: (outfit: Outfit) => void;
  className?: string;
};

const fallbackImg = "/images/outfits/fallback.jpg";

const formatPrice = (price?: string | number, currency: string = "€") => {
  if (price === undefined || price === null || price === "") return "";
  const num = typeof price === "string" ? Number(price) : price;
  if (Number.isNaN(num)) return String(price);
  return `${currency}${num.toFixed(2)}`.replace(".00", "");
};

const OutfitCard: React.FC<Props> = ({ outfit, onSave, onClick, className = "" }) => {
  const {
    title = "Outfit",
    imageUrl,
    brand,
    price,
    currency = "€",
    matchPercentage,
    href = "#",
    tags = [],
  } = outfit || {};

  const priceText = formatPrice(price, currency);

  return (
    <article className={`ff-card overflow-hidden ${className}`}>
      {/* Visual */}
      <div className="relative">
        <a
          href={href}
          onClick={(e) => {
            if (onClick) {
              e.preventDefault();
              onClick(outfit);
            }
          }}
          aria-label={`Open ${title}`}
        >
          <img
            src={imageUrl || fallbackImg}
            alt={title}
            loading="lazy"
            decoding="async"
            className="block w-full h-64 object-cover"
          />
        </a>

        {/* Match badge (veilig geconditioneerd) */}
        {typeof matchPercentage === "number" && !Number.isNaN(matchPercentage) && (
          <span className="absolute left-3 top-3 surface border border-ui rounded-[var(--radius-lg)] px-2.5 py-1 text-xs font-medium text-ink shadow-soft">
            Match {Math.round(matchPercentage)}%
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-ink font-semibold truncate" title={title}>
              {title}
            </h3>
            <p className="text-muted text-sm">{brand || "—"}</p>
          </div>

        {/* Price (optioneel) */}
          {priceText && (
            <div className="text-ink font-semibold whitespace-nowrap">{priceText}</div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.slice(0, 6).map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="badge-accent inline-flex items-center rounded-full px-2 py-1 text-xs"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-3">
          <a
            href={href}
            className="btn btn-primary btn-md"
            data-variant="primary"
            aria-label={`Bekijk ${title}`}
          >
            Bekijk
          </a>
          <button
            type="button"
            className="btn btn-ghost btn-md"
            data-variant="ghost"
            onClick={() => onSave?.(outfit)}
            aria-label="Bewaar outfit"
          >
            Bewaar
          </button>
        </div>
      </div>
    </article>
  );
};

export default OutfitCard;