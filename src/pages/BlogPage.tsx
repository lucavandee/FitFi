import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { blogPosts, categories, type BlogPost } from '@/data/blogPosts';

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Filter en zoek logica
  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const featuredPost = blogPosts.find(post => post.featured) || blogPosts[0];
  const regularPosts = filteredPosts.filter(post => !post.featured);

  const handleReadMore = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <>
      <Helmet>
        <title>Blog - FitFi.ai</title>
        <meta name="description" content="Ontdek de laatste trends in mode, stijltips en persoonlijke styling. Lees onze expertartikelen over kleding, accessoires en stijladvies." />
        <meta name="keywords" content="mode blog, stijltips, kleding advies, personal styling, fashion trends" />
      </Helmet>

      <main className="min-h-screen bg-[var(--color-bg)]">
        {/* Hero Section */}
        <section className="bg-white border-b border-[var(--color-border)]">
          <div className="ff-container py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-6">
                FitFi Blog
              </h1>
              <p className="text-xl text-[var(--color-text-muted)] mb-8 max-w-2xl mx-auto">
                Ontdek de laatste trends, stijltips en expertadvies om jouw perfecte look te vinden
              </p>

              {/* Zoekbalk */}
              <div className="relative max-w-md mx-auto mb-8">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Zoek artikelen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>

              {/* Categorie filters */}
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    !selectedCategory
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
                  }`}
                >
                  Alle artikelen
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Article */}
        {featuredPost && (
          <section className="bg-white border-b border-[var(--color-border)]">
            <div className="ff-container py-16">
              <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-[var(--color-primary)] text-white px-3 py-1 rounded-full text-sm font-medium">
                        Uitgelicht
                      </span>
                      <span className="text-[var(--color-text-muted)] text-sm">
                        {featuredPost.category}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-lg text-[var(--color-text-muted)] mb-6">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={featuredPost.author.avatar}
                          alt={featuredPost.author.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-[var(--color-text)]">
                            {featuredPost.author.name}
                          </p>
                          <p className="text-sm text-[var(--color-text-muted)]">
                            {featuredPost.date}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-[var(--color-text-muted)]">
                        {featuredPost.readTime}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleReadMore(featuredPost.slug)}
                      className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-600)] px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                    >
                      Lees artikel
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="relative group">
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-80 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-shadow"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Blog Grid */}
        <section className="ff-container py-16">
          {regularPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-[var(--color-text)] px-3 py-1 rounded-full text-sm font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[var(--color-text)] mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-[var(--color-text-muted)] mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text)]">
                            {post.author.name}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {post.date}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {post.readTime}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleReadMore(post.slug)}
                      className="w-full bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-border)] py-2 rounded-lg font-medium transition-colors"
                    >
                      Lees meer
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Filter className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                  Geen artikelen gevonden
                </h3>
                <p className="text-[var(--color-text-muted)] mb-6">
                  Probeer een andere zoekterm of selecteer een andere categorie.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-600)] px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Toon alle artikelen
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Newsletter Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-600)] to-[var(--color-primary-700)]" />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          
          <div className="relative ff-container py-20">
            <div className="max-w-2xl mx-auto text-center">
              <Mail className="w-16 h-16 text-white mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Blijf op de hoogte
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Ontvang wekelijks de nieuwste stijltips en modetrends direct in je inbox
              </p>
              
              {isSubscribed ? (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <div className="flex items-center justify-center gap-3 text-white">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">Bedankt voor je aanmelding!</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Jouw e-mailadres"
                    required
                    className="flex-1 px-4 py-3 rounded-lg border-0 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <Button
                    type="submit"
                    className="bg-white text-[var(--color-primary)] hover:bg-white/90 px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
                  >
                    Aanmelden
                  </Button>
                </form>
              )}
              
              <p className="text-sm text-white/70 mt-4">
                Geen spam, alleen waardevolle content. Je kunt je altijd afmelden.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default BlogPage;