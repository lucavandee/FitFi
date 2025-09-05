import React from "react";
import SmartImage from "@/components/media/SmartImage";
import Button from "@/components/ui/Button";
import explainOutfit from "@/engine/explainOutfit";

type Props = { outfit: Outfit; onSave?: (id: string) => void };

export default function OutfitCard({ outfit, onSave }: Props) {
  return (
    <div className="ff-card">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-[color:var(--ff-midnight)] text-lg">{outfit.name}</h3>
        {typeof outfit.score === "number" && (
          <div className="text-xs text-gray-600">Match: {Math.round(outfit.score)}%</div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {outfit.items.slice(0, 3).map(p => (
          <SmartImage key={p.id} ratio="3:4" alt={p.title} onErrorSrc={p.imageUrl} />
        ))}
      </div>

      <p className="mt-3 text-sm text-gray-700">
        {explainOutfit(outfit)}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" onClick={() => onSave?.(outfit.id)}>Bewaar</Button>
        {outfit.items[0]?.url && (
          <a className="btn btn-ghost text-sm" href={outfit.items[0].url} target="_blank" rel="noreferrer">Shop</a>
        )}
      </div>
    </div>
  );
}