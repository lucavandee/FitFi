import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Seo from '@/components/Seo';
import { 
  Search, 
  Calendar, 
  User, 
  ArrowRight, 
  Clock,
  Tag
} from 'lucide-react';
import Button from '../components/ui/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';

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

const BlogIndexPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'De Psychologie Achter Jouw Kledingkeuzes',
      excerpt: 'Ontdek wat jouw stijlvoorkeuren vertellen over jouw persoonlijkheid en hoe je dit kunt gebruiken om je doelen te bereiken.',
      author: 'Dr. Sarah van der Berg',
      date: '2024-12-15',
      readTime: '5 min',
      category: 'Psychologie',
      imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2',
      slug: 'psychologie-achter-kledingkeuzes'
    },
    {
      id: '2',
      title: '5 Stijlregels Die Je Kunt Breken in 2025',
      excerpt: 'Mode-regels zijn er om gebroken te worden. Leer welke traditionele stijlregels je veilig kunt negeren voor een modernere look.',
      author: 'Emma Styling',
      date: '2024-12-12',
      readTime: '7 min',
      category: 'Trends',
      imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2',
      slug: 'stijlregels-breken-2025'
    },
    {
      id: '3',
      title: 'Capsule Wardrobe: Minder is Meer',
      excerpt: 'Hoe je met 30 items een complete garderobe creëert die altijd werkt. Tips voor het bouwen van een duurzame, veelzijdige kledingkast.',
      author: 'Lisa Minimalist',
      date: '2024-12-10',
      readTime: '6 min',
      category: 'Lifestyle',
      imageUrl: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2',
      slug: 'capsule-wardrobe-gids'
    }
  ];

  const categories = ['Alle', 'Psychologie', 'Trends', 'Lifestyle'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'Alle' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Seo 
        title="Blog - Styling Tips & Mode Trends"
        description="Ontdek de laatste styling tips, mode trends en persoonlijke groei-inzichten op de FitFi blog. Van psychologie tot praktische stijladvies."
        canonical="https://fitfi.app/blog"
        image="https://fitfi.app/og-blog.jpg"
        keywords="styling tips, mode trends, fashion blog, stijl advies, persoonlijke groei, mode psychologie"
        type="website"
      />

      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Hero Section */}
        <ErrorBoundary>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-[#0D1B2A] mb-6">
            FitFi Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Ontdek de laatste trends, styling tips en inzichten over mode, persoonlijkheid en zelfexpressie.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Zoek artikelen..."
                  className="w-full px-4 py-3 pl-12 border border-gray-200 bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] text-gray-900 placeholder-gray-500 transition-all"
                />
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <button
                  type="submit"
                  className="absolute right-3 top-2.5 bg-[#89CFF0] text-white px-4 py-1 rounded-xl hover:bg-[#89CFF0]/90 transition-colors"
                >
                  Zoeken
                </button>
              </div>
            </form>
          </div>
        </div>
        </ErrorBoundary>

        {/* Categories */}
        <ErrorBoundary>
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === 'Alle' ? null : category)}
                className={`px-6 py-2 rounded-full transition-colors ${
                  (selectedCategory === category) || (selectedCategory === null && category === 'Alle')
                    ? 'bg-[#89CFF0] text-[#0D1B2A] font-medium'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        </ErrorBoundary>

        {/* Blog Posts Grid */}
        <ErrorBoundary>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{new Date(post.date).toLocaleDateString('nl-NL')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{post.readTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Tag size={14} />
                    <span>{post.category}</span>
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-[#0D1B2A] mb-3 leading-tight">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{post.author}</span>
                  </div>
                  
                  <Button
                    as={Link}
                    to={`/blog/${post.slug}`}
                    variant="ghost"
                    size="sm"
                    icon={<ArrowRight size={16} />}
                    iconPosition="right"
                    className="text-[#89CFF0] hover:bg-[#89CFF0]/10"
                  >
                    Lees meer
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
        </ErrorBoundary>

        {/* Newsletter Signup */}
        <ErrorBoundary>
        <div className="bg-gradient-to-r from-[#89CFF0] to-blue-500 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <h2 className="text-3xl font-light text-white mb-4">
              Blijf op de hoogte
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Ontvang wekelijks de nieuwste styling tips, trends en persoonlijke groei-inzichten direct in je inbox.
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Je e-mailadres"
                  className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50 text-gray-900"
                />
                <Button
                  variant="secondary"
                  className="bg-white text-[#89CFF0] hover:bg-gray-100 px-6 py-3"
                >
                  Aanmelden
                </Button>
              </div>
              <p className="text-white/80 text-sm mt-3">
                Geen spam, alleen waardevolle content. Uitschrijven kan altijd.
              </p>
            </div>
          </div>
        </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default BlogIndexPage;