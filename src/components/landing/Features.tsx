import React from "react";
import { User, Target, Sparkles, Heart } from "lucide-react";

const ITEMS = [
  { title: "AI-profiel op maat", desc: "Archetype, kleurtemperatuur en silhouet — helder uitgelegd.", icon: <User className="w-5 h-5" /> },
  { title: "Do's & don'ts", desc: "Materiaal, fit en verhoudingen die voor jou werken.", icon: <Target className="w-5 h-5" /> },
  { title: "Outfits met uitleg", desc: "Per look 1–2 zinnen waarom dit bij je past.", icon: <Sparkles className="w-5 h-5" /> },
  { title: "Duurzaam denken", desc: "Minder spullen, betere keuzes. Capsule-ready.", icon: <Heart className="w-5 h-5" /> },
];

const Features: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <section className={`section ${className}`} aria-labelledby="features-heading">
      <div className="container">
        <header className="max-w-3xl">
          <h2 id="features-heading" className="hero__title">Wat zit er in het AI Style Report?</h2>
          <p className="lead mt-3">Alles wat je nodig hebt om keuzes met vertrouwen te maken.</p>
        </header>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((f) => (
            <article key={f.title} className="subcard interactive-elevate">
              <div className="subcard__inner">
                <div className="inline-flex items-center justify-center rounded-lg border border-[color:var(--color-border)] p-2 mb-3">
                  {f.icon}
                </div>
                <h3 className="subcard__title">{f.title}</h3>
                <p className="subcard__kicker">{f.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;