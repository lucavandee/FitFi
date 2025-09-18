import React from "react";
import { ExternalLink, ShoppingBag, List } from "lucide-react";
import SmartImage from "@/components/media/SmartImage";
import Button from "@/components/ui/Button";
import Badge from "@/components/results/Badge";
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
      <div className="outfit-media">
        <SmartImage
          id={outfit.imageId ?? "outfit-generic"}
          kind="generic"
          alt={`Outfit ${outfit.title}`}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Body */}
      <div className="outfit-body flow">
        <h3 className="outfit-title">{outfit.title}</h3>

        <div className="cluster gap-2">
          <Badge tone="season">{outfit.season}</Badge>
          <Badge tone="temp">{outfit.colorTemp}</Badge>
          <Badge tone="arch">{outfit.archetype}</Badge>
          {outfit.priceHint ? <Badge tone="neutral">{outfit.priceHint}</Badge> : null}
        </div>

        <p className="outfit-expl">{outfit.explanation}</p>

        <ul className="outfit-items">
          {outfit.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>

        <div className="outfit-cta cluster">
          <Button variant="primary" size="md" className="cta-raise" onClick={onShop} aria-label="Shop deze outfit">
            Shop outfit <ShoppingBag size={18} className="ml-2" aria-hidden />
          </Button>
          <Button variant="ghost" size="md" onClick={onViewItems} aria-label="Bekijk items van deze outfit">
            Bekijk items <List size={18} className="ml-2" aria-hidden />
          </Button>
          <a href="#" className="text-[var(--color-text)] inline-flex items-center text-sm hover:underline">
            Delen <ExternalLink size={16} className="ml-1" aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
};

export default OutfitCard;