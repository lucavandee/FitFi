import React from "react";
import Seo from "@/components/Seo";
import PostHeader from "@/components/blog/PostHeader";

const BlogPostPage: React.FC = () => {
  const title = "Kleurtemperatuur: warm, koel of neutraal?";
  const excerpt =
    "Een korte gids om je kleurtemperatuur te herkennen — en outfits te kiezen die je huid laten stralen.";
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

          {/* Strakkere editorial typografie */}
          <article className="article" aria-labelledby="post-body">
            <p id="post-body">
              Kleurtemperatuur gaat niet over "mooie" of "foute" kleuren — het gaat over harmonie
              met je ondertoon. We onderscheiden grofweg warm, koel en neutraal. Deze gids helpt
              je in <em>2–3 minuten</em> de juiste richting te kiezen.
            </p>

            <aside className="callout" role="note" aria-label="Tip">
              <strong>Snelle tip:</strong> twijfel je? Leg een wit T-shirt naast een crèmekleurig
              T-shirt onder daglicht. Welke doet je huid rustiger ogen — helder wit (koel) of crème
              (warm)?
            </aside>

            <h2>Zo herken je je kleurtemperatuur</h2>
            <ul>
              <li>
                <strong>Warm</strong> — goud in sieraden staat je vaak beter dan zilver; aders ogen
                eerder groen; natuurlijke match met crèmes, camel, olijf, terracotta.
              </li>
              <li>
                <strong>Koel</strong> — zilver werkt vaak beter; aders ogen eerder blauw; matcht
                met ijsblauw, houtskool, navy, framboos.
              </li>
              <li>
                <strong>Neutraal</strong> — mix van beide signalen; gedempte tinten en midden-waarden
                werken het best.
              </li>
            </ul>

            <figure className="pullquote">
              <blockquote>
                "Kleur werkt wanneer stof, tint en <em>ondertoon</em> hetzelfde verhaal vertellen."
              </blockquote>
              <figcaption>— FitFi Styling</figcaption>
            </figure>

            <h3>Outfits kiezen zonder ruis</h3>
            <p>
              Begin met één basis (bijv. navy of camel), herhaal die in schoenen/riem en houd
              materialen consistent (mat vs. glans). Zo krijgt je look rust zonder saai te worden.
            </p>

            <h3>Veelgemaakte missers (en snelle fixes)</h3>
            <ol>
              <li>
                Te veel contrasterende tinten combineren. <span className="fix">Fix:</span> beperk
                tot 2 kleurfamilies + 1 accent.
              </li>
              <li>
                Glanzend materiaal bij een warme, matte garderobe. <span className="fix">Fix:</span>{" "}
                kies suède/gebreid i.p.v. lakleer/satijn.
              </li>
              <li>
                Verkeerde white-balance bij online shoppen. <span className="fix">Fix:</span>{" "}
                check productfoto's op verschillende achtergronden.
              </li>
            </ol>

            <hr />

            <p>
              Klaar om het te testen? Start je gratis AI Style Report en zie outfits die passen bij
              jouw silhouet en kleurtemperatuur — privacy-first, zonder account.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
};

export default BlogPostPage;