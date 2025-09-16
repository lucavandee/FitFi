import React from "react";
import { CheckCircle2, Sparkles, ArrowRight, Users, Star, TrendingUp } from "lucide-react";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/media/SmartImage";
import Seo from "@/components/Seo";
import { w } from "@/utils/analytics";
import { track } from "@/utils/analytics";

const Hero: React.FC = () => {
  const handleCTAClick = (action: string) => {
    track('hero_cta_click', {
      action,
      section: 'hero',
      timestamp: Date.now()
    });
  };

  const handleFeatureClick = (feature: string) => {
    track('hero_feature_click', {
      feature,
      section: 'hero',
      timestamp: Date.now()
    });
  };

  return (
    <>
      <Seo
        title="Ontdek jouw perfecte stijl met AI — FitFi"
        description="Van korte test naar outfits met uitleg. Koel-taupe design, premium ervaring, privacy-first."
        canonical="https://fitfi.ai/"
      />
      <section id="main" className="section relative overflow-hidden" aria-labelledby="hero-title">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--color-bg)] via-[color:var(--color-surface)] to-[color:var(--overlay-accent-08a)] opacity-60" />
        
        <div className="container relative z-10">
          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm text-[color:var(--color-muted)]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[color:var(--color-primary)]" />
              <span>25.000+ gebruikers</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[color:var(--color-primary)]" />
              <span>4.8/5 sterren</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[color:var(--color-primary)]" />
              <span>95% tevreden</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
            {/* Copy */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 text-sm text-[color:var(--color-muted)] mb-4 animate-fadeIn">
                <div className="w-2 h-2 bg-gradient-to-r from-[color:var(--color-primary)] to-[color:var(--color-accent)] rounded-full animate-pulse" />
                <Sparkles className="w-4 h-4 text-[color:var(--color-primary)]" aria-hidden="true" />
                <span className="font-medium">AI-Powered Styling</span>
              </div>
              
              <h1 id="hero-title" className="hero__title animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                Ontdek jouw{' '}
                <span className="bg-gradient-to-r from-[color:var(--color-primary)] to-[color:var(--ff-color-primary-600)] bg-clip-text text-transparent">
                  perfecte stijl
                </span>{' '}
                met AI
              </h1>
              
              <p className="lead mt-4 max-w-2xl animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                Persoonlijk stijlrapport met outfits en korte uitleg waarom het werkt bij jouw silhouet, materialen en kleurtemperatuur.
              </p>

              <ul className="mt-6 flex flex-col gap-3 text-sm animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                {[
                  { text: "Gratis persoonlijkheidstest", feature: "personality_test" },
                  { text: "AI-gepersonaliseerde outfits", feature: "ai_outfits" },
                  { text: "Nederlandse merken", feature: "dutch_brands" }
                ].map((item) => (
                  <li 
                    key={item.text} 
                    className="inline-flex items-center gap-3 cursor-pointer hover:text-[color:var(--color-primary)] transition-colors duration-200"
                    onClick={() => handleFeatureClick(item.feature)}
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-[color:var(--color-success)] to-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                <Button 
                  as={Link as any} 
                  to="/registreren" 
                  variant="primary" 
                  size="lg" 
                  className="group relative overflow-hidden"
                  onClick={() => handleCTAClick('start_free')}
                  aria-label="Start gratis AI Style Report"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Ja, geef mij mijn gratis AI Style Report
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--ff-color-primary-600)] to-[color:var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </Button>
                
                <Button 
                  as={Link as any} 
                  to="/hoe-het-werkt" 
                  variant="ghost" 
                  size="lg"
                  className="group"
                  onClick={() => handleCTAClick('how_it_works')}
                  aria-label="Hoe werkt het?"
                >
                  <span>Hoe werkt het?</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[color:var(--color-muted)] animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[color:var(--color-success)] rounded-full" />
                  <span>Geen creditcard vereist</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[color:var(--color-success)] rounded-full" />
                  <span>Privacy-first</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[color:var(--color-success)] rounded-full" />
                  <span>GDPR compliant</span>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="lg:col-span-5 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
              <div className="hero__card relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--overlay-primary-12a)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <SmartImage
                  src="/images/hero/nova-hero.jpg"
                  alt="Nova AI — jouw stylist"
                  loading="eager"
                  decoding="async"
                  className="block h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                <div className="hero__card-footer relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[color:var(--color-muted)]">Voorproefje van je rapport</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[color:var(--color-success)] rounded-full animate-pulse" />
                      <span className="text-xs text-[color:var(--color-success)]">Live</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="chip bg-gradient-to-r from-[color:var(--color-primary)] to-[color:var(--color-accent)] text-white">
                      Taupe • Smart casual
                    </span>
                    <div className="flex -space-x-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-[color:var(--color-surface)] border-2 border-[color:var(--color-bg)] flex items-center justify-center">
                          <Star className="w-3 h-3 text-[color:var(--color-primary)]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute top-4 right-4 bg-[color:var(--color-surface)] rounded-full p-2 shadow-lg animate-bounce" style={{ animationDelay: '2s' }}>
                  <Sparkles className="w-4 h-4 text-[color:var(--color-primary)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;