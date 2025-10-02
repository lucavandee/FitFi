import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { CheckCircle, Sparkles, Zap, Shield, Clock, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <main id="main" className="relative overflow-hidden">
      <Helmet>
        <title>AI Style Report in 2 minuten – Persoonlijk stijladvies | FitFi</title>
        <meta
          name="description"
          content="Krijg in 2:00 een persoonlijk AI Style Report met uitleg, kleuren en 6–12 outfits. Privacy-first en nuchter. Start gratis."
        />
        <meta property="og:image" content="/hero/style-report.webp" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "FitFi",
            "description": "AI-powered personal styling platform",
            "url": "https://fitfi.nl",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web"
          })}
        </script>
      </Helmet>

      {/* PREMIUM HERO SECTION */}
      <section className="ff-hero-premium" aria-label="FitFi AI Style Report">
        {/* Animated Background Elements */}
        <div className="ff-hero-bg">
          <div className="ff-orb ff-orb-1"></div>
          <div className="ff-orb ff-orb-2"></div>
          <div className="ff-orb ff-orb-3"></div>
          <div className="ff-grid-overlay"></div>
        </div>

        <div className="ff-container--premium">
          <div className="ff-hero-layout">
            {/* Content Column */}
            <div className="ff-hero-content">
              <div className="ff-hero-badge">
                <Sparkles className="w-4 h-4" />
                <span>GRATIS AI STYLE REPORT</span>
                <div className="ff-badge-glow"></div>
              </div>

              <h1 className="ff-hero-title-premium">
                Ontdek wat jouw{" "}
                <span className="ff-gradient-text">stijl over je zegt</span>
              </h1>

              <p className="ff-hero-subtitle-premium">
                Binnen 2 minuten krijg je een persoonlijk AI Style Report met uitleg, 
                kleuren en 6–12 outfits. Privacy-first, EU-gericht en zonder gedoe.
              </p>

              {/* Trust Indicators */}
              <div className="ff-trust-indicators">
                <div className="ff-trust-item">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>100% Gratis</span>
                </div>
                <div className="ff-trust-item">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span>Privacy-first</span>
                </div>
                <div className="ff-trust-item">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <span>2 min setup</span>
                </div>
              </div>

              {/* Premium CTAs */}
              <div className="ff-cta-group">
                <NavLink 
                  to="/onboarding" 
                  className="ff-btn-premium-primary"
                  data-event="cta_start_free_home_hero"
                >
                  <Zap className="w-5 h-5" />
                  <span>Start gratis</span>
                  <div className="ff-btn-glow"></div>
                </NavLink>
                <NavLink 
                  to="/results" 
                  className="ff-btn-premium-secondary"
                  data-event="cta_view_example_hero"
                >
                  Bekijk voorbeeldrapport
                </NavLink>
              </div>

              {/* Social Proof */}
              <div className="ff-social-proof">
                <div className="ff-avatars">
                  <div className="ff-avatar">M</div>
                  <div className="ff-avatar">S</div>
                  <div className="ff-avatar">L</div>
                  <div className="ff-avatar-more">+2.1k</div>
                </div>
                <div className="ff-social-text">
                  <div className="ff-rating">
                    <span>★★★★★</span>
                    <span className="font-semibold">4.9</span>
                  </div>
                  <p>Meer dan 2.100 mensen ontdekten hun stijl</p>
                </div>
              </div>
            </div>

            {/* Visual Column */}
            <div className="ff-hero-visual-premium">
              <div className="ff-device-container">
                <figure className="ff-device-frame" aria-describedby="hero-preview-caption">
                  <img
                    src="/hero/style-report.webp"
                    alt="Voorbeeld van het FitFi Style Report op mobiel"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    sizes="(max-width: 1024px) 90vw, 560px"
                    className="ff-device-image"
                  />
                  <figcaption id="hero-preview-caption" className="sr-only">
                    Voorbeeldrapport met archetype, kleuren en outfits.
                  </figcaption>

                  {/* Floating Feature Cards */}
                  <div className="ff-floating-cards">
                    <div className="ff-float-card ff-float-card-1">
                      <div className="ff-card-icon">🎯</div>
                      <div>
                        <h4>Archetype</h4>
                        <p>Modern Minimal</p>
                      </div>
                    </div>
                    <div className="ff-float-card ff-float-card-2">
                      <div className="ff-card-icon">👔</div>
                      <div>
                        <h4>12 Outfits</h4>
                        <p>Met shoplinks</p>
                      </div>
                    </div>
                    <div className="ff-float-card ff-float-card-3">
                      <div className="ff-card-icon">🤖</div>
                      <div>
                        <h4>AI Powered</h4>
                        <p>Persoonlijk advies</p>
                      </div>
                    </div>
                  </div>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM FEATURES SECTION */}
      <section className="ff-section-premium" aria-label="Waarom FitFi">
        <div className="ff-container--premium">
          <div className="ff-section-header-premium">
            <div className="ff-section-badge">
              <Sparkles className="w-4 h-4" />
              <span>WAAROM FITFI</span>
            </div>
            <h2 className="ff-section-title-premium">
              Meer dan alleen <span className="ff-gradient-text">stijladvies</span>
            </h2>
            <p className="ff-section-subtitle-premium">
              Ontdek waarom duizenden mensen kiezen voor FitFi's AI-gedreven aanpak
            </p>
          </div>

          <div className="ff-features-grid">
            <div className="ff-feature-card ff-feature-card-1">
              <div className="ff-feature-icon">
                <Zap className="w-6 h-6" />
              </div>
              <h3>2 Minuten Setup</h3>
              <p>Geen lange vragenlijsten. Onze AI begrijpt je stijl in een paar klikken.</p>
              <div className="ff-feature-glow"></div>
            </div>

            <div className="ff-feature-card ff-feature-card-2">
              <div className="ff-feature-icon">
                <Shield className="w-6 h-6" />
              </div>
              <h3>Privacy-First</h3>
              <p>Jouw data blijft van jou. Geen tracking, geen verkoop van gegevens.</p>
              <div className="ff-feature-glow"></div>
            </div>

            <div className="ff-feature-card ff-feature-card-3">
              <div className="ff-feature-icon">
                <Users className="w-6 h-6" />
              </div>
              <h3>EU-Gericht</h3>
              <p>Speciaal ontwikkeld voor Nederlandse en Europese stijlvoorkeuren.</p>
              <div className="ff-feature-glow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM STATS SECTION */}
      <section className="ff-stats-section" aria-label="FitFi statistieken">
        <div className="ff-container--premium">
          <div className="ff-stats-grid">
            <div className="ff-stat-item">
              <div className="ff-stat-number">2.1k+</div>
              <div className="ff-stat-label">Tevreden gebruikers</div>
            </div>
            <div className="ff-stat-item">
              <div className="ff-stat-number">4.9★</div>
              <div className="ff-stat-label">Gemiddelde beoordeling</div>
            </div>
            <div className="ff-stat-item">
              <div className="ff-stat-number">12</div>
              <div className="ff-stat-label">Outfits per rapport</div>
            </div>
            <div className="ff-stat-item">
              <div className="ff-stat-number">2min</div>
              <div className="ff-stat-label">Gemiddelde tijd</div>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM CTA SECTION */}
      <section className="ff-cta-section-premium" aria-label="Start nu">
        <div className="ff-container--premium">
          <div className="ff-cta-card-premium">
            <div className="ff-cta-content">
              <h2 className="ff-cta-title">
                Klaar om je <span className="ff-gradient-text">stijl te ontdekken</span>?
              </h2>
              <p className="ff-cta-subtitle">
                Join 2.100+ mensen die al hun perfecte stijl hebben gevonden
              </p>
              <NavLink 
                to="/onboarding" 
                className="ff-btn-premium-primary ff-btn-large"
                data-event="cta_start_free_bottom"
              >
                <Zap className="w-5 h-5" />
                <span>Start gratis Style Report</span>
                <div className="ff-btn-glow"></div>
              </NavLink>
            </div>
            <div className="ff-cta-visual">
              <div className="ff-cta-orb"></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}