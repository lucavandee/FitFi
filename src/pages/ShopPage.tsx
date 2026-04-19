import React, { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, SlidersHorizontal, Grid3x3, List, Search, X, Filter,
  ArrowLeft, Info, ChevronDown
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/ProductCardSkeleton';
import { useProducts } from '@/hooks/useProducts';
import { canonicalUrl } from '@/utils/urls';
import { track } from '@/utils/telemetry';
import { LS_KEYS } from '@/lib/quiz/types';
import { useNavigate } from 'react-router-dom';

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest';

interface FilterState {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  brands: string[];
}

function readQuiz<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function buildReason(product: { brand?: string; category?: string; tags?: string[] }, archetypeName: string | null): string {
  const archetype = archetypeName || 'jouw stijl';
  const category = product.category || 'item';
  const tag = product.tags?.[0];
  if (tag) return `Past bij jouw ${archetype} stijl door ${tag}.`;
  if (product.category) return `We tonen dit omdat je koos voor ${category}-items die passen bij ${archetype}.`;
  return `Geselecteerd op basis van jouw stijlprofiel.`;
}

const CATEGORIES = [
  { value: '', label: 'Alle' },
  { value: 'top', label: 'Tops' },
  { value: 'bottom', label: 'Broeken & rokken' },
  { value: 'outerwear', label: 'Jassen' },
  { value: 'footwear', label: 'Schoenen' },
  { value: 'accessory', label: 'Accessoires' },
];

export default function ShopPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ brands: [] });

  const archetype = useMemo(() => {
    const raw = readQuiz<string | { name?: string }>(LS_KEYS.ARCHETYPE);
    if (!raw) return null;
    if (typeof raw === 'string') return raw;
    if (typeof raw === 'object' && 'name' in raw) return raw.name ?? null;
    return null;
  }, []);

  const quizGender = useMemo<'male' | 'female' | 'unisex'>(() => {
    const answers = readQuiz<Record<string, any>>(LS_KEYS.QUIZ_ANSWERS);
    const g = answers?.gender;
    if (g === 'male' || g === 'female') return g;
    return 'unisex';
  }, []);

  const quizBudgetMax = useMemo<number | undefined>(() => {
    const answers = readQuiz<Record<string, any>>(LS_KEYS.QUIZ_ANSWERS);
    if (!answers) return undefined;
    const b = answers.budget ?? answers.budgetRange;
    if (typeof b === 'object' && b !== null && typeof b.max === 'number' && b.max > 0) return b.max;
    if (typeof b === 'number' && b > 0) return b;
    return undefined;
  }, []);

  const { data: products, loading: isLoading, error } = useProducts({
    gender: quizGender,
    budgetMax: quizBudgetMax,
  });

  React.useEffect(() => {
    track('page_view', { page: 'shop', view_mode: viewMode });
  }, [viewMode]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let filtered = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) => p.title?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)
      );
    }
    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }
    if (filters.priceMin !== undefined) {
      filtered = filtered.filter((p) => (p.price ?? 0) >= filters.priceMin!);
    }
    if (filters.priceMax !== undefined) {
      filtered = filtered.filter((p) => (p.price ?? 0) <= filters.priceMax!);
    }
    if (filters.brands.length > 0) {
      filtered = filtered.filter((p) => filters.brands.includes(p.brand || ''));
    }

    switch (sortBy) {
      case 'price-asc': filtered.sort((a, b) => (a.price ?? 0) - (b.price ?? 0)); break;
      case 'price-desc': filtered.sort((a, b) => (b.price ?? 0) - (a.price ?? 0)); break;
      default: break;
    }

    return filtered;
  }, [products, searchQuery, filters, sortBy]);

  const availableBrands = useMemo(() => {
    if (!products) return [];
    return [...new Set(products.map((p) => p.brand).filter(Boolean))].sort() as string[];
  }, [products]);

  const clearSearch = () => {
    setSearchQuery('');
    track('search_cleared', { page: 'shop' });
  };

  const clearFilters = () => {
    setFilters({ brands: [] });
    track('filters_cleared', { page: 'shop' });
  };

  const toggleBrandFilter = useCallback((brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  }, []);

  const hasActiveFilters =
    filters.brands.length > 0 || !!filters.category || filters.priceMin !== undefined || filters.priceMax !== undefined;

  const activeFilterCount =
    filters.brands.length + (filters.category ? 1 : 0);

  return (
    <>
      <Helmet>
        <title>Aanbevolen items | FitFi</title>
        <meta
          name="description"
          content="Gecureerde kleding en accessoires afgestemd op jouw persoonlijke stijl."
        />
        <link rel="canonical" href={canonicalUrl('/shop')} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen py-8 sm:py-12">

        {/* Back to rapport */}
        <button
          onClick={() => navigate('/results')}
          className="inline-flex items-center gap-1.5 text-sm text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar rapport
        </button>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <p className="text-sm text-[#8A8A8A] mb-1">Jouw stijlwinkel</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight mb-2">
            {archetype
              ? `Aanbevolen voor jouw ${archetype} stijl`
              : 'Aanbevolen items'}
          </h1>
          <p className="text-sm text-[#8A8A8A] max-w-2xl">
            {archetype
              ? `Deze items passen bij jouw ${archetype} stijl.`
              : 'Gecureerde kleding en accessoires afgestemd op jouw persoonlijke stijl.'}
          </p>
        </motion.div>

        {/* Active quiz filter context strip */}
        {(quizGender !== 'unisex' || quizBudgetMax) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="flex flex-wrap items-center gap-2 mb-6 px-4 py-3 bg-white border border-[#E5E5E5] rounded-xl text-sm"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8A8A8A]">Gefilterd op:</span>
            {quizGender !== 'unisex' && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF5F2] text-[#A8513A]">
                {quizGender === 'male' ? 'Heren' : 'Dames'}
              </span>
            )}
            {quizBudgetMax && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF5F2] text-[#A8513A]">
                Tot €{quizBudgetMax}
              </span>
            )}
            <button
              onClick={() => navigate('/onboarding')}
              className="ml-auto text-[11px] font-semibold text-[#8A8A8A] hover:text-[#C2654A] transition-colors"
            >
              Aanpassen →
            </button>
          </motion.div>
        )}

        {/* Affiliate disclosure banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white border border-[#E5E5E5] mb-8 text-xs text-[#8A8A8A]"
        >
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#8A8A8A]" />
          <p>
            Transparantie: sommige links zijn <strong className="font-semibold text-[#1A1A1A]">affiliate links</strong>.
            Als je via FitFi shopt, kan FitFi een kleine commissie ontvangen — zonder extra kosten voor jou.{' '}
            <a href="/affiliate-disclosure" className="underline hover:no-underline">
              Meer informatie
            </a>
          </p>
        </motion.div>

        {/* Category chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="flex flex-wrap gap-2 mb-6"
          role="group"
          aria-label="Categoriefilters"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilters((f) => ({ ...f, category: cat.value || undefined }))}
              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                (filters.category || '') === cat.value
                  ? 'bg-[#A8513A] text-white'
                  : 'bg-white border border-[#E5E5E5] text-[#1A1A1A] hover:border-[#D4856E]'
              }`}
              aria-pressed={(filters.category || '') === cat.value}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Controls bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 space-y-3"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A] pointer-events-none" />
              <input
                type="search"
                placeholder="Zoek op product of merk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E5E5E5] focus:border-[#D4856E] focus:outline-none focus:ring-2 focus:ring-[#D4856E]/20 bg-white text-[#1A1A1A] text-sm placeholder:text-[#8A8A8A]"
                aria-label="Zoek producten"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#FAFAF8] transition-colors"
                  aria-label="Wis zoekopdracht"
                >
                  <X className="w-3.5 h-3.5 text-[#8A8A8A]" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none w-full sm:w-auto pl-3.5 pr-9 py-2.5 rounded-xl border border-[#E5E5E5] focus:border-[#D4856E] focus:outline-none bg-white text-[#1A1A1A] text-sm cursor-pointer"
                aria-label="Sorteer producten"
              >
                <option value="relevance">Relevantie</option>
                <option value="price-asc">Prijs: laag → hoog</option>
                <option value="price-desc">Prijs: hoog → laag</option>
                <option value="newest">Nieuwste eerst</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A] pointer-events-none" />
            </div>

            {/* Mobile filter button */}
            <button
              onClick={() => setShowFilters(true)}
              className="sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E5E5] bg-white text-sm font-semibold text-[#1A1A1A] hover:border-[#D4856E] transition-colors"
              aria-label="Toon merkfilters"
              aria-expanded={showFilters}
            >
              <Filter className="w-4 h-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#A8513A] text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-white border border-[#E5E5E5] rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#A8513A] text-white' : 'text-[#8A8A8A] hover:text-[#1A1A1A]'}`}
                aria-label="Grid weergave"
                aria-pressed={viewMode === 'grid'}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#A8513A] text-white' : 'text-[#8A8A8A] hover:text-[#1A1A1A]'}`}
                aria-label="Lijst weergave"
                aria-pressed={viewMode === 'list'}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active filters + result count */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#8A8A8A]">
              {isLoading ? 'Laden…' : (
                <><strong className="text-[#1A1A1A]">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'item' : 'items'}</>
              )}
            </span>
            {filters.brands.map((brand) => (
              <button
                key={brand}
                onClick={() => toggleBrandFilter(brand)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF5F2] text-[#A8513A] rounded-full text-xs font-semibold hover:bg-[#F4E8E3] transition-colors"
                aria-label={`Verwijder filter: ${brand}`}
              >
                {brand}
                <X className="w-3 h-3" />
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#8A8A8A] hover:text-[#C2654A] underline transition-colors"
              >
                Wis filters
              </button>
            )}
          </div>
        </motion.div>

        {/* Main layout */}
        <div className="flex gap-8">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-8 bg-white rounded-xl border border-[#E5E5E5] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Merken
                </h2>
                {filters.brands.length > 0 && (
                  <button
                    onClick={() => setFilters((f) => ({ ...f, brands: [] }))}
                    className="text-xs text-[#C2654A] hover:underline"
                  >
                    Wis
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {availableBrands.map((brand) => (
                  <label key={brand} className="flex items-center gap-2.5 cursor-pointer py-1 group">
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={() => toggleBrandFilter(brand)}
                      className="w-4 h-4 rounded border-2 border-[#E5E5E5] text-[#C2654A] cursor-pointer focus:ring-2 focus:ring-[#D4856E]/20"
                    />
                    <span className="text-sm text-[#1A1A1A] group-hover:text-[#A8513A] transition-colors">
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile filter drawer */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
              >
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-[#1A1A1A]">Merkfilter</h2>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 rounded-full hover:bg-[#FAFAF8] transition-colors"
                      aria-label="Sluit filters"
                    >
                      <X className="w-5 h-5 text-[#8A8A8A]" />
                    </button>
                  </div>
                  <div className="space-y-1.5 mb-6">
                    {availableBrands.map((brand) => (
                      <label key={brand} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FAFAF8] transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand)}
                          onChange={() => toggleBrandFilter(brand)}
                          className="w-5 h-5 rounded border-2 border-[#E5E5E5] text-[#C2654A] cursor-pointer"
                        />
                        <span className="text-sm text-[#1A1A1A]">{brand}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full py-3.5 bg-[#A8513A] text-white rounded-xl font-bold text-sm hover:bg-[#C2654A] transition-colors"
                  >
                    Toon {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {isLoading && (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                role="status"
                aria-label="Producten worden geladen"
              >
                <ProductCardSkeleton count={12} />
              </div>
            )}

            {error && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
                role="alert"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FEF2F2] flex items-center justify-center">
                  <X className="w-6 h-6 text-[#C24A4A]" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                  Items konden niet worden geladen
                </h3>
                <p className="text-sm text-[#8A8A8A] mb-5">
                  Probeer het later opnieuw.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 bg-[#A8513A] text-white rounded-xl text-sm font-bold hover:bg-[#C2654A] transition-colors"
                >
                  Opnieuw proberen
                </button>
              </motion.div>
            )}

            {!isLoading && !error && filteredProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
                role="status"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-[#8A8A8A]" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                  Geen items gevonden
                </h3>
                <p className="text-sm text-[#8A8A8A] mb-5 max-w-sm mx-auto">
                  {searchQuery
                    ? `Geen resultaten voor "${searchQuery}".`
                    : 'Probeer minder filters.'}
                </p>
                {(searchQuery || hasActiveFilters) && (
                  <div className="flex flex-wrap gap-3 justify-center">
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="px-5 py-2.5 border border-[#E5E5E5] text-[#1A1A1A] rounded-xl text-sm font-semibold hover:border-[#D4856E] transition-colors"
                      >
                        Wis zoekopdracht
                      </button>
                    )}
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="px-5 py-2.5 bg-[#A8513A] text-white rounded-xl text-sm font-bold hover:bg-[#C2654A] transition-colors"
                      >
                        Wis filters
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {!isLoading && !error && filteredProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'space-y-4'
                }
                role="list"
                aria-label="Aanbevolen items"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.025, 0.4), duration: 0.35 }}
                    role="listitem"
                  >
                    <ProductCard
                      id={product.id}
                      brand={product.brand || 'Onbekend'}
                      title={product.title}
                      price={product.price ?? 0}
                      imageUrl={product.imageUrl || product.image || ''}
                      deeplink={product.url || '#'}
                      reason={buildReason(product, archetype)}
                      position={index}
                      context={{
                        page: 'shop',
                        view_mode: viewMode,
                        search_query: searchQuery,
                        active_filters: filters.brands,
                      }}
                      onFeedbackMore={(id) => track('product_feedback_more', { id, archetype })}
                      onFeedbackLess={(id) => track('product_feedback_less', { id, archetype })}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom CTA: back to rapport */}
        {!isLoading && filteredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <button
              onClick={() => navigate('/results')}
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#E5E5E5] text-[#1A1A1A] rounded-xl text-sm font-semibold hover:border-[#D4856E] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar rapport
            </button>
          </motion.div>
        )}
      </div>
    </>
  );
}
