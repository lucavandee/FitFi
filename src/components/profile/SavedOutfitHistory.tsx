import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { savedOutfitsService, type SavedOutfit } from "@/services/outfits/savedOutfitsService";
import { resolveProductUrl, openProductLink } from "@/utils/affiliate";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

interface Props {
  userId: string;
}

function OutfitHistoryCard({ saved, index }: { saved: SavedOutfit; index: number }) {
  const outfit = saved.outfit_json;
  const items = outfit?.items || [];
  const displayItems = items.slice(0, 4);
  const navigate = useNavigate();

  const handleShopItem = async (item: any, idx: number) => {
    const hasUrl = !!resolveProductUrl(item);
    if (!hasUrl) return;
    await openProductLink({
      product: {
        id: item.id,
        name: item.name || item.title,
        retailer: item.brand || item.retailer,
        price: item.price,
        ...item,
      },
      outfitId: outfit.id,
      slot: idx + 1,
      source: "profile_saved_outfits",
    });
  };

  const savedDate = new Date(saved.created_at);
  const dateStr = savedDate.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden group"
      style={{ boxShadow: "0 1px 4px rgba(30,35,51,0.06)" }}
    >
      <div className="grid grid-cols-4 gap-px bg-[var(--color-border)]">
        {displayItems.map((item: any, idx: number) => {
          const hasUrl = !!resolveProductUrl(item);
          return (
            <button
              key={item.id || idx}
              type="button"
              onClick={() => handleShopItem(item, idx)}
              disabled={!hasUrl}
              className={`relative aspect-square bg-[var(--color-surface)] ${hasUrl ? "cursor-pointer" : ""}`}
            >
              <ImageWithFallback
                src={item.image_url || item.imageUrl || item.image}
                alt={item.name || item.title || "Item"}
                className="w-full h-full object-cover"
                fallbackCategory={item.category}
              />
              {hasUrl && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/25 transition-colors flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              )}
            </button>
          );
        })}
        {displayItems.length < 4 &&
          Array.from({ length: 4 - displayItems.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square bg-[var(--ff-color-primary-50)] flex items-center justify-center"
            >
              <ShoppingBag className="w-4 h-4 text-[var(--color-muted)] opacity-30" />
            </div>
          ))}
      </div>

      <div className="p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text)] truncate leading-tight">
              {outfit.name || outfit.occasion || "Outfit"}
            </p>
            <p className="text-[11px] text-[var(--color-muted)] mt-0.5">
              {items.length} items
              {outfit.occasion ? ` \u00b7 ${outfit.occasion}` : ""}
              {` \u00b7 ${dateStr}`}
            </p>
          </div>
          <button
            onClick={() => navigate("/results")}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--ff-color-primary-50)] flex items-center justify-center text-[var(--ff-color-primary-600)] hover:bg-[var(--ff-color-primary-100)] transition-colors"
            aria-label="Bekijk outfit"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function SavedOutfitHistory({ userId }: Props) {
  const navigate = useNavigate();

  const { data: savedOutfits, isLoading } = useQuery({
    queryKey: ["saved-outfits", userId],
    queryFn: () => savedOutfitsService.getSavedOutfits(userId),
    enabled: !!userId,
    staleTime: 120000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden animate-pulse">
            <div className="grid grid-cols-4 gap-px">
              {[0, 1, 2, 3].map((j) => (
                <div key={j} className="aspect-square bg-[var(--ff-color-primary-50)]" />
              ))}
            </div>
            <div className="p-3.5">
              <div className="h-4 bg-[var(--ff-color-primary-50)] rounded w-32 mb-1.5" />
              <div className="h-3 bg-[var(--ff-color-primary-50)] rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!savedOutfits || savedOutfits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 text-center"
        style={{ boxShadow: "0 1px 4px rgba(30,35,51,0.06)" }}
      >
        <div className="w-12 h-12 rounded-2xl bg-[var(--ff-color-primary-50)] flex items-center justify-center mx-auto mb-3">
          <Heart className="w-5 h-5 text-[var(--ff-color-primary-400)]" />
        </div>
        <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
          Nog geen opgeslagen outfits
        </p>
        <p className="text-xs text-[var(--color-muted)] mb-4 leading-relaxed">
          Bewaar outfits vanuit je stijlresultaten om ze hier terug te vinden.
        </p>
        <button
          onClick={() => navigate("/results")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
          style={{ background: "var(--ff-color-primary-700)", color: "#fff" }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Bekijk outfits
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {savedOutfits.slice(0, 6).map((saved, i) => (
        <OutfitHistoryCard key={saved.id} saved={saved} index={i} />
      ))}
      {savedOutfits.length > 6 && (
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-3 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-muted)] hover:border-[var(--ff-color-primary-300)] hover:text-[var(--ff-color-primary-700)] transition-colors"
        >
          Bekijk alle {savedOutfits.length} outfits
        </button>
      )}
    </div>
  );
}
