import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, User, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { blogPosts, categories, type BlogPost } from '@/data/blogPosts';

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Filter en zoek logica
  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
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
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Helmet>
        <title>Blog - FitFi.ai</title>
        <meta name="description" content="De nieuwste trends, tips en inzichten over stijl en mode op de FitFi blog." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-24 md:py-32 border-b-2 border-[var(--color-border)]">
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              x: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[var(--ff-color-primary-400)] to-[var(--ff-color-accent-400)] rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              x: [0, -30, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[var(--ff-color-accent-400)] to-[var(--ff-color-primary-400)] rounded-full blur-3xl"
          />
        </div>

        <div className="ff-container relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-8 leading-tight"
            >
              Stijl & Mode
              <span className="block bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">Inzichten</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl md:text-2xl text-[var(--color-muted)] mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              De nieuwste trends, stijltips en mode-inzichten van onze experts.
              Van seizoenstrends tot tijdloze stijladvies.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="ff-container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative max-w-2xl mx-auto mb-8"
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-muted)] w-5 h-5" />
            <input
              type="text"
              placeholder="Zoek artikelen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-xl border-2 border-[var(--color-border)] bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-transparent text-lg shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lifted)] transition-shadow"
            />
          </motion.div>

          {/* Filter chips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[var(--ff-color-primary-600)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--ff-color-primary-50)]'
              }`}
            >
              Alle artikelen
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[var(--ff-color-primary-600)] text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--ff-color-primary-50)]'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="ff-container pb-16">
        {/* Featured Post */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-[var(--color-text)] mb-8 text-center">Uitgelicht artikel</h2>
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[var(--shadow-lifted)] overflow-hidden hover:shadow-[var(--shadow-elevated)] transition-shadow duration-300 border-2 border-[var(--color-border)]"
            >
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] rounded-full text-sm font-medium">
                      {featuredPost.category}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-[var(--color-text)] mb-4 leading-tight">
                    {featuredPost.title}
                  </h3>
                  <p className="text-lg text-[var(--color-muted)] mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={featuredPost.author.avatar}
                        alt={featuredPost.author.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-[var(--color-text)]">{featuredPost.author.name}</p>
                        <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                          <Calendar className="w-4 h-4" />
                          <span>{featuredPost.date}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                    >
                      Lees artikel
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Blog Posts Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[var(--color-text)] mb-8 text-center">Alle artikelen</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[var(--shadow-lifted)] overflow-hidden hover:shadow-[var(--shadow-elevated)] transition-all duration-300 border-2 border-[var(--color-border)]"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-3 leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-[var(--color-muted)] mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                      <User className="w-4 h-4" />
                      <span>{post.author.name}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      Lees meer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-[var(--ff-color-primary-600)] via-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-800)] rounded-2xl p-12 text-center overflow-hidden border-2 border-[var(--ff-color-primary-700)] shadow-[var(--shadow-elevated)]"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          </div>

          <div className="relative">
            <Mail className="w-12 h-12 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Blijf op de hoogte</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Ontvang de nieuwste stijltips, seizoenstrends en mode-inzichten direct in je inbox
            </p>
            <div className="max-w-lg mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Je e-mailadres"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                required
              />
              <Button
                variant="secondary"
                onClick={handleNewsletterSubmit}
                disabled={!email}
                className="px-6 py-4"
              >
                Aanmelden
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default BlogPage;
