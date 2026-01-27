import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, SlidersHorizontal, Grid3x3, List, Search, X, Filter } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/ProductCardSkeleton';
import { useProducts } from '@/hooks/useProducts';
import { canonicalUrl } from '@/utils/urls';
import { track } from '@/utils/telemetry';

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest';

interface FilterState {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  brands: string[];
}

export default function ShopPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    brands: []
  });

  const { data: products, isLoading, error } = useProducts();

  // Track page view
  React.useEffect(() => {
    track('page_view', { page: 'shop', view_mode: viewMode });
  }, [viewMode]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    // Price filter
    if (filters.priceMin !== undefined) {
      filtered = filtered.filter((p) => p.price >= filters.priceMin!);
    }
    if (filters.priceMax !== undefined) {
      filtered = filtered.filter((p) => p.price <= filters.priceMax!);
    }

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter((p) =>
        filters.brands.includes(p.brand || '')
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // Assuming products have a createdAt or similar field
        break;
      case 'relevance':
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [products, searchQuery, filters, sortBy]);

  // Extract unique brands for filter
  const availableBrands = useMemo(() => {
    if (!products) return [];
    const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
    return brands.sort();
  }, [products]);

  const clearSearch = () => {
    setSearchQuery('');
    track('search_cleared', { page: 'shop' });
  };

  const clearFilters = () => {
    setFilters({ brands: [] });
    track('filters_cleared', { page: 'shop' });
  };

  const toggleBrandFilter = (brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand]
    }));
  };

  const hasActiveFilters = filters.brands.length > 0 || filters.category || filters.priceMin || filters.priceMax;

  return (
    <>
      <Helmet>
        <title>Shop | FitFi - Jouw persoonlijke stijl winkel</title>
        <meta
          name="description"
          content="Ontdek kleding en accessoires die perfect bij jouw stijl passen. Gecureerde producten speciaal voor jou geselecteerd."
        />
        <link rel="canonical" href={canonicalUrl('/shop')} />
      </Helmet>

      <div className="ff-container min-h-screen py-8 sm:py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] rounded-full text-sm font-bold mb-4">
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            <span>Jouw Stijl Winkel</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4">
            Ontdek producten die{' '}
            <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
              bij jou passen
            </span>
          </h1>
          <p className="text-lg text-[var(--color-muted)] max-w-2xl mx-auto">
            Gecureerde kleding en accessoires afgestemd op jouw persoonlijke stijl
          </p>
        </motion.div>

        {/* Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search + View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)] pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                placeholder="Zoek op product of merk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-[var(--color-border)] focus:border-[var(--ff-color-primary-400)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-400)]/20 transition-all bg-white text-[var(--color-text)] placeholder:text-[var(--color-muted)]"
                aria-label="Zoek producten"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--color-bg)] transition-colors"
                  aria-label="Wis zoekopdracht"
                >
                  <X className="w-4 h-4 text-[var(--color-muted)]" />
                </button>
              )}
            </div>

            {/* Filter Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] bg-white transition-all font-medium text-[var(--color-text)]"
              aria-label="Toon filters"
              aria-expanded={showFilters}
            >
              <Filter className="w-5 h-5" aria-hidden="true" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="px-2 py-0.5 bg-[var(--ff-color-primary-600)] text-white text-xs rounded-full">
                  {filters.brands.length}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-xl border-2 border-[var(--color-border)] p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-lg font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[var(--ff-color-primary-700)] text-white'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-bg)]'
                }`}
                aria-label="Grid weergave"
                aria-pressed={viewMode === 'grid'}
              >
                <Grid3x3 className="w-5 h-5" aria-hidden="true" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-lg font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-[var(--ff-color-primary-700)] text-white'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-bg)]'
                }`}
                aria-label="Lijst weergave"
                aria-pressed={viewMode === 'list'}
              >
                <List className="w-5 h-5" aria-hidden="true" />
                <span className="hidden sm:inline">Lijst</span>
              </button>
            </div>
          </div>

          {/* Sort + Filter Desktop */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Sort */}
            <div className="flex items-center gap-3">
              <label htmlFor="sort-select" className="text-sm font-medium text-[var(--color-text)]">
                Sorteer:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 rounded-lg border-2 border-[var(--color-border)] focus:border-[var(--ff-color-primary-400)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-400)]/20 bg-white text-[var(--color-text)] cursor-pointer"
              >
                <option value="relevance">Relevantie</option>
                <option value="price-asc">Prijs: laag naar hoog</option>
                <option value="price-desc">Prijs: hoog naar laag</option>
                <option value="newest">Nieuwste eerst</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-[var(--color-muted)]">
              {isLoading ? (
                <span>Producten laden...</span>
              ) : (
                <span>
                  <strong className="text-[var(--color-text)] font-semibold">
                    {filteredProducts.length}
                  </strong>{' '}
                  {filteredProducts.length === 1 ? 'product' : 'producten'} gevonden
                </span>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-[var(--color-muted)]">Actieve filters:</span>
              {filters.brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => toggleBrandFilter(brand)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] rounded-full text-sm font-medium hover:bg-[var(--ff-color-primary-200)] transition-colors"
                  aria-label={`Verwijder filter: ${brand}`}
                >
                  <span>{brand}</span>
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              ))}
              <button
                onClick={clearFilters}
                className="text-sm text-[var(--color-muted)] hover:text-[var(--ff-color-primary-600)] underline transition-colors"
              >
                Wis alle filters
              </button>
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8 bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />
                  Filters
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[var(--ff-color-primary-600)] hover:underline"
                  >
                    Wis alles
                  </button>
                )}
              </div>

              {/* Brand Filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[var(--color-text)]">Merken</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableBrands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={() => toggleBrandFilter(brand)}
                        className="w-4 h-4 rounded border-2 border-[var(--color-border)] text-[var(--ff-color-primary-600)] focus:ring-2 focus:ring-[var(--ff-color-primary-400)]/20 cursor-pointer"
                      />
                      <span className="text-sm text-[var(--color-text)] group-hover:text-[var(--ff-color-primary-600)] transition-colors">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filters Drawer */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
              >
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Filters</h2>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 rounded-full hover:bg-[var(--color-bg)] transition-colors"
                      aria-label="Sluit filters"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Brand Filter */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Merken</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {availableBrands.map((brand) => (
                        <label
                          key={brand}
                          className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-[var(--color-bg)] transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={filters.brands.includes(brand)}
                            onChange={() => toggleBrandFilter(brand)}
                            className="w-5 h-5 rounded border-2 border-[var(--color-border)] text-[var(--ff-color-primary-600)] focus:ring-2 focus:ring-[var(--ff-color-primary-400)]/20 cursor-pointer"
                          />
                          <span className="text-base">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white rounded-xl font-bold hover:shadow-xl transition-all"
                  >
                    Toon {filteredProducts.length} producten
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid/List */}
          <div className="flex-1">
            {/* Loading State */}
            {isLoading && (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'
                    : 'space-y-4'
                }
                role="status"
                aria-live="polite"
                aria-label="Producten worden geladen"
              >
                <ProductCardSkeleton count={12} />
              </div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
                role="alert"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-8 h-8 text-red-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                  Er ging iets mis
                </h3>
                <p className="text-[var(--color-muted)] mb-6">
                  We konden de producten niet laden. Probeer het later opnieuw.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-[var(--ff-color-primary-600)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
                >
                  Opnieuw laden
                </button>
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
                role="status"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                  Geen producten gevonden
                </h3>
                <p className="text-[var(--color-muted)] mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? `Geen producten gevonden voor "${searchQuery}". Probeer andere zoektermen.`
                    : hasActiveFilters
                    ? 'Geen producten gevonden met deze filters. Probeer minder filters te gebruiken.'
                    : 'Er zijn momenteel geen producten beschikbaar.'}
                </p>
                {(searchQuery || hasActiveFilters) && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="px-6 py-3 bg-white border-2 border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-semibold hover:border-[var(--ff-color-primary-300)] transition-all"
                      >
                        Wis zoekopdracht
                      </button>
                    )}
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="px-6 py-3 bg-[var(--ff-color-primary-600)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
                      >
                        Wis alle filters
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && filteredProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
                    : 'space-y-4'
                }
                role="list"
                aria-label="Productenlijst"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.4 }}
                    role="listitem"
                  >
                    <ProductCard
                      id={product.id}
                      brand={product.brand || 'Unknown'}
                      title={product.title}
                      price={product.price}
                      imageUrl={product.imageUrl}
                      deeplink={product.deeplink || product.productUrl || '#'}
                      position={index}
                      context={{
                        page: 'shop',
                        view_mode: viewMode,
                        search_query: searchQuery,
                        active_filters: filters.brands
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
