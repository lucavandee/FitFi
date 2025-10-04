import React from 'react';
import { Users, Target, Heart, Sparkles, CircleCheck as CheckCircle, ArrowRight } from 'lucide-react';
import Container from '../components/layout/Container';
import { Helmet } from 'react-helmet-async';

const AboutPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Over FitFi - AI-gedreven stijladvies</title>
        <meta name="description" content="Ontdek het verhaal achter FitFi en ons team van stijlexperts en AI-specialisten." />
      </Helmet>

      {/* Hero Section - exact same styling as pricing/how it works */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
        {/* Background decorations - same as other pages */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
        </div>

        <Container className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200/50 mb-8">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Over FitFi</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-montserrat">
            Jouw persoonlijke
            <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              stijl AI-assistent
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            We combineren geavanceerde AI-technologie met stijlexpertise om jou te helpen 
            je perfecte look te vinden. Snel, persoonlijk en altijd up-to-date.
          </p>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>10.000+ tevreden gebruikers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span>AI-gedreven matching</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>100% privacy-first</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Mission Section - same card styling */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-montserrat">
              Onze missie
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We geloven dat iedereen recht heeft op een stijl die bij hen past, 
              zonder de complexiteit van mode-advies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-100">
                <Target className="w-12 h-12 text-emerald-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Persoonlijk & Accuraat</h3>
                <p className="text-gray-600">
                  Onze AI analyseert jouw voorkeuren, lichaamsbouw en lifestyle om 
                  outfits te vinden die perfect bij jou passen.
                </p>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-8 rounded-2xl border border-teal-100">
                <Heart className="w-12 h-12 text-teal-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Toegankelijk voor Iedereen</h3>
                <p className="text-gray-600">
                  Mode-advies hoeft niet duur of ingewikkeld te zijn. We maken het 
                  eenvoudig en betaalbaar voor iedereen.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-emerald-50 p-8 rounded-2xl border border-blue-100">
              <Users className="w-12 h-12 text-blue-600 mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Community-gedreven</h3>
              <p className="text-gray-600 mb-6">
                We leren van onze community en verbeteren continu onze aanbevelingen 
                op basis van echte feedback van gebruikers zoals jij.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-700">Real-time feedback verwerking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-700">Continu lerende algoritmes</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-700">Community-driven verbeteringen</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Values Section - same grid styling */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-montserrat">
              Onze waarden
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Deze principes sturen alles wat we doen bij FitFi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Precisie</h3>
              <p className="text-gray-600">
                We streven naar de meest accurate stijlaanbevelingen door geavanceerde 
                AI en machine learning technieken.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Empathie</h3>
              <p className="text-gray-600">
                We begrijpen dat stijl persoonlijk is en respecteren ieders unieke 
                smaak en voorkeuren.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Transparantie</h3>
              <p className="text-gray-600">
                We zijn open over hoe onze AI werkt en waarom we bepaalde 
                aanbevelingen doen.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Team Section - same styling approach */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-montserrat">
              Ons team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Een mix van stijlexperts, AI-specialisten en product designers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold">
                  SV
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sarah van der Berg</h3>
              <p className="text-emerald-600 font-medium mb-3">Stijl Director</p>
              <p className="text-gray-600 text-sm">
                15+ jaar ervaring in de mode-industrie en personal styling
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-teal-400 to-blue-400 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold">
                  MJ
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-blue-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mark Janssen</h3>
              <p className="text-teal-600 font-medium mb-3">AI Lead</p>
              <p className="text-gray-600 text-sm">
                Machine learning expert gespecialiseerd in recommendation systems
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold">
                  LK
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-emerald-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lisa Konings</h3>
              <p className="text-blue-600 font-medium mb-3">Product Designer</p>
              <p className="text-gray-600 text-sm">
                UX/UI specialist met focus op intuïtieve gebruikerservaringen
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section - exact same styling as other pages */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <Container className="relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-montserrat">
            Klaar om je perfecte stijl te ontdekken?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Start vandaag nog met je gratis AI Style Report en ontdek outfits 
            die perfect bij jou passen.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 group">
              Start gratis quiz
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105">
              Bekijk voorbeelden
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-12 text-emerald-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>100% gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>2 minuten setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Privacy-first</span>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default AboutPage;