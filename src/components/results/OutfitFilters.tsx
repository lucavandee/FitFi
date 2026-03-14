import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Grid3x3, List, SlidersHorizontal } from "lucide-react";

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
  { id: "casual", label: "Casual" },
  { id: "formal", label: "Formeel" },
  { id: "sport", label: "Sport" },
  { id: "party", label: "Feest" },
  { id: "work", label: "Werk" },
  { id: "date", label: "Avondje uit" },
  { id: "travel", label: "Reizen" },
];

const SEASONS = [
  { id: "spring", label: "Lente" },
  { id: "summer", label: "Zomer" },
  { id: "autumn", label: "Herfst" },
  { id: "winter", label: "Winter" },
];

const SORT_OPTIONS = [
  { id: "match" as const, label: "Beste match" },
  { id: "recent" as const, label: "Nieuwste" },
  { id: "popular" as const, label: "Populair" },
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

  const activeCount = filters.categories.length + filters.seasons.length + filters.colors.length;

  return (
    <div className="space-y-3">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
        {/* Left: Filter Toggle & Count */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="outfit-filter-panel"
            className="flex items-center gap-2 px-3 py-2 min-h-[40px] bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] rounded-xl font-semibold text-sm hover:bg-[var(--ff-color-primary-200)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-1"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            Filters
            {hasActiveFilters && (
              <span
                className="ml-0.5 w-5 h-5 rounded-full bg-[var(--ff-color-primary-600)] text-white text-xs flex items-center justify-center"
                aria-label={`${activeCount} actieve filters`}
              >
                {activeCount}
              </span>
            )}
          </button>

          <p className="text-sm text-[var(--color-muted)]">
            <span className="font-semibold text-[var(--color-text)]">
              {filteredCount}
            </span>{" "}
            van {totalCount} outfits
          </p>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-700)] font-medium flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-1 rounded"
              aria-label="Wis alle actieve filters"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              Wis filters
            </button>
          )}
        </div>

        {/* Right: Sort & View Mode */}
        <div className="flex items-center gap-2">
          <label htmlFor="outfit-sort" className="sr-only">Sorteren op</label>
          <select
            id="outfit-sort"
            value={filters.sortBy}
            onChange={(e) =>
              onChange({
                ...filters,
                sortBy: e.target.value as FilterOptions["sortBy"],
              })
            }
            className="px-3 py-2 min-h-[40px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text)] hover:border-[var(--ff-color-primary-300)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div
            className="flex items-center gap-1 p-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg"
            role="group"
            aria-label="Weergavemodus"
          >
            <button
              onClick={() => onChange({ ...filters, viewMode: "grid-2" })}
              className={`p-2 rounded transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] ${
                filters.viewMode === "grid-2"
                  ? "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
              aria-label="2 kolommen"
              aria-pressed={filters.viewMode === "grid-2"}
            >
              <Grid3x3 className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => onChange({ ...filters, viewMode: "grid-3" })}
              className={`p-2 rounded transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] ${
                filters.viewMode === "grid-3"
                  ? "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
              aria-label="3 kolommen"
              aria-pressed={filters.viewMode === "grid-3"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h4v4H4V6zM4 14h4v4H4v-4zM10 6h4v4h-4V6zM10 14h4v4h-4v-4zM16 6h4v4h-4V6zM16 14h4v4h-4v-4z" />
              </svg>
            </button>
            <button
              onClick={() => onChange({ ...filters, viewMode: "list" })}
              className={`p-2 rounded transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] ${
                filters.viewMode === "list"
                  ? "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
              aria-label="Lijstweergave"
              aria-pressed={filters.viewMode === "list"}
            >
              <List className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="outfit-filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-5">
              {/* Categories */}
              <fieldset>
                <legend className="text-sm font-semibold text-[var(--color-text)] mb-3">
                  Categorie
                </legend>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      aria-pressed={filters.categories.includes(category.id)}
                      className={`px-3.5 py-1.5 min-h-[36px] rounded-full font-medium text-sm transition-all focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-1 ${
                        filters.categories.includes(category.id)
                          ? "bg-[var(--ff-color-primary-700)] text-white"
                          : "bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)]"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Seasons */}
              <fieldset>
                <legend className="text-sm font-semibold text-[var(--color-text)] mb-3">
                  Seizoen
                </legend>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map((season) => (
                    <button
                      key={season.id}
                      onClick={() => toggleSeason(season.id)}
                      aria-pressed={filters.seasons.includes(season.id)}
                      className={`px-3.5 py-1.5 min-h-[36px] rounded-full font-medium text-sm transition-all focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-1 ${
                        filters.seasons.includes(season.id)
                          ? "bg-[var(--ff-color-primary-700)] text-white"
                          : "bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)]"
                      }`}
                    >
                      {season.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
