import React from "react";
import Seo from "@/components/Seo";
import PostHeader from "@/components/blog/PostHeader";
import Footer from "@/components/layout/Footer";
import SkipLink from "@/components/a11y/SkipLink";

type RelatedPost = { title: string; excerpt: string; href: string };

const BlogPostPage: React.FC = () => {
  const title = "Kleurtemperatuur: warm, koel of neutraal?";
  const excerpt = "Een korte gids om je kleurtemperatuur te herkennen — en outfits te kiezen die je huid laten stralen.";
  const dateISO = "2025-09-16";
  const date = "16 sep 2025";
  const readingTime = "4 min";
  const tags = ["Kleur", "Gids", "Basics"];

  const related: RelatedPost[] = [
    { title: "Silhouet lezen: zo kies je vormen die werken", excerpt: "Proportie, lengte en volume laten kleding kloppen.", href: "/blog/silhouet-lezen" },
    { title: "Capsule wardrobe: 10 stuks, eindeloze combinaties", excerpt: "Rust en consistentie in je kast.", href: "/blog/capsule-wardrobe" },
  ];

  return (
    <>
      <Seo title={title} description={excerpt} />
      <SkipLink href="#post" />
      <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
        <PostHeader
          title={title}
          excerpt={excerpt}
          dateISO={dateISO}
          date={date}
          readingTime={readingTime}
          tags={tags}
        />

        <section className="ff-container py-10 sm:py-12">
          <article id="post" className="prose prose-invert max-w-none">
            <p>
              Kleurtemperatuur gaat niet over "mooie" of "foute" kleuren — het gaat over harmonie
              met je ondertoon. We onderscheiden grofweg warm, koel en neutraal. Deze gids helpt
              je in <em>2–3 minuten</em> de juiste richting te kiezen.
            </p>

            <h2>Zo test je het snel</h2>
            <ul>
              <li>Hou goud- en zilverkleur bij je gezicht; wat oogt frisser?</li>
              <li>Kijk naar aders bij je pols: neigt het naar groen (warm) of blauw/paars (koel)?</li>
              <li>Foto's buitenlicht: welke outfits maken je huid egaler?</li>
            </ul>

            <h2>Kleuren per categorie</h2>
            <p><strong>Warm:</strong> zand, camel, olijfgroen, terracotta. <strong>Koel:</strong> marine, ijsblauw, bordeaux. <strong>Neutraal:</strong> mix van beide, vermijd de extreme varianten.</p>

            <aside className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-soft)] not-prose">
              <p className="m-0"><strong>Tip:</strong> Kies één "anker"-kleur (bijv. marine) en bouw daaromheen. Zo voelt alles direct consistent.</p>
            </aside>
          </article>
        </section>

        <section className="ff-container py-10 sm:py-12">
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-heading text-xl">Verder lezen</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {related.map((p) => (
                <a key={p.href} href={p.href} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 hover:border-[var(--ff-color-primary-600)] transition">
                  <div className="text-[var(--color-text)] font-medium">{p.title}</div>
                  <p className="opacity-80 leading-7">{p.excerpt}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default BlogPostPage;