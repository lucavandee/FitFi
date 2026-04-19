import React, { useState, useMemo, useEffect, useRef } from 'react';
import Seo from '@/components/seo/Seo';
import { supabase } from '@/lib/supabaseClient';
import {
  Search,
  Calendar,
  ArrowRight,
  Mail,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getPublishedBlogPosts, transformBlogPostForUI, type UIBlogPost } from '@/services/blog/blogService';

function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden animate-pulse h-full">
      <div className="aspect-[16/10] bg-[#E5E5E5]" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-[#E5E5E5] rounded-full w-4/5" />
        <div className="h-3 bg-[#E5E5E5] rounded-full w-2/3" />
        <div className="h-3 bg-[#E5E5E5] rounded-full w-full" />
        <div className="h-3 bg-[#E5E5E5] rounded-full w-3/4" />
      </div>
    </div>
  );
}

type CardProps = {
  post: UIBlogPost;
  style?: React.CSSProperties;
};

function BlogCard({ post, style }: CardProps) {
  const initials = post.author.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:border-[#C2654A] transition-all duration-300 group flex flex-col h-full"
      style={style}
    >
      <a
        href={`/blog/${post.slug}`}
        className="relative aspect-[16/10] overflow-hidden flex-shrink-0 block"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-semibold text-[#1A1A1A]">
            {post.category}
          </span>
        </div>
      </a>

      <div className="p-7 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-[#1A1A1A] leading-snug mb-3 line-clamp-2 group-hover:text-[#C2654A] transition-colors duration-200">
          <a
            href={`/blog/${post.slug}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/40 rounded"
          >
            {post.title}
          </a>
        </h3>

        <div className="flex items-center gap-2.5 mb-3">
          {post.author.avatar ? (
            <img
              src={post.author.avatar}
              alt=""
              aria-hidden="true"
              className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#F4E8E3] flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-[#C2654A]">{initials}</span>
            </div>
          )}
          <span className="text-xs font-medium text-[#4A4A4A] truncate max-w-[80px]">{post.author.name}</span>
          <span className="text-xs text-[#8A8A8A] opacity-60" aria-hidden="true">·</span>
          <span className="text-xs text-[#8A8A8A] flex-shrink-0">{post.date}</span>
        </div>

        <p className="text-sm text-[#4A4A4A] leading-[1.6] line-clamp-2 mb-4 flex-1">
          {post.excerpt}
        </p>

        <div className="mt-auto">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C2654A] hover:text-[#A8513A] transition-colors duration-200">
            Lees meer <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

export default function BlogPage() {
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

      <div className="min-h-screen bg-[#FAFAF8]">

        {/* ════════════════════════════════════════════════════
            PAGE HERO
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#F5F0EB] pt-44 pb-12 md:pt-52 md:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="max-w-3xl mx-auto text-center"
              style={{
                opacity: 0,
                transform: 'translateY(40px)',
                animation: 'revealUp 0.9s ease forwards',
              }}
            >
              <div className="inline-flex items-center gap-2.5 mb-6">
                <span className="w-6 h-px bg-[#C2654A]" aria-hidden="true" />
                <span className="text-xs font-semibold tracking-[2.5px] uppercase text-[#C2654A]">
                  Stijl &amp; mode
                </span>
                <span className="w-6 h-px bg-[#C2654A]" aria-hidden="true" />
              </div>

              <h1 className="text-[32px] md:text-[56px] text-[#1A1A1A] leading-[1.05] mb-6">
                <span className="font-serif italic">Inzichten voor jouw </span>
                <span className="font-sans font-bold">stijl</span>
              </h1>

              <p className="text-lg text-[#4A4A4A] leading-[1.7] max-w-[520px] mx-auto">
                Praktische gidsen over silhouet, kleur en outfits. Premium stijl, nuchtere uitleg.
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            ZOEKBALK + FILTERS
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#FAFAF8] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 max-w-[880px] mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A8A] pointer-events-none" />
                <input
                  type="search"
                  placeholder="Zoek artikelen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Zoek artikelen"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E5E5E5] rounded-2xl text-base text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#C2654A]/20 focus:border-[#C2654A] transition-colors duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors"
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
                className={`flex items-center gap-2 px-5 py-3.5 bg-white border rounded-2xl text-sm font-medium text-[#4A4A4A] hover:border-[#C2654A] transition-colors duration-200 flex-shrink-0 ${
                  filtersOpen || activeFiltersCount > 0
                    ? 'border-[#C2654A] text-[#C2654A]'
                    : 'border-[#E5E5E5]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#C2654A] text-white text-xs font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </div>

            {filtersOpen && (
              <div
                id="filter-panel"
                className="max-w-[880px] mx-auto mt-3 bg-white border border-[#E5E5E5] rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#8A8A8A]">Categorie</p>
                  {selectedCategory !== 'all' && (
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="text-xs font-semibold text-[#C2654A] hover:text-[#A8513A] transition-colors"
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
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                        selectedCategory === cat
                          ? 'bg-[#C2654A] text-white border-[#C2654A]'
                          : 'bg-white text-[#1A1A1A] border-[#E5E5E5] hover:border-[#C2654A]'
                      }`}
                    >
                      {cat === 'all' ? 'Alle artikelen' : cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!filtersOpen && selectedCategory !== 'all' && (
              <div className="flex items-center gap-2 max-w-[880px] mx-auto mt-3">
                <span className="text-xs text-[#8A8A8A]">Filter:</span>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F4E8E3] text-[#C2654A] transition-colors"
                >
                  {selectedCategory}
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            UITGELICHT ARTIKEL
        ════════════════════════════════════════════════════ */}
        {!loading && featuredPost && (
          <section className="bg-[#FAFAF8] pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className="max-w-[1040px] mx-auto mb-16"
                style={{
                  opacity: 0,
                  transform: 'translateY(40px)',
                  animation: 'revealUp 0.9s ease 0.12s forwards',
                }}
              >
                <p className="text-xs font-semibold tracking-[1.5px] uppercase text-[#8A8A8A] mb-3">
                  Uitgelicht
                </p>

                <article className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-shadow duration-300 group">
                  <a href={`/blog/${featuredPost.slug}`} className="block relative w-full aspect-[21/9] overflow-hidden" tabIndex={-1} aria-hidden="true">
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      loading="eager"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,26,26,0.35) 0%, transparent 55%)' }} />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#1A1A1A]">
                        {featuredPost.category}
                      </span>
                    </div>
                  </a>

                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 text-xs text-[#8A8A8A] mb-4">
                      <div className="flex items-center gap-2">
                        <img src={featuredPost.author.avatar} alt={featuredPost.author.name} className="w-6 h-6 rounded-full object-cover" />
                        <span className="text-[#4A4A4A] font-medium">{featuredPost.author.name}</span>
                      </div>
                      <span aria-hidden="true">·</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{featuredPost.date}</span>
                      </div>
                    </div>

                    <h2 className="text-2xl md:text-[28px] font-bold text-[#1A1A1A] leading-snug mb-3 group-hover:text-[#C2654A] transition-colors duration-200">
                      <a href={`/blog/${featuredPost.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/40 rounded">
                        {featuredPost.title}
                      </a>
                    </h2>

                    <p className="text-base text-[#4A4A4A] leading-relaxed mb-6 line-clamp-3 max-w-2xl">
                      {featuredPost.excerpt}
                    </p>

                    <a
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-2 bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                    >
                      Lees artikel
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              </div>
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════════════
            ARTIKEL GRID
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#FAFAF8] pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-[#1A1A1A]">
                {searchTerm || selectedCategory !== 'all' ? 'Resultaten' : 'Alle artikelen'}
                {!loading && (
                  <span className="text-[#8A8A8A] font-normal ml-1">({carouselPosts.length})</span>
                )}
              </h2>

              {!loading && carouselPosts.length > 1 && (
                <div className="flex items-center gap-2 sm:hidden">
                  <button
                    onClick={() => scrollCarousel('left')}
                    aria-label="Vorige artikelen"
                    className="w-11 h-11 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center text-[#8A8A8A] hover:text-[#1A1A1A] hover:border-[#C2654A] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollCarousel('right')}
                    aria-label="Volgende artikelen"
                    className="w-11 h-11 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center text-[#8A8A8A] hover:text-[#1A1A1A] hover:border-[#C2654A] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:hidden" style={{ scrollbarWidth: 'none' }}>
                  {[...Array(4)].map((_, i) => <BlogCardSkeleton key={i} />)}
                </div>
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => <BlogCardSkeleton key={i} />)}
                </div>
              </>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-[#8A8A8A] text-sm mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 rounded-xl text-sm font-semibold bg-[#C2654A] text-white hover:bg-[#A8513A] transition-colors"
                >
                  Probeer opnieuw
                </button>
              </div>
            ) : carouselPosts.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-semibold text-[#1A1A1A] mb-1">Geen artikelen gevonden</p>
                <p className="text-sm text-[#8A8A8A] mb-4">Probeer een andere zoekterm of filter.</p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                  className="text-sm font-semibold text-[#C2654A] hover:text-[#A8513A] transition-colors"
                >
                  Alle artikelen tonen
                </button>
              </div>
            ) : (
              <>
                <div
                  ref={carouselRef}
                  className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:hidden snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  role="list"
                  aria-label="Artikelen carrousel"
                >
                  {carouselPosts.map((post) => (
                    <div key={post.id} className="snap-start flex-shrink-0 w-[280px]" role="listitem">
                      <BlogCard post={post} />
                    </div>
                  ))}
                </div>

                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:auto-rows-fr" role="list">
                  {carouselPosts.map((post, i) => (
                    <div key={post.id} role="listitem">
                      <BlogCard
                        post={post}
                        style={{
                          opacity: 0,
                          transform: 'translateY(40px)',
                          animation: `revealUp 0.9s ease ${0.06 * i}s forwards`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            NEWSLETTER
        ════════════════════════════════════════════════════ */}
        <section className="py-24 bg-[#FAFAF8]">
          <div
            className="max-w-[640px] mx-auto text-center px-6"
            style={{
              opacity: 0,
              transform: 'translateY(40px)',
              animation: 'revealUp 0.9s ease 0.1s forwards',
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#F5F0EB] flex items-center justify-center mx-auto mb-6">
              <Mail className="w-6 h-6 text-[#C2654A]" />
            </div>

            <h3 className="font-serif italic text-3xl text-[#1A1A1A] mb-3">
              Blijf op de hoogte
            </h3>

            <p className="text-base text-[#4A4A4A] mb-8">
              Nieuwste stijltips en mode-inzichten direct in je inbox.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex gap-3 max-w-[460px] mx-auto">
              <label htmlFor="newsletter-email" className="sr-only">E-mailadres</label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Je e-mailadres"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="flex-1 bg-white border border-[#E5E5E5] rounded-full py-3.5 px-6 text-sm text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#C2654A]/20 focus:border-[#C2654A] transition-colors duration-200"
              />
              <button
                type="submit"
                disabled={!email}
                className="bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl transition-all duration-300 hover:-translate-y-0.5 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribed ? 'Aangemeld!' : 'Aanmelden'}
              </button>
            </form>
          </div>
        </section>

      </div>

      <style>{`
        @keyframes revealUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
