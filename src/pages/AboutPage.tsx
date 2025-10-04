import React from 'react';
import { Sparkles, Target, Heart, Users, CircleCheck as CheckCircle, ArrowRight, Crown } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Exact same styling as Pricing/HowItWorks */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50 py-20">
        {/* Floating Orbs - Same as other pages */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-lg animate-pulse"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Premium Badge - Same styling */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 mb-6 shadow-sm">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700">Ons Verhaal</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-montserrat">
            Wij maken stijl{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              toegankelijk
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-lato">
            FitFi ontstond uit de overtuiging dat iedereen recht heeft op een stijl die bij hen past, 
            ongeacht budget of ervaring.
          </p>

          {/* Trust Indicators - Same styling */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 mb-12">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>AI-powered styling</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Voor iedereen toegankelijk</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Persoonlijk & uniek</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section - Same card styling as pricing */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-montserrat">
              Onze Missie
            </h2>
            <p className="text-xl text-gray-600 font-lato">
              We geloven dat de juiste kleding je zelfvertrouwen kan transformeren. 
              Daarom hebben we FitFi gebouwd: om stijladvies democratisch te maken.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Mission Card 1 - Same styling as pricing cards */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-montserrat text-center">
                Toegankelijkheid
              </h3>
              <p className="text-gray-600 text-center">
                Stijladvies moet voor iedereen bereikbaar zijn, niet alleen voor mensen met een groot budget of fashionkennis.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-montserrat text-center">
                Personalisatie
              </h3>
              <p className="text-gray-600 text-center">
                Elke persoon is uniek. Onze AI zorgt ervoor dat elk stijladvies perfect aansluit bij jouw persoonlijkheid en lifestyle.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-montserrat text-center">
                Zelfvertrouwen
              </h3>
              <p className="text-gray-600 text-center">
                De juiste kleding geeft je kracht. We helpen je ontdekken welke stijl jouw beste zelf naar boven brengt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Timeline - Same styling approach */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-montserrat">
                Ons Verhaal
              </h2>
              <p className="text-xl text-gray-600 font-lato">
                Van idee tot AI-powered styling platform
              </p>
            </div>

            <div className="space-y-12">
              {/* Timeline Item 1 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
                      2023 Q1
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 font-montserrat">
                      Het Begin
                    </h3>
                    <p className="text-gray-600">
                      Gefrustreerd door dure personal stylists en generieke mode-apps, 
                      besloten we een democratische oplossing te bouwen die AI gebruikt 
                      om persoonlijk stijladvies toegankelijk te maken.
                    </p>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">1</span>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="flex-1">
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
                      2023 Q3
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 font-montserrat">
                      AI Ontwikkeling
                    </h3>
                    <p className="text-gray-600">
                      Maanden van onderzoek naar stijlarchetypen, kleurtheorie en pasvorm 
                      resulteerden in ons eerste AI-model dat persoonlijke stijlprofielen 
                      kon genereren.
                    </p>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
              </div>

              {/* Timeline Item 3 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
                      2024 Q1
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 font-montserrat">
                      Platform Launch
                    </h3>
                    <p className="text-gray-600">
                      FitFi ging live met onze eerste versie. Duizenden gebruikers 
                      ontdekten hun persoonlijke stijl en gaven ons waardevolle feedback 
                      om het platform te verbeteren.
                    </p>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Same styling as other pages */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-montserrat">
              FitFi in Cijfers
            </h2>
            <p className="text-xl text-gray-600 font-lato">
              Samen maken we stijl toegankelijk voor iedereen
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2 font-montserrat">10K+</div>
              <div className="text-gray-600">Gebruikers</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2 font-montserrat">50K+</div>
              <div className="text-gray-600">Outfits Gegenereerd</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2 font-montserrat">95%</div>
              <div className="text-gray-600">Tevredenheid</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2 font-montserrat">24/7</div>
              <div className="text-gray-600">Beschikbaar</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Same styling as HowItWorks */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-montserrat">
            Klaar om je stijl te ontdekken?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Sluit je aan bij duizenden anderen die hun perfecte stijl hebben gevonden met FitFi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all inline-flex items-center gap-2">
              Start Gratis Quiz
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-white border border-gray-200 text-gray-900 py-3 px-8 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Lees Meer
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}