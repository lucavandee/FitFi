import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Grid3x3, List, SlidersHorizontal } from "lucide-react";

export interface FilterOptions {
  categories: string[];
  seasons: string[];
  colors: string[];
  sortBy: "match" | "recent" | "popular";
  viewMode: "grid-2" | "grid-3" | "list";
  occasion?: string;
}

interface OutfitFiltersProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  totalCount: number;
  filteredCount: number;
}

const CATEGORIES = [
  { id: "casual", label: "Casual", icon: "👕" },
  { id: "formal", label: "Formeel", icon: "👔" },
  { id: "sport", label: "Sport", icon: "🏃" },
  { id: "party", label: "Feest", icon: "🎉" },
  { id: "work", label: "Werk", icon: "💼" },
  { id: "date", label: "Avondje uit", icon: "💕" },
  { id: "travel", label: "Reizen", icon: "✈️" },
];

const SEASONS = [
  { id: "spring", label: "Lente", icon: "🌸" },
  { id: "summer", label: "Zomer", icon: "☀️" },
  { id: "autumn", label: "Herfst", icon: "🍂" },
  { id: "winter", label: "Winter", icon: "❄️" },
];

const SORT_OPTIONS = [
  { id: "match" as const, label: "Beste match", icon: "✨" },
  { id: "recent" as const, label: "Nieuwste", icon: "🕐" },
  { id: "popular" as const, label: "Populair", icon: "🔥" },
];

export function OutfitFilters({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: OutfitFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories: newCategories });
  };

  const toggleSeason = (season: string) => {
    const newSeasons = filters.seasons.includes(season)
      ? filters.seasons.filter((s) => s !== season)
      : [...filters.seasons, season];
    onChange({ ...filters, seasons: newSeasons });
  };

  const clearAllFilters = () => {
    onChange({
      ...filters,
      categories: [],
      seasons: [],
      colors: [],
    });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.seasons.length > 0 ||
    filters.colors.length > 0;

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm">
        {/* Left: Filter Toggle & Count */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] rounded-lg font-semibold hover:bg-[var(--ff-color-primary-200)] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 w-5 h-5 rounded-full bg-[var(--ff-color-primary-600)] text-white text-xs flex items-center justify-center">
                {filters.categories.length + filters.seasons.length}
              </span>
            )}
          </button>

          <div className="text-sm text-[var(--color-text-muted)]">
            <span className="font-semibold text-[var(--color-text)]">
              {filteredCount}
            </span>{" "}
            van {totalCount} outfits
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-700)] font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Wis filters
            </button>
          )}
        </div>

        {/* Right: Sort & View Mode */}
        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onChange({
                ...filters,
                sortBy: e.target.value as FilterOptions["sortBy"],
              })
            }
            className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text)] hover:border-[var(--ff-color-primary-300)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg">
            <button
              onClick={() => onChange({ ...filters, viewMode: "grid-2" })}
              className={`p-2 rounded transition-colors ${
                filters.viewMode === "grid-2"
                  ? "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
              title="2 kolommen"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChange({ ...filters, viewMode: "grid-3" })}
              className={`p-2 rounded transition-colors ${
                filters.viewMode === "grid-3"
                  ? "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
              title="3 kolommen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h4v4H4V6zM4 14h4v4H4v-4zM10 6h4v4h-4V6zM10 14h4v4h-4v-4zM16 6h4v4h-4V6zM16 14h4v4h-4v-4z" />
              </svg>
            </button>
            <button
              onClick={() => onChange({ ...filters, viewMode: "list" })}
              className={`p-2 rounded transition-colors ${
                filters.viewMode === "list"
                  ? "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
              title="Lijstweergave"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">
                  Categorie
                </h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`
                        px-4 py-2 rounded-lg font-medium text-sm transition-all
                        ${
                          filters.categories.includes(category.id)
                            ? "bg-[var(--ff-color-primary-600)] text-white shadow-md"
                            : "bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)]"
                        }
                      `}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seasons */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">
                  Seizoen
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map((season) => (
                    <button
                      key={season.id}
                      onClick={() => toggleSeason(season.id)}
                      className={`
                        px-4 py-2 rounded-lg font-medium text-sm transition-all
                        ${
                          filters.seasons.includes(season.id)
                            ? "bg-[var(--ff-color-primary-600)] text-white shadow-md"
                            : "bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)]"
                        }
                      `}
                    >
                      <span className="mr-2">{season.icon}</span>
                      {season.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
