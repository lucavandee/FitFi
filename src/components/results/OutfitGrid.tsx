import React from "react";
import OutfitCard, { Outfit } from "./OutfitCard";

const OutfitGrid: React.FC<{ outfits: Outfit[] }> = ({ outfits }) => {
  if (!outfits?.length) return null;
  return (
    <section aria-labelledby="outfits-title" className="ff-section bg-white">
      <div className="ff-container">
        <h2 id="outfits-title" className="text-xl font-semibold mb-4">
          Outfits die nu werken voor jou
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {outfits.map((o) => <OutfitCard key={o.id} outfit={o} />)}
        </div>
      </div>
    </section>
  );
};

export default OutfitGrid;