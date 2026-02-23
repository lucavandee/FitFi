import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import { motion } from "framer-motion";
import {
  Check,
  Sparkles,
  Zap,
  Clock,
  Shield,
  ArrowRight,
  Brain,
  Heart,
  Shirt,
  Users,
  MessageCircle,
  Plus,
  Minus,
} from "lucide-react";

const steps = [
  {
    id: 1,
    label: "Stap 1",
    icon: MessageCircle,
    title: "Beantwoord 8 vragen",
    description: "Over jouw lifestyle, voorkeuren en hoe je je wilt voelen. Geen foto's, geen gedoe.",
    bullets: [
      { icon: Check, iconBg: "bg-[var(--ff-color-primary-100)]", iconColor: "text-[var(--ff-color-primary-700)]", label: "Volledig privé" },
      { icon: Check, iconBg: "bg-[var(--ff-color-primary-100)]", iconColor: "text-[var(--ff-color-primary-700)]", label: "Duurt 2 minuten" },
      { icon: Clock, iconBg: "bg-[var(--ff-color-accent-100)]", iconColor: "text-[var(--ff-color-accent-700)]", label: "Start nu", muted: true },
    ],
  },
  {
    id: 2,
    label: "Stap 2",
    icon: Brain,
    title: "Wij matchen outfits",
    description: "We vinden kleurcombinaties die werken en stellen complete looks samen. Jij hoeft niks te doen.",
    bullets: [
      { icon: Check, iconBg: "bg-[var(--ff-color-primary-100)]", iconColor: "text-[var(--ff-color-primary-700)]", label: "12.000+ items" },
      { icon: Check, iconBg: "bg-[var(--ff-color-primary-100)]", iconColor: "text-[var(--ff-color-primary-700)]", label: "Duurt 30 seconden" },
      { icon: Zap, iconBg: "bg-[var(--ff-color-accent-100)]", iconColor: "text-[var(--ff-color-accent-700)]", label: "Automatisch", muted: true },
    ],
  },
  {
    id: 3,
    label: "Stap 3",
    icon: Shirt,
    title: "Jij shopt direct",
    description: "Complete looks, direct shopbaar. Plus: waarom elk item bij jou past.",
    bullets: [
      { icon: Check, iconBg: "bg-[var(--ff-color-primary-100)]", iconColor: "text-[var(--ff-color-primary-700)]", label: "6-12 outfits" },
      { icon: Check, iconBg: "bg-[var(--ff-color-primary-100)]", iconColor: "text-[var(--ff-color-primary-700)]", label: "Directe shoplinks" },
      { icon: Heart, iconBg: "bg-pink-100", iconColor: "text-pink-700", label: "Bewaar voor altijd", muted: true },
    ],
  },
];

const faqs = [
  {
    q: "Moet ik foto's uploaden?",
    a: "Nee! De quiz werkt zonder foto's. Je beantwoordt 8 vragen over jouw stijl.",
  },
  {
    q: "Wat als het niet klopt?",
    a: "Je kunt de quiz opnieuw doen, gratis. Of chat met onze stijladviseur om je profiel bij te stellen.",
  },
  {
    q: "Werkt het voor mannen én vrouwen?",
    a: "Ja! We vragen je voorkeur en passen het assortiment daarop aan.",
  },
];

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Seo
        title="Hoe het werkt — Jouw stijladvies in 2 minuten | FitFi"
        description="In 2 minuten van quiz naar compleet stijladvies. 3 stappen: beantwoord vragen, wij matchen outfits, jij shopt direct. Zo simpel werkt FitFi."
        path="/hoe-het-werkt"
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-[var(--ff-color-primary-700)] focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-semibold"
      >
        Spring naar hoofdinhoud
      </a>

      <main id="main-content" className="bg-[var(--color-bg)] text-[var(--color-text)]">

        {/* ── Hero ── */}
        <section
          className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-12 sm:py-16 md:py-24 lg:py-32"
          aria-labelledby="hero-heading"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">

            <div
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 bg-white/95 backdrop-blur-sm border border-[var(--color-border)] rounded-full mb-6 shadow-md"
              role="status"
              aria-label="2500 mensen gebruiken FitFi"
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
              <span className="text-xs sm:text-sm font-bold text-[var(--color-text)]">2.500+ mensen gebruiken FitFi</span>
            </div>

            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text)] mb-5 sm:mb-6 leading-[1.1] tracking-tight"
            >
              Zo krijg je{" "}
              <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] bg-clip-text text-transparent">
                outfits die passen
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[var(--color-muted)] mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              In 2 minuten van quiz naar compleet stijladvies. Zo shop je moeiteloos.
            </p>

            <div
              className="flex flex-wrap items-center justify-center gap-3 sm:gap-6"
              role="list"
              aria-label="Belangrijkste voordelen"
            >
              {[
                { icon: Clock, bg: "bg-[var(--ff-color-primary-100)]", color: "text-[var(--ff-color-primary-700)]", label: "2 minuten" },
                { icon: Shield, bg: "bg-green-100", color: "text-green-700", label: "Geen foto's nodig" },
                { icon: Sparkles, bg: "bg-[var(--ff-color-accent-100)]", color: "text-[var(--ff-color-accent-700)]", label: "Direct resultaat" },
              ].map(({ icon: Icon, bg, color, label }) => (
                <div key={label} className="flex items-center gap-2" role="listitem">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 ${bg} rounded-full flex items-center justify-center flex-shrink-0`} aria-hidden="true">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-[var(--color-text)]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3 Steps ── */}
        <section
          className="py-10 sm:py-14 md:py-20 bg-white"
          aria-labelledby="process-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">

            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 id="process-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight">
                3 stappen naar jouw stijl
              </h2>
              <p className="text-base sm:text-lg text-[var(--color-muted)] font-light">
                Simpel, snel, resultaat
              </p>
            </div>

            <div className="flex flex-col md:grid md:grid-cols-3 md:items-stretch gap-4 sm:gap-6 lg:gap-8 mb-10 sm:mb-14">
              {steps.map((step) => (
                <motion.article
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  onHoverStart={() => setActiveStep(step.id)}
                  className={`relative bg-[var(--color-surface)] rounded-2xl sm:rounded-[2rem] border-2 p-5 sm:p-7 transition-all duration-300 cursor-pointer flex flex-col ${
                    activeStep === step.id
                      ? "border-[var(--ff-color-primary-600)] shadow-xl"
                      : "border-[var(--color-border)] shadow-md hover:shadow-lg hover:border-[var(--ff-color-primary-300)]"
                  }`}
                  aria-label={`${step.label}: ${step.title}`}
                  aria-pressed={activeStep === step.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setActiveStep(step.id)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center justify-center px-3 py-1 bg-[var(--ff-color-primary-600)] text-white rounded-full text-xs sm:text-sm font-bold shadow-sm flex-shrink-0">
                      {step.label}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-md mb-3" aria-hidden="true">
                      <step.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 leading-tight">{step.title}</h3>
                    <p className="text-[var(--color-muted)] text-sm leading-relaxed mb-4">
                      {step.description}
                    </p>
                  </div>

                  <ul className="space-y-2" role="list">
                    {step.bullets.map((b, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 ${b.iconBg} rounded-full flex items-center justify-center flex-shrink-0`} aria-hidden="true">
                          <b.icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${b.iconColor}`} strokeWidth={3} />
                        </div>
                        <span className={`text-xs sm:text-sm font-medium ${b.muted ? "text-[var(--color-muted)]" : ""}`}>{b.label}</span>
                      </li>
                    ))}
                  </ul>
                </motion.article>
              ))}
            </div>

            {/* Total time CTA */}
            <div className="text-center px-5 py-8 sm:px-10 sm:py-10 bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-2xl sm:rounded-[2rem] border-2 border-[var(--ff-color-primary-200)] shadow-md">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[var(--ff-color-primary-600)] rounded-xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-[var(--ff-color-primary-700)]">2 minuten</span>
              </div>
              <p className="text-sm text-[var(--color-muted)] font-medium mb-7">
                Van eerste vraag tot compleet stijladvies
              </p>

              <NavLink
                to="/onboarding"
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 sm:px-10 sm:py-5 min-h-[52px] w-full sm:w-auto bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
                aria-label="Start gratis quiz om je stijladvies te ontvangen"
              >
                Ontvang je stijladvies
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
              </NavLink>
            </div>
          </div>
        </section>

        {/* ── Comparison ── */}
        <section
          className="py-12 sm:py-16 md:py-24 bg-[var(--color-bg)]"
          aria-labelledby="comparison-heading"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">

            <div className="text-center mb-10 sm:mb-14">
              <h2 id="comparison-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
                Waarom FitFi beter is
              </h2>
              <p className="text-base sm:text-lg text-[var(--color-muted)] font-light">
                Vergelijk met de oude manier
              </p>
            </div>

            {/* Comparison table — stacks on mobile */}
            <div className="flex flex-col sm:grid sm:grid-cols-2 sm:items-stretch gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10">

              <div className="bg-white rounded-2xl border-2 border-[var(--color-border)] p-5 sm:p-7 shadow-md flex flex-col">
                <h3 className="font-bold text-lg sm:text-xl mb-4 text-center text-[var(--color-text)]">Trial &amp; Error</h3>
                <ul className="space-y-3" role="list">
                  {[
                    "3+ uur per winkelsessie",
                    "€200+ foute aankopen/jaar",
                    "Kast vol \"draag ik nooit\"",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <span className="text-sm sm:text-base text-[var(--color-muted)] leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] rounded-2xl border-2 border-[var(--ff-color-primary-400)] p-5 sm:p-7 text-white shadow-xl flex flex-col">
                <div className="inline-block mb-3 px-3 py-1 bg-[var(--ff-color-accent-500)] text-white rounded-full text-xs font-bold">
                  BESTE KEUZE
                </div>
                <h3 className="font-bold text-lg sm:text-xl mb-4 text-white">FitFi</h3>
                <ul className="space-y-3" role="list">
                  {[
                    "2 minuten, direct resultaat",
                    "Outfits die je draagt",
                    "€9,99/maand (of gratis)",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-sm sm:text-base font-medium leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center">
              <NavLink
                to="/onboarding"
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 sm:px-10 sm:py-5 min-h-[52px] w-full sm:w-auto bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
                aria-label="Probeer FitFi gratis"
              >
                Probeer FitFi gratis
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
              </NavLink>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section
          className="py-12 sm:py-16 md:py-24 bg-white"
          aria-labelledby="faq-heading"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">

            <div className="text-center mb-8 sm:mb-12">
              <h2 id="faq-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Veelgestelde vragen
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4" role="list">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className={`bg-[var(--color-surface)] rounded-2xl border-2 transition-all duration-300 shadow-sm ${
                      isOpen
                        ? "border-[var(--ff-color-primary-400)] shadow-md"
                        : "border-[var(--color-border)] hover:border-[var(--ff-color-primary-200)]"
                    }`}
                    role="listitem"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 p-5 sm:p-6 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2 rounded-2xl"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${idx}`}
                    >
                      <span className="font-bold text-sm sm:text-base text-[var(--color-text)] leading-snug pr-2">
                        {faq.q}
                      </span>
                      <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center transition-colors">
                        {isOpen
                          ? <Minus className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" strokeWidth={2.5} />
                          : <Plus className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" strokeWidth={2.5} />
                        }
                      </span>
                    </button>

                    {isOpen && (
                      <div
                        id={`faq-answer-${idx}`}
                        className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0"
                      >
                        <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section
          className="relative py-12 sm:py-16 md:py-24 bg-gradient-to-br from-[var(--color-bg)] via-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] overflow-hidden"
          aria-labelledby="final-cta-heading"
        >
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--ff-color-primary-200)] rounded-full blur-3xl opacity-30" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[var(--ff-color-accent-200)] rounded-full blur-3xl opacity-30" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-br from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-500)] rounded-2xl sm:rounded-[2.5rem] p-8 sm:p-12 md:p-16 text-center shadow-2xl border border-[var(--ff-color-primary-600)] overflow-hidden">

              <div className="absolute top-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl opacity-10" aria-hidden="true" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl opacity-10" aria-hidden="true" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-bold mb-6 shadow-md">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  Gratis starten
                </div>

                <h2 id="final-cta-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 sm:mb-6 leading-tight tracking-tight">
                  Ontvang je stijladvies<br className="hidden sm:block" /> in 2 minuten
                </h2>

                <p className="text-base sm:text-lg text-white/90 mb-8 max-w-xl mx-auto leading-relaxed font-light">
                  Beantwoord 8 vragen en ontdek outfits die bij jou passen
                </p>

                <NavLink
                  to="/onboarding"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-4 sm:px-10 sm:py-5 min-h-[52px] w-full sm:w-auto bg-white hover:bg-gray-50 text-[var(--ff-color-primary-700)] rounded-xl font-bold text-base sm:text-lg shadow-xl transition-all hover:scale-105 hover:shadow-2xl mb-6 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--ff-color-primary-600)] active:scale-[0.98]"
                  data-event="cta_start_free_how_it_works"
                  aria-label="Start gratis quiz om je stijladvies te ontvangen"
                >
                  Start gratis quiz
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </NavLink>

                <div
                  className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-white/90"
                  role="list"
                  aria-label="Belangrijkste garanties"
                >
                  <div className="flex items-center gap-1.5" role="listitem">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    <span className="text-xs sm:text-sm font-medium">2 minuten</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/40" aria-hidden="true" />
                  <div className="flex items-center gap-1.5" role="listitem">
                    <Shield className="w-4 h-4" aria-hidden="true" />
                    <span className="text-xs sm:text-sm font-medium">Geen foto's</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/40" aria-hidden="true" />
                  <div className="flex items-center gap-1.5" role="listitem">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium">Gratis start</span>
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
