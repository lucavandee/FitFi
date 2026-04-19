import React, { useState, useEffect, useMemo } from 'react';
import Spinner from '@/components/ui/Spinner';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Seo from '@/components/seo/Seo';
import { Button } from '@/components/ui/Button';
import { ReadingProgress } from '@/components/blog/reading/ReadingProgress';
import { TableOfContents } from '@/components/blog/reading/TableOfContents';
import { TLDRSection } from '@/components/blog/reading/TLDRSection';
import RichProse, { toRichBlocks } from '@/components/blog/RichProse';
import {
  getBlogPostBySlug,
  getPublishedBlogPosts,
  incrementViewCount,
  transformBlogPostForUI,
  type BlogPost,
  type UIBlogPost
} from '@/services/blog/blogService';

function toAnchorId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

function extractHeadings(content: string) {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: Array<{ id: string; title: string; level: number }> = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    headings.push({ id: toAnchorId(title), title, level });
  }
  return headings;
}

export default function BlogPostPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<UIBlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        const fetchedPost = await getBlogPostBySlug(slug);
        if (fetchedPost) {
          setPost(fetchedPost);
          incrementViewCount(slug).catch(() => {});
          const allPosts = await getPublishedBlogPosts(20, 0);
          const related = allPosts
            .filter((p) => p.slug !== slug && p.category === fetchedPost.category)
            .slice(0, 3)
            .map(transformBlogPostForUI);
          setRelatedPosts(related);
        }
      } catch {
        // Error shown via !post state
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  const headings = useMemo(() => {
    if (!post) return [];
    return extractHeadings(post.content);
  }, [post]);

  const blocks = useMemo(() => {
    if (!post) return [];
    return toRichBlocks(post.content);
  }, [post]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title ?? '',
        text: post?.excerpt ?? '',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link gekopieerd!');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-[#8A8A8A]">Artikel laden...</p>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">
          Artikel niet gevonden
        </h1>
        <p className="text-[#8A8A8A] mb-8">
          We konden dit artikel niet vinden.
        </p>
        <Button variant="primary" onClick={() => navigate('/blog')}>
          Terug naar blog
        </Button>
      </main>
    );
  }

  const publishDate = new Date(post.published_at || post.created_at);
  const formattedDate = publishDate.toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const tldrPoints = [
    post.excerpt,
    `Leestijd: ${post.read_time_minutes} minuten`,
    'Ontdek praktische tips die je meteen kunt toepassen'
  ];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.published_at,
    "dateModified": post.updated_at,
    "author": { "@type": "Person", "name": post.author_name },
    "publisher": { "@type": "Organization", "name": "FitFi" },
    "image": post.featured_image_url,
  };

  return (
    <>
      <Seo
        title={`${post.seo_meta_title || post.title} — FitFi`}
        description={post.seo_meta_description || post.excerpt}
        path={`/blog/${post.slug}`}
        image={post.featured_image_url}
        structuredData={articleSchema}
      />

      <ReadingProgress />

      <main className="bg-[#FAFAF8] text-[#1A1A1A] pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#FAF5F2] via-white to-[#FAF5F2] py-12 md:py-16 border-b border-[#E5E5E5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="mb-6" aria-label="Breadcrumb">
              <Link
                to="/blog"
                className="text-sm text-[#8A8A8A] hover:text-[#C2654A] transition-colors"
              >
                Blog
              </Link>
              <span className="mx-2 text-[#8A8A8A]" aria-hidden="true">/</span>
              <span className="text-sm font-medium text-[#C2654A]">
                {post.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1A1A] leading-tight mb-6 max-w-4xl">
              {post.title}
            </h1>

            <p className="text-xl md:text-2xl text-[#8A8A8A] leading-relaxed mb-8 max-w-3xl">
              {post.excerpt}
            </p>

            <div className="blog-meta mb-8">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <time dateTime={post.published_at || post.created_at}>{formattedDate}</time>
              </span>
              <div className="blog-meta-separator" aria-hidden="true" />
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" aria-hidden="true" />
                {post.read_time_minutes} min lezen
              </span>
              <div className="blog-meta-separator" aria-hidden="true" />
              <span>{post.author_name}</span>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="primary" onClick={() => navigate('/onboarding')}>
                Start je Style Report
              </Button>
              <Button variant="ghost" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
                Delen
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="blog-layout-wrapper">
            {/* Sidebar: TOC (sticky on desktop) */}
            {headings.length > 0 && (
              <aside className="blog-sidebar" aria-label="Inhoudsopgave">
                <TableOfContents items={headings} isSticky={true} />
              </aside>
            )}

            {/* Main Content */}
            <article className="blog-main-content">
              <div className="blog-content-wrapper">
                <RichProse blocks={blocks} className="blog-prose" />

                <TLDRSection points={tldrPoints} />

                {/* End CTA */}
                <div className="bg-[#A8513A] rounded-2xl p-8 md:p-12 text-center my-12 text-white">
                  <h2 className="text-3xl font-bold mb-4">
                    Ontdek jouw perfecte stijl
                  </h2>
                  <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
                    Gepersonaliseerd stijladvies en outfit-aanbevelingen op basis van jouw smaak en voorkeuren.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/onboarding')}
                    className="bg-white text-[#A8513A] hover:bg-[#FAF5F2]"
                  >
                    Start gratis quiz
                    <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                  </Button>
                </div>

                {/* Related Articles */}
                {relatedPosts.length > 0 && (
                  <div className="mt-12 sm:mt-16">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-4 sm:mb-6">
                      Gerelateerde artikelen
                    </h2>
                    <div
                      className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:overflow-visible sm:pb-0"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {relatedPosts.map((related) => (
                        <Link
                          key={related.id}
                          to={`/blog/${related.slug}`}
                          className="group bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex-shrink-0 w-[220px] sm:w-auto snap-start"
                        >
                          <div className="aspect-[16/9] overflow-hidden">
                            <img
                              src={related.image}
                              alt={related.title}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-4">
                            <span className="text-xs text-[#C2654A] font-medium mb-1.5 block">
                              {related.category}
                            </span>
                            <h3 className="font-bold text-sm text-[#1A1A1A] mb-1.5 line-clamp-2 group-hover:text-[#C2654A] transition-colors leading-snug">
                              {related.title}
                            </h3>
                            <p className="text-xs text-[#8A8A8A] line-clamp-2 leading-relaxed">
                              {related.excerpt}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>
        </div>
      </main>
    </>
  );
}
