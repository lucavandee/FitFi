import React from 'react';
import { Target, Heart, Users } from 'lucide-react';
import Container from '@/components/layout/Container';

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-20 overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-teal-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full text-emerald-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              Over FitFi
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Wij maken persoonlijk stijladvies{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                toegankelijk voor iedereen
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              FitFi ontstond uit frustratie over dure personal stylists en generieke mode-apps. 
              Wij geloven dat iedereen recht heeft op stijladvies dat echt bij hen past.
            </p>
            
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                100% Privacy-first
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Nederlandse startup
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                AI + menselijke expertise
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Mission Cards */}
      <section className="py-20 bg-white">
        <Container>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="mission-card bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Onze Missie</h3>
              <p className="text-gray-600 leading-relaxed">
                Persoonlijk stijladvies democratiseren door AI en menselijke expertise te combineren. 
                Geen dure stylists meer nodig - iedereen verdient toegang tot professioneel stijladvies.
              </p>
            </div>

            <div className="mission-card bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Onze Waarden</h3>
              <div className="space-y-2 text-gray-600">
                <p>Privacy en transparantie eerst</p>
                <p>Toegankelijk voor iedereen</p>
                <p>Authentieke stijl, geen trends</p>
                <p>Duurzame keuzes stimuleren</p>
              </div>
            </div>

            <div className="mission-card bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ons Team</h3>
              <p className="text-gray-600 leading-relaxed">
                Een mix van AI-experts, stylisten en UX-designers uit Nederland. 
                Wij begrijpen de Nederlandse markt en maken producten die écht werken.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ons Verhaal</h2>
            <p className="text-xl text-gray-600">Van idee tot AI-stylist in 18 maanden</p>
          </div>

          <div className="timeline-container max-w-4xl mx-auto">
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-date">2023</div>
                <h3 className="timeline-title">Het Begin</h3>
                <p className="timeline-description">
                  Frustratie over dure personal stylists (€150+ per uur) en generieke mode-apps die niet begrijpen wat écht bij je past.
                </p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-date">Q1 '24</div>
                <h3 className="timeline-title">Eerste Prototype</h3>
                <p className="timeline-description">
                  AI-model getraind op duizenden outfit-combinaties en stijlprofielen. Focus op Nederlandse voorkeuren en merken.
                </p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-date">Q3 '24</div>
                <h3 className="timeline-title">Beta Launch</h3>
                <p className="timeline-description">
                  500+ beta-gebruikers testen het platform. 92% tevredenheid en waardevolle feedback voor verdere ontwikkeling.
                </p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker active"></div>
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

      {/* Stats */}
      <section className="py-20 bg-white">
        <Container>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="stats-card">
              <div className="stats-number">500+</div>
              <div className="stats-label">Beta gebruikers</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">92%</div>
              <div className="stats-label">Tevredenheid</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">10k+</div>
              <div className="stats-label">Outfit combinaties</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">18</div>
              <div className="stats-label">Maanden ontwikkeling</div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-spin-slow"></div>
        
        <Container>
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              Klaar om je perfecte stijl te ontdekken?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Start vandaag nog met je gratis AI Style Report
            </p>
            <a
              href="/quiz"
              className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Start je Style Quiz
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}