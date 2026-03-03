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
  ArrowRight,
  X,
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
      { icon: Heart, iconBg: "bg-[var(--ff-color-danger-100)]", iconColor: "text-[var(--ff-color-danger-600)]", label: "Bewaar voor altijd", muted: true },
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
  {
    q: "Hoeveel kost FitFi?",
    a: "De basis stijlquiz is gratis. Premium functies zoals opgeslagen outfits en Nova AI-chat zijn beschikbaar vanaf €9,99/maand.",
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
            { "@type": "HowToStep", "position": 1, "name": "Beantwoord 8 vragen", "text": "Over jouw lifestyle, voorkeuren en hoe je je wilt voelen. Geen foto's, geen gedoe. Duurt 2 minuten." },
            { "@type": "HowToStep", "position": 2, "name": "Wij matchen outfits", "text": "We vinden kleurcombinaties die werken en stellen complete looks samen. Duurt 30 seconden." },
            { "@type": "HowToStep", "position": 3, "name": "Jij shopt direct", "text": "Complete looks, direct shopbaar. Plus: waarom elk item bij jou past. 6-12 outfits met directe shoplinks." },
          ],
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
          className="relative overflow-hidden bg-[var(--ff-color-primary-50)] py-14 sm:py-20 md:py-28"
          aria-labelledby="hero-heading"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(166,136,106,0.10) 0%, transparent 70%)',
            }}
          />
          <div className="ff-container relative z-10 text-center">

            <div
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-sm font-bold text-[var(--color-text)] shadow-[var(--shadow-soft)] mb-7"
              role="status"
              aria-label="2500 mensen gebruiken FitFi"
            >
              <Users className="w-4 h-4 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
              2.500+ mensen gebruiken FitFi
            </div>

            <h1
              id="hero-heading"
              className="font-heading font-bold tracking-tight text-[var(--color-text)] mb-5"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', lineHeight: 1.08 }}
            >
              Zo krijg je{" "}
              <em
                className="not-italic bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, var(--ff-color-primary-600), var(--ff-color-primary-800))' }}
              >
                outfits die passen
              </em>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[var(--color-muted)] mb-10 max-w-xl mx-auto leading-relaxed font-light">
              In 2 minuten van quiz naar compleet stijladvies. Zo shop je moeiteloos.
            </p>

            <div
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-10"
              role="list"
              aria-label="Voordelen"
            >
              {[
                { icon: Clock, bg: "bg-[var(--ff-color-primary-100)]", color: "text-[var(--ff-color-primary-700)]", label: "2 minuten" },
                { icon: Shield, bg: "bg-[var(--ff-color-success-100)]", color: "text-[var(--ff-color-success-700)]", label: "Geen foto's nodig" },
                { icon: Sparkles, bg: "bg-[var(--ff-color-accent-100)]", color: "text-[var(--ff-color-accent-700)]", label: "Direct resultaat" },
              ].map(({ icon: Icon, bg, color, label }) => (
                <div key={label} className="flex items-center gap-2.5" role="listitem">
                  <div className={`w-9 h-9 ${bg} rounded-full flex items-center justify-center flex-shrink-0`} aria-hidden="true">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-[var(--color-text)]">{label}</span>
                </div>
              ))}
            </div>

            <a
              href="/stijlquiz"
              className="group inline-flex items-center gap-2.5 px-8 py-4 min-h-[56px] rounded-xl font-bold text-base transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)]"
              style={{
                background: 'var(--ff-color-primary-700)',
                color: 'var(--color-bg)',
                boxShadow: '0 8px 40px rgba(166,136,106,0.45)',
              }}
            >
              Ontvang jouw stijladvies
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* ── 3 Stappen ── */}
        <section
          className="ff-section bg-[var(--color-surface)]"
          aria-labelledby="process-heading"
        >
          <div className="ff-container">

            <div className="text-center mb-10 sm:mb-14">
              <h2
                id="process-heading"
                className="font-heading font-bold tracking-tight text-[var(--color-text)] mb-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.75rem, 2.75rem)', lineHeight: 1.1 }}
              >
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
                  className={`relative bg-[var(--color-surface)] rounded-2xl border-2 p-5 sm:p-7 transition-all duration-300 cursor-pointer flex flex-col ${
                    activeStep === step.id
                      ? "border-[var(--ff-color-primary-600)] shadow-xl"
                      : "border-[var(--color-border)] shadow-[var(--shadow-soft)] hover:border-[var(--ff-color-primary-300)]"
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
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-4"
                      style={{ background: 'linear-gradient(135deg, var(--ff-color-primary-600), var(--ff-color-primary-800))' }}
                      aria-hidden="true"
                    >
                      <step.icon className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="font-heading font-bold text-lg mb-2 leading-tight text-[var(--color-text)]">{step.title}</h3>
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
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-[var(--ff-color-primary-50)] rounded-2xl border border-[var(--ff-color-primary-200)]">
                <div className="w-9 h-9 bg-[var(--ff-color-primary-700)] rounded-xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-[var(--ff-color-primary-700)]">Totaal: 2 minuten</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Vergelijking ── */}
        <section
          className="ff-section bg-[var(--color-bg)]"
          aria-labelledby="comparison-heading"
        >
          <div className="ff-container">

            <div className="text-center mb-10 sm:mb-14">
              <h2
                id="comparison-heading"
                className="font-heading font-bold tracking-tight text-[var(--color-text)] mb-3"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.75rem, 2.75rem)', lineHeight: 1.1 }}
              >
                Waarom FitFi beter is
              </h2>
              <p className="text-base sm:text-lg text-[var(--color-muted)] font-light">
                Vergelijk met de oude manier
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-3xl mx-auto">

              <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 sm:p-7 shadow-[var(--shadow-soft)] flex flex-col">
                <h3 className="font-heading font-bold text-lg sm:text-xl mb-5 text-center text-[var(--color-text)]">Trial &amp; Error</h3>
                <ul className="space-y-3 flex-1" role="list">
                  {[
                    "3+ uur per winkelsessie",
                    "€200+ foute aankopen/jaar",
                    "Kast vol \"draag ik nooit\"",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--ff-color-danger-100)] flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                        <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--ff-color-danger-600)]" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm sm:text-base text-[var(--color-muted)] leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="relative rounded-2xl border-2 border-[var(--ff-color-primary-400)] p-5 sm:p-7 shadow-xl flex flex-col"
                style={{ background: 'linear-gradient(135deg, var(--ff-color-primary-700), var(--ff-color-primary-900))' }}
              >
                <div
                  className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-bold self-start"
                  style={{ background: 'var(--ff-color-primary-500)', color: 'var(--color-bg)' }}
                >
                  BESTE KEUZE
                </div>
                <h3 className="font-heading font-bold text-lg sm:text-xl mb-5 text-white">FitFi</h3>
                <ul className="space-y-3 flex-1" role="list">
                  {[
                    "2 minuten, direct resultaat",
                    "Outfits die je draagt",
                    "€9,99/maand (of gratis)",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(255,255,255,0.20)' }}
                        aria-hidden="true"
                      >
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-sm sm:text-base font-medium leading-snug text-white">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </section>

        {/* ── FAQ ── */}
        <section
          className="ff-section bg-[var(--color-surface)]"
          aria-labelledby="faq-heading"
        >
          <div className="ff-container">

            <div className="text-center mb-10 sm:mb-12">
              <h2
                id="faq-heading"
                className="font-heading font-bold tracking-tight text-[var(--color-text)]"
                style={{ fontSize: 'clamp(1.75rem, 3vw + 0.75rem, 2.75rem)', lineHeight: 1.1 }}
              >
                Veelgestelde vragen
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className={`bg-[var(--color-surface)] rounded-2xl border-2 transition-colors duration-200 shadow-[var(--shadow-soft)] ${
                      isOpen
                        ? "border-[var(--ff-color-primary-400)]"
                        : "border-[var(--color-border)] hover:border-[var(--ff-color-primary-200)]"
                    }`}
                  >
                    <button
                      type="button"
                      id={`faq-trigger-${idx}`}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 p-5 sm:p-6 min-h-[56px] text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
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

        {/* ── Sluitende CTA ── */}
        <section className="ff-section bg-[var(--ff-color-primary-50)]" aria-label="Start met FitFi">
          <div className="ff-container text-center">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-6 shadow-sm"
              style={{ background: 'linear-gradient(135deg, var(--ff-color-primary-600), var(--ff-color-primary-800))' }}
              aria-hidden="true"
            >
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2
              className="font-heading font-bold tracking-tight text-[var(--color-text)] mb-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.75rem, 2.5rem)', lineHeight: 1.1 }}
            >
              Klaar voor jouw stijladvies?
            </h2>
            <p className="text-base sm:text-lg text-[var(--color-muted)] mb-8 max-w-md mx-auto leading-relaxed font-light">
              Gratis. 2 minuten. Geen foto's nodig.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/stijlquiz"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 min-h-[56px] rounded-xl font-bold text-base transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)]"
                style={{
                  background: 'var(--ff-color-primary-700)',
                  color: 'var(--color-bg)',
                  boxShadow: '0 8px 40px rgba(166,136,106,0.45)',
                }}
              >
                Start gratis
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
              <a
                href="/voorbeeld"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 min-h-[52px] rounded-xl font-semibold text-[var(--color-text)] border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-500)] hover:bg-[var(--ff-color-primary-50)] hover:text-[var(--ff-color-primary-700)] transition-all"
              >
                Bekijk voorbeeld
              </a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
