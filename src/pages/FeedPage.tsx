import React from "react";
import { CheckCircle } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";
import SwipeCarousel from "@/components/ui/SwipeCarousel";
import Seo from "@/components/Seo";

type Card = { title: string; body: string; why: string; tags: string[] };

const cards: Card[] = [
  { title: "Smart casual — Italiaans", body: "Taupe knit • rechte pantalon • witte sneaker.", why: "Warme taupe + clean lijnen = relaxed chic.", tags: ["Smart casual","Italiaans"] },
  { title: "Diner — ton-sur-ton", body: "Merino crewneck • donker-taupe chino • leren sneaker.", why: "Ton-sur-ton verlengt je silhouet; merino oogt verfijnd.", tags: ["Diner","Ton-sur-ton"] },
  { title: "Smart denim", body: "Indigo denim • crisp oxford • suède desert boot.", why: "Indigo contrasteert subtiel; suède voegt luxe textuur toe.", tags: ["Denim","Smart"] },
  { title: "Rain-ready commute", body: "Tech trench • tapered chino • waterdichte sneaker.", why: "Tech shell houdt proporties strak; functioneel zonder bulk.", tags: ["Reizen","Weer"] },
];

const FeedPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <Seo title="Feed — Outfit inspiratie" description="Swipe door outfits die passen bij seizoen en gelegenheid." canonical="https://www.fitfi.ai/feed" />
      <main>
        <section className="section" aria-labelledby="feed-title">
          <div className="container">
            <header className="flex items-end justify-between gap-4">
              <div>
                <h1 id="feed-title" className="hero__title text-[clamp(2rem,5vw,2.6rem)]">Jouw feed</h1>
                <p className="lead mt-1">Seizoens-ready looks met korte uitleg waarom het werkt.</p>
              </div>
              <a href="/quiz" className="btn btn-primary">Personaliseer mijn feed</a>
            </header>

            <div className="mt-8">
              <SwipeCarousel ariaLabel="Feed carrousel">
                {cards.map((c) => (
                  <article key={c.title} className="subcard">
                    <div className="subcard__inner">
                      <h2 className="subcard__title">{c.title}</h2>
                      <p className="subcard__kicker">{c.body}</p>
                      <p className="mt-3 text-sm">
                        <strong>Waarom dit werkt:</strong> {c.why}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {c.tags.map((t) => <span key={t} className="chip">{t}</span>)}
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-[color:var(--color-success)]" />
                        <span>Seizoen-ready</span>
                      </div>
                    </div>
                  </article>
                ))}
              </SwipeCarousel>
            </div>
          </div>
        </section>
      </main>
    </ErrorBoundary>
  );
};

export default FeedPage;