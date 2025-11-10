import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { CircleCheck as CheckCircle, Sparkles, Target, Zap, Clock, Shield } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Hoe het werkt - AI Style Report in 3 stappen | FitFi</title>
        <meta
          name="description"
          content="Ontdek hoe FitFi in 3 eenvoudige stappen jouw persoonlijke AI Style Report maakt. Van quiz tot outfits in 2 minuten."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[var(--color-bg)] py-24 md:py-32">
        <div className="ff-container relative">
          <div className="max-w-4xl mx-auto text-center fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-surface)] backdrop-blur-sm rounded-full text-sm font-bold text-[var(--ff-color-primary-700)] mb-8 shadow-lg border border-[var(--color-border)]">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
              Zo werkt het
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-8 leading-tight">
              Van quiz naar outfits{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
                  in 2 minuten
                </span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-[var(--color-muted)] mb-12 max-w-3xl mx-auto leading-relaxed">
              In 3 eenvoudige stappen van persoonlijkheidsquiz naar gepersonaliseerde outfits. Geen gedoe, wel resultaat.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-[var(--color-surface)]">
        <div className="ff-container">
          <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3 stagger-fade-in">

            {/* Step 1 */}
            <div className="bg-[var(--color-bg)] rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-8 shadow-[var(--shadow-soft)] hover-lift card-interactive">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center">
                  <Target className="w-7 h-7 text-[var(--ff-color-primary-600)]" />
                </div>
                <div className="text-4xl font-bold text-gray-600">01</div>
              </div>

              <h3 className="text-2xl font-bold mb-3 text-[var(--color-text)]">Persoonlijkheidsquiz</h3>
              <p className="text-[var(--color-muted)] mb-6">
                Beantwoord 8-12 vragen over je lifestyle, voorkeuren en persoonlijkheid.
                Onze AI analyseert je antwoorden om je unieke stijlprofiel te bepalen.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span className="text-[var(--color-text)]">Geen foto's nodig</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span className="text-[var(--color-text)]">Privacy-vriendelijk</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span className="text-[var(--color-text)]">Binnen 2 min</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[var(--color-bg)] rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-8 shadow-[var(--shadow-soft)] hover-lift card-interactive">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center">
                  <Zap className="w-7 h-7 text-[var(--ff-color-primary-600)]" />
                </div>
                <div className="text-4xl font-bold text-gray-600">02</div>
              </div>

              <h3 className="text-2xl font-bold mb-3 text-[var(--color-text)]">AI Analyse</h3>
              <p className="text-[var(--color-muted)] mb-6">
                Onze AI combineert je antwoorden met stijldata
                om jouw stijlarchetype en kleurenpalet te bepalen.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>Smart matching</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>Direct verwerkt</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>Helder resultaat</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[var(--color-bg)] rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-8 shadow-[var(--shadow-soft)] hover-lift card-interactive">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-[var(--ff-color-primary-600)]" />
                </div>
                <div className="text-4xl font-bold text-gray-600">03</div>
              </div>

              <h3 className="text-2xl font-bold mb-3 text-[var(--color-text)]">Jouw Style Report</h3>
              <p className="text-[var(--color-muted)] mb-6">
                Ontvang direct je persoonlijke rapport met stijlarchetype, kleurenpalet,
                6-12 complete outfits en uitleg waarom elk item bij je past.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>6-12 complete outfits</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>Directe shoplinks</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>Uitleg per item</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 bg-[var(--color-bg)]">
        <div className="ff-container">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--color-text)]">
              Wat krijg je in je <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">Style Report</span>?
            </h2>
            <p className="text-xl text-[var(--color-muted)]">
              Een compleet overzicht van jouw unieke stijl en hoe je die kunt toepassen
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-fade-in">
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)] hover-lift">
              <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[var(--color-text)]">Stijlarchetype</h3>
              <p className="text-[var(--color-muted)]">
                Je unieke stijlpersoonlijkheid met uitgebreide uitleg over wat dit betekent voor je kledingkeuzes.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)] hover-lift">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] mb-4"></div>
              <h3 className="text-xl font-bold mb-2 text-[var(--color-text)]">Kleurenpalet</h3>
              <p className="text-[var(--color-muted)]">
                Jouw perfecte kleuren die je huid laten stralen en je persoonlijkheid versterken.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)] hover-lift">
              <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[var(--color-text)]">Complete Outfits</h3>
              <p className="text-[var(--color-muted)]">
                6-12 volledige looks voor verschillende gelegenheden, van casual tot formeel.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)] hover-lift">
              <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[var(--color-text)]">Shoplinks</h3>
              <p className="text-[var(--color-muted)]">
                Directe links naar alle items zodat je meteen kunt shoppen wat bij je past.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)] hover-lift">
              <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[var(--color-text)]">Styling Tips</h3>
              <p className="text-[var(--color-muted)]">
                Praktische tips over hoe je items combineert en je stijl verder ontwikkelt.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)] hover-lift">
              <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[var(--color-text)]">Privacy-First</h3>
              <p className="text-[var(--color-muted)]">
                Geen foto's nodig, geen persoonlijke data opgeslagen. Jouw privacy staat voorop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[var(--color-surface)]">
        <div className="ff-container">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-[var(--radius-2xl)] p-12 text-center shadow-xl hover-lift">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--color-text)]">
              Klaar voor jouw <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">Style Report</span>?
            </h2>
            <p className="text-xl text-[var(--color-muted)] mb-8">
              Start nu en ontdek binnen 2 minuten welke stijl perfect bij je past.
            </p>

            <NavLink
              to="/onboarding"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-700)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-600)] transition-all shadow-lg hover-lift focus-ring-premium mb-8"
              data-event="cta_start_free_how_it_works"
            >
              <Sparkles className="w-5 h-5" />
              Start gratis Style Report
            </NavLink>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-[var(--color-muted)]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                <span>100% Gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                <span>Direct resultaat</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
