import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, ArrowRight, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ReadingProgress } from '@/components/blog/reading/ReadingProgress';
import { TableOfContents } from '@/components/blog/reading/TableOfContents';
import { TLDRSection } from '@/components/blog/reading/TLDRSection';
import {
  getBlogPostBySlug,
  getPublishedBlogPosts,
  incrementViewCount,
  transformBlogPostForUI,
  type BlogPost,
  type UIBlogPost
} from '@/services/blog/blogService';

/**
 * Premium FitFi Blog Post Page
 * Features:
 * - Reading progress bar
 * - Sticky TOC (desktop)
 * - Premium typography
 * - TL;DR section
 * - Related posts
 * - CTA at end
 */

// Helper: extract H2/H3 headings from markdown content
function extractHeadings(content: string) {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: Array<{ id: string; title: string; level: number }> = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    headings.push({ id, title, level });
  }

  return headings;
}

// Helper: render markdown to HTML with heading IDs
function renderMarkdown(content: string): string {
  let html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // H2 & H3 with IDs for TOC
  html = html.replace(/^###\s?(.*)$/gm, (_, text) => {
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    return `<h3 id="${id}">${text}</h3>`;
  });

  html = html.replace(/^##\s?(.*)$/gm, (_, text) => {
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    return `<h2 id="${id}">${text}</h2>`;
  });

  // Bold/Italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Blockquote
  html = html.replace(/^\>\s?(.*)$/gm, '<blockquote>$1</blockquote>');

  // Lists
  html = html.replace(/(?:^|\n)-\s+(.*)(?=\n|$)/g, '\n<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
  html = html.replace(/(?:^|\n)\d+\.\s+(.*)(?=\n|$)/g, '\n<ol><li>$1</li></ol>');
  html = html.replace(/<\/ol>\s*<ol>/g, '');
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // Paragraphs
  html = html
    .split(/\n{2,}/)
    .map((block) =>
      /^(<h2|<h3|<ul|<ol|<blockquote|<li)/.test(block.trim())
        ? block
        : `<p>${block.trim()}</p>`
    )
    .join('\n');

  return html;
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
          incrementViewCount(slug);

          // Load related posts (same category)
          const allPosts = await getPublishedBlogPosts(20, 0);
          const related = allPosts
            .filter((p) => p.slug !== slug && p.category === fetchedPost.category)
            .slice(0, 3)
            .map(transformBlogPostForUI);
          setRelatedPosts(related);
        }
      } catch (error) {
        console.error('Failed to load blog post:', error);
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

  const renderedContent = useMemo(() => {
    if (!post) return '';
    return renderMarkdown(post.content);
  }, [post]);

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title || '',
        text: post?.excerpt || '',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link gekopieerd naar klembord');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--ff-color-primary-600)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-muted)]">Artikel laden...</p>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="ff-container py-16 text-center">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-4">
          Artikel niet gevonden
        </h1>
        <p className="text-[var(--color-muted)] mb-8">
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

  // Mock TL;DR (in real impl, would come from post metadata or AI)
  const tldrPoints = [
    post.excerpt,
    `Leestijd: ${post.read_time_minutes} minuten`,
    'Ontdek praktische tips die je meteen kunt toepassen'
  ];

  return (
    <>
      <Helmet>
        <title>{post.seo_meta_title || post.title} - FitFi.ai Blog</title>
        <meta
          name="description"
          content={post.seo_meta_description || post.excerpt}
        />
      </Helmet>

      <ReadingProgress />

      <main className="bg-[var(--color-bg)] text-[var(--color-text)] pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-12 md:py-16 border-b-2 border-[var(--color-border)]">
          <div className="ff-container">
            {/* Breadcrumb / Category */}
            <div className="mb-6">
              <Link
                to="/blog"
                className="text-sm text-[var(--color-muted)] hover:text-[var(--ff-color-primary-600)] transition-colors"
              >
                Blog
              </Link>
              <span className="mx-2 text-[var(--color-muted)]">/</span>
              <span className="text-sm font-medium text-[var(--ff-color-primary-600)]">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text)] leading-tight mb-6 max-w-4xl">
              {post.title}
            </h1>

            {/* Subhead / Excerpt */}
            <p className="text-xl md:text-2xl text-[var(--color-muted)] leading-relaxed mb-8 max-w-3xl">
              {post.excerpt}
            </p>

            {/* Meta Line */}
            <div className="blog-meta mb-8">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </span>
              <div className="blog-meta-separator" />
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.read_time_minutes} min lezen
              </span>
              <div className="blog-meta-separator" />
              <span>{post.author_name}</span>
            </div>

            {/* Subtle CTA */}
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" onClick={() => navigate('/onboarding')}>
                Start je Style Report
              </Button>
              <Button variant="ghost" onClick={shareUrl}>
                <Share2 className="w-4 h-4 mr-2" />
                Delen
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="ff-container pt-12">
          <div className="blog-layout-wrapper">
            {/* Sidebar: TOC (sticky on desktop) */}
            {headings.length > 0 && (
              <aside className="blog-sidebar">
                <TableOfContents items={headings} isSticky={true} />
              </aside>
            )}

            {/* Main Content */}
            <article className="blog-main-content">
              <div className="blog-content-wrapper">
                {/* Blog Body */}
                <div
                  className="blog-prose"
                  dangerouslySetInnerHTML={{ __html: renderedContent }}
                />

                {/* TL;DR Section */}
                <TLDRSection points={tldrPoints} />

                {/* End CTA */}
                <div className="bg-gradient-to-br from-[var(--ff-color-primary-600)] via-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-800)] rounded-[var(--radius-lg)] p-8 md:p-12 text-center my-12 text-white">
                  <h2 className="text-3xl font-bold mb-4">
                    Ontdek jouw perfecte stijl
                  </h2>
                  <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
                    Krijg gepersonaliseerde stijladvies en outfit aanbevelingen op basis van jouw unieke smaak en voorkeuren.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/onboarding')}
                    className="bg-white text-[var(--ff-color-primary-700)] hover:bg-gray-50"
                  >
                    Start gratis quiz
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Related Articles */}
                {relatedPosts.length > 0 && (
                  <div className="mt-12 sm:mt-16">
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mb-4 sm:mb-6">
                      Gerelateerde artikelen
                    </h2>
                    {/* Mobile: horizontal scroll; desktop: 3-col grid */}
                    <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:overflow-visible sm:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {relatedPosts.map((related) => (
                        <Link
                          key={related.id}
                          to={`/blog/${related.slug}`}
                          className="group bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden hover:shadow-[var(--shadow-lifted)] transition-shadow flex-shrink-0 w-[220px] sm:w-auto snap-start"
                        >
                          <div className="aspect-[16/9] overflow-hidden">
                            <img
                              src={related.image}
                              alt={related.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-4">
                            <span className="text-xs text-[var(--ff-color-primary-600)] font-medium mb-1.5 block">
                              {related.category}
                            </span>
                            <h3 className="font-bold text-sm text-[var(--color-text)] mb-1.5 line-clamp-2 group-hover:text-[var(--ff-color-primary-600)] transition-colors leading-snug">
                              {related.title}
                            </h3>
                            <p className="text-xs text-[var(--color-muted)] line-clamp-2 leading-relaxed">
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
