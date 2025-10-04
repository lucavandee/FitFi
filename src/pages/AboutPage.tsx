import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { Users, Target, Heart, Sparkles, CheckCircle, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Over FitFi - Ons verhaal en missie | FitFi</title>
        <meta
          name="description"
          content="Leer meer over FitFi, ons team en onze missie om persoonlijk stijladvies toegankelijk te maken voor iedereen."
        />
      </Helmet>

      {/* HERO SECTION */}
      <section className="ff-about-hero">
        <div className="ff-container--home">
          <div className="ff-about-hero-content">
            <div className="ff-premium-badge">
              <Sparkles className="w-4 h-4" />
              <span>ONS VERHAAL</span>
            </div>
            
            <h1 className="ff-about-title">
              Wij maken <span className="ff-gradient-text">persoonlijk stijladvies</span> toegankelijk voor iedereen
            </h1>
            
            <p className="ff-about-subtitle">
              FitFi ontstond uit frustratie over dure personal stylists en generieke mode-apps. 
              Wij geloven dat iedereen recht heeft op stijladvies dat écht bij hen past.
            </p>

            <div className="ff-trust-indicators">
              <div className="ff-trust-item">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>100% Privacy-first</span>
              </div>
              <div className="ff-trust-item">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Nederlandse startup</span>
              </div>
              <div className="ff-trust-item">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>AI + menselijke expertise</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="ff-section">
        <div className="ff-container--home">
          <div className="ff-mission-grid">
            <div className="ff-mission-card ff-mission-card--primary">
              <div className="ff-mission-icon">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="ff-mission-title">Onze Missie</h2>
              <p className="ff-mission-text">
                Persoonlijk stijladvies democratiseren door AI en menselijke expertise te combineren. 
                Geen dure stylists meer nodig - iedereen verdient toegang tot professioneel stijladvies.
              </p>
            </div>

            <div className="ff-mission-card">
              <div className="ff-mission-icon">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="ff-mission-title">Onze Waarden</h3>
              <ul className="ff-values-list">
                <li>Privacy en transparantie eerst</li>
                <li>Toegankelijk voor iedereen</li>
                <li>Authentieke stijl, geen trends</li>
                <li>Duurzame keuzes stimuleren</li>
              </ul>
            </div>

            <div className="ff-mission-card">
              <div className="ff-mission-icon">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="ff-mission-title">Ons Team</h3>
              <p className="ff-mission-text">
                Een mix van AI-experts, stylisten en UX-designers uit Nederland. 
                Wij begrijpen de Nederlandse markt en maken producten die écht werken.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STORY TIMELINE */}
      <section className="ff-section">
        <div className="ff-container--home">
          <div className="ff-section-header">
            <h2 className="ff-section-title">Ons Verhaal</h2>
            <p className="ff-section-subtitle">Van idee tot AI-stylist in 18 maanden</p>
          </div>

          <div className="ff-timeline">
            <div className="ff-timeline-item">
              <div className="ff-timeline-marker">2023</div>
              <div className="ff-timeline-content">
                <h3 className="ff-timeline-title">Het Begin</h3>
                <p className="ff-timeline-text">
                  Frustratie over dure personal stylists (€150+ per uur) en generieke mode-apps 
                  die niet begrijpen wat écht bij je past.
                </p>
              </div>
            </div>

            <div className="ff-timeline-item">
              <div className="ff-timeline-marker">Q1 '24</div>
              <div className="ff-timeline-content">
                <h3 className="ff-timeline-title">Eerste Prototype</h3>
                <p className="ff-timeline-text">
                  AI-model getraind op duizenden outfit-combinaties en stijlprofielen. 
                  Focus op Nederlandse voorkeuren en merken.
                </p>
              </div>
            </div>

            <div className="ff-timeline-item">
              <div className="ff-timeline-marker">Q3 '24</div>
              <div className="ff-timeline-content">
                <h3 className="ff-timeline-title">Beta Launch</h3>
                <p className="ff-timeline-text">
                  500+ beta-gebruikers testen het platform. 92% tevredenheid en waardevolle feedback 
                  voor verdere ontwikkeling.
                </p>
              </div>
            </div>

            <div className="ff-timeline-item">
              <div className="ff-timeline-marker">Nu</div>
              <div className="ff-timeline-content">
                <h3 className="ff-timeline-title">Publieke Launch</h3>
                <p className="ff-timeline-text">
                  FitFi is live! Gratis AI Style Reports voor iedereen, met premium features 
                  voor wie meer wil.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="ff-section">
        <div className="ff-container--home">
          <div className="ff-stats-grid">
            <div className="ff-stat-card">
              <div className="ff-stat-number">2.000+</div>
              <div className="ff-stat-label">Style Reports gegenereerd</div>
            </div>
            <div className="ff-stat-card">
              <div className="ff-stat-number">92%</div>
              <div className="ff-stat-label">Gebruikerstevredenheid</div>
            </div>
            <div className="ff-stat-card">
              <div className="ff-stat-number">18</div>
              <div className="ff-stat-label">Maanden ontwikkeling</div>
            </div>
            <div className="ff-stat-card">
              <div className="ff-stat-number">100%</div>
              <div className="ff-stat-label">Privacy-first</div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="ff-section">
        <div className="ff-container--home">
          <div className="ff-final-cta">
            <div className="ff-cta-orb"></div>
            <div className="ff-final-cta-content">
              <h2 className="ff-final-cta-title">
                Klaar om jouw <span className="ff-gradient-text">stijl te ontdekken</span>?
              </h2>
              <p className="ff-final-cta-text">
                Start vandaag nog met je gratis AI Style Report en ontdek wat jouw stijl over je zegt.
              </p>
              
              <div className="ff-cta-buttons">
                <NavLink 
                  to="/onboarding" 
                  className="ff-btn ff-btn-primary ff-btn-shimmer"
                  data-event="cta_start_free_about"
                >
                  Start gratis Style Report
                  <ArrowRight className="w-4 h-4 ml-2" />
                </NavLink>
                <NavLink 
                  to="/results" 
                  className="ff-btn ff-btn-secondary"
                  data-event="cta_view_example_about"
                >
                  Bekijk voorbeeldrapport
                </NavLink>
              </div>

              <div className="ff-trust-indicators">
                <div className="ff-trust-item">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>100% Gratis</span>
                </div>
                <div className="ff-trust-item">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>2 min setup</span>
                </div>
                <div className="ff-trust-item">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Privacy-first</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}