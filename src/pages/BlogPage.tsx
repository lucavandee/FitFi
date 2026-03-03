import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Seo from '@/components/seo/Seo';
import { supabase } from '@/lib/supabaseClient';
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

function BlogCardSkeleton() {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden animate-pulse flex-shrink-0 w-[260px] sm:w-auto">
      <div className="aspect-[16/9] bg-[var(--color-border)]" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-[var(--color-border)] rounded w-4/5" />
        <div className="h-3 bg-[var(--color-border)] rounded w-2/3" />
        <div className="h-3 bg-[var(--color-border)] rounded w-full" />
        <div className="h-3 bg-[var(--color-border)] rounded w-3/4" />
      </div>
    </div>
  );
}

type CardProps = {
  post: UIBlogPost;
};

function BlogCard({ post }: CardProps) {
  return (
    <article
      className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lifted)] transition-shadow duration-200 flex flex-col group flex-shrink-0 w-[260px] sm:w-auto h-full"
    >
      <a
        href={`/blog/${post.slug}`}
        className="relative aspect-[16/9] bg-[var(--color-border)] overflow-hidden flex-shrink-0 block"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={post.image}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(4px)',
              color: 'var(--ff-color-primary-700)',
            }}
          >
            {post.category}
          </span>
        </div>
      </a>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-sm sm:text-base leading-snug text-[var(--color-text)] mb-2 line-clamp-2 group-hover:text-[var(--ff-color-primary-700)] transition-colors">
          <a
            href={`/blog/${post.slug}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded"
          >
            {post.title}
          </a>
        </h3>

        <div className="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-2 min-w-0">
          <img
            src={post.author.avatar}
            alt=""
            aria-hidden="true"
            className="w-5 h-5 rounded-full flex-shrink-0 object-cover"
          />
          <span className="truncate max-w-[80px]">{post.author.name}</span>
          <span className="flex-shrink-0 opacity-40">·</span>
          <span className="flex-shrink-0">{post.date}</span>
        </div>

        <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed line-clamp-2 flex-1 mb-3">
          {post.excerpt}
        </p>

        <div className="mt-auto">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ff-color-primary-700)]">
            Lees meer <ArrowRight className="w-3 h-3" />
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

  const featuredPost = useMemo(
    () => blogPosts.find((p) => p.featured) ?? blogPosts[0],
    [blogPosts]
  );
  const carouselPosts = useMemo(
    () => filteredPosts.filter((p) => p.id !== featuredPost?.id),
    [filteredPosts, featuredPost]
  );

  const scrollCarousel = (dir: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await supabase
        .from('newsletter_subscribers')
        .upsert({ email: email.trim() }, { onConflict: 'email' });
    } catch {
      // silent — user feedback via isSubscribed state is sufficient
    }
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  const activeFiltersCount = selectedCategory !== 'all' ? 1 : 0;

  return (
    <>
      <Seo
        title="Blog — FitFi"
        description="De nieuwste stijltips, seizoenstrends en mode-inzichten van FitFi. Praktische gidsen over silhouet, kleur en outfits."
        path="/blog"
        ogImage="/images/hf_20260221_210750_e12efd50-544c-4e35-986d-bfff9999542b.webp"
      />

      <div
        className="bg-[var(--color-bg)] text-[var(--color-text)]"
        style={{ minHeight: 'calc(100vh - 64px)' }}
      >

        {/* ── HERO ── */}
        <section
          className="relative overflow-hidden py-12 sm:py-16 md:py-20 border-b border-[var(--color-border)]"
          style={{
            background: 'linear-gradient(160deg, var(--ff-color-primary-50) 0%, var(--color-bg) 55%, var(--ff-color-primary-50) 100%)',
          }}
        >
          <div className="ff-container">
            <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
              <p className="text-xs sm:text-sm font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--ff-color-primary-600)' }}>
                Stijl & Mode
              </p>
              <h1
                className="font-heading font-bold tracking-tight mb-4 text-[var(--color-text)]"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1 }}
              >
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
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-3">

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
                <input
                  type="search"
                  placeholder="Zoek artikelen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Zoek artikelen"
                  className="w-full pl-11 pr-4 py-4 min-h-[52px] text-base rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-transparent transition-shadow shadow-[var(--shadow-soft)]"
                  style={{ color: 'var(--color-text)' }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-muted)] hover:text-[var(--color-text)] focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)]"
                    aria-label="Zoekopdracht wissen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setFiltersOpen((v) => !v)}
                aria-expanded={filtersOpen}
                aria-controls="filter-panel"
                className={`relative flex items-center gap-2 px-4 min-h-[52px] rounded-xl border text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 flex-shrink-0 ${
                  filtersOpen || activeFiltersCount > 0
                    ? 'border-[var(--ff-color-primary-700)]'
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)]'
                }`}
                style={
                  filtersOpen || activeFiltersCount > 0
                    ? { background: 'var(--ff-color-primary-700)', color: 'var(--color-bg)' }
                    : undefined
                }
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span
                    className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                    style={{ background: 'var(--color-bg)', color: 'var(--ff-color-primary-700)' }}
                  >
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </div>

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
                      className="text-xs font-semibold hover:underline focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)]"
                      style={{ color: 'var(--ff-color-primary-700)' }}
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
                      className="px-4 py-2 rounded-full text-xs font-semibold border transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-1"
                      style={
                        selectedCategory === cat
                          ? { background: 'var(--ff-color-primary-700)', color: 'var(--color-bg)', borderColor: 'var(--ff-color-primary-700)' }
                          : { background: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }
                      }
                    >
                      {cat === 'all' ? 'Alle artikelen' : cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!filtersOpen && selectedCategory !== 'all' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-muted)]">Filter:</span>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-colors"
                  style={{
                    background: 'var(--ff-color-primary-100)',
                    color: 'var(--ff-color-primary-700)',
                  }}
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
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--ff-color-primary-600)' }}>Uitgelicht</p>

              <article
                className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-lifted)] group hover:shadow-[var(--shadow-elevated)] transition-shadow duration-200"
              >
                <div className="relative h-52 sm:h-64 md:h-72 overflow-hidden">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    loading="eager"
                    fetchPriority="high"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(30,35,51,0.40) 0%, transparent 60%)' }}
                  />
                  <div className="absolute bottom-4 left-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                      style={{ background: 'rgba(255,255,255,0.95)', color: 'var(--ff-color-primary-700)' }}
                    >
                      {featuredPost.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-7">
                  <div className="flex items-center gap-3 text-xs text-[var(--color-muted)] mb-3">
                    <div className="flex items-center gap-2">
                      <img src={featuredPost.author.avatar} alt={featuredPost.author.name} className="w-6 h-6 rounded-full object-cover" />
                      <span>{featuredPost.author.name}</span>
                    </div>
                    <span aria-hidden="true">·</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{featuredPost.date}</span>
                    </div>
                  </div>

                  <h2
                    className="font-heading font-bold text-[var(--color-text)] mb-2 leading-snug group-hover:text-[var(--ff-color-primary-700)] transition-colors"
                    style={{ fontSize: 'clamp(1.2rem, 3vw, 1.75rem)' }}
                  >
                    <a
                      href={`/blog/${featuredPost.slug}`}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded"
                    >
                      {featuredPost.title}
                    </a>
                  </h2>

                  <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed mb-5 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  <a
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-xl font-semibold text-sm transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
                    style={{
                      background: 'var(--ff-color-primary-700)',
                      color: 'var(--color-bg)',
                    }}
                  >
                    Lees artikel
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                </div>
              </article>
            </div>
          </section>
        )}

        {/* ── ARTIKEL GRID / CARROUSEL ── */}
        <section className="ff-container pb-12 sm:pb-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">

            <div className="flex items-center justify-between mb-5">
              <h2
                className="font-heading font-bold text-[var(--color-text)]"
                style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}
              >
                {searchTerm || selectedCategory !== 'all' ? 'Resultaten' : 'Alle artikelen'}
                {!loading && (
                  <span className="ml-2 text-xs font-normal text-[var(--color-muted)]">
                    ({carouselPosts.length})
                  </span>
                )}
              </h2>

              {!loading && carouselPosts.length > 1 && (
                <div className="flex items-center gap-2 sm:hidden">
                  <button
                    onClick={() => scrollCarousel('left')}
                    aria-label="Vorige artikelen"
                    className="w-11 h-11 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--ff-color-primary-400)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollCarousel('right')}
                    aria-label="Volgende artikelen"
                    className="w-11 h-11 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--ff-color-primary-400)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {loading ? (
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
                  className="px-4 min-h-[44px] rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: 'var(--ff-color-primary-700)', color: 'var(--color-bg)' }}
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
                  className="text-sm font-semibold hover:underline"
                  style={{ color: 'var(--ff-color-primary-700)' }}
                >
                  Alle artikelen tonen
                </button>
              </div>
            ) : (
              <>
                <div
                  ref={carouselRef}
                  className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:hidden scrollbar-hide snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  role="list"
                  aria-label="Artikelen carrousel"
                >
                  {carouselPosts.map((post) => (
                    <div key={post.id} className="snap-start" role="listitem">
                      <BlogCard post={post} />
                    </div>
                  ))}
                </div>

                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:auto-rows-fr" role="list">
                  {carouselPosts.map((post) => (
                    <div key={post.id} role="listitem">
                      <BlogCard post={post} />
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </section>

        {/* ── NEWSLETTER ── */}
        <section className="ff-container pb-16 sm:pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div
              className="relative rounded-2xl p-8 sm:p-10 text-center overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, var(--ff-color-primary-600) 0%, var(--ff-color-primary-700) 100%)',
              }}
            >
              <div
                className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl pointer-events-none"
                style={{ background: 'rgba(247,243,236,0.10)' }}
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full blur-2xl pointer-events-none"
                style={{ background: 'rgba(247,243,236,0.10)' }}
                aria-hidden="true"
              />

              <div className="relative">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(247,243,236,0.20)' }}
                >
                  <Mail className="w-6 h-6" style={{ color: 'rgba(247,243,236,0.95)' }} />
                </div>
                <h2
                  className="font-heading font-bold mb-2"
                  style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', color: 'rgba(247,243,236,0.98)' }}
                >
                  Blijf op de hoogte
                </h2>
                <p
                  className="text-sm sm:text-base mb-6 max-w-sm mx-auto"
                  style={{ color: 'rgba(247,243,236,0.80)' }}
                >
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
                    autoComplete="email"
                    className="flex-1 px-4 py-4 min-h-[52px] rounded-xl text-base focus:outline-none focus:ring-2 placeholder:text-[var(--color-muted)]"
                    style={{
                      background: 'var(--color-surface)',
                      color: 'var(--color-text)',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!email}
                    className="px-5 min-h-[52px] rounded-xl font-semibold text-sm border transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
                    style={{
                      background: 'rgba(247,243,236,0.20)',
                      color: 'rgba(247,243,236,0.95)',
                      borderColor: 'rgba(247,243,236,0.30)',
                    }}
                  >
                    {isSubscribed ? 'Aangemeld!' : 'Aanmelden'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
