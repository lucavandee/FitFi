import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  Sparkles,
  Target,
  Zap,
  Clock,
  Shield,
  ArrowRight,
  Brain,
  Heart,
  Shirt,
  TrendingUp,
  Users,
  MessageCircle
} from "lucide-react";

/**
 * How It Works Page - Benefits-Driven & Accessible
 *
 * WCAG 2.1 AA Compliant:
 * - Skip link for keyboard users
 * - Focus-visible on all interactive elements
 * - Semantic HTML with proper landmarks
 * - Clear, concise copy (no jargon)
 * - CTAs after each major section
 * - Consistent terminology (2 minuten, not 5)
 */
export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <>
      <Helmet>
        <title>Hoe het werkt - Jouw stijladvies in 2 minuten | FitFi</title>
        <meta
          name="description"
          content="In 2 minuten van quiz naar compleet stijladvies. 3 stappen: beantwoord vragen, wij matchen outfits, jij shopt direct. Zo simpel werkt FitFi."
        />
      </Helmet>

      {/* Skip to main content link - A11Y */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-[var(--ff-color-primary-700)] focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-semibold"
      >
        Spring naar hoofdinhoud
      </a>

      <main id="main-content" className="bg-[var(--color-bg)] text-[var(--color-text)]">

        {/* Hero Section */}
        <section
          className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-12 sm:py-16 md:py-24 lg:py-32 xl:py-40"
          aria-labelledby="hero-heading"
        >
          <div className="ff-container relative">
            <div className="max-w-5xl mx-auto text-center px-4 sm:px-6">

              {/* Social Proof Badge */}
              <div
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 bg-white/95 backdrop-blur-sm border border-[var(--color-border)] rounded-full mb-6 sm:mb-8 shadow-lg"
                role="status"
                aria-label="2500 mensen gebruiken FitFi"
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
                <span className="text-xs sm:text-sm font-bold text-[var(--color-text)]">
                  <span className="hidden xs:inline">2.500+ mensen gebruiken FitFi</span><span className="xs:hidden">2500+ gebruikers</span>
                </span>
              </div>

              <h1
                id="hero-heading"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-[var(--color-text)] mb-6 sm:mb-8 leading-[1.1] tracking-tight"
              >
                Zo krijg je <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] bg-clip-text text-transparent">outfits die passen</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-[var(--color-muted)] mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                In 2 minuten van quiz naar compleet stijladvies. Zo shop je moeiteloos.
              </p>

              {/* Quick Stats */}
              <div
                className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10"
                role="list"
                aria-label="Belangrijkste voordelen"
              >
                <div className="flex items-center gap-2 sm:gap-3" role="listitem">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center" aria-hidden="true">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--ff-color-primary-700)]" />
                  </div>
                  <span className="text-sm sm:text-base md:text-lg font-semibold text-[var(--color-text)]">2 minuten</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3" role="listitem">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center" aria-hidden="true">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
                  </div>
                  <span className="text-sm sm:text-base md:text-lg font-semibold text-[var(--color-text)]"><span className="hidden xs:inline">Geen foto's nodig</span><span className="xs:hidden">Geen foto's</span></span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3" role="listitem">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--ff-color-accent-100)] rounded-full flex items-center justify-center" aria-hidden="true">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--ff-color-accent-700)]" />
                  </div>
                  <span className="text-sm sm:text-base md:text-lg font-semibold text-[var(--color-text)]">Direct resultaat</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Process */}
        <section
          className="py-10 sm:py-14 md:py-18 lg:py-22 xl:py-28 bg-white"
          aria-labelledby="process-heading"
        >
          <div className="ff-container">
            <div className="max-w-7xl mx-auto">

              <div className="text-center mb-10 sm:mb-12 md:mb-16 lg:mb-20 px-4 sm:px-6">
                <h2 id="process-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
                  3 stappen naar jouw stijl
                </h2>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[var(--color-muted)] font-light">
                  Simpel, snel, resultaat
                </p>
              </div>

              {/* Interactive Timeline */}
              <div className="flex flex-col md:grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-10 mb-12 sm:mb-16">

                {/* Step 1 */}
                <motion.article
                  onHoverStart={() => setActiveStep(1)}
                  className={`relative bg-[var(--color-surface)] rounded-2xl sm:rounded-[2rem] border-2 p-6 sm:p-8 transition-all duration-500 cursor-pointer ${
                    activeStep === 1
                      ? 'border-[var(--ff-color-primary-600)] shadow-2xl md:scale-105'
                      : 'border-[var(--color-border)] shadow-lg hover:shadow-xl'
                  }`}
                  aria-label="Stap 1: Beantwoord 8 vragen"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span className="inline-flex items-center justify-center px-4 py-1.5 bg-[var(--ff-color-primary-600)] text-white rounded-full text-sm font-bold shadow-md flex-shrink-0">
                      Stap 1
                    </span>
                  </div>

                  <div className="mb-5">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-4" aria-hidden="true">
                      <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 leading-tight">Beantwoord 8 vragen</h3>
                    <p className="text-[var(--color-muted)] text-sm sm:text-base leading-relaxed mb-5">
                      Over jouw lifestyle, voorkeuren en hoe je je wilt voelen. Geen foto's, geen gedoe.
                    </p>
                  </div>

                  <ul className="space-y-2.5" role="list">
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Check className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" strokeWidth={3} />
                      </div>
                      <span className="text-sm font-medium">Volledig privé</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Check className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" strokeWidth={3} />
                      </div>
                      <span className="text-sm font-medium">Duurt 2 minuten</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[var(--ff-color-accent-100)] rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Clock className="w-3.5 h-3.5 text-[var(--ff-color-accent-700)]" />
                      </div>
                      <span className="text-sm font-medium text-[var(--color-muted)]">Start nu</span>
                    </li>
                  </ul>
                </motion.article>

                {/* Step 2 */}
                <motion.article
                  onHoverStart={() => setActiveStep(2)}
                  className={`relative bg-[var(--color-surface)] rounded-2xl sm:rounded-[2rem] border-2 p-6 sm:p-8 transition-all duration-500 cursor-pointer ${
                    activeStep === 2
                      ? 'border-[var(--ff-color-primary-600)] shadow-2xl md:scale-105'
                      : 'border-[var(--color-border)] shadow-lg hover:shadow-xl'
                  }`}
                  aria-label="Stap 2: Wij matchen outfits"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span className="inline-flex items-center justify-center px-4 py-1.5 bg-[var(--ff-color-primary-600)] text-white rounded-full text-sm font-bold shadow-md flex-shrink-0">
                      Stap 2
                    </span>
                  </div>

                  <div className="mb-5">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-4" aria-hidden="true">
                      <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 leading-tight">Wij matchen outfits</h3>
                    <p className="text-[var(--color-muted)] text-sm sm:text-base leading-relaxed mb-5">
                      We vinden kleurcombinaties die werken en stellen complete looks samen. Jij hoeft niks te doen.
                    </p>
                  </div>

                  <ul className="space-y-2.5" role="list">
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Check className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" strokeWidth={3} />
                      </div>
                      <span className="text-sm font-medium">12.000+ items</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Check className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" strokeWidth={3} />
                      </div>
                      <span className="text-sm font-medium">Duurt 30 seconden</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[var(--ff-color-accent-100)] rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Zap className="w-3.5 h-3.5 text-[var(--ff-color-accent-700)]" />
                      </div>
                      <span className="text-sm font-medium text-[var(--color-muted)]">Automatisch</span>
                    </li>
                  </ul>
                </motion.article>

                {/* Step 3 */}
                <motion.article
                  onHoverStart={() => setActiveStep(3)}
                  className={`relative bg-[var(--color-surface)] rounded-2xl sm:rounded-[2rem] border-2 p-6 sm:p-8 transition-all duration-500 cursor-pointer ${
                    activeStep === 3
                      ? 'border-[var(--ff-color-primary-600)] shadow-2xl md:scale-105'
                      : 'border-[var(--color-border)] shadow-lg hover:shadow-xl'
                  }`}
                  aria-label="Stap 3: Jij shopt direct"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span className="inline-flex items-center justify-center px-4 py-1.5 bg-[var(--ff-color-primary-600)] text-white rounded-full text-sm font-bold shadow-md flex-shrink-0">
                      Stap 3
                    </span>
                  </div>

                  <div className="mb-5">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-4" aria-hidden="true">
                      <Shirt className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 leading-tight">Jij shopt direct</h3>
                    <p className="text-[var(--color-muted)] text-sm sm:text-base leading-relaxed mb-5">
                      Complete looks, direct shopbaar. Plus: waarom elk item bij jou past.
                    </p>
                  </div>

                  <ul className="space-y-2.5" role="list">
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Check className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" strokeWidth={3} />
                      </div>
                      <span className="text-sm font-medium">6-12 outfits</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Check className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" strokeWidth={3} />
                      </div>
                      <span className="text-sm font-medium">Directe shoplinks</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Heart className="w-3.5 h-3.5 text-pink-700" />
                      </div>
                      <span className="text-sm font-medium text-[var(--color-muted)]">Bewaar voor altijd</span>
                    </li>
                  </ul>
                </motion.article>
              </div>

              {/* Total Time + CTA */}
              <div className="text-center px-6 py-10 sm:px-10 sm:py-12 bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-2xl sm:rounded-[2rem] border-2 border-[var(--ff-color-primary-200)] shadow-lg mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--ff-color-primary-600)] rounded-xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-bold text-[var(--ff-color-primary-700)]">2 minuten</span>
                </div>
                <p className="text-sm sm:text-base text-[var(--color-muted)] font-medium mb-8">
                  Van eerste vraag tot compleet stijladvies
                </p>

                <NavLink
                  to="/onboarding"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 sm:px-10 sm:py-5 min-h-[52px] w-full sm:w-auto bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-xl font-bold text-base sm:text-lg shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
                  aria-label="Start gratis quiz om je stijladvies te ontvangen"
                >
                  Ontvang je stijladvies
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
                </NavLink>
              </div>

            </div>
          </div>
        </section>

        {/* Comparison Section - Simplified */}
        <section
          className="py-16 sm:py-20 md:py-24 lg:py-28 bg-[var(--color-bg)]"
          aria-labelledby="comparison-heading"
        >
          <div className="ff-container">
            <div className="max-w-6xl mx-auto">

              <div className="text-center mb-16 md:mb-20">
                <h2 id="comparison-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                  Waarom FitFi beter is
                </h2>
                <p className="text-xl md:text-2xl text-[var(--color-muted)] font-light">
                  Vergelijk met de oude manier
                </p>
              </div>

              {/* Comparison grid — stacks on mobile, side-by-side on md+ */}
              <div className="flex flex-col md:grid md:grid-cols-2 gap-6 lg:gap-8 overflow-hidden">

                {/* Old Way */}
                <div className="bg-white rounded-2xl border-2 border-[var(--color-border)] p-6 sm:p-8 shadow-lg">
                  <h3 className="font-bold text-xl sm:text-2xl mb-5 text-center text-[var(--color-text)]">Trial & Error</h3>
                  <ul className="space-y-4" role="list">
                    {[
                      "3+ uur per winkelsessie",
                      "€200+ foute aankopen/jaar",
                      "Kast vol \"draag ik nooit\"",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                          <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <span className="text-sm sm:text-base text-[var(--color-muted)] leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* FitFi Way */}
                <div className="relative bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] rounded-2xl border-2 border-[var(--ff-color-primary-400)] p-6 sm:p-8 text-white shadow-2xl">
                  <div className="inline-block mb-4 px-4 py-1.5 bg-[var(--ff-color-accent-500)] text-white rounded-full text-xs font-bold shadow-md">
                    BESTE KEUZE
                  </div>
                  <h3 className="font-bold text-xl sm:text-2xl mb-5 text-white">FitFi</h3>
                  <ul className="space-y-4" role="list">
                    {[
                      "2 minuten, direct resultaat",
                      "Outfits die je draagt",
                      "€9,99/maand (of gratis)",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-sm sm:text-base font-medium leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA After Comparison */}
              <div className="mt-10 sm:mt-12 text-center px-0 sm:px-0">
                <NavLink
                  to="/onboarding"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 sm:px-10 sm:py-5 min-h-[52px] w-full sm:w-auto bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-xl font-bold text-base sm:text-lg shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
                  aria-label="Probeer FitFi gratis"
                >
                  Probeer FitFi gratis
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
                </NavLink>
              </div>

            </div>
          </div>
        </section>

        {/* FAQ Section - Compact */}
        <section
          className="py-16 sm:py-20 md:py-24 lg:py-28 bg-white"
          aria-labelledby="faq-heading"
        >
          <div className="ff-container">
            <div className="max-w-4xl mx-auto">

              <div className="text-center mb-16 md:mb-20">
                <h2 id="faq-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                  Veelgestelde vragen
                </h2>
              </div>

              <div className="space-y-5">
                <details className="bg-[var(--color-surface)] rounded-[2rem] border-2 border-[var(--color-border)] p-6 lg:p-8 group hover:border-[var(--ff-color-primary-300)] transition-all shadow-lg">
                  <summary className="font-bold text-lg cursor-pointer flex items-center justify-between focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2 rounded-lg">
                    <span>Moet ik foto's uploaden?</span>
                    <ArrowRight className="w-5 h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform duration-300" aria-hidden="true" />
                  </summary>
                  <p className="mt-6 text-[var(--color-muted)] text-base lg:text-lg leading-relaxed">
                    Nee! De quiz werkt zonder foto's. Je beantwoordt 8 vragen over jouw stijl.
                  </p>
                </details>

                <details className="bg-[var(--color-surface)] rounded-[2rem] border-2 border-[var(--color-border)] p-6 lg:p-8 group hover:border-[var(--ff-color-primary-300)] transition-all shadow-lg">
                  <summary className="font-bold text-lg cursor-pointer flex items-center justify-between focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2 rounded-lg">
                    <span>Wat als het niet klopt?</span>
                    <ArrowRight className="w-5 h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform duration-300" aria-hidden="true" />
                  </summary>
                  <p className="mt-6 text-[var(--color-muted)] text-base lg:text-lg leading-relaxed">
                    Je kunt de quiz opnieuw doen, gratis. Of chat met onze stijladviseur om je profiel bij te stellen.
                  </p>
                </details>

                <details className="bg-[var(--color-surface)] rounded-[2rem] border-2 border-[var(--color-border)] p-6 lg:p-8 group hover:border-[var(--ff-color-primary-300)] transition-all shadow-lg">
                  <summary className="font-bold text-lg cursor-pointer flex items-center justify-between focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2 rounded-lg">
                    <span>Werkt het voor mannen én vrouwen?</span>
                    <ArrowRight className="w-5 h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform duration-300" aria-hidden="true" />
                  </summary>
                  <p className="mt-6 text-[var(--color-muted)] text-base lg:text-lg leading-relaxed">
                    Ja! We vragen je voorkeur en passen het assortiment daarop aan.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          className="relative py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-br from-[var(--color-bg)] via-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] overflow-hidden"
          aria-labelledby="final-cta-heading"
        >

          {/* Decorative background elements */}
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--ff-color-primary-200)] rounded-full blur-3xl opacity-30"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--ff-color-accent-200)] rounded-full blur-3xl opacity-30"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-[var(--ff-color-primary-100)] rounded-full blur-3xl opacity-20"></div>
          </div>

          <div className="relative ff-container">
            <div className="max-w-5xl mx-auto bg-gradient-to-br from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-500)] rounded-[2.5rem] p-12 md:p-16 text-center shadow-2xl border border-[var(--ff-color-primary-600)] overflow-hidden">

              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-10" aria-hidden="true"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-10" aria-hidden="true"></div>

              {/* Content */}
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold mb-8 shadow-lg">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  Gratis starten
                </div>

                <h2 id="final-cta-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
                  Ontvang je stijladvies<br />in 2 minuten
                </h2>

                <p className="text-xl sm:text-2xl text-white/95 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                  Beantwoord 8 vragen en ontdek outfits die bij jou passen
                </p>

                {/* CTA Button */}
                <NavLink
                  to="/onboarding"
                  className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-10 py-4 sm:py-6 min-h-[52px] bg-white hover:bg-gray-50 text-[var(--ff-color-primary-700)] rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg md:text-xl shadow-2xl transition-all hover:scale-105 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] mb-6 sm:mb-8 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--ff-color-primary-600)] active:scale-[0.98]"
                  data-event="cta_start_free_how_it_works"
                  aria-label="Start gratis quiz om je stijladvies te ontvangen"
                >
                  Start gratis quiz
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </NavLink>

                {/* Trust indicators */}
                <div
                  className="flex flex-wrap justify-center items-center gap-6 text-white/90"
                  role="list"
                  aria-label="Belangrijkste garanties"
                >
                  <div className="flex items-center gap-2" role="listitem">
                    <Clock className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm font-medium">2 minuten</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50" aria-hidden="true"></div>
                  <div className="flex items-center gap-2" role="listitem">
                    <Shield className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm font-medium">Geen foto's</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50" aria-hidden="true"></div>
                  <div className="flex items-center gap-2" role="listitem">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Gratis start</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
    </>
  );
}
