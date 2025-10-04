import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Check, Target, Heart, Users, Sparkles, ArrowRight, Star } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>Over FitFi - Persoonlijk AI Stijladvies | Nederlandse Startup</title>
        <meta name="description" content="Ontdek het verhaal achter FitFi. Van frustratie over dure stylisten tot AI-gedreven stijladvies voor iedereen. Nederlandse startup met menselijke expertise." />
      </Helmet>

      {/* Hero Section */}
      <section className="about-hero-section relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="about-hero-bg absolute inset-0"></div>
        <div className="about-floating-orb about-floating-orb-1"></div>
        <div className="about-floating-orb about-floating-orb-2"></div>
        <div className="about-floating-orb about-floating-orb-3"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Premium Badge */}
          <div className="about-premium-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Nederlandse AI Startup</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Wij maken{' '}
            <span className="about-gradient-text">persoonlijk stijladvies</span>{' '}
            toegankelijk voor iedereen
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            FitFi ontstond uit frustratie over dure personal stylists en generieke mode-apps. 
            Wij geloven dat iedereen recht heeft op stijladvies dat echt bij hen past.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>100% Privacy-first</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Nederlandse startup</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>AI + menselijke expertise</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Onze Missie & Waarden</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Persoonlijk stijladvies democratiseren door AI en menselijke expertise te combineren.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Mission Card */}
            <div className="about-mission-card about-mission-card-primary">
              <div className="about-mission-icon">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Onze Missie</h3>
              <p className="text-gray-600 mb-4">
                Persoonlijk stijladvies democratiseren door AI en menselijke expertise te combineren. 
                Geen dure stylists meer nodig - iedereen verdient toegang tot professioneel stijladvies.
              </p>
            </div>

            {/* Values Card */}
            <div className="about-mission-card">
              <div className="about-mission-icon">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Onze Waarden</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="about-values-item">Privacy en transparantie eerst</li>
                <li className="about-values-item">Toegankelijk voor iedereen</li>
                <li className="about-values-item">Authentieke stijl, geen trends</li>
                <li className="about-values-item">Duurzame keuzes stimuleren</li>
              </ul>
            </div>

            {/* Team Card */}
            <div className="about-mission-card">
              <div className="about-mission-icon">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Ons Team</h3>
              <p className="text-gray-600">
                Een mix van AI-experts, stylisten en UX-designers uit Nederland. 
                Wij begrijpen de Nederlandse markt en maken producten die echt werken.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ons Verhaal</h2>
            <p className="text-lg text-gray-600">Van idee tot AI-stylist in 18 maanden</p>
          </div>

          <div className="about-timeline">
            <div className="about-timeline-line"></div>
            
            {/* Timeline Items */}
            <div className="about-timeline-item">
              <div className="about-timeline-marker">
                <span className="about-timeline-year">2023</span>
              </div>
              <div className="about-timeline-content">
                <h3 className="text-xl font-bold mb-2">Het Begin</h3>
                <p className="text-gray-600">
                  Frustratie over dure personal stylists (€150+ per uur) en generieke mode-apps 
                  die niet begrijpen wat echt bij je past.
                </p>
              </div>
            </div>

            <div className="about-timeline-item">
              <div className="about-timeline-marker">
                <span className="about-timeline-year">Q1 '24</span>
              </div>
              <div className="about-timeline-content">
                <h3 className="text-xl font-bold mb-2">Eerste Prototype</h3>
                <p className="text-gray-600">
                  AI-model getraind op duizenden outfit-combinaties en stijlprofielen. 
                  Focus op Nederlandse voorkeuren en merken.
                </p>
              </div>
            </div>

            <div className="about-timeline-item">
              <div className="about-timeline-marker">
                <span className="about-timeline-year">Q3 '24</span>
              </div>
              <div className="about-timeline-content">
                <h3 className="text-xl font-bold mb-2">Beta Launch</h3>
                <p className="text-gray-600">
                  500+ beta-gebruikers testen het platform. 92% tevredenheid en 
                  waardevolle feedback voor verdere ontwikkeling.
                </p>
              </div>
            </div>

            <div className="about-timeline-item">
              <div className="about-timeline-marker">
                <span className="about-timeline-year">Nu</span>
              </div>
              <div className="about-timeline-content">
                <h3 className="text-xl font-bold mb-2">Publieke Launch</h3>
                <p className="text-gray-600">
                  FitFi is live! Gratis AI Style Reports voor iedereen, 
                  met premium features voor wie meer wil.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">FitFi in Cijfers</h2>
            <p className="text-lg text-gray-600">Onze impact tot nu toe</p>
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
              <div className="text-gray-600">Maanden Ontwikkeling</div>
            </div>
            <div className="about-stats-card text-center">
              <div className="about-stats-number">100%</div>
              <div className="text-gray-600">Nederlands</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section relative py-20 overflow-hidden">
        <div className="about-cta-bg absolute inset-0"></div>
        <div className="about-cta-orb"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Klaar om jouw perfecte stijl te ontdekken?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Start vandaag nog met je gratis AI Style Report en ontdek outfits die perfect bij je passen.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="about-cta-button-primary">
              <span>Start Gratis Style Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="about-cta-button-secondary">
              <Star className="w-4 h-4" />
              <span>Bekijk Voorbeelden</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Altijd gratis te starten</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Geen verplichtingen</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Direct resultaat</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}