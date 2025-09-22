import React from "react";
import Seo from "@/components/Seo";
import BlogHeader from "@/components/blog/BlogHeader";
import Footer from "@/components/layout/Footer";
import SkipLink from "@/components/a11y/SkipLink";

const posts = [
  { title: "Wat je silhouet écht zegt over je outfitkeuzes", excerpt: "De 4 meest voorkomende silhouetten en hoe stof & snit het verschil maken.", href: "/blog/silhouet-outfits" },
  { title: "Kleurtemperatuur: warm, koel of neutraal?", excerpt: "Een korte gids om je kleurtemperatuur te herkennen — en outfits te kiezen die je huid laten stralen.", href: "/blog/kleurtemperatuur-gids" },
  { title: "Rust in je garderobe: 5 micro-beslissingen", excerpt: "Kleine keuzes met groot effect: consistentie in stof, tint en fit.", href: "/blog/rust-in-garderobe" },
];

const BlogPage: React.FC = () => {
  return (
    <>
      <SkipLink />
      <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Blog — Styling zonder ruis | FitFi"
        description="Korte, heldere stukken over silhouet, materiaal en kleurtemperatuur. Rustig en direct toepasbaar."
        canonical="https://fitfi.ai/blog"
      />

      <section className="ff-section">
        <div className="ff-container">
          <BlogHeader
            title="Styling zonder ruis"
            intro="Korte, praktische stukken over silhouet, materiaal en kleurtemperatuur — in een rustige editorial stijl."
          />

          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <a
                key={p.href}
                href={p.href}
                className="card card-hover block rounded-[var(--radius-lg)] p-6 focus:outline-none focus-visible:ring-2"
                aria-label={p.title}
              >
                <h2 className="text-lg font-semibold mb-1">{p.title}</h2>
                <p className="opacity-80 leading-7">{p.excerpt}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
      <Footer />
      </main>
    </>
  );
};

export default BlogPage;