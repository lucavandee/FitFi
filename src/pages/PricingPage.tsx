import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { Check, Star, Zap, Crown, Sparkles, ArrowRight } from "lucide-react";

export default function PricingPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Prijzen – FitFi</title>
        <meta name="description" content="Kies het plan dat bij jou past. Start gratis of kies Premium of Founder voor meer features. Transparant en zonder verborgen kosten." />
        <link rel="canonical" href="https://fitfi.ai/prijzen" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-primary-25)] py-24 md:py-32">
        <div className="ff-container relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-8 leading-tight">
              Kies het plan dat bij
              <span className="block text-[var(--ff-color-primary-600)]">jouw stijl</span> past
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Begin gratis. Upgrade wanneer je wilt. Geen verrassingen.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="ff-container">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Free Plan */}
            <article className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 shadow-[var(--shadow-soft)]">
              <header className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Gratis</h2>
                <div className="text-5xl font-bold mb-2">€0</div>
                <p className="text-gray-600">Voor altijd</p>
              </header>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                  <span>Basis stijlquiz</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                  <span>3 outfit-aanbevelingen</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                  <span>AI-stijlprofiel</span>
                </li>
              </ul>
              <div className="space-y-3">
                <NavLink
                  to="/onboarding"
                  className="block text-center px-6 py-3 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
                  data-event="cta_start_free_pricing"
                >
                  Start gratis
                </NavLink>
                <NavLink
                  to="/hoe-het-werkt"
                  className="block text-center px-6 py-3 bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--color-surface)] transition-colors"
                >
                  Bekijk voorbeeld
                </NavLink>
              </div>
            </article>

            {/* Premium Plan */}
            <article className="relative bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border-2 border-[var(--ff-color-primary-500)] p-8 shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-bold bg-[var(--ff-color-primary-600)] text-white">
                Meest gekozen
              </div>
              <header className="text-center mb-8 pt-2">
                <h2 className="text-2xl font-bold mb-2">Premium</h2>
                <div className="text-5xl font-bold mb-2">
                  €9<span className="text-2xl">,99</span>
                </div>
                <p className="text-gray-600">Per maand</p>
              </header>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                  <span>10+ outfit-aanbevelingen</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                  <span>Seizoens-updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                  <span>AI-uitleg per outfit</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                  <span>Wishlist & stylesets</span>
                </li>
              </ul>
              <div className="space-y-3">
                <NavLink
                  to="/onboarding"
                  className="block text-center px-6 py-3 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
                  data-event="cta_start_premium_pricing"
                >
                  Upgrade naar Premium
                </NavLink>
                <p className="text-center text-gray-600 text-sm">30 dagen geld-terug-garantie</p>
              </div>
            </article>

            {/* Founder Plan */}
            <article className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 shadow-[var(--shadow-soft)]">
              <header className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Founder</h2>
                <div className="text-5xl font-bold mb-2">€149</div>
                <p className="text-gray-600">Eenmalig – lifetime</p>
              </header>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                  <span>Lifetime Premium</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                  <span>Vroege toegang & badges</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                  <span>Founder community</span>
                </li>
              </ul>
              <div className="space-y-3">
                <NavLink
                  to="/onboarding"
                  className="block text-center px-6 py-3 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
                  data-event="cta_start_founder_pricing"
                >
                  Word Founder
                </NavLink>
                <p className="text-center text-gray-600 text-sm">Beperkte plaatsen</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[var(--color-surface)]/30">
        <div className="ff-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Veelgestelde vragen</h2>
            <div className="space-y-4">
              <details className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
                <summary className="font-semibold cursor-pointer">Hoe werkt de gratis versie?</summary>
                <p className="mt-4 text-gray-600">
                  Je ontvangt een gratis Style Report met 3 outfits. Upgraden kan altijd, maar hoeft niet.
                </p>
              </details>
              <details className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
                <summary className="font-semibold cursor-pointer">Is er een geld-terug-garantie?</summary>
                <p className="mt-4 text-gray-600">
                  Ja, 30 dagen voor alle betaalde plannen. Geen vragen gesteld.
                </p>
              </details>
              <details className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
                <summary className="font-semibold cursor-pointer">Wat is het verschil tussen Premium en Founder?</summary>
                <p className="mt-4 text-gray-600">
                  Founder is een eenmalige betaling voor lifetime Premium toegang plus extra voordelen zoals vroege toegang tot nieuwe features en een exclusieve badge.
                </p>
              </details>
              <details className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
                <summary className="font-semibold cursor-pointer">Kan ik maandelijks opzeggen?</summary>
                <p className="mt-4 text-gray-600">
                  Ja, je kunt Premium maandelijks opzeggen. Geen verborgen kosten of kleine lettertjes.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="ff-container">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-[var(--radius-2xl)] p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Klaar om je <span className="text-[var(--ff-color-primary-600)]">perfecte stijl</span> te ontdekken?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start nu gratis. Geen creditcard vereist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink
                to="/onboarding"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
                data-event="cta_start_free_pricing_final"
              >
                Start gratis Style Report
                <ArrowRight className="w-5 h-5" />
              </NavLink>
              <NavLink
                to="/hoe-het-werkt"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--color-surface)] transition-colors"
              >
                Hoe het werkt
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
