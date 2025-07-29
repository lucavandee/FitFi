import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Clock, User, Share2, Heart } from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingFallback from '../components/ui/LoadingFallback';

interface BlogPost {
  title: string;
  author: string;
  date: string;
  readTime: string;
  content: string;
  imageUrl: string;
  excerpt: string;
}

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        setError('Geen artikel gevonden');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/content/blog/${slug}.md`);
        if (!response.ok) {
          throw new Error('Artikel niet gevonden');
        }
        
        const text = await response.text();
        
        // Parse frontmatter and content
        const lines = text.split('\n');
        const contentStart = lines.findIndex(line => line.trim() === '') + 1;
        const frontmatter = lines.slice(0, contentStart - 1).join('\n');
        const content = lines.slice(contentStart).join('\n');
        
        // Extract metadata from frontmatter
        const authorMatch = frontmatter.match(/\*Door (.*?) •/);
        const dateMatch = frontmatter.match(/• (.*?) •/);
        const readTimeMatch = frontmatter.match(/• (.*?) leestijd\*/);
        
        // Extract title from content
        const titleMatch = content.match(/^# (.+)$/m);
        const title = titleMatch ? titleMatch[1] : 'Artikel';
        
        // Extract excerpt from first paragraph
        const excerptMatch = content.match(/\n\n([^#\n]+)/);
        const excerpt = excerptMatch ? excerptMatch[1].substring(0, 160) + '...' : '';
        
        setPost({
          title,
          author: authorMatch ? authorMatch[1] : 'FitFi Team',
          date: dateMatch ? dateMatch[1] : '15 december 2024',
          readTime: readTimeMatch ? readTimeMatch[1] : '5 min',
          content: content,
          imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2',
          excerpt
        });
      } catch (error) {
        console.error('Error loading blog post:', error);
        setError('Artikel kon niet worden geladen');
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  const renderMarkdown = (markdown: string) => {
    // Simple markdown to HTML conversion
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-6">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-gray-900 mb-4 mt-8">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium text-gray-900 mb-3 mt-6">$1</h3>')
      .replace(/^\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/^\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/^- (.*$)/gim, '<li class="mb-1 ml-4">• $1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#89CFF0] hover:text-[#89CFF0]/80 underline">$1</a>')
      .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-6">')
      .replace(/^(?!<[h|l|s|e])/gm, '<p class="text-gray-700 leading-relaxed mb-6">')
      .replace(/$(?![>])/gm, '</p>');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return <LoadingFallback fullScreen message="Artikel laden..." />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artikel niet gevonden</h1>
          <p className="text-gray-600 mb-6">{error || 'Het opgevraagde artikel bestaat niet.'}</p>
          <Button as={Link} to="/blog" variant="primary">
            Terug naar blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Helmet>
        <title>{post.title} | FitFi Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.imageUrl} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://fitfi.app/blog/${slug}`} />
      </Helmet>

      <div className="max-w-4xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Terug naar blog
          </Link>
        </div>

        {/* Article */}
        <article className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {/* Hero Image */}
          <div className="aspect-video overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Meta */}
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center space-x-2">
                <User size={16} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={16} />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <span>{post.readTime} leestijd</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-gray-200">
              <Button
                variant="outline"
                size="sm"
                icon={<Share2 size={16} />}
                iconPosition="left"
                onClick={handleShare}
                className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
              >
                Delen
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Heart size={16} />}
                iconPosition="left"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Bewaren
              </Button>
            </div>
            
            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />
          </div>
        </article>

        {/* Related Articles */}
        <div className="mt-12">
          <h2 className="text-2xl font-medium text-gray-900 mb-6">
            Gerelateerde artikelen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              to="/blog/stijlregels-breken-2025"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                5 Stijlregels Die Je Kunt Breken in 2025
              </h3>
              <p className="text-gray-600 text-sm">
                Mode-regels zijn er om gebroken te worden. Leer welke traditionele stijlregels je veilig kunt negeren.
              </p>
            </Link>
            
            <Link 
              to="/blog/capsule-wardrobe-gids"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Capsule Wardrobe: Minder is Meer
              </h3>
              <p className="text-gray-600 text-sm">
                Hoe je met 30 items een complete garderobe creëert die altijd werkt.
              </p>
            </Link>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#89CFF0] to-blue-500 rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-medium text-white mb-4">
            Meer artikelen zoals deze?
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Ontvang wekelijks de nieuwste styling tips en psychologie-inzichten.
          </p>
          <Button
            variant="secondary"
            className="bg-white text-[#89CFF0] hover:bg-gray-100"
          >
            Aanmelden voor newsletter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;