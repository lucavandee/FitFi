import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, Zap } from 'lucide-react';
import Seo from '@/components/Seo';
import ErrorBoundary from '@/components/ErrorBoundary';

const HomePage: React.FC = () => {
  return (
    <ErrorBoundary>
      <Seo
        title="FitFi — AI-stylist voor jouw perfecte outfit"
        description="Ontdek je stijl met AI. Krijg binnen 2 minuten gepersonaliseerde outfits die passen bij je lichaam en voorkeuren."
        canonical="https://www.fitfi.ai"
      />
      <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <div className="inline-flex items-center gap-2 text-sm text-[color:var(--color-muted)] mb-4">
                <Sparkles className="w-4 h-4" />
                <span>AI-powered styling</span>
              </div>
              
              <h1 className="hero__title">
                Jouw perfecte outfit,
                <br />
                <span className="text-[color:var(--color-primary)]">AI-gestyled</span>
              </h1>
              
              <p className="hero__subtitle">
                Ontdek binnen 2 minuten welke stijl en outfits perfect bij je passen. 
                Gepersonaliseerd advies op basis van je lichaam, voorkeuren en lifestyle.
              </p>
              
              <div className="hero__actions">
                <Link to="/quiz" className="btn btn-primary btn-lg">
                  Start gratis stijltest
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/hoe-het-werkt" className="btn btn-ghost btn-lg">
                  Hoe het werkt
                </Link>
              </div>
              
              <div className="hero__stats">
                <div className="stat">
                  <div className="stat__number">50K+</div>
                  <div className="stat__label">Outfits gegenereerd</div>
                </div>
                <div className="stat">
                  <div className="stat__number">4.8★</div>
                  <div className="stat__label">Gebruikerswaardering</div>
                </div>
                <div className="stat">
                  <div className="stat__number">2 min</div>
                  <div className="stat__label">Tot je eerste outfit</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="section__title">Waarom FitFi werkt</h2>
              <p className="section__subtitle">
                AI-technologie gecombineerd met stijlexpertise voor resultaten die écht passen.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="feature-card">
                <div className="feature-card__icon">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="feature-card__title">Instant resultaten</h3>
                <p className="feature-card__description">
                  Binnen 2 minuten van stijltest naar gepersonaliseerde outfits met uitleg waarom het bij je past.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-card__icon">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="feature-card__title">Voor elk lichaam</h3>
                <p className="feature-card__description">
                  Onze AI houdt rekening met je lichaamstype, kleurvoorkeur en lifestyle voor optimale pasvorm.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-card__icon">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="feature-card__title">Seizoens-ready</h3>
                <p className="feature-card__description">
                  Outfits die passen bij het seizoen, weer en gelegenheid. Altijd relevant, altijd stijlvol.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section bg-[color:var(--color-surface)]">
          <div className="container">
            <div className="cta-block">
              <div className="cta-block__content">
                <h2 className="cta-block__title">Klaar om je stijl te ontdekken?</h2>
                <p className="cta-block__description">
                  Start nu met de gratis stijltest en ontvang binnen 2 minuten je eerste gepersonaliseerde outfits.
                </p>
                <Link to="/quiz" className="btn btn-primary btn-lg">
                  Begin nu gratis
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </ErrorBoundary>
  );
};

export default HomePage;