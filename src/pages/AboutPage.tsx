import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Users, Target, Heart, Award, TrendingUp } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Over FitFi - Jouw perfecte stijl begint hier</title>
        <meta name="description" content="Ontdek het verhaal achter FitFi. Wij geloven dat iedereen een unieke stijl heeft. Met AI-technologie en persoonlijke begeleiding helpen wij je jouw perfecte look te ontdekken." />
        <meta name="keywords" content="over fitfi, stijladvies, AI styling, persoonlijke styling, mode technologie" />
        <link rel="canonical" href="https://fitfi.ai/over-ons" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-emerald-200/50 rounded-full text-sm font-medium text-emerald-700 mb-8">
              <Sparkles className="w-4 h-4" />
              Over FitFi
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Jouw perfecte stijl
              <br />
              begint hier
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Wij geloven dat iedereen een unieke stijl heeft. Met AI-technologie en 
              persoonlijke begeleiding helpen wij je jouw perfecte look te ontdekken.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">10K+</div>
                <div className="text-gray-600">Tevreden gebruikers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-2">50K+</div>
                <div className="text-gray-600">Outfits gecreëerd</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">98%</div>
                <div className="text-gray-600">Tevredenheid</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Onze missie
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Bij FitFi geloven we dat mode meer is dan alleen kleding. Het is een vorm van 
                  zelfexpressie, een manier om je persoonlijkheid te tonen aan de wereld. 
                  Onze missie is om iedereen te helpen hun unieke stijl te ontdekken en 
                  zelfvertrouwen op te bouwen.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Door geavanceerde AI-technologie te combineren met persoonlijke styling expertise, 
                  maken we stijladvies toegankelijk voor iedereen. We analyseren je voorkeuren, 
                  lichaamsbouw en lifestyle om outfits te creëren die perfect bij jou passen.
                </p>
              </div>
              <div className="relative">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Target className="w-6 h-6 text-emerald-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Persoonlijk</h3>
                      <p className="text-sm text-gray-600">Advies op maat voor jouw unieke stijl</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-6 h-6 text-teal-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">AI-gedreven</h3>
                      <p className="text-sm text-gray-600">Geavanceerde technologie voor perfecte matches</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Toegankelijk</h3>
                      <p className="text-sm text-gray-600">Voor iedereen, ongeacht budget of ervaring</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Groeiend</h3>
                      <p className="text-sm text-gray-600">Continu leren en verbeteren</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Ons team
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Een gepassioneerd team van stylisten, technologen en mode-experts 
                die samenwerken om jouw stijlreis mogelijk te maken.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Styling Team</h3>
                <p className="text-gray-600 text-center">
                  Ervaren stylisten die de nieuwste trends kennen en weten hoe je 
                  deze kunt toepassen op jouw persoonlijke stijl.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Tech Team</h3>
                <p className="text-gray-600 text-center">
                  Ontwikkelaars en data scientists die onze AI-algoritmes continu 
                  verbeteren voor nog betere stijlaanbevelingen.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Customer Success</h3>
                <p className="text-gray-600 text-center">
                  Ons support team staat klaar om je te helpen bij elke stap 
                  van je stijlreis en zorgt voor een perfecte ervaring.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600"></div>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Klaar om je stijl te ontdekken?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Begin vandaag nog met onze gratis stijlquiz en ontdek welke outfits 
              perfect bij jou passen.
            </p>
            <button className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg">
              Start gratis
            </button>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;