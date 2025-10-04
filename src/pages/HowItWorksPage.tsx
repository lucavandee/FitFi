import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { CircleCheck as CheckCircle, Clock, Shield } from "lucide-react";
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export default function HowItWorksPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-hidden">
      <Helmet>
        <title>Hoe het werkt - AI Style Report in 3 stappen | FitFi</title>
        <meta
          name="description"
    <>
      <Helmet>
        <title>Hoe het werkt - FitFi.ai</title>
        <meta name="description" content="Ontdek hoe FitFi.ai jouw perfecte stijl vindt in slechts een paar stappen. Van quiz tot gepersonaliseerde outfit aanbevelingen." />
      </Helmet>

      <div className="min-h-screen bg-[var(--color-bg)]">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-surface)] to-[var(--color-bg)]">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[var(--ff-color-primary-200)] to-[var(--ff-color-primary-300)] rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[var(--ff-color-accent-200)] to-[var(--ff-color-accent-300)] rounded-full opacity-20 blur-3xl"></div>
          </div>

          <Container>
            <div className="relative py-24 text-center">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text)] mb-6 leading-tight">
                  Hoe het <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">werkt</span>
                </h1>
                <p className="text-xl text-[var(--color-text-muted)] mb-8 leading-relaxed max-w-2xl mx-auto">
                  Ontdek hoe FitFi.ai jouw perfecte stijl vindt in slechts een paar stappen.
                  Van quiz tot gepersonaliseerde outfit aanbevelingen.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    as={Link} 
                    to="/quiz" 
                    className="bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                  >
                    Start gratis <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button 
                    as={Link} 
                    to="/results" 
                    variant="ghost"
                    className="border border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-[var(--color-surface)]"
                  >
                    Bekijk voorbeelden
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* Steps Section */}
        <Container>
          <div className="py-16">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">
                In 3 eenvoudige stappen naar jouw perfecte stijl
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                Ons AI-systeem analyseert jouw voorkeuren en creëert gepersonaliseerde outfit aanbevelingen
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-primary-600)] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">1. Stijlquiz</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  Beantwoord vragen over jouw stijlvoorkeuren, lichaamsbouw en lifestyle om jouw unieke profiel te creëren.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--ff-color-accent-500)] to-[var(--ff-color-accent-600)] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">2. AI Analyse</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  Onze geavanceerde AI analyseert jouw antwoorden en matcht deze met duizenden stijlcombinaties.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">3. Gepersonaliseerde Outfits</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  Ontvang direct jouw gepersonaliseerde outfit aanbevelingen met shoppable links naar jouw favoriete winkels.
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-bg)] rounded-2xl p-12 border border-[var(--color-border)]">
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-4">
                Klaar om jouw perfecte stijl te ontdekken?
              </h3>
              <p className="text-[var(--color-text-muted)] mb-8 max-w-xl mx-auto">
                Start vandaag nog met onze gratis stijlquiz en ontvang binnen enkele minuten jouw gepersonaliseerde outfit aanbevelingen.
              </p>
              <Button 
                as={Link} 
                to="/quiz" 
                className="bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg inline-flex items-center gap-2"
              >
                Start gratis quiz <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Hero Section */}
      <section className="ff-hero-section">
        <div className="ff-container--home">
          <div className="text-center max-w-4xl mx-auto">
            <div className="ff-premium-badge">
              <Sparkles className="w-4 h-4" />
              <span>AI-POWERED STYLING</span>
            </div>
            
            <h1 className="ff-hero-title mt-6">
              Zo werkt jouw{" "}
              <span className="ff-gradient-text">AI Style Report</span>
            </h1>
            
            <p className="ff-hero-sub mt-6 max-w-2xl mx-auto">
              In 3 eenvoudige stappen van persoonlijkheidsquiz naar gepersonaliseerde outfits. 
              Geen gedoe, wel resultaat.
            </p>

            <div className="ff-trust-indicators mt-8">
              <div className="ff-trust-item">
                <Clock className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                <span>2 minuten</span>
              </div>
              <div className="ff-trust-item">
                <Shield className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                <span>100% Privacy</span>
              </div>
              <div className="ff-trust-item">
                <Target className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                <span>Persoonlijk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="ff-section py-20">
        <div className="ff-container--home">
          <div className="ff-steps-grid">
            
            {/* Step 1 */}
            <div className="ff-step-card" data-step="1">
              <div className="ff-step-visual">
                <div className="ff-step-icon">
                  <Target className="w-8 h-8" />
                </div>
                <div className="ff-step-number">01</div>
              </div>
              
              <div className="ff-step-content">
                <h3 className="ff-step-title">Persoonlijkheidsquiz</h3>
                <p className="ff-step-description">
                  Beantwoord 8-12 vragen over je lifestyle, voorkeuren en persoonlijkheid. 
                  Onze AI analyseert je antwoorden om je unieke stijlprofiel te bepalen.
                </p>
                
                <div className="ff-step-features">
                  <div className="ff-feature-item">
                    <CheckCircle className="w-4 h-4" />
                    <span>Geen foto's nodig</span>
                  </div>
                  <div className="ff-feature-item">
                    <CheckCircle className="w-4 h-4" />
                    <span>Privacy-vriendelijk</span>
                  </div>
                  <div className="ff-feature-item">
                    <CheckCircle className="w-4 h-4" />
                    <span>90 seconden</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="ff-step-card" data-step="2">
              <div className="ff-step-visual">
                <div className="ff-step-icon">
                  <Zap className="w-8 h-8" />
                </div>
                <div className="ff-step-number">02</div>
              </div>
              
              <div className="ff-step-content">
                <h3 className="ff-step-title">AI Analyse</h3>
                <p className="ff-step-description">
                  Onze geavanceerde AI combineert je antwoorden met stijldata van duizenden outfits 
                  om jouw perfecte stijlarchetype en kleurenpalet te bepalen.
                </p>
                
                <div className="ff-step-features">
                  <div className="ff-feature-item">
                    <CheckCircle className="w-4 h-4" />
                    <span>Geavanceerde algoritmes</span>
                  </div>
                  <div className="ff-feature-item">
                    <CheckCircle className="w-4 h-4" />
                    <span>Realtime processing</span>
                  </div>
                  <div className="ff-feature-item">
                    <CheckCircle className="w-4 h-4" />
                    <span>30 seconden</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="ff-step-card" data-step="3">
              <div className="ff-step-visual">
                <div className="ff-step-icon">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="ff-step-number">03</div>
              </div>
              
              <div className="ff-step-content">
                <h3 className="ff-step-title">Jouw Style Report</h3>
                <p className="ff-step-description">
                  Ontvang direct je persoonlijke rapport met stijlarchetype, kleurenpalet, 
                  6-12 complete outfits en uitleg waarom elk item bij je past.
                </p>
                
                <div className="ff-step-features">
                  <div className="ff-feature-item">
                    <CheckCircle className="w-4 h-4" />
                    <span>6-12 complete outfits</span>
                  </div>
                  <div className="ff-feature-item">
                    <CheckCircle className="w-4 h-4" />
                    <span>Directe shoplinks</span>
                  </div>
                  <div className="ff-feature-item">
                    <CheckCircle className="w-4 h-4" />
                    <span>Uitleg per item</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="ff-section py-20 bg-gradient-to-b from-transparent to-[var(--color-surface)]/30">
        <div className="ff-container--home">
          <div className="text-center mb-16">
            <h2 className="ff-section-title">
              Wat krijg je in je{" "}
              <span className="ff-gradient-text">Style Report</span>?
            </h2>
            <p className="ff-section-subtitle mt-4">
              Een compleet overzicht van jouw unieke stijl en hoe je die kunt toepassen
            </p>
          </div>

          <div className="ff-benefits-grid">
            <div className="ff-benefit-card">
              <div className="ff-benefit-icon">
                <Target className="w-6 h-6" />
              </div>
              <h3>Stijlarchetype</h3>
              <p>Je unieke stijlpersoonlijkheid met uitgebreide uitleg over wat dit betekent voor je kledingkeuzes.</p>
            </div>

            <div className="ff-benefit-card">
              <div className="ff-benefit-icon">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)]"></div>
              </div>
              <h3>Kleurenpalet</h3>
              <p>Jouw perfecte kleuren die je huid laten stralen en je persoonlijkheid versterken.</p>
            </div>

            <div className="ff-benefit-card">
              <div className="ff-benefit-icon">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3>Complete Outfits</h3>
              <p>6-12 volledige looks voor verschillende gelegenheden, van casual tot formeel.</p>
            </div>

            <div className="ff-benefit-card">
              <div className="ff-benefit-icon">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3>Shoplinks</h3>
              <p>Directe links naar alle items zodat je meteen kunt shoppen wat bij je past.</p>
            </div>

            <div className="ff-benefit-card">
              <div className="ff-benefit-icon">
                <Zap className="w-6 h-6" />
              </div>
              <h3>Styling Tips</h3>
              <p>Praktische tips over hoe je items combineert en je stijl verder ontwikkelt.</p>
            </div>

            <div className="ff-benefit-card">
              <div className="ff-benefit-icon">
                <Shield className="w-6 h-6" />
              </div>
              <h3>Privacy-First</h3>
              <p>Geen foto's nodig, geen persoonlijke data opgeslagen. Jouw privacy staat voorop.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ff-section py-20">
        <div className="ff-container--home">
          <div className="ff-final-cta">
            <div className="ff-cta-content">
              <h2 className="ff-cta-title">
                Klaar voor jouw{" "}
                <span className="ff-gradient-text">Style Report</span>?
              </h2>
              <p className="ff-cta-subtitle">
                Start nu en ontdek binnen 2 minuten welke stijl perfect bij je past.
              </p>
              
              <div className="ff-cta-buttons">
                <NavLink 
                  to="/onboarding" 
                  className="ff-btn ff-btn-primary ff-btn-shimmer"
                  data-event="cta_start_free_how_it_works"
                >
                  <Sparkles className="w-5 h-5" />
                  Start gratis Style Report
                </NavLink>
                
                <NavLink 
                  to="/results" 
                  className="ff-btn ff-btn-secondary"
                  data-event="cta_view_example_how_it_works"
                >
                  Bekijk voorbeeldrapport
                </NavLink>
              </div>

              <div className="ff-cta-trust mt-8">
                <div className="ff-trust-item">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>100% Gratis</span>
                </div>
                <div className="ff-trust-item">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Geen account nodig</span>
                </div>
                <div className="ff-trust-item">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Direct resultaat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
  )
  );
}