/**
 * SimplifiedFilters Component
 *
 * Streamlined product filtering for shop page
 *
 * Key Principles:
 * - Direct category access (no nested menus)
 * - Visual hierarchy (most important first)
 * - Breadcrumbs for navigation
 * - Mobile-first design
 * - Quick clear/reset
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, ChevronRight, Check } from 'lucide-react';

export interface FilterState {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  styles: string[];
  colors: string[];
}

interface SimplifiedFiltersProps {
  /** Current filter state */
  filters: FilterState;

  /** Filter change handler */
  onChange: (filters: FilterState) => void;

  /** Available categories */
  categories?: string[];

  /** Available styles */
  styles?: string[];

  /** Available colors */
  colors?: string[];

  /** Show mobile drawer? */
  mobile?: boolean;

  /** Close handler for mobile */
  onClose?: () => void;
}

const QUICK_CATEGORIES = [
  { id: 'top', label: 'Tops', icon: '👕' },
  { id: 'bottom', label: 'Broeken', icon: '👖' },
  { id: 'dress', label: 'Jurken', icon: '👗' },
  { id: 'outerwear', label: 'Jassen', icon: '🧥' },
  { id: 'footwear', label: 'Schoenen', icon: '👟' },
  { id: 'accessory', label: 'Accessoires', icon: '👜' }
];

const PRICE_RANGES = [
  { label: 'Onder €50', min: 0, max: 50 },
  { label: '€50 - €100', min: 50, max: 100 },
  { label: '€100 - €150', min: 100, max: 150 },
  { label: '€150 - €250', min: 150, max: 250 },
  { label: 'Boven €250', min: 250, max: 9999 }
];

export function SimplifiedFilters({
  filters,
  onChange,
  categories = QUICK_CATEGORIES.map(c => c.id),
  styles = [],
  colors = [],
  mobile = false,
  onClose
}: SimplifiedFiltersProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('category');

  const hasActiveFilters =
    filters.category ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.styles.length > 0 ||
    filters.colors.length > 0;

  const clearAll = () => {
    onChange({
      category: undefined,
      priceMin: undefined,
      priceMax: undefined,
      styles: [],
      colors: []
    });
  };

  const toggleCategory = (category: string) => {
    onChange({
      ...filters,
      category: filters.category === category ? undefined : category
    });
  };

  const setPriceRange = (min?: number, max?: number) => {
    onChange({
      ...filters,
      priceMin: min,
      priceMax: max
    });
  };

  const toggleStyle = (style: string) => {
    onChange({
      ...filters,
      styles: filters.styles.includes(style)
        ? filters.styles.filter(s => s !== style)
        : [...filters.styles, style]
    });
  };

  const toggleColor = (color: string) => {
    onChange({
      ...filters,
      colors: filters.colors.includes(color)
        ? filters.colors.filter(c => c !== color)
        : [...filters.colors, color]
    });
  };

  const FilterSection = ({
    id,
    title,
    children
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSection === id;

    return (
      <div className="border-b border-[#E5E5E5] last:border-0">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : id)}
          className="w-full flex items-center justify-between py-4 px-1 text-left font-semibold text-[#1A1A1A] hover:text-[#C2654A] transition-colors"
        >
          <span>{title}</span>
          <ChevronRight
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            aria-hidden="true"
          />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pb-4 px-1">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const content = (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-[#C2654A]" aria-hidden="true" />
          <h3 className="font-bold text-lg text-[#1A1A1A]">Filters</h3>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-sm text-[#C2654A] hover:text-[#A8513A] font-medium"
            >
              Wis alles
            </button>
          )}
          {mobile && onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#FAFAF8] rounded-lg transition-colors"
              aria-label="Sluit filters"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Breadcrumb */}
      {hasActiveFilters && (
        <div className="mb-4 p-3 bg-[#FAF5F2] rounded-xl">
          <p className="text-xs font-medium text-[#A8513A] mb-2">
            Actieve filters:
          </p>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs font-medium">
                {QUICK_CATEGORIES.find(c => c.id === filters.category)?.label}
                <button
                  onClick={() => toggleCategory(filters.category!)}
                  className="hover:text-red-600"
                  aria-label="Verwijder filter"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </span>
            )}
            {(filters.priceMin !== undefined || filters.priceMax !== undefined) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs font-medium">
                €{filters.priceMin || 0} - €{filters.priceMax || '∞'}
                <button
                  onClick={() => setPriceRange(undefined, undefined)}
                  className="hover:text-red-600"
                  aria-label="Verwijder filter"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Category Filter - Always visible, no expand */}
      <div className="mb-6">
        <h4 className="font-semibold text-sm text-[#1A1A1A] mb-3">Categorie</h4>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-[#C2654A] bg-[#FAF5F2]'
                    : 'border-[#E5E5E5] bg-[#FFFFFF] hover:border-[#D4856E]'
                }`}
              >
                <span className="text-2xl" role="img" aria-label={cat.label}>
                  {cat.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">
                    {cat.label}
                  </span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-[#C2654A] flex-shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <FilterSection id="price" title="Prijs">
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => {
            const isSelected =
              filters.priceMin === range.min && filters.priceMax === range.max;
            return (
              <button
                key={range.label}
                onClick={() => setPriceRange(range.min, range.max)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-[#C2654A] bg-[#FAF5F2] font-semibold'
                    : 'border-[#E5E5E5] hover:border-[#D4856E]'
                }`}
              >
                <span className="text-sm">{range.label}</span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Style Filters */}
      {styles.length > 0 && (
        <FilterSection id="styles" title="Stijl">
          <div className="space-y-2">
            {styles.map((style) => {
              const isSelected = filters.styles.includes(style);
              return (
                <label
                  key={style}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#FAFAF8] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleStyle(style)}
                    className="w-4 h-4 rounded border-[#E5E5E5] text-[#C2654A] focus:ring-[#D4856E]"
                  />
                  <span className="text-sm">{style}</span>
                </label>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Color Filters */}
      {colors.length > 0 && (
        <FilterSection id="colors" title="Kleur">
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color) => {
              const isSelected = filters.colors.includes(color);
              return (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className={`aspect-square rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-[#C2654A] scale-110'
                      : 'border-[#E5E5E5] hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                  title={color}
                >
                  {isSelected && (
                    <Check className="w-4 h-4 text-white m-auto drop-shadow" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}
    </div>
  );

  // Mobile drawer
  if (mobile) {
    return (
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-[#FFFFFF] shadow-2xl overflow-y-auto"
      >
        <div className="p-6">{content}</div>
      </motion.div>
    );
  }

  // Desktop sidebar
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6">
      {content}
    </div>
  );
}

export default SimplifiedFilters;
