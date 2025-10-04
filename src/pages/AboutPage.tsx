import React from 'react';
import { Users, Target, Heart, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Over FitFi: Jouw persoonlijke 
            <span className="block">stijladviseur</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Wij helpen je de perfecte outfits te vinden die bij jouw unieke stijl passen. 
            Geen verborgen kosten, geen verrassingen.
          </p>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Geen verborgen kosten</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>30 dagen geld terug</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Onze missie</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We geloven dat iedereen toegang moet hebben tot persoonlijk stijladvies
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Mission Card 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Persoonlijk</h3>
              <p className="text-gray-600 leading-relaxed">
                Elke stijladvies is uniek en afgestemd op jouw persoonlijke voorkeuren, 
                lichaamsbouw en lifestyle.
              </p>
            </div>

            {/* Mission Card 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Toegankelijk</h3>
              <p className="text-gray-600 leading-relaxed">
                Professioneel stijladvies hoeft niet duur te zijn. We maken het voor 
                iedereen bereikbaar.
              </p>
            </div>

            {/* Mission Card 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Innovatief</h3>
              <p className="text-gray-600 leading-relaxed">
                Door AI en machine learning te combineren met menselijke expertise 
                leveren we de beste resultaten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ons verhaal</h2>
            <p className="text-lg text-gray-600">
              Van idee tot de toonaangevende stijlplatform van Nederland
            </p>
          </div>

          <div className="space-y-8">
            {/* Timeline Item 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">Q1</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2024 - De start</h3>
                <p className="text-gray-600">
                  FitFi werd opgericht met de missie om persoonlijk stijladvies toegankelijk 
                  te maken voor iedereen in Nederland.
                </p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-green-600">Q2</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-ontwikkeling</h3>
                <p className="text-gray-600">
                  Ontwikkeling van onze geavanceerde AI-algoritmes voor persoonlijke 
                  stijlanalyse en outfit-aanbevelingen.
                </p>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-purple-600">Q3</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform launch</h3>
                <p className="text-gray-600">
                  Officiële lancering van het FitFi platform met duizenden tevreden gebruikers 
                  in de eerste maand.
                </p>
              </div>
            </div>

            {/* Timeline Item 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-orange-600">Q4</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Groei & innovatie</h3>
                <p className="text-gray-600">
                  Uitbreiding van ons team en doorontwikkeling van nieuwe features 
                  gebaseerd op gebruikersfeedback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl font-bold text-gray-900 mb-2">10K+</div>
              <div className="text-gray-600">Tevreden gebruikers</div>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl font-bold text-gray-900 mb-2">50K+</div>
              <div className="text-gray-600">Outfits gecreëerd</div>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600">Tevredenheidscore</div>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600">AI-ondersteuning</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Values */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Onze waarden</h2>
            <p className="text-lg text-gray-600">
              De principes die ons dagelijks werk sturen
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Klantgericht</h3>
              <p className="text-gray-600 leading-relaxed">
                Alles wat we doen, doen we met onze klanten in gedachten. Hun succes is ons succes.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Kwaliteit</h3>
              <p className="text-gray-600 leading-relaxed">
                We streven naar perfectie in alles wat we leveren, van onze AI-algoritmes tot onze klantenservice.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Innovatie</h3>
              <p className="text-gray-600 leading-relaxed">
                We blijven vooroplopen door constant te innoveren en nieuwe technologieën te omarmen.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Transparantie</h3>
              <p className="text-gray-600 leading-relaxed">
                Eerlijkheid en openheid staan centraal in onze communicatie met klanten en partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Klaar om je stijl te ontdekken?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Begin vandaag nog met je persoonlijke stijlreis. Gratis te proberen, 
            geen verplichtingen.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-2">
              Start je stijlquiz
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
              Bekijk prijzen
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}