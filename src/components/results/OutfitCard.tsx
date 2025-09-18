import React from "react";
import { ShoppingBag, Eye } from "lucide-react";
import SmartImage from "@/components/media/SmartImage";
import Button from "@/components/ui/Button";
import type { Outfit } from "@/pages/ResultsPage";

type Props = {
  outfit: Outfit;
  onShop: () => void;
  onViewItems: () => void;
};

const OutfitCard: React.FC<Props> = ({ outfit, onShop, onViewItems }) => {
  return (
    <article className="outfit-card">
      {/* Visual */}
      <div className="outfit-visual">
        <SmartImage
          id={outfit.imageId || "generic"}
          kind="generic"
          alt={`Outfit: ${outfit.title}`}
          className="h-full w-full object-cover"
        />
        <div className="outfit-overlay">
          <Button
            variant="ghost"
            size="sm"
            className="outfit-preview-btn"
            onClick={onViewItems}
            aria-label={`Bekijk items van ${outfit.title}`}
          >
            <Eye size={16} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="outfit-content flow-sm">
        {/* Header */}
        <div className="flow-xs">
          <h3 className="outfit-title">{outfit.title}</h3>
          <div className="outfit-badges cluster gap-1">
            <span className="badge badge-season">{outfit.season}</span>
            <span className="badge badge-temp">{outfit.colorTemp}</span>
            <span className="badge badge-arch">{outfit.archetype}</span>
            {outfit.priceHint && <span className="badge badge-price">{outfit.priceHint}</span>}
          </div>
        </div>

        {/* Explanation */}
        <p className="outfit-explanation">{outfit.explanation}</p>

        {/* Items */}
        <div className="outfit-items">
          <h4 className="outfit-items-title">Items:</h4>
          <ul className="outfit-items-list">
            {outfit.items.map((item, i) => (
              <li key={i} className="outfit-item">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <Button
          variant="primary"
          size="sm"
          className="outfit-shop-btn"
          onClick={onShop}
          aria-label={`Shop items voor ${outfit.title}`}
        >
          <ShoppingBag size={16} className="mr-2" />
          Shop dit look
        </Button>
      </div>
    </article>
  );
};

export default OutfitCard;