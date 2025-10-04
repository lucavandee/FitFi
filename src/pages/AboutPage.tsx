import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Users, Target, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>Over FitFi - Jouw perfecte stijl begint hier</title>
        <meta name="description" content="Ontdek het verhaal achter FitFi. Wij geloven dat iedereen een unieke stijl heeft en helpen je deze te ontdekken met AI-technologie." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-[var(--color-bg)] py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-gray-700">Over FitFi</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              Jouw perfecte stijl
            </span>
            <br />
            <span className="text-gray-900">begint hier</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Wij geloven dat iedereen een unieke stijl heeft. Met AI-technologie en 
            persoonlijke begeleiding helpen wij je jouw perfecte look te ontdekken.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">10K+</div>
              <div className="text-gray-600">Tevreden gebruikers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-2">50K+</div>
              <div className="text-gray-600">Outfits gecreëerd</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600">Tevredenheid</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Onze missie
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We maken stijl toegankelijk voor iedereen door de kracht van AI te combineren 
              met persoonlijke begeleiding en een diepe passie voor mode.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Persoonlijk</h3>
              <p className="text-gray-600">
                Elke stijladvies is uniek en afgestemd op jouw persoonlijkheid, 
                lichaamsbouw en voorkeuren.
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Precies</h3>
              <p className="text-gray-600">
                Onze AI-technologie analyseert duizenden combinaties om de 
                perfecte match voor jou te vinden.
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Passie</h3>
              <p className="text-gray-600">
                We zijn gepassioneerd over mode en helpen je graag om je 
                zelfvertrouwen te vergroten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Ons verhaal
            </h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p className="text-xl leading-relaxed mb-6">
                FitFi ontstond uit de frustratie dat het vinden van de perfecte stijl 
                zo moeilijk was. We zagen dat veel mensen worstelden met hun kledingkeuzes 
                en niet wisten wat hen goed stond.
              </p>
              <p className="text-xl leading-relaxed mb-6">
                Door de kracht van AI te combineren met jarenlange expertise in mode 
                en styling, hebben we een platform gecreëerd dat iedereen helpt om 
                hun unieke stijl te ontdekken.
              </p>
              <p className="text-xl leading-relaxed">
                Vandaag helpen we duizenden mensen dagelijks om zich zelfverzekerder 
                te voelen in hun kleding en hun persoonlijke stijl te ontwikkelen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Klaar om je stijl te ontdekken?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Begin vandaag nog met onze gratis stijlquiz en ontdek wat jouw perfecte look is.
          </p>
          <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105">
            Start gratis quiz
          </button>
        </div>
      </section>
    </>
  );
}