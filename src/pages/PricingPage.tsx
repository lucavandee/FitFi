import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { Check, Star, Zap, Crown, Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] relative overflow-hidden">
      <Helmet>
        <title>Prijzen – FitFi</title>
        <meta name="description" content="Kies het plan dat bij jou past. Start gratis of kies Premium of Founder voor meer features. Transparant en zonder verborgen kosten." />
        <link rel="canonical" href="https://fitfi.ai/prijzen" />
      </Helmet>

      <div className="min-h-screen">
        <section className="ff-section pt-24 sm:pt-28">
          <div className="ff-container--home">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Transparante prijzen</span>
              </div>
              <h1 className="ff-h1 mb-4">
                Kies het plan dat bij <span className="ff-gradient-text">jouw stijl</span> past
              </h1>
              <p className="text-[var(--color-text-muted)] text-lg">Begin gratis. Upgrade wanneer je wilt. Geen verrassingen.</p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
                  <span>Geen verborgen kosten</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
                  <span>Opzeggen kan altijd</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
                  <span>30 dagen geld terug</span>
                </div>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <article className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6">
                <header className="text-center mb-6">
                  <h3 className="text-2xl font-bold">Gratis</h3>
                  <div className="text-4xl font-bold">€0</div>
                  <p className="text-[var(--color-text-muted)]">Voor altijd</p>
                </header>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" /><span>Basis stijlquiz</span></li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" /><span>3 outfit-aanbevelingen</span></li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" /><span>AI-stijlprofiel</span></li>
                </ul>
                <div className="flex flex-col gap-3">
                  <NavLink to="/onboarding" className="ff-btn ff-btn-primary w-full" data-event="cta_start_free_pricing">Start gratis</NavLink>
                  <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-ghost w-full">Bekijk voorbeeld</NavLink>
                </div>
              </article>
              <article className="relative bg-[var(--color-surface)] rounded-2xl border-2 border-[var(--ff-color-primary-500)] p-6 shadow-xl">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold bg-[var(--ff-color-primary-600)] text-white">Meest gekozen</div>
                <header className="text-center mb-6 pt-2">
                  <h3 className="text-2xl font-bold">Premium</h3>
                  <div className="text-4xl font-bold">€9<span className="text-base font-medium">,99</span></div>
                  <p className="text-[var(--color-text-muted)]">Maandelijks – opzeggen kan altijd</p>
                </header>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3"><Star className="w-5 h-5 text-[var(--ff-color-primary-600)]" /><span>10+ outfit-aanbevelingen</span></li>
                  <li className="flex items-center gap-3"><Zap className="w-5 h-5 text-[var(--ff-color-primary-600)]" /><span>Seizoens-updates</span></li>
                  <li className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)]" /><span>AI-uitleg per outfit</span></li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" /><span>Wishlist & stylesets</span></li>
                </ul>
                <div className="flex flex-col gap-3">
                  <NavLink to="/onboarding" className="ff-btn ff-btn-primary w-full" data-event="cta_start_premium_pricing">Upgrade naar Premium</NavLink>
                  <p className="text-center text-[var(--color-text-muted)] text-sm">30 dagen geld-terug-garantie</p>
                </div>
              </article>
              <article className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6">
                <header className="text-center mb-6">
                  <h3 className="text-2xl font-bold">Founder</h3>
                  <div className="text-4xl font-bold">€149</div>
                  <p className="text-[var(--color-text-muted)]">Eenmalig – lifetime</p>
                </header>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3"><Crown className="w-5 h-5 text-[var(--ff-color-primary-600)]" /><span>Lifetime Premium</span></li>
                  <li className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)]" /><span>Vroege toegang & badges</span></li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-[var(--ff-color-primary-600)]" /><span>Founder community</span></li>
                </ul>
                <div className="flex flex-col gap-3">
                  <NavLink to="/onboarding" className="ff-btn ff-btn-primary w-full" data-event="cta_start_founder_pricing">Word Founder</NavLink>
                  <p className="text-center text-[var(--color-text-muted)] text-sm">Beperkte plaatsen</p>
                </div>
              </article>
            </div>
          </div>
        </section>
        <section className="ff-section py-20">
          <div className="ff-container--home">
            <div className="max-w-3xl mx-auto">
              <h2 className="ff-h2 text-center mb-10">Veelgestelde vragen</h2>
              <div className="space-y-4">
                <details className="ff-faq-item"><summary>Hoe werkt de gratis versie?</summary><p>Je ontvangt een gratis Style Report. Upgraden kan altijd, maar hoeft niet.</p></details>
                <details className="ff-faq-item"><summary>Is er een geld-terug-garantie?</summary><p>Ja, 30 dagen voor alle betaalde plannen.</p></details>
                <details className="ff-faq-item"><summary>Wat is het verschil tussen Premium en Founder?</summary><p>Founder is een eenmalige betaling voor lifetime Premium + extra's.</p></details>
              </div>
            </div>
          </div>
        </section>
        <section className="ff-section py-20">
          <div className="ff-container--home">
            <div className="ff-final-cta relative">
              <div className="ff-cta-orb" aria-hidden="true" />
              <div className="text-center relative z-10">
                <h2 className="ff-h2 mb-4">Klaar om je <span className="ff-gradient-text">perfecte stijl</span> te ontdekken?</h2>
                <p className="text-[var(--color-text-muted)] mb-8">Start nu gratis. Geen creditcard vereist.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <NavLink to="/onboarding" className="ff-btn ff-btn-primary" data-event="cta_start_free_pricing_final">Start gratis Style Report</NavLink>
                  <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-secondary">Hoe het werkt</NavLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
