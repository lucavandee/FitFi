import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Target, Heart, Users, CheckCircle, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>Over Ons - FitFi</title>
        <meta name="description" content="Leer meer over FitFi's missie om persoonlijk stijladvies toegankelijk te maken voor iedereen door AI en menselijke expertise te combineren." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb-1 absolute w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="floating-orb-2 absolute w-80 h-80 bg-gradient-to-r from-turquoise-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
          <div className="floating-orb-3 absolute w-64 h-64 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-sm font-medium text-gray-700 mb-8">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Over FitFi
            </div>

            <h1 className="text-4xl md:text-6xl font-bold font-montserrat text-gray-900 mb-6">
              Wij maken{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                persoonlijk stijladvies
              </span>{' '}
              toegankelijk voor iedereen
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              FitFi ontstond uit frustratie over dure personal stylists en generieke mode-apps. 
              Wij geloven dat iedereen recht heeft op stijladvies dat echt bij hen past.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                100% Privacy-first
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Nederlandse startup
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                AI + menselijke expertise
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Onze Missie */}
            <div className="mission-card border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold font-montserrat text-gray-900 mb-4">Onze Missie</h3>
              <p className="text-gray-600 leading-relaxed">
                Persoonlijk stijladvies democratiseren door AI en menselijke expertise te combineren. 
                Geen dure stylists meer nodig - iedereen verdient toegang tot professioneel stijladvies.
              </p>
            </div>

            {/* Onze Waarden */}
            <div className="mission-card border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold font-montserrat text-gray-900 mb-4">Onze Waarden</h3>
              <div className="space-y-2 text-gray-600">
                <p>Privacy en transparantie eerst</p>
                <p>Toegankelijk voor iedereen</p>
                <p>Authentieke stijl, geen trends</p>
                <p>Duurzame keuzes stimuleren</p>
              </div>
            </div>

            {/* Ons Team */}
            <div className="mission-card border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold font-montserrat text-gray-900 mb-4">Ons Team</h3>
              <p className="text-gray-600 leading-relaxed">
                Een mix van AI-experts, stylisten en UX-designers uit Nederland. 
                Wij begrijpen de Nederlandse markt en maken producten die écht werken.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-gray-900 mb-4">
              Ons Verhaal
            </h2>
            <p className="text-xl text-gray-600">Van idee tot AI-stylist in 18 maanden</p>
          </div>

          <div className="timeline-container relative">
            {/* Timeline line */}
            <div className="timeline-line absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-200 via-purple-200 to-green-200 rounded-full hidden md:block"></div>

            <div className="space-y-12">
              {/* 2023 - Het Begin */}
              <div className="timeline-item flex items-center">
                <div className="md:w-1/2 md:pr-8 text-right">
                  <div className="timeline-card border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white">
                    <div className="text-sm font-medium text-blue-600 mb-2">2023</div>
                    <h3 className="text-lg font-bold font-montserrat text-gray-900 mb-2">Het Begin</h3>
                    <p className="text-gray-600 text-sm">
                      Frustratie over dure personal stylists (€150+ per uur) en generieke mode-apps die niet begrijpen wat écht bij je past.
                    </p>
                  </div>
                </div>
                <div className="timeline-marker hidden md:flex w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                <div className="md:w-1/2 md:pl-8"></div>
              </div>

              {/* Q1 '24 - Eerste Prototype */}
              <div className="timeline-item flex items-center">
                <div className="md:w-1/2 md:pr-8"></div>
                <div className="timeline-marker hidden md:flex w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                <div className="md:w-1/2 md:pl-8">
                  <div className="timeline-card border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white">
                    <div className="text-sm font-medium text-purple-600 mb-2">Q1 '24</div>
                    <h3 className="text-lg font-bold font-montserrat text-gray-900 mb-2">Eerste Prototype</h3>
                    <p className="text-gray-600 text-sm">
                      AI-model getraind op duizenden outfit-combinaties en stijlprofielen. Focus op Nederlandse voorkeuren en merken.
                    </p>
                  </div>
                </div>
              </div>

              {/* Q3 '24 - Beta Launch */}
              <div className="timeline-item flex items-center">
                <div className="md:w-1/2 md:pr-8 text-right">
                  <div className="timeline-card border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white">
                    <div className="text-sm font-medium text-green-600 mb-2">Q3 '24</div>
                    <h3 className="text-lg font-bold font-montserrat text-gray-900 mb-2">Beta Launch</h3>
                    <p className="text-gray-600 text-sm">
                      500+ beta-gebruikers testen het platform. 92% tevredenheid en waardevolle feedback voor verdere ontwikkeling.
                    </p>
                  </div>
                </div>
                <div className="timeline-marker hidden md:flex w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                <div className="md:w-1/2 md:pl-8"></div>
              </div>

              {/* Nu - Publieke Launch */}
              <div className="timeline-item flex items-center">
                <div className="md:w-1/2 md:pr-8"></div>
                <div className="timeline-marker hidden md:flex w-4 h-4 bg-gradient-to-r from-blue-500 to-turquoise-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                <div className="md:w-1/2 md:pl-8">
                  <div className="timeline-card border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white">
                    <div className="text-sm font-medium text-turquoise-600 mb-2">Nu</div>
                    <h3 className="text-lg font-bold font-montserrat text-gray-900 mb-2">Publieke Launch</h3>
                    <p className="text-gray-600 text-sm">
                      FitFi is live! Gratis AI Style Reports voor iedereen, met premium features voor wie meer wil.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="stats-card text-center border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl font-bold font-montserrat bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                500+
              </div>
              <p className="text-gray-600">Beta gebruikers</p>
            </div>
            <div className="stats-card text-center border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl font-bold font-montserrat bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                92%
              </div>
              <p className="text-gray-600">Tevredenheid</p>
            </div>
            <div className="stats-card text-center border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl font-bold font-montserrat bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                18
              </div>
              <p className="text-gray-600">Maanden ontwikkeling</p>
            </div>
            <div className="stats-card text-center border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl font-bold font-montserrat bg-gradient-to-r from-turquoise-600 to-blue-600 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <p className="text-gray-600">Privacy-first</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-turquoise-500 overflow-hidden">
        {/* Rotating background orb */}
        <div className="cta-orb absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-white mb-6">
            Klaar om jouw perfecte stijl te ontdekken?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Begin gratis met je AI Style Report en ontdek wat écht bij jou past.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/quiz"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Start Gratis Quiz
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all duration-300"
            >
              Bekijk Prijzen
            </a>
          </div>
        </div>
      </section>
    </>
  );
}