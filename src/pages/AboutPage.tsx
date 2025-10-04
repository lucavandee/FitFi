import { Helmet } from 'react-helmet-async';
import { Target, Heart, Users, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>Over Ons - FitFi</title>
        <meta name="description" content="Leer meer over FitFi en ons team. Wij maken persoonlijk stijladvies toegankelijk voor iedereen." />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 py-20 overflow-hidden">
          {/* Floating orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-turquoise/20 to-turquoise/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-turquoise/15 to-turquoise/5 rounded-full blur-3xl animate-float-delayed"></div>
            <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-r from-turquoise/10 to-turquoise/5 rounded-full blur-3xl animate-float-slow"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm mb-8">
              <Sparkles className="w-4 h-4 text-turquoise" />
              Over FitFi
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-montserrat text-midnight mb-6">
              Wij maken persoonlijk stijladvies 
              <span className="block bg-gradient-to-r from-turquoise to-turquoise/80 bg-clip-text text-transparent">
                toegankelijk voor iedereen
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 font-lato leading-relaxed max-w-3xl mx-auto mb-8">
              FitFi ontstond uit frustratie over dure personal stylists en generieke mode-apps. Wij geloven dat iedereen recht heeft op stijladvies dat echt bij hen past.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                100% Privacy-first
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Nederlandse startup
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                AI + menselijke expertise
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="mission-card bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-turquoise/20 to-turquoise/10 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-turquoise" />
                </div>
                <h3 className="text-xl font-bold font-montserrat text-midnight mb-4">Onze Missie</h3>
                <p className="text-gray-600 font-lato leading-relaxed">
                  Persoonlijk stijladvies democratiseren door AI en menselijke expertise te combineren. Geen dure stylists meer nodig - iedereen verdient toegang tot professioneel stijladvies.
                </p>
              </div>

              <div className="mission-card bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-turquoise/20 to-turquoise/10 rounded-xl flex items-center justify-center mb-6">
                  <Heart className="w-6 h-6 text-turquoise" />
                </div>
                <h3 className="text-xl font-bold font-montserrat text-midnight mb-4">Onze Waarden</h3>
                <div className="space-y-2 text-gray-600 font-lato">
                  <p>Privacy en transparantie eerst</p>
                  <p>Toegankelijk voor iedereen</p>
                  <p>Authentieke stijl, geen trends</p>
                  <p>Duurzame keuzes stimuleren</p>
                </div>
              </div>

              <div className="mission-card bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-turquoise/20 to-turquoise/10 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-turquoise" />
                </div>
                <h3 className="text-xl font-bold font-montserrat text-midnight mb-4">Ons Team</h3>
                <p className="text-gray-600 font-lato leading-relaxed">
                  Een mix van AI-experts, stylisten en UX-designers uit Nederland. Wij begrijpen de Nederlandse markt en maken producten die écht werken.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-montserrat text-midnight mb-4">Ons Verhaal</h2>
              <p className="text-xl text-gray-600 font-lato">Van idee tot AI-stylist in 18 maanden</p>
            </div>

            <div className="timeline-container relative">
              <div className="timeline-line absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-turquoise to-turquoise/50"></div>
              
              <div className="space-y-12">
                <div className="timeline-item flex gap-6">
                  <div className="timeline-marker w-4 h-4 bg-turquoise rounded-full border-4 border-white shadow-sm flex-shrink-0 mt-2"></div>
                  <div>
                    <div className="text-sm font-semibold text-turquoise mb-1">2023</div>
                    <h3 className="text-lg font-bold font-montserrat text-midnight mb-2">Het Begin</h3>
                    <p className="text-gray-600 font-lato">Frustratie over dure personal stylists (€150+ per uur) en generieke mode-apps die niet begrijpen wat écht bij je past.</p>
                  </div>
                </div>

                <div className="timeline-item flex gap-6">
                  <div className="timeline-marker w-4 h-4 bg-turquoise rounded-full border-4 border-white shadow-sm flex-shrink-0 mt-2"></div>
                  <div>
                    <div className="text-sm font-semibold text-turquoise mb-1">Q1 '24</div>
                    <h3 className="text-lg font-bold font-montserrat text-midnight mb-2">Eerste Prototype</h3>
                    <p className="text-gray-600 font-lato">AI-model getraind op duizenden outfit-combinaties en stijlprofielen. Focus op Nederlandse voorkeuren en merken.</p>
                  </div>
                </div>

                <div className="timeline-item flex gap-6">
                  <div className="timeline-marker w-4 h-4 bg-turquoise rounded-full border-4 border-white shadow-sm flex-shrink-0 mt-2"></div>
                  <div>
                    <div className="text-sm font-semibold text-turquoise mb-1">Q3 '24</div>
                    <h3 className="text-lg font-bold font-montserrat text-midnight mb-2">Beta Launch</h3>
                    <p className="text-gray-600 font-lato">500+ beta-gebruikers testen het platform. 92% tevredenheid en waardevolle feedback voor verdere ontwikkeling.</p>
                  </div>
                </div>

                <div className="timeline-item flex gap-6">
                  <div className="timeline-marker w-4 h-4 bg-turquoise rounded-full border-4 border-white shadow-sm flex-shrink-0 mt-2"></div>
                  <div>
                    <div className="text-sm font-semibold text-turquoise mb-1">Nu</div>
                    <h3 className="text-lg font-bold font-montserrat text-midnight mb-2">Publieke Launch</h3>
                    <p className="text-gray-600 font-lato">FitFi is live! Gratis AI Style Reports voor iedereen, met premium features voor wie meer wil.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-montserrat text-midnight mb-4">FitFi in Cijfers</h2>
              <p className="text-xl text-gray-600 font-lato">Wat we tot nu toe hebben bereikt</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="stats-card text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold font-montserrat bg-gradient-to-r from-turquoise to-turquoise/80 bg-clip-text text-transparent mb-2">500+</div>
                <div className="text-gray-600 font-lato">Beta gebruikers</div>
              </div>

              <div className="stats-card text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold font-montserrat bg-gradient-to-r from-turquoise to-turquoise/80 bg-clip-text text-transparent mb-2">92%</div>
                <div className="text-gray-600 font-lato">Tevredenheid</div>
              </div>

              <div className="stats-card text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold font-montserrat bg-gradient-to-r from-turquoise to-turquoise/80 bg-clip-text text-transparent mb-2">10K+</div>
                <div className="text-gray-600 font-lato">Outfit combinaties</div>
              </div>

              <div className="stats-card text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold font-montserrat bg-gradient-to-r from-turquoise to-turquoise/80 bg-clip-text text-transparent mb-2">100%</div>
                <div className="text-gray-600 font-lato">Privacy-first</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 bg-gradient-to-br from-turquoise/5 via-turquoise/10 to-turquoise/5 overflow-hidden">
          {/* Background orb */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-turquoise/20 to-turquoise/10 rounded-full blur-3xl animate-pulse"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold font-montserrat text-midnight mb-6">
              Klaar om jouw perfecte stijl te ontdekken?
            </h2>
            <p className="text-xl text-gray-600 font-lato mb-8 max-w-2xl mx-auto">
              Begin vandaag nog met onze gratis AI Style Quiz en krijg persoonlijke outfit aanbevelingen die perfect bij jou passen.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/quiz"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-turquoise to-turquoise/90 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 group"
              >
                Start Gratis Quiz
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200"
              >
                Bekijk Prijzen
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;