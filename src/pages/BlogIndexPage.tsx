import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';
import { Search, Calendar, ArrowRight, Clock, Tag, TrendingUp, BookOpen, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import ErrorBoundary from '@/components/ErrorBoundary';
import { track } from '@/utils/analytics';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  imageUrl: string;
  slug: string;
  views?: number;
  featured?: boolean;
}

const MOCK: BlogPost[] = [
  {
    id: '1',
    title: 'De Psychologie Achter Jouw Kledingkeuzes',
    excerpt: 'Wat je stijlvoorkeuren over je persoonlijkheid vertellen — en hoe je dit benut.',
    author: 'Dr. Sarah van der Berg',
    date: '2024-12-15',
    readTime: '5 min',
    category: 'Psychologie',
    imageUrl: '/images/blog/psychologie.jpg',
    slug: 'psychologie-achter-kledingkeuzes',
    views: 2847,
    featured: true
  },
  {
    id: '2',
    title: '5 Stijlregels Die Je Kunt Breken in 2025',
    excerpt: 'Wanneer "regels" je beperken — en hoe je ze slim doorbreekt zonder je stijl te verliezen.',
    author: 'Nova (AI)',
    date: '2025-01-02',
    readTime: '4 min',
    category: 'Stijlregels',
    imageUrl: '/images/blog/regles-breken.jpg',
    slug: 'stijlregels-breken-2025',
    views: 1923
  },
  {
    id: '3',
    title: 'Capsule Wardrobe: Minder Spullen, Meer Stijl',
    excerpt: 'De bouwstenen van een garderobe die jarenlang werkt — voor elk seizoen.',
    author: 'Team FitFi',
    date: '2025-02-10',
    readTime: '6 min',
    category: 'Capsule',
    imageUrl: '/images/blog/capsule.jpg',
    slug: 'capsule-wardrobe-gids',
    views: 3156,
    featured: true
  },
  {
    id: '4',
    title: 'AI vs Personal Shopper: Wat Werkt Beter?',
    excerpt: 'Een eerlijke vergelijking tussen AI-styling en traditioneel stylingadvies.',
    author: 'Team FitFi',
    date: '2025-01-20',
    readTime: '7 min',
    category: 'AI & Tech',
    imageUrl: '/images/blog/ai-vs-human.jpg',
    slug: 'ai-vs-personal-shopper',
    views: 1654
  },
  {
    id: '5',
    title: 'Duurzame Mode: Kwaliteit Herkennen',
    excerpt: 'Hoe je kledingstukken kiest die jaren meegaan — materialen, merken en tips.',
    author: 'Emma Sustainable',
    date: '2025-01-15',
    readTime: '8 min',
    category: 'Duurzaamheid',
    imageUrl: '/images/blog/sustainable-fashion.jpg',
    slug: 'duurzame-mode-kwaliteit',
    views: 2341
  },
  {
    id: '6',
    title: 'Kleuranalyse: Vind Jouw Perfecte Palette',
    excerpt: 'Welke kleuren laten jouw huid stralen? Een praktische gids voor kleurtemperatuur.',
    author: 'Color Expert Lisa',
    date: '2025-01-08',
    readTime: '6 min',
    category: 'Kleur & Stijl',
    imageUrl: '/images/blog/color-analysis.jpg',
    slug: 'kleuranalyse-perfecte-palette',
    views: 2789
  }
];

const CATEGORIES = ['Alle', 'Psychologie', 'Stijlregels', 'Capsule', 'AI & Tech', 'Duurzaamheid', 'Kleur & Stijl'];

const BlogIndexPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'featured'>('featured');

  useEffect(() => {
    try {
      track('page_view', {
        page: 'blog_index',
        path: '/blog',
        title: 'Blog Index'
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }, []);

  const handleSearch = (value: string) => {
    setQ(value);
    try {
      track('blog_search', {
        query: value,
        results_count: filtered.length
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    try {
      track('blog_filter', {
        filter_type: 'category',
        filter_value: category,
        results_count: filtered.length
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  };

  const handleSortChange = (sort: 'date' | 'views' | 'featured') => {
    setSortBy(sort);
    try {
      track('blog_sort', {
        sort_by: sort
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  };

  const handlePostClick = (post: BlogPost) => {
    try {
      track('blog_post_click', {
        post_id: post.id,
        post_title: post.title,
        post_category: post.category,
        post_author: post.author,
        from_page: 'blog_index'
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  };

  let filtered = MOCK.filter(p => {
    const matchesSearch = [p.title, p.excerpt, p.author, p.category].join(' ').toLowerCase().includes(q.toLowerCase());
    const matchesCategory = selectedCategory === 'Alle' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort posts
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'featured') {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'views') {
      return (b.views || 0) - (a.views || 0);
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const featuredPosts = MOCK.filter(p => p.featured);
  const totalViews = MOCK.reduce((sum, p) => sum + (p.views || 0), 0);

  return (
    <ErrorBoundary>
      <Seo
        title="Blog — Stijl, psychologie & AI-advies"
        description="Korte, toepasbare stukken over stijlpsychologie, capsules en AI-styling."
        canonical="https://www.fitfi.ai/blog"
      />
      <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        {/* Hero Section */}
        <section className="section" style={{ background: 'linear-gradient(135deg, var(--color-bg) 0%, var(--color-surface) 100%)' }}>
          <div className="container">
            <header className="max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[color:var(--color-primary)] to-[color:var(--color-accent)] flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="chip">Kennis & Inspiratie</span>
              </div>
              <h1 className="hero__title">Blog</h1>
              <p className="lead mt-2">Praktische inzichten over stijl, psychologie en AI-advies.</p>
            </header>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              <div className="text-center">
                <div className="metric__value text-lg">{MOCK.length}</div>
                <div className="metric__label">Artikelen</div>
              </div>
              <div className="text-center">
                <div className="metric__value text-lg">{Math.round(totalViews / 1000)}k</div>
                <div className="metric__label">Views</div>
              </div>
              <div className="text-center">
                <div className="metric__value text-lg">{featuredPosts.length}</div>
                <div className="metric__label">Featured</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters & Search */}
        <section className="section pt-0">
          <div className="container">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--color-muted)]" aria-hidden="true" />
                <input
                  aria-label="Zoek in blog"
                  placeholder="Zoek artikelen…"
                  className="input__field pl-9 w-full"
                  value={q}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-3">
                {/* Sort */}
                <select 
                  value={sortBy} 
                  onChange={(e) => handleSortChange(e.target.value as 'date' | 'views' | 'featured')}
                  className="input__field text-sm"
                  aria-label="Sorteer artikelen"
                >
                  <option value="featured">Featured eerst</option>
                  <option value="date">Nieuwste eerst</option>
                  <option value="views">Meest gelezen</option>
                </select>
                
                <Button 
                  as={Link as any} 
                  to="/feed" 
                  variant="ghost"
                  onClick={() => track('cta_click', { cta_text: 'Naar feed', location: 'blog_header' })}
                >
                  <Users className="w-4 h-4" />
                  Naar feed
                </Button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`chip transition-all hover:scale-105 ${
                    selectedCategory === category 
                      ? 'bg-[color:var(--color-primary)] text-white border-[color:var(--color-primary)]' 
                      : 'hover:border-[color:var(--color-primary)]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Results count */}
            {q && (
              <div className="mt-4 text-sm text-[color:var(--color-muted)]">
                {filtered.length} resultaten voor "{q}"
              </div>
            )}
          </div>
        </section>

        {/* Blog Grid */}
        <section className="section pt-0">
          <div className="container">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <article 
                  key={post.id} 
                  className="card interactive-elevate h-full group cursor-pointer"
                  onClick={() => handlePostClick(post)}
                >
                  <div className="card__media relative overflow-hidden">
                    <img 
                      src={post.imageUrl} 
                      alt="" 
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
                      loading="lazy" 
                      decoding="async" 
                    />
                    {post.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="chip bg-gradient-to-r from-[color:var(--color-primary)] to-[color:var(--color-accent)] text-white border-0">
                          <TrendingUp className="w-3 h-3" />
                          Featured
                        </span>
                      </div>
                    )}
                    {post.views && (
                      <div className="absolute top-3 right-3">
                        <span className="chip bg-black/20 backdrop-blur-sm text-white border-0 text-xs">
                          {post.views > 1000 ? `${Math.round(post.views / 1000)}k` : post.views} views
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="card__inner">
                    <div className="flex items-center gap-3 text-xs text-[color:var(--color-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.date).toLocaleDateString('nl-NL', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {post.category}
                      </span>
                    </div>
                    
                    <h2 className="card__title mt-2 group-hover:text-[color:var(--color-primary)] transition-colors">
                      {post.title}
                    </h2>
                    <p className="mt-1 text-sm opacity-90">{post.excerpt}</p>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-[color:var(--color-muted)]">Door {post.author}</span>
                      <Link 
                        to={`/blog/${post.slug}`} 
                        className="btn btn-ghost text-sm inline-flex items-center gap-1 group-hover:text-[color:var(--color-primary)] transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePostClick(post);
                        }}
                      >
                        Lees meer 
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[color:var(--color-primary)] to-[color:var(--color-accent)] flex items-center justify-center">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Geen artikelen gevonden</h3>
                <p className="text-[color:var(--color-muted)] mb-4">
                  Probeer een andere zoekterm of filter.
                </p>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setQ('');
                    setSelectedCategory('Alle');
                  }}
                >
                  Reset filters
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="section" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}>
          <div className="container text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-3">
                Klaar voor persoonlijk stijladvies?
              </h2>
              <p className="text-white/90 mb-6">
                Ontdek outfits die perfect bij jou passen — met uitleg waarom ze werken.
              </p>
              <Button 
                as={Link as any} 
                to="/registreren" 
                variant="ghost"
                size="lg"
                className="bg-white text-[color:var(--color-primary)] hover:bg-white/90"
                onClick={() => track('cta_click', { cta_text: 'Start gratis', location: 'blog_bottom' })}
              >
                <ArrowRight className="w-5 h-5" />
                Start gratis
              </Button>
            </div>
          </div>
        </section>
      </main>
    </ErrorBoundary>
  );
};

export default BlogIndexPage;