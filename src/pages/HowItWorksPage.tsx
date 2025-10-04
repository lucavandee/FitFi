import React from 'react';
import { ArrowRight, Sparkles, Target, Zap, CircleCheck as CheckCircle } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50 py-20">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-lg animate-pulse"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">AI-Powered Styling</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-montserrat">
            Zo werkt jouw{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              persoonlijke stylist
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-lato">
            In slechts 3 stappen naar outfits die perfect bij jou passen. Geen gedoe, wel resultaat.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 mb-12">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>2 minuten quiz</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>AI-powered matching</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Instant resultaten</span>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  Stap 1
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 font-montserrat">
                  Vertel ons over jezelf
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  Beantwoord onze slimme quiz over je stijlvoorkeuren, lichaamsbouw en lifestyle. 
                  Onze AI analyseert je antwoorden om je unieke stijlprofiel te bepalen.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Persoonlijke stijlvoorkeuren</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Lichaamsbouw analyse</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Lifestyle matching</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-sm">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Quiz Interface</h3>
                    <p className="text-gray-600">Intuïtieve vragen die je stijl ontrafelen</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 mb-20">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  Stap 2
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 font-montserrat">
                  AI analyseert je profiel
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  Onze geavanceerde AI verwerkt je antwoorden en matcht deze met duizenden 
                  stijlcombinaties om jouw perfecte archetype te vinden.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Machine learning algoritmes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Stijl archetype bepaling</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Kleur- en pasvorm analyse</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-sm">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">AI Processing</h3>
                    <p className="text-gray-600">Geavanceerde algoritmes aan het werk</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  Stap 3
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 font-montserrat">
                  Ontvang je outfits
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  Krijg direct toegang tot gepersonaliseerde outfit suggesties die perfect 
                  bij jouw stijl, budget en gelegenheden passen.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Gepersonaliseerde outfits</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Directe shopping links</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Styling tips & uitleg</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 shadow-sm">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Outfit Results</h3>
                    <p className="text-gray-600">Jouw perfecte stijl, klaar om te shoppen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-montserrat">
            Klaar om je stijl te ontdekken?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start vandaag nog met onze gratis quiz en ontdek outfits die perfect bij jou passen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all inline-flex items-center gap-2">
              Start Gratis Quiz
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-white border border-gray-200 text-gray-900 py-3 px-8 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Bekijk Voorbeelden
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}