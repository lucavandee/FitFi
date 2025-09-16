import React from "react";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import SwipeCarousel from "@/components/ui/SwipeCarousel";

const steps = [
  {
    title: "Korte stijltest",
    text: "In ±2 min. peilen we je stijl, silhouet en kleurtemperatuur.",
    chips: ["Snel", "Gefocust"],
  },
  {
    title: "AI-profiel",
    text: "We bouwen je profiel met archetypen en do's & don'ts.",
    chips: ["Archetypen", "Kleuren"],
  },
  {
    title: "Outfits met uitleg",
    text: "10+ outfits in Pro met 1–2 zinnen waarom dit past.",
    chips: ["Seizoen", "Silhouet"],
  },
];

const HowItWorksRail: React.FC = () => {
  const start = () => (window.location.href = "/dynamic-onboarding");

  return (
    <section className="section" aria-labelledby="rail-title">
      <div className="container">
        <div className="inline-flex items-center gap-2 text-sm muted mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Hoe het werkt</span>
        </div>
        <h2 id="rail-title" className="hero__title text-[clamp(1.75rem,4.5vw,2.25rem)]">
          Van test naar outfits — helder en snel
        </h2>

        {/* Swipe rail */}
        <div className="mt-6">
          <SwipeCarousel ariaLabel="How it works carrousel">
            {steps.map((s) => (
              <article key={s.title} className="subcard interactive-elevate">
                <div className="subcard__inner">
                  <h3 className="subcard__title">{s.title}</h3>
                  <p className="subcard__kicker">{s.text}</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {s.chips.map((c) => (
                      <li key={c} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[color:var(--color-success)]" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </SwipeCarousel>
        </div>

        <div className="mt-6">
          <button onClick={start} className="btn btn-primary btn-lg" aria-label="Start gratis">
            Start gratis
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksRail;