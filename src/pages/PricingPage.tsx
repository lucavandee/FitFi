import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { Check, Star, Zap, Crown, Sparkles, ArrowRight } from "lucide-react";
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export default function PricingPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-hidden">
      <Helmet>
        <title>Prijzen – FitFi AI Style Reports</title>
        <meta
          name="description"
          content="Kies het plan dat bij jou past. Altijd transparant, geen verborgen kosten. Start gratis of upgrade naar Premium voor meer functies."
        />
      </Helmet>
    <>

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
                  Eenvoudige <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">Prijzen</span>
                </h1>
                <p className="text-xl text-[var(--color-text-muted)] mb-8 leading-relaxed max-w-2xl mx-auto">
                  Kies het plan dat bij jou past. Altijd transparant, geen verborgen kosten.
                  Start gratis of upgrade naar Premium voor meer functies.
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

        {/* Pricing Cards */}
        <Container>
          <div className="py-16">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--color-border)] hover:shadow-lg transition-all duration-300">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">Gratis</h3>
                  <div className="text-4xl font-bold text-[var(--color-text)] mb-2">€0</div>
                  <p className="text-[var(--color-text-muted)]">Voor altijd gratis</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                    <span className="text-[var(--color-text)]">Basis stijlquiz</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                    <span className="text-[var(--color-text)]">3 outfit aanbevelingen</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                    <span className="text-[var(--color-text)]">Basis stijladvies</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                    <span className="text-[var(--color-text)]">Shoppable links</span>
                  </li>
                </ul>
                
                <Button 
                  as={Link} 
                  to="/quiz" 
                  variant="ghost"
                  className="w-full border border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] py-3 rounded-xl font-medium transition-all duration-300 hover:bg-[var(--color-bg)]"
                >
                  Start gratis
                </Button>
              </div>

              {/* Premium Plan */}
              <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-2xl p-8 border-2 border-[var(--ff-color-primary-200)] hover:shadow-xl transition-all duration-300 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Populair
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">Premium</h3>
                  <div className="text-4xl font-bold text-[var(--color-text)] mb-2">€9,99</div>
                  <p className="text-[var(--color-text-muted)]">per maand</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                    <span className="text-[var(--color-text)]">Uitgebreide stijlquiz</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                    <span className="text-[var(--color-text)]">Onbeperkte outfit aanbevelingen</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                    <span className="text-[var(--color-text)]">AI-powered stijladvies</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                    <span className="text-[var(--color-text)]">Seizoensgebonden updates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                    <span className="text-[var(--color-text)]">Prioriteit ondersteuning</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                    <span className="text-[var(--color-text)]">Exclusieve kortingen</span>
                  </li>
                </ul>
                
                <Button 
                  as={Link} 
                  to="/register" 
                  className="w-full bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  Upgrade naar Premium <Zap className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-20 text-center">
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-4">
                Veelgestelde vragen
              </h3>
              <p className="text-[var(--color-text-muted)] mb-8">
                Heb je nog vragen? Bekijk onze uitgebreide FAQ of neem contact met ons op.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  as={Link} 
                  to="/faq" 
                  variant="ghost"
                  className="border border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-[var(--color-surface)]"
                >
                  Bekijk FAQ
                </Button>
                <Button 
                  as={Link} 
                  to="/contact" 
                  variant="ghost"
                  className="border border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-[var(--color-surface)]"
                >
                  Contact opnemen
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Hero Section */}
      <section className="ff-pricing-hero">
        <div className="ff-container--home">
          <div className="text-center max-w-4xl mx-auto">
            <div className="ff-premium-badge mb-6">
              <Sparkles className="w-4 h-4" />
              <span>TRANSPARANTE PRIJZEN</span>
            </div>
            
            <h1 className="ff-pricing-title mb-6">
              Kies het plan dat bij <span className="ff-gradient-text">jouw stijl</span> past
            </h1>
            
            <p className="ff-pricing-subtitle mb-8">
              Begin gratis en upgrade wanneer je meer wilt. Geen verborgen kosten, geen verrassingen.
            </p>

            {/* Trust Indicators */}
            <div className="ff-trust-indicators">
              <div className="ff-trust-item">
                <Check className="w-4 h-4 text-green-500" />
                <span>Geen verborgen kosten</span>
              </div>
              <div className="ff-trust-item">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="ff-trust-item">
                <Check className="w-4 h-4 text-green-500" />
                <span>30 dagen geld terug</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="ff-section py-16">
        <div className="ff-container--home">
          <div className="ff-pricing-grid">
            
            {/* Free Plan */}
            <div className="ff-pricing-card">
              <div className="ff-pricing-card-header">
                <div className="ff-pricing-icon">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="ff-pricing-plan-name">Gratis</h3>
                <p className="ff-pricing-plan-desc">Perfect om te beginnen</p>
              </div>
              
              <div className="ff-pricing-price">
                <span className="ff-price-amount">€0</span>
                <span className="ff-price-period">/maand</span>
              </div>
              
              <ul className="ff-pricing-features">
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>1 AI Style Report</span>
                </li>
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Basis archetype analyse</span>
                </li>
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>6 outfit suggesties</span>
                </li>
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Kleur aanbevelingen</span>
                </li>
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Email support</span>
                </li>
              </ul>
              
              <NavLink 
                to="/onboarding" 
                className="ff-btn ff-btn-secondary w-full"
                data-event="cta_start_free_pricing"
              >
                Start gratis
              </NavLink>
            </div>

            {/* Premium Plan */}
            <div className="ff-pricing-card ff-pricing-card-featured">
              <div className="ff-popular-badge">
                <Crown className="w-4 h-4" />
                <span>POPULAIR</span>
              </div>
              
              <div className="ff-pricing-card-header">
                <div className="ff-pricing-icon ff-pricing-icon-premium">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="ff-pricing-plan-name">Premium</h3>
                <p className="ff-pricing-plan-desc">Voor de stijlbewuste</p>
              </div>
              
              <div className="ff-pricing-price">
                <span className="ff-price-amount">€9,99</span>
                <span className="ff-price-period">/maand</span>
              </div>
              
              <ul className="ff-pricing-features">
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Onbeperkte AI Style Reports</span>
                </li>
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Uitgebreide archetype analyse</span>
                </li>
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>12+ outfit suggesties</span>
                </li>
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Seizoen specifieke looks</span>
                </li>
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Nova AI Chat assistent</span>
                </li>
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Outfit opslaan & delen</span>
                </li>
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <NavLink 
                to="/register" 
                className="ff-btn ff-btn-primary w-full ff-shimmer-btn"
                data-event="cta_upgrade_premium_pricing"
              >
                Upgrade naar Premium
              </NavLink>
            </div>

            {/* Founder Plan */}
            <div className="ff-pricing-card">
              <div className="ff-pricing-card-header">
                <div className="ff-pricing-icon ff-pricing-icon-founder">
                  <Crown className="w-6 h-6" />
                </div>
                <h3 className="ff-pricing-plan-name">Founder</h3>
                <p className="ff-pricing-plan-desc">Lifetime access</p>
              </div>
              
              <div className="ff-pricing-price">
                <span className="ff-price-amount">€199</span>
                <span className="ff-price-period">eenmalig</span>
              </div>
              
              <ul className="ff-pricing-features">
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Alles van Premium</span>
                </li>
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Lifetime toegang</span>
                </li>
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Exclusieve features</span>
                </li>
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Founder badge</span>
                </li>
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Direct line support</span>
                </li>
                <li>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Early access nieuwe features</span>
                </li>
              </ul>
              
              <NavLink 
                to="/register?plan=founder" 
                className="ff-btn ff-btn-secondary w-full"
                data-event="cta_founder_pricing"
              >
                Word Founder
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="ff-section py-16">
        <div className="ff-container--home">
          <div className="ff-pricing-faq">
            <div className="text-center mb-12">
              <h2 className="ff-section-title mb-4">Veelgestelde vragen</h2>
              <p className="ff-section-subtitle">
                Alles wat je wilt weten over onze prijzen en plannen.
              </p>
            </div>
            
            <div className="ff-faq-grid">
              <details className="ff-faq-item">
                <summary>Kan ik altijd cancellen?</summary>
                <p>Ja, je kunt altijd je abonnement cancellen. Er zijn geen verborgen kosten of cancellation fees.</p>
              </details>
              
              <details className="ff-faq-item">
                <summary>Wat gebeurt er na de gratis trial?</summary>
                <p>Na je gratis Style Report kun je kiezen om te upgraden naar Premium voor meer features, of gewoon gratis blijven gebruiken.</p>
              </details>
              
              <details className="ff-faq-item">
                <summary>Is er een geld-terug-garantie?</summary>
                <p>Ja, we bieden een 30-dagen geld-terug-garantie op alle betaalde plannen. Niet tevreden? Geld terug.</p>
              </details>
              
              <details className="ff-faq-item">
                <summary>Wat is het verschil tussen Premium en Founder?</summary>
                <p>Founder is een eenmalige betaling voor lifetime toegang tot alle Premium features, plus exclusieve founder benefits.</p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="ff-section py-20">
        <div className="ff-container--home">
          <div className="ff-final-cta">
            <div className="ff-cta-orb" aria-hidden="true"></div>
            <div className="text-center relative z-10">
              <h2 className="ff-cta-title mb-4">
                Klaar om je <span className="ff-gradient-text">perfecte stijl</span> te ontdekken?
              </h2>
              <p className="ff-cta-subtitle mb-8">
                Begin vandaag nog met je gratis AI Style Report. Geen creditcard vereist.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <NavLink 
                  to="/onboarding" 
                  className="ff-btn ff-btn-primary ff-shimmer-btn"
                  data-event="cta_start_free_pricing_final"
                >
                  Start gratis Style Report
                </NavLink>
                <NavLink 
                  to="/hoe-het-werkt" 
                  className="ff-btn ff-btn-secondary"
                  data-event="cta_how_it_works_pricing"
                >
                  Hoe het werkt
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
  )
}