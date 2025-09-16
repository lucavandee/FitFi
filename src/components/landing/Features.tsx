import React from "react";
import { User, Target, Sparkles, Heart } from "lucide-react";
import { track } from "@/utils/analytics";

const ITEMS = [
  { 
    title: "AI-profiel op maat", 
    desc: "Archetype, kleurtemperatuur en silhouet — helder uitgelegd.", 
    icon: <User className="w-5 h-5" />,
    id: "ai-profile"
  },
  { 
    title: "Do's & don'ts", 
    desc: "Materiaal, fit en verhoudingen die voor jou werken.", 
    icon: <Target className="w-5 h-5" />,
    id: "dos-donts"
  },
  { 
    title: "Outfits met uitleg", 
    desc: "Per look 1–2 zinnen waarom dit bij je past.", 
    icon: <Sparkles className="w-5 h-5" />,
    id: "outfit-explanations"
  },
  { 
    title: "Duurzaam denken", 
    desc: "Minder spullen, betere keuzes. Capsule-ready.", 
    icon: <Heart className="w-5 h-5" />,
    id: "sustainable"
  },
];

const Features: React.FC<{ className?: string }> = ({ className = "" }) => {
  const handleFeatureClick = (featureId: string, title: string) => {
    track("feature_card_click", {
      feature_id: featureId,
      feature_title: title,
      section: "landing_features"
    });
  };

  return (
    <section 
      className={`section bg-[color:var(--color-bg)] ${className}`} 
      aria-labelledby="features-heading"
    >
      <div className="container">
        <header className="max-w-3xl text-center mx-auto">
          <h2 id="features-heading" className="hero__title">
            Wat zit er in het AI Style Report?
          </h2>
          <p className="lead mt-4">
            Alles wat je nodig hebt om keuzes met vertrouwen te maken.
          </p>
        </header>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((feature, index) => (
            <article 
              key={feature.id} 
              className="subcard interactive-elevate cursor-pointer group"
              onClick={() => handleFeatureClick(feature.id, feature.title)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleFeatureClick(feature.id, feature.title);
                }
              }}
              aria-label={`Meer informatie over ${feature.title}`}
            >
              <div className="subcard__inner">
                <div className="inline-flex items-center justify-center rounded-lg border border-[color:var(--color-border)] p-3 mb-4 bg-gradient-to-br from-[color:var(--color-surface)] to-[color:var(--color-accent)] group-hover:scale-105 transition-transform duration-200">
                  <div className="text-[color:var(--color-primary)]">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="subcard__title text-lg mb-2 group-hover:text-[color:var(--color-primary)] transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="subcard__kicker leading-relaxed">
                  {feature.desc}
                </p>
              </div>
              
              {/* Hover indicator */}
              <div className="absolute inset-0 rounded-[var(--radius-lg)] border-2 border-transparent group-hover:border-[color:var(--color-primary)] transition-colors duration-200 pointer-events-none opacity-0 group-hover:opacity-100" />
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-[color:var(--color-muted)] mb-4">
            Klaar om je persoonlijke stijlprofiel te ontdekken?
          </p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => track("features_cta_click", { section: "landing_features" })}
          >
            Start je stijlanalyse
          </button>
        </div>
      </div>
    </section>
  );
};

export default Features;