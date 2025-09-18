import React from "react";
import Seo from "@/components/Seo";
import BlogCard from "@/components/blog/BlogCard";
import TagFilter from "@/components/blog/TagFilter";
import posts, { BlogPost } from "@/data/blogPosts";

const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();

const BlogPage: React.FC = () => {
  const [q, setQ] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  const clearTags = () => setTags([]);

  const filtered = React.useMemo(() => {
    const text = q.trim().toLowerCase();
    return posts
      .filter((p) => (text ? (p.title + p.excerpt + p.content).toLowerCase().includes(text) : true))
      .filter((p) => (tags.length ? tags.every((t) => p.tags.includes(t)) : true))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [q, tags]);

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Blog — rustige gidsen over stijl & AI | FitFi"
        description="Rustige gidsen over stijl, kleur en AI — zonder ruis. Lees hoe je sneller betere outfitkeuzes maakt."
        canonical="https://fitfi.ai/blog"
        ogImage="/images/social/blog-og.jpg"
      />

      {/* JSON-LD: Blog container */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "FitFi Blog",
            url: "https://fitfi.ai/blog",
          }),
        }}
      />

      <section className="ff-section ff-container">
        <header className="flow-lg max-w-3xl">
          <h1 className="section-title">Blog</h1>
          <p className="text-[var(--color-muted)]">
            Rustige, praktische stukken over stijl en AI — korte leestijd, direct toepasbaar.
          </p>

          {/* Zoekveld */}
          <div className="faq-search">
            <label htmlFor="blog-search" className="sr-only">Zoek in de blog</label>
            <input
              id="blog-search"
              className="input input-lg"
              type="search"
              placeholder="Zoek op onderwerp, bv. 'capsule', 'kleur' of 'AI'…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-describedby="blog-search-hint"
            />
            {q ? (
              <button type="button" className="input-clear" onClick={() => setQ("")} aria-label="Wis zoekopdracht">
                ×
              </button>
            ) : null}
            <div id="blog-search-hint" className="search-hint" aria-live="polite">
              {filtered.length} artikel{filtered.length === 1 ? "" : "en"}
            </div>
          </div>
        </header>

        {/* Tag filter */}
        <TagFilter allTags={allTags} active={tags} onToggle={toggleTag} onClear={clearTags} />

        {/* Grid */}
        <section aria-label="Artikelen" className="blog-grid">
          {filtered.map((p: BlogPost) => (
            <BlogCard key={p.id} post={p} />
          ))}
          {filtered.length === 0 && (
            <div className="card" role="status" aria-live="polite">
              <p className="text-[var(--color-muted)]">Geen artikelen gevonden.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default BlogPage;