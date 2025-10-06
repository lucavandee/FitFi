import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { Check, Sparkles, Clock, Shield, Target, TrendingUp, Zap, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] overflow-hidden">
      <Helmet>
        <title>AI Style Report in 2 minuten – Persoonlijk stijladvies | FitFi</title>
        <meta name="description" content="Krijg in 2:00 een persoonlijk AI Style Report met uitleg, kleuren en 6–12 outfits. Privacy-first, EU-gericht en nuchter. Start gratis." />
        <meta property="og:image" content="/hero/style-report%20copy.webp" />
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
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--ff-color-primary-100)] rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--ff-color-accent-100)] rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--ff-color-primary-50)] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        </div>

        <div className="ff-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-full text-sm font-semibold text-[var(--ff-color-primary-700)] shadow-sm">
                <span className="w-2 h-2 bg-[var(--ff-color-primary-600)] rounded-full animate-pulse" />
                GRATIS AI STYLE REPORT
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-[var(--color-text)] leading-[1.1]">
                Ontdek wat jouw <span className="text-[var(--ff-color-primary-600)]">stijl</span> over je zegt
              </h1>

              <p className="text-xl lg:text-2xl text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
                Binnen 2 minuten krijg je een persoonlijk rapport met uitleg, kleuren en 6–12 outfits.
                <strong className="text-[var(--color-text)] font-semibold"> Rustig, duidelijk en zonder gedoe.</strong>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <NavLink
                  to="/onboarding"
                  data-event="cta_start_free_home_hero"
                  className="px-8 py-4 bg-[var(--ff-color-primary-700)] text-white font-bold rounded-2xl shadow-xl hover:bg-[var(--ff-color-primary-600)] transition-all duration-200 hover:shadow-2xl hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    Start gratis
                    <Sparkles className="w-5 h-5" />
                  </span>
                </NavLink>

                <NavLink
                  to="/results"
                  data-event="cta_view_example_hero"
                  className="px-8 py-4 bg-white text-[var(--color-text)] font-bold border-2 border-[var(--color-border)] rounded-2xl hover:border-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-600)] transition-all duration-200 hover:shadow-lg"
                >
                  Bekijk voorbeeld
                </NavLink>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="flex flex-col items-center lg:items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--ff-color-primary-700)] flex items-center justify-center shadow-xl">
                    <Check className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-[var(--color-text)]">100% Gratis</div>
                </div>
                <div className="flex flex-col items-center lg:items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--ff-color-primary-700)] flex items-center justify-center shadow-xl">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-[var(--color-text)]">Privacy-first</div>
                </div>
                <div className="flex flex-col items-center lg:items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--ff-color-primary-700)] flex items-center justify-center shadow-xl">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-[var(--color-text)]">2 min setup</div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative group w-full max-w-md mx-auto lg:mx-0">
                <div className="absolute -inset-4 bg-gradient-to-r from-[var(--ff-color-primary-500)] via-[var(--ff-color-turquoise)] to-[var(--ff-color-accent-500)] rounded-3xl opacity-20 blur-2xl" />

                <figure className="relative bg-white rounded-3xl p-4 shadow-2xl border border-[var(--color-border)] group-hover:scale-[1.02] transition-transform duration-500">
                  <img
                    src="/hero/style-report%20copy.webp"
                    alt="Voorbeeld van het FitFi Style Report op mobiel"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-auto rounded-[1.5rem] shadow-xl"
                    sizes="(max-width: 1024px) 90vw, 400px"
                  />

                  <div className="absolute -left-6 top-1/4 hidden lg:block">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/40 animate-float">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] rounded-xl flex items-center justify-center shadow-lg">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-[var(--color-text)]">Archetype</div>
                          <div className="text-xs text-[var(--color-text-muted)]">Modern Minimal</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -right-6 top-2/3 hidden lg:block">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/40 animate-float animation-delay-2000">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--ff-color-turquoise)] to-[var(--ff-color-primary-500)] rounded-xl flex items-center justify-center shadow-lg">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-[var(--color-text)]">Outfits</div>
                          <div className="text-xs text-[var(--color-text-muted)]">6-12 looks</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -left-8 bottom-1/4 hidden lg:block">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/40 animate-float animation-delay-4000">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--ff-color-accent-500)] to-[var(--ff-color-primary-600)] rounded-xl flex items-center justify-center shadow-lg">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-[var(--color-text)]">AI Powered</div>
                          <div className="text-xs text-[var(--color-text-muted)]">Smart matching</div>
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
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg">
              <div className="text-4xl font-bold bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] bg-clip-text text-transparent">10K+</div>
              <div className="text-sm text-[var(--color-text-muted)] mt-2 font-medium">Style Reports</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg">
              <div className="text-4xl font-bold bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] bg-clip-text text-transparent">2 min</div>
              <div className="text-sm text-[var(--color-text-muted)] mt-2 font-medium">Gemiddelde tijd</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg">
              <div className="text-4xl font-bold bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] bg-clip-text text-transparent">95%</div>
              <div className="text-sm text-[var(--color-text-muted)] mt-2 font-medium">Tevreden</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg">
              <div className="text-4xl font-bold bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] bg-clip-text text-transparent">100%</div>
              <div className="text-sm text-[var(--color-text-muted)] mt-2 font-medium">Privacy-first</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES BENTO GRID */}
      <section className="ff-section py-24">
        <div className="ff-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-full text-sm font-semibold text-[var(--ff-color-primary-700)] mb-6">
              <Sparkles className="w-4 h-4" />
              Waarom FitFi
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[var(--color-text)] mb-4">
              Nuchter, helder en <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] bg-clip-text text-transparent">zonder gedoe</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">2 minuten, klaar</h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                Geen eindeloze vragenlijsten. Gewoon de basics en je krijgt direct resultaat. We vragen alleen wat echt nodig is: lichaamsbouw, voorkeuren en gelegenheid.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-[var(--ff-color-turquoise)] to-[var(--ff-color-primary-500)] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">Uitleg erbij</h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                Elk outfit komt met reden waarom het bij je past. Geen willekeurige suggesties, maar uitleg over kleuren, silhouetten en waarom iets werkt voor jouw lichaamsbouw.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-[var(--ff-color-accent-500)] to-[var(--ff-color-primary-600)] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">Direct shopbaar</h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                Alle items zijn beschikbaar bij bekende Nederlandse webshops. Links naar Zalando, ASOS, H&M en andere shops die je kent.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">Privacy-first (EU)</h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
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
              <span className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-full text-sm font-medium">⭐ 4.8/5 gemiddeld</span>
              <span className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-full text-sm font-medium">🇳🇱 Nederlandse focus</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-3xl p-8 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
                  M
                </div>
                <div>
                  <p className="text-[var(--color-text)] leading-relaxed mb-3">
                    "Eindelijk stijladvies dat niet overdreven is. Praktisch en echt bruikbaar."
                  </p>
                  <div className="text-sm text-[var(--color-text-muted)] font-medium">— Marieke, 32</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-3xl p-8 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--ff-color-turquoise)] to-[var(--ff-color-primary-500)] rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
                  T
                </div>
                <div>
                  <p className="text-[var(--color-text)] leading-relaxed mb-3">
                    "De uitleg waarom iets bij me past was echt eye-opening. Geen giswerk meer."
                  </p>
                  <div className="text-sm text-[var(--color-text-muted)] font-medium">— Thomas, 28</div>
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-full text-sm font-semibold text-[var(--ff-color-primary-700)] mb-6">
              Proces
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[var(--color-text)]">Hoe het werkt</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">Korte vragenlijst</h3>
              <p className="text-[var(--color-text-muted)]">
                Lichaamsbouw, voorkeuren en waar je de kleding draagt. 2 minuten max.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--ff-color-turquoise)] to-[var(--ff-color-primary-500)] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">AI analyseert</h3>
              <p className="text-[var(--color-text-muted)]">
                Onze AI bepaalt je stijlarchetype en matcht dit met beschikbare items.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--ff-color-accent-500)] to-[var(--ff-color-primary-600)] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">Persoonlijk rapport</h3>
              <p className="text-[var(--color-text-muted)]">
                Je krijgt 6-12 complete outfits met uitleg en directe shoplinks.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">Shop & draag</h3>
              <p className="text-[var(--color-text-muted)]">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-full text-sm font-semibold text-[var(--ff-color-primary-700)] mb-6">
              Vragen
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[var(--color-text)]">Veelgestelde vragen</h2>
          </div>

          <div className="space-y-4">
            <details className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <summary className="font-semibold text-lg text-[var(--color-text)] cursor-pointer">Is het echt gratis?</summary>
              <p className="mt-4 text-[var(--color-text-muted)] leading-relaxed">Ja, het basisrapport is volledig gratis. Je krijgt je stijlarchetype, kleurpalet en 6-8 outfits zonder kosten.</p>
            </details>
            <details className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <summary className="font-semibold text-lg text-[var(--color-text)] cursor-pointer">Hoe accuraat is de AI?</summary>
              <p className="mt-4 text-[var(--color-text-muted)] leading-relaxed">Onze AI is getraind op duizenden stijlcombinaties en houdt rekening met lichaamsbouw, kleurtype en persoonlijke voorkeuren. De meeste gebruikers zijn verrast door de accuratesse.</p>
            </details>
            <details className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <summary className="font-semibold text-lg text-[var(--color-text)] cursor-pointer">Welke winkels worden gebruikt?</summary>
              <p className="mt-4 text-[var(--color-text-muted)] leading-relaxed">We werken samen met bekende Nederlandse webshops zoals Zalando, ASOS, H&M, en anderen. Alle items zijn beschikbaar en leverbaar in Nederland.</p>
            </details>
            <details className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <summary className="font-semibold text-lg text-[var(--color-text)] cursor-pointer">Wat gebeurt er met mijn data?</summary>
              <p className="mt-4 text-[var(--color-text-muted)] leading-relaxed">We verzamelen alleen wat nodig is voor je stijladvies. Je data wordt niet doorverkocht en we houden ons aan alle EU privacy-regels. <NavLink to="/privacy" className="text-[var(--ff-color-primary-600)] hover:underline font-medium">Lees ons privacybeleid</NavLink>.</p>
            </details>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-32 overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-700)] via-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)]">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="ff-container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Klaar om je stijl te ontdekken?
            </h2>
            <p className="text-xl text-white mb-12 leading-relaxed">
              Start nu en krijg binnen 2 minuten je persoonlijke Style Report.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <NavLink
                to="/onboarding"
                className="px-10 py-5 bg-white text-[var(--ff-color-primary-700)] font-bold rounded-2xl shadow-2xl hover:shadow-xl transition-all duration-200 hover:scale-105 text-lg"
                data-event="cta_start_free_footer"
              >
                Start gratis Style Report
              </NavLink>
              <NavLink
                to="/results"
                className="px-10 py-5 bg-transparent text-white font-bold border-2 border-white rounded-2xl hover:bg-white hover:text-[var(--ff-color-primary-700)] transition-all duration-200 text-lg"
                data-event="cta_view_example_footer"
              >
                Bekijk voorbeeld
              </NavLink>
            </div>
            <p className="text-white text-sm mt-10 flex items-center justify-center gap-6">
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Geen creditcard nodig
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                100% Privacy-first
              </span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
