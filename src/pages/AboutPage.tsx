import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Heart, Target, Users, Award, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Over FitFi - AI-gedreven stijladvies</title>
        <meta name="description" content="Ontdek het verhaal achter FitFi en ons team van stijlexperts die AI gebruiken om jouw perfecte look te vinden." />
      </Helmet>

      {/* Hero Section - Exact same as pricing */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
        {/* Background decorations - exact same */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-emerald-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge - exact same */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200/50 mb-8">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-gray-700">Ons verhaal</span>
          </div>

          {/* Title - exact same styling */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Over{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              FitFi
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Wij maken stijladvies toegankelijk voor iedereen door AI te combineren met 
            menselijke expertise en een passie voor mode.
          </p>

          {/* Stats - exact same styling */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">10.000+</div>
              <div className="text-gray-600">Tevreden gebruikers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">50.000+</div>
              <div className="text-gray-600">Outfits gecreëerd</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600">Tevredenheidscore</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section - exact same card styling as pricing */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Onze{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                missie
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We geloven dat iedereen recht heeft op stijladvies dat past bij hun persoonlijkheid, 
              budget en levensstijl.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Heart className="w-12 h-12 text-emerald-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Persoonlijk & Toegankelijk</h3>
                <p className="text-gray-600">
                  Stijladvies moet persoonlijk zijn en voor iedereen toegankelijk, 
                  ongeacht budget of ervaring met mode.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Target className="w-12 h-12 text-teal-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI + Menselijke Expertise</h3>
                <p className="text-gray-600">
                  We combineren de kracht van AI met de creativiteit en intuïtie 
                  van ervaren stylisten.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8">
              <blockquote className="text-lg text-gray-700 italic mb-4">
                "Mode is een manier om te zeggen wie je bent zonder te hoeven spreken. 
                Wij helpen je die stem te vinden."
              </blockquote>
              <cite className="text-sm text-gray-600">— Het FitFi team</cite>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - exact same styling */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Onze{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                waarden
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Inclusiviteit</h3>
              <p className="text-gray-600">
                Mode is voor iedereen. Wij creëren stijladvies dat past bij alle 
                lichaamstypes, budgetten en voorkeuren.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Authenticiteit</h3>
              <p className="text-gray-600">
                We helpen je niet om iemand anders te worden, maar om de beste 
                versie van jezelf te zijn.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Kwaliteit</h3>
              <p className="text-gray-600">
                Elk advies is zorgvuldig samengesteld door onze AI en gevalideerd 
                door stijlexperts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - exact same styling */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ons{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                team
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Een diverse groep van stijlexperts, AI-specialisten en mode-enthousiastelingen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah van der Berg",
                role: "Oprichter & CEO",
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
                bio: "15 jaar ervaring in de mode-industrie"
              },
              {
                name: "Mike Janssen",
                role: "CTO & AI Lead",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
                bio: "Expert in machine learning en computer vision"
              },
              {
                name: "Lisa Chen",
                role: "Head of Styling",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
                bio: "Internationale stylist met focus op duurzaamheid"
              }
            ].map((member, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-6 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-emerald-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - exact same as pricing */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Background decorations - exact same */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Klaar om jouw perfecte stijl te ontdekken?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Begin vandaag nog met je gratis AI Style Report en ontdek wat jouw unieke stijl is.
          </p>
          
          <button
            onClick={() => navigate('/quiz')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-xl"
          >
            Start gratis
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </>
  );
};

export default AboutPage;