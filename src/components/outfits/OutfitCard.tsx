import React from 'react';
import OutfitReasons from './OutfitReasons';
import ImageWithFallback from '../ui/ImageWithFallback';

export default function OutfitCard({ outfit, onSave, onMoreLikeThis, onNotMyStyle }: any) {
  const seasonLabel = outfit.currentSeasonLabel || 'Seizoen';
  return (
    <article className="rounded-2xl border bg-white p-4 shadow-sm">
      <ImageWithFallback src={outfit.imageUrl} alt={outfit.title} className="h-48 w-full rounded-xl object-cover" />
      <h3 className="mt-3 text-lg font-semibold">{outfit.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{outfit.description}</p>
      <OutfitReasons matchPct={outfit.matchPercentage || 78} seasonLabel={seasonLabel} colorHint={outfit.dominantColorName} />
      <div className="mt-3 flex gap-2">
        <button className="rounded-xl border px-3 py-1" onClick={() => onSave(outfit)}>Bewaar</button>
        <button className="rounded-xl border px-3 py-1" onClick={() => onMoreLikeThis(outfit)}>Meer zoals dit</button>
        <button className="rounded-xl border px-3 py-1" onClick={() => onNotMyStyle(outfit)}>Niet mijn stijl</button>
      </div>
    </article>
  );
}