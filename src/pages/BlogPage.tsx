import React from "react";
import PageHero from "@/components/marketing/PageHero";
import posts from "@/data/blogPosts";
import SmartImage from "@/components/media/SmartImage";
import { useFadeInOnVisible } from "@/hooks/useFadeInOnVisible";
import { Heart, Smartphone, Sparkles } from "lucide-react";

// Categorieën voor filter-chips (we tonen ze nog niet interactief, maar het geeft context)
const CATEGORIES = ["Silhouet", "Kleur", "Garderobe", "Gidsen"];

// Extra secties om de blogpagina meer diepgang en premium gevoel te geven.
const BLOG_EXTRA = [
  {
    icon: Heart,
    title: "Comfort & performance",
    desc:
      "Onze content is gebaseerd op premium materialen en high‑performance silhouetten. We laten je zien hoe je kleding kiest die goed voelt én er goed uitziet.",
  },
  {
    icon: Smartphone,
    title: "Minimalistisch design & tech",
    desc:
      "FitFi staat voor rust en vooruitgang: een brug tussen modieuze eenvoud en slimme technologie. Denk aan de minimalistische finesse van Apple gecombineerd met de comfortstandaard van Lululemon.",
  },
  {
    icon: Sparkles,
    title: "Inzichten & inspiratie",
    desc:
      "Onze artikelen zijn kort maar krachtig. Elk stuk biedt je meteen toepasbare inzichten over silhouet, kleurtemperatuur en kapsels, zonder ruis.",
  },
];

// Testimonials om sociale bewijskracht toe te voegen.
const TESTIMONIALS = [
  {
    quote:
      "De blog van FitFi hielp me eindelijk begrijpen waarom sommige outfits me krachtiger laten voelen. Kort, helder en direct toepasbaar.",
    name: "Lotte",
    location: "Amsterdam",
  },
  {
    quote:
      "Ik dacht dat ik alles wist over kleurtemperatuur, maar deze gidsen brachten structuur in mijn keuzes. Less is more!",
    name: "Marcel",
    location: "Enschede",
  },
];
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { blogPosts } from '@/data/blogPosts';
import { Search, Calendar, User, ArrowRight, Tag } from 'lucide-react';

const BlogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const categories = ['all', 'stijl', 'trends', 'tips', 'lifestyle'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = blogPosts[0];
  const regularPosts = filteredPosts.slice(1);

  // Voor de extra-secties gebruiken we aparte fades om rules of hooks te respecteren.
  const fade0 = useFadeInOnVisible<HTMLDivElement>();
  const fade1 = useFadeInOnVisible<HTMLDivElement>();
  const fade2 = useFadeInOnVisible<HTMLDivElement>();

  return (
    <>
      <Helmet>
        <title>Blog - FitFi | Stijltips, Trends & Mode-inspiratie</title>
        <meta name="description" content="Ontdek de laatste modetrends, stijltips en persoonlijke verhalen. Laat je inspireren door onze experts en vind jouw perfecte stijl." />
      </Helmet>

      <div className="min-h-screen bg-[var(--color-bg)]">
        {/* Hero Section */}
        <section className="bg-white border-b border-[var(--color-border)]">
          <Container>
            <div className="py-16 lg:py-24 text-center">
              <div className="inline-flex items-center gap-2 bg-[var(--color-accent-tint)] text-[var(--color-accent)] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Tag className="w-4 h-4" />
                FitFi Blog
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-[var(--color-text)] mb-6">
                Jouw stijl
                <span className="block text-[var(--color-text-muted)]">begint hier</span>
              </h1>
              
              <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-8">
                Ontdek de laatste modetrends, krijg persoonlijke stijltips en laat je inspireren 
                door verhalen van echte mensen met een unieke smaak.
              </p>

              {/* Search & Filter */}
              <div className="max-w-2xl mx-auto">
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Zoek artikelen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                      }`}
                    >
                      {category === 'all' ? 'Alle artikelen' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="bg-white border-b border-[var(--color-border)]">
            <Container>
              <div className="py-16">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">Uitgelicht artikel</h2>
                  <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto rounded-full"></div>
                </div>

                <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  <div className="aspect-video bg-gradient-to-br from-[var(--color-primary-tint)] to-[var(--color-accent-tint)] relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <span className="inline-block bg-white/90 text-[var(--color-primary)] px-3 py-1 rounded-full text-sm font-medium mb-3">
                        {featuredPost.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-[var(--color-text)] mb-4 group-hover:text-[var(--color-primary)] transition-colors">
                      {featuredPost.title}
                    </h3>
                    
                    <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {featuredPost.author}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {featuredPost.date}
                        </div>
                      </div>
                      
                      <Button variant="ghost" className="group/btn">
                        Lees meer
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </section>
        )}

        {/* Blog Posts Grid */}
        <section className="py-16">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">Alle artikelen</h2>
              <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto rounded-full"></div>
            </div>

            {regularPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post, index) => (
                  <article key={index} className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    <div className="aspect-video bg-gradient-to-br from-[var(--color-primary-tint)] to-[var(--color-accent-tint)] relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 text-[var(--color-primary)] px-3 py-1 rounded-full text-sm font-medium">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-[var(--color-text)] mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-[var(--color-text-muted)] mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {post.date}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[var(--color-accent-tint)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-[var(--color-accent)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">Geen artikelen gevonden</h3>
                <p className="text-[var(--color-text-muted)] mb-6">
                  Probeer een andere zoekterm of selecteer een andere categorie.
                </p>
                <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
                  Toon alle artikelen
                </Button>
              </div>
            )}
          </Container>
        </section>

        {/* Newsletter CTA */}
        <section className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white">
          <Container>
            <div className="py-16 text-center">
              <h2 className="text-3xl font-bold mb-4">Blijf op de hoogte</h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Ontvang wekelijks de nieuwste stijltips, trends en persoonlijke verhalen direct in je inbox.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Je e-mailadres"
                  className="flex-1 px-4 py-3 rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <Button variant="secondary" className="bg-white text-[var(--color-primary)] hover:bg-gray-50">
                  Aanmelden
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
};

export default BlogPage;
      />

      {/* Filterchips */}
      <section className="ff-container pt-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span
              key={c}
              className="px-3 py-1 rounded-full border border-[var(--color-border)] text-sm text-[var(--color-text)]/80"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* Blog artikelen grid */}
      <section className="ff-container ff-stack-lg py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            // Leesduur schatting (±200 woorden/min).
            const wordCount = p.content.split(/\s+/).length;
            const readingTime = Math.max(2, Math.round(wordCount / 200)) + " min";
            const dt = new Date(p.date);
            const prettyDate = dt.toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            return (
              <article
                key={p.id}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden"
              >
                <a href={`/blog/${p.id}`} className="block" aria-label={`Lees: ${p.title}`}>
                  {/* Afbeelding van het artikel indien beschikbaar, anders placeholder */}
                  {p.imageId ? (
                    <SmartImage
                      id={p.imageId}
                      alt=""
                      className="aspect-[16/9] w-full h-auto"
                      width={1280}
                      height={720}
                      loading="lazy"
                    />
                  ) : (
                    <div className="aspect-[16/9] w-full bg-[var(--color-bg)]/40 grid place-items-center">
                      <span className="text-[var(--color-text)]/50 text-sm">Afbeelding</span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="text-[var(--color-text)]/70 text-sm">
                      {prettyDate} • {readingTime}
                    </div>
                    <h2 className="font-montserrat text-lg text-[var(--color-text)] mt-1">
                      {p.title}
                    </h2>
                    <p className="text-[var(--color-text)]/80 mt-1">{p.excerpt}</p>
                    <div className="mt-3">
                      <span className="ff-btn ff-btn-quiet">Lees meer</span>
                    </div>
                  </div>
                </a>
              </article>
            );
          })}
        </div>
      </section>

      {/* Extra inhoudelijke secties voor comfort, tech & inspiratie */}
      <section className="ff-container py-10 sm:py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {BLOG_EXTRA.map((item, idx) => {
            const fade = idx === 0 ? fade0 : idx === 1 ? fade1 : fade2;
            const Icon = item.icon;
            return (
              <div
                key={idx}
                ref={fade.ref as any}
                style={{
                  opacity: fade.visible ? 1 : 0,
                  transform: fade.visible ? "translateY(0)" : "translateY(12px)",
                  transition: "opacity 600ms ease, transform 600ms ease",
                }}
                className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
              >
                <Icon size={24} className="text-[var(--ff-color-accent)]" aria-hidden />
                <h3 className="mt-3 font-heading text-lg text-[var(--color-text)]">{item.title}</h3>
                <p className="mt-2 text-[var(--color-text)]/80">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials voor sociale bewijskracht */}
      <section className="ff-container py-10 sm:py-12">
        <h2 className="font-heading text-2xl text-[var(--color-text)] mb-4">Wat lezers zeggen</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t, idx) => (
            <figure
              key={idx}
              className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
            >
              <blockquote className="italic leading-relaxed text-[var(--color-text)]/90">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-3 text-sm text-[var(--color-text)]/60">
                — {t.name}, {t.location}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Callout om bezoekers naar de service te leiden */}
      <section className="ff-container pb-12">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-montserrat text-2xl text-[var(--color-text)]">Blijf op de hoogte</h2>
          <p className="mt-2 text-[var(--color-text)]/80">
            Nieuwe gidsen over silhouet, kleur en outfits. Af en toe, niet elke dag.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="/results" className="ff-btn ff-btn-primary">Start gratis</a>
            <a href="/hoe-het-werkt" className="ff-btn ff-btn-secondary">Hoe het werkt</a>
          </div>
        </div>
      </section>
    </main>
  );
}