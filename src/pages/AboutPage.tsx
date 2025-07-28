import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Zap, Heart, Award, ShieldCheck, Sparkles, Clock, Target, CheckCircle, Play, User } from 'lucide-react';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F6]">
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        
        {/* Hero Section */}
        <ErrorBoundary>
          <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0] rounded-3xl mb-16 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="flex-1 text-center lg:text-left mb-12 lg:mb-0 lg:pr-10">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 leading-tight mb-6">
                  Train je eigen stijlcoach — ontdek outfits die écht bij je passen
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-8">
                  Swipe, leer en shop in 1 minuut — laat keuzestress achter je
                </p>
                
                <Button 
                  as={Link}
                  to="/onboarding" 
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight size={20} />}
                  iconPosition="right"
                  className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 rounded-2xl"
                >
                  Start de stijlquiz
                </Button>
              </div>
              
              <div className="flex-1 flex justify-center lg:justify-end relative">
                <div className="relative h-[500px] w-[350px] rounded-3xl overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#bfae9f]/20 z-10"></div>
                  
                  <ImageWithFallback 
                    src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2" 
                    alt="Vrouw die swipet op mobiele interface" 
                    className="h-full w-full object-cover"
                    fallbackSrc="/images/fallback-user.png"
                  />
                  
                  {/* Swipe indicator overlay */}
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">Swipe om te leren</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </section>
        </ErrorBoundary>

        {/* Waarom FitFi Section */}
        <ErrorBoundary>
          <section className="py-20 bg-white rounded-3xl shadow-sm mb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-8">
                Waarom FitFi?
              </h2>
              
              <div className="space-y-6 text-left max-w-2xl mx-auto">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-white text-sm">•</span>
                  </div>
                  <p className="text-lg text-gray-700">
                    Teveel webshops, teveel opties, te veel twijfel
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-white text-sm">•</span>
                  </div>
                  <p className="text-lg text-gray-700">
                    Uren scrollen later, nog geen perfecte match
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-white text-sm">•</span>
                  </div>
                  <p className="text-lg text-gray-700">
                    Jij verdient een snelle en persoonlijke stylingervaring
                  </p>
                </div>
              </div>
            </div>
          </div>
          </section>
        </ErrorBoundary>

        {/* Hoe het werkt Section */}
        <ErrorBoundary>
          <section className="py-20 bg-[#F5F3F0] rounded-3xl shadow-sm mb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
                Hoe het werkt
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="text-6xl mb-6">🧠</div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  Swipe & train
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Like of skip outfits. FitFi leert van jouw voorkeuren.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="text-6xl mb-6">🎯</div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  Jouw stijlcoach
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Hoe meer je swipet, hoe persoonlijker de suggesties.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="text-6xl mb-6">🛍️</div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  Shop & bewaar
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Ontvang outfits die je direct kunt kopen, finetunen of opslaan.
                </p>
              </div>
            </div>
          </div>
          </section>
        </ErrorBoundary>

        {/* Live Features vs Roadmap Section */}
        <ErrorBoundary>
          <section className="py-20 bg-white rounded-3xl shadow-sm mb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-8">
                Wat kun je nu al gebruiken?
              </h2>
              
              <div className="space-y-4 text-left max-w-3xl mx-auto">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <div>
                    <p className="text-lg text-gray-700">
                      <span className="font-semibold">Swipe-based quiz met direct stijladvies</span> <span className="text-green-600 dark:text-green-400 font-medium">(live)</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <div>
                    <p className="text-lg text-gray-700">
                      <span className="font-semibold">Persoonlijke outfit-aanbevelingen die groeien met jou</span> <span className="text-green-600 dark:text-green-400 font-medium">(live)</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <div>
                    <p className="text-lg text-gray-700">
                      <span className="font-semibold">Snel shoppen via partner-webshops</span> <span className="text-green-600 dark:text-green-400 font-medium">(live)</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <Clock className="text-white" size={16} />
                  </div>
                  <div>
                    <p className="text-lg text-gray-700">
                      <span className="font-semibold">Geavanceerde filteropties</span> <span className="text-blue-600 dark:text-blue-400 font-medium">(coming soon)</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <Clock className="text-white" size={16} />
                  </div>
                  <div>
                    <p className="text-lg text-gray-700">
                      <span className="font-semibold">Interactieve quiz-preview op de Over ons pagina</span> <span className="text-blue-600 dark:text-blue-400 font-medium">(coming soon)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </section>
        </ErrorBoundary>

        {/* Over de maker Section */}
        <ErrorBoundary>
          <section className="py-20 bg-gradient-to-r from-[#bfae9f]/10 to-blue-50 rounded-3xl shadow-sm mb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-8">
                Wie zit erachter?
              </h2>
              
              <div className="bg-white/90 p-8 rounded-3xl shadow-sm backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/3 mb-6 md:mb-0 md:mr-8">
                    <ImageWithFallback 
                      src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2" 
                      alt="Luc van Dokkum - Oprichter FitFi" 
                      className="w-48 h-48 rounded-full object-cover mx-auto shadow-xl"
                      fallbackSrc="/images/fallback-user.png"
                    />
                  </div>
                  <div className="md:w-2/3 text-center md:text-left">
                    <h3 className="text-2xl font-medium text-gray-900 mb-4">
                      Luc van Dokkum
                    </h3>
                    <p className="text-[#bfae9f] font-medium mb-4">
                      Oprichter & Ontwikkelaar
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      De technologie en stylinglogica zijn volledig ontwikkeld door Luc van Dokkum — van eerste concept tot live lancering. Geen groot bureau, maar één gepassioneerde oprichter.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </section>
        </ErrorBoundary>

        {/* Social Proof Section */}
        <ErrorBoundary>
          <section className="py-20 bg-white rounded-3xl shadow-sm mb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center">
              <div className="bg-gradient-to-r from-[#bfae9f]/10 to-blue-50 rounded-3xl p-8 md:p-12">
                <div className="text-6xl mb-6">💬</div>
                <blockquote className="text-xl md:text-2xl text-gray-700 italic leading-relaxed mb-6">
                  "FitFi voelt als shoppen met een persoonlijke stylist die nooit stopt met leren. Elke dag slimmer, elke dag beter gekleed."
                </blockquote>
                <div className="flex items-center justify-center">
                  <ImageWithFallback 
                    src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" 
                    alt="Sarah"
                    className="w-12 h-12 rounded-full object-cover mr-4 shadow-md"
                    fallbackSrc="/images/fallback-user.png"
                  />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Sarah</p>
                    <p className="text-gray-600">31 jaar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </section>
        </ErrorBoundary>

        {/* CTA Afsluiting Section */}
        <ErrorBoundary>
          <section className="py-20 bg-gradient-to-br from-[#bfae9f] to-purple-600 rounded-3xl shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
              Klaar om je stijl te upgraden?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Begin nu met de quiz en zie direct outfits die bij jou passen.
            </p>
            <Button 
              as={Link}
              to="/onboarding" 
              variant="secondary"
              size="lg"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              className="bg-white text-[#bfae9f] hover:bg-gray-50 text-lg px-8 py-4 font-medium shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 rounded-2xl"
            >
              Start de stijlquiz
            </Button>
            <p className="text-sm text-white/80 mt-4">
              Geen verplichtingen • Gratis te gebruiken
            </p>
          </div>
          </section>
        </ErrorBoundary>

        {/* Contact Section */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">
            Neem contact op
          </h2>
          <p className="text-gray-600 mb-6">
            Heb je vragen of feedback? We horen graag van je!
          </p>
          <Button
            as="a"
            href="mailto:info@fitfi.nl"
            variant="outline"
            icon={<ArrowRight size={20} />}
            iconPosition="right"
            className="rounded-2xl shadow-sm px-6 py-3 transition-transform hover:scale-105"
          >
            Email ons
          </Button>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>FitFi B.V. • Amsterdam, Nederland</p>
            <p>KVK: 12345678 • BTW: NL123456789B01</p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link to="/" className="text-[#bfae9f] hover:text-[#a89a8c] transition-colors font-medium">
            Terug naar home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;