import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, User, ArrowRight, Filter } from 'lucide-react';
import { blogPosts } from '@/data/blogPosts';
import { Button } from '@/components/ui/Button';

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [email, setEmail] = useState('');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = blogPosts.map(post => post.category);
    return ['Alle', ...Array.from(new Set(cats))];
  }, []);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || selectedCategory === 'Alle' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleReadMore = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
    // Show success message
  };
  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <>
      <Helmet>
        <title>Blog - FitFi</title>
        <meta name="description" content="Ontdek de laatste trends, tips en inzichten over stijl, mode en persoonlijke styling op de FitFi blog." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-[var(--color-bg)] py-16 lg:py-24">
        <div className="ff-container">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[var(--color-surface)] px-4 py-2 rounded-full text-sm text-[var(--color-text-muted)] mb-6">
              <span className="text-[var(--color-primary)]">✨</span>
              Blog
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-[var(--color-text)] mb-6">
              Jouw stijl
              <span className="block text-[var(--color-text-muted)]">inspiratie</span>
            </h1>
            
            <p className="text-lg text-[var(--color-text-muted)] mb-8 max-w-2xl mx-auto">
              Ontdek de laatste trends, krijg styling tips en leer hoe je jouw perfecte look creëert met onze expert inzichten.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-5 h-5" />
              <input
                type="text"
                placeholder="Zoek artikelen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-6">
        <div className="ff-container">
          <div className="flex items-center gap-4 overflow-x-auto">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] whitespace-nowrap">
              <Filter className="w-4 h-4" />
              Categorieën:
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category === 'Alle' ? '' : category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    (selectedCategory === category) || (selectedCategory === '' && category === 'Alle')
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="ff-container py-16">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[var(--color-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
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
              variant="outline"
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Featured Post */}
            {featuredPost && (
              <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="aspect-[4/3] lg:aspect-auto">
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mb-4">
                      <span className="bg-[var(--color-primary)] text-white px-3 py-1 rounded-full text-xs font-medium">
                        Uitgelicht
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {featuredPost.date}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-4 group-hover:text-[var(--color-primary)] transition-colors">
                      {featuredPost.title}
                    </h2>
                    
                    <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                        <User className="w-4 h-4" />
                        {featuredPost.author}
                      </div>
                      
                      <Button
                        variant="ghost"
                        className="group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all"
                      >
                        Lees meer
                  <Button 
                    variant="outline" 
                    className="group"
                    onClick={() => handleReadMore(featuredPost.slug)}
                  >
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Regular Posts Grid */}
            {regularPosts.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mb-3">
                        <span className="bg-[var(--color-bg)] px-2 py-1 rounded text-xs">
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-[var(--color-text-muted)] text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="group"
                        onClick={() => handleReadMore(post.slug)}
                      >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                          <User className="w-3 h-3" />
                          {post.author}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs group-hover:text-[var(--color-primary)] transition-colors"
                        >
                          Lees meer
                          <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

        <section className="py-20 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          
      <section className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] py-16">
        <div className="ff-container">
          <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">
              Blijf op de hoogte
            </h2>
              <p className="text-lg text-white/90 mb-8">
              Ontvang wekelijks de nieuwste styling tips, trends en artikelen direct in je inbox.
            </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Je e-mailadres"
                  required
                  className="flex-1 px-4 py-3 rounded-lg border-0 bg-white/95 backdrop-blur-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-white focus:bg-white transition-all"
                />
                <Button 
                  type="submit"
                  className="whitespace-nowrap bg-white text-[var(--ff-color-primary-700)] hover:bg-white/90 border-0 font-semibold px-6"
                >
                  Aanmelden
                </Button>
              </form>
              <p className="text-sm text-white/70 mt-4">
                Geen spam, alleen waardevolle content. Uitschrijven kan altijd.
              </p>
            </div>
            
            <p className="text-white/70 text-sm mt-4">
              Geen spam, alleen waardevolle content. Uitschrijven kan altijd.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogPage;