import React from 'react';
import { Target, Heart, Users } from 'lucide-react';
import Container from '@/components/import { Users, Target, Heart, Sparkles, CircleCheck as CheckCircle, ArrowRight } from "lucide-react"outPage() {
  return (
    <>
      <Seo 
        title="Over Ons - FitFi"
        description="Leer meer over FitFi's missie om persoonlijk stijladvies toegankelijk te maken voor iedereen."
      />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="floating-orb absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-xl"></div>
          <div className="floating-orb-delayed absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-teal-400/20 to-blue-400/20 rounded-full blur-xl"></div>
          <div className="floating-orb absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-emerald-400/20 rounded-full blur-xl"></div>
        </div>

        <Container className="relative z-10 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 mb-6">
            <span className="text-sm font-medium text-gray-600">🇳🇱 Nederlandse startup</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Wij maken persoonlijk stijladvies toegankelijk voor iedereen
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            FitFi ontstond uit frustratie over dure personal stylists en generieke mode-apps. Wij geloven dat iedereen recht heeft op stijladvies dat echt bij hen past.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            <div className="flex items-center gap-2 text-emerald-600">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
              </div>
              <span className="text-sm font-medium">100% Privacy-first</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
              </div>
              <span className="text-sm font-medium">Nederlandse startup</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
              </div>
              <span className="text-sm font-medium">AI + menselijke expertise</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="mission-card bg-white rounded-2xl p-8 border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Onze Missie</h3>
              <p className="text-gray-600 leading-relaxed">
                Persoonlijk stijladvies democratiseren door AI en menselijke expertise te combineren. Geen dure stylists meer nodig - iedereen verdient toegang tot professioneel stijladvies.
              </p>
            </div>

            <div className="mission-card bg-white rounded-2xl p-8 border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Onze Waarden</h3>
              <div className="space-y-2 text-gray-600">
                <p>Privacy en transparantie eerst</p>
                <p>Toegankelijk voor iedereen</p>
                <p>Authentieke stijl, geen trends</p>
                <p>Duurzame keuzes stimuleren</p>
              </div>
            </div>

            <div className="mission-card bg-white rounded-2xl p-8 border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ons Team</h3>
              <p className="text-gray-600 leading-relaxed">
                Een mix van AI-experts, stylisten en UX-designers uit Nederland. Wij begrijpen de Nederlandse markt en maken producten die écht werken.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ons Verhaal</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Van idee tot AI-stylist in 18 maanden
            </p>
          </div>

          <div className="timeline-container max-w-4xl mx-auto">
            <div className="timeline-item">
              <div className="timeline-marker">
                <div className="timeline-dot"></div>
              </div>
              <div className="timeline-content">
                <div className="timeline-date">2023</div>
                <h3 className="timeline-title">Het Begin</h3>
                <p className="timeline-description">
                  Frustratie over dure personal stylists (€150+ per uur) en generieke mode-apps die niet begrijpen wat écht bij je past.
                </p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker">
                <div className="timeline-dot"></div>
              </div>
              <div className="timeline-content">
                <div className="timeline-date">Q1 '24</div>
                <h3 className="timeline-title">Eerste Prototype</h3>
                <p className="timeline-description">
                  AI-model getraind op duizenden outfit-combinaties en stijlprofielen. Focus op Nederlandse voorkeuren en merken.
                </p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker">
                <div className="timeline-dot"></div>
              </div>
              <div className="timeline-content">
                <div className="timeline-date">Q3 '24</div>
                <h3 className="timeline-title">Beta Launch</h3>
                <p className="timeline-description">
                  500+ beta-gebruikers testen het platform. 92% tevredenheid en waardevolle feedback voor verdere ontwikkeling.
                </p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker">
                <div className="timeline-dot active"></div>
              </div>
              <div className="timeline-content">
                <div className="timeline-date">Nu</div>
                <h3 className="timeline-title">Publieke Launch</h3>
                <p className="timeline-description">
                  FitFi is live! Gratis AI Style Reports voor iedereen, met premium features voor wie meer wil.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="stats-card text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="stats-number text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                18
              </div>
              <div className="text-gray-600 font-medium">Maanden ontwikkeling</div>
            </div>

            <div className="stats-card text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="stats-number text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
                500+
              </div>
              <div className="text-gray-600 font-medium">Beta gebruikers</div>
            </div>

            <div className="stats-card text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="stats-number text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                92%
              </div>
              <div className="text-gray-600 font-medium">Tevredenheid</div>
            </div>

            <div className="stats-card text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="stats-number text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-gray-600 font-medium">Privacy-first</div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 overflow-hidden">
        {/* Rotating background orb */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="cta-orb absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <Container className="relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Klaar om jouw perfecte stijl te ontdekken?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Start vandaag nog met je gratis AI Style Report en ontdek outfits die perfect bij jou passen.
          </p>
          <a
            href="/quiz"
            className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Start Gratis Style Quiz
          </a>
        </Container>
      </section>
    </>
  );
}