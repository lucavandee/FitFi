import React from 'react';
import { Users, Target, Heart, Sparkles, CircleCheck as CheckCircle, ArrowRight } from 'lucide-react';
import Container from '../components/layout/Container';
import { Helmet } from 'react-helmet-async';

const AboutPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Over FitFi - AI-gedreven stijladvies voor iedereen</title>
        <meta name="description" content="Ontdek het verhaal achter FitFi. Ons team van stijlexperts en AI-specialisten helpt je jouw perfecte stijl te vinden." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-bg)] via-emerald-50/30 to-teal-50/40">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/15 to-emerald-400/15 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-400/5 to-teal-400/5 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <Container className="relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-emerald-200/50 rounded-full text-sm font-medium text-emerald-700 mb-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Sparkles className="w-4 h-4" />
              <span>Ons verhaal</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-6 leading-tight">
              Stijl voor{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
                iedereen
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-[var(--color-text-muted)] mb-8 max-w-3xl mx-auto leading-relaxed">
              Bij FitFi geloven we dat iedereen recht heeft op een stijl die bij hen past. 
              Daarom combineren we AI-technologie met menselijke expertise.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-emerald-600 mb-2">10.000+</div>
                <div className="text-[var(--color-text-muted)]">Tevreden gebruikers</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-teal-600 mb-2">50.000+</div>
                <div className="text-[var(--color-text-muted)]">Outfits gecreëerd</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
                <div className="text-[var(--color-text-muted)]">Tevredenheidscore</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-primary) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full text-sm font-medium text-emerald-700 mb-6">
                <Target className="w-4 h-4" />
                <span>Onze missie</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-6 leading-tight">
                Stijl toegankelijk maken voor{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  iedereen
                </span>
              </h2>
              
              <p className="text-lg text-[var(--color-text-muted)] mb-8 leading-relaxed">
                We geloven dat stijl niet alleen voor een select groepje moet zijn. Door AI te combineren 
                met menselijke expertise, maken we persoonlijk stijladvies toegankelijk voor iedereen, 
                ongeacht budget of ervaring.
              </p>

              <div className="space-y-4">
                {[
                  'Persoonlijk advies op basis van jouw unieke voorkeuren',
                  'Toegankelijke prijzen voor iedereen',
                  'Duurzame en bewuste keuzes stimuleren'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-200">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors duration-200">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl p-8 shadow-2xl">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-blue-400 to-emerald-400 rounded-full opacity-15 animate-pulse-delayed"></div>
                
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--color-text)] mb-4">
                    Stijl met impact
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Elke outfit die we aanbevelen is zorgvuldig geselecteerd om niet alleen 
                    mooi te zijn, maar ook bij jouw levensstijl en waarden te passen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-emerald-50/30 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-teal-200/20 to-transparent rounded-full blur-3xl"></div>

        <Container className="relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-emerald-200/50 rounded-full text-sm font-medium text-emerald-700 mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Onze waarden</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-6">
              Wat ons{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                drijft
              </span>
            </h2>
            
            <p className="text-xl text-[var(--color-text-muted)] max-w-3xl mx-auto">
              Deze kernwaarden staan centraal in alles wat we doen bij FitFi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Inclusiviteit',
                description: 'Stijl is voor iedereen, ongeacht leeftijd, geslacht, budget of ervaring. We omarmen diversiteit in alle vormen.',
                gradient: 'from-emerald-500 to-teal-500'
              },
              {
                icon: Target,
                title: 'Precisie',
                description: 'Door AI en data-analyse bieden we nauwkeurige, persoonlijke aanbevelingen die echt bij jou passen.',
                gradient: 'from-teal-500 to-blue-500'
              },
              {
                icon: Heart,
                title: 'Authenticiteit',
                description: 'We helpen je jouw eigen unieke stijl te ontdekken, niet om je in een hokje te plaatsen.',
                gradient: 'from-blue-500 to-emerald-500'
              }
            ].map((value, index) => (
              <div key={index} className="group">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className={`w-16 h-16 bg-gradient-to-r ${value.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-[var(--color-text)] mb-4 group-hover:text-emerald-600 transition-colors duration-300">
                    {value.title}
                  </h3>
                  
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <Container>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full text-sm font-medium text-emerald-700 mb-6">
              <Users className="w-4 h-4" />
              <span>Ons team</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-6">
              De mensen achter{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                FitFi
              </span>
            </h2>
            
            <p className="text-xl text-[var(--color-text-muted)] max-w-3xl mx-auto">
              Een diverse groep stijlexperts, AI-specialisten en product designers die samen 
              werken aan de toekomst van persoonlijk stijladvies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah van der Berg',
                role: 'Oprichter & CEO',
                description: 'Voormalig stylist met 10+ jaar ervaring in de mode-industrie.',
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
              },
              {
                name: 'Mark Janssen',
                role: 'CTO & AI Lead',
                description: 'Machine learning expert gespecialiseerd in recommendation systems.',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
              },
              {
                name: 'Lisa Chen',
                role: 'Head of Design',
                description: 'Product designer met passie voor gebruiksvriendelijke interfaces.',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
              }
            ].map((member, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl p-8 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                    {member.name}
                  </h3>
                  
                  <p className="text-emerald-600 font-medium mb-3">
                    {member.role}
                  </p>
                  
                  <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-600/90 via-teal-600/90 to-blue-600/90"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <Container className="relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Klaar om jouw perfecte stijl te ontdekken?
            </h2>
            
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Begin vandaag nog met je persoonlijke stijlreis. Binnen 2 minuten krijg je 
              een volledig rapport met outfits die perfect bij jou passen.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group bg-white text-emerald-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex items-center gap-2">
                <span>Start gratis stijlquiz</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              
              <button className="text-white/90 hover:text-white font-medium text-lg underline underline-offset-4 hover:underline-offset-8 transition-all duration-200">
                Bekijk voorbeeldrapport
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mt-12 text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>100% Gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Privacy-first</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>2 min setup</span>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default AboutPage;