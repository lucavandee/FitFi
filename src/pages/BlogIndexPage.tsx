import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';
import { Search, Calendar, User, ArrowRight, Clock, Tag } from 'lucide-react';
import Button from '@/components/ui/Button';
import ErrorBoundary from '@/components/ErrorBoundary';

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
    slug: 'psychologie-achter-kledingkeuzes'
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
    slug: 'stijlregels-breken-2025'
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
    slug: 'capsule-wardrobe-gids'
  }
];

const BlogIndexPage: React.FC = () => {
  const [q, setQ] = useState('');

  const filtered = MOCK.filter(p =>
    [p.title, p.excerpt, p.author, p.category].join(' ').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <ErrorBoundary>
      <Seo
        title="Blog — Stijl, psychologie & AI-advies"
        description="Korte, toepasbare stukken over stijlpsychologie, capsules en AI-styling."
        canonical="https://www.fitfi.ai/blog"
      />
      <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        <section className="section">
          <div className="container">
            <header className="max-w-3xl">
              <h1 className="hero__title">Blog</h1>
              <p className="lead mt-2">Praktische inzichten over stijl, psychologie en AI-advies.</p>
            </header>

            {/* Search */}
            <div className="mt-6 flex items-center gap-2">
              <div className="input input--with-icon w-full">
                <Search className="input__icon" />
                <input
                  aria-label="Zoek in blog"
                  placeholder="Zoek artikelen…"
                  className="input__field"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <Button as={Link as any} to="/feed" variant="ghost">Naar feed</Button>
            </div>

            {/* Grid */}
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {filtered.map((p) => (
                <article key={p.id} className="card interactive-elevate h-full">
                  <div className="card__media">
                    <img src={p.imageUrl} alt="" className="w-full h-48 object-cover" loading="lazy" decoding="async" />
                  </div>
                  <div className="card__inner">
                    <div className="flex items-center gap-3 text-xs muted">
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{p.date}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{p.readTime}</span>
                      <span className="inline-flex items-center gap-1"><Tag className="w-3 h-3" />{p.category}</span>
                    </div>
                    <h2 className="card__title mt-2">{p.title}</h2>
                    <p className="mt-1">{p.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm muted">Door {p.author}</span>
                      <Link to={`/blog/${p.slug}`} className="btn btn-ghost btn-sm inline-flex items-center gap-1">
                        Lees meer <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="mt-8 text-center">
                <p className="muted">Geen artikelen gevonden voor "{q}"</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </ErrorBoundary>
  );
};

export default BlogIndexPage;