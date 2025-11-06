import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { Check, Sparkles, Clock, Shield, Target, TrendingUp, Zap } from "lucide-react";
import { HeroMinimal } from "@/components/landing/HeroMinimal";
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

      {/* HERO SECTION - Minimal LCP-optimized */}
      <HeroMinimal />

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
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors shadow-lg"
                data-event="cta_start_free_footer"
              >
                <Sparkles className="w-5 h-5" />
                Start gratis Style Report
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
