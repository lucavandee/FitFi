import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { Check, Star, Zap, Crown, Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-hidden">
      <Helmet>
        <title>Prijzen – FitFi AI Style Reports</title>
        <meta
          name="description"
          content="Kies het plan dat bij je past. Gratis AI Style Report of Premium met uitgebreide features. Transparante prijzen, geen verborgen kosten."
        />
      </Helmet>

      {/* Background Orbs */}
      <div className="ff-bg-orbs" aria-hidden="true">
        <div className="ff-orb ff-orb-1"></div>
        <div className="ff-orb ff-orb-2"></div>
        <div className="ff-orb ff-orb-3"></div>
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
    </main>
  );
}