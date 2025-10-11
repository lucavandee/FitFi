import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { CircleCheck as CheckCircle, Sparkles, Target, Zap, Clock, Shield, ArrowRight } from "lucide-react";

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
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-primary-25)] py-24 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--ff-color-primary-100)] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--ff-color-accent-100)] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>

        <div className="ff-container relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-8 leading-tight">
              Zo werkt jouw
              <span className="block text-[var(--ff-color-primary-600)]">AI Style Report</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              In 3 eenvoudige stappen van persoonlijkheidsquiz naar gepersonaliseerde outfits. Geen gedoe, wel resultaat.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="ff-container">
          <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">

            {/* Step 1 */}
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center">
                  <Target className="w-7 h-7 text-[var(--ff-color-primary-600)]" />
                </div>
                <div className="text-4xl font-bold text-gray-600">01</div>
              </div>

              <h3 className="text-2xl font-bold mb-3">Persoonlijkheidsquiz</h3>
              <p className="text-gray-600 mb-6">
                Beantwoord 8-12 vragen over je lifestyle, voorkeuren en persoonlijkheid.
                Onze AI analyseert je antwoorden om je unieke stijlprofiel te bepalen.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>Geen foto's nodig</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>Privacy-vriendelijk</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>90 seconden</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center">
                  <Zap className="w-7 h-7 text-[var(--ff-color-primary-600)]" />
                </div>
                <div className="text-4xl font-bold text-gray-600">02</div>
              </div>

              <h3 className="text-2xl font-bold mb-3">AI Analyse</h3>
              <p className="text-gray-600 mb-6">
                Onze geavanceerde AI combineert je antwoorden met stijldata van duizenden outfits
                om jouw perfecte stijlarchetype en kleurenpalet te bepalen.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>Geavanceerde algoritmes</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>Realtime processing</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>30 seconden</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-[var(--ff-color-primary-600)]" />
                </div>
                <div className="text-4xl font-bold text-gray-600">03</div>
              </div>

              <h3 className="text-2xl font-bold mb-3">Jouw Style Report</h3>
              <p className="text-gray-600 mb-6">
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
      <section className="py-20 bg-[var(--color-surface)]/30">
        <div className="ff-container">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Wat krijg je in je <span className="text-[var(--ff-color-primary-600)]">Style Report</span>?
            </h2>
            <p className="text-xl text-gray-600">
              Een compleet overzicht van jouw unieke stijl en hoe je die kunt toepassen
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)]">
              <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Stijlarchetype</h3>
              <p className="text-gray-600">
                Je unieke stijlpersoonlijkheid met uitgebreide uitleg over wat dit betekent voor je kledingkeuzes.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)]">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] mb-4"></div>
              <h3 className="text-xl font-bold mb-2">Kleurenpalet</h3>
              <p className="text-gray-600">
                Jouw perfecte kleuren die je huid laten stralen en je persoonlijkheid versterken.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)]">
              <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Complete Outfits</h3>
              <p className="text-gray-600">
                6-12 volledige looks voor verschillende gelegenheden, van casual tot formeel.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)]">
              <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Shoplinks</h3>
              <p className="text-gray-600">
                Directe links naar alle items zodat je meteen kunt shoppen wat bij je past.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)]">
              <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Styling Tips</h3>
              <p className="text-gray-600">
                Praktische tips over hoe je items combineert en je stijl verder ontwikkelt.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)]">
              <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Privacy-First</h3>
              <p className="text-gray-600">
                Geen foto's nodig, geen persoonlijke data opgeslagen. Jouw privacy staat voorop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="ff-container">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-[var(--radius-2xl)] p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Klaar voor jouw <span className="text-[var(--ff-color-primary-600)]">Style Report</span>?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start nu en ontdek binnen 2 minuten welke stijl perfect bij je past.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <NavLink
                to="/onboarding"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
                data-event="cta_start_free_how_it_works"
              >
                <Sparkles className="w-5 h-5" />
                Start gratis Style Report
              </NavLink>

              <NavLink
                to="/results"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--color-surface)] transition-colors"
                data-event="cta_view_example_how_it_works"
              >
                Bekijk voorbeeldrapport
                <ArrowRight className="w-5 h-5" />
              </NavLink>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                <span>100% Gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                <span>Geen account nodig</span>
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
