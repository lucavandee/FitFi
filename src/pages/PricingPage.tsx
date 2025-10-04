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
          content="Kies het plan dat bij jou past. Altijd transparant en zonder verborgen kosten. Start gratis of upgrade naar Premium voor meer functies."
        />
      </Helmet>

      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="relative overflow-hidden bg-gradient-to-b from-[var(--color-bg)] via-[var(--color-surface)] to-[var(--color-bg)]">
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background:radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.2),_transparent_35%),radial-gradient(circle_at_80%_30%,_rgba(255,255,255,0.12),_transparent_35%),radial-gradient(circle_at_50%_75%,_rgba(255,255,255,0.12),_transparent_35%)]" aria-hidden="true" />

          <section className="ff-section ff-pricing-hero pt-24 sm:pt-28">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:shadow-lg transition-all duration-300 p-6">
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
                      <span className="text-[var(--color-text)]">AI-stijlprofiel</span>
                    </li>
                  </ul>

                  <NavLink
                    to="/onboarding"
                    className="ff-btn ff-btn-primary w-full block text-center"
                    data-event="cta_start_free_pricing"
                  >
                    Start gratis
                  </NavLink>
                  <NavLink
                    to="/hoe-het-werkt"
                    className="ff-btn ff-btn-ghost w-full block text-center mt-3"
                  >
                    Bekijk voorbeeld
                  </NavLink>
                </div>

                <div className="relative bg-[var(--color-surface)] rounded-2xl border-2 border-[var(--ff-color-primary-500)] shadow-xl p-6">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold bg-[var(--ff-color-primary-600)] text-white">
                    Meest gekozen
                  </div>
                  <div className="text-center mb-8 pt-4">
                    <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">Premium</h3>
                    <div className="text-4xl font-bold text-[var(--color-text)] mb-2">€9<span className="text-base font-medium">,99</span></div>
                    <p className="text-[var(--color-text-muted)]">Maandelijks, cancel anytime</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                      <span className="text-[var(--color-text)]">10+ outfit aanbevelingen</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                      <span className="text-[var(--color-text)]">Slimme seizoens-updates</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                      <span className="text-[var(--color-text)]">AI-uitleg per outfit</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                      <span className="text-[var(--color-text)]">Wishlist & styleset beheer</span>
                    </li>
                  </ul>

                  <NavLink
                    to="/onboarding"
                    className="ff-btn ff-btn-primary w-full block text-center"
                    data-event="cta_start_premium_pricing"
                  >
                    Upgrade naar Premium
                  </NavLink>
                  <p className="text-center text-[var(--color-text-muted)] text-sm mt-3">
                    30 dagen geld-terug-garantie
                  </p>
                </div>

                <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:shadow-lg transition-all duration-300 p-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">Founder</h3>
                    <div className="text-4xl font-bold text-[var(--color-text)] mb-2">€149</div>
                    <p className="text-[var(--color-text-muted)]">Eenmalig – lifetime</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3">
                      <Crown className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                      <span className="text-[var(--color-text)]">Lifetime Premium</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                      <span className="text-[var(--color-text)]">Early features + badges</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                      <span className="text-[var(--color-text)]">Founder community</span>
                    </li>
                  </ul>

                  <NavLink
                    to="/onboarding"
                    className="ff-btn ff-btn-primary w-full block text-center"
                    data-event="cta_start_founder_pricing"
                  >
                    Word Founder
                  </NavLink>
                  <p className="text-center text-[var(--color-text-muted)] text-sm mt-3">
                    Beperkte plaatsen
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="ff-section py-20">
          <div className="ff-container--home">
            <div className="max-w-3xl mx-auto">
              <h2 className="ff-h2 text-center mb-10">Veelgestelde vragen</h2>

              <div className="ff-faq space-y-4">
                <details className="ff-faq-item">
                  <summary>Hoe werkt de gratis versie?</summary>
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
      </div>
    </main>
  );
}
