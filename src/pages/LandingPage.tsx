// src/pages/LandingPage.tsx
import React, { useEffect } from "react";
import Hero from "@/components/landing/Hero";
import BrandStrip from "@/components/brand/BrandStrip";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import PreviewCarousel from "@/components/landing/PreviewCarousel";
import SocialProof from "@/components/landing/SocialProof";
import UGCGallery from "@/components/landing/UGCGallery";
import ClosingCTA from "@/components/landing/ClosingCTA";
import { CheckCircle, TrendingUp, Users, Award } from "lucide-react";
import { track } from "@/utils/analytics";

const LandingPage: React.FC = () => {
  useEffect(() => {
    track("page:landing-view", {
      timestamp: Date.now(),
      referrer: document.referrer || "direct",
      userAgent: navigator.userAgent
    });
  }, []);

  const handleMetricClick = (metric: string, value: string) => {
    track("landing:metric-click", {
      metric,
      value,
      section: "metrics-strip",
      timestamp: Date.now()
    });
  };

  const handleWhyItWorksClick = () => {
    track("landing:why-it-works-click", {
      section: "why-it-works",
      timestamp: Date.now()
    });
  };

  const handleSeasonChipClick = (category: string) => {
    track("landing:season-chip-click", {
      category,
      section: "season-ready",
      timestamp: Date.now()
    });
  };

  return (
    <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)] font-body">
      <Hero />
      <BrandStrip />

      {/* Enhanced Metrics strip */}
      <section className="section bg-gradient-to-b from-[color:var(--color-bg)] to-[color:var(--overlay-primary-4a)]">
        <div className="container">
          <header className="text-center mb-8">
            <h2 className="hero__title">Bewezen resultaten</h2>
            <p className="lead mt-2">Duizenden gebruikers vonden hun perfecte stijl</p>
          </header>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { v: "97%", l: "tevredenheid na eerste outfits", icon: <Award className="w-6 h-6" />, color: "success" },
              { v: "2 min", l: "van test naar stijlprofiel", icon: <TrendingUp className="w-6 h-6" />, color: "primary" },
              { v: "10+", l: "outfits met uitleg in Pro", icon: <Users className="w-6 h-6" />, color: "accent" },
            ].map((m) => (
              <article 
                key={m.l} 
                className="card interactive-elevate cursor-pointer group"
                onClick={() => handleMetricClick(m.l, m.v)}
                onKeyDown={(e) => e.key === 'Enter' && handleMetricClick(m.l, m.v)}
                tabIndex={0}
                role="button"
                aria-label={`${m.v} ${m.l}`}
              >
                <div className="card__inner text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[color:var(--color-primary)] to-[color:var(--color-accent)] text-white mb-4 group-hover:scale-110 transition-transform duration-200">
                    {m.icon}
                  </div>
                  <div className="metric">
                    <div className="metric__value text-[color:var(--color-primary)] group-hover:text-[color:var(--ff-color-primary-600)] transition-colors">
                      {m.v}
                    </div>
                    <div className="metric__label group-hover:text-[color:var(--color-text)] transition-colors">
                      {m.l}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Features />
      <HowItWorks />
      <PreviewCarousel />
      <SocialProof />
      <UGCGallery />

      {/* Enhanced Waarom het werkt */}
      <section className="section bg-gradient-to-b from-[color:var(--overlay-primary-4a)] to-[color:var(--color-bg)]">
        <div className="container grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <article 
            className="card interactive-elevate cursor-pointer group"
            onClick={handleWhyItWorksClick}
            onKeyDown={(e) => e.key === 'Enter' && handleWhyItWorksClick()}
            tabIndex={0}
            role="button"
            aria-label="Lees meer over waarom onze methode werkt"
          >
            <div className="card__inner">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[color:var(--color-primary)] to-[color:var(--color-accent)] text-white group-hover:scale-110 transition-transform duration-200">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h2 className="card__title group-hover:text-[color:var(--color-primary)] transition-colors">
                  Waarom dit werkt
                </h2>
              </div>
              
              <p className="card__text group-hover:text-[color:var(--color-text)] transition-colors">
                We combineren je silhouet, kleurtemperatuur en stijlvoorkeuren. Per outfit krijg je
                1–2 zinnen uitleg — precies genoeg om zelfverzekerd te kiezen.
              </p>
              
              <ul className="mt-6 space-y-3">
                {[
                  { text: "Silhouet-vriendelijke fits", desc: "Benadrukt je beste eigenschappen" },
                  { text: "Materialen die vallen zoals jij wilt", desc: "Comfort en stijl in balans" },
                  { text: "Kleuren die je huid laten spreken", desc: "Warme of koele ondertoon" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3 group/item">
                    <CheckCircle className="w-5 h-5 text-[color:var(--color-success)] mt-0.5 group-hover/item:scale-110 transition-transform duration-200" />
                    <div>
                      <span className="font-medium group-hover/item:text-[color:var(--color-primary)] transition-colors">
                        {item.text}
                      </span>
                      <p className="text-sm text-[color:var(--color-muted)] mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <div className="space-y-6">
            <article className="subcard">
              <div className="subcard__inner">
                <div className="flex items-center gap-3 mb-3">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[color:var(--color-accent)] to-[color:var(--color-primary)] text-white">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="subcard__title">Seizoen-ready</h3>
                </div>
                <p className="subcard__kicker mb-4">
                  Outfits variëren automatisch per seizoen en gelegenheid.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { name: "Werk", desc: "Professional & comfortabel" },
                    { name: "Weekend", desc: "Relaxed maar stijlvol" },
                    { name: "Diner", desc: "Elegant voor speciale momenten" },
                    { name: "Reizen", desc: "Praktisch en veelzijdig" }
                  ].map((c) => (
                    <button
                      key={c.name}
                      className="chip hover:bg-[color:var(--color-primary)] hover:text-white hover:border-[color:var(--color-primary)] transition-all duration-200 text-left"
                      onClick={() => handleSeasonChipClick(c.name)}
                      aria-label={`${c.name}: ${c.desc}`}
                      title={c.desc}
                    >
                      <span className="font-medium">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </article>

            {/* Trust indicators */}
            <article className="subcard">
              <div className="subcard__inner">
                <div className="flex items-center gap-3 mb-3">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[color:var(--color-success)] to-[color:var(--color-primary)] text-white">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="subcard__title">Vertrouwd door duizenden</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[color:var(--color-primary)]">10.000+</div>
                    <div className="text-sm text-[color:var(--color-muted)]">Actieve gebruikers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[color:var(--color-success)]">4.8/5</div>
                    <div className="text-sm text-[color:var(--color-muted)]">Gemiddelde rating</div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <ClosingCTA />
    </main>
  );
};

export default LandingPage;