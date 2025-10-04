import React from 'react';
import { Sparkles, Target, Heart, Users, CircleCheck as CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="about-hero relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50 py-20">
        {/* Floating Orbs */}
        <div className="about-orb about-orb-1"></div>
        <div className="about-orb about-orb-2"></div>
        <div className="about-orb about-orb-3"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="about-premium-badge inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Premium AI Styling</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Wij maken <span className="about-gradient-text">persoonlijk stijladvies</span> toegankelijk voor iedereen
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            FitFi ontstond uit frustratie over dure personal stylists en generieke mode-apps. Wij geloven dat iedereen recht heeft op stijladvies dat echt bij hen past.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">100% Privacy-first</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Nederlandse startup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">AI + menselijke expertise</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Onze Missie & Waarden
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We democratiseren stijladvies door AI en menselijke expertise te combineren
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Mission Card */}
            <div className="about-mission-card about-mission-primary group">
              <div className="about-mission-icon">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Onze Missie</h3>
              <p className="text-white/90 mb-6">
                Persoonlijk stijladvies democratiseren door AI en menselijke expertise te combineren. Geen dure stylists meer nodig - iedereen verdient toegang tot professioneel stijladvies.
              </p>
            </div>

            {/* Values Card */}
            <div className="about-mission-card group">
              <div className="about-mission-icon">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Onze Waarden</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="about-values-item">Privacy en transparantie eerst</li>
                <li className="about-values-item">Toegankelijk voor iedereen</li>
                <li className="about-values-item">Authentieke stijl, geen trends</li>
                <li className="about-values-item">Duurzame keuzes stimuleren</li>
              </ul>
            </div>

            {/* Team Card */}
            <div className="about-mission-card group">
              <div className="about-mission-icon">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ons Team</h3>
              <p className="text-gray-600">
                Een mix van AI-experts, stylisten en UX-designers uit Nederland. Wij begrijpen de Nederlandse markt en maken producten die echt werken.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ons Verhaal
            </h2>
            <p className="text-xl text-gray-600">
              Van idee tot AI-stylist in 18 maanden
            </p>
          </div>
          
          <div className="about-timeline">
            <div className="about-timeline-line"></div>
            
            <div className="about-timeline-item">
              <div className="about-timeline-marker">
                <span className="about-timeline-year">2023</span>
              </div>
              <div className="about-timeline-content">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Het Begin</h3>
                <p className="text-gray-600">
                  Frustratie over dure personal stylists (€150+ per uur) en generieke mode-apps die niet begrijpen wat echt bij je past.
                </p>
              </div>
            </div>

            <div className="about-timeline-item">
              <div className="about-timeline-marker">
                <span className="about-timeline-year">Q1 '24</span>
              </div>
              <div className="about-timeline-content">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Eerste Prototype</h3>
                <p className="text-gray-600">
                  AI-model getraind op duizenden outfit-combinaties en stijlprofielen. Focus op Nederlandse voorkeuren en merken.
                </p>
              </div>
            </div>

            <div className="about-timeline-item">
              <div className="about-timeline-marker">
                <span className="about-timeline-year">Q3 '24</span>
              </div>
              <div className="about-timeline-content">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Beta Launch</h3>
                <p className="text-gray-600">
                  500+ beta-gebruikers testen het platform. 92% tevredenheid en waardevolle feedback voor verdere ontwikkeling.
                </p>
              </div>
            </div>

            <div className="about-timeline-item">
              <div className="about-timeline-marker">
                <span className="about-timeline-year">Nu</span>
              </div>
              <div className="about-timeline-content">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Publieke Launch</h3>
                <p className="text-gray-600">
                  FitFi is live! Gratis AI Style Reports voor iedereen, met premium features voor wie meer wil.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              FitFi in Cijfers
            </h2>
            <p className="text-xl text-gray-600">
              Resultaten waar we trots op zijn
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="about-stats-card text-center">
              <div className="about-stats-number">2.000+</div>
              <div className="text-gray-600">Style Reports</div>
            </div>
            <div className="about-stats-card text-center">
              <div className="about-stats-number">92%</div>
              <div className="text-gray-600">Tevredenheid</div>
            </div>
            <div className="about-stats-card text-center">
              <div className="about-stats-number">18</div>
              <div className="text-gray-600">Maanden ontwikkeling</div>
            </div>
            <div className="about-stats-card text-center">
              <div className="about-stats-number">100%</div>
              <div className="text-gray-600">Privacy-first</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section relative overflow-hidden py-20">
        <div className="about-cta-orb"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Klaar voor jouw persoonlijke stijladvies?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Ontdek wat echt bij je past met onze gratis AI Style Report. Geen verplichtingen, wel resultaten.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="about-cta-primary">
              Start Gratis Style Quiz
            </button>
            <button className="about-cta-secondary">
              Bekijk Voorbeelden
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>100% Gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>5 minuten</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Direct resultaat</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}