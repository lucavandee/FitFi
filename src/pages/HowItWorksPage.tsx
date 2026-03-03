import React, { useState } from "react";
import Seo from "@/components/seo/Seo";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Sparkles,
  Zap,
  Clock,
  Shield,
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
        structuredData={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "Hoe FitFi werkt — stijladvies in 2 minuten",
          "description": "In 2 minuten van quiz naar compleet stijladvies. Beantwoord 8 vragen, wij matchen outfits, jij shopt direct.",
          "totalTime": "PT2M",
          "step": [
            {
              "@type": "HowToStep",
              "position": 1,
              "name": "Beantwoord 8 vragen",
              "text": "Over jouw lifestyle, voorkeuren en hoe je je wilt voelen. Geen foto's, geen gedoe. Duurt 2 minuten."
            },
            {
              "@type": "HowToStep",
              "position": 2,
              "name": "Wij matchen outfits",
              "text": "We vinden kleurcombinaties die werken en stellen complete looks samen. Duurt 30 seconden."
            },
            {
              "@type": "HowToStep",
              "position": 3,
              "name": "Jij shopt direct",
              "text": "Complete looks, direct shopbaar. Plus: waarom elk item bij jou past. 6-12 outfits met directe shoplinks."
            }
          ]
        }}
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
                { icon: Shield, bg: "bg-[var(--ff-color-success-100)]", color: "text-[var(--ff-color-success-700)]", label: "Geen foto's nodig" },
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
          className="py-10 sm:py-14 md:py-20 bg-[var(--color-surface)]"
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
                <motion.div
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
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActiveStep(step.id)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center justify-center px-3 py-1 bg-[var(--ff-color-primary-600)] text-white rounded-full text-xs sm:text-sm font-bold shadow-sm flex-shrink-0">
                      {step.label}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col mb-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-md mb-3" aria-hidden="true">
                      <step.icon className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-bold mb-2 leading-tight">{step.title}</h3>
                    <p className="text-[var(--color-muted)] text-sm leading-relaxed flex-1">
                      {step.description}
                    </p>
                  </div>

                  <ul className="space-y-2 mt-4 pt-4 border-t border-[var(--color-border)]" role="list">
                    {step.bullets.map((b, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 ${b.iconBg} rounded-full flex items-center justify-center flex-shrink-0`} aria-hidden="true">
                          <b.icon className={`w-3 h-3 ${b.iconColor}`} strokeWidth={3} />
                        </div>
                        <span className={`text-sm font-medium ${b.muted ? "text-[var(--color-muted)]" : "text-[var(--color-text)]"}`}>{b.label}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-9 h-9 bg-[var(--ff-color-primary-600)] rounded-xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-[var(--ff-color-primary-700)]">Totaal: 2 minuten</span>
              </div>
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

              <div className="bg-[var(--color-surface)] rounded-2xl border-2 border-[var(--color-border)] p-5 sm:p-7 shadow-md flex flex-col">
                <h3 className="font-bold text-lg sm:text-xl mb-4 text-center text-[var(--color-text)]">Trial &amp; Error</h3>
                <ul className="space-y-3" role="list">
                  {[
                    "3+ uur per winkelsessie",
                    "€200+ foute aankopen/jaar",
                    "Kast vol \"draag ik nooit\"",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--ff-color-danger-100)] flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--ff-color-danger-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          </div>
        </section>

        {/* ── FAQ ── */}
        <section
          className="py-12 sm:py-16 md:py-24 bg-[var(--color-surface)]"
          aria-labelledby="faq-heading"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">

            <div className="text-center mb-8 sm:mb-12">
              <h2 id="faq-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Veelgestelde vragen
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className={`bg-[var(--color-surface)] rounded-2xl border-2 transition-colors duration-200 shadow-sm ${
                      isOpen
                        ? "border-[var(--ff-color-primary-400)] shadow-md"
                        : "border-[var(--color-border)] hover:border-[var(--ff-color-primary-200)]"
                    }`}
                  >
                    <button
                      type="button"
                      id={`faq-trigger-${idx}`}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 p-5 sm:p-6 min-h-[56px] text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2 rounded-2xl"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${idx}`}
                    >
                      <span className="font-bold text-sm sm:text-base text-[var(--color-text)] leading-snug pr-2">
                        {faq.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center transition-colors"
                      >
                        {isOpen
                          ? <Minus className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" strokeWidth={2.5} />
                          : <Plus className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" strokeWidth={2.5} />
                        }
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-answer-${idx}`}
                          role="region"
                          aria-labelledby={`faq-trigger-${idx}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                            <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed">
                              {faq.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
