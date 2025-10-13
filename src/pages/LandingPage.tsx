import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { Check, Sparkles, Clock, Shield, Target, TrendingUp, Zap, Users, FileText, Heart, ArrowRight } from "lucide-react";
import { StyleReportPreview } from "@/components/landing/StyleReportPreview";

export default function LandingPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] overflow-hidden">
      <Helmet>
        <title>AI Style Report in 2 minuten – Persoonlijk stijladvies | FitFi</title>
        <meta name="description" content="Krijg in 2:00 een persoonlijk AI Style Report met uitleg, kleuren en 6–12 outfits. Privacy-first, EU-gericht en nuchter. Start gratis." />
        <meta property="og:image" content="/hero/hero-style-report-lg.webp" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "FitFi",
            "description": "AI Style Report in 2 minuten – Persoonlijk stijladvies",
            "url": "https://fitfi.nl",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web"
          })}
        </script>
      </Helmet>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

        <div className="ff-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-full text-sm font-semibold text-[var(--ff-color-primary-700)] shadow-sm">
                <span className="w-2 h-2 bg-[var(--ff-color-primary-600)] rounded-full animate-pulse" />
                GRATIS AI STYLE REPORT
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-[var(--color-text)] leading-[1.1]">
                Ontdek wat jouw <span className="text-[var(--ff-color-primary-600)]">stijl</span> over je zegt
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
                Binnen 2 minuten krijg je een persoonlijk rapport met uitleg, kleuren en 6–12 outfits.
                <strong className="text-[var(--color-text)] font-semibold"> Direct toepasbaar.</strong>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <NavLink
                  to="/onboarding"
                  data-event="cta_start_free_home_hero"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-600)] text-white font-semibold rounded-[var(--radius-xl)] hover:bg-[var(--ff-color-primary-700)] transition-colors shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Start 2-min quiz
                </NavLink>

                <NavLink
                  to="/results"
                  data-event="cta_view_example_hero"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-surface)] text-[var(--color-text)] font-semibold border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] hover:bg-[var(--color-bg)] transition-colors"
                >
                  Zie voorbeeldrapport
                  <ArrowRight className="w-5 h-5" />
                </NavLink>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="flex flex-col items-center lg:items-start gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--ff-color-success-600)] flex items-center justify-center shadow-xl">
                    <Check className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">100% Gratis</div>
                </div>
                <div className="flex flex-col items-center lg:items-start gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--ff-color-primary-600)] flex items-center justify-center shadow-xl">
                    <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">Privacy-first</div>
                </div>
                <div className="flex flex-col items-center lg:items-start gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--ff-color-accent-600)] flex items-center justify-center shadow-xl">
                    <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">2 min setup</div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative group w-full max-w-md mx-auto lg:mx-0">
                <div className="absolute -inset-4 bg-gradient-to-r from-[var(--ff-color-primary-500)] via-[var(--ff-color-turquoise)] to-[var(--ff-color-accent-500)] rounded-3xl opacity-20 blur-2xl" />

                <figure className="relative group-hover:scale-[1.02] transition-transform duration-500">
                  <StyleReportPreview />

                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex gap-4 items-center">
                    <div className="backdrop-blur-md bg-white/90 rounded-2xl px-6 py-3 shadow-2xl border border-[var(--color-border)] animate-float">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] rounded-xl flex items-center justify-center shadow-lg">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-[var(--color-text)]">Archetype</div>
                          <div className="text-xs text-gray-600">Modern Minimal</div>
                        </div>
                      </div>
                    </div>

                    <div className="backdrop-blur-md bg-white/90 rounded-2xl px-6 py-3 shadow-2xl border border-[var(--color-border)] animate-float animation-delay-2000">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--ff-color-accent-600)] to-[var(--ff-color-accent-500)] rounded-xl flex items-center justify-center shadow-lg">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-[var(--color-text)]">AI Powered</div>
                          <div className="text-xs text-gray-600">Smart matching</div>
                        </div>
                      </div>
                    </div>

                    <div className="backdrop-blur-md bg-white/90 rounded-2xl px-6 py-3 shadow-2xl border border-[var(--color-border)] animate-float animation-delay-4000">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--ff-color-turquoise)] to-[var(--ff-color-primary-500)] rounded-xl flex items-center justify-center shadow-lg">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-[var(--color-text)]">Outfits</div>
                          <div className="text-xs text-gray-600">6-12 looks</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--ff-color-primary-25)] to-transparent opacity-40" />
        <div className="ff-container relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white backdrop-blur-sm rounded-2xl border border-[var(--color-border)] shadow-xl">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] bg-clip-text text-transparent">10K+</div>
              <div className="text-sm text-[var(--color-text)] mt-2 font-semibold">Style Reports</div>
            </div>
            <div className="text-center p-6 bg-white backdrop-blur-sm rounded-2xl border border-[var(--color-border)] shadow-xl">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] bg-clip-text text-transparent">2 min</div>
              <div className="text-sm text-[var(--color-text)] mt-2 font-semibold">Gemiddelde tijd</div>
            </div>
            <div className="text-center p-6 bg-white backdrop-blur-sm rounded-2xl border border-[var(--color-border)] shadow-xl">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] bg-clip-text text-transparent">95%</div>
              <div className="text-sm text-[var(--color-text)] mt-2 font-semibold">Tevreden</div>
            </div>
            <div className="text-center p-6 bg-white backdrop-blur-sm rounded-2xl border border-[var(--color-border)] shadow-xl">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] bg-clip-text text-transparent">100%</div>
              <div className="text-sm text-[var(--color-text)] mt-2 font-semibold">Privacy-first</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES BENTO GRID */}
      <section className="ff-section py-24">
        <div className="ff-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[var(--color-border)] rounded-full text-sm font-semibold text-[var(--ff-color-primary-700)] mb-6 shadow-md">
              <Sparkles className="w-4 h-4" />
              Waarom FitFi
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[var(--color-text)] mb-4">
              Helder en <span className="text-[var(--ff-color-primary-600)]">direct toepasbaar</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[var(--color-border)] rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">2 minuten, klaar</h3>
              <p className="text-gray-600 leading-relaxed">
                Geen eindeloze vragenlijsten. Gewoon de basics en je krijgt direct resultaat. We vragen alleen wat echt nodig is: lichaamsbouw, voorkeuren en gelegenheid.
              </p>
            </div>

            <div className="bg-white border border-[var(--color-border)] rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">Uitleg erbij</h3>
              <p className="text-gray-600 leading-relaxed">
                Elk outfit komt met reden waarom het bij je past. Geen willekeurige suggesties, maar uitleg over kleuren, silhouetten en waarom iets werkt voor jouw lichaamsbouw.
              </p>
            </div>

            <div className="bg-white border border-[var(--color-border)] rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">Direct shopbaar</h3>
              <p className="text-gray-600 leading-relaxed">
                Alle items zijn beschikbaar bij bekende Nederlandse webshops. Links naar Zalando, ASOS, H&M en andere shops die je kent.
              </p>
            </div>

            <div className="bg-white border border-[var(--color-border)] rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">Privacy-first (EU)</h3>
              <p className="text-gray-600 leading-relaxed">
                Alleen wat nodig is, geen doorverkoop van data. We zijn helder over data: minimaal verzamelen, EU-toon & beleid.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="ff-section py-24 bg-gradient-to-b from-[var(--ff-color-primary-25)] to-transparent">
        <div className="ff-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[var(--color-text)] mb-4">
              Wat anderen zeggen
            </h2>
            <div className="flex items-center justify-center gap-4 mt-6">
              <span className="px-4 py-2 bg-white border border-[var(--color-border)] rounded-full text-sm font-medium shadow-md">⭐ 4.8/5 gemiddeld</span>
              <span className="px-4 py-2 bg-white border border-[var(--color-border)] rounded-full text-sm font-medium shadow-md">🇳🇱 Nederlandse focus</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white border border-[var(--color-border)] rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
                  M
                </div>
                <div>
                  <p className="text-[var(--color-text)] leading-relaxed mb-3">
                    "Eindelijk stijladvies dat niet overdreven is. Praktisch en echt bruikbaar."
                  </p>
                  <div className="text-sm text-gray-600 font-medium">— Marieke, 32</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[var(--color-border)] rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--ff-color-turquoise)] to-[var(--ff-color-primary-500)] rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
                  T
                </div>
                <div>
                  <p className="text-[var(--color-text)] leading-relaxed mb-3">
                    "De uitleg waarom iets bij me past was echt eye-opening. Geen giswerk meer."
                  </p>
                  <div className="text-sm text-gray-600 font-medium">— Thomas, 28</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="ff-section py-24">
        <div className="ff-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[var(--color-border)] rounded-full text-sm font-semibold text-[var(--ff-color-primary-700)] mb-6 shadow-md">
              Proces
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[var(--color-text)]">Hoe het werkt</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">Korte vragenlijst</h3>
              <p className="text-gray-600">
                Lichaamsbouw, voorkeuren en waar je de kleding draagt. 2 minuten max.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--ff-color-accent-600)] to-[var(--ff-color-accent-500)] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">AI analyseert</h3>
              <p className="text-gray-600">
                Onze AI bepaalt je stijlarchetype en matcht dit met beschikbare items.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">Persoonlijk rapport</h3>
              <p className="text-gray-600">
                Je krijgt 6-12 complete outfits met uitleg en directe shoplinks.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">Shop & draag</h3>
              <p className="text-gray-600">
                Klik door naar bekende webshops en bouw je garderobe stap voor stap op.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="ff-section py-24 bg-gradient-to-b from-transparent to-[var(--ff-color-primary-25)]">
        <div className="ff-container max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[var(--color-border)] rounded-full text-sm font-semibold text-[var(--ff-color-primary-700)] mb-6 shadow-md">
              Vragen
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[var(--color-text)]">Veelgestelde vragen</h2>
          </div>

          <div className="space-y-4">
            <details className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <summary className="font-semibold text-lg text-[var(--color-text)] cursor-pointer">Is het echt gratis?</summary>
              <p className="mt-4 text-gray-600 leading-relaxed">Ja, het basisrapport is volledig gratis. Je krijgt je stijlarchetype, kleurpalet en 6-8 outfits zonder kosten.</p>
            </details>
            <details className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <summary className="font-semibold text-lg text-[var(--color-text)] cursor-pointer">Hoe accuraat is de AI?</summary>
              <p className="mt-4 text-gray-600 leading-relaxed">Onze AI is getraind op duizenden stijlcombinaties en houdt rekening met lichaamsbouw, kleurtype en persoonlijke voorkeuren. De meeste gebruikers zijn verrast door de accuratesse.</p>
            </details>
            <details className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <summary className="font-semibold text-lg text-[var(--color-text)] cursor-pointer">Welke winkels worden gebruikt?</summary>
              <p className="mt-4 text-gray-600 leading-relaxed">We werken samen met bekende Nederlandse webshops zoals Zalando, ASOS, H&M, en anderen. Alle items zijn beschikbaar en leverbaar in Nederland.</p>
            </details>
            <details className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <summary className="font-semibold text-lg text-[var(--color-text)] cursor-pointer">Wat gebeurt er met mijn data?</summary>
              <p className="mt-4 text-gray-600 leading-relaxed">We verzamelen alleen wat nodig is voor je stijladvies. Je data wordt niet doorverkocht en we houden ons aan alle EU privacy-regels. <NavLink to="/privacy" className="text-[var(--ff-color-primary-600)] hover:underline font-medium">Lees ons privacybeleid</NavLink>.</p>
            </details>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20">
        <div className="ff-container">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-[var(--radius-2xl)] p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Klaar om je <span className="text-[var(--ff-color-primary-600)]">stijl</span> te ontdekken?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start nu en krijg binnen 2 minuten je persoonlijke Style Report.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <NavLink
                to="/onboarding"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
                data-event="cta_start_free_footer"
              >
                <Sparkles className="w-5 h-5" />
                Start gratis Style Report
              </NavLink>
              <NavLink
                to="/results"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--color-surface)] transition-colors"
                data-event="cta_view_example_footer"
              >
                Bekijk voorbeeldrapport
                <ArrowRight className="w-5 h-5" />
              </NavLink>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm mt-8">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                <span>Geen creditcard nodig</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                <span>100% Privacy-first</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                <span>Direct resultaat</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
