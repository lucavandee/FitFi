import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Heart, Users, Target, Award, Zap } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Over FitFi - Jouw AI-Powered Stijlassistent</title>
        <meta name="description" content="Ontdek het verhaal achter FitFi. Wij helpen je jouw perfecte stijl te ontdekken met AI-technologie en persoonlijke styling." />
        <meta property="og:title" content="Over FitFi - Jouw AI-Powered Stijlassistent" />
        <meta property="og:description" content="Ontdek het verhaal achter FitFi. Wij helpen je jouw perfecte stijl te ontdekken met AI-technologie en persoonlijke styling." />
      </Helmet>

      <div className="min-h-screen bg-[var(--color-bg)]">
        {/* Hero Section - Exact zoals homepage */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
          {/* Decorative circles - exact zoals homepage */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            {/* Badge - exact zoals homepage */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200/50 shadow-lg mb-8">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">Over FitFi</span>
            </div>

            {/* Title - exact zoals homepage */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                Jouw perfecte stijl
              </span>
              <br />
              <span className="text-gray-900">begint hier</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Wij geloven dat iedereen een unieke stijl heeft. Met AI-technologie en persoonlijke begeleiding 
              helpen wij je jouw perfecte look te ontdekken.
            </p>

            {/* Stats - zoals homepage social proof */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">10K+</div>
                <div className="text-sm text-gray-600">Tevreden gebruikers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">50K+</div>
                <div className="text-sm text-gray-600">Outfits gecreëerd</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">98%</div>
                <div className="text-sm text-gray-600">Tevredenheid</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Onze missie
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Wij maken stijl toegankelijk voor iedereen door de kracht van AI te combineren 
                met persoonlijke begeleiding en expertise.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Waarom FitFi?
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Mode kan overweldigend zijn. Met duizenden opties en trends die constant veranderen, 
                  is het moeilijk om te weten wat bij jou past. Wij geloven dat technologie dit kan 
                  vereenvoudigen zonder de persoonlijke touch te verliezen.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Door AI te combineren met echte stijlexpertise, creëren wij een unieke ervaring 
                  die jouw persoonlijke stijl naar boven brengt.
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">AI-Powered</div>
                    <div className="text-sm text-gray-600">Slimme aanbevelingen</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="text-2xl font-bold text-teal-600">Persoonlijk</div>
                    <div className="text-sm text-gray-600">Op maat gemaakt</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Onze waarden
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Deze kernwaarden sturen alles wat wij doen en bouwen.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Inclusiviteit</h3>
                <p className="text-gray-600 leading-relaxed">
                  Stijl is voor iedereen. Wij geloven dat elke persoon, ongeacht achtergrond, 
                  lichaam of budget, recht heeft op het ontdekken van hun perfecte stijl.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Precisie</h3>
                <p className="text-gray-600 leading-relaxed">
                  Onze AI-algoritmes worden continu verfijnd om de meest accurate en 
                  persoonlijke aanbevelingen te geven die echt bij jou passen.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Kwaliteit</h3>
                <p className="text-gray-600 leading-relaxed">
                  Wij werken alleen met betrouwbare merken en retailers om ervoor te zorgen 
                  dat elke aanbeveling van hoge kwaliteit is.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Ons team
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Een gepassioneerd team van technologie- en mode-experts die geloven in de kracht van persoonlijke stijl.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Users className="w-16 h-16 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sarah van der Berg</h3>
                <p className="text-emerald-600 font-medium mb-3">CEO & Founder</p>
                <p className="text-gray-600 text-sm">
                  Voormalig stylist met 10+ jaar ervaring in de mode-industrie. 
                  Gepassioneerd over het democratiseren van stijladvies.
                </p>
              </div>

              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Zap className="w-16 h-16 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mark Janssen</h3>
                <p className="text-teal-600 font-medium mb-3">CTO</p>
                <p className="text-gray-600 text-sm">
                  AI-expert met achtergrond in machine learning en computer vision. 
                  Bouwt de technologie die jouw perfecte stijl ontdekt.
                </p>
              </div>

              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Heart className="w-16 h-16 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Lisa de Vries</h3>
                <p className="text-blue-600 font-medium mb-3">Head of Styling</p>
                <p className="text-gray-600 text-sm">
                  Creatief directeur met ervaring bij top fashion brands. 
                  Zorgt ervoor dat elke aanbeveling stijlvol en trendy is.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Exact zoals homepage */}
        <section className="relative py-24 overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600">
          {/* Decorative elements - exact zoals homepage */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Klaar om je stijl te ontdekken?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Begin vandaag nog met onze gratis stijlquiz en ontdek wat jouw perfecte look is.
            </p>
            <button className="bg-white text-emerald-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-xl">
              Start gratis quiz
            </button>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;