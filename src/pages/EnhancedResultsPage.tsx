import React from "react";
import DataService from "@/services/data/dataService";
import recommend from "@/engine/recommendationEngine";
import OutfitCard from "@/components/outfits/OutfitCard";
import useSaveOutfit from "@/hooks/useSaveOutfit";
import track from "@/services/analytics";

export default function EnhancedResultsPage() {
  const [outfits, setOutfits] = React.useState<Outfit[]>([]);
  const { save } = useSaveOutfit();

  React.useEffect(() => {
    (async () => {
      const products = await DataService.getProducts();
      const suggested = recommend({ products, limit: 8, profile: { gender: "unisex", archetypes: {} } });
      setOutfits(suggested);
      track("nova:prefill", { count: suggested.length });
    })();
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {outfits.map(o => (
        <OutfitCard key={o.id} outfit={o} onSave={save} />
      ))}
      {!outfits.length && (
        <div className="ff-card">We zijn outfits aan het voorbereiden…</div>
      )}
    </div>
  );
}