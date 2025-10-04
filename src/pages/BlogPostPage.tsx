import React from "react";
import { useParams, Link } from "react-router-dom";
import Seo from "@/components/Seo";
import PostHeader from "@/components/blog/PostHeader";
import { blogPosts } from "@/data/blogPosts";

/**
 * Heel lichte, veilige markdown→HTML conversie voor onze eigen contentstrings.
 * We gebruiken géén extra packages en raken styling niet aan.
 */
function mdToHtml(input: string): string {
  let html = input
    .replace(/&/g, "&amp;")  // escape eerst
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // koppen
  html = html.replace(/^###\s?(.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s?(.*)$/gm, "<h2>$1</h2>");

  // bold/italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // blockquote
  html = html.replace(/^\>\s?(.*)$/gm, "<blockquote>$1</blockquote>");

  // unordered list
  html = html.replace(/(?:^|\n)-\s+(.*)(?=\n|$)/g, "\n<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");

  // ordered list (1. 2. ...)
  html = html.replace(/(?:^|\n)\d+\.\s+(.*)(?=\n|$)/g, "\n<ol><li>$1</li></ol>");
  html = html.replace(/<\/ol>\s*<ol>/g, ""); // samenvoegen

  // paragrafen
  html = html
    .split(/\n{2,}/)
    .map((block) =>
      /^(<h2|<h3|<ul|<ol|<blockquote|<li)/.test(block.trim())
        ? block
        : `<p>${block.trim()}</p>`
    )
    .join("\n");

  return html;
}

export default function BlogPostPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.id === slug);

  if (!post) {
    return (
      <main className="ff-container py-16">
        <h1 className="font-heading text-3xl">Artikel niet gevonden</h1>
        <p className="mt-2 opacity-80">We konden dit artikel niet vinden. Bekijk onze nieuwste posts.</p>
        <div className="mt-6">
          <Link to="/blog" className="ff-btn ff-btn-secondary">Terug naar blog</Link>
        </div>
      </main>
    );
  }

  const dt = new Date(post.date);
  const pretty = dt.toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <Seo title={post.title} description={post.excerpt} />
      <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
        <section className="ff-container py-10 sm:py-12">
          <PostHeader
            title={post.title}
            excerpt={post.excerpt}
            date={pretty}
            readingTime="4–6 min"
          />
        </section>

        <section className="ff-container pb-16">
          <article
            className="prose prose-invert max-w-none"
            // content komt uit eigen data-bestand
            dangerouslySetInnerHTML={{ __html: mdToHtml(post.content) }}
          />
        </section>

        <section className="ff-container pb-16">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-heading text-xl">Verder lezen</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {blogPosts.filter(p => p.id !== post.id).slice(0, 2).map((p) => (
                <Link key={p.id} to={`/blog/${p.id}`} className="ff-btn ff-btn-secondary">
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}