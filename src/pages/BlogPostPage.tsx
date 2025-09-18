import React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Seo from "@/components/Seo";
import SmartImage from "@/components/media/SmartImage";
import posts from "@/data/blogPosts";
import RichProse, { toRichBlocks, Block } from "@/components/blog/RichProse";

const canonicalBase = "https://fitfi.ai";

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min lezen`;
}

const BlogPostPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const all = React.useMemo(() => posts.slice().sort((a, b) => b.date.localeCompare(a.date)), []);
  const index = all.findIndex(p => p.id === id);
  const post = index >= 0 ? all[index] : null;
  const prev = index >= 0 && index < all.length - 1 ? all[index + 1] : null;
  const next = index > 0 ? all[index - 1] : null;

  React.useEffect(() => { if (!post) navigate("/blog", { replace: true }); }, [post, navigate]);
  if (!post) return null;

  const prettyDate = new Date(post.date).toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" });
  const read = readingTime(`${post.title} ${post.excerpt} ${post.content}`);
  const canonical = `${canonicalBase}/blog/${post.id}`;

  const blocks: Block[] = React.useMemo(() => toRichBlocks(post.content), [post.content]);
  const headings = blocks.filter(b => b.type === "h2" || b.type === "h3") as Array<Block & { id: string; text: string }>;

  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    image: post.imageId ? [`${canonicalBase}/images/${post.imageId}.jpg`] : undefined,
    author: { "@type": "Organization", name: "FitFi" },
    publisher: { "@type": "Organization", name: "FitFi", logo: { "@type": "ImageObject", url: `${canonicalBase}/images/social/logo-512.png` } },
    mainEntityOfPage: canonical,
  };

  const jsonLdBreadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${canonicalBase}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${canonicalBase}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title={`${post.title} — Blog | FitFi`}
        description={post.excerpt}
        canonical={canonical}
        ogImage={post.imageId ? `/images/${post.imageId}.jpg` : "/images/social/blog-og.jpg"}
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }} />

      <section className="ff-section ff-container">
        <nav aria-label="Breadcrumbs" className="post-breadcrumbs">
          <ol>
            <li><Link className="underlined" to="/">Home</Link></li>
            <li><span aria-hidden>›</span><Link className="underlined" to="/blog">Blog</Link></li>
            <li aria-current="page"><span aria-hidden>›</span>{post.title}</li>
          </ol>
        </nav>

        <article className="post-wrap" itemScope itemType="https://schema.org/BlogPosting">
          <header className="flow-sm">
            <h1 className="section-title" itemProp="headline">{post.title}</h1>
            <div className="post-meta">
              <time className="post-date" dateTime={post.date} itemProp="datePublished">{prettyDate}</time>
              <span className="post-dot" aria-hidden>•</span>
              <span className="post-readtime">{read}</span>
              {post.tags?.length ? (
                <>
                  <span className="post-dot" aria-hidden>•</span>
                  <ul className="blog-tags" aria-label="Tags">
                    {post.tags.map(t => <li key={t} className="tag-chip">{t}</li>)}
                  </ul>
                </>
              ) : null}
            </div>
          </header>

          <figure className="post-hero">
            {post.imageId ? (
              <SmartImage id={post.imageId} kind="generic" alt="" className="w-full h-full object-cover" />
            ) : <div className="post-hero-fallback" aria-hidden />}
            <figcaption className="sr-only">{post.title}</figcaption>
          </figure>

          {/* Inhoudsopgave (als er koppen zijn) */}
          {headings.length > 0 && (
            <nav className="post-toc" aria-label="Inhoudsopgave">
              <strong className="toc-title">In dit artikel</strong>
              <ul className="toc-list">
                {headings.map(h => (
                  <li key={h.id} className={h.type === "h3" ? "toc-item sub" : "toc-item"}>
                    <a href={`#${h.id}`} className="underlined">{h.text}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <section className="post-body" itemProp="articleBody">
            <RichProse blocks={blocks} />
          </section>
        </article>

        <nav className="post-nav cluster" aria-label="Navigatie tussen artikelen">
          {prev ? (
            <Link className="btn ghost" to={`/blog/${prev.id}`} aria-label={`Vorig artikel: ${prev.title}`}>
              ← Vorig: {prev.title}
            </Link>
          ) : <span className="post-nav-spacer" />}
          <Link className="btn" to="/blog" aria-label="Terug naar blog">Terug naar blog</Link>
          {next ? (
            <Link className="btn ghost" to={`/blog/${next.id}`} aria-label={`Volgend artikel: ${next.title}`}>
              Volgend: {next.title} →
            </Link>
          ) : <span className="post-nav-spacer" />}
        </nav>
      </section>
    </main>
  );
};

export default BlogPostPage;