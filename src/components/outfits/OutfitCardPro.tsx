import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export type OutfitItem = {
  id: string;
  title: string;
  image: string;
  url?: string;
  price?: number;
};

export type Outfit = {
  id: string;
  title: string;
  matchPercent?: number;
  reason?: string;           // Explainability: waarom werkt dit?
  items: OutfitItem[];
  tags?: string[];
  budgetHint?: string;
};

type Props = {
  outfit: Outfit;
};

export default function OutfitCardPro({ outfit }: Props) {
  const mp = typeof outfit.matchPercent === "number" ? Math.max(0, Math.min(100, outfit.matchPercent)) : undefined;

  return (
    <Card className="overflow-hidden">
      <Card.Header>
        <div className="flex items-center gap-3">
          <strong className="text-white">{outfit.title}</strong>
          {mp !== undefined && (
            <span className="ff-chip" aria-label={`Match ${mp}%`}>{mp}% match</span>
          )}
        </div>
        {outfit.budgetHint && <span className="text-xs text-[var(--fitfi-muted)]">{outfit.budgetHint}</span>}
      </Card.Header>

      <Card.Body className="grid md:grid-cols-2 gap-10">
        {/* Visual */}
        <div className="grid grid-cols-2 gap-3">
          {outfit.items.slice(0,4).map((it) => (
            <a key={it.id} href={it.url || "#"} className="group relative border border-white/10 rounded-xl overflow-hidden">
              <img src={it.image} alt={it.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-[13px] text-white/90">
                {it.title}
              </div>
            </a>
          ))}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-white font-medium mb-1">Waarom dit werkt</div>
            <p className="text-[var(--fitfi-muted)] leading-6">
              {outfit.reason || "Rustige basis, slank silhouet en één hero-item voor focus. Kleuren liggen dicht bij elkaar voor een rustige look."}
            </p>
          </div>

          {outfit.tags && outfit.tags.length > 0 && (
            <div className="flex flex-wrap gap-6">
              {outfit.tags.map((t) => <span key={t} className="ff-chip">{t}</span>)}
            </div>
          )}

          <div className="mt-auto flex items-center gap-10">
            <Button size="md">Shop deze look</Button>
            <a href="#" className="ff-ghost">Alternatieven</a>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}