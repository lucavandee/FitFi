import React from "react";
import Seo from "@/components/Seo";
import PostHeader from "@/components/blog/PostHeader";

const BlogPostPage: React.FC = () => {
  // In een echte setup haal je de postdata uit params/loader. Voor nu statisch, editorial en rustig.
  const title = "Kleurtemperatuur: warm, koel of neutraal?";
  const excerpt = "Een korte gids om je kleurtemperatuur te herkennen — en outfits te kiezen die je huid laten stralen.";
  const date = "16 sep 2025";
  const readingTime = "4 min";

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title={`${title} | FitFi Blog`}
        description={excerpt}
        canonical="https://fitfi.ai/blog/kleurtemperatuur-gids"
      />

      <section className="ff-section">
        <div className="ff-container">
          <PostHeader title={title} excerpt={excerpt} date={date} readingTime={readingTime} />

          <article className="prose max-w-none leading-7">
            <p>
              Kleurtemperatuur gaat niet over "mooie" of "foute" kleuren — het gaat over
              harmonie met je ondertoon. We onderscheiden grofweg warm, koel en neutraal.
            </p>
            <p>
              <strong>Warm</strong> voelt beter bij crèmes, camel, olijf, terracotta.
              <strong> Koel</strong> matcht met ijsblauw, houtskool, navy, framboos.
              <strong> Neutraal</strong> kan beide kanten op — met gedempte tinten.
            </p>
            <p>
              Twijfel je? Kies één basis (bijv. navy of camel), herhaal die in schoenen/riem,
              en laat het materiaal (mat vs. glans) het werk doen. Rust, zonder ruis.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
};

export default BlogPostPage;