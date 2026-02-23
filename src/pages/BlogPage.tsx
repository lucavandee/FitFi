import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  ArrowRight,
  Mail,
  Filter,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getPublishedBlogPosts, transformBlogPostForUI, type UIBlogPost } from '@/services/blog/blogService';
import { canonicalUrl } from '@/utils/urls';

function BlogCardSkeleton() {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden animate-pulse flex-shrink-0 w-[280px] sm:w-auto">
      <div className="h-44 bg-[var(--color-border)]" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-[var(--color-border)] rounded w-1/3" />
        <div className="h-4 bg-[var(--color-border)] rounded w-4/5" />
        <div className="h-3 bg-[var(--color-border)] rounded w-full" />
        <div className="h-3 bg-[var(--color-border)] rounded w-2/3" />
      </div>
    </div>
  );
}

type CardProps = {
  post: UIBlogPost;
  onNavigate: (slug: string) => void;
};

function BlogCard({ post, onNavigate }: CardProps) {
  return (
    <article
      className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lifted)] transition-shadow duration-200 flex flex-col cursor-pointer group flex-shrink-0 w-[280px] sm:w-auto"
      onClick={() => onNavigate(post.slug)}
      tabIndex={0}
      role="link"
      aria-label={`Lees artikel: ${post.title}`}
      onKeyDown={(e) => e.key === 'Enter' && onNavigate(post.slug)}
    >
      <div className="relative h-44 bg-[var(--color-border)] overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[var(--ff-color-primary-700)] rounded-full text-xs font-semibold shadow-sm">
            {post.category}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-2">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{post.date}</span>
        </div>

        <h3 className="font-bold text-sm sm:text-base leading-snug text-[var(--color-text)] mb-2 line-clamp-2 group-hover:text-[var(--ff-color-primary-700)] transition-colors">
          {post.title}
        </h3>

        <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed line-clamp-2 flex-1 mb-4">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-7 h-7 rounded-full flex-shrink-0 object-cover"
            />
            <span className="text-xs text-[var(--color-muted)] truncate">{post.author.name}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ff-color-primary-700)] flex-shrink-0">
            Lees meer <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

export default function BlogPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [blogPosts, setBlogPosts] = useState<UIBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadBlogPosts() {
      try {
        const posts = await getPublishedBlogPosts(100, 0);
        const transformedPosts = posts.map(transformBlogPostForUI);
        setBlogPosts(transformedPosts);
        setError(null);
      } catch {
        setError('Kon blogposts niet laden. Probeer het later opnieuw.');
      } finally {
        setLoading(false);
      }
    }
    loadBlogPosts();
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(blogPosts.map((p) => p.category)));
    return ['all', ...cats];
  }, [blogPosts]);

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, blogPosts]);

  const featuredPost = blogPosts.find((p) => p.featured) || blogPosts[0];
  const carouselPosts = filteredPosts.filter((p) => p.id !== featuredPost?.id);

  const handleNavigate = (slug: string) => navigate(`/blog/${slug}`);

  const scrollCarousel = (dir: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = 300;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const activeFiltersCount = selectedCategory !== 'all' ? 1 : 0;

  return (
    <main id="main" className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Blog – FitFi</title>
        <meta name="description" content="De nieuwste stijltips, seizoenstrends en mode-inzichten van FitFi. Praktische gidsen over silhouet, kleur en outfits." />
        <link rel="canonical" href={canonicalUrl('/blog')} />
      </Helmet>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-12 sm:py-16 md:py-20 border-b border-[var(--color-border)]">
        <div className="ff-container">
          <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
            <p className="text-xs sm:text-sm font-medium text-[var(--ff-color-primary-600)] uppercase tracking-widest mb-3">
              Stijl & Mode
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4 leading-tight tracking-tight">
              Inzichten voor jouw stijl
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-muted)] max-w-xl mx-auto leading-relaxed">
              Praktische gidsen over silhouet, kleur en outfits — premium stijl, nuchtere uitleg.
            </p>
          </div>
        </div>
      </section>

      {/* ── SEARCH + FILTER ── */}
      <section className="ff-container py-6 sm:py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-3">

          {/* Search bar — full width */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
              <input
                type="search"
                placeholder="Zoek artikelen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Zoek artikelen"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-transparent transition-shadow shadow-[var(--shadow-soft)]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--color-muted)] hover:text-[var(--color-text)] focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)]"
                  aria-label="Zoekopdracht wissen"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter toggle button */}
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              aria-controls="filter-panel"
              className={`relative flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 flex-shrink-0 ${
                filtersOpen || activeFiltersCount > 0
                  ? 'bg-[var(--ff-color-primary-700)] text-white border-[var(--ff-color-primary-700)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)]'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-[var(--ff-color-primary-700)] text-xs font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
          </div>

          {/* Collapsible filter panel */}
          {filtersOpen && (
            <div
              id="filter-panel"
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">Categorie</p>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs text-[var(--ff-color-primary-700)] font-semibold hover:underline focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)]"
                  >
                    Wis filter
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    aria-pressed={selectedCategory === cat}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-1 ${
                      selectedCategory === cat
                        ? 'bg-[var(--ff-color-primary-700)] text-white border-[var(--ff-color-primary-700)]'
                        : 'bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] hover:bg-[var(--ff-color-primary-50)]'
                    }`}
                  >
                    {cat === 'all' ? 'Alle artikelen' : cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active filter pill */}
          {!filtersOpen && selectedCategory !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-muted)]">Filter:</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] rounded-full text-xs font-semibold hover:bg-[var(--ff-color-primary-200)] transition-colors"
              >
                {selectedCategory}
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

        </div>
      </section>

      {/* ── FEATURED ARTICLE ── */}
      {!loading && featuredPost && (
        <section className="ff-container pb-8 sm:pb-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--ff-color-primary-600)] mb-3">Uitgelicht</p>

            <article
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-lifted)] cursor-pointer group hover:shadow-[var(--shadow-elevated)] transition-shadow duration-200"
              onClick={() => handleNavigate(featuredPost.slug)}
              tabIndex={0}
              role="link"
              aria-label={`Lees uitgelicht artikel: ${featuredPost.title}`}
              onKeyDown={(e) => e.key === 'Enter' && handleNavigate(featuredPost.slug)}
            >
              {/* Cover foto bovenaan */}
              <div className="relative h-52 sm:h-64 md:h-72 overflow-hidden">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-white/95 text-[var(--ff-color-primary-700)] rounded-full text-xs font-bold shadow-sm">
                    {featuredPost.category}
                  </span>
                </div>
              </div>

              {/* Titel, intro, CTA */}
              <div className="p-5 sm:p-7">
                <div className="flex items-center gap-3 text-xs text-[var(--color-muted)] mb-3">
                  <div className="flex items-center gap-1.5">
                    <img src={featuredPost.author.avatar} alt={featuredPost.author.name} className="w-6 h-6 rounded-full object-cover" />
                    <span>{featuredPost.author.name}</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{featuredPost.date}</span>
                  </div>
                </div>

                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--color-text)] mb-2 leading-snug group-hover:text-[var(--ff-color-primary-700)] transition-colors">
                  {featuredPost.title}
                </h2>

                <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed mb-5 line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--ff-color-primary-600)] transition-colors shadow-sm">
                  Lees artikel
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* ── ARTIKEL GRID / CARROUSEL ── */}
      <section className="ff-container pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Header met result count */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-base sm:text-lg text-[var(--color-text)]">
              {searchTerm || selectedCategory !== 'all' ? 'Resultaten' : 'Alle artikelen'}
              {!loading && (
                <span className="ml-2 text-xs font-normal text-[var(--color-muted)]">
                  ({carouselPosts.length})
                </span>
              )}
            </h2>

            {/* Carousel scroll controls — only on mobile */}
            {!loading && carouselPosts.length > 1 && (
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  onClick={() => scrollCarousel('left')}
                  aria-label="Vorige artikelen"
                  className="w-8 h-8 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--ff-color-primary-400)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  aria-label="Volgende artikelen"
                  className="w-8 h-8 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--ff-color-primary-400)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {loading ? (
            /* Skeleton state — mobile carrousel, desktop grid */
            <>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:hidden scrollbar-hide snap-x snap-mandatory">
                {[...Array(4)].map((_, i) => <BlogCardSkeleton key={i} />)}
              </div>
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => <BlogCardSkeleton key={i} />)}
              </div>
            </>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-[var(--color-muted)] text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--ff-color-primary-600)] transition-colors"
              >
                Probeer opnieuw
              </button>
            </div>
          ) : carouselPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-semibold text-[var(--color-text)] mb-1">Geen artikelen gevonden</p>
              <p className="text-sm text-[var(--color-muted)] mb-4">Probeer een andere zoekterm of filter.</p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                className="text-sm font-semibold text-[var(--ff-color-primary-700)] hover:underline"
              >
                Alle artikelen tonen
              </button>
            </div>
          ) : (
            <>
              {/* Mobile: horizontal scroll carousel */}
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:hidden scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                role="list"
                aria-label="Artikelen carrousel"
              >
                {carouselPosts.map((post) => (
                  <div key={post.id} className="snap-start" role="listitem">
                    <BlogCard post={post} onNavigate={handleNavigate} />
                  </div>
                ))}
              </div>

              {/* Desktop: responsive grid */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5" role="list">
                {carouselPosts.map((post) => (
                  <div key={post.id} role="listitem">
                    <BlogCard post={post} onNavigate={handleNavigate} />
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="ff-container pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="relative bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] rounded-2xl p-8 sm:p-10 text-center overflow-hidden shadow-2xl">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Blijf op de hoogte</h2>
              <p className="text-sm sm:text-base text-white/80 mb-6 max-w-sm mx-auto">
                Nieuwste stijltips en mode-inzichten direct in je inbox.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
                <label htmlFor="newsletter-email" className="sr-only">E-mailadres</label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Je e-mailadres"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 rounded-xl text-sm bg-white text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-white/60 placeholder:text-[var(--color-muted)]"
                />
                <button
                  type="submit"
                  disabled={!email}
                  className="px-5 py-3 rounded-xl font-semibold text-sm bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ff-color-primary-700)]"
                >
                  {isSubscribed ? 'Aangemeld!' : 'Aanmelden'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
