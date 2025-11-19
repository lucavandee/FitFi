import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Filter, Grid3x3, List, Calendar, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { NovaMatchBadge } from "@/components/outfits/NovaMatchBadge";
import { calculateMatchScore } from "@/services/outfits/matchScoreCalculator";

const LS_KEYS = {
  ARCHETYPE: 'ff_archetype',
  COLOR_PROFILE: 'ff_color_profile'
};

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

interface SavedOutfit {
  id: string;
  outfit_data: any;
  created_at: string;
  notes?: string;
}

interface EnhancedSavedOutfitsGalleryProps {
  userId: string;
}

type ViewMode = "grid" | "list";
type SortMode = "recent" | "oldest";

export function EnhancedSavedOutfitsGallery({ userId }: EnhancedSavedOutfitsGalleryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [filterVisible, setFilterVisible] = useState(false);

  const { data: outfits, isLoading } = useQuery({
    queryKey: ["savedOutfits", userId, sortMode],
    queryFn: async () => {
      const client = supabase();
      if (!client) return [];

      const { data, error } = await client
        .from("saved_outfits")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: sortMode === "oldest" });

      if (error) {
        console.error("Error fetching saved outfits:", error);
        return [];
      }

      return (data || []) as SavedOutfit[];
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  const sortedOutfits = useMemo(() => {
    if (!outfits) return [];
    return [...outfits];
  }, [outfits, sortMode]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-[var(--color-border)] rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-[var(--color-border)] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!outfits || outfits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] rounded-3xl p-12 text-center"
      >
        <Heart className="w-16 h-16 mx-auto text-[var(--color-muted)] mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
          Nog geen opgeslagen outfits
        </h3>
        <p className="text-[var(--color-muted)] mb-6 max-w-md mx-auto">
          Begin met swipen en save je favoriete looks om een persoonlijke collectie op te bouwen
        </p>
        <button className="px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-600)] transition-all shadow-lg hover:scale-105">
          Start met swipen
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
          <span className="text-sm font-semibold text-[var(--color-text)]">
            {outfits.length} {outfits.length === 1 ? "outfit" : "outfits"} opgeslagen
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Toggle */}
          <button
            onClick={() => setSortMode(sortMode === "recent" ? "oldest" : "recent")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text)] bg-[var(--color-bg)] hover:bg-[var(--ff-color-primary-50)] rounded-lg transition-colors border border-[var(--color-border)]"
          >
            {sortMode === "recent" ? <Calendar className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            {sortMode === "recent" ? "Nieuwste" : "Oudste"}
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid"
                  ? "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Outfits Grid/List */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {sortedOutfits.map((outfit, index) => (
              <OutfitCard key={outfit.id} outfit={outfit} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {sortedOutfits.map((outfit, index) => (
              <OutfitListItem key={outfit.id} outfit={outfit} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OutfitCard({ outfit, index }: { outfit: SavedOutfit; index: number }) {
  const archetype = readJson<any>(LS_KEYS.ARCHETYPE);
  const colorProfile = readJson<any>(LS_KEYS.COLOR_PROFILE);

  const matchScore = useMemo(() => {
    if (outfit.outfit_data?.matchScore) {
      return outfit.outfit_data.matchScore;
    }

    const breakdown = calculateMatchScore({
      outfit: {
        items: outfit.outfit_data?.items || [],
        style: outfit.outfit_data?.style || archetype?.name,
        colors: outfit.outfit_data?.colors || [],
        season: outfit.outfit_data?.season
      },
      userProfile: {
        archetype: archetype?.name,
        colorPalette: colorProfile?.palette || []
      }
    });

    return breakdown.total;
  }, [outfit, archetype, colorProfile]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative aspect-[3/4] bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-xl overflow-hidden border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] shadow-sm hover:shadow-xl transition-all cursor-pointer"
    >
      {/* Nova Match Badge - Top Right */}
      <div className="absolute top-3 right-3 z-10">
        <NovaMatchBadge score={matchScore} size="sm" />
      </div>

      {/* Content placeholder */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <Heart className="w-12 h-12 text-[var(--ff-color-primary-400)] mb-2 group-hover:scale-110 transition-transform" />
        <p className="text-xs text-center text-[var(--color-text-muted)] font-medium">
          Outfit #{outfit.id.substring(0, 8)}
        </p>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Date badge */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-white font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
          {new Date(outfit.created_at).toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "short",
          })}
        </span>
        <Heart className="w-4 h-4 text-white fill-white" />
      </div>
    </motion.div>
  );
}

function OutfitListItem({ outfit, index }: { outfit: SavedOutfit; index: number }) {
  const archetype = readJson<any>(LS_KEYS.ARCHETYPE);
  const colorProfile = readJson<any>(LS_KEYS.COLOR_PROFILE);

  const matchScore = useMemo(() => {
    if (outfit.outfit_data?.matchScore) {
      return outfit.outfit_data.matchScore;
    }

    const breakdown = calculateMatchScore({
      outfit: {
        items: outfit.outfit_data?.items || [],
        style: outfit.outfit_data?.style || archetype?.name,
        colors: outfit.outfit_data?.colors || [],
        season: outfit.outfit_data?.season
      },
      userProfile: {
        archetype: archetype?.name,
        colorPalette: colorProfile?.palette || []
      }
    });

    return breakdown.total;
  }, [outfit, archetype, colorProfile]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="group flex items-center gap-4 p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] hover:shadow-md transition-all cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 relative w-20 h-28 bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-lg flex items-center justify-center border border-[var(--color-border)] group-hover:scale-105 transition-transform">
        <Heart className="w-6 h-6 text-[var(--ff-color-primary-400)]" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-[var(--color-text)] truncate">
            Outfit #{outfit.id.substring(0, 8)}
          </h4>
          <NovaMatchBadge score={matchScore} size="xs" />
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          Opgeslagen op{" "}
          {new Date(outfit.created_at).toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        {outfit.notes && (
          <p className="text-xs text-[var(--color-muted)] mt-1 line-clamp-1">
            {outfit.notes}
          </p>
        )}
      </div>

      {/* Action */}
      <Heart className="w-5 h-5 text-[var(--ff-color-primary-600)] fill-[var(--ff-color-primary-600)] group-hover:scale-110 transition-transform" />
    </motion.div>
  );
}
