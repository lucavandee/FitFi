import React from "react";

export type Outfit = {
  id?: string | number;
  title?: string;
  imageUrl?: string;
  brand?: string;
  price?: string | number;
  currency?: string;
  matchPercentage?: number | null;
  href?: string;
  tags?: string[];
  why?: string; // explainability: waarom dit past
};

type Props = {
  outfit: Outfit;
  onSave?: (o: Outfit) => void;
  onClick?: (o: Outfit) => void;
};

const fallbackImg = "/placeholder.png";

const fmtPrice = (p: Props["outfit"]["price"], c?: string) => {
  if (p == null || p === "") return "";
  const n = typeof p === "string" ? Number(p) : p;
  if (!Number.isFinite(n)) return String(p);
  try {
    return new Intl.NumberFormat("nl-NL", { style: "currency", currency: c || "EUR", maximumFractionDigits: 0 }).format(n as number);
  } catch {
    return `€${n}`;
  }
};

const OutfitCard: React.FC<Props> = ({ outfit, onSave, onClick }) => {
  const {
    title = "Outfit",
    imageUrl,
    brand,
    price,
    currency = "EUR",
    matchPercentage,
    href,
    tags = [],
    why
  } = outfit || {};

  const priceText = fmtPrice(price, currency);

  return (
    <article
      className="card ff-card overflow-hidden focus:outline-none"
      role="group"
      aria-label={title}
      onClick={() => onClick?.(outfit)}
    >
      {/* Image */}
      <div className="relative">
        <a href={href || "#"} aria-label={title} target={href ? "_blank" : undefined} rel={href ? "noopener noreferrer" : undefined}>
          <img
            src={imageUrl || fallbackImg}
            alt={title}
            loading="lazy"
            decoding="async"
            className="block w-full aspect-[4/5] object-cover"
          />
        </a>

        {/* Match badge (veilig geconditioneerd) */}
        {typeof matchPercentage === "number" && !Number.isNaN(matchPercentage) && (
          <span className="absolute left-3 top-3 badge badge-accent border-ui text-xs font-medium text-ink shadow-soft">
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
        {tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((t) => (
              <span key={t} className="badge text-xs badge-accent">{t}</span>
            ))}
          </div>
        )}

        {/* Explainability – verplicht korte uitleg 1–2 zinnen */}
        {why && (
          <p className="mt-3 text-sm text-ink">
            <strong>Waarom dit past:</strong> {why}
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <a
            href={href || "#"}
            target={href ? "_blank" : undefined}
            rel={href ? "noopener noreferrer" : undefined}
            className="btn btn-solid btn-md ff-focus"
            aria-label="Bekijk & shop outfit"
          >
            Shop outfit
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