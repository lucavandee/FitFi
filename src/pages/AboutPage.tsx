import React from 'react';
import { Sparkles, Target, Heart, Users, CheckCircle, ArrowRight, Award, Zap, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50 py-20 lg:py-32">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-turquoise-400/20 to-blue-400/20 rounded-full blur-xl animate-float-medium"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-float-fast"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-turquoise-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg animate-pulse-glow">
              <Sparkles className="w-4 h-4" />
              AI-Powered Styling Platform
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-midnight mb-6 font-montserrat">
              Wij maken{' '}
              <span className="bg-gradient-to-r from-turquoise-500 to-blue-600 bg-clip-text text-transparent">
                persoonlijk stijladvies
              </span>{' '}
              toegankelijk voor iedereen
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              FitFi combineert geavanceerde AI-technologie met menselijke expertise om jouw unieke stijl te ontdekken en te ontwikkelen.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>10.000+ tevreden gebruikers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>AI-gedreven aanbevelingen</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Nederlandse focus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-midnight mb-4 font-montserrat">
                Onze Missie
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Wij geloven dat iedereen recht heeft op persoonlijk stijladvies dat past bij hun leven en budget.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Primary Mission Card */}
              <div className="group relative bg-gradient-to-br from-turquoise-50 to-blue-50 p-8 rounded-2xl border border-turquoise-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-turquoise-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-r from-turquoise-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-midnight mb-4 font-montserrat">Toegankelijkheid</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Stijladvies moet niet alleen voor de elite zijn. Wij maken het toegankelijk voor iedereen, ongeacht budget of ervaring.
                  </p>
                </div>
              </div>

              {/* Innovation Card */}
              <div className="group relative bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-midnight mb-4 font-montserrat">Innovatie</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Door AI en machine learning te combineren met menselijke expertise, creëren wij de toekomst van persoonlijk stijladvies.
                  </p>
                </div>
              </div>

              {/* Community Card */}
              <div className="group relative bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-midnight mb-4 font-montserrat">Community</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Wij bouwen een gemeenschap waar mensen elkaar inspireren en ondersteunen in hun stijlreis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-midnight mb-4 font-montserrat">
                Onze Waarden
              </h2>
              <p className="text-xl text-gray-600">
                Deze principes sturen alles wat wij doen bij FitFi.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-midnight mb-4 font-montserrat flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-turquoise-500 to-blue-500 rounded-full"></div>
                  Authenticiteit
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Wij geloven in het versterken van jouw unieke stijl, niet het opleggen van trends die niet bij je passen.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-midnight mb-4 font-montserrat flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  Inclusiviteit
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Mode is voor iedereen. Onze AI is getraind om alle lichaamstypes, budgetten en voorkeuren te respecteren.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-midnight mb-4 font-montserrat flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"></div>
                  Duurzaamheid
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Wij promoten bewuste keuzes en helpen je een tijdloze garderobe op te bouwen die jaren meegaat.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-midnight mb-4 font-montserrat flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                  Transparantie
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Wij zijn open over hoe onze AI werkt en waarom bepaalde aanbevelingen worden gedaan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-midnight mb-4 font-montserrat">
                Ons Verhaal
              </h2>
              <p className="text-xl text-gray-600">
                Van idee tot de toonaangevende AI-styling platform van Nederland.
              </p>
            </div>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-turquoise-500 to-blue-500 rounded-full"></div>
              
              <div className="space-y-12">
                {/* 2023 Q1 */}
                <div className="relative flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 md:pr-8 mb-4 md:mb-0">
                    <div className="bg-gradient-to-br from-turquoise-50 to-blue-50 p-6 rounded-2xl border border-turquoise-100">
                      <div className="text-sm font-medium text-turquoise-600 mb-2">2023 Q1</div>
                      <h3 className="text-xl font-bold text-midnight mb-3 font-montserrat">Het Begin</h3>
                      <p className="text-gray-600">
                        FitFi wordt opgericht met de missie om AI-gedreven stijladvies toegankelijk te maken voor iedereen.
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block w-4 h-4 bg-gradient-to-r from-turquoise-500 to-blue-500 rounded-full border-4 border-white shadow-lg relative z-10"></div>
                  <div className="md:w-1/2 md:pl-8"></div>
                </div>
                
                {/* 2023 Q3 */}
                <div className="relative flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 md:pr-8"></div>
                  <div className="hidden md:block w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-4 border-white shadow-lg relative z-10"></div>
                  <div className="md:w-1/2 md:pl-8 mb-4 md:mb-0">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                      <div className="text-sm font-medium text-purple-600 mb-2">2023 Q3</div>
                      <h3 className="text-xl font-bold text-midnight mb-3 font-montserrat">Eerste Beta</h3>
                      <p className="text-gray-600">
                        Lancering van onze beta versie met 100 early adopters die ons hielpen het platform te verfijnen.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 2024 Q1 */}
                <div className="relative flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 md:pr-8 mb-4 md:mb-0">
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-2xl border border-green-100">
                      <div className="text-sm font-medium text-green-600 mb-2">2024 Q1</div>
                      <h3 className="text-xl font-bold text-midnight mb-3 font-montserrat">Publieke Launch</h3>
                      <p className="text-gray-600">
                        Officiële lancering van FitFi met geavanceerde AI-algoritmes en Nederlandse productintegratie.
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block w-4 h-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-full border-4 border-white shadow-lg relative z-10"></div>
                  <div className="md:w-1/2 md:pl-8"></div>
                </div>
                
                {/* 2024 Q4 */}
                <div className="relative flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 md:pr-8"></div>
                  <div className="hidden md:block w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border-4 border-white shadow-lg relative z-10"></div>
                  <div className="md:w-1/2 md:pl-8 mb-4 md:mb-0">
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
                      <div className="text-sm font-medium text-orange-600 mb-2">2024 Q4</div>
                      <h3 className="text-xl font-bold text-midnight mb-3 font-montserrat">10K Gebruikers</h3>
                      <p className="text-gray-600">
                        Bereiken van 10.000 actieve gebruikers en introductie van Nova, onze AI-stylist assistent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-midnight mb-4 font-montserrat">
                FitFi in Cijfers
              </h2>
              <p className="text-xl text-gray-600">
                Onze impact op de Nederlandse fashion community.
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl font-bold bg-gradient-to-r from-turquoise-500 to-blue-600 bg-clip-text text-transparent mb-2 font-montserrat">
                  10K+
                </div>
                <div className="text-gray-600 font-medium">Tevreden Gebruikers</div>
              </div>
              
              <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-2 font-montserrat">
                  50K+
                </div>
                <div className="text-gray-600 font-medium">Outfits Gegenereerd</div>
              </div>
              
              <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent mb-2 font-montserrat">
                  95%
                </div>
                <div className="text-gray-600 font-medium">Tevredenheidscore</div>
              </div>
              
              <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-2 font-montserrat">
                  24/7
                </div>
                <div className="text-gray-600 font-medium">AI Beschikbaarheid</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-turquoise-500 to-blue-600 overflow-hidden">
        {/* Background Orb */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-spin-slow"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 font-montserrat">
              Klaar om jouw stijl te ontdekken?
            </h2>
            <p className="text-xl mb-8 text-turquoise-100">
              Sluit je aan bij duizenden Nederlanders die al hun perfecte stijl hebben gevonden met FitFi.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-turquoise-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 group">
                Start Gratis Quiz
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-turquoise-600 transition-all duration-300">
                Meer Informatie
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}