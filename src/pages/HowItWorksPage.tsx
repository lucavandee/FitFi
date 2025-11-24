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

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Hoe het werkt - AI Style Report in 3 stappen | FitFi</title>
        <meta
          name="description"
          content="Ontdek in 5 minuten je perfecte stijl. Quiz → AI analyse → Gepersonaliseerde outfits. Geen foto's, geen gedoe."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-20 md:py-28">
        <div className="ff-container relative">
          <div className="max-w-5xl mx-auto text-center">

            {/* Social Proof Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-full mb-6 shadow-sm">
              <Users className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
              <span className="text-sm font-medium text-[var(--color-text)]">
                2.500+ mensen vonden hun stijl in 5 minuten
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-6 leading-tight">
              Van <span className="text-[var(--ff-color-primary-600)]">twijfel</span><br />
              naar <span className="text-[var(--ff-color-primary-600)]">vertrouwen</span>
            </h1>

            <p className="text-xl md:text-2xl text-[var(--color-muted)] mb-8 max-w-3xl mx-auto leading-relaxed">
              Geen eindeloos scrollen. Geen dure stylisten. Gewoon: 8 vragen, 5 minuten, outfits die passen.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                <span className="font-semibold">5 minuten</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Geen foto's nodig</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                <span className="font-semibold">Direct resultaat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Process */}
      <section className="py-20 bg-white">
        <div className="ff-container">
          <div className="max-w-6xl mx-auto">

            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Zo simpel werkt het
              </h2>
              <p className="text-xl text-[var(--color-muted)]">
                3 stappen, 5 minuten, lifetime resultaat
              </p>
            </div>

            {/* Interactive Timeline */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {/* Step 1 */}
              <motion.div
                onHoverStart={() => setActiveStep(1)}
                className={`relative bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border-2 p-8 transition-all cursor-pointer ${
                  activeStep === 1
                    ? 'border-[var(--ff-color-primary-600)] shadow-xl scale-105'
                    : 'border-[var(--color-border)] shadow-[var(--shadow-soft)]'
                }`}
              >
                <div className="absolute -top-4 left-6 px-4 py-1 bg-[var(--ff-color-primary-600)] text-white rounded-full text-sm font-bold">
                  Stap 1
                </div>

                <div className="mb-6 mt-2">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-4">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">8 slimme vragen</h3>
                  <p className="text-[var(--color-muted)] mb-4">
                    Over je lifestyle, voorkeuren en persoonlijkheid. Geen foto's, geen gedoe.
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Privacy-vriendelijk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>2 minuten</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--color-muted)]" />
                    <span className="text-[var(--color-muted)]">Start nu</span>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                onHoverStart={() => setActiveStep(2)}
                className={`relative bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border-2 p-8 transition-all cursor-pointer ${
                  activeStep === 2
                    ? 'border-[var(--ff-color-primary-600)] shadow-xl scale-105'
                    : 'border-[var(--color-border)] shadow-[var(--shadow-soft)]'
                }`}
              >
                <div className="absolute -top-4 left-6 px-4 py-1 bg-[var(--ff-color-primary-600)] text-white rounded-full text-sm font-bold">
                  Stap 2
                </div>

                <div className="mb-6 mt-2">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">AI doet het werk</h3>
                  <p className="text-[var(--color-muted)] mb-4">
                    Matcht je profiel met duizenden producten. Vindt kleurcombinaties die werken. Bouwt outfits.
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Smart algoritme</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>30 seconden</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[var(--color-muted)]" />
                    <span className="text-[var(--color-muted)]">Gebeurt automatisch</span>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                onHoverStart={() => setActiveStep(3)}
                className={`relative bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border-2 p-8 transition-all cursor-pointer ${
                  activeStep === 3
                    ? 'border-[var(--ff-color-primary-600)] shadow-xl scale-105'
                    : 'border-[var(--color-border)] shadow-[var(--shadow-soft)]'
                }`}
              >
                <div className="absolute -top-4 left-6 px-4 py-1 bg-[var(--ff-color-primary-600)] text-white rounded-full text-sm font-bold">
                  Stap 3
                </div>

                <div className="mb-6 mt-2">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-4">
                    <Shirt className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Jouw outfits</h3>
                  <p className="text-[var(--color-muted)] mb-4">
                    Complete looks, direct shopbaar. Plus: waarom elk item bij je past.
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>6-12 outfits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Directe shoplinks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[var(--color-muted)]" />
                    <span className="text-[var(--color-muted)]">Voor altijd bewaren</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Total Time */}
            <div className="text-center p-6 bg-[var(--ff-color-primary-50)] rounded-[var(--radius-xl)] border border-[var(--ff-color-primary-200)]">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
                <span className="text-3xl font-bold text-[var(--ff-color-primary-700)]">5 minuten</span>
              </div>
              <p className="text-[var(--color-muted)]">
                Van eerste vraag tot complete garderobe-advies
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes It Work Section */}
      <section className="py-20 bg-[var(--color-bg)]">
        <div className="ff-container">
          <div className="max-w-6xl mx-auto">

            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Waarom het werkt
              </h2>
              <p className="text-xl text-[var(--color-muted)]">
                Geen giswerk. Geen trends. Gewoon: jouw stijl, data-backed.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

              {/* Trust Factor 1 */}
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 shadow-[var(--shadow-soft)]">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-6">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">8 stijlarchetypes</h3>
                <p className="text-[var(--color-muted)] mb-4">
                  Niet "casual" of "formeel". Denk: Modern Minimalist, Urban Explorer, Classic Elegance.
                  We categoriseren op persoonlijkheid, niet op trends.
                </p>
                <div className="flex items-center gap-2 text-sm text-[var(--ff-color-primary-600)] font-semibold">
                  <span>Gebaseerd op psychologisch onderzoek</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Trust Factor 2 */}
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 shadow-[var(--shadow-soft)]">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-6">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">12.000+ producten</h3>
                <p className="text-[var(--color-muted)] mb-4">
                  Onze AI scant realtime webshops. Elk item heeft 50+ eigenschappen: kleur, stijl, seizoen, gelegenheid, body type.
                  Matchen gebeurt op milliseconden.
                </p>
                <div className="flex items-center gap-2 text-sm text-[var(--ff-color-primary-600)] font-semibold">
                  <span>Database groeit elke week</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Trust Factor 3 */}
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 shadow-[var(--shadow-soft)]">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-6">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Leert van feedback</h3>
                <p className="text-[var(--color-muted)] mb-4">
                  Premium gebruikers kunnen outfits liken/disliken. Elke reactie verbetert het algoritme.
                  Hoe vaker je FitFi gebruikt, hoe nauwkeuriger de match.
                </p>
                <div className="flex items-center gap-2 text-sm text-[var(--ff-color-primary-600)] font-semibold">
                  <span>Machine learning die evolueert</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Trust Factor 4 */}
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 shadow-[var(--shadow-soft)]">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-6">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Privacy by design</h3>
                <p className="text-[var(--color-muted)] mb-4">
                  Geen foto's uploaden. Geen body scans. Geen persoonlijke data verkopen.
                  Alleen je stijlvoorkeuren → alleen betere aanbevelingen.
                </p>
                <div className="flex items-center gap-2 text-sm text-[var(--ff-color-primary-600)] font-semibold">
                  <span>GDPR-compliant, altijd</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-white">
        <div className="ff-container">
          <div className="max-w-5xl mx-auto">

            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                FitFi vs de oude manier
              </h2>
              <p className="text-xl text-[var(--color-muted)]">
                Waarom duizenden overstappen
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">

              {/* Old Way 1 */}
              <div className="bg-[var(--color-bg)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">😰</div>
                  <h3 className="font-bold text-lg mb-2">Trial & Error</h3>
                </div>
                <ul className="space-y-2 text-sm text-[var(--color-muted)] mb-4">
                  <li>• 3+ uur per winkel sessie</li>
                  <li>• €200+ foute aankopen/jaar</li>
                  <li>• Geen objectief advies</li>
                  <li>• Kast vol "draag ik nooit"</li>
                </ul>
                <div className="text-center text-sm font-semibold text-red-600">
                  Kost: €200+ tijd + geld
                </div>
              </div>

              {/* Old Way 2 */}
              <div className="bg-[var(--color-bg)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">💸</div>
                  <h3 className="font-bold text-lg mb-2">Personal Stylist</h3>
                </div>
                <ul className="space-y-2 text-sm text-[var(--color-muted)] mb-4">
                  <li>• €150-€500 per sessie</li>
                  <li>• Afspraak maken = weken wachten</li>
                  <li>• Beperkt tot hun smaak</li>
                  <li>• Geen 24/7 beschikbaar</li>
                </ul>
                <div className="text-center text-sm font-semibold text-red-600">
                  Kost: €150-€500/sessie
                </div>
              </div>

              {/* FitFi Way */}
              <div className="bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] rounded-[var(--radius-xl)] border-2 border-[var(--ff-color-primary-400)] p-6 text-white shadow-xl transform scale-105">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">✨</div>
                  <h3 className="font-bold text-lg mb-2">FitFi</h3>
                </div>
                <ul className="space-y-2 text-sm mb-4">
                  <li>• 5 minuten, direct resultaat</li>
                  <li>• €9,99/maand (of €149 lifetime)</li>
                  <li>• Data-driven matches</li>
                  <li>• Onbeperkt nieuwe outfits</li>
                </ul>
                <div className="text-center text-sm font-semibold bg-white/20 backdrop-blur-sm rounded-lg py-2">
                  Kost: €9,99/maand
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[var(--color-bg)]">
        <div className="ff-container">
          <div className="max-w-3xl mx-auto">

            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Veelgestelde vragen
              </h2>
            </div>

            <div className="space-y-4">
              <details className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6 group">
                <summary className="font-semibold cursor-pointer flex items-center justify-between">
                  <span>Moet ik foto's uploaden?</span>
                  <ArrowRight className="w-5 h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-[var(--color-muted)] leading-relaxed">
                  Nee! De quiz werkt zonder foto's. Premium gebruikers kunnen later foto's uploaden voor kleuranalyse, maar dat is optioneel.
                </p>
              </details>

              <details className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6 group">
                <summary className="font-semibold cursor-pointer flex items-center justify-between">
                  <span>Wat als de quiz het mis heeft?</span>
                  <ArrowRight className="w-5 h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-[var(--color-muted)] leading-relaxed">
                  Je kunt de quiz opnieuw doen. Premium gebruikers krijgen Nova AI: chat gewoon "deze outfit vind ik niks" en het systeem past zich aan.
                </p>
              </details>

              <details className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6 group">
                <summary className="font-semibold cursor-pointer flex items-center justify-between">
                  <span>Moet ik alles kopen wat jullie voorstellen?</span>
                  <ArrowRight className="w-5 h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-[var(--color-muted)] leading-relaxed">
                  Nee. We geven suggesties, jij beslist. Gebruik FitFi als inspiratie of als complete shopping guide — het is jouw keuze.
                </p>
              </details>

              <details className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6 group">
                <summary className="font-semibold cursor-pointer flex items-center justify-between">
                  <span>Hoe nauwkeurig is de AI?</span>
                  <ArrowRight className="w-5 h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-[var(--color-muted)] leading-relaxed">
                  2.500+ gebruikers gaven gemiddeld 4.8/5 sterren. De AI leert van elke interactie. Hoe meer je gebruikt, hoe beter het wordt.
                </p>
              </details>

              <details className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6 group">
                <summary className="font-semibold cursor-pointer flex items-center justify-between">
                  <span>Werkt het voor mannen én vrouwen?</span>
                  <ArrowRight className="w-5 h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-[var(--color-muted)] leading-relaxed">
                  Ja! De quiz vraagt je gendervoorkeur en past het assortiment daarop aan. Beide catalogi hebben 5.000+ producten.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="ff-container">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] rounded-[var(--radius-2xl)] p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Klaar om te beginnen?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              5 minuten. 8 vragen. Lifetime advies.
            </p>
            <NavLink
              to="/onboarding"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[var(--ff-color-primary-700)] rounded-[var(--radius-xl)] font-bold hover:bg-white/95 transition-colors shadow-xl text-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ff-color-primary-600)]"
              data-event="cta_start_free_how_it_works"
            >
              <Sparkles className="w-5 h-5" />
              Start gratis
            </NavLink>
            <p className="text-sm opacity-75 mt-4">
              Geen creditcard • Geen gedoe • Direct resultaat
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
